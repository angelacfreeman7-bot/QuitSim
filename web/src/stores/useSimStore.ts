import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SimParams, SimResult, UserProfile, SavedPlan, Streak } from '@/types';
import { runSimulation, DEFAULT_PARAMS } from '@/lib/sim/engine';
import { getMonteCarloRuns } from '@/lib/premium';

interface SimState {
  // Onboarding
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;

  // Profile
  profile: UserProfile;
  setProfile: (p: Partial<UserProfile>) => void;

  // Couples mode
  couplesMode: boolean;
  toggleCouplesMode: () => void;

  // Sim params
  params: SimParams;
  setParams: (p: Partial<SimParams>) => void;
  applyPreset: (preset: Partial<SimParams>) => void;

  // Results
  result: SimResult | null;
  simulate: () => void;

  // Saved plans
  plans: SavedPlan[];
  savePlan: (name: string) => void;
  deletePlan: (id: string) => void;
  lockPlan: (id: string) => void;

  // Streaks
  streak: Streak;
  completeChallenge: (challengeId: string) => void;
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

export const useSimStore = create<SimState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      setOnboarded: (v) => set({ onboarded: v }),

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
            // Initialize partner with sensible defaults
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
            // Remove partner data when disabling
            const { partner: _, ...profileWithoutPartner } = s.profile;
            return { couplesMode: next, profile: profileWithoutPartner as typeof s.profile };
          }
          return { couplesMode: next };
        });
        get().simulate();
      },

      params: DEFAULT_PARAMS,
      setParams: (p) => {
        set((s) => ({ params: { ...s.params, ...p } }));
        get().simulate();
      },
      applyPreset: (preset) => {
        set((s) => ({ params: { ...s.params, ...preset } }));
        get().simulate();
      },

      result: null,
      simulate: () => {
        const { profile, params } = get();
        const result = runSimulation(profile, params, getMonteCarloRuns());
        set({ result });
      },

      plans: [],
      savePlan: (name) => {
        const { params, result } = get();
        if (!result) return;
        const plan: SavedPlan = {
          id: crypto.randomUUID(),
          name,
          params: { ...params },
          result,
          locked: false,
          createdAt: new Date().toISOString(),
          userId: 'local',
        };
        set((s) => ({ plans: [...s.plans, plan] }));
      },
      deletePlan: (id) => set((s) => ({ plans: s.plans.filter((p) => p.id !== id) })),
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
    }),
    { name: 'quitsim-store' }
  )
);
