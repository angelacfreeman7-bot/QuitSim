/**
 * Lightweight analytics for QuitSim.
 *
 * Privacy-first: all events are local by default.
 * To send events to a backend (PostHog, Amplitude, etc.),
 * replace the `track()` implementation.
 *
 * No PII is ever included in events.
 */

type EventName =
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'simulation_run'
  | 'plan_saved'
  | 'plan_deleted'
  | 'challenge_completed'
  | 'share_tapped'
  | 'upgrade_prompt_shown'
  | 'upgrade_purchased'
  | 'fun_mode_toggled'
  | 'preset_applied'
  | 'welcome_completed'
  | 'welcome_skipped'
  | 'disclaimer_accepted'
  | 'paywall_triggered';

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track an analytics event.
 * Currently logs to console in dev. Replace with your analytics SDK.
 */
export function track(event: EventName, properties?: EventProperties): void {
  if (__DEV__) {
    console.log(`[Analytics] ${event}`, properties ?? '');
  }

  // TODO: Wire to PostHog, Amplitude, or custom backend
  // Example:
  // posthog.capture(event, properties);
}
