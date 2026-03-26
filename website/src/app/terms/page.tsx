import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — QuitSim",
  description: "QuitSim terms of service and conditions of use.",
};

export default function Terms() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <nav className="mb-12">
        <a href="/" className="text-lg font-bold tracking-tight">
          Quit<span className="text-[var(--accent)]">Sim</span>
        </a>
      </nav>

      <h1 className="text-3xl font-bold sm:text-4xl">Terms of Service</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Last updated: March 25, 2026</p>

      <div className="mt-10 space-y-8 text-[var(--muted)] leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[var(--fg)] [&_h2]:mb-3 [&_strong]:text-[var(--fg)]">
        <section>
          <h2>Acceptance of Terms</h2>
          <p>
            By downloading, installing, or using QuitSim (&quot;the App&quot;), you agree to be
            bound by these Terms of Service. If you do not agree to these terms, do not use the App.
          </p>
        </section>

        <section>
          <h2>Description of Service</h2>
          <p>
            QuitSim is a personal financial simulation tool that helps users estimate their financial
            runway and explore hypothetical scenarios related to leaving employment. The App provides
            projections based on user-provided data and statistical modeling.
          </p>
        </section>

        <section>
          <h2>Not Financial Advice</h2>
          <p>
            <strong>
              QuitSim is not a financial advisor, and nothing in the App constitutes financial,
              investment, tax, or legal advice.
            </strong>{" "}
            The simulations, confidence scores, freedom dates, and all other outputs are estimates
            based on simplified models and user-provided data. They do not account for all real-world
            variables and should not be the sole basis for any financial decision.
          </p>
          <p className="mt-3">
            You should consult with a qualified financial advisor before making significant financial
            decisions, including leaving employment. QuitSim is intended for educational and
            informational purposes only.
          </p>
        </section>

        <section>
          <h2>Accuracy of Information</h2>
          <p>
            QuitSim&apos;s simulations use Monte Carlo methods and simplified financial models. While
            we strive for reasonable accuracy, results are inherently approximate and based on
            assumptions that may not reflect your actual circumstances. Past performance and
            statistical projections do not guarantee future results.
          </p>
        </section>

        <section>
          <h2>User Responsibilities</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>You are responsible for the accuracy of data you enter into the App.</li>
            <li>
              You are solely responsible for any decisions you make based on information provided by
              the App.
            </li>
            <li>You agree not to use the App for any unlawful purpose.</li>
            <li>
              You must be at least 13 years of age to use the App.
            </li>
          </ul>
        </section>

        <section>
          <h2>Subscriptions and Payments</h2>
          <p>
            QuitSim offers a free tier and a paid subscription (&quot;QuitSim Pro&quot;). Subscriptions
            are billed annually through the Apple App Store. By subscribing, you also agree to
            Apple&apos;s terms of service for in-app purchases.
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period.</li>
            <li>You can manage and cancel subscriptions in your Apple ID account settings.</li>
            <li>Refunds are handled by Apple in accordance with their refund policy.</li>
          </ul>
        </section>

        <section>
          <h2>Intellectual Property</h2>
          <p>
            The App, including its design, code, algorithms, and content, is owned by QuitSim and
            protected by copyright and other intellectual property laws. You may not copy, modify,
            distribute, or reverse-engineer any part of the App.
          </p>
        </section>

        <section>
          <h2>Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, QuitSim and its creators shall not be liable for
            any indirect, incidental, special, consequential, or punitive damages, or any loss of
            profits or revenues, whether incurred directly or indirectly, or any loss of data or
            other intangible losses resulting from:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>Your use of or inability to use the App</li>
            <li>Any financial decisions made based on the App&apos;s outputs</li>
            <li>Any unauthorized access to your data</li>
            <li>Any errors, inaccuracies, or omissions in the App&apos;s calculations</li>
          </ul>
        </section>

        <section>
          <h2>Disclaimer of Warranties</h2>
          <p>
            The App is provided &quot;as is&quot; and &quot;as available&quot; without warranties of
            any kind, either express or implied, including but not limited to implied warranties of
            merchantability, fitness for a particular purpose, and non-infringement.
          </p>
        </section>

        <section>
          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the App after
            changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about these terms? Contact us at{" "}
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
