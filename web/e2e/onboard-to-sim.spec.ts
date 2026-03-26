import { test, expect } from "@playwright/test";

test.describe("Onboarding → Simulator flow", () => {
  test("new user can onboard and reach dashboard", async ({ page }) => {
    // Clear localStorage to simulate new user
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Should redirect to welcome
    await expect(page).toHaveURL(/welcome/);

    // Click CTA
    await page.getByRole("button", { name: /get started|find out|quit/i }).click();

    // Should be on setup page
    await expect(page).toHaveURL(/setup/);

    // Fill ZIP (defaults to 80202, just submit)
    // Adjust salary slider or leave defaults
    // Click the submit/finish button
    const finishBtn = page.getByRole("button", { name: /finish|simulate|let.*go|run/i });
    if (await finishBtn.isVisible()) {
      await finishBtn.click();
    }

    // Should reach dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });

  test("dashboard shows confidence score", async ({ page }) => {
    // Set up a profile in localStorage to skip onboarding
    await page.goto("/");
    await page.evaluate(() => {
      const state = {
        state: {
          onboarded: true,
          profile: {
            id: "e2e-test",
            zip: "80202",
            city: "Denver",
            state: "CO",
            salary: 100000,
            savings: 50000,
            monthlyExpenses: 4000,
            investments: 30000,
            debt: 10000,
            createdAt: new Date().toISOString(),
          },
          params: {
            incomeDropPct: 100,
            newMonthlyIncome: 0,
            additionalExpenses: 0,
            savingsRate: 20,
            investmentReturn: 7,
            colChange: 0,
            emergencyMonths: 6,
            blackSwan: false,
          },
          savedPlans: [],
          streak: { current: 0, longest: 0, lastCompleted: "", completedChallenges: [] },
        },
        version: 0,
      };
      localStorage.setItem("quitsim-store", JSON.stringify(state));
    });

    await page.goto("/dashboard");
    await expect(page.locator("text=Confidence").first()).toBeVisible({ timeout: 10000 });
    // Check that a percentage is displayed
    await expect(page.locator("text=/%/").first()).toBeVisible();
  });

  test("simulator page renders sliders and chart", async ({ page }) => {
    // Pre-seed localStorage
    await page.goto("/");
    await page.evaluate(() => {
      const state = {
        state: {
          onboarded: true,
          profile: {
            id: "e2e-test",
            zip: "80202",
            city: "Denver",
            state: "CO",
            salary: 100000,
            savings: 50000,
            monthlyExpenses: 4000,
            investments: 30000,
            debt: 10000,
            createdAt: new Date().toISOString(),
          },
          params: {
            incomeDropPct: 100,
            newMonthlyIncome: 0,
            additionalExpenses: 0,
            savingsRate: 20,
            investmentReturn: 7,
            colChange: 0,
            emergencyMonths: 6,
            blackSwan: false,
          },
          savedPlans: [],
          streak: { current: 0, longest: 0, lastCompleted: "", completedChallenges: [] },
        },
        version: 0,
      };
      localStorage.setItem("quitsim-store", JSON.stringify(state));
    });

    await page.goto("/simulator");

    // Sliders should be present
    await expect(page.getByText("Income Drop")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Financial Projection")).toBeVisible();

    // Share card should exist
    await expect(page.getByText("QuitSim")).toBeVisible();
  });

  test("save plan flow works", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const state = {
        state: {
          onboarded: true,
          profile: {
            id: "e2e-test",
            zip: "80202",
            city: "Denver",
            state: "CO",
            salary: 100000,
            savings: 50000,
            monthlyExpenses: 4000,
            investments: 30000,
            debt: 10000,
            createdAt: new Date().toISOString(),
          },
          params: {
            incomeDropPct: 100,
            newMonthlyIncome: 0,
            additionalExpenses: 0,
            savingsRate: 20,
            investmentReturn: 7,
            colChange: 0,
            emergencyMonths: 6,
            blackSwan: false,
          },
          savedPlans: [],
          streak: { current: 0, longest: 0, lastCompleted: "", completedChallenges: [] },
        },
        version: 0,
      };
      localStorage.setItem("quitsim-store", JSON.stringify(state));
    });

    await page.goto("/simulator");

    // Click Save Plan
    await page.getByText("Save Plan").click();

    // Fill plan name
    await page.getByPlaceholder("My quit plan").fill("E2E Test Plan");
    await page.getByRole("button", { name: "Save" }).click();

    // Navigate to library and verify
    await page.goto("/library");
    await expect(page.getByText("E2E Test Plan")).toBeVisible({ timeout: 10000 });
  });
});
