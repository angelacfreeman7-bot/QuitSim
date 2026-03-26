export interface UserProfile {
  id: string;
  zip: string;
  city: string;
  state: string;
  salary: number;
  savings: number;
  monthlyExpenses: number;
  investments: number;
  debt: number;
  partner?: PartnerProfile;
  createdAt: string;
}

export interface PartnerProfile {
  salary: number;
  savings: number;
  monthlyExpenses: number;
}

export interface SimParams {
  incomeDropPct: number;       // 0-100
  newMonthlyIncome: number;    // freelance/side hustle
  additionalExpenses: number;  // baby, travel, etc.
  savingsRate: number;         // monthly savings pct
  investmentReturn: number;    // annual %
  colChange: number;           // cost of living change %
  emergencyMonths: number;     // months of emergency fund
  blackSwan: boolean;          // enable random shocks
}

export interface SimResult {
  months: MonthData[];
  runwayMonths: number;
  quitConfidence: number;      // 0-100
  freedomDate: string | null;  // ISO date string
  monteCarlo: MonteCarloResult;
}

export interface MonthData {
  month: number;
  date: string;
  savings: number;
  income: number;
  expenses: number;
  netCashflow: number;
  investmentValue: number;
  totalNetWorth: number;
  debtRemaining?: number;
}

export interface MonteCarloResult {
  median: number;
  p10: number;
  p90: number;
  successRate: number;       // % of runs that last 24+ months
  runs: number[];            // array of runway months per run
}

export interface Preset {
  id: string;
  name: string;
  icon: string;
  params: Partial<SimParams>;
}

export interface SavedPlan {
  id: string;
  name: string;
  params: SimParams;
  result: SimResult;
  locked: boolean;
  createdAt: string;
  userId: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'save' | 'earn' | 'learn' | 'mindset';
  xp: number;
}

export interface Streak {
  current: number;
  longest: number;
  lastCompleted: string;
  completedChallenges: string[];
}

export interface AINarrative {
  summary: string;
  warnings: string[];
  suggestions: string[];
  monthOfRisk: number | null;
}
