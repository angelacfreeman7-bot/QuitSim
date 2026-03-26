/**
 * PROOF TEST SUITE — Proves QuitSim does what it claims.
 *
 * This suite tests the app's promises to users:
 * 1. "Find out when you could quit your job"
 * 2. "We stress-test your plan 500 times"
 * 3. "Your score looks at runway, stress test, and emergency fund"
 * 4. "Couples mode pools finances"
 * 5. "Daily challenges rotate"
 * 6. All calculations produce sane, finite results
 */

import { describe, it, expect } from "vitest";
import { runSimulation, DEFAULT_PARAMS, PRESETS } from "../engine";
import { CHALLENGES, getTodayChallenge, getUpcomingChallenges } from "../challenges";
import { UserProfile, SimParams } from "../types";

// ────────────────────────────────────────────
// REALISTIC USER PROFILES
// ────────────────────────────────────────────

const TEACHER: UserProfile = {
  id: "teacher", zip: "60614", city: "Chicago", state: "IL",
  salary: 55000, savings: 18000, monthlyExpenses: 3200,
  investments: 8000, debt: 22000, createdAt: new Date().toISOString(),
};

const ENGINEER: UserProfile = {
  id: "engineer", zip: "94102", city: "San Francisco", state: "CA",
  salary: 180000, savings: 95000, monthlyExpenses: 5500,
  investments: 120000, debt: 0, createdAt: new Date().toISOString(),
};

const NEW_GRAD: UserProfile = {
  id: "new-grad", zip: "10001", city: "New York", state: "NY",
  salary: 65000, savings: 3000, monthlyExpenses: 4000,
  investments: 0, debt: 45000, createdAt: new Date().toISOString(),
};

const COUPLE: UserProfile = {
  id: "couple", zip: "78701", city: "Austin", state: "TX",
  salary: 110000, savings: 60000, monthlyExpenses: 4500,
  investments: 50000, debt: 15000, createdAt: new Date().toISOString(),
  partner: { salary: 75000, savings: 25000, monthlyExpenses: 1500 },
};

const FIRE_SAVER: UserProfile = {
  id: "fire", zip: "80202", city: "Denver", state: "CO",
  salary: 130000, savings: 250000, monthlyExpenses: 3000,
  investments: 400000, debt: 0, createdAt: new Date().toISOString(),
};

// ────────────────────────────────────────────
// 1. PROMISE: "Find out when you could quit"
//    → Produces a freedom date or explains why not
// ────────────────────────────────────────────

describe("Promise: Freedom Date", () => {
  it("FIRE saver with side income gets a freedom date", () => {
    const result = runSimulation(FIRE_SAVER, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 100,
      newMonthlyIncome: 4000, // freelance
    });
    expect(result.freedomDate).toBeTruthy();
    expect(new Date(result.freedomDate!).getFullYear()).toBeGreaterThanOrEqual(new Date().getFullYear());
  });

  it("new grad with no income and heavy debt gets no freedom date", () => {
    const result = runSimulation(NEW_GRAD, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 100,
      newMonthlyIncome: 0,
    });
    expect(result.freedomDate).toBeNull();
  });

  it("freedom date is a valid ISO date string", () => {
    const result = runSimulation(ENGINEER, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 50,
      newMonthlyIncome: 5000,
    });
    if (result.freedomDate) {
      const d = new Date(result.freedomDate);
      expect(d.toString()).not.toBe("Invalid Date");
    }
  });

  it("keeping full salary returns no freedom date (haven't quit)", () => {
    const result = runSimulation(ENGINEER, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 0,
    });
    expect(result.freedomDate).toBeNull();
  });
});

// ────────────────────────────────────────────
// 2. PROMISE: "Stress-tested 500 times"
//    → Monte Carlo runs are real and meaningful
// ────────────────────────────────────────────

describe("Promise: Monte Carlo Stress Test", () => {
  it("default runs 500 simulations", () => {
    const result = runSimulation(TEACHER, DEFAULT_PARAMS);
    expect(result.monteCarlo.runs).toHaveLength(500);
  });

  it("p10 <= median <= p90 (percentiles are ordered)", () => {
    const result = runSimulation(ENGINEER, DEFAULT_PARAMS);
    expect(result.monteCarlo.p10).toBeLessThanOrEqual(result.monteCarlo.median);
    expect(result.monteCarlo.median).toBeLessThanOrEqual(result.monteCarlo.p90);
  });

  it("success rate is percentage of runs lasting 24+ months", () => {
    const result = runSimulation(ENGINEER, DEFAULT_PARAMS);
    const manualRate = Math.round(
      (result.monteCarlo.runs.filter(r => r >= 24).length / result.monteCarlo.runs.length) * 100
    );
    expect(result.monteCarlo.successRate).toBe(manualRate);
  });

  it("black swan events make outcomes worse on average", () => {
    const params = { ...DEFAULT_PARAMS, incomeDropPct: 100, newMonthlyIncome: 0 };
    // Average over multiple trials to reduce randomness
    let withoutSwanMedian = 0;
    let withSwanMedian = 0;
    const trials = 5;
    for (let i = 0; i < trials; i++) {
      withoutSwanMedian += runSimulation(TEACHER, { ...params, blackSwan: false }).monteCarlo.median;
      withSwanMedian += runSimulation(TEACHER, { ...params, blackSwan: true }).monteCarlo.median;
    }
    // Black swan should generally reduce median runway (allow some noise)
    expect(withSwanMedian / trials).toBeLessThanOrEqual(withoutSwanMedian / trials + 3);
  });

  it("all 500 run values are between 0 and 36", () => {
    const result = runSimulation(TEACHER, DEFAULT_PARAMS);
    for (const run of result.monteCarlo.runs) {
      expect(run).toBeGreaterThanOrEqual(0);
      expect(run).toBeLessThanOrEqual(36);
    }
  });
});

// ────────────────────────────────────────────
// 3. PROMISE: "Score = runway + stress test + emergency fund"
//    → Confidence scoring is weighted correctly
// ────────────────────────────────────────────

describe("Promise: Confidence Score", () => {
  it("always between 0 and 100", () => {
    const profiles = [TEACHER, ENGINEER, NEW_GRAD, COUPLE, FIRE_SAVER];
    for (const profile of profiles) {
      const result = runSimulation(profile, DEFAULT_PARAMS);
      expect(result.quitConfidence).toBeGreaterThanOrEqual(0);
      expect(result.quitConfidence).toBeLessThanOrEqual(100);
    }
  });

  it("more savings = higher confidence (all else equal)", () => {
    const poor = { ...TEACHER, savings: 5000 };
    const rich = { ...TEACHER, savings: 100000 };
    const rPoor = runSimulation(poor, { ...DEFAULT_PARAMS, blackSwan: false });
    const rRich = runSimulation(rich, { ...DEFAULT_PARAMS, blackSwan: false });
    expect(rRich.quitConfidence).toBeGreaterThan(rPoor.quitConfidence);
  });

  it("more debt = lower confidence (all else equal)", () => {
    const noDebt = { ...TEACHER, debt: 0 };
    const bigDebt = { ...TEACHER, debt: 80000 };
    const rNoDebt = runSimulation(noDebt, { ...DEFAULT_PARAMS, blackSwan: false });
    const rBigDebt = runSimulation(bigDebt, { ...DEFAULT_PARAMS, blackSwan: false });
    expect(rBigDebt.quitConfidence).toBeLessThan(rNoDebt.quitConfidence);
  });

  it("FIRE saver gets high confidence", () => {
    const result = runSimulation(FIRE_SAVER, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 100,
      newMonthlyIncome: 3000,
      blackSwan: false,
    });
    expect(result.quitConfidence).toBeGreaterThanOrEqual(60);
  });

  it("new grad quitting cold turkey gets low confidence", () => {
    const result = runSimulation(NEW_GRAD, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 100,
      newMonthlyIncome: 0,
    });
    expect(result.quitConfidence).toBeLessThanOrEqual(20);
  });
});

// ────────────────────────────────────────────
// 4. PROMISE: "Your salary is annual, calculations are monthly"
//    → The salary/12 fix works correctly
// ────────────────────────────────────────────

describe("Promise: Salary Treated as Annual", () => {
  it("monthly income = annual salary / 12", () => {
    const result = runSimulation(
      { ...ENGINEER, salary: 120000 },
      { ...DEFAULT_PARAMS, incomeDropPct: 0 }
    );
    // With 0% income drop, monthly income should be $120k/12 = $10,000
    expect(result.months[0].income).toBe(10000);
  });

  it("50% income drop on $120k salary = $5,000/month", () => {
    const result = runSimulation(
      { ...ENGINEER, salary: 120000 },
      { ...DEFAULT_PARAMS, incomeDropPct: 50, newMonthlyIncome: 0 }
    );
    expect(result.months[0].income).toBe(5000);
  });

  it("100% income drop with $2k side hustle = $2,000/month", () => {
    const result = runSimulation(
      { ...ENGINEER, salary: 120000 },
      { ...DEFAULT_PARAMS, incomeDropPct: 100, newMonthlyIncome: 2000 }
    );
    expect(result.months[0].income).toBe(2000);
  });

  it("partner salary is also divided by 12", () => {
    const profile: UserProfile = {
      ...ENGINEER,
      salary: 120000,
      partner: { salary: 60000, savings: 0, monthlyExpenses: 0 },
    };
    const result = runSimulation(profile, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 100,
      newMonthlyIncome: 0,
    });
    // User: $0/mo (100% drop), partner: $60k/12 = $5,000/mo
    expect(result.months[0].income).toBe(5000);
  });
});

// ────────────────────────────────────────────
// 5. PROMISE: "Couples mode pools your finances"
// ────────────────────────────────────────────

describe("Promise: Couples Mode", () => {
  it("partner savings are pooled at start", () => {
    const solo = runSimulation(
      { ...TEACHER, savings: 20000 },
      { ...DEFAULT_PARAMS, incomeDropPct: 100, newMonthlyIncome: 0 }
    );
    const withPartner = runSimulation(
      { ...TEACHER, savings: 20000, partner: { salary: 0, savings: 30000, monthlyExpenses: 0 } },
      { ...DEFAULT_PARAMS, incomeDropPct: 100, newMonthlyIncome: 0 }
    );
    // Partner adds $30k savings → more runway
    expect(withPartner.runwayMonths).toBeGreaterThan(solo.runwayMonths);
  });

  it("partner income extends runway", () => {
    const solo = runSimulation(TEACHER, { ...DEFAULT_PARAMS, incomeDropPct: 100, newMonthlyIncome: 0 });
    const withPartner = runSimulation(COUPLE, { ...DEFAULT_PARAMS, incomeDropPct: 100, newMonthlyIncome: 0 });
    expect(withPartner.runwayMonths).toBeGreaterThanOrEqual(solo.runwayMonths);
  });

  it("partner expenses increase burn rate", () => {
    const noPartnerExpenses = runSimulation(
      { ...TEACHER, partner: { salary: 0, savings: 0, monthlyExpenses: 0 } },
      { ...DEFAULT_PARAMS, incomeDropPct: 100, newMonthlyIncome: 0 }
    );
    const withPartnerExpenses = runSimulation(
      { ...TEACHER, partner: { salary: 0, savings: 0, monthlyExpenses: 2000 } },
      { ...DEFAULT_PARAMS, incomeDropPct: 100, newMonthlyIncome: 0 }
    );
    expect(withPartnerExpenses.runwayMonths).toBeLessThan(noPartnerExpenses.runwayMonths);
  });
});

// ────────────────────────────────────────────
// 6. PROMISE: "4 presets for common scenarios"
// ────────────────────────────────────────────

describe("Promise: Presets Work", () => {
  it("all 4 presets produce valid results", () => {
    for (const preset of PRESETS) {
      const params = { ...DEFAULT_PARAMS, ...preset.params };
      const result = runSimulation(ENGINEER, params);
      expect(result.months).toHaveLength(36);
      expect(result.quitConfidence).toBeGreaterThanOrEqual(0);
      expect(result.quitConfidence).toBeLessThanOrEqual(100);
      expect(result.runwayMonths).toBeGreaterThanOrEqual(0);
      expect(result.runwayMonths).toBeLessThanOrEqual(36);
    }
  });

  it("job-loss preset drops income to 0", () => {
    const params = { ...DEFAULT_PARAMS, ...PRESETS[0].params };
    const result = runSimulation(TEACHER, params);
    // 100% income drop, $0 side income → only income is 0
    expect(result.months[0].income).toBe(0);
  });

  it("freelance-ramp preset provides $3k/mo income", () => {
    const params = { ...DEFAULT_PARAMS, ...PRESETS[3].params };
    const result = runSimulation(TEACHER, params);
    // 100% salary drop + $3000 monthly freelance
    expect(result.months[0].income).toBe(3000);
  });
});

// ────────────────────────────────────────────
// 7. PROMISE: "Daily challenges rotate"
// ────────────────────────────────────────────

describe("Promise: Daily Challenges", () => {
  it("10 challenges exist with all required fields", () => {
    expect(CHALLENGES).toHaveLength(10);
    for (const c of CHALLENGES) {
      expect(c.id).toBeTruthy();
      expect(c.title).toBeTruthy();
      expect(c.description).toBeTruthy();
      expect(["save", "earn", "learn", "mindset"]).toContain(c.category);
      expect(c.xp).toBeGreaterThan(0);
    }
  });

  it("getTodayChallenge returns a valid challenge", () => {
    const today = getTodayChallenge();
    expect(CHALLENGES.map(c => c.id)).toContain(today.id);
  });

  it("getUpcomingChallenges returns correct count", () => {
    const upcoming = getUpcomingChallenges(5);
    expect(upcoming).toHaveLength(5);
    for (const c of upcoming) {
      expect(CHALLENGES.map(ch => ch.id)).toContain(c.id);
    }
  });

  it("all 4 challenge categories are represented", () => {
    const categories = new Set(CHALLENGES.map(c => c.category));
    expect(categories).toEqual(new Set(["save", "earn", "learn", "mindset"]));
  });
});

// ────────────────────────────────────────────
// 8. PROMISE: "36 months of month-by-month data"
// ────────────────────────────────────────────

describe("Promise: Monthly Breakdown", () => {
  it("every simulation returns exactly 36 months", () => {
    const profiles = [TEACHER, ENGINEER, NEW_GRAD, COUPLE, FIRE_SAVER];
    for (const profile of profiles) {
      const result = runSimulation(profile, DEFAULT_PARAMS);
      expect(result.months).toHaveLength(36);
    }
  });

  it("months are sequential 1 through 36", () => {
    const result = runSimulation(ENGINEER, DEFAULT_PARAMS);
    result.months.forEach((m, i) => expect(m.month).toBe(i + 1));
  });

  it("netCashflow = income - expenses (exact)", () => {
    const result = runSimulation(TEACHER, DEFAULT_PARAMS);
    for (const m of result.months) {
      expect(m.netCashflow).toBe(m.income - m.expenses);
    }
  });

  it("every value is a finite number (no NaN, no Infinity)", () => {
    const profiles = [TEACHER, ENGINEER, NEW_GRAD, COUPLE, FIRE_SAVER];
    for (const profile of profiles) {
      const result = runSimulation(profile, DEFAULT_PARAMS);
      expect(Number.isFinite(result.quitConfidence)).toBe(true);
      expect(Number.isFinite(result.runwayMonths)).toBe(true);
      for (const m of result.months) {
        expect(Number.isFinite(m.savings)).toBe(true);
        expect(Number.isFinite(m.income)).toBe(true);
        expect(Number.isFinite(m.expenses)).toBe(true);
        expect(Number.isFinite(m.totalNetWorth)).toBe(true);
        expect(Number.isFinite(m.investmentValue)).toBe(true);
      }
    }
  });

  it("inflation compounds over 36 months", () => {
    const result = runSimulation(
      { ...ENGINEER, debt: 0 },
      { ...DEFAULT_PARAMS, colChange: 5 }
    );
    // 5% annual inflation over 3 years → month 36 expenses > month 1
    expect(result.months[35].expenses).toBeGreaterThan(result.months[0].expenses);
  });

  it("investments grow with positive returns", () => {
    const result = runSimulation(
      { ...FIRE_SAVER },
      { ...DEFAULT_PARAMS, incomeDropPct: 0, investmentReturn: 10, blackSwan: false }
    );
    // With positive cashflow and 10% returns, investments should grow
    expect(result.months[35].investmentValue).toBeGreaterThan(FIRE_SAVER.investments);
  });
});

// ────────────────────────────────────────────
// 9. REAL-WORLD SCENARIOS
//    → Numbers a user would actually enter
// ────────────────────────────────────────────

describe("Real-World Scenarios", () => {
  it("teacher quitting to freelance part-time", () => {
    const result = runSimulation(TEACHER, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 100,
      newMonthlyIncome: 2500,
      additionalExpenses: 500, // health insurance
      blackSwan: true,
    });
    // Teacher has $18k savings, $22k debt, $3200/mo expenses + $500 extra
    // Income: $2500/mo, expenses: ~$3700 + debt payment
    // Should have limited runway
    expect(result.runwayMonths).toBeGreaterThanOrEqual(0);
    expect(result.runwayMonths).toBeLessThanOrEqual(36);
    expect(result.quitConfidence).toBeLessThan(70); // not great
  });

  it("engineer with big savings taking 6-month sabbatical", () => {
    const result = runSimulation(ENGINEER, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 100,
      newMonthlyIncome: 0,
      blackSwan: false,
    });
    // $95k savings + $120k investments, $5500/mo expenses, no debt
    // Should last 36+ months easily
    expect(result.runwayMonths).toBe(36);
    expect(result.quitConfidence).toBeGreaterThanOrEqual(50);
  });

  it("new grad should not be told to quit", () => {
    const result = runSimulation(NEW_GRAD, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 100,
      newMonthlyIncome: 0,
    });
    // $3k savings, $45k debt, $4k/mo expenses — this is bad
    expect(result.runwayMonths).toBe(0);
    expect(result.quitConfidence).toBeLessThanOrEqual(15);
    expect(result.freedomDate).toBeNull();
  });

  it("couple where one partner quits", () => {
    const result = runSimulation(COUPLE, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 100, // user quits entirely
      newMonthlyIncome: 0,
      blackSwan: true,
    });
    // User quits, partner earns $75k/yr = $6250/mo
    // Combined expenses: $4500 + $1500 = $6000
    // Partner income barely covers expenses, plus $85k pooled savings
    expect(result.runwayMonths).toBeGreaterThanOrEqual(12);
    expect(result.quitConfidence).toBeGreaterThanOrEqual(20);
  });

  it("FIRE saver is ready to quit", () => {
    const result = runSimulation(FIRE_SAVER, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 100,
      newMonthlyIncome: 2000, // small side income
      investmentReturn: 7,
      blackSwan: true,
    });
    // $250k savings + $400k investments, $3k/mo expenses, $2k side income
    // Should be very solid
    expect(result.runwayMonths).toBe(36);
    expect(result.quitConfidence).toBeGreaterThanOrEqual(60);
  });
});

// ────────────────────────────────────────────
// 10. DEBT HANDLING
// ────────────────────────────────────────────

describe("Debt Handling", () => {
  it("debt reduces total net worth", () => {
    const noDebt = runSimulation({ ...TEACHER, debt: 0 }, DEFAULT_PARAMS);
    const withDebt = runSimulation({ ...TEACHER, debt: 50000 }, DEFAULT_PARAMS);
    expect(withDebt.months[0].totalNetWorth).toBeLessThan(noDebt.months[0].totalNetWorth);
  });

  it("debt gets paid down over time", () => {
    const result = runSimulation(
      { ...TEACHER, debt: 10000 },
      { ...DEFAULT_PARAMS, incomeDropPct: 0 }
    );
    const firstDebt = result.months[0].debtRemaining ?? 0;
    const lastDebt = result.months[35].debtRemaining ?? 0;
    expect(lastDebt).toBeLessThan(firstDebt);
  });

  it("debt lowers confidence score vs debt-free", () => {
    const noDebt = runSimulation({ ...ENGINEER, debt: 0 }, { ...DEFAULT_PARAMS, blackSwan: false });
    const bigDebt = runSimulation({ ...ENGINEER, debt: 100000 }, { ...DEFAULT_PARAMS, blackSwan: false });
    expect(bigDebt.quitConfidence).toBeLessThan(noDebt.quitConfidence);
  });
});
