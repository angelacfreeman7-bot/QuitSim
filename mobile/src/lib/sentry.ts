import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const DSN = Constants.expoConfig?.extra?.sentryDsn ?? '';

/**
 * Initialize Sentry crash reporting.
 * No-ops gracefully if DSN is not configured.
 */
export function initSentry(): void {
  if (!DSN) {
    console.log('[Sentry] No DSN configured — crash reporting disabled');
    return;
  }

  Sentry.init({
    dsn: DSN,
    // Only send errors in production; log to console in dev
    enabled: !__DEV__,
    // Capture unhandled promise rejections
    enableAutoSessionTracking: true,
    // Performance monitoring — sample 20% of transactions
    tracesSampleRate: 0.2,
    // Don't send PII
    sendDefaultPii: false,
  });
}

/**
 * Capture an error manually (e.g., from error boundaries or catch blocks).
 */
export function captureError(error: Error, context?: Record<string, string>): void {
  if (!DSN || __DEV__) {
    console.error('[Sentry] Would capture:', error.message, context);
    return;
  }

  if (context) {
    Sentry.withScope((scope) => {
      for (const [key, value] of Object.entries(context)) {
        scope.setTag(key, value);
      }
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Wrap the root app component with Sentry's error tracking.
 */
export const withSentry = Sentry.wrap;
