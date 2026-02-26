"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getColors, fonts } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { Btn, Ctn, Mono, Hdr, Logo, Ftr, ThemeToggle, Icons } from "@/components/ui";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = getColors(theme === "dark");
  const d = theme === "dark";
  const { user } = useAuth();
  const isIn = !!user;

  // Typing effect
  const [heroTyped, setHT] = useState("");
  const [showCur, setSC] = useState(true);
  const fullTxt = "Clarified.";
  useEffect(() => { let i = 0; const iv = setInterval(() => { if (i <= fullTxt.length) { setHT(fullTxt.slice(0, i)); i++; } else clearInterval(iv); }, 90); return () => clearInterval(iv); }, []);
  useEffect(() => { const iv = setInterval(() => setSC((p) => !p), 530); return () => clearInterval(iv); }, []);

  // Intersection observer
  const [vis, setVis] = useState(new Set(["hero"]));
  const refs = useRef<Record<string, HTMLElement | null>>({});
  useEffect(() => {
    const ob = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) { const s = (e.target as HTMLElement).dataset.s; if (s) setVis((p) => new Set([...p, s])); } }); }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    Object.values(refs.current).forEach((r) => { if (r) ob.observe(r); });
    return () => ob.disconnect();
  }, []);
  const isV = (s: string) => vis.has(s);



  // Feature hover
  const [hovFeat, setHF] = useState<number | null>(null);

  // Testimonials
  const [actTest, setAT] = useState(0);
  useEffect(() => { const iv = setInterval(() => setAT((p) => (p + 1) % 3), 5000); return () => clearInterval(iv); }, []);
  const tests = [
    { nm: "Sophie L.", rl: "Law Applicant, UCL", tx: "Went from 58% to 81% in two weeks. The mock tests are genuinely harder than the real thing — which is exactly what you want." },
    { nm: "James K.", rl: "Graduate Scheme, Deloitte", tx: "The analytics showed me I was weakest in Assumptions. Focused there for a day and jumped 15 percentage points overall." },
    { nm: "Priya M.", rl: "Trainee Solicitor, Clifford Chance", tx: "£2 for six hours is absurd value. I used it the night before my assessment and felt completely prepared." },
  ];

  // Demo
  const [demoIdx, setDI] = useState(0);
  const [demoAns, setDA] = useState<number | null>(null);
  const [demoSub, setDS] = useState(false);
  const demos = [
    { section: "Inference", label: "statement", passage: "Campus Coffee recently changed its loyalty scheme: customers now need to buy nine drinks to get one free, up from seven previously. The manager claims this change was necessary due to rising coffee bean costs. Despite the less generous scheme, sales volume has remained consistent. The manager believes this is because Campus Coffee is the only café within a ten-minute walk of the main lecture theatres.", question: "If a new café opened next door, Campus Coffee's sales would likely decrease.", options: ["True", "Probably True", "Insufficient Data", "Probably False", "False"], correct: 1, explanation: 'The manager attributes the consistent sales (despite the worse loyalty scheme) to the fact that it is the "only café within a ten-minute walk." This implies a monopoly on convenience. Therefore, it is reasonable to infer that if a competitor opened "next door", customers unhappy with the new scheme would switch, causing sales to decrease.' },
    { section: "Assumptions", label: "assumption", passage: "The Protestant Reformation would never have succeeded without the invention of the Gutenberg printing press. The rapid dissemination of Luther's 95 Theses allowed ideas to travel faster than the Church could suppress them.", question: "The content of Luther's ideas was less important than the speed of their distribution.", options: ["Assumption Made", "Assumption Not Made"], correct: 1, explanation: 'The author says the printing press was a necessary condition ("never have succeeded without"), but they don\'t say it was the only important thing. Luther\'s ideas still had to be appealing; the press just ensured they actually reached the people.' },
    { section: "Deduction", label: "conclusion", passage: "Citizens must be 18 years of age or older to vote in the upcoming referendum. Michael is currently 17 years old.", question: "Had Michael been 19 years of age, he would be eligible to vote in the referendum.", options: ["Conclusion Follows", "Conclusion Does Not Follow"], correct: 1, explanation: 'The text lists two requirements for voting: 1) Age (18+) AND 2) Citizenship ("Citizens must be..."). If Michael were 19, he would meet the age requirement. However, the text does not tell us if Michael is a citizen.' },
    { section: "Interpretation", label: "interpretation", passage: "Between 2015 and 2023, the number of electric car charging stations in the country increased from 2,000 to 48,000. During the same period, electric car sales rose from 50,000 to 1.2 million per year.", question: "In 2015, there were fewer electric car charging stations than there are today.", options: ["Conclusion Follows", "Conclusion Does Not Follow"], correct: 0, explanation: "The passage states there were 2,000 stations in 2015 and 48,000 by 2023. Since the data goes up to 2023 and the trend is upward, it follows beyond a reasonable doubt that the 2015 figure is lower than the current number." },
    { section: "Arguments", label: "argument", passage: "Should the death penalty be abolished globally?", question: "No; we have a prison system where convicted murderers are provided with free healthcare, gym access, and three hot meals a day, while many law-abiding citizens struggle to afford basic necessities.", options: ["Strong Argument", "Weak Argument"], correct: 1, explanation: "This argument is weak because it diverts attention from the core ethical and legal question about the appropriateness of the death penalty to an unrelated issue about prison conditions and social inequality, making it a red herring." },
  ];
  const demoQ = demos[demoIdx];
  const switchDemo = (i: number) => { setDI(i); setDA(null); setDS(false); };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, transition: "background .4s, color .4s" }}>
      <div style={{ position: "relative", overflow: "hidden" }}>

        {/* HEADER */}
        <Hdr
          left={<Logo onClick={() => router.push("/")} />}
          right={<>
            <Btn v="ghost" sz="sm" onClick={() => router.push("/pricing")}>Pricing</Btn>
            <ThemeToggle />
            <Btn sz="sm" onClick={() => router.push(isIn ? "/dashboard" : "/login")}>{isIn ? "Dashboard" : "Login"}</Btn>
          </>}
        />

        {/* HERO */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 28px 50px", position: "relative" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 480, height: 480, opacity: 0.035, backgroundImage: `linear-gradient(${c.ac} 1px,transparent 1px),linear-gradient(90deg,${c.ac} 1px,transparent 1px)`, backgroundSize: "48px 48px", transform: "rotate(12deg)" }} />
          <div style={{ position: "absolute", top: 60, right: "12%", width: 260, height: 260, background: `radial-gradient(circle,${c.ac}11 0%,transparent 70%)`, borderRadius: "50%", filter: "blur(40px)", animation: "float 6s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={{ maxWidth: 700, position: "relative", zIndex: 2, margin: "0 auto", textAlign: "center" }}>
            <h1 style={{ fontSize: "clamp(44px,7vw,78px)", fontWeight: 700, lineHeight: 1.02, letterSpacing: "-.035em", marginBottom: 26, animation: "fu .8s ease both" }}>
              Thinking,<br />
              <span style={{ color: c.ac, position: "relative", display: "inline" }}>
                {heroTyped}
                <span style={{ display: "inline-block", width: 3, height: ".85em", background: c.ac, marginLeft: 2, verticalAlign: "baseline", opacity: showCur ? 1 : 0, transition: "opacity .1s" }} />
                {heroTyped.length >= fullTxt.length && (
                  <svg style={{ position: "absolute", bottom: -6, left: 0, width: "100%", overflow: "visible" }} viewBox="0 0 240 12" fill="none">
                    <path d="M2 9 Q60 -2 120 6 T238 5" stroke={c.ac} strokeWidth="2.5" fill="none" opacity=".5" strokeLinecap="round">
                      <animate attributeName="stroke-dasharray" from="0 500" to="500 500" dur="0.8s" fill="freeze" />
                    </path>
                  </svg>
                )}
              </span>
            </h1>
            <p style={{ fontSize: "clamp(16px,2.2vw,20px)", lineHeight: 1.7, color: c.fgS, maxWidth: 520, margin: "0 auto 44px", animation: "fu 1s ease both" }}>
              1,500+ Watson-Glaser style questions. <span style={{ color: c.ac, fontWeight: 700 }}>£2</span>.*
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", animation: "fu 1.2s ease both" }}>
              <Btn sz="lg" onClick={() => router.push(isIn ? "/pricing" : "/login")} style={{ padding: "16px 32px", fontSize: 16 }}>Start from £1.99 {Icons.arr}</Btn>
              <Btn v="outline" sz="lg" onClick={() => router.push(isIn ? "/dashboard" : "/login")} style={{ padding: "16px 28px", fontSize: 16 }}>{isIn ? "Dashboard" : "Login"}</Btn>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 44, justifyContent: "center", animation: "fu 1.4s ease both" }}>
              <div style={{ display: "flex" }}>
                {["#6366F1", "#EC4899", "#F59E0B", "#10B981"].map((cl, i) => (
                  <div key={i} style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${cl},${cl}88)`, border: `2px solid ${c.bg}`, marginLeft: i > 0 ? -9 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                    {["S", "J", "P", "A"][i]}
                  </div>
                ))}
              </div>
              <div>
                <span style={{ fontSize: 12.5, color: c.mt }}>Trusted by </span>
                <Mono style={{ fontSize: 12.5, color: c.ac, fontWeight: 700 }}>2,400+</Mono>
                <span style={{ fontSize: 12.5, color: c.mt }}> candidates across the UK</span>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section ref={(el) => { refs.current.features = el; }} data-s="features" style={{ maxWidth: 1100, margin: "0 auto", padding: "50px 28px 50px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,32px)", fontWeight: 700, letterSpacing: "-.02em", marginBottom: 10 }}>Everything you need to prepare</h2>
            <p style={{ color: c.mt, fontSize: 15, maxWidth: 480, margin: "0 auto" }}>Designed by lawyers and trainees who&apos;ve been in your shoes.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
            {[
              { ic: Icons.book(c.ac), t: "Three Modes", d: "Learning Mode for instant feedback. Practice Mode for the night before the test. Test Mode to prove that you got this." },
              { ic: Icons.zap(c.ac), t: "Best Value", d: null, hl: true },
              { ic: Icons.bar(c.ac), t: "Performance Tracking", d: "Compare your results against global averages and track your improvement over time." },
            ].map((f, i) => {
              const isH = hovFeat === i;
              return (
                <div key={i} onMouseEnter={() => setHF(i)} onMouseLeave={() => setHF(null)}
                  style={{
                    padding: 30, background: c.card, borderRadius: 16,
                    border: `1.5px solid ${isH ? c.ac + "66" : c.bd}`,
                    transition: "all .35s cubic-bezier(.16,1,.3,1)",
                    transform: isH ? "translateY(-6px)" : "translateY(0)",
                    boxShadow: isH ? `0 20px 60px ${c.ac}0D` : "none",
                    opacity: isV("features") ? 1 : 0,
                    transitionDelay: `${i * 0.12}s`,
                  }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: isH ? c.ac : c.acS, color: isH ? c.acF : c.ac,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 18, transition: "all .35s",
                  }}>{f.ic}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, letterSpacing: "-.01em" }}>{f.t}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: c.fgS }}>
                    {f.hl ? <>Unlock 1,500+ official-style questions for just <span style={{ color: c.ac, fontWeight: 700 }}>£2</span>. No subscriptions.</> : f.d}
                  </p>
                </div>
              );
            })}
          </div>
        </section>



        {/* DEMO */}
        <section ref={(el) => { refs.current.demo = el; }} data-s="demo" style={{ maxWidth: 1100, margin: "0 auto", padding: "50px 28px 50px" }}>
          <div style={{ opacity: isV("demo") ? 1 : 0, transform: isV("demo") ? "translateY(0)" : "translateY(30px)", transition: "all .8s cubic-bezier(.16,1,.3,1)" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <h2 style={{ fontSize: "clamp(24px,3.5vw,32px)", fontWeight: 700, letterSpacing: "-.02em", marginBottom: 10, }}>See how it works</h2>
              <p style={{ color: c.mt, fontSize: 15 }}>Try a question from each of the five Watson-Glaser sections.</p>
            </div>

            {/* Section tabs */}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
              {demos.map((dm, i) => (
                <button key={i} onClick={() => switchDemo(i)} style={{
                  padding: "8px 16px", borderRadius: 100, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                  border: "none", fontFamily: fonts.b, transition: "all .25s",
                  background: i === demoIdx ? c.ac : c.mtBg,
                  color: i === demoIdx ? c.acF : c.mt,
                  boxShadow: i === demoIdx ? `0 2px 12px ${c.ac}30` : "none",
                  transform: i === demoIdx ? "scale(1.05)" : "scale(1)",
                }}>{dm.section}</button>
              ))}
            </div>

            {/* iOS-style demo card */}
            <div style={{ maxWidth: 780, margin: "0 auto", background: c.card, borderRadius: 18, border: `1px solid ${c.bd}`, overflow: "hidden", boxShadow: c.shL }}>
              {/* Title bar */}
              <div style={{ padding: "11px 18px", borderBottom: `1px solid ${c.bd}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {[c.rd, c.ac, c.gn].map((cl, j) => <div key={j} style={{ width: 8, height: 8, borderRadius: "50%", background: cl, opacity: 0.5 }} />)}
                </div>
                <Mono style={{ fontSize: 11, color: c.mt }}>{demoQ.section.toLowerCase()} — demo</Mono>
                <span style={{ padding: "3px 10px", borderRadius: 100, background: c.acS, fontSize: 11, fontWeight: 600, color: c.ac }}>{demoQ.section}</span>
              </div>

              {/* Split panel */}
              <div key={demoIdx} style={{ display: "flex", flexWrap: "wrap", animation: "fu .35s ease both" }}>
                {/* Left: Passage */}
                <div style={{ flex: "1 1 300px", padding: 26, borderRight: `1px solid ${c.bd}`, background: `${c.bg}88` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c.mt, textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 10 }}>
                    {demoQ.section === "Arguments" ? "Proposition" : "Passage"}
                  </span>
                  <p style={{ fontSize: 14, lineHeight: 1.85, opacity: 0.85 }}>{demoQ.passage}</p>
                </div>

                {/* Right: Question + options */}
                <div style={{ flex: "1 1 300px", padding: 26 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c.mt, textTransform: "uppercase", letterSpacing: ".08em", display: "block", marginBottom: 10 }}>
                    {demoQ.label.charAt(0).toUpperCase() + demoQ.label.slice(1)}
                  </span>
                  <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5, marginBottom: 18 }}>&ldquo;{demoQ.question}&rdquo;</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {demoQ.options.map((o, i) => {
                      let bg = "transparent", bd = c.bd;
                      if (demoSub) {
                        if (i === demoQ.correct) { bg = c.gn + "18"; bd = c.gn; }
                        else if (i === demoAns && i !== demoQ.correct) { bg = c.rd + "18"; bd = c.rd; }
                      } else if (i === demoAns) { bg = c.acS; bd = c.ac; }
                      return (
                        <button key={i} onClick={() => !demoSub && setDA(i)} style={{
                          padding: "10px 15px", background: bg, border: `1.5px solid ${bd}`, borderRadius: 9,
                          textAlign: "left", fontSize: 14, fontWeight: 500, color: c.fg, transition: "all .2s",
                          display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontFamily: fonts.b,
                        }}>
                          <Mono style={{ fontSize: 11, color: c.mt, fontWeight: 600, width: 18 }}>{String.fromCharCode(65 + i)}</Mono>
                          {o}
                          {demoSub && i === demoQ.correct && <span style={{ marginLeft: "auto" }}>{Icons.check(c.gn)}</span>}
                          {demoSub && i === demoAns && i !== demoQ.correct && <span style={{ marginLeft: "auto" }}>{Icons.x(c.rd)}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {demoSub && (
                    <div style={{ marginTop: 14, padding: 12, background: demoAns === demoQ.correct ? c.gn + "0C" : c.rd + "0C", border: `1px solid ${demoAns === demoQ.correct ? c.gn + "33" : c.rd + "33"}`, borderRadius: 9, animation: "fu .3s ease" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                        {demoAns === demoQ.correct ? Icons.check(c.gn) : Icons.x(c.rd)}
                        <span style={{ fontWeight: 700, fontSize: 12.5, color: demoAns === demoQ.correct ? c.gn : c.rd }}>{demoAns === demoQ.correct ? "Correct!" : "Not quite"}</span>
                      </div>
                      <p style={{ fontSize: 12, lineHeight: 1.6, color: c.mt }}>{demoQ.explanation}</p>
                    </div>
                  )}

                  {/* Submit / Next buttons */}
                  {!demoSub ? (
                    <button onClick={() => demoAns !== null && setDS(true)} style={{
                      width: "100%", marginTop: 14, padding: "11px 20px",
                      background: demoAns !== null ? c.ac : c.bd, color: demoAns !== null ? c.acF : c.mt,
                      borderRadius: 9, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer",
                      fontFamily: fonts.b, transition: "all .2s", opacity: demoAns !== null ? 1 : 0.5,
                    }}>Submit Answer</button>
                  ) : (
                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                      {demoIdx < demos.length - 1 && (
                        <button onClick={() => switchDemo(demoIdx + 1)} style={{
                          flex: 1, padding: "11px 20px", background: c.mtBg, color: c.fg, borderRadius: 9,
                          fontWeight: 700, fontSize: 14, border: `1px solid ${c.bd}`, cursor: "pointer", fontFamily: fonts.b,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        }}>Next: {demos[demoIdx + 1].section} {Icons.arr}</button>
                      )}
                      <button onClick={() => router.push("/login")} style={{
                        flex: 1, padding: "11px 20px", background: c.ac, color: c.acF, borderRadius: 9,
                        fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", fontFamily: fonts.b,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      }}>Try the full platform {Icons.arr}</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
              {demos.map((_, i) => (
                <button key={i} onClick={() => switchDemo(i)} style={{
                  width: i === demoIdx ? 24 : 8, height: 8, borderRadius: 4,
                  background: i === demoIdx ? c.ac : c.bd, transition: "all .3s", border: "none", cursor: "pointer",
                }} />
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section ref={(el) => { refs.current.tests = el; }} data-s="tests" style={{ maxWidth: 1100, margin: "0 auto", padding: "50px 28px 50px" }}>
          <div style={{ opacity: isV("tests") ? 1 : 0, transform: isV("tests") ? "translateY(0)" : "translateY(30px)", transition: "all .7s cubic-bezier(.16,1,.3,1)" }}>
            <h2 style={{ textAlign: "center", fontSize: "clamp(24px,3.5vw,32px)", fontWeight: 700, letterSpacing: "-.02em", marginBottom: 10 }}>What candidates say</h2>
            <p style={{ textAlign: "center", color: c.mt, fontSize: 15, marginBottom: 44 }}>Join thousands who improved their Watson-Glaser scores.</p>
            <div style={{ maxWidth: 580, margin: "0 auto", position: "relative", minHeight: 190 }}>
              {tests.map((t, i) => (
                <div key={i} style={{
                  position: i === actTest ? "relative" : "absolute", top: 0, left: 0, right: 0,
                  opacity: i === actTest ? 1 : 0, transform: i === actTest ? "translateY(0) scale(1)" : "translateY(10px) scale(.98)",
                  transition: "all .5s cubic-bezier(.16,1,.3,1)", pointerEvents: i === actTest ? "auto" : "none",
                  background: c.card, borderRadius: 16, border: `1px solid ${c.bd}`, padding: 30,
                }}>
                  <div style={{ fontSize: 44, lineHeight: 1, color: c.ac, opacity: 0.3, marginBottom: 6, fontFamily: "Georgia,serif" }}>&ldquo;</div>
                  <p style={{ fontSize: 15, lineHeight: 1.75, marginBottom: 18 }}>{t.tx}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${c.ac}44,${c.ac}22)`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: c.ac,
                    }}>{t.nm[0]}</div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{t.nm}</div>
                      <div style={{ fontSize: 12, color: c.mt }}>{t.rl}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 22 }}>
                {tests.map((_, i) => (
                  <button key={i} onClick={() => setAT(i)} style={{
                    width: i === actTest ? 24 : 8, height: 8, borderRadius: 4,
                    background: i === actTest ? c.ac : c.bd, transition: "all .3s", border: "none", cursor: "pointer",
                  }} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section ref={(el) => { refs.current.cta = el; }} data-s="cta" style={{ padding: "50px 28px 50px" }}>
          <div style={{
            maxWidth: 680, margin: "0 auto", textAlign: "center", padding: "64px 44px", borderRadius: 20,
            background: `linear-gradient(135deg,${c.card} 0%,${c.acS} 100%)`, border: `1px solid ${c.ac}22`,
            opacity: isV("cta") ? 1 : 0, transform: isV("cta") ? "translateY(0)" : "translateY(30px)",
            transition: "all .8s cubic-bezier(.16,1,.3,1)", position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)", width: 380, height: 380,
              background: `radial-gradient(circle,${c.ac}0A 0%,transparent 70%)`, borderRadius: "50%", pointerEvents: "none",
            }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 700, letterSpacing: "-.025em", marginBottom: 14 }}>Ready to think sharper?</h2>
              <p style={{ color: c.fgS, fontSize: 15, marginBottom: 32, maxWidth: 420, margin: "0 auto 32px" }}>Start practising with 1,500+ Watson-Glaser style questions. Plans from just £2.</p>
              <Btn sz="lg" onClick={() => router.push("/pricing")} style={{ fontSize: 17, padding: "16px 36px" }}>
                Get Started — from £1.99 {Icons.arr}
              </Btn>
            </div>
          </div>
        </section>

        <Ftr />
      </div>
    </div>
  );
}