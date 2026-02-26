"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getColors, fonts, SECTIONS } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
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

  // Fetch attempts from Supabase (with auto-retry)
  const [retryCount, setRetryCount] = useState(0);
  useEffect(() => {
    const fetchAttempts = async () => {
      if (!profile) {
        if (!authLoading) setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("attempts")
          .select("section, correct, created_at, mode")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setHist(data);
          setLoading(false);
        } else if (retryCount < 3) {
          console.warn(`Attempts fetch failed, retrying (${retryCount + 1}/3)...`);
          setTimeout(() => setRetryCount((r) => r + 1), 1500);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch attempts:", err);
        if (retryCount < 3) {
          setTimeout(() => setRetryCount((r) => r + 1), 1500);
        } else {
          setLoading(false);
        }
      }
    };
    fetchAttempts();
  }, [profile, authLoading, retryCount]);

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

  // Recent trend (last 50 vs prior 50)
  const recent50 = hist.slice(0, 50);
  const prior50 = hist.slice(50, 100);
  const recentAcc = recent50.length > 0 ? Math.round((recent50.filter((a) => a.correct).length / recent50.length) * 100) : 0;
  const priorAcc = prior50.length > 0 ? Math.round((prior50.filter((a) => a.correct).length / prior50.length) * 100) : 0;
  const trend = recent50.length > 0 && prior50.length > 0 ? recentAcc - priorAcc : 0;

  // Strongest and weakest sections
  const sectionAccuracies = SECTIONS.map((s) => ({
    section: s,
    pct: sp[s].t > 0 ? Math.round((sp[s].c / sp[s].t) * 100) : -1,
    total: sp[s].t,
  })).filter((s) => s.pct >= 0);
  const strongest = sectionAccuracies.length > 0 ? sectionAccuracies.reduce((a, b) => (a.pct >= b.pct ? a : b)) : null;
  const weakest = sectionAccuracies.length > 0 ? sectionAccuracies.reduce((a, b) => (a.pct <= b.pct ? a : b)) : null;

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
          {/* Tab switcher */}
          <div style={{ display: "flex", gap: 3, background: c.mtBg, borderRadius: 12, padding: 3, marginBottom: 28 }}>
            {[
              { id: "performance", l: "📊 Performance" },
              { id: "sections", l: "📐 Sections" },
              { id: "tips", l: "💡 Tips" },
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

          {/* Performance tab */}
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

              {/* Trend + Strongest/Weakest */}
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

          {/* Sections tab */}
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

          {/* Tips tab */}
          {tab === "tips" && (
            <div className="s1">
              {tot < 5 ? (
                <Card style={{ textAlign: "center", padding: 44 }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
                  <h3 style={{ fontWeight: 700, marginBottom: 5, fontSize: 15 }}>Calibrating</h3>
                  <p style={{ color: c.mt, fontSize: 13.5, marginBottom: 14 }}>Answer 5+ questions to unlock personalised tips</p>
                  <Btn onClick={() => router.push("/dashboard")}>Practice</Btn>
                </Card>
              ) : (
                <>
                  {/* Weak sections to focus on */}
                  {SECTIONS.filter((s) => {
                    const p = sp[s];
                    return p.t > 0 && (p.c / p.t) < 0.75;
                  }).length === 0 ? (
                    <Card style={{ textAlign: "center", padding: 44 }}>
                      <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
                      <h3 style={{ fontWeight: 700, marginBottom: 5, fontSize: 15 }}>Looking sharp!</h3>
                      <p style={{ color: c.mt, fontSize: 13.5, marginBottom: 14 }}>You&apos;re scoring above 75% in every section. Keep it up!</p>
                      <Btn onClick={() => router.push("/practice")}>Keep Practising</Btn>
                    </Card>
                  ) : (
                    SECTIONS.filter((s) => {
                      const p = sp[s];
                      return p.t > 0 && (p.c / p.t) < 0.75;
                    }).map((sec) => {
                      const p = sp[sec];
                      const pct = Math.round((p.c / p.t) * 100);
                      return (
                        <Card key={sec} hover style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                              <span style={{ fontWeight: 700, fontSize: 13.5 }}>{sec}</span>
                              <span style={{
                                padding: "2px 7px", borderRadius: 6, fontSize: 10.5, fontWeight: 600,
                                background: pct < 50 ? c.rdS : c.acS, color: pct < 50 ? c.rd : c.ac,
                              }}>{pct < 50 ? "🔥 Priority" : "⚠️ Focus"}</span>
                            </div>
                            <p style={{ fontSize: 12.5, color: c.fgS }}>{pct}% accuracy across {p.t} questions</p>
                          </div>
                          <Btn v="outline" sz="sm" onClick={() => {
                            const params = new URLSearchParams({ mode: "practice", sections: sec, limit: "10" });
                            router.push(`/quiz?${params.toString()}`);
                          }}>Practice</Btn>
                        </Card>
                      );
                    })
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </Ctn>
    </div>
  );
}