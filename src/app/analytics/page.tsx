"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getColors, fonts, SECTIONS } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/AuthContext";
import { Btn, Card, Ctn, Mono, Hdr, PB, ThemeToggle } from "@/components/ui";

type Attempt = { section: string; correct: boolean; created_at: string; mode: string };

export default function AnalyticsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = getColors(theme === "dark");
  const { profile, loading: authLoading } = useAuth();
  const [tab, sTab] = useState("performance");
  const [hist, setHist] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      if (!profile) {
        if (!authLoading) setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/attempts?fields=section,correct,created_at,mode");
        if (res.ok) {
          const { data } = await res.json();
          setHist(data);
        }
      } catch (err) {
        console.error("Failed to fetch attempts:", err);
      }
      setLoading(false);
    };
    fetchAttempts();
  }, [profile, authLoading]);

  const sp: Record<string, { c: number; t: number }> = {};
  SECTIONS.forEach((s) => (sp[s] = { c: 0, t: 0 }));
  hist.forEach((a) => {
    if (sp[a.section]) {
      sp[a.section].t++;
      if (a.correct) sp[a.section].c++;
    }
  });
  const tot = hist.length;
  const cor = hist.filter((a) => a.correct).length;

  const recent50 = hist.slice(0, 50);
  const prior50 = hist.slice(50, 100);
  const recentAcc = recent50.length > 0 ? Math.round((recent50.filter((a) => a.correct).length / recent50.length) * 100) : 0;
  const priorAcc = prior50.length > 0 ? Math.round((prior50.filter((a) => a.correct).length / prior50.length) * 100) : 0;
  const trend = recent50.length > 0 && prior50.length > 0 ? recentAcc - priorAcc : 0;

  const sectionAccuracies = SECTIONS.map((s) => ({
    section: s,
    pct: sp[s].t > 0 ? Math.round((sp[s].c / sp[s].t) * 100) : -1,
    total: sp[s].t,
  })).filter((s) => s.pct >= 0);
  const strongest = sectionAccuracies.length > 0 ? sectionAccuracies.reduce((a, b) => (a.pct >= b.pct ? a : b)) : null;
  const weakest = sectionAccuracies.length > 0 ? sectionAccuracies.reduce((a, b) => (a.pct <= b.pct ? a : b)) : null;

  // Logic Profile
  const TEST_WEIGHTS: Record<string, number> = {
    Inference: 5, Deduction: 5, Assumptions: 12, Interpretation: 6, Arguments: 12,
  };
  const PROFILE_REQ = 20;
  const profileUnlocked = SECTIONS.every((s) => sp[s].t >= PROFILE_REQ);
  const profileRanked = profileUnlocked
    ? SECTIONS.map((sec) => {
        const p = sp[sec];
        const accuracy = p.t > 0 ? p.c / p.t : 0;
        const testWeight = TEST_WEIGHTS[sec] / 40;
        return {
          section: sec,
          accuracy: Math.round(accuracy * 100),
          testQuestions: TEST_WEIGHTS[sec],
          priority: (1 - accuracy) * testWeight,
        };
      }).sort((a, b) => b.priority - a.priority)
    : [];

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: `3px solid ${c.ac}44`, borderTopColor: c.ac, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, transition: "background .4s, color .4s" }}>
      <Hdr
        left={
          <>
            <Btn v="ghost" sz="sm" onClick={() => router.push("/dashboard")}>← Dashboard</Btn>
            <h1 style={{ fontFamily: fonts.d, fontSize: 21, fontStyle: "italic" }}>Analytics</h1>
          </>
        }
        right={<ThemeToggle />}
      />
      <Ctn style={{ padding: "44px 28px" }}>
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 3, background: c.mtBg, borderRadius: 12, padding: 3, marginBottom: 28 }}>
            {[
              { id: "performance", l: "📊 Performance" },
              { id: "sections", l: "📐 Sections" },
              { id: "profile", l: "🧠 Logic Profile" },
            ].map((t) => (
              <div key={t.id} onClick={() => sTab(t.id)} style={{
                flex: 1, textAlign: "center", padding: "9px 14px", borderRadius: 10, cursor: "pointer",
                fontSize: 13, fontWeight: 600, transition: "all .2s",
                background: tab === t.id ? c.card : "transparent",
                color: tab === t.id ? c.fg : c.mt,
                boxShadow: tab === t.id ? c.sh : "none",
              }}>{t.l}</div>
            ))}
          </div>

          {tab === "performance" && (
            <div className="s1">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
                {[
                  { v: String(tot), l: "Attempted", cl: c.fg },
                  { v: String(cor), l: "Correct", cl: c.gn },
                  { v: tot > 0 ? Math.round((cor / tot) * 100) + "%" : "—", l: "Accuracy", cl: c.ac },
                ].map((s, i) => (
                  <Card key={i} hover style={{ textAlign: "center" }}>
                    <Mono style={{ fontSize: 30, fontWeight: 700, color: s.cl, display: "block", marginBottom: 3 }}>{s.v}</Mono>
                    <span style={{ fontSize: 12, color: c.mt }}>{s.l}</span>
                  </Card>
                ))}
              </div>

              {tot > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                  {trend !== 0 && (
                    <Card hover style={{ textAlign: "center" }}>
                      <Mono style={{ fontSize: 24, fontWeight: 700, color: trend > 0 ? c.gn : c.rd, display: "block", marginBottom: 3 }}>
                        {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
                      </Mono>
                      <span style={{ fontSize: 12, color: c.mt }}>Recent trend</span>
                    </Card>
                  )}
                  {strongest && weakest && strongest.section !== weakest.section && (
                    <>
                      <Card hover>
                        <span style={{ fontSize: 11, fontWeight: 600, color: c.gn, textTransform: "uppercase", letterSpacing: 1 }}>Strongest</span>
                        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{strongest.section}</div>
                        <Mono style={{ fontSize: 12.5, color: c.mt }}>{strongest.pct}% ({strongest.total} Qs)</Mono>
                      </Card>
                      <Card hover>
                        <span style={{ fontSize: 11, fontWeight: 600, color: c.rd, textTransform: "uppercase", letterSpacing: 1 }}>Weakest</span>
                        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{weakest.section}</div>
                        <Mono style={{ fontSize: 12.5, color: c.mt }}>{weakest.pct}% ({weakest.total} Qs)</Mono>
                      </Card>
                    </>
                  )}
                </div>
              )}

              {!tot && (
                <Card style={{ textAlign: "center", padding: 44 }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📈</div>
                  <h3 style={{ fontWeight: 700, marginBottom: 5, fontSize: 15 }}>No data yet</h3>
                  <p style={{ color: c.mt, fontSize: 13.5, marginBottom: 14 }}>Complete questions to see analytics</p>
                  <Btn onClick={() => router.push("/dashboard")}>Start</Btn>
                </Card>
              )}
            </div>
          )}

          {tab === "sections" && (
            <div className="s1">
              {SECTIONS.map((sec) => {
                const p = sp[sec];
                const pct = p.t > 0 ? Math.round((p.c / p.t) * 100) : 0;
                return (
                  <Card key={sec} hover style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                      <span style={{ fontWeight: 600, fontSize: 13.5 }}>{sec}</span>
                      <Mono style={{ fontSize: 12.5, color: c.mt }}>{p.t > 0 ? `${p.c}/${p.t} (${pct}%)` : "No data"}</Mono>
                    </div>
                    <PB value={pct} color={pct >= 75 ? c.gn : pct >= 50 ? c.ac : pct > 0 ? c.rd : c.bd} height={5} />
                  </Card>
                );
              })}
            </div>
          )}

          {tab === "profile" && (
            <div className="s1">
              {!profileUnlocked ? (
                <>
                  <Card style={{ textAlign: "center", padding: "28px 24px", marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c.mt, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
                      Logic Profile Locked
                    </div>
                    <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.6, marginBottom: 0 }}>
                      Complete 20 questions in each section to unlock your Logic Profile
                    </p>
                  </Card>
                  {SECTIONS.map((sec) => {
                    const done = Math.min(sp[sec].t, PROFILE_REQ);
                    const pct = Math.round((done / PROFILE_REQ) * 100);
                    return (
                      <Card key={sec} hover style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                          <span style={{ fontWeight: 600, fontSize: 13.5 }}>{sec}</span>
                          <Mono style={{ fontSize: 12.5, color: done >= PROFILE_REQ ? c.gn : c.mt }}>{done}/{PROFILE_REQ} completed</Mono>
                        </div>
                        <PB value={pct} color={done >= PROFILE_REQ ? c.gn : c.ac} height={5} />
                      </Card>
                    );
                  })}
                </>
              ) : (
                <>
                  <Card style={{ textAlign: "center", padding: "28px 24px", marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c.gn, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
                      Logic Profile Unlocked
                    </div>
                    <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.6, marginBottom: 0 }}>
                      Sections ranked by priority based on your accuracy and real test weighting
                    </p>
                  </Card>
                  {profileRanked.map((item, i) => {
                    const rank = i + 1;
                    const col = rank <= 2 ? c.rd : rank === 3 ? c.ac : c.gn;
                    const bg = rank <= 2 ? c.rdS : rank === 3 ? c.acS : c.gnS;
                    const label = rank <= 2 ? "High Priority" : rank === 3 ? "Medium" : "Low Priority";
                    const weightLabel = item.testQuestions >= 10 ? "heavily weighted" : item.testQuestions >= 6 ? "moderately weighted" : "lightly weighted";
                    const accLabel = item.accuracy < 50 ? "Low" : item.accuracy < 75 ? "Moderate" : "High";
                    const explanation = rank <= 2
                      ? `${accLabel} accuracy on a ${weightLabel} section — focus here`
                      : rank === 3
                        ? `${accLabel} accuracy on a ${weightLabel} section — room to improve`
                        : `${accLabel} accuracy on a ${weightLabel} section — looking solid`;
                    return (
                      <Card key={item.section} hover style={{ marginBottom: 8, padding: "18px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                            <Mono style={{ fontSize: 18, fontWeight: 700, color: col, width: 28, textAlign: "center", flexShrink: 0 }}>
                              {rank}
                            </Mono>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <span style={{ fontWeight: 700, fontSize: 14 }}>{item.section}</span>
                                <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10.5, fontWeight: 600, background: bg, color: col }}>
                                  {label}
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                                <Mono style={{ fontSize: 12.5, color: c.fg }}>{item.accuracy}% accuracy</Mono>
                                <span style={{ fontSize: 12, color: c.mt }}>{item.testQuestions}/40 questions on real test</span>
                              </div>
                              <p style={{ fontSize: 12, color: c.fgS, margin: 0 }}>{explanation}</p>
                            </div>
                          </div>
                          <Btn v="outline" sz="sm" style={{ marginLeft: 14, flexShrink: 0 }} onClick={() => {
                            const params = new URLSearchParams({ mode: "practice", sections: item.section, limit: "10" });
                            router.push(`/quiz?${params.toString()}`);
                          }}>Practice</Btn>
                        </div>
                      </Card>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </Ctn>
    </div>
  );
}