import { UserProfile, SimParams, SimResult } from '../types';
import { runSimulation } from './engine';

export interface QuickWin {
  id: string;
  emoji: string;
  title: string;
  detail: string;
  impact: number;          // confidence point improvement
  runwayDelta: number;     // months gained
  freedomDateBefore: string | null;
  freedomDateAfter: string | null;
  freedomShiftMonths: number | null; // negative = earlier (good)
  newConfidence: number;
  // Allow navigating to simulator with these params
  profileOverrides?: Partial<UserProfile>;
  paramOverrides?: Partial<SimParams>;
}

interface Scenario {
  id: string;
  emoji: string;
  title: string;
  modifyProfile?: (p: UserProfile) => Partial<UserProfile>;
  modifyParams?: (p: SimParams) => Partial<SimParams>;
  condition?: (profile: UserProfile, params: SimParams) => boolean;
}

const QUICK_WIN_MC_RUNS = 100;

const SCENARIOS: Scenario[] = [
  {
    id: 'cut-300',
    emoji: '✂️',
    title: 'Cut $300/mo in expenses',
    modifyProfile: (p) => ({ monthlyExpenses: p.monthlyExpenses - 300 }),
    condition: (p) => p.monthlyExpenses > 1500,
  },
  {
    id: 'cut-500',
    emoji: '✂️',
    title: 'Cut $500/mo in expenses',
    modifyProfile: (p) => ({ monthlyExpenses: p.monthlyExpenses - 500 }),
    condition: (p) => p.monthlyExpenses > 2500,
  },
  {
    id: 'side-1k',
    emoji: '💼',
    title: 'Earn $1,000/mo on the side',
    modifyParams: (p) => ({ newMonthlyIncome: p.newMonthlyIncome + 1000 }),
  },
  {
    id: 'side-2k',
    emoji: '💼',
    title: 'Earn $2,000/mo on the side',
    modifyParams: (p) => ({ newMonthlyIncome: p.newMonthlyIncome + 2000 }),
  },
  {
    id: 'save-10k',
    emoji: '🏦',
    title: 'Save $10,000 more before quitting',
    modifyProfile: (p) => ({ savings: p.savings + 10000 }),
  },
  {
    id: 'save-25k',
    emoji: '🏦',
    title: 'Save $25,000 more before quitting',
    modifyProfile: (p) => ({ savings: p.savings + 25000 }),
  },
  {
    id: 'pay-off-debt',
    emoji: '🎯',
    title: 'Pay off all debt first',
    modifyProfile: () => ({ debt: 0 }),
    condition: (p) => p.debt > 2000,
  },
  {
    id: 'move-cheaper',
    emoji: '🏡',
    title: 'Move somewhere 20% cheaper',
    modifyParams: () => ({ colChange: -20 }),
    condition: (_p, params) => params.colChange > -20,
  },
];

function monthsBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return (db.getFullYear() - da.getFullYear()) * 12 + (db.getMonth() - da.getMonth());
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function computeQuickWins(
  profile: UserProfile,
  params: SimParams,
  currentResult: SimResult,
): QuickWin[] {
  const currentConfidence = currentResult.quitConfidence;
  const currentRunway = currentResult.runwayMonths;
  const wins: QuickWin[] = [];

  for (const scenario of SCENARIOS) {
    if (scenario.condition && !scenario.condition(profile, params)) {
      continue;
    }

    const profileOverrides = scenario.modifyProfile ? scenario.modifyProfile(profile) : {};
    const paramOverrides = scenario.modifyParams ? scenario.modifyParams(params) : {};

    const modifiedProfile: UserProfile = { ...profile, ...profileOverrides };
    const modifiedParams: SimParams = { ...params, ...paramOverrides };

    const result = runSimulation(modifiedProfile, modifiedParams, QUICK_WIN_MC_RUNS);
    const impact = result.quitConfidence - currentConfidence;

    if (impact < 2) continue;

    const runwayDelta = result.runwayMonths - currentRunway;

    // Calculate freedom date shift
    let freedomShiftMonths: number | null = null;
    if (currentResult.freedomDate && result.freedomDate) {
      freedomShiftMonths = monthsBetween(currentResult.freedomDate, result.freedomDate);
    }

    // Build a rich, specific detail string
    const details: string[] = [];
    if (freedomShiftMonths !== null && freedomShiftMonths < 0) {
      details.push(`Freedom date moves ${Math.abs(freedomShiftMonths)} months closer → ${formatDate(result.freedomDate!)}`);
    } else if (!currentResult.freedomDate && result.freedomDate) {
      details.push(`Unlocks a freedom date: ${formatDate(result.freedomDate)}`);
    }
    if (runwayDelta > 0) {
      details.push(`${runwayDelta} more month${runwayDelta === 1 ? '' : 's'} of runway`);
    }
    if (details.length === 0) {
      details.push(`Confidence jumps to ${result.quitConfidence}%`);
    }

    wins.push({
      id: scenario.id,
      emoji: scenario.emoji,
      title: scenario.title,
      detail: details[0],
      impact,
      runwayDelta,
      freedomDateBefore: currentResult.freedomDate,
      freedomDateAfter: result.freedomDate,
      freedomShiftMonths,
      newConfidence: result.quitConfidence,
      profileOverrides,
      paramOverrides,
    });
  }

  wins.sort((a, b) => b.impact - a.impact);
  return wins.slice(0, 4);
}
