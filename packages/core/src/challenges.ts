import { Challenge } from './types';

export const CHALLENGES: Challenge[] = [
  {
    id: 'skip-coffee',
    title: 'Skip the $6 Latte',
    description: 'Make coffee at home today. Bank the $6 toward your freedom fund.',
    category: 'save',
    xp: 10,
  },
  {
    id: 'no-subscriptions',
    title: 'Audit One Subscription',
    description: 'Cancel or pause one subscription you haven\'t used in 30 days.',
    category: 'save',
    xp: 25,
  },
  {
    id: 'side-hustle-hour',
    title: '1-Hour Side Hustle Sprint',
    description: 'Spend 60 minutes on a freelance gig, Etsy listing, or consulting pitch.',
    category: 'earn',
    xp: 30,
  },
  {
    id: 'negotiate-bill',
    title: 'Negotiate a Bill',
    description: 'Call one provider (internet, insurance, phone) and ask for a discount.',
    category: 'save',
    xp: 40,
  },
  {
    id: 'learn-investing',
    title: 'Learn One Investment Concept',
    description: 'Spend 15 minutes learning about index funds, bonds, or FIRE withdrawal rates.',
    category: 'learn',
    xp: 15,
  },
  {
    id: 'visualize-freedom',
    title: 'Visualize Your Freedom Day',
    description: 'Write down what your ideal Tuesday looks like after quitting. Be specific.',
    category: 'mindset',
    xp: 20,
  },
  {
    id: 'meal-prep',
    title: 'Meal Prep Sunday',
    description: 'Prep 5 lunches. Save ~$50 vs eating out this week.',
    category: 'save',
    xp: 25,
  },
  {
    id: 'update-resume',
    title: 'Update Your Resume',
    description: 'Add your latest wins. You\'ll need it ready when you pull the trigger.',
    category: 'earn',
    xp: 20,
  },
  {
    id: 'emergency-fund-check',
    title: 'Check Emergency Fund',
    description: 'Verify your emergency fund covers at least 3 months. Adjust your sim if not.',
    category: 'learn',
    xp: 15,
  },
  {
    id: 'gratitude-quit',
    title: 'Write Your Quit Letter (Draft)',
    description: 'Draft a professional, gracious resignation letter. Don\'t send it — yet.',
    category: 'mindset',
    xp: 35,
  },
];

export function getTodayChallenge(): Challenge {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return CHALLENGES[dayOfYear % CHALLENGES.length];
}

export function getUpcomingChallenges(count: number): Challenge[] {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const result: Challenge[] = [];
  for (let i = 1; i <= count; i++) {
    result.push(CHALLENGES[(dayOfYear + i) % CHALLENGES.length]);
  }
  return result;
}
