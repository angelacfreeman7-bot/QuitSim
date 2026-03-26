import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support — QuitSim",
  description: "Get help with QuitSim. Contact our support team.",
};

export default function Support() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <nav className="mb-12">
        <a href="/" className="text-lg font-bold tracking-tight">
          Quit<span className="text-[var(--accent)]">Sim</span>
        </a>
      </nav>

      <h1 className="text-3xl font-bold sm:text-4xl">Support</h1>
      <p className="mt-4 text-lg text-[var(--muted)]">
        Need help with QuitSim? We&apos;re here for you.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {/* Email */}
        <a
          href="mailto:support@quitsim.it.com"
          className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-colors hover:border-[var(--sunset)]/30 hover:bg-[var(--card-hover)]"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-dim)] text-[var(--accent)] transition-transform group-hover:scale-110">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
              <path d="M2 7l10 6 10-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">Email Us</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            support@quitsim.it.com
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            We typically respond within 24 hours.
          </p>
        </a>

        {/* FAQ teaser */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-dim)] text-[var(--accent)]">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M9 9c0-1.657 1.343-3 3-3s3 1.343 3 3c0 1.304-.838 2.403-2 2.816V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">Quick Answers</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Common questions answered below.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            {
              q: "Is my financial data safe?",
              a: "Yes. All your financial data is stored locally on your device and never sent to our servers. Simulations run entirely on-device. If you delete the app, your data is permanently removed.",
            },
            {
              q: "What is the Quit Confidence Score?",
              a: "It's a 0\u2013100 score that combines three factors: your runway (how many months your money lasts), Monte Carlo simulation results (stress-tested outcomes), and your savings ratio (savings vs. annual expenses). A higher score means greater financial readiness.",
            },
            {
              q: "How accurate are the simulations?",
              a: "QuitSim uses Monte Carlo methods to run hundreds of randomized scenarios accounting for market volatility, expense shocks, and income variation. While no simulation can predict the future perfectly, this approach gives you a realistic range of outcomes rather than a single guess.",
            },
            {
              q: "What does QuitSim Pro include?",
              a: "Pro ($59/year) unlocks 500 Monte Carlo simulations (vs. 100), unlimited saved plans (vs. 3), couples mode for dual-income households, AI narrative insights, and PDF export.",
            },
            {
              q: "How do I cancel my subscription?",
              a: "Open your iPhone Settings \u2192 tap your name \u2192 Subscriptions \u2192 QuitSim Pro \u2192 Cancel Subscription. Your Pro features remain active until the end of your billing period.",
            },
            {
              q: "Can I use QuitSim with my partner?",
              a: "Yes! Couples mode (available in QuitSim Pro) lets you combine two incomes, savings, and expense profiles into a single simulation for more accurate household planning.",
            },
            {
              q: "What does the Freedom Date mean?",
              a: "Your Freedom Date is the projected date when your financial position is strong enough to leave your job with confidence, based on your current savings rate, expenses, and investment growth.",
            },
            {
              q: "I found a bug. How do I report it?",
              a: "Email us at support@quitsim.it.com with a description of the issue and your device model/iOS version. Screenshots are always helpful!",
            },
          ].map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border border-[var(--border)] bg-[var(--card)]"
            >
              <summary className="cursor-pointer select-none px-6 py-4 text-[var(--fg)] font-medium flex items-center justify-between">
                {faq.q}
                <svg
                  className="h-5 w-5 shrink-0 text-[var(--muted)] transition-transform group-open:rotate-45"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </summary>
              <p className="px-6 pb-4 text-sm text-[var(--muted)] leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* Still need help */}
      <div className="mt-16 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <h2 className="text-xl font-semibold">Still need help?</h2>
        <p className="mt-2 text-[var(--muted)]">
          We&apos;re happy to assist with anything.
        </p>
        <a
          href="mailto:support@quitsim.it.com"
          className="mt-4 inline-block rounded-full bg-[var(--sunset)] px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-[var(--sunset)]/20"
        >
          Email Support
        </a>
      </div>
    </main>
  );
}
