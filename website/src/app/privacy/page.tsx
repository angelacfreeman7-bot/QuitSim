import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — QuitSim",
  description: "QuitSim privacy policy. Your financial data stays on your device.",
};

export default function Privacy() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <nav className="mb-12">
        <a href="/" className="text-lg font-bold tracking-tight">
          Quit<span className="text-[var(--accent)]">Sim</span>
        </a>
      </nav>

      <h1 className="text-3xl font-bold sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Last updated: March 25, 2026</p>

      <div className="mt-10 space-y-8 text-[var(--muted)] leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[var(--fg)] [&_h2]:mb-3 [&_strong]:text-[var(--fg)]">
        <section>
          <h2>Our Commitment</h2>
          <p>
            QuitSim is built with privacy at its core. Your financial data is processed entirely on
            your device and is never transmitted to our servers. We believe your financial information
            is deeply personal and should stay that way.
          </p>
        </section>

        <section>
          <h2>Information We Do Not Collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Your salary, savings, investments, expenses, or debt figures</li>
            <li>Your simulation results, confidence scores, or freedom dates</li>
            <li>Your saved plans or scenario configurations</li>
            <li>Any financial data you enter into the app</li>
          </ul>
          <p className="mt-3">
            All calculations — including Monte Carlo simulations, runway projections, and confidence
            scoring — run entirely on your device.
          </p>
        </section>

        <section>
          <h2>Information We May Collect</h2>
          <p>We may collect limited, non-financial information to improve the app:</p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>
              <strong>Analytics:</strong> Anonymous usage data such as which screens are visited and
              feature usage patterns. This data cannot be linked to your identity or financial
              information.
            </li>
            <li>
              <strong>Crash Reports:</strong> Anonymous crash logs to help us fix bugs and improve
              stability.
            </li>
            <li>
              <strong>Purchase Information:</strong> If you subscribe to QuitSim Pro, your purchase
              is processed by Apple through the App Store. We receive confirmation of your
              subscription status but never see your payment details.
            </li>
          </ul>
        </section>

        <section>
          <h2>Data Storage</h2>
          <p>
            All financial data you enter is stored locally on your device using secure on-device
            storage. If you delete the app, your data is permanently removed. We do not maintain any
            backups of your personal financial data on our servers.
          </p>
        </section>

        <section>
          <h2>Third-Party Services</h2>
          <p>QuitSim may use the following third-party services:</p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>
              <strong>RevenueCat:</strong> For managing in-app subscriptions. RevenueCat processes
              subscription status but does not have access to your financial data.
            </li>
            <li>
              <strong>Apple App Store:</strong> For processing purchases and subscriptions.
            </li>
          </ul>
        </section>

        <section>
          <h2>AI Features</h2>
          <p>
            If you use AI-powered features (available in QuitSim Pro), text you provide for analysis
            may be sent to our AI provider for processing. This data is not stored or used for
            training. No financial figures from your simulations are included in AI requests.
          </p>
        </section>

        <section>
          <h2>Children&apos;s Privacy</h2>
          <p>
            QuitSim is not intended for use by children under the age of 13. We do not knowingly
            collect personal information from children.
          </p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any
            significant changes through the app or on our website.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            If you have questions about this privacy policy, contact us at{" "}
            <a
              href="mailto:support@quitsim.it.com"
              className="text-[var(--accent)] hover:underline"
            >
              support@quitsim.it.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
