import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SimParams, SimResult, UserProfile, SavedPlan, Streak } from '../types';
import { runSimulation, DEFAULT_PARAMS } from '../lib/engine';
import { getMonteCarloRuns } from '../lib/premium';
import { FunPreset, FUN_MODE_UNLOCK_COUNT, getRandomSurpriseExpense } from '../lib/funPresets';
import { captureError } from '../lib/sentry';
import { track } from '../lib/analytics';
import { updateWidgetData } from '../lib/widgetBridge';

// Debounce timer for simulate() — prevents rapid-fire during slider drags
let _simulateTimer: ReturnType<typeof setTimeout> | null = null;

// Store schema version — bump when changing persisted fields
const STORE_VERSION = 1;

interface SimState {
  // Schema version for data migration
  _storeVersion: number;
  welcomeSeen: boolean;
  setWelcomeSeen: (v: boolean) => void;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  disclaimerAccepted: boolean;
  acceptDisclaimer: () => void;
  // Disclaimer modal (controlled from Settings)
  disclaimerVisible: boolean;
  showDisclaimerModal: () => void;
  hideDisclaimerModal: () => void;
  profile: UserProfile;
  setProfile: (p: Partial<UserProfile>) => void;
  couplesMode: boolean;
  toggleCouplesMode: () => void;
  params: SimParams;
  setParams: (p: Partial<SimParams>) => void;
  applyPreset: (preset: Partial<SimParams>) => void;
  result: SimResult | null;
  simulate: () => void;
  plans: SavedPlan[];
  savePlan: (name: string) => void;
  deletePlan: (id: string) => void;
  lockPlan: (id: string) => void;
  streak: Streak;
  completeChallenge: (challengeId: string) => void;
  // Fun Mode
  simCount: number;
  funMode: boolean;
  activeFunPreset: FunPreset | null;
  funModeUnlocked: boolean;
  toggleFunMode: () => void;
  applyFunPreset: (preset: FunPreset) => void;
  clearFunPreset: () => void;
  // Undo / Reset
  paramsHistory: SimParams[];
  canUndo: boolean;
  undoParams: () => void;
  resetParams: () => void;
  // Full reset (from Settings)
  resetAllData: () => void;
  // Milestones
  lastMilestone: number;
  pendingMilestone: string | null;
  clearMilestone: () => void;
  // Notifications
  notificationPromptShown: boolean;
  showNotificationPrompt: boolean;
  setNotificationPromptShown: () => void;
  dismissNotificationPrompt: () => void;
  // Weekly progress snapshot
  weeklySnapshot: {
    confidence: number;
    runway: number;
    recordedAt: string;
  } | null;
  saveWeeklySnapshot: () => void;
  // Hydration
  _hasHydrated: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'local',
  zip: '',
  city: '',
  state: '',
  salary: 85000,
  savings: 30000,
  monthlyExpenses: 3500,
  investments: 15000,
  debt: 0,
  createdAt: new Date().toISOString(),
};

const MILESTONE_THRESHOLDS: [number, string][] = [
  [3, '🎉 3 months of freedom! That\'s a safety net.'],
  [6, '🚀 6 months! Most financial advisors call this solid.'],
  [12, '🏆 A full year of freedom — you\'re building something real.'],
  [18, '✈️ 18 months! You could take a real sabbatical.'],
  [24, '🌟 2 years of runway — that\'s life-changing.'],
  [36, '👑 3 years! You\'ve maxed out the simulator. Legend.'],
];

export const useSimStore = create<SimState>()(
  persist(
    (set, get) => ({
  _hasHydrated: false,
  _storeVersion: STORE_VERSION,
  disclaimerVisible: false,
  showDisclaimerModal: () => set({ disclaimerVisible: true }),
  hideDisclaimerModal: () => set({ disclaimerVisible: false }),
  welcomeSeen: false,
  setWelcomeSeen: (v) => {
    set({ welcomeSeen: v });
    if (v) track('welcome_completed');
  },
  onboarded: false,
  setOnboarded: (v) => {
    set({ onboarded: v });
    if (v) {
      track('onboarding_completed');
      // Show notification prompt after a brief delay so the dashboard renders first
      const { notificationPromptShown } = get();
      if (!notificationPromptShown) {
        setTimeout(() => {
          useSimStore.setState({ showNotificationPrompt: true });
        }, 1500);
      }
    }
  },
  disclaimerAccepted: false,
  acceptDisclaimer: () => {
    set({ disclaimerAccepted: true });
    track('disclaimer_accepted');
  },

  profile: DEFAULT_PROFILE,
  setProfile: (p) => {
    set((s) => ({ profile: { ...s.profile, ...p } }));
    get().simulate();
  },

  couplesMode: false,
  toggleCouplesMode: () => {
    set((s) => {
      const next = !s.couplesMode;
      if (next && !s.profile.partner) {
        return {
          couplesMode: next,
          profile: {
            ...s.profile,
            partner: {
              salary: Math.round(s.profile.salary * 0.8),
              savings: Math.round(s.profile.savings * 0.5),
              monthlyExpenses: Math.round(s.profile.monthlyExpenses * 0.6),
            },
          },
        };
      }
      if (!next) {
        const { partner: _, ...rest } = s.profile;
        return { couplesMode: next, profile: rest as typeof s.profile };
      }
      return { couplesMode: next };
    });
    get().simulate();
  },

  params: DEFAULT_PARAMS,
  paramsHistory: [],
  canUndo: false,
  setParams: (p) => {
    set((s) => {
      const history = [...s.paramsHistory, { ...s.params }];
      if (history.length > 10) history.shift();
      return { params: { ...s.params, ...p }, paramsHistory: history, canUndo: true };
    });
    get().simulate();
  },
  applyPreset: (preset) => {
    set((s) => {
      const history = [...s.paramsHistory, { ...s.params }];
      if (history.length > 10) history.shift();
      return { params: { ...s.params, ...preset }, paramsHistory: history, canUndo: true };
    });
    get().simulate();
  },
  undoParams: () => {
    set((s) => {
      if (s.paramsHistory.length === 0) return {};
      const history = [...s.paramsHistory];
      const prev = history.pop()!;
      return { params: prev, paramsHistory: history, canUndo: history.length > 0 };
    });
    get().simulate();
  },
  resetParams: () => {
    set({ params: DEFAULT_PARAMS, paramsHistory: [], canUndo: false });
    get().simulate();
  },

  result: null,
  simulate: () => {
    // Debounce: coalesce rapid calls (e.g., slider drags) into one simulation
    if (_simulateTimer) clearTimeout(_simulateTimer);
    _simulateTimer = setTimeout(() => {
      _simulateTimer = null;
      const { profile, params, simCount, lastMilestone } = get();
      try {
        const result = runSimulation(profile, params, getMonteCarloRuns());
        const newCount = simCount + 1;
        // Check for new milestone
        let pendingMilestone: string | null = null;
        let newLastMilestone = lastMilestone;
        for (const [threshold, message] of MILESTONE_THRESHOLDS) {
          if (result.runwayMonths >= threshold && threshold > lastMilestone) {
            pendingMilestone = message;
            newLastMilestone = threshold;
          }
        }
        set({
          result,
          simCount: newCount,
          funModeUnlocked: newCount >= FUN_MODE_UNLOCK_COUNT,
          ...(pendingMilestone ? { pendingMilestone, lastMilestone: newLastMilestone } : {}),
        });
        track('simulation_run', { confidence: result.quitConfidence, runway: result.runwayMonths });
        // Auto-save weekly snapshot if >7 days since last one
        const snap = get().weeklySnapshot;
        const weekMs = 7 * 24 * 60 * 60 * 1000;
        if (!snap || (Date.now() - new Date(snap.recordedAt).getTime()) > weekMs) {
          set({
            weeklySnapshot: {
              confidence: result.quitConfidence,
              runway: result.runwayMonths,
              recordedAt: new Date().toISOString(),
            },
          });
        }
        // Push results to iOS Home Screen widget
        updateWidgetData({
          confidenceScore: result.quitConfidence,
          freedomDate: result.freedomDate ?? '—',
          runwayMonths: result.runwayMonths,
        });
      } catch (e) {
        console.error('[Simulate] Engine error:', e);
        if (e instanceof Error) captureError(e, { context: 'simulation' });
        // Keep previous result rather than crashing
      }
    }, 100);
  },

  plans: [],
  savePlan: (name) => {
    const { params, result } = get();
    if (!result) return;
    const plan: SavedPlan = {
      id: Math.random().toString(36).slice(2),
      name,
      params: { ...params },
      result,
      locked: false,
      createdAt: new Date().toISOString(),
      userId: 'local',
    };
    set((s) => ({ plans: [...s.plans, plan] }));
    track('plan_saved');
  },
  deletePlan: (id) => {
    set((s) => ({ plans: s.plans.filter((p) => p.id !== id) }));
    track('plan_deleted');
  },
  lockPlan: (id) =>
    set((s) => ({
      plans: s.plans.map((p) => (p.id === id ? { ...p, locked: !p.locked } : p)),
    })),

  streak: { current: 0, longest: 0, lastCompleted: '', completedChallenges: [] },
  completeChallenge: (challengeId) =>
    set((s) => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const isConsecutive = s.streak.lastCompleted === yesterday || s.streak.lastCompleted === today;
      const newCurrent = isConsecutive ? s.streak.current + 1 : 1;
      return {
        streak: {
          current: newCurrent,
          longest: Math.max(newCurrent, s.streak.longest),
          lastCompleted: today,
          completedChallenges: [...s.streak.completedChallenges, challengeId],
        },
      };
    }),

  // Fun Mode
  simCount: 0,
  funMode: false,
  activeFunPreset: null,
  funModeUnlocked: false,
  toggleFunMode: () => {
    const { funMode, activeFunPreset } = get();
    if (funMode && activeFunPreset) {
      // Turning off — revert to defaults
      set({ funMode: false, activeFunPreset: null, params: DEFAULT_PARAMS });
      get().simulate();
    } else {
      set({ funMode: !funMode, activeFunPreset: null });
    }
  },
  applyFunPreset: (preset: FunPreset) => {
    const { profile } = get();
    // Apply preset params
    const newParams = { ...DEFAULT_PARAMS, ...preset.params };
    // Apply savings boost if present
    let boostedProfile = profile;
    if (preset.savingsBoost) {
      boostedProfile = { ...profile, savings: profile.savings + preset.savingsBoost };
    }
    // Check for surprise expense
    const surprise = getRandomSurpriseExpense(preset);
    if (surprise) {
      newParams.additionalExpenses = (newParams.additionalExpenses || 0) + surprise.amount;
    }
    set({ activeFunPreset: preset, params: newParams, profile: boostedProfile });
    get().simulate();
  },
  clearFunPreset: () => {
    set({ activeFunPreset: null, params: DEFAULT_PARAMS });
    get().simulate();
  },

  // Full data reset
  resetAllData: () => {
    set({
      welcomeSeen: false,
      onboarded: false,
      disclaimerAccepted: false,
      profile: DEFAULT_PROFILE,
      params: DEFAULT_PARAMS,
      paramsHistory: [],
      canUndo: false,
      plans: [],
      streak: { current: 0, longest: 0, lastCompleted: '', completedChallenges: [] },
      simCount: 0,
      funMode: false,
      activeFunPreset: null,
      funModeUnlocked: false,
      lastMilestone: 0,
      pendingMilestone: null,
      result: null,
      couplesMode: false,
      notificationPromptShown: false,
      showNotificationPrompt: false,
      weeklySnapshot: null,
    });
  },

  // Weekly progress snapshot
  weeklySnapshot: null,
  saveWeeklySnapshot: () => {
    const { result } = get();
    if (!result) return;
    set({
      weeklySnapshot: {
        confidence: result.quitConfidence,
        runway: result.runwayMonths,
        recordedAt: new Date().toISOString(),
      },
    });
  },

  // Notifications
  notificationPromptShown: false,
  showNotificationPrompt: false,
  setNotificationPromptShown: () => set({ notificationPromptShown: true, showNotificationPrompt: false }),
  dismissNotificationPrompt: () => set({ showNotificationPrompt: false, notificationPromptShown: true }),

  // Milestones
  lastMilestone: 0,
  pendingMilestone: null,
  clearMilestone: () => set({ pendingMilestone: null }),
}),
    {
      name: 'quitsim-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: STORE_VERSION,
      partialize: (state) => ({
        _storeVersion: state._storeVersion,
        profile: state.profile,
        params: state.params,
        plans: state.plans,
        streak: state.streak,
        welcomeSeen: state.welcomeSeen,
        onboarded: state.onboarded,
        disclaimerAccepted: state.disclaimerAccepted,
        simCount: state.simCount,
        funModeUnlocked: state.funModeUnlocked,
        couplesMode: state.couplesMode,
        lastMilestone: state.lastMilestone,
        notificationPromptShown: state.notificationPromptShown,
        weeklySnapshot: state.weeklySnapshot,
      }),
      migrate: (persisted: any, version: number) => {
        // Migration logic: runs when stored version < current STORE_VERSION
        // v0 → v1: ensure all fields have defaults (first versioned release)
        if (version < 1) {
          persisted._storeVersion = 1;
          // Ensure params have all required fields
          persisted.params = { ...DEFAULT_PARAMS, ...(persisted.params ?? {}) };
          // Ensure profile has all required fields
          persisted.profile = { ...DEFAULT_PROFILE, ...(persisted.profile ?? {}) };
          // Ensure streak exists
          if (!persisted.streak) {
            persisted.streak = { current: 0, longest: 0, lastCompleted: '', completedChallenges: [] };
          }
        }
        // Future: add v1 → v2 migration here
        return persisted;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[Store] Rehydration error:', error);
        }
        // Always mark as hydrated — even on error we proceed with defaults
        useSimStore.setState({ _hasHydrated: true });
      },
    },
  ),
);
