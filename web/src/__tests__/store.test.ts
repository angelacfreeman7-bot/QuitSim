import { describe, it, expect, beforeEach } from "vitest";
import { useSimStore } from "../stores/useSimStore";

// Reset store before each test
beforeEach(() => {
  const store = useSimStore.getState();
  store.setProfile({
    id: "test",
    zip: "80202",
    city: "Denver",
    state: "CO",
    salary: 100000,
    savings: 50000,
    monthlyExpenses: 4000,
    investments: 30000,
    debt: 10000,
    createdAt: new Date().toISOString(),
  });
  store.simulate();
  // Clear plans
  useSimStore.setState({ plans: [] });
});

describe("useSimStore", () => {
  it("simulates on param change", () => {
    const store = useSimStore.getState();
    const before = store.result?.quitConfidence;
    store.setParams({ incomeDropPct: 50 });
    const after = useSimStore.getState().result?.quitConfidence;
    expect(after).toBeDefined();
    expect(after).not.toBe(before);
  });

  it("saves and retrieves plans", () => {
    const store = useSimStore.getState();
    store.savePlan("Test Plan");
    const plans = useSimStore.getState().plans;
    expect(plans).toHaveLength(1);
    expect(plans[0].name).toBe("Test Plan");
    expect(plans[0].locked).toBe(false);
  });

  it("locks and unlocks plans", () => {
    const store = useSimStore.getState();
    store.savePlan("Lock Test");
    const planId = useSimStore.getState().plans[0].id;
    store.lockPlan(planId);
    expect(useSimStore.getState().plans[0].locked).toBe(true);
    store.lockPlan(planId);
    expect(useSimStore.getState().plans[0].locked).toBe(false);
  });

  it("deletes unlocked plans", () => {
    const store = useSimStore.getState();
    store.savePlan("Delete Me");
    const planId = useSimStore.getState().plans[0].id;
    store.deletePlan(planId);
    expect(useSimStore.getState().plans).toHaveLength(0);
  });

  it("applies presets", () => {
    const store = useSimStore.getState();
    store.applyPreset({ incomeDropPct: 100, newMonthlyIncome: 0 });
    expect(useSimStore.getState().params.incomeDropPct).toBe(100);
    expect(useSimStore.getState().params.newMonthlyIncome).toBe(0);
  });
});
