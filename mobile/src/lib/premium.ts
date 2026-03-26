import Purchases, {
  LOG_LEVEL,
  PurchasesOfferings,
  CustomerInfo,
  PurchasesPackage,
} from 'react-native-purchases';
import Constants from 'expo-constants';

/**
 * Premium feature gating for iOS via RevenueCat.
 *
 * Single source of truth for subscription state.
 *
 * Entitlement: "QuitSim Pro"
 * Product ID:  quitsim_pro_yearly
 * Offering:    default → Annual package
 */

export type PlanTier = 'free' | 'pro';

export const FREE_PLAN_LIMIT = 3;
export const FREE_MONTE_CARLO_RUNS = 100;
export const PRO_MONTE_CARLO_RUNS = 500;
export const PRO_PRICE = '$59/year';
export const PRO_PRODUCT_ID = 'quitsim_pro_yearly';
export const ENTITLEMENT_ID = 'QuitSim Pro';

// ─── RevenueCat public iOS SDK key ──
// Set via EAS Secrets or app.config extra. Falls back to empty string (free tier).
const REVENUECAT_API_KEY =
  Constants.expoConfig?.extra?.revenueCatApiKey ?? '';

export const PREMIUM_FEATURES = {
  unlimitedPlans: 'Save unlimited quit plans',
  fullMonteCarlo: '500-run Monte Carlo (vs 100 free)',
  couplesMode: 'Couples mode simulation',
  aiNarrative: 'AI-powered narrative insights',
  exportPdf: 'Export results as PDF',
} as const;

// ─── In-memory cache (sync reads) ────────────────────────────
let _cachedTier: PlanTier = 'free';

/**
 * Configure RevenueCat SDK. Call once at app start.
 * Returns false if no API key is configured (free tier only).
 */
export async function configureRevenueCat(): Promise<boolean> {
  if (!REVENUECAT_API_KEY) {
    console.warn('[Premium] No RevenueCat API key configured — running in free tier only');
    return false;
  }
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
  Purchases.configure({ apiKey: REVENUECAT_API_KEY });
  return true;
}

/**
 * Load premium status from RevenueCat customer info.
 */
export async function loadPremiumStatus(): Promise<void> {
  try {
    const configured = await configureRevenueCat();
    if (!configured) {
      _cachedTier = 'free';
      return;
    }
    const customerInfo = await Purchases.getCustomerInfo();
    _cachedTier = customerInfo.entitlements.active[ENTITLEMENT_ID] ? 'pro' : 'free';
  } catch (e) {
    console.warn('[Premium] Failed to load status:', e);
    _cachedTier = 'free';
  }
}

/**
 * Synchronous check — uses cached value.
 */
export function isPremium(): boolean {
  return _cachedTier === 'pro';
}

/**
 * Refresh cached tier from RevenueCat customer info.
 */
export async function refreshPremiumStatus(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    _cachedTier = customerInfo.entitlements.active[ENTITLEMENT_ID] ? 'pro' : 'free';
    return _cachedTier === 'pro';
  } catch (e) {
    console.warn('[Premium] Failed to refresh status:', e);
    return false;
  }
}

// ─── Gate helpers ─────────────────────────────────────────────

export function canSavePlan(currentPlanCount: number): boolean {
  if (isPremium()) return true;
  return currentPlanCount < FREE_PLAN_LIMIT;
}

export function canUseCouplesMode(): boolean {
  return isPremium();
}

export function canUseAINarrative(): boolean {
  return isPremium();
}

export function getMonteCarloRuns(): number {
  return isPremium() ? PRO_MONTE_CARLO_RUNS : FREE_MONTE_CARLO_RUNS;
}

// ─── RevenueCat purchase / restore ────────────────────────────

/**
 * Fetch offerings and purchase the annual package.
 */
export async function purchaseUpgrade(): Promise<boolean> {
  try {
    const offerings = await Purchases.getOfferings();
    const annual = offerings.current?.annual;
    if (!annual) {
      console.warn('[Premium] No annual package found in current offering');
      return false;
    }
    const { customerInfo } = await Purchases.purchasePackage(annual);
    if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
      _cachedTier = 'pro';
      return true;
    }
    return false;
  } catch (e: any) {
    if (e.userCancelled) return false;
    console.error('[Premium] Purchase error:', e);
    throw e;
  }
}

/**
 * Restore previous purchases (required by App Store).
 */
export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
      _cachedTier = 'pro';
      return true;
    }
    return false;
  } catch (e) {
    console.error('[Premium] Restore error:', e);
    throw e;
  }
}

// ─── SubscriptionManager (for test screen) ────────────────────

export interface SubscriptionStatus {
  isPremium: boolean;
  statusText: string;
  currentOfferingAvailable: boolean;
  annualPackage: PurchasesPackage | null;
}

/**
 * Load full subscription status for diagnostic/test UI.
 */
export async function loadSubscriptionStatus(): Promise<SubscriptionStatus> {
  try {
    const [customerInfo, offerings] = await Promise.all([
      Purchases.getCustomerInfo(),
      Purchases.getOfferings(),
    ]);

    const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
    const premium = !!entitlement;
    const annual = offerings.current?.annual ?? null;

    _cachedTier = premium ? 'pro' : 'free';

    let statusText = premium
      ? `Pro active (expires: ${entitlement!.expirationDate ?? 'never'})`
      : 'Free tier';

    if (annual) {
      statusText += ` | Annual: ${annual.product.priceString}`;
    }

    return {
      isPremium: premium,
      statusText,
      currentOfferingAvailable: !!offerings.current,
      annualPackage: annual,
    };
  } catch (e: any) {
    return {
      isPremium: false,
      statusText: `Error: ${e.message ?? e}`,
      currentOfferingAvailable: false,
      annualPackage: null,
    };
  }
}
