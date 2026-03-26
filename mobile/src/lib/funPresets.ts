import { SimParams } from '../types';

export interface FunPreset {
  id: string;
  emoji: string;
  name: string;
  tagline: string;
  color: string;
  bgColor: string;
  /** Screen background color when this preset is active */
  screenBg: string;
  params: Partial<SimParams>;
  /** Extra savings to inject before running sim */
  savingsBoost?: number;
  narrative: {
    prefix: string;
    summary: string;
    joke: string;
  };
  /** Trigger confetti on activate */
  confetti?: boolean;
  /** Random "surprise expense" popup */
  surpriseExpense?: { label: string; amount: number }[];
}

export const FUN_PRESETS: FunPreset[] = [
  {
    id: 'lottery',
    emoji: '🎰',
    name: 'Win the Lottery',
    tagline: 'Tomorrow. Obviously.',
    color: '#fbbf24',
    bgColor: 'rgba(251, 191, 36, 0.12)',
    screenBg: '#1a1408',
    params: {
      incomeDropPct: 0,
      newMonthlyIncome: 10000,
      additionalExpenses: 2000,
      investmentReturn: 12,
      blackSwan: false,
    },
    confetti: true,
    narrative: {
      prefix: '💰 In this wild dream world...',
      summary:
        "Congrats, you're basically retired. But even millionaires blow it sometimes — keep practicing! (simulation suggests...)",
      joke: 'Buy a yacht? Nah, start with better coffee.',
    },
  },
  {
    id: 'vanlife',
    emoji: '🚐',
    name: 'Van Life Adventure',
    tagline: 'Cubicles → Campfires',
    color: '#34d399',
    bgColor: 'rgba(52, 211, 153, 0.12)',
    screenBg: '#081a12',
    params: {
      incomeDropPct: 50,
      newMonthlyIncome: 200,
      additionalExpenses: 0,
      colChange: -30,
      blackSwan: false,
    },
    narrative: {
      prefix: '⛰️ In this mountain dream...',
      summary:
        'Trading cubicles for campfires — runway extends massively when your rent is $0 and your office is a national park.',
      joke: "WiFi signal: 1 bar. Inner peace: full bars.",
    },
  },
  {
    id: 'passive-income',
    emoji: '🚀',
    name: 'Passive Income Explosion',
    tagline: 'Money printer go brrr',
    color: '#818cf8',
    bgColor: 'rgba(129, 140, 248, 0.12)',
    screenBg: '#0e0a1a',
    params: {
      incomeDropPct: 0,
      newMonthlyIncome: 5000,
      additionalExpenses: 0,
      investmentReturn: 10,
      blackSwan: false,
    },
    narrative: {
      prefix: '🚀 In this escape-velocity scenario...',
      summary:
        "Your side project just hit escape velocity. Freedom Date: basically yesterday.",
      joke: 'Source: Mystery dividends / Book royalties / Viral TikTok',
    },
  },
  {
    id: 'inheritance',
    emoji: '🎩',
    name: 'Eccentric Uncle',
    tagline: 'He left you... everything',
    color: '#f472b6',
    bgColor: 'rgba(244, 114, 182, 0.12)',
    screenBg: '#1a0814',
    params: {
      incomeDropPct: 0,
      newMonthlyIncome: 0,
      additionalExpenses: 0,
      investmentReturn: 8,
      blackSwan: false,
    },
    savingsBoost: 250000,
    surpriseExpense: [
      { label: 'Family reunion yacht rental', amount: 5000 },
      { label: 'Vintage comic insurance', amount: 1200 },
      { label: "Uncle's parrot's therapy", amount: 800 },
      { label: 'Monocle polishing service', amount: 350 },
    ],
    narrative: {
      prefix: '🎩 In this eccentric inheritance timeline...',
      summary:
        "Uncle left you the vintage comic collection... and it sold for seven figures. Quit? More like retire.",
      joke: "Surprise: he also left you his pet iguana. Budget accordingly.",
    },
  },
  {
    id: 'ai-royalties',
    emoji: '🤖',
    name: 'AI Takes Your Job',
    tagline: '...but pays you royalties',
    color: '#22d3ee',
    bgColor: 'rgba(34, 211, 238, 0.12)',
    screenBg: '#081418',
    params: {
      incomeDropPct: 100,
      newMonthlyIncome: 4000,
      additionalExpenses: 0,
      investmentReturn: 9,
      blackSwan: false,
    },
    narrative: {
      prefix: '🤖 In this robot uprising scenario...',
      summary:
        "The robots won... and you're getting paid to watch. Classic plot twist.",
      joke: "Your replacement AI sends you a 'thank you' card every quarter.",
    },
  },
];

/** Number of serious sims needed before Fun Mode unlocks */
export const FUN_MODE_UNLOCK_COUNT = 5;

/** Get a random surprise expense for the inheritance preset */
export function getRandomSurpriseExpense(preset: FunPreset): { label: string; amount: number } | null {
  if (!preset.surpriseExpense || Math.random() > 0.4) return null;
  return preset.surpriseExpense[Math.floor(Math.random() * preset.surpriseExpense.length)];
}

/** Easter egg text for >95% confidence in fun mode */
export function getEasterEggText(confidence: number, presetId: string): string | null {
  if (confidence < 95) return null;
  const eggs: Record<string, string> = {
    'passive-income': 'Buy the dip in Bitcoin? (jk... or am I? 👀)',
    'lottery': 'At this rate you could buy the company you quit from 😏',
    'inheritance': "Uncle would be proud. The iguana less so.",
    'ai-royalties': "Plot twist: the AI wants to quit too.",
    'vanlife': "You've reached van-lightment. 🧘‍♂️",
  };
  return eggs[presetId] ?? null;
}
