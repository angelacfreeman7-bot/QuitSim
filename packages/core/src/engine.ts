import { SimParams, SimResult, MonthData, MonteCarloResult, UserProfile } from './types';

const MONTHS_TO_SIMULATE = 36;
const DEFAULT_MONTE_CARLO_RUNS = 500;

export function runSimulation(
  profile: UserProfile,
  params: SimParams,
  monteCarloRuns: number = DEFAULT_MONTE_CARLO_RUNS
): SimResult {
  const months = simulateMonths(profile, params);
  const runwayMonths = calculateRunway(months);
  const monteCarlo = runMonteCarlo(profile, params, monteCarloRuns);
  const quitConfidence = calculateConfidence(runwayMonths, monteCarlo, profile, params);
  const freedomDate = calculateFreedomDate(months, params);

  return { months, runwayMonths, quitConfidence, freedomDate, monteCarlo };
}

function simulateMonths(
  profile: UserProfile,
  params: SimParams
): MonthData[] {
  const months: MonthData[] = [];
  // Pool partner savings into starting savings
  let savings = profile.savings + (profile.partner?.savings ?? 0);
  let investments = profile.investments || 0;
  let remainingDebt = profile.debt || 0;
  const monthlyReturn = (params.investmentReturn / 100) / 12;
  // Monthly compounding inflation rate (e.g. 3% annual COL = ~0.247% per month)
  const monthlyInflation = Math.pow(1 + (params.colChange / 100), 1 / 12);
  const baseMonthlyExpenses = profile.monthlyExpenses
    + (profile.partner?.monthlyExpenses ?? 0)
    + params.additionalExpenses;
  const monthlySalary = profile.salary / 12;
  const postQuitIncome = params.newMonthlyIncome + (monthlySalary * (1 - params.incomeDropPct / 100));
  const partnerIncome = profile.partner ? profile.partner.salary / 12 : 0;
  const totalMonthlyIncome = postQuitIncome + partnerIncome;
  // savingsRate: portion of positive cashflow saved into investments
  const savingsRatePct = Math.max(0, Math.min(params.savingsRate, 100)) / 100;

  for (let m = 1; m <= MONTHS_TO_SIMULATE; m++) {
    const income = totalMonthlyIncome;

    // Compound inflation: expenses grow each month
    const inflatedExpenses = baseMonthlyExpenses * Math.pow(monthlyInflation, m);

    // Calculate monthly debt payment (2% of balance or $50 minimum)
    const debtPayment = remainingDebt > 0
      ? Math.min(remainingDebt, Math.max(remainingDebt * 0.02, 50))
      : 0;

    const expenses = inflatedExpenses + debtPayment;
    const netCashflow = income - expenses;

    // Reduce debt by payment amount
    remainingDebt = Math.max(0, remainingDebt - debtPayment);

    // Investment growth
    investments = investments * (1 + monthlyReturn);

    // If positive cashflow, route savingsRate% into investments
    if (netCashflow > 0 && savingsRatePct > 0) {
      const toInvest = netCashflow * savingsRatePct;
      investments += toInvest;
      savings += netCashflow - toInvest;
    } else {
      savings += netCashflow;
    }

    // If savings go negative, draw from investments
    if (savings < 0 && investments > 0) {
      const draw = Math.min(Math.abs(savings), investments);
      investments -= draw;
      savings += draw;
    }

    const now = new Date();
    now.setMonth(now.getMonth() + m);

    months.push({
      month: m,
      date: now.toISOString(),
      savings: Math.round(savings),
      income: Math.round(income),
      expenses: Math.round(expenses),
      netCashflow: Math.round(netCashflow),
      investmentValue: Math.round(investments),
      totalNetWorth: Math.round(savings + investments - remainingDebt),
      debtRemaining: Math.round(remainingDebt),
    });
  }

  return months;
}

function calculateRunway(months: MonthData[]): number {
  const brokeMonth = months.find(m => m.totalNetWorth <= 0);
  return brokeMonth ? brokeMonth.month - 1 : MONTHS_TO_SIMULATE;
}

function runMonteCarlo(
  profile: UserProfile,
  params: SimParams,
  numRuns: number = DEFAULT_MONTE_CARLO_RUNS
): MonteCarloResult {
  const runs: number[] = [];

  const monthlyInflation = Math.pow(1 + (params.colChange / 100), 1 / 12);
  const baseMonthlyExpenses = profile.monthlyExpenses
    + (profile.partner?.monthlyExpenses ?? 0)
    + params.additionalExpenses;
  const monthlySalary = profile.salary / 12;
  const postQuitIncome = params.newMonthlyIncome + (monthlySalary * (1 - params.incomeDropPct / 100));
  const partnerIncome = profile.partner ? profile.partner.salary / 12 : 0;
  const savingsRatePct = Math.max(0, Math.min(params.savingsRate, 100)) / 100;

  for (let r = 0; r < numRuns; r++) {
    let savings = profile.savings + (profile.partner?.savings ?? 0);
    let investments = profile.investments || 0;
    let remainingDebt = profile.debt || 0;
    let runway = MONTHS_TO_SIMULATE;

    for (let m = 1; m <= MONTHS_TO_SIMULATE; m++) {
      // Random market return: normal distribution around expected return
      const annualReturn = params.investmentReturn / 100 + gaussianRandom() * 0.15;
      const monthlyReturn = annualReturn / 12;

      // Compound inflation
      const inflatedExpenses = baseMonthlyExpenses * Math.pow(monthlyInflation, m);

      // Random expense shock (black swan): 3% monthly chance of a 50-150% expense spike
      let expenseShock = 0;
      if (params.blackSwan && Math.random() < 0.03) {
        expenseShock = inflatedExpenses * (0.5 + Math.random());
      }

      // Random income variation
      const incomeVariation = 1 + gaussianRandom() * 0.1;

      // Calculate monthly debt payment (2% of balance or $50 minimum)
      const debtPayment = remainingDebt > 0
        ? Math.min(remainingDebt, Math.max(remainingDebt * 0.02, 50))
        : 0;

      const income = (postQuitIncome + partnerIncome) * Math.max(0, incomeVariation);
      const expenses = inflatedExpenses + expenseShock + debtPayment;
      const netCashflow = income - expenses;

      // Reduce debt by payment amount
      remainingDebt = Math.max(0, remainingDebt - debtPayment);

      investments = investments * (1 + monthlyReturn);

      if (netCashflow > 0 && savingsRatePct > 0) {
        const toInvest = netCashflow * savingsRatePct;
        investments += toInvest;
        savings += netCashflow - toInvest;
      } else {
        savings += netCashflow;
      }

      if (savings < 0 && investments > 0) {
        const draw = Math.min(Math.abs(savings), investments);
        investments -= draw;
        savings += draw;
      }

      if (savings + investments - remainingDebt <= 0) {
        runway = m;
        break;
      }
    }

    runs.push(runway);
  }

  runs.sort((a, b) => a - b);

  const len = runs.length || 1;
  return {
    median: runs[Math.floor(len / 2)] ?? MONTHS_TO_SIMULATE,
    p10: runs[Math.floor(len * 0.1)] ?? 0,
    p90: runs[Math.floor(len * 0.9)] ?? MONTHS_TO_SIMULATE,
    successRate: Math.round((runs.filter(r => r >= 24).length / len) * 100),
    runs,
  };
}

function calculateConfidence(
  runwayMonths: number,
  monteCarlo: MonteCarloResult,
  profile: UserProfile,
  params: SimParams
): number {
  // Weighted formula
  const runwayScore = Math.min(runwayMonths / 24, 1) * 40;
  const monteCarloScore = (monteCarlo.successRate / 100) * 35;
  // Emergency fund: do they have enough months of expenses saved (net of debt)?
  const totalSavings = profile.savings + (profile.partner?.savings ?? 0);
  const totalDebt = profile.debt || 0;
  const netSavings = Math.max(0, totalSavings - totalDebt);
  const totalExpenses = profile.monthlyExpenses + (profile.partner?.monthlyExpenses ?? 0);
  const emergencyTarget = totalExpenses * params.emergencyMonths;
  const emergencyScore = emergencyTarget > 0
    ? Math.min(netSavings / emergencyTarget, 1) * 25
    : (netSavings > 0 ? 25 : 0);

  return Math.round(Math.min(runwayScore + monteCarloScore + emergencyScore, 100));
}

function calculateFreedomDate(
  months: MonthData[],
  params: SimParams
): string | null {
  // Freedom date = earliest month where post-quit income covers expenses
  // and savings are still positive. Skip if user kept their full salary
  // (incomeDropPct === 0) — they haven't actually quit yet.
  if (params.incomeDropPct === 0) return null;
  // Look for sustainability starting from month 3+ to avoid false positives
  // Income must cover expenses and net worth must be positive (accounts for debt)
  const sustainableMonth = months.find(
    m => m.month >= 3 && m.income >= m.expenses && m.totalNetWorth > 0
  );
  return sustainableMonth ? sustainableMonth.date : null;
}

function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export const PRESETS = [
  {
    id: 'job-loss',
    name: 'Job Loss',
    icon: 'briefcase-off',
    params: { incomeDropPct: 100, newMonthlyIncome: 0, additionalExpenses: 0, blackSwan: false },
  },
  {
    id: 'baby-travel',
    name: 'Baby + Travel',
    icon: 'baby',
    params: { incomeDropPct: 50, newMonthlyIncome: 0, additionalExpenses: 2000, blackSwan: false },
  },
  {
    id: 'full-fire',
    name: 'Early Retirement',
    icon: 'flame',
    params: { incomeDropPct: 100, newMonthlyIncome: 0, additionalExpenses: 0, savingsRate: 0, investmentReturn: 7, blackSwan: true },
  },
  {
    id: 'freelance-ramp',
    name: 'Freelance Ramp',
    icon: 'laptop',
    params: { incomeDropPct: 100, newMonthlyIncome: 3000, additionalExpenses: 500, blackSwan: false },
  },
] as const;

export const DEFAULT_PARAMS: SimParams = {
  incomeDropPct: 100,
  newMonthlyIncome: 0,
  additionalExpenses: 0,
  savingsRate: 20,
  investmentReturn: 7,
  colChange: 0,
  emergencyMonths: 6,
  blackSwan: true,
};
