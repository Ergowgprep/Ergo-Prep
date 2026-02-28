"use client";
import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getColors, fonts, SECTIONS } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/AuthContext";
import { Btn, Card, Ctn, Mono, PB, Icons, ConfirmModal } from "@/components/ui";

type Question = {
  id: number;
  section: string;
  passage_text: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
};

type PassageGroup = { pt: string; qs: Question[] };

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const c = getColors(theme === "dark");
  
  const { user, profile, hasAccess, loading: authLoading } = useAuth();

  // Extract primitives to use safely in dependency arrays
  const mode = searchParams.get("mode") || "practice";
  const sectionsParam = searchParams.get("sections") || SECTIONS.join(",");
  const limitParam = parseInt(searchParams.get("limit") || "10");
  const compParam = searchParams.get("comp");

  const [qs, setQs] = useState<Question[]>([]);
  const [grp, setGrp] = useState<PassageGroup[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [accessExpired, setAccessExpired] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    // 1. Wait for auth to settle completely
    if (authLoading) return;

    // 2. Safely track if the component is mounted
    let isMounted = true;
    setLoading(true);
    setError(false);

    const fetchQuestions = async () => {
      if (mode !== "learn" && !hasAccess) {
        router.push("/pricing");
        return;
      }

      const secs = sectionsParam.split(",");
      const total = limitParam;
      const isTest = mode === "test";
      const maxPerPassage = mode === "test" ? 3 : (mode === "practice" ? 2 : Infinity);

      const quotas: Record<string, number> = {};
      if (compParam) {
        try { JSON.parse(compParam).forEach((c: { s: string; n: number }) => (quotas[c.s] = c.n)); } catch {}
      }
      if (Object.keys(quotas).length === 0) {
        const base = Math.floor(total / secs.length);
        const rem = total % secs.length;
        secs.forEach((s, i) => (quotas[s] = base + (i < rem ? 1 : 0)));
      }

      try {
        const sectionRequests = secs
          .filter((sec) => (quotas[sec] || 0) > 0)
          .map((sec) => ({ section: sec, limit: Math.min((quotas[sec] || 0) * 4, 200) }));

        const res = await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sections: sectionRequests }),
        });

        if (!isMounted) return;

        if (!res.ok) throw new Error("Failed to fetch questions");
        const { data: allData } = await res.json() as { data: Question[] };

        if (!allData.length) {
          setError(true);
          setLoading(false);
          return;
        }

        const shuffledData = allData.sort(() => Math.random() - 0.5);
        const byPassage = new Map<string, Question[]>();
        shuffledData.forEach((q) => {
          const k = q.passage_text || "General"; 
          if (!byPassage.has(k)) byPassage.set(k, []);
          byPassage.get(k)!.push(q);
        });

        const result: Question[] = [];
        const usedIds = new Set<number>();
        secs.forEach((sec) => {
          const need = quotas[sec] || 0;
          const secPassages = [...byPassage.entries()].filter(([, pqs]) => pqs.some((q) => q.section === sec));
          const shuffled = secPassages.sort(() => Math.random() - 0.5);
          let count = 0;
          for (const [, pqs] of shuffled) {
            if (count >= need) break;
            const secQs = pqs.filter((q) => q.section === sec && !usedIds.has(q.id)).sort(() => Math.random() - 0.5);
            const take = secQs.slice(0, Math.min(maxPerPassage, need - count));
            take.forEach((q) => usedIds.add(q.id));
            result.push(...take);
            count += take.length;
          }
        });

        const grouped = new Map<string, Question[]>();
        result.forEach((q) => {
          const k = q.passage_text || "General";
          if (!grouped.has(k)) grouped.set(k, []);
          grouped.get(k)!.push(q);
        });
        const finalQs = [...grouped.values()].sort(() => Math.random() - 0.5).flat();
        const finalGrp = Array.from(grouped.entries()).map(([p, q]) => ({ pt: p, qs: q }));

        setQs(finalQs);
        setGrp(finalGrp);
        setLoading(false);

      } catch (err) {
        if (isMounted) {
          console.error("Fetch failed:", err);
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchQuestions();
    
    // Cleanup function strictly flags unmounts so background fetches don't override new ones
    return () => { isMounted = false; };
    
  // ONLY primitive strings/booleans go here. NO objects, NO arrays, NO router.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, hasAccess, mode, sectionsParam, limitParam, compParam, retryTrigger]);

  useEffect(() => {
    if (mode === "learn") return;
    const check = () => {
      if (profile?.access_expires_at && new Date(profile.access_expires_at) <= new Date()) {
        setAccessExpired(true);
      }
    };
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, [profile?.access_expires_at, mode]);

  const [gi, sGI] = useState(0);
  const [qi, sQI] = useState(0);
  const [sel, sSel] = useState<string | null>(null);
  const [ans, sAns] = useState(false);
  const [aMap, sAMap] = useState<Map<number, { s: string; c: boolean }>>(new Map());
  const [st] = useState(Date.now());
  const [tl, sTL] = useState(40 * 60000);
  const [sub, sSub] = useState(false);
  const [ed, sED] = useState(false);
  const [skipConfirm, setSC] = useState(false);
  const [submitConfirm, setSubC] = useState(false);
  const [exitConfirm, setExC] = useState(false);

  const fin = useCallback(() => {
    sSub(true);
    const tc = Array.from(aMap.values()).filter((a) => a.c).length;
    const ts = Math.floor((Date.now() - st) / 1000);
    const pct = aMap.size > 0 ? Math.round((tc / aMap.size) * 100) : 0;
    const sm = new Map<string, { c: number; t: number }>();
    grp.forEach((g) => g.qs.forEach((q) => {
      const a = aMap.get(q.id);
      if (a) {
        const x = sm.get(q.section) || { c: 0, t: 0 };
        sm.set(q.section, { c: x.c + (a.c ? 1 : 0), t: x.t + 1 });
      }
    }));
    const sb = Array.from(sm.entries()).map(([s, d]) => ({
      section: s, correct: d.c, total: d.t, percentage: d.t > 0 ? Math.round((d.c / d.t) * 100) : 0,
    }));
    const iq: (Question & { userAnswer: string })[] = [];
    grp.forEach((g) => g.qs.forEach((q) => {
      const a = aMap.get(q.id);
      if (a && !a.c) iq.push({ ...q, userAnswer: a.s });
    }));

    if (user) {
      const attempts = Array.from(aMap.entries()).map(([qId, a]) => {
        const question = qs.find((q) => q.id === qId);
        return { question_id: qId, section: question?.section || "", selected_answer: a.s, correct: a.c, mode };
      });
      fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attempts }),
      }).catch((err) => console.error("Error saving attempts:", err));
    }

    sessionStorage.setItem("quizResults", JSON.stringify({ totalCorrect: tc, totalQuestions: aMap.size, percentage: pct, timeSpent: ts, sectionBreakdown: sb, incorrectQuestions: iq }));
    router.push("/results");
  }, [aMap, grp, qs, st, mode, user, router]);

  useEffect(() => {
    if (mode !== "test" || sub) return;
    const i = setInterval(() => { sTL((p) => { if (p <= 1000) { fin(); return 0; } return p - 1000; }); }, 1000);
    return () => clearInterval(i);
  }, [mode, sub, fin]);

  const g = grp[gi]; const q = g?.qs[qi]; const totQ = qs.length;
  const cur = grp.slice(0, gi).reduce((s, g) => s + g.qs.length, 0) + qi + 1;

  const selOpt = (o: string) => { if ((mode !== "test" && ans) || sub) return; sSel(o); };
  const subm = () => {
    if (!sel || !q) return;
    const cor = sel === q.correct_answer;
    if (mode === "test") { sAMap((p) => new Map(p).set(q.id, { s: sel, c: cor })); nxt(); return; }
    sAns(true); sAMap((p) => new Map(p).set(q.id, { s: sel, c: cor }));
  };
  const nxt = () => {
    if (qi < g.qs.length - 1) sQI(qi + 1);
    else if (gi < grp.length - 1) { sGI(gi + 1); sQI(0); }
    else { if (mode === "test") { setSubC(true); return; } fin(); return; }
    sSel(null); sAns(false);
  };
  const tryNxt = () => { if (mode === "practice" && !ans) { setSC(true); return; } nxt(); };
  const prv = () => { if (qi > 0) sQI(qi - 1); else if (gi > 0) { sGI(gi - 1); sQI(grp[gi - 1].qs.length - 1); } sSel(null); sAns(false); };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}><div style={{ width: 32, height: 32, border: `3px solid ${c.ac}44`, borderTopColor: c.ac, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} /><p style={{ color: c.mt, fontSize: 14 }}>Loading questions...</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Unable to load Quiz</h2>
          <p style={{ color: c.fgS, fontSize: 14, marginBottom: 24 }}>We had an issue fetching the question bank. Please try again.</p>
          <Btn onClick={() => setRetryTrigger(prev => prev + 1)}>Retry Connection</Btn>
        </div>
      </div>
    );
  }

  if (accessExpired) {
    return (
      <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}><div style={{ fontSize: 48, marginBottom: 16 }}>⏰</div><h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Access Expired</h2><p style={{ color: c.fgS, fontSize: 14, marginBottom: 24 }}>Your access pass has expired during this session.</p><div style={{ display: "flex", gap: 10, justifyContent: "center" }}><Btn v="outline" onClick={() => router.push("/dashboard")}>Dashboard</Btn><Btn onClick={() => router.push("/pricing")}>View Plans</Btn></div></div>
      </div>
    );
  }

  if (!q) return <Ctn style={{ padding: "120px 28px", textAlign: "center" }}><p>No questions available.</p><Btn onClick={() => router.push("/dashboard")} style={{ marginTop: 14 }}>Dashboard</Btn></Ctn>;

  const showE = (mode === "practice" && ans) || sub;

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, transition: "background .4s, color .4s" }}>
      <div style={{ borderBottom: `1px solid ${c.bd}`, background: c.gl, backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 50 }}>
        <Ctn style={{ padding: "12px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Btn v="outline" sz="sm" onClick={() => { if (mode === "test" && !sub) sED(true); else if (mode === "practice") setExC(true); else router.push("/dashboard"); }}>Exit</Btn><span style={{ padding: "4px 11px", borderRadius: 8, background: c.acS, fontSize: 12.5, fontWeight: 600, border: `1px solid ${c.ac}12` }}>{mode === "practice" ? "🎯 Practice" : "⏱️ Mock Test"}</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {mode === "test" ? <Mono style={{ fontSize: 13.5, fontWeight: 700, color: tl < 300000 ? c.rd : c.fg }}>⏱ {`${Math.floor(tl / 60000)}:${String(Math.floor((tl % 60000) / 1000)).padStart(2, "0")}`}</Mono> : <span style={{ fontSize: 12.5, color: c.mt }}>{Math.floor((Date.now() - st) / 60000)} min</span>}
              <Mono style={{ fontSize: 12.5, color: c.fgS }}>{cur}/{totQ}</Mono>
            </div>
          </div>
          <PB value={(cur / totQ) * 100} height={3} />
        </Ctn>
      </div>
      <Ctn style={{ padding: "28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ position: "sticky", top: 75, alignSelf: "start" }}>
            <Card style={{ background: c.mtBg, border: `1px solid ${c.bd}` }}><div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, color: c.ac, marginBottom: 12 }}>{q.section}</div><p style={{ fontSize: 14.5, lineHeight: 1.85, whiteSpace: "pre-wrap", color: c.fgS }}>{g.pt}</p></Card>
          </div>
          <div>
            <Card className="s1" style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 18, lineHeight: 1.6 }}>{q.question_text}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {q.options.map((o, i) => {
                  const iS = sel === o; const iC = o === q.correct_answer; const sR = mode !== "test" ? ans : sub;
                  let bd = c.bd, bg = "transparent"; if (iS && !sR) { bd = c.ac; bg = c.acS; } if (sR && iC) { bd = c.gn; bg = c.gnS; } if (sR && iS && !iC) { bd = c.rd; bg = c.rdS; }
                  return (
                    <div key={i} onClick={() => selOpt(o)} style={{ padding: "12px 15px", borderRadius: 10, border: `2px solid ${bd}`, background: bg, cursor: "pointer", display: "flex", alignItems: "center", gap: 11, transition: "all .2s", transform: iS && !sR ? "scale(1.01)" : "scale(1)" }}>
                      <div style={{ width: 18, height: 18, borderRadius: 9, border: `2px solid ${iS ? c.ac : c.bd}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{iS && <div style={{ width: 8, height: 8, borderRadius: 4, background: c.ac }} />}</div>
                      <span style={{ fontSize: 13.5, flex: 1, lineHeight: 1.5 }}>{o}</span>{sR && iC && Icons.check(c.gn)}{sR && iS && !iC && Icons.x(c.rd)}
                    </div>
                  );
                })}
              </div>
              {mode !== "test" && !ans && <Btn full sz="lg" disabled={!sel} onClick={subm} style={{ marginTop: 18 }}>Submit Answer</Btn>}
              {mode === "test" && !sub && sel && <Btn full sz="lg" onClick={subm} style={{ marginTop: 18 }}>{cur === totQ ? "Submit Test" : "Next Question"}</Btn>}
            </Card>
            {showE && <Card style={{ background: c.blS, border: `1px solid ${c.bl}18`, marginBottom: 14 }}><div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}><div style={{ width: 7, height: 7, borderRadius: 4, background: c.bl }} /><span style={{ fontWeight: 700, fontSize: 12.5 }}>Explanation</span></div><p style={{ fontSize: 13.5, lineHeight: 1.75, color: c.fgS }}>{q.explanation}</p></Card>}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Btn v="outline" onClick={prv} disabled={gi === 0 && qi === 0}>Previous</Btn>
              {mode === "test" ? <Btn onClick={() => { if (cur === totQ) setSubC(true); else nxt(); }} disabled={!sel && cur === totQ}>{cur === totQ ? "Submit Test" : "Next"}</Btn> : <Btn onClick={tryNxt} disabled={mode !== "test" && !ans && !sel}>{cur === totQ ? "Finish" : "Next"}</Btn>}
            </div>
          </div>
        </div>
      </Ctn>
      <ConfirmModal open={ed} title="Exit Mock Test?" body="Your progress will be lost and this attempt will not be saved." confirmText="Exit Test" cancelText="Continue Test" onConfirm={() => router.push("/dashboard")} onCancel={() => sED(false)} />
      <ConfirmModal open={exitConfirm} title="Exit Practice?" body={`You have answered ${aMap.size} of ${totQ} questions.`} confirmText="Exit" cancelText="Keep Practising" onConfirm={() => router.push("/dashboard")} onCancel={() => setExC(false)} />
      <ConfirmModal open={skipConfirm} title="Skip this question?" body="You haven't answered this question yet." confirmText="Skip" cancelText="Go back" variant="primary" onConfirm={() => { setSC(false); nxt(); }} onCancel={() => setSC(false)} />
      <ConfirmModal open={submitConfirm} title="Submit your test?" body={`You have answered ${aMap.size} of ${totQ} questions.`} confirmText="Submit Test" cancelText="Review Answers" variant="primary" onConfirm={() => { setSubC(false); fin(); }} onCancel={() => setSubC(false)} />
    </div>
  );
}

export default function QuizPage() { return <Suspense fallback={<div style={{ padding: 100, textAlign: "center" }}>Loading...</div>}><QuizContent /></Suspense>; }