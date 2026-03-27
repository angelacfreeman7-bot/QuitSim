"use client";

import { useEffect, useRef, useCallback } from "react";

const APP_STORE_URL = "https://apps.apple.com/app/quitsim/id6761015566";

/* ── Scroll reveal hook ── */
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
    const observer = new IntersectionObserver(handleIntersect, { threshold: 0.15, rootMargin: "-40px" });
    ref.current?.querySelectorAll(".reveal").forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [handleIntersect]);
  return ref;
}

/* ── Phone mockup ── */
function PhoneFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative mx-auto ${className}`} style={{ width: 280 }}>
      <div style={{ borderRadius: 40, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", padding: 12, boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}>
        <div style={{ margin: "0 auto 12px", height: 20, width: 112, borderRadius: 9999, background: "rgba(0,0,0,0.2)" }} />
        <div style={{ borderRadius: 32, overflow: "hidden", background: "#FFFBF7", padding: 20, minHeight: 380, display: "flex", flexDirection: "column", gap: 16 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Animated gauge ── */
function ConfidenceGauge() {
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <svg width="180" height="110" viewBox="0 0 200 120">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="50%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <path d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="12" strokeLinecap="round" />
        <path d="M20 110 A80 80 0 0 1 180 110" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round" className="gauge-arc" />
      </svg>
      <div style={{ position: "absolute", bottom: 0, textAlign: "center" }}>
        <span className="fade-in-delayed" style={{ display: "block", fontSize: 28, fontWeight: 700, color: "#34d399" }}>78%</span>
        <span style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#A8A29E" }}>Quit Ready</span>
      </div>
    </div>
  );
}

/* ── Runway bars ── */
function RunwayBars() {
  const bars = [85, 80, 74, 68, 61, 53, 44, 34, 22, 10];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 64 }}>
      {bars.map((h, i) => (
        <div
          key={i}
          className="bar-grow"
          style={{
            width: 14,
            height: `${h}%`,
            borderRadius: "2px 2px 0 0",
            background: i > 6 ? "linear-gradient(to top, #f87171, #FBBF24)" : "linear-gradient(to top, #34d399, #2DD4BF)",
            opacity: i > 7 ? 0.4 : 0.8,
            animationDelay: `${0.8 + i * 0.06}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const pageRef = useReveal();

  return (
    <div ref={pageRef} style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #0a1628, #0C0A09 30%)", color: "#fff" }}>

      {/* ═══ AMBIENT BACKGROUND GLOWS ═══ */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "20%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "#FBBF24", opacity: 0.03, filter: "blur(120px)" }} />
        <div style={{ position: "absolute", top: "60%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "#0EA5E9", opacity: 0.03, filter: "blur(100px)" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "30%", width: 450, height: 450, borderRadius: "50%", background: "#F97316", opacity: 0.025, filter: "blur(120px)" }} />
      </div>

      {/* ═══ STICKY NAV ═══ */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50, background: "rgba(0,0,0,0.2)" }}>
        <div className="site-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, paddingBottom: 16 }}>
          <a href="/" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", textDecoration: "none", color: "#fff" }}>
            Quit<span style={{ color: "#FBBF24" }}>Sim</span>
          </a>
          <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a href="#how" style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>How It Works</a>
            <a href="#features" style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Features</a>
            <a href="#pricing" style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Pricing</a>
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ borderRadius: 16, padding: "12px 20px", background: "#fff", color: "#000", fontWeight: 500, textDecoration: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
            >
              Download Free
            </a>
          </nav>
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 10 }}>

        {/* ═══ HERO ═══ */}
        <section style={{ position: "relative", overflow: "hidden" }}>
          <div className="beach-gradient" style={{ position: "absolute", inset: 0 }} />
          <div className="water-shimmer" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "33%", opacity: 0.2 }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(251,191,36,0.12), transparent 70%)" }} />

          <div className="site-container" style={{ position: "relative", paddingTop: 112, paddingBottom: 112 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
              <div>
                <div className="fade-up fade-up-1" style={{ display: "inline-flex", alignItems: "center", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", padding: "8px 16px", fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 32 }}>
                  <span className="soft-pulse" style={{ height: 6, width: 6, borderRadius: "50%", background: "#34d399", marginRight: 8 }} />
                  Available on iOS
                </div>
                <h1 className="fade-up fade-up-2" style={{ fontSize: 56, fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                  When could you{" "}
                  <span style={{ color: "#FBBF24" }}>quit your job?</span>
                </h1>
                <p className="fade-up fade-up-3" style={{ marginTop: 24, fontSize: 18, color: "rgba(255,255,255,0.7)", maxWidth: 480, lineHeight: 1.8 }}>
                  QuitSim tells you the <strong style={{ color: "#fff" }}>exact month</strong> you could leave — stress-tested against market crashes, surprise bills, and bad luck. Find out in 60 seconds.
                </p>
                <div className="fade-up fade-up-4" style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: 16 }}>
                  <a
                    href={APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ borderRadius: 16, padding: "16px 28px", background: "#fff", color: "#000", fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
                  >
                    Download Free
                  </a>
                  <a
                    href="#how"
                    style={{ borderRadius: 16, padding: "16px 28px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", textDecoration: "none", color: "#fff" }}
                  >
                    See How It Works
                  </a>
                </div>
                <p className="fade-up fade-up-5" style={{ marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Free forever. No credit card. Your data never leaves your phone.</p>
              </div>

              <div className="fade-up fade-up-3">
                <div style={{ position: "relative" }}>
                  <PhoneFrame className="gentle-float">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, color: "#A8A29E" }}>
                      <span>9:41</span>
                      <span style={{ display: "flex", gap: 4 }}><span>5G</span><span>100%</span></span>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: "#A8A29E" }}>Good morning ☀️</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1917" }}>The beach is calling your name 🏖️</p>
                    </div>
                    <ConfidenceGauge />
                    <div style={{ borderRadius: 16, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", padding: 12, textAlign: "center" }} className="fade-in-delayed">
                      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#10B981", marginBottom: 4 }}>🌅 Freedom Date</p>
                      <p style={{ fontSize: 18, fontWeight: 700, color: "#10B981" }}>March 2027</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#A8A29E", marginBottom: 8 }}>Monthly Runway</p>
                      <RunwayBars />
                    </div>
                  </PhoneFrame>
                  <div style={{ position: "absolute", inset: -32, zIndex: -1, borderRadius: "50%", background: "rgba(251,191,36,0.08)", filter: "blur(48px)" }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section id="how" className="site-container" style={{ paddingTop: 120, paddingBottom: 120 }}>
          <div style={{ borderRadius: 32, border: "1px solid rgba(255,255,255,0.1)", background: "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))", padding: "64px" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.25em", color: "rgba(251,191,36,0.8)" }}>Simple and powerful</div>
              <h2 style={{ marginTop: 16, fontSize: 36, fontWeight: 600 }}>How it works</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 48 }}>
              {[
                { step: "1", title: "Drop in your numbers", desc: "Three things: what you earn, what you've saved, what you spend. Takes 60 seconds. Ballpark is totally fine." },
                { step: "2", title: "Get your freedom date", desc: "We run 500 stress-test simulations — market dips, surprise bills, bad timing — and give you an exact month." },
                { step: "3", title: "Explore what-ifs", desc: "What if you freelanced? Cut expenses? Moved cities? Slide the numbers and watch your freedom date change live." },
              ].map((item) => (
                <div key={item.step} style={{ textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <span style={{ color: "#FBBF24", fontWeight: 700, fontSize: 20 }}>{item.step}</span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{item.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ THE FEELING ═══ */}
        <section style={{ maxWidth: 640, margin: "0 auto", paddingLeft: 48, paddingRight: 48, paddingTop: 80, paddingBottom: 80 }}>
          <div className="reveal" style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 36, fontWeight: 600, lineHeight: 1.3 }}>
              Sunday night dread. Spreadsheets at 2am.{" "}
              <span style={{ color: "rgba(255,255,255,0.4)" }}>&ldquo;Maybe next year.&rdquo;</span>
            </h2>
            <p style={{ marginTop: 32, color: "rgba(255,255,255,0.6)", fontSize: 18, lineHeight: 1.8 }}>
              You&apos;ve thought about quitting. Maybe every morning. But you don&apos;t know if you can actually afford it — and guessing feels terrifying.
            </p>
            <p style={{ marginTop: 20, fontSize: 18, fontWeight: 600, color: "#FBBF24" }}>
              QuitSim replaces the guessing with math.
            </p>
          </div>
        </section>

        {/* ═══ APP WALKTHROUGH ═══ */}
        <section className="site-container" style={{ paddingTop: 80, paddingBottom: 80 }}>
          {/* Step: Enter numbers */}
          <div className="reveal" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 96, alignItems: "center", marginBottom: 128 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", borderRadius: 9999, border: "1px solid rgba(14,165,233,0.2)", background: "rgba(14,165,233,0.1)", padding: "8px 16px", fontSize: 14, color: "#0EA5E9", marginBottom: 24 }}>
                60 seconds
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 600, marginBottom: 20 }}>Three sliders. That&apos;s it.</h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, lineHeight: 1.8, marginBottom: 32 }}>
                Your salary, your savings, your monthly spending. No bank logins, no account linking, no 20-field forms. Just drag and go.
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
                {["💰 How much you earn", "🏦 How much you've saved", "📊 How much you spend each month"].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.7)", fontSize: 18 }}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="reveal" style={{ transitionDelay: "0.15s" }}>
              <PhoneFrame>
                <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 8 }}>
                  <p style={{ textAlign: "center", fontSize: 28 }}>🏖️</p>
                  <p style={{ textAlign: "center", fontSize: 18, fontWeight: 700, color: "#1C1917" }}>When could you<br/>quit your job?</p>
                  <div style={{ borderRadius: 12, background: "#fff", border: "1px solid #E7E5E4", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { label: "Yearly salary", value: "$85,000", pct: 50 },
                      { label: "Total savings", value: "$30,000", pct: 30 },
                      { label: "Monthly spend", value: "$3,500", pct: 40 },
                    ].map((s) => (
                      <div key={s.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                          <span style={{ color: "rgba(28,25,23,0.6)" }}>{s.label}</span>
                          <span style={{ color: "#1C1917", fontWeight: 600 }}>{s.value}</span>
                        </div>
                        <div style={{ height: 6, background: "rgba(28,25,23,0.05)", borderRadius: 9999, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: "#0EA5E9", borderRadius: 9999, width: `${s.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderRadius: 12, background: "#0EA5E9", padding: "12px 0", textAlign: "center" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Show My Results</p>
                  </div>
                </div>
              </PhoneFrame>
            </div>
          </div>

          {/* Step: See results */}
          <div className="reveal" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 96, alignItems: "center" }}>
            <div className="reveal" style={{ transitionDelay: "0.15s" }}>
              <PhoneFrame>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, color: "#A8A29E" }}>
                  <span>9:41</span>
                  <span style={{ display: "flex", gap: 4 }}><span>5G</span><span>100%</span></span>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "#A8A29E" }}>Good morning ☀️</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1917" }}>Your freedom chapter is almost here</p>
                </div>
                <ConfidenceGauge />
                <div style={{ borderRadius: 16, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", padding: 12, textAlign: "center" }}>
                  <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#10B981", marginBottom: 4 }}>🌅 Freedom Date</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#10B981" }}>March 2027</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ borderRadius: 8, background: "#fff", padding: 8, textAlign: "center", border: "1px solid #E7E5E4" }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "#1C1917" }}>24</p>
                    <p style={{ fontSize: 9, color: "#A8A29E" }}>Months covered</p>
                  </div>
                  <div style={{ borderRadius: 8, background: "#fff", padding: 8, textAlign: "center", border: "1px solid #E7E5E4" }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "#1C1917" }}>82%</p>
                    <p style={{ fontSize: 9, color: "#A8A29E" }}>&ldquo;What if&rdquo; score</p>
                  </div>
                </div>
              </PhoneFrame>
            </div>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", borderRadius: 9999, border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.1)", padding: "8px 16px", fontSize: 14, color: "#10B981", marginBottom: 24 }}>
                Your results
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 600, marginBottom: 20 }}>Your freedom date. For real.</h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, lineHeight: 1.8, marginBottom: 32 }}>
                Not a vague &ldquo;someday&rdquo; — an actual month on the calendar. Plus a confidence score stress-tested against hundreds of worst-case scenarios.
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { icon: "🎯", title: "Quit Readiness Score", desc: "0 to 100. Know exactly where you stand." },
                  { icon: "🌅", title: "Your Freedom Date", desc: "The earliest month you could walk away." },
                  { icon: "🎲", title: "500 Stress Tests", desc: "Market dips, surprise bills, bad timing — all simulated." },
                ].map((item) => (
                  <li key={item.title} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <span style={{ fontSize: 24, marginTop: 2 }}>{item.icon}</span>
                    <div>
                      <p style={{ fontWeight: 600 }}>{item.title}</p>
                      <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ═══ TRANSITION LINE ═══ */}
        <section style={{ maxWidth: 640, margin: "0 auto", paddingLeft: 48, paddingRight: 48, paddingTop: 96, paddingBottom: 96 }}>
          <div className="reveal" style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 36, fontWeight: 600, lineHeight: 1.3 }}>
              Stop Googling <span style={{ color: "rgba(255,255,255,0.4)" }}>&ldquo;can I afford to quit?&rdquo;</span>
              <br />
              Start knowing{" "}
              <span style={{ backgroundImage: "linear-gradient(to right, #F97316, #FBBF24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                &ldquo;I can quit in March.&rdquo;
              </span>{" "}
              🌅
            </h2>
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section id="features" className="site-container" style={{ paddingTop: 96, paddingBottom: 96 }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: 32, fontWeight: 600 }}>Everything you need to quit like a pro</h2>
            <p style={{ marginTop: 16, color: "rgba(255,255,255,0.6)", fontSize: 18 }}>Think of it as a financial buddy who&apos;s really good at math.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { emoji: "🌅", title: "Your Freedom Date", desc: "An actual month on the calendar. Watch it get closer as you make progress.", gradient: "linear-gradient(135deg, #F97316, #FBBF24)" },
              { emoji: "🎲", title: "500 Stress Tests", desc: "Market dips, surprise bills, bad timing — we throw it all at your plan.", gradient: "linear-gradient(135deg, #0EA5E9, #14B8A6)" },
              { emoji: "📊", title: "Month-by-Month Runway", desc: "See exactly how long your money lasts. Know the month it runs out — or doesn't.", gradient: "linear-gradient(135deg, #10B981, #34d399)" },
              { emoji: "🔮", title: "What-If Explorer", desc: "Slide income, expenses, and risk — watch your freedom date change live.", gradient: "linear-gradient(135deg, #8B5CF6, #0EA5E9)" },
              { emoji: "🔥", title: "Daily Challenges", desc: "Small actions + streaks that actually move your quit date closer. Earn XP.", gradient: "linear-gradient(135deg, #EF4444, #F97316)" },
              { emoji: "🔒", title: "100% Private", desc: "Your data never leaves your phone. No accounts. No servers. No exceptions.", gradient: "linear-gradient(135deg, #6B7280, #A8A29E)" },
            ].map((f, i) => (
              <div
                key={f.title}
                className="reveal glass-card"
                style={{ borderRadius: 32, padding: 32, transitionDelay: `${i * 0.06}s` }}
              >
                <div style={{ height: 48, width: 48, borderRadius: 12, background: f.gradient, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, fontSize: 20 }}>
                  {f.emoji}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 600 }}>{f.title}</h3>
                <p style={{ marginTop: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ SOCIAL PROOF ═══ */}
        <section className="site-container" style={{ paddingTop: 96, paddingBottom: 96 }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: 32, fontWeight: 600 }}>Sound like anyone you know?</h2>
            <p style={{ marginTop: 16, color: "rgba(255,255,255,0.6)", fontSize: 18 }}>See how different people use QuitSim.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { emoji: "👩‍💻", who: "Software dev, 31", dream: "Wants to leave big tech and build her own thing", score: "62%", date: "Nov 2027", insight: "3 more months of savings pushes her quit date forward a full year." },
              { emoji: "📸", who: "Account manager, 28", dream: "Dreams of doing photography full-time", score: "41%", date: "Mar 2028", insight: "Part-time freelancing makes his plan 3x more resilient." },
              { emoji: "👩‍👧‍👦", who: "Marketing director, 37", dream: "Wants to be home with her kids", score: "78%", date: "Aug 2026", insight: "She was closer than she thought. One expense cut freed up 4 months." },
            ].map((story, i) => (
              <div key={story.who} className="reveal glass-card" style={{ borderRadius: 32, padding: 32, transitionDelay: `${i * 0.1}s` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <span style={{ fontSize: 36 }}>{story.emoji}</span>
                  <div>
                    <p style={{ fontWeight: 600 }}>{story.who}</p>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{story.dream}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                  <div style={{ borderRadius: 12, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", padding: "12px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Score</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: "#34d399" }}>{story.score}</p>
                  </div>
                  <div style={{ borderRadius: 12, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", padding: "12px 16px", textAlign: "center", flex: 1 }}>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Freedom Date</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: "#FBBF24" }}>{story.date}</p>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>💡 <span style={{ color: "rgba(255,255,255,0.7)" }}>{story.insight}</span></p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ PRICING ═══ */}
        <section id="pricing" style={{ maxWidth: 768, margin: "0 auto", paddingLeft: 48, paddingRight: 48, paddingTop: 96, paddingBottom: 96 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 600 }}>Free to start. Upgrade when you&apos;re ready.</h2>
            <p style={{ marginTop: 16, color: "rgba(255,255,255,0.6)", fontSize: 18 }}>Your quit date is free. Forever. No tricks.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div className="reveal glass-card" style={{ borderRadius: 32, padding: 36 }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Free</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16, color: "rgba(255,255,255,0.7)" }}>
                {["Your quit date & confidence score", "What-if scenario explorer", "100 stress-test simulations", "3 saved plans", "Daily challenges & streaks 🔥", "100% on-device privacy"].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#34d399" }}>✓</span>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal" style={{ borderRadius: 32, border: "2px solid rgba(251,191,36,0.3)", background: "linear-gradient(to bottom, rgba(251,191,36,0.05), transparent)", padding: 36, transitionDelay: "0.1s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ fontSize: 20, fontWeight: 600 }}>Pro</h3>
                <div style={{ fontSize: 14, color: "#FBBF24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 9999, padding: "4px 12px" }}>Best Value</div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>$59<span style={{ fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.4)" }}> / year</span></p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16, color: "rgba(255,255,255,0.7)" }}>
                {["Everything in Free", "500 stress-test simulations", "Unlimited saved plans", "Couples mode (dual income) 💑", "AI-powered insights", "PDF export & sharing"].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#FBBF24" }}>✓</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section style={{ maxWidth: 640, margin: "0 auto", paddingLeft: 48, paddingRight: 48, paddingTop: 96, paddingBottom: 128 }}>
          <div className="reveal glass-card" style={{ borderRadius: 32, padding: 64, textAlign: "center" }}>
            <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.25em", color: "rgba(251,191,36,0.8)" }}>Available Now</div>
            <h2 style={{ marginTop: 20, fontSize: 36, fontWeight: 600 }}>
              Your future self will thank you.
            </h2>
            <p style={{ marginTop: 20, color: "rgba(255,255,255,0.6)", fontSize: 18, lineHeight: 1.8, maxWidth: 420, margin: "20px auto 0" }}>
              Find out when you can quit — for free. Download QuitSim now.
            </p>
            <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ borderRadius: 16, padding: "16px 32px", background: "#fff", color: "#000", fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
              >
                Download Free
              </a>
            </div>
            <p style={{ marginTop: 20, fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
              Free forever. No credit card. Your data never leaves your phone.
            </p>
          </div>
        </section>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ position: "relative", zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="site-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 40, paddingBottom: 40, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Quit<span style={{ color: "#FBBF24" }}>Sim</span></span>
            <span>&copy; 2026</span>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            <a href="/privacy" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Privacy</a>
            <a href="/terms" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Terms</a>
            <a href="/support" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Support</a>
            <a href="mailto:support@quitsim.it.com" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
