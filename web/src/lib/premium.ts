/**
 * Premium feature gating — stubbed for MVP.
 * Replace `isPremium()` with real subscription check (Stripe, RevenueCat, etc.)
 */

export type PlanTier = "free" | "pro";

export const FREE_PLAN_LIMIT = 3;
export const FREE_MONTE_CARLO_RUNS = 100; // pro gets 500

export const PREMIUM_FEATURES = {
  unlimitedPlans: "Save unlimited quit plans",
  fullMonteCarlo: "500-run Monte Carlo (vs 100 free)",
  couplesMode: "Couples mode simulation",
  aiNarrative: "AI-powered narrative insights",
  exportPdf: "Export results as PDF",
} as const;

export function isPremium(): boolean {
  // Stub: check localStorage for now. Replace with Stripe/RevenueCat.
  if (typeof window === "undefined") return false;
  return localStorage.getItem("quitsim-tier") === "pro";
}

export function setPremium(tier: PlanTier): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("quitsim-tier", tier);
}

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
  return isPremium() ? 500 : FREE_MONTE_CARLO_RUNS;
}
