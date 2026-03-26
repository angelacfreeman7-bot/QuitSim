"use client";

import { useEffect, useRef, useCallback, useState, type FormEvent } from "react";

const cx = "site-container";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        (entry.target as HTMLElement).classList.add("visible");
      }
    });
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, { threshold: 0.15, rootMargin: "-50px" });
    ref.current?.querySelectorAll(".reveal").forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [handleIntersect]);
  return ref;
}

function WaitlistForm({ variant = "default" }: { variant?: "default" | "large" }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch("https://formsubmit.co/ajax/support@quitsim.it.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, _subject: "QuitSim Waitlist Signup", _template: "table" }),
      });
      setSubmitted(true);
    } catch {
      window.location.href = `mailto:support@quitsim.it.com?subject=Waitlist&body=Please add ${email} to the QuitSim waitlist`;
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-[var(--mint)]/30 bg-[var(--mint-dim)] px-6 py-4 text-center">
        <p className="text-[var(--mint)] font-semibold">You&apos;re on the list! 🎉</p>
        <p className="text-sm text-[var(--muted)] mt-1">We&apos;ll email you the moment QuitSim launches.</p>
      </div>
    );
  }

  const isLarge = variant === "large";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className={`flex-1 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm ${isLarge ? "px-5 py-4 text-base" : "px-4 py-3 text-sm"} text-white placeholder-white/40 outline-none focus:border-[var(--golden)]/40 transition-colors`}
      />
      <button
        type="submit"
        disabled={loading}
        className={`rounded-xl bg-white ${isLarge ? "px-8 py-4 text-base" : "px-6 py-3 text-sm"} font-semibold text-[#1C1917] transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 whitespace-nowrap shadow-lg shadow-black/20`}
      >
        {loading ? "Joining..." : "Get Early Access"}
      </button>
    </form>
  );
}

/* ── Animated phone screens ── */
function PhoneFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative mx-auto w-[280px] ${className}`}>
      <div className="rounded-[40px] border border-white/10 bg-[#1C1917]/90 backdrop-blur-xl p-3 shadow-2xl shadow-black/60">
        <div className="mx-auto mb-3 h-5 w-28 rounded-full bg-black/60" />
        <div className="rounded-[28px] bg-[#0C0A09] p-5 space-y-4 min-h-[380px]">
          {children}
        </div>
      </div>
    </div>
  );
}

function ConfidenceGauge() {
  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width="180" height="110" viewBox="0 0 200 120">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="50%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <path d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="12" strokeLinecap="round" />
        <path d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round" className="gauge-arc" />
      </svg>
      <div className="absolute bottom-0 text-center">
        <span className="block text-3xl font-bold text-[var(--mint)] fade-in-delayed">78%</span>
        <span className="text-[10px] tracking-widest uppercase text-[var(--muted)]">Quit Ready</span>
      </div>
    </div>
  );
}

function RunwayBars() {
  const bars = [85, 80, 74, 68, 61, 53, 44, 34, 22, 10];
  return (
    <div className="flex items-end gap-1.5 h-20">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-4 rounded-t-sm bar-grow"
          style={{
            height: `${h}%`,
            background: i > 6 ? "linear-gradient(to top, #f87171, #FBBF24)" : "linear-gradient(to top, #34d399, #2DD4BF)",
            opacity: i > 7 ? 0.4 : 0.8,
            animationDelay: `${0.8 + i * 0.06}s`,
          }}
        />
      ))}
    </div>
  );
}

function Check() {
  return (
    <svg className="h-4 w-4 text-[var(--mint)] shrink-0" fill="none" viewBox="0 0 24 24">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  const pageRef = useReveal();

  return (
    <main ref={pageRef} className="relative overflow-hidden">
      {/* ═══════════════════════════════════════════════
          HERO — Full-bleed beach sunset gradient
          The journey starts here: "stuck" → "free"
      ═══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col">
        {/* Beach sunset background */}
        <div className="absolute inset-0 beach-gradient" />
        {/* Water shimmer effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 water-shimmer opacity-30" />
        {/* Warm glow overlay */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(251, 191, 36, 0.15), transparent 70%)" }} />

        {/* Nav */}
        <nav className="relative z-10 backdrop-blur-md bg-black/10">
          <div className={`${cx} flex items-center justify-between py-4`}>
            <a href="/" className="text-lg font-bold tracking-tight text-white">
              Quit<span className="text-[var(--golden)]">Sim</span>
            </a>
            <div className="hidden sm:flex items-center gap-8 text-sm text-white/70">
              <a href="#story" className="hover:text-white transition-colors">How It Works</a>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            </div>
            <a href="#waitlist" className="rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-white/25 hover:scale-105 active:scale-95">
              Get Early Access
            </a>
          </div>
        </nav>

        {/* Hero content */}
        <div className={`${cx} relative z-10 flex-1 flex flex-col lg:flex-row lg:items-center lg:gap-16 gap-12 pt-12 pb-20 lg:pt-0`}>
          <div className="flex-1 min-w-0">
            <div className="fade-up fade-up-1 mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--golden)] soft-pulse" />
              Coming soon to iOS
            </div>
            <h1 className="fade-up fade-up-2 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl xl:text-6xl text-white">
              Your Monday morning<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--golden)] to-white">could look like this.</span>
            </h1>
            <p className="fade-up fade-up-3 mt-5 max-w-lg text-lg text-white/70 leading-relaxed">
              QuitSim tells you the <strong className="text-white">exact month</strong> you could leave your job — stress-tested against market crashes, surprise bills, and bad luck. Find out in 60 seconds.
            </p>
            <div className="fade-up fade-up-4 mt-8">
              <WaitlistForm />
              <p className="mt-3 text-xs text-white/40">Free forever. No credit card. Your data never leaves your phone. 🤙</p>
            </div>
          </div>
          <div className="flex-shrink-0 fade-up fade-up-3">
            <PhoneFrame className="gentle-float">
              <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
                <span>9:41</span>
                <span className="flex gap-1"><span>5G</span><span>100%</span></span>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">Good morning ☀️</p>
                <p className="text-sm font-semibold text-white">The beach is calling your name 🏖️</p>
              </div>
              <ConfidenceGauge />
              <div className="rounded-2xl bg-[var(--mint)]/10 border border-[var(--mint)]/20 p-3 text-center fade-in-delayed">
                <p className="text-[10px] uppercase tracking-widest text-[var(--mint)] mb-1">🌅 Freedom Date</p>
                <p className="text-lg font-bold text-[var(--mint)]">March 2027</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">Monthly Runway</p>
                <RunwayBars />
              </div>
            </PhoneFrame>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-8 bounce-down">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/40">
            <path d="M12 5v14m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          STORY SECTION — Visual walkthrough of the app
          Scrolls from "stuck at desk" to "freedom"
      ═══════════════════════════════════════════════ */}
      <section id="story" className="bg-[var(--bg)]">
        {/* Quick stats bar */}
        <div className="border-y border-[var(--border)] bg-[var(--card)]">
          <div className={`${cx} grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-[var(--border)]`}>
            {[
              { number: "60s", label: "to your first result", emoji: "⚡" },
              { number: "500+", label: "scenarios stress-tested", emoji: "🎲" },
              { number: "100%", label: "private — on your phone", emoji: "🔒" },
              { number: "$0", label: "to find your quit date", emoji: "🎯" },
            ].map((stat) => (
              <div key={stat.label} className="py-6 md:py-8 px-4 text-center">
                <p className="text-2xl md:text-3xl font-extrabold text-white">{stat.number}</p>
                <p className="text-xs md:text-sm text-[var(--muted)] mt-1">{stat.emoji} {stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Step 1: The feeling ── */}
        <div className="py-20 md:py-28">
          <div className={cx} style={{ maxWidth: "1000px" }}>
            <div className="reveal text-center mb-16">
              <p className="text-[var(--sunset)] text-sm font-semibold tracking-wide uppercase mb-3">Sound familiar?</p>
              <h2 className="text-3xl font-bold sm:text-4xl leading-snug">
                Sunday night dread.<br />Spreadsheets at 2am.<br />
                <span className="text-[var(--muted)]">&ldquo;Maybe next year.&rdquo;</span>
              </h2>
              <p className="mt-4 text-[var(--muted)] text-lg max-w-lg mx-auto">
                You&apos;ve thought about quitting. Maybe every morning. But you don&apos;t know if you can actually afford it — and guessing feels terrifying.
              </p>
            </div>
          </div>
        </div>

        {/* ── Step 2: Enter your numbers (show onboarding) ── */}
        <div className="py-20 md:py-28 bg-[var(--card)]/50">
          <div className={cx} style={{ maxWidth: "1000px" }}>
            <div className="reveal grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <p className="text-[var(--sunset)] text-sm font-semibold tracking-wide uppercase mb-3">Step 1</p>
                <h2 className="text-3xl font-bold sm:text-4xl mb-4">Drop in your numbers.</h2>
                <p className="text-[var(--muted)] text-lg leading-relaxed mb-6">
                  Three things: what you earn, what you&apos;ve saved, what you spend. Takes 60 seconds. Ballpark is totally fine — no need to dig up bank statements.
                </p>
                <div className="space-y-3">
                  {[
                    { emoji: "💰", text: "How much you earn — your paycheck" },
                    { emoji: "🏦", text: "How much you've saved — bank, retirement, etc." },
                    { emoji: "📊", text: "How much you spend each month" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3 text-white/80">
                      <span className="text-xl">{item.emoji}</span>
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-[var(--muted)]">No account needed. No data leaves your phone. Ever.</p>
              </div>
              <div className="reveal" style={{ transitionDelay: "0.15s" }}>
                <PhoneFrame>
                  <div className="space-y-5 pt-2">
                    <p className="text-center text-3xl">💡</p>
                    <p className="text-center text-lg font-bold text-white">Could you afford<br/>to quit your job?</p>
                    <p className="text-center text-sm text-[#0EA5E9] font-semibold">Find out in 60 seconds — no sign-up needed.</p>
                    <div className="rounded-xl bg-[var(--card)] border border-[var(--border)] p-4 space-y-3">
                      <p className="text-sm text-white/70">We&apos;ll give you two things:</p>
                      <p className="text-sm text-white/70">📊 A readiness score</p>
                      <p className="text-sm text-white/70">📅 A target quit date</p>
                      <p className="text-sm text-white/70">🔮 Stress-tested against bad luck</p>
                    </div>
                    <div className="rounded-xl bg-[#0EA5E9] py-3 text-center">
                      <p className="text-sm font-bold text-white">Next</p>
                    </div>
                  </div>
                </PhoneFrame>
              </div>
            </div>
          </div>
        </div>

        {/* ── Step 3: Get your date (show dashboard) ── */}
        <div className="py-20 md:py-28">
          <div className={cx} style={{ maxWidth: "1000px" }}>
            <div className="reveal grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="order-2 md:order-1 reveal" style={{ transitionDelay: "0.15s" }}>
                <PhoneFrame>
                  <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
                    <span>9:41</span>
                    <span className="flex gap-1"><span>5G</span><span>100%</span></span>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)]">Good morning ☀️</p>
                    <p className="text-sm font-semibold text-white">Your freedom chapter is almost here</p>
                  </div>
                  <ConfidenceGauge />
                  <div className="rounded-2xl bg-[var(--mint)]/10 border border-[var(--mint)]/20 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--mint)] mb-1">🌅 Freedom Date</p>
                    <p className="text-lg font-bold text-[var(--mint)]">March 2027</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-[var(--card)] p-2 text-center">
                      <p className="text-lg font-bold text-white">24</p>
                      <p className="text-[9px] text-[var(--muted)]">Months covered</p>
                    </div>
                    <div className="rounded-lg bg-[var(--card)] p-2 text-center">
                      <p className="text-lg font-bold text-white">82%</p>
                      <p className="text-[9px] text-[var(--muted)]">&ldquo;What if&rdquo; score</p>
                    </div>
                  </div>
                </PhoneFrame>
              </div>
              <div className="order-1 md:order-2">
                <p className="text-[var(--sunset)] text-sm font-semibold tracking-wide uppercase mb-3">Step 2</p>
                <h2 className="text-3xl font-bold sm:text-4xl mb-4">Boom. Your Freedom Date.</h2>
                <p className="text-[var(--muted)] text-lg leading-relaxed mb-6">
                  Not a vague &ldquo;someday&rdquo; — an actual month on the calendar. Plus a confidence score that tells you how ready you really are, tested against hundreds of worst-case scenarios.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">🎯</span>
                    <div>
                      <p className="text-sm font-semibold text-white">Quit Readiness Score</p>
                      <p className="text-sm text-[var(--muted)]">0 to 100. Know exactly where you stand.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">🌅</span>
                    <div>
                      <p className="text-sm font-semibold text-white">Your Freedom Date</p>
                      <p className="text-sm text-[var(--muted)]">The earliest month you could walk away.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">🎲</span>
                    <div>
                      <p className="text-sm font-semibold text-white">Stress-Tested by Math</p>
                      <p className="text-sm text-[var(--muted)]">500+ randomized &ldquo;what if&rdquo; scenarios — market dips, surprise bills, bad timing.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Step 4: Play with What-Ifs (show simulator) ── */}
        <div className="py-20 md:py-28 bg-[var(--card)]/50">
          <div className={cx} style={{ maxWidth: "1000px" }}>
            <div className="reveal grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <p className="text-[var(--sunset)] text-sm font-semibold tracking-wide uppercase mb-3">Step 3</p>
                <h2 className="text-3xl font-bold sm:text-4xl mb-4">Play with &ldquo;what ifs.&rdquo;</h2>
                <p className="text-[var(--muted)] text-lg leading-relaxed mb-6">
                  What if you freelanced on the side? Cut $300/mo in expenses? Moved somewhere cheaper? Slide the numbers and watch your freedom date change in real time. It&apos;s kinda addicting.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">🔮</span>
                    <div>
                      <p className="text-sm font-semibold text-white">What-If Explorer</p>
                      <p className="text-sm text-[var(--muted)]">Adjust income, expenses, and risk with sliders.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">🔥</span>
                    <div>
                      <p className="text-sm font-semibold text-white">Daily Challenges</p>
                      <p className="text-sm text-[var(--muted)]">Small actions + streaks that actually move your quit date closer.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">🎪</span>
                    <div>
                      <p className="text-sm font-semibold text-white">Fun Mode</p>
                      <p className="text-sm text-[var(--muted)]">&ldquo;Win the Lottery&rdquo; and &ldquo;Van Life&rdquo; fantasy presets. Because why not.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="reveal" style={{ transitionDelay: "0.15s" }}>
                <PhoneFrame>
                  <div className="space-y-3">
                    <p className="text-base font-bold text-white">Simulate Your Quit</p>
                    {/* Sliders */}
                    <div className="rounded-xl bg-[var(--card)] p-3 space-y-4">
                      {[
                        { label: "Pay You Give Up", value: "100%", pct: 100 },
                        { label: "Money Coming In", value: "$2,000", pct: 25 },
                        { label: "New Costs", value: "$500", pct: 12 },
                      ].map((s) => (
                        <div key={s.label}>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-white/60">{s.label}</span>
                            <span className="text-white font-semibold">{s.value}</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#0EA5E9] rounded-full" style={{ width: `${s.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { val: "78%", label: "Ready" },
                        { val: "24", label: "Months" },
                        { val: "82%", label: "\"What if\"" },
                        { val: "Mar '27", label: "Target" },
                      ].map((s) => (
                        <div key={s.label} className="rounded-lg bg-[var(--card)] p-2 text-center">
                          <p className="text-sm font-bold text-white">{s.val}</p>
                          <p className="text-[8px] text-[var(--muted)]">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    {/* Mini runway chart */}
                    <RunwayBars />
                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <div className="flex-1 rounded-lg border border-white/10 py-2 text-center">
                        <p className="text-[11px] text-white">💾 Save Plan</p>
                      </div>
                      <div className="flex-1 rounded-lg border border-white/10 py-2 text-center">
                        <p className="text-[11px] text-white">📤 Share</p>
                      </div>
                    </div>
                  </div>
                </PhoneFrame>
              </div>
            </div>
          </div>
        </div>

        {/* ── The payoff: one-liner ── */}
        <div className="py-20 md:py-28 relative overflow-hidden">
          {/* Subtle warm gradient */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(249, 115, 22, 0.04), transparent 70%)" }} />
          <div className={`${cx} max-w-3xl relative`} style={{ maxWidth: "720px" }}>
            <div className="reveal text-center">
              <h2 className="text-3xl font-bold sm:text-4xl leading-snug">
                Stop Googling <em className="not-italic text-[var(--muted)]">&ldquo;can I afford to quit?&rdquo;</em><br />
                Start knowing <em className="not-italic bg-gradient-to-r from-[var(--sunset)] to-[var(--golden)] bg-clip-text text-transparent">&ldquo;I can quit in March.&rdquo;</em> 🌅
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SOCIAL PROOF — People like you
      ═══════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[var(--bg)]">
        <div className={cx}>
          <div className="reveal text-center mb-14">
            <h2 className="text-3xl font-bold sm:text-4xl">Real people. Real escape plans.</h2>
            <p className="mt-3 text-[var(--muted)] text-lg">Sound like anyone you know?</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6" style={{ maxWidth: "960px", margin: "0 auto" }}>
            {[
              {
                emoji: "👩‍💻",
                who: "Software dev, 31",
                dream: "Wants to leave big tech and build her own thing",
                score: "62%",
                date: "Nov 2027",
                insight: "3 more months of savings pushes her quit date forward a full year. Small moves, big payoff.",
              },
              {
                emoji: "📸",
                who: "Account manager, 28",
                dream: "Dreams of doing photography full-time",
                score: "41%",
                date: "Mar 2028",
                insight: "Part-time freelancing makes his plan 3x more resilient. Side hustles hit different.",
              },
              {
                emoji: "👩‍👧‍👦",
                who: "Marketing director, 37",
                dream: "Wants to be home with her kids, not commuting 2 hours",
                score: "78%",
                date: "Aug 2026",
                insight: "She was closer than she thought. One expense cut freed up 4 months.",
              },
            ].map((story, i) => (
              <div key={story.who} className="reveal rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 hover:border-[var(--sunset)]/20 transition-colors" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{story.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold">{story.who}</p>
                    <p className="text-xs text-[var(--muted)]">{story.dream}</p>
                  </div>
                </div>
                <div className="flex gap-3 mb-4">
                  <div className="rounded-lg bg-[var(--mint-dim)] border border-[var(--mint)]/20 px-3 py-2 text-center">
                    <p className="text-[10px] text-[var(--muted)]">Score</p>
                    <p className="text-xl font-bold text-[var(--mint)]">{story.score}</p>
                  </div>
                  <div className="rounded-lg bg-[var(--golden-dim)] border border-[var(--golden)]/20 px-3 py-2 text-center flex-1">
                    <p className="text-[10px] text-[var(--muted)]">Freedom Date</p>
                    <p className="text-lg font-bold text-[var(--golden)]">{story.date}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-white/[0.02] p-3">
                  <p className="text-xs text-[var(--muted)] leading-relaxed">💡 <span className="text-white/70">{story.insight}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURES GRID
      ═══════════════════════════════════════════════ */}
      <section id="features" className="py-20 md:py-28 bg-[var(--bg)]">
        <div className={cx}>
          <div className="reveal text-center mb-14">
            <h2 className="text-3xl font-bold sm:text-4xl">Everything you need to quit like a pro</h2>
            <p className="mt-3 text-[var(--muted)] text-lg">Think of it as a financial buddy who&apos;s really good at math.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" style={{ maxWidth: "960px", margin: "0 auto" }}>
            {[
              { emoji: "🌅", title: "Your Freedom Date", desc: "An actual month on the calendar. Watch it get closer as you make progress." },
              { emoji: "🎲", title: "500+ Stress Tests", desc: "Market dips, surprise bills, bad timing — we throw it all at your plan." },
              { emoji: "📊", title: "Month-by-Month Runway", desc: "See exactly how long your money lasts. Know the month it runs out — or doesn't." },
              { emoji: "🔮", title: "What-If Explorer", desc: "Slide income, expenses, and risk — watch your freedom date change live." },
              { emoji: "🔥", title: "Daily Challenges & Streaks", desc: "Small actions that actually move your quit date closer. Earn XP along the way." },
              { emoji: "🔒", title: "100% Private", desc: "Your data never leaves your phone. No accounts. No servers. No exceptions." },
            ].map((f, i) => (
              <div key={f.title} className="reveal group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-colors hover:border-[var(--sunset)]/20 hover:bg-[var(--card-hover)]" style={{ transitionDelay: `${i * 0.06}s` }}>
                <span className="text-3xl block mb-4 transition-transform group-hover:scale-110">{f.emoji}</span>
                <h3 className="text-base font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          PRICING
      ═══════════════════════════════════════════════ */}
      <section id="pricing" className="py-20 md:py-28 bg-[var(--bg)]">
        <div className={cx}>
          <div className="reveal text-center mb-14">
            <h2 className="text-3xl font-bold sm:text-4xl">Free to start. Upgrade when you&apos;re ready.</h2>
            <p className="mt-3 text-[var(--muted)] text-lg">Your quit date is free. Forever. No tricks.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6" style={{ maxWidth: "768px", margin: "0 auto" }}>
            <div className="reveal rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
              <h3 className="text-lg font-semibold">Free</h3>
              <p className="mt-1 text-3xl font-bold">$0<span className="text-base font-normal text-[var(--muted)]"> forever</span></p>
              <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
                {["Your quit date & confidence score", "What-if scenario explorer", "100 stress-test simulations", "3 saved plans", "Daily challenges & streaks 🔥", "100% on-device privacy"].map((item) => (
                  <li key={item} className="flex items-center gap-2"><Check />{item}</li>
                ))}
              </ul>
            </div>
            <div className="reveal relative rounded-2xl border border-[var(--sunset)]/30 bg-[var(--card)] p-8" style={{ transitionDelay: "0.1s" }}>
              <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-[var(--sunset)] to-[var(--golden)] px-3 py-0.5 text-xs font-semibold text-white">Best Value</span>
              <h3 className="text-lg font-semibold">Pro</h3>
              <p className="mt-1 text-3xl font-bold">$59<span className="text-base font-normal text-[var(--muted)]"> / year</span></p>
              <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
                {["Everything in Free", "500 stress-test simulations", "Unlimited saved plans", "Couples mode (dual income) 💑", "AI-powered insights", "PDF export & sharing"].map((item) => (
                  <li key={item} className="flex items-center gap-2"><Check />{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FINAL CTA — Beach gradient returns
      ═══════════════════════════════════════════════ */}
      <section id="waitlist" className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 beach-gradient-bottom" />
        <div className={`${cx} relative z-10`}>
          <div className="reveal rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-8 md:p-16 text-center" style={{ maxWidth: "768px", margin: "0 auto" }}>
            <h2 className="text-3xl font-bold sm:text-5xl leading-tight text-white">
              Your future self<br />will thank you. 🤙
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/60 text-lg">
              Find out when you can quit — for free. Be the first to know when QuitSim drops.
            </p>
            <div className="mt-8 flex justify-center">
              <WaitlistForm variant="large" />
            </div>
            <p className="mt-4 text-xs text-white/30">No spam, ever. Unsubscribe anytime. We&apos;re cool like that.</p>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-[var(--border)] bg-[var(--card)]">
        <div className={`${cx} flex flex-col items-center justify-between gap-4 py-8 sm:flex-row`}>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold tracking-tight">Quit<span className="text-[var(--golden)]">Sim</span></span>
            <span className="text-sm text-[var(--muted)]">&copy; 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-[var(--muted)]">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/support" className="hover:text-white transition-colors">Support</a>
            <a href="mailto:support@quitsim.it.com" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
