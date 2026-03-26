import { isPremium } from './premium';
import { track } from './analytics';

/**
 * Smart Paywall Timing
 *
 * Show the upgrade prompt at peak emotional moments — when the user
 * is most invested and most likely to convert. Never when they're
 * frustrated or just getting started.
 *
 * Trigger points (in order of conversion likelihood):
 * 1. After seeing a high confidence score for the first time (≥60%)
 * 2. After completing their 3rd simulation (they're hooked)
 * 3. After hitting a milestone (emotional high)
 * 4. After 7-day streak (strong habit formed)
 * 5. When trying to use a gated feature (existing behavior)
 */

// Track which prompts have been shown this session to avoid spam
const shownThisSession = new Set<string>();

interface PaywallContext {
  simCount: number;
  confidence: number;
  streakDays: number;
  lastMilestone: number;
}

/**
 * Check if the paywall should show after a simulation.
 * Returns a feature message string if it should trigger, null otherwise.
 */
export function shouldShowPaywallAfterSim(ctx: PaywallContext): string | null {
  if (isPremium()) return null;

  // After first high confidence score (they're feeling great)
  if (
    ctx.confidence >= 60 &&
    ctx.simCount >= 2 &&
    !shownThisSession.has('high_confidence')
  ) {
    shownThisSession.add('high_confidence');
    track('paywall_triggered', { reason: 'high_confidence', confidence: ctx.confidence });
    return 'Deeper simulations with 500 Monte Carlo runs';
  }

  // After 5th simulation (they're invested in the app)
  if (ctx.simCount === 5 && !shownThisSession.has('sim_count_5')) {
    shownThisSession.add('sim_count_5');
    track('paywall_triggered', { reason: 'sim_count_5' });
    return 'Save unlimited plans and compare scenarios';
  }

  return null;
}

/**
 * Check if the paywall should show after a milestone toast.
 */
export function shouldShowPaywallAfterMilestone(milestone: number): string | null {
  if (isPremium()) return null;

  // Show after their first milestone (6+ months) — they're excited
  if (milestone >= 6 && !shownThisSession.has('milestone')) {
    shownThisSession.add('milestone');
    track('paywall_triggered', { reason: 'milestone', months: milestone });
    return 'Couples mode and advanced simulations';
  }

  return null;
}

/**
 * Check if the paywall should show after completing a streak.
 */
export function shouldShowPaywallAfterStreak(streakDays: number): string | null {
  if (isPremium()) return null;

  // Show after 7-day streak — they're a committed user
  if (streakDays === 7 && !shownThisSession.has('streak_7')) {
    shownThisSession.add('streak_7');
    track('paywall_triggered', { reason: 'streak_7' });
    return 'AI-powered insights and PDF exports';
  }

  return null;
}
