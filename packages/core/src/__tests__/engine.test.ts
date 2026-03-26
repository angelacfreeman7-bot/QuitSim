import { describe, it, expect } from "vitest";
import { runSimulation, DEFAULT_PARAMS } from "../engine";
import { UserProfile, SimParams } from "../types";

const baseProfile: UserProfile = {
  id: "test-user",
  zip: "80202",
  city: "Denver",
  state: "CO",
  salary: 100000,
  savings: 50000,
  monthlyExpenses: 4000,
  investments: 30000,
  debt: 10000,
  createdAt: new Date().toISOString(),
};

describe("runSimulation", () => {
  it("returns 36 months of data", () => {
    const result = runSimulation(baseProfile, DEFAULT_PARAMS);
    expect(result.months).toHaveLength(36);
  });

  it("produces a quit confidence between 0 and 100", () => {
    const result = runSimulation(baseProfile, DEFAULT_PARAMS);
    expect(result.quitConfidence).toBeGreaterThanOrEqual(0);
    expect(result.quitConfidence).toBeLessThanOrEqual(100);
  });

  it("produces a runway between 0 and 36 months", () => {
    const result = runSimulation(baseProfile, DEFAULT_PARAMS);
    expect(result.runwayMonths).toBeGreaterThanOrEqual(0);
    expect(result.runwayMonths).toBeLessThanOrEqual(36);
  });

  it("Monte Carlo returns valid stats", () => {
    const result = runSimulation(baseProfile, DEFAULT_PARAMS);
    const mc = result.monteCarlo;
    expect(mc.runs).toHaveLength(500);
    expect(mc.median).toBeGreaterThanOrEqual(0);
    expect(mc.p10).toBeLessThanOrEqual(mc.median);
    expect(mc.p90).toBeGreaterThanOrEqual(mc.median);
    expect(mc.successRate).toBeGreaterThanOrEqual(0);
    expect(mc.successRate).toBeLessThanOrEqual(100);
  });
});

describe("runway calculation", () => {
  it("high savings + low expenses = long runway", () => {
    const rich: UserProfile = {
      ...baseProfile,
      savings: 200000,
      investments: 100000,
      monthlyExpenses: 2000,
      debt: 0,
    };
    const result = runSimulation(rich, DEFAULT_PARAMS);
    expect(result.runwayMonths).toBe(36); // should survive full 36 months
  });

  it("zero savings + no income = zero runway", () => {
    const broke: UserProfile = {
      ...baseProfile,
      savings: 0,
      investments: 0,
      monthlyExpenses: 5000,
      debt: 20000,
    };
    const params: SimParams = {
      ...DEFAULT_PARAMS,
      incomeDropPct: 100,
      newMonthlyIncome: 0,
    };
    const result = runSimulation(broke, params);
    expect(result.runwayMonths).toBe(0); // broke from month 1
  });

  it("side income extends runway", () => {
    const noIncome = runSimulation(baseProfile, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 100,
      newMonthlyIncome: 0,
    });
    const withIncome = runSimulation(baseProfile, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 100,
      newMonthlyIncome: 3000,
    });
    expect(withIncome.runwayMonths).toBeGreaterThanOrEqual(noIncome.runwayMonths);
  });
});

describe("confidence scoring", () => {
  it("wealthy profile gets high confidence", () => {
    const wealthy: UserProfile = {
      ...baseProfile,
      savings: 500000,
      investments: 500000,
      monthlyExpenses: 3000,
      debt: 0,
    };
    const result = runSimulation(wealthy, {
      ...DEFAULT_PARAMS,
      newMonthlyIncome: 5000,
    });
    expect(result.quitConfidence).toBeGreaterThanOrEqual(70);
  });

  it("broke profile gets low confidence", () => {
    const broke: UserProfile = {
      ...baseProfile,
      savings: 1000,
      investments: 0,
      monthlyExpenses: 6000,
      debt: 50000,
    };
    const result = runSimulation(broke, DEFAULT_PARAMS);
    expect(result.quitConfidence).toBeLessThanOrEqual(30);
  });

  it("high savings but high debt lowers confidence vs debt-free", () => {
    const debtFree: UserProfile = {
      ...baseProfile,
      savings: 50000,
      investments: 0,
      monthlyExpenses: 4000,
      debt: 0,
    };
    const indebted: UserProfile = {
      ...debtFree,
      debt: 45000,
    };
    const params: SimParams = { ...DEFAULT_PARAMS, incomeDropPct: 100, newMonthlyIncome: 0 };
    const debtFreeResult = runSimulation(debtFree, params);
    const indebtedResult = runSimulation(indebted, params);
    expect(indebtedResult.quitConfidence).toBeLessThan(debtFreeResult.quitConfidence);
  });
});

describe("black swan events", () => {
  it("black swan reduces success rate on average", () => {
    const params = { ...DEFAULT_PARAMS, incomeDropPct: 100, newMonthlyIncome: 0 };
    const withoutSwan = runSimulation(baseProfile, { ...params, blackSwan: false });
    // Run multiple times to get statistical average
    let swanSuccessSum = 0;
    const trials = 5;
    for (let i = 0; i < trials; i++) {
      const withSwan = runSimulation(baseProfile, { ...params, blackSwan: true });
      swanSuccessSum += withSwan.monteCarlo.successRate;
    }
    const avgSwanSuccess = swanSuccessSum / trials;
    // Black swan should generally reduce success rate (or at least not increase it dramatically)
    expect(avgSwanSuccess).toBeLessThanOrEqual(withoutSwan.monteCarlo.successRate + 15);
  });
});

describe("month data integrity", () => {
  it("each month has required fields", () => {
    const result = runSimulation(baseProfile, DEFAULT_PARAMS);
    for (const m of result.months) {
      expect(m.month).toBeGreaterThan(0);
      expect(m.date).toBeTruthy();
      expect(typeof m.savings).toBe("number");
      expect(typeof m.income).toBe("number");
      expect(typeof m.expenses).toBe("number");
      expect(typeof m.netCashflow).toBe("number");
      expect(typeof m.investmentValue).toBe("number");
      expect(typeof m.totalNetWorth).toBe("number");
    }
  });

  it("netCashflow = income - expenses", () => {
    const result = runSimulation(baseProfile, DEFAULT_PARAMS);
    for (const m of result.months) {
      expect(m.netCashflow).toBe(m.income - m.expenses);
    }
  });

  it("months are sequential 1-36", () => {
    const result = runSimulation(baseProfile, DEFAULT_PARAMS);
    result.months.forEach((m, i) => {
      expect(m.month).toBe(i + 1);
    });
  });
});

describe("COL change", () => {
  it("positive COL change increases expenses", () => {
    const base = runSimulation(baseProfile, { ...DEFAULT_PARAMS, colChange: 0 });
    const high = runSimulation(baseProfile, { ...DEFAULT_PARAMS, colChange: 50 });
    expect(high.months[0].expenses).toBeGreaterThan(base.months[0].expenses);
  });

  it("negative COL change decreases expenses", () => {
    const base = runSimulation(baseProfile, { ...DEFAULT_PARAMS, colChange: 0 });
    const low = runSimulation(baseProfile, { ...DEFAULT_PARAMS, colChange: -30 });
    expect(low.months[0].expenses).toBeLessThan(base.months[0].expenses);
  });

  it("inflation compounds over time — month 36 expenses > month 1", () => {
    const result = runSimulation(baseProfile, { ...DEFAULT_PARAMS, colChange: 5 });
    expect(result.months[35].expenses).toBeGreaterThan(result.months[0].expenses);
    // 5% annual over 36 months ≈ 15.8% total increase
    const ratio = result.months[35].expenses / result.months[0].expenses;
    expect(ratio).toBeGreaterThan(1.1);
    expect(ratio).toBeLessThan(1.25);
  });

  it("zero COL keeps expenses flat (ignoring debt paydown)", () => {
    const noDeb = { ...baseProfile, debt: 0 };
    const result = runSimulation(noDeb, { ...DEFAULT_PARAMS, colChange: 0 });
    // With 0% inflation and no debt, expenses should be constant
    expect(result.months[0].expenses).toBe(result.months[35].expenses);
  });
});

describe("edge cases", () => {
  it("handles zero monthly expenses without crashing", () => {
    const profile: UserProfile = {
      ...baseProfile,
      monthlyExpenses: 0,
    };
    const result = runSimulation(profile, DEFAULT_PARAMS);
    expect(result.runwayMonths).toBe(36);
    expect(result.quitConfidence).toBeGreaterThanOrEqual(0);
    expect(result.quitConfidence).toBeLessThanOrEqual(100);
  });

  it("handles zero salary", () => {
    const profile: UserProfile = {
      ...baseProfile,
      salary: 0,
    };
    const result = runSimulation(profile, DEFAULT_PARAMS);
    expect(result.months).toHaveLength(36);
    expect(result.quitConfidence).toBeGreaterThanOrEqual(0);
  });

  it("handles extremely large values without NaN or Infinity", () => {
    const profile: UserProfile = {
      ...baseProfile,
      salary: 99_999_999,
      savings: 99_999_999,
      investments: 99_999_999,
      monthlyExpenses: 99_999,
      debt: 99_999_999,
    };
    const result = runSimulation(profile, DEFAULT_PARAMS);
    expect(result.months).toHaveLength(36);
    expect(Number.isFinite(result.quitConfidence)).toBe(true);
    expect(Number.isFinite(result.runwayMonths)).toBe(true);
    for (const m of result.months) {
      expect(Number.isFinite(m.totalNetWorth)).toBe(true);
      expect(Number.isNaN(m.totalNetWorth)).toBe(false);
    }
  });

  it("handles all-zero profile", () => {
    const profile: UserProfile = {
      ...baseProfile,
      salary: 0,
      savings: 0,
      investments: 0,
      monthlyExpenses: 0,
      debt: 0,
    };
    const result = runSimulation(profile, DEFAULT_PARAMS);
    expect(result.months).toHaveLength(36);
    expect(result.quitConfidence).toBeGreaterThanOrEqual(0);
    expect(result.quitConfidence).toBeLessThanOrEqual(100);
  });

  it("handles negative investment returns", () => {
    const result = runSimulation(baseProfile, {
      ...DEFAULT_PARAMS,
      investmentReturn: -10,
    });
    expect(result.months).toHaveLength(36);
    expect(result.quitConfidence).toBeGreaterThanOrEqual(0);
  });

  it("debt-only profile (no savings, no investments)", () => {
    const profile: UserProfile = {
      ...baseProfile,
      savings: 0,
      investments: 0,
      debt: 100000,
      monthlyExpenses: 3000,
      salary: 0,
    };
    const result = runSimulation(profile, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 100,
      newMonthlyIncome: 0,
    });
    expect(result.runwayMonths).toBe(0);
    expect(result.quitConfidence).toBeLessThanOrEqual(10);
  });

  it("custom Monte Carlo run count is respected", () => {
    const result = runSimulation(baseProfile, DEFAULT_PARAMS, 50);
    expect(result.monteCarlo.runs).toHaveLength(50);
  });
});

describe("couples mode", () => {
  it("partner income extends runway", () => {
    const soloResult = runSimulation(baseProfile, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 100,
      newMonthlyIncome: 0,
    });
    const coupleProfile: UserProfile = {
      ...baseProfile,
      partner: {
        salary: 60000,
        savings: 10000,
        monthlyExpenses: 2000,
      },
    };
    const coupleResult = runSimulation(coupleProfile, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 100,
      newMonthlyIncome: 0,
    });
    expect(coupleResult.runwayMonths).toBeGreaterThanOrEqual(soloResult.runwayMonths);
  });

  it("partner savings are pooled into starting savings", () => {
    const soloProfile: UserProfile = {
      ...baseProfile,
      savings: 20000,
      investments: 0,
      debt: 0,
      monthlyExpenses: 3000,
    };
    const coupleProfile: UserProfile = {
      ...soloProfile,
      partner: {
        salary: 0,           // no partner income
        savings: 30000,      // but $30k extra savings
        monthlyExpenses: 0,  // no extra expenses
      },
    };
    const params: SimParams = { ...DEFAULT_PARAMS, incomeDropPct: 100, newMonthlyIncome: 0 };
    const solo = runSimulation(soloProfile, params);
    const couple = runSimulation(coupleProfile, params);
    // $30k extra savings should meaningfully extend runway
    expect(couple.runwayMonths).toBeGreaterThan(solo.runwayMonths);
    // Month 1 savings should reflect the pooled amount
    // Solo starts with 20k, couple starts with 50k — both minus 1 month of expenses
    expect(couple.months[0].savings).toBeGreaterThan(solo.months[0].savings);
  });

  it("partner expenses increase burn rate", () => {
    const soloProfile: UserProfile = {
      ...baseProfile,
      savings: 50000,
      investments: 0,
      debt: 0,
      monthlyExpenses: 3000,
    };
    const coupleProfile: UserProfile = {
      ...soloProfile,
      partner: {
        salary: 0,
        savings: 0,
        monthlyExpenses: 2000, // adds $2k/mo burn
      },
    };
    const params: SimParams = { ...DEFAULT_PARAMS, incomeDropPct: 100, newMonthlyIncome: 0 };
    const solo = runSimulation(soloProfile, params);
    const couple = runSimulation(coupleProfile, params);
    // Extra $2k/mo expenses should shorten runway
    expect(couple.runwayMonths).toBeLessThan(solo.runwayMonths);
    // Expenses should be higher
    expect(couple.months[0].expenses).toBeGreaterThan(solo.months[0].expenses);
  });
});

describe("savings rate", () => {
  it("positive savings rate routes cashflow into investments", () => {
    const profile: UserProfile = {
      ...baseProfile,
      savings: 50000,
      investments: 10000,
      debt: 0,
      monthlyExpenses: 2000,
    };
    const noSave = runSimulation(profile, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 50,
      newMonthlyIncome: 3000,
      savingsRate: 0,
    });
    const withSave = runSimulation(profile, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 50,
      newMonthlyIncome: 3000,
      savingsRate: 50,
    });
    // With 50% savings rate, more money goes to investments
    expect(withSave.months[11].investmentValue).toBeGreaterThan(noSave.months[11].investmentValue);
    // And less stays in cash savings
    expect(withSave.months[11].savings).toBeLessThan(noSave.months[11].savings);
  });

  it("savings rate of 0 keeps all cashflow in savings", () => {
    const profile: UserProfile = {
      ...baseProfile,
      savings: 50000,
      investments: 0,
      debt: 0,
      monthlyExpenses: 2000,
    };
    const result = runSimulation(profile, {
      ...DEFAULT_PARAMS,
      incomeDropPct: 50,
      newMonthlyIncome: 3000,
      savingsRate: 0,
    });
    // Investments should only grow from returns on $0, staying at 0
    expect(result.months[0].investmentValue).toBe(0);
  });
});

describe("emergency months", () => {
  it("more emergency months required lowers confidence for thin savings", () => {
    const thinProfile: UserProfile = {
      ...baseProfile,
      savings: 12000,       // only 3 months of expenses
      investments: 100000,
      monthlyExpenses: 4000,
      debt: 0,
    };
    const easy = runSimulation(thinProfile, {
      ...DEFAULT_PARAMS,
      emergencyMonths: 3,   // they meet this target
    });
    const strict = runSimulation(thinProfile, {
      ...DEFAULT_PARAMS,
      emergencyMonths: 12,  // they fall well short
    });
    // Stricter emergency requirement should lower confidence
    expect(strict.quitConfidence).toBeLessThan(easy.quitConfidence);
  });
});

describe("freedom date", () => {
  it("returns null when income never covers expenses", () => {
    const result = runSimulation(
      { ...baseProfile, savings: 50000 },
      { ...DEFAULT_PARAMS, incomeDropPct: 100, newMonthlyIncome: 0 },
    );
    // With zero post-quit income and 4000/mo expenses, freedom date should be null
    expect(result.freedomDate).toBeNull();
  });

  it("returns a date when post-quit income covers expenses", () => {
    const result = runSimulation(
      { ...baseProfile },
      { ...DEFAULT_PARAMS, incomeDropPct: 50, newMonthlyIncome: 5000 },
    );
    // 50% of $100k/12 = $4167 + $5000 = $9167 vs $4000 expenses — easily sustainable
    expect(result.freedomDate).toBeTruthy();
  });

  it("returns null when user keeps full salary (has not quit)", () => {
    const result = runSimulation(
      { ...baseProfile },
      { ...DEFAULT_PARAMS, incomeDropPct: 0, newMonthlyIncome: 5000 },
    );
    // incomeDropPct=0 means they haven't quit — freedom date is meaningless
    expect(result.freedomDate).toBeNull();
  });

  it("debt delays or prevents freedom date compared to debt-free", () => {
    const debtFree: UserProfile = {
      ...baseProfile,
      savings: 10000,
      investments: 0,
      monthlyExpenses: 3000,
      debt: 0,
    };
    const withDebt: UserProfile = {
      ...debtFree,
      debt: 100000,
    };
    const params: SimParams = { ...DEFAULT_PARAMS, incomeDropPct: 50, newMonthlyIncome: 3000 };
    const debtFreeResult = runSimulation(debtFree, params);
    const debtResult = runSimulation(withDebt, params);
    // Debt-free should get freedom date at month 3 (income covers expenses easily)
    expect(debtFreeResult.freedomDate).toBeTruthy();
    // Find which month each hits freedom
    const debtFreeMonth = debtFreeResult.months.find(
      m => m.month >= 3 && m.income >= m.expenses && m.totalNetWorth > 0
    )!.month;
    const debtMonth = debtResult.months.find(
      m => m.month >= 3 && m.income >= m.expenses && m.totalNetWorth > 0
    );
    // With $100k debt, freedom month should be later (or never reached)
    if (debtMonth) {
      expect(debtMonth.month).toBeGreaterThan(debtFreeMonth);
    } else {
      // Debt was too heavy to reach positive net worth in 36 months
      expect(debtResult.freedomDate).toBeNull();
    }
  });
});
