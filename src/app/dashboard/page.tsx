"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getColors, fonts, SECTIONS } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import {
  Btn, Card, Ctn, Mono, Hdr, Logo, PB, ThemeToggle, Icons,
} from "@/components/ui";
import { useAuth } from "@/lib/AuthContext";

type Session = {
  id: string;
  mode: string;
  sections: string[];
  total_questions: number;
  score: number;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = getColors(theme === "dark");
  const d = theme === "dark";

  const { profile, hasAccess: hasAcc } = useAuth();
  const name = profile?.name || "there";
  const exp = profile?.access_expires_at ? new Date(profile.access_expires_at) : null;

  // Countdown timer
  const [ts, setTs] = useState("");
  useEffect(() => {
    if (!exp) return;
    const t = () => {
      const df = exp.getTime() - Date.now();
      if (df <= 0) {
        setTs("00:00:00");
        return;
      }
      const h = Math.floor(df / 3600000);
      const m = Math.floor((df % 3600000) / 60000);
      const s = Math.floor((df % 60000) / 1000);
      setTs(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    };
    t();
    const i = setInterval(t, 1000);
    return () => clearInterval(i);
  }, [exp]);

    // Fetch history via API
  const [hist, setHist] = useState<{ section: string; correct: boolean }[]>([]);
  useEffect(() => {
    if (!profile) return;
    let cancelled = false;

    const fetchHist = async () => {
      try {
        const res = await fetch("/api/attempts?fields=section,correct");
        if (res.ok) {
          const { data } = await res.json();
          if (!cancelled) setHist(data);
        }
      } catch (err) {
        console.warn("History fetch failed:", err);
      }
    };

    fetchHist();
    return () => { cancelled = true; };
  }, [profile]);

  const [sessions, setSessions] = useState<Session[]>([]);
  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    const fetchSessions = async () => {
      try {
        const res = await fetch("/api/sessions");
        if (res.ok) {
          const { data } = await res.json();
          if (!cancelled) setSessions(data);
        }
      } catch (err) {
        console.warn("Sessions fetch failed:", err);
      }
    };
    fetchSessions();
    return () => { cancelled = true; };
  }, [profile]);

  const tot = hist.length;
  const cor = hist.filter((a) => a.correct).length;
  const pct = tot > 0 ? Math.round((cor / tot) * 100) : 0;

  const sc: Record<string, number> = {};
  SECTIONS.forEach((s) => (sc[s] = 0));
  hist.forEach((a) => {
    if (sc[a.section] !== undefined) sc[a.section]++;
  });
  const REQ = 20;
  const totC = SECTIONS.reduce((s, k) => s + Math.min(sc[k], REQ), 0);
  const unlocked = SECTIONS.every((s) => sc[s] >= REQ);

  const secColors: Record<string, string> = {
    Inference: "#6366F1",
    Assumptions: "#EC4899",
    Deduction: "#F59E0B",
    Interpretation: "#10B981",
    Arguments: "#3B82F6",
  };

  // Fetch recent sessions
  type Session = { id: string; mode: string; sections: string[]; total_questions: number; score: number; created_at: string };
  const [sessions, setSessions] = useState<Session[]>([]);
  const [hovSess, setHS] = useState<number | null>(null);
  useEffect(() => {
    if (!profile || !hasAcc) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/sessions");
        if (res.ok) {
          const { data } = await res.json();
          if (!cancelled) setSessions((data as Session[]).slice(0, 3));
        }
      } catch (err) {
        console.warn("Sessions fetch failed:", err);
      }
    })();
    return () => { cancelled = true; };
  }, [profile, hasAcc]);

  const [hovMode, setHM] = useState<number | null>(null);

  const modes = [
    {
      e: "🎓",
      t: "Learning Mode",
      d: "Guided lessons on each section type",
      bg: d ? "#6366F115" : "#6366F10A",
      bd: d ? "#6366F130" : "#6366F118",
      accent: "#6366F1",
      pg: "/learn",
    },
    {
      e: "🎯",
      t: "Practice Mode",
      d: "Timed drills with 1,500+ questions",
      bg: d ? "#10B98115" : "#10B9810A",
      bd: d ? "#10B98130" : "#10B98118",
      accent: "#10B981",
      pg: "/practice",
    },
    {
      e: "⏱️",
      t: "Mock Test",
      d: "Full 40-question exam simulation",
      bg: d ? c.ac + "15" : c.ac + "0A",
      bd: d ? c.ac + "30" : c.ac + "18",
      accent: c.ac,
      pg: "/test",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: d ? c.bg : `linear-gradient(180deg,${c.bg} 0%,#F8F6F3 100%)`,
        color: c.fg,
        fontFamily: fonts.b,
        transition: "background .4s, color .4s",
      }}
    >
      <Hdr
        left={<Logo onClick={() => router.push("/")} />}
        right={
          <>
            <Btn v="ghost" sz="sm" onClick={() => router.push("/profile")}>
              {Icons.user(c.mt)}
            </Btn>
            {hasAcc && (
              <Btn v="outline" sz="sm" onClick={() => router.push("/analytics")}>
                Analytics
              </Btn>
            )}
            <ThemeToggle />
          </>
        }
      />

      <Ctn style={{ padding: "48px 28px 100px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Welcome */}
          <div style={{ marginBottom: hasAcc ? 40 : 32 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: hasAcc ? c.gn : c.mt,
                  boxShadow: hasAcc ? "0 0 8px " + c.gn + "60" : "none",
                }}
              />
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: hasAcc ? c.gn : c.mt,
                }}
              >
                {hasAcc ? "Session Active" : "No Active Session"}
              </span>
            </div>
            <h1
              style={{
                fontSize: "clamp(28px,5vw,38px)",
                fontWeight: 700,
                letterSpacing: "-.03em",
                lineHeight: 1.15,
                marginBottom: 6,
              }}
            >
              {hasAcc ? "Welcome back, " + name : "Hey, " + name}
            </h1>
            <p style={{ color: c.fgS, fontSize: 15, lineHeight: 1.6 }}>
              {hasAcc
                ? "Pick up where you left off or start something new."
                : "Start learning for free, or grab an access pass to unlock everything."}
            </p>
          </div>

          {hasAcc ? (
            <>
              {/* ===== ACTIVE ACCESS LAYOUT ===== */}

              {/* Top row: Timer + Stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                {/* Timer card */}
                <div
                  style={{
                    padding: "32px 28px",
                    borderRadius: 20,
                    background: d
                      ? `linear-gradient(145deg,${c.card} 0%,${c.ac}06 100%)`
                      : `linear-gradient(145deg,#FFFDF8 0%,${c.ac}08 100%)`,
                    border: "1px solid " + (d ? c.ac + "18" : c.ac + "12"),
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -60,
                      right: -60,
                      width: 180,
                      height: 180,
                      borderRadius: "50%",
                      background: `radial-gradient(circle,${c.ac}08 0%,transparent 70%)`,
                      pointerEvents: "none",
                    }}
                  />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 16,
                      }}
                    >
                      {Icons.clock(c.ac)}
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: c.ac,
                          textTransform: "uppercase",
                          letterSpacing: ".1em",
                        }}
                      >
                        Access Remaining
                      </span>
                    </div>
                    <Mono
                      style={{
                        fontSize: "clamp(36px,7vw,52px)",
                        fontWeight: 700,
                        display: "block",
                        letterSpacing: ".04em",
                        lineHeight: 1,
                        marginBottom: 12,
                      }}
                    >
                      {ts}
                    </Mono>
                    <p style={{ fontSize: 12.5, color: c.mt }}>
                      Expires when the timer reaches zero
                    </p>
                  </div>
                </div>

                {/* Stats card */}
                <div
                  style={{
                    padding: "32px 28px",
                    borderRadius: 20,
                    background: c.card,
                    border: "1px solid " + c.bd,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 20,
                      }}
                    >
                      {Icons.trend(c.fgS)}
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: c.fgS,
                          textTransform: "uppercase",
                          letterSpacing: ".1em",
                        }}
                      >
                        Performance
                      </span>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <div>
                        <Mono
                          style={{
                            fontSize: 30,
                            fontWeight: 700,
                            display: "block",
                            lineHeight: 1,
                          }}
                        >
                          {pct}%
                        </Mono>
                        <span
                          style={{
                            fontSize: 11.5,
                            color: c.mt,
                            marginTop: 4,
                            display: "block",
                          }}
                        >
                          Accuracy
                        </span>
                      </div>
                      <div>
                        <Mono
                          style={{
                            fontSize: 30,
                            fontWeight: 700,
                            display: "block",
                            lineHeight: 1,
                          }}
                        >
                          {tot}
                        </Mono>
                        <span
                          style={{
                            fontSize: 11.5,
                            color: c.mt,
                            marginTop: 4,
                            display: "block",
                          }}
                        >
                          Answered
                        </span>
                      </div>
                      <div>
                        <Mono
                          style={{
                            fontSize: 30,
                            fontWeight: 700,
                            display: "block",
                            lineHeight: 1,
                            color: c.gn,
                          }}
                        >
                          {cor}
                        </Mono>
                        <span
                          style={{
                            fontSize: 11.5,
                            color: c.mt,
                            marginTop: 4,
                            display: "block",
                          }}
                        >
                          Correct
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      borderTop: "1px solid " + c.bd,
                      paddingTop: 14,
                      marginTop: 18,
                    }}
                  >
                    <button
                      onClick={() => router.push("/analytics")}
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: c.ac,
                        cursor: "pointer",
                        border: "none",
                        background: "none",
                        fontFamily: fonts.b,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                      View full analytics {Icons.arr}
                    </button>
                  </div>
                </div>
              </div>

              {/* All 3 mode cards */}
              <div style={{ marginBottom: 10 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: c.mt,
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                  }}
                >
                  Choose your mode
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 14,
                  marginBottom: 28,
                }}
              >
                {modes.map((m, i) => {
                  const isH = hovMode === i;
                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setHM(i)}
                      onMouseLeave={() => setHM(null)}
                      onClick={() => router.push(m.pg)}
                      style={{
                        padding: "28px 22px",
                        borderRadius: 18,
                        cursor: "pointer",
                        background: isH ? m.bg : c.card,
                        border: "1.5px solid " + (isH ? m.accent + "50" : c.bd),
                        transition: "all .3s cubic-bezier(.16,1,.3,1)",
                        transform: isH ? "translateY(-4px)" : "translateY(0)",
                        boxShadow: isH ? "0 16px 40px " + m.accent + "12" : "none",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: -20,
                          right: -20,
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          background: m.accent + "08",
                          transition: "all .3s",
                          transform: isH ? "scale(1.5)" : "scale(1)",
                          pointerEvents: "none",
                        }}
                      />
                      <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: 28, marginBottom: 14 }}>{m.e}</div>
                        <h3
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            marginBottom: 5,
                            letterSpacing: "-.01em",
                          }}
                        >
                          {m.t}
                        </h3>
                        <p
                          style={{
                            fontSize: 13,
                            color: c.fgS,
                            lineHeight: 1.6,
                            marginBottom: 18,
                          }}
                        >
                          {m.d}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: isH ? 10 : 6,
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: m.accent,
                            transition: "gap .2s",
                          }}
                        >
                          Start {Icons.arr}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Tests */}
              {sessions.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.mt,
                      textTransform: "uppercase",
                      letterSpacing: ".1em",
                      display: "block",
                      marginBottom: 10,
                    }}
                  >
                    Recent Tests
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {sessions.map((s, i) => {
                      const dt = new Date(s.created_at);
                      const fmt = dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                      const isH = hovSess === i;
                      return (
                        <div
                          key={s.id}
                          onMouseEnter={() => setHS(i)}
                          onMouseLeave={() => setHS(null)}
                          onClick={() => router.push(`/review?session_id=${s.id}`)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "16px 20px",
                            borderRadius: 14,
                            background: isH ? c.cardH : c.card,
                            border: "1px solid " + (isH ? c.bdH : c.bd),
                            cursor: "pointer",
                            transition: "all .2s",
                            transform: isH ? "translateY(-2px)" : "translateY(0)",
                            boxShadow: isH ? c.shM : "none",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{
                              padding: "4px 10px",
                              borderRadius: 8,
                              background: s.mode === "test" ? c.acS : c.gnS,
                              fontSize: 11,
                              fontWeight: 700,
                              color: s.mode === "test" ? c.ac : c.gn,
                              textTransform: "capitalize",
                            }}>
                              {s.mode}
                            </div>
                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>{fmt}</div>
                              <div style={{ fontSize: 11.5, color: c.mt }}>{s.sections.join(", ")}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <Mono style={{ fontSize: 16, fontWeight: 700 }}>
                              {s.score} / {s.total_questions}
                            </Mono>
                            <span style={{ color: c.mt, display: "flex" }}>{Icons.arr}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section Progress */}
              <div
                style={{
                  padding: 28,
                  borderRadius: 20,
                  background: c.card,
                  border: "1px solid " + c.bd,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 22,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {Icons.target(c.fgS)}
                    <div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: c.fgS,
                          textTransform: "uppercase",
                          letterSpacing: ".1em",
                          display: "block",
                        }}
                      >
                        {unlocked
                          ? "Logic Profile Complete"
                          : "Calibrating Logic Profile"}
                      </span>
                      <span style={{ fontSize: 12, color: c.mt }}>
                        {unlocked
                          ? "Your personalized profile is ready"
                          : "Complete 20 questions per section"}
                      </span>
                    </div>
                  </div>
                  <Mono style={{ fontSize: 13, color: c.mt }}>
                    {totC}/{SECTIONS.length * REQ}
                  </Mono>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5,1fr)",
                    gap: 10,
                  }}
                >
                  {SECTIONS.map((s) => {
                    const done = Math.min(sc[s], REQ);
                    const pctDone = Math.round((done / REQ) * 100);
                    const col = secColors[s] || c.ac;
                    return (
                      <div key={s} style={{ textAlign: "center" }}>
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            margin: "0 auto 8px",
                            position: "relative",
                          }}
                        >
                          <svg width="56" height="56" viewBox="0 0 56 56">
                            <circle
                              cx="28"
                              cy="28"
                              r="24"
                              fill="none"
                              stroke={c.bd}
                              strokeWidth="3.5"
                            />
                            <circle
                              cx="28"
                              cy="28"
                              r="24"
                              fill="none"
                              stroke={col}
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeDasharray={`${pctDone * 1.508} 150.8`}
                              transform="rotate(-90 28 28)"
                              style={{
                                transition:
                                  "stroke-dasharray .6s cubic-bezier(.16,1,.3,1)",
                              }}
                            />
                          </svg>
                          <Mono
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%,-50%)",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {done}
                          </Mono>
                        </div>
                        <div
                          style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 2 }}
                        >
                          {s}
                        </div>
                        <div style={{ fontSize: 10.5, color: c.mt }}>
                          {done}/{REQ}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {!unlocked && (
                  <div
                    style={{
                      marginTop: 18,
                      paddingTop: 16,
                      borderTop: "1px solid " + c.bd,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flex: 1, marginRight: 16 }}>
                      <PB
                        value={(totC / (SECTIONS.length * REQ)) * 100}
                        color="linear-gradient(90deg,#3B82F6,#06B6D4)"
                        height={5}
                      />
                    </div>
                    <Btn
                      v="outline"
                      sz="sm"
                      onClick={() => router.push("/practice")}
                    >
                      Start Practicing
                    </Btn>
                  </div>
                )}
              </div>

              {/* Recent Tests */}
              {sessions.length > 0 && (
                <div
                  style={{
                    padding: 28,
                    borderRadius: 20,
                    background: c.card,
                    border: "1px solid " + c.bd,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 18,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {Icons.trend(c.fgS)}
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: c.fgS,
                          textTransform: "uppercase",
                          letterSpacing: ".1em",
                        }}
                      >
                        Recent Tests
                      </span>
                    </div>
                    <Btn v="ghost" sz="sm" onClick={() => router.push("/analytics")}>
                      View all
                    </Btn>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {sessions.slice(0, 5).map((s) => {
                      const pctScore =
                        s.total_questions > 0
                          ? Math.round((s.score / s.total_questions) * 100)
                          : 0;
                      const date = new Date(s.created_at);
                      const dateStr = date.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      });
                      return (
                        <div
                          key={s.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "14px 16px",
                            borderRadius: 12,
                            background: c.mtBg,
                            border: "1px solid " + c.bd,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 18 }}>
                              {s.mode === "test" ? "⏱️" : "🎯"}
                            </span>
                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                                {s.mode === "test" ? "Mock Test" : "Practice"} —{" "}
                                {s.sections.join(", ")}
                              </div>
                              <div style={{ fontSize: 11.5, color: c.mt, marginTop: 2 }}>
                                {dateStr} · {s.total_questions} questions
                              </div>
                            </div>
                          </div>
                          <Mono
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: pctScore >= 75 ? c.gn : pctScore >= 50 ? c.ac : c.rd,
                            }}
                          >
                            {pctScore}%
                          </Mono>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* ===== NO ACCESS LAYOUT ===== */}

              {/* Learning Mode - hero card (free) */}
              <div style={{ marginBottom: 10 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: c.mt,
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                  }}
                >
                  Free access
                </span>
              </div>
              <div
                onMouseEnter={() => setHM(0)}
                onMouseLeave={() => setHM(null)}
                onClick={() => router.push(modes[0].pg)}
                style={{
                  padding: "32px 28px",
                  borderRadius: 20,
                  cursor: "pointer",
                  marginBottom: 28,
                  background: hovMode === 0 ? modes[0].bg : c.card,
                  border:
                    "1.5px solid " +
                    (hovMode === 0 ? modes[0].accent + "50" : c.bd),
                  transition: "all .3s cubic-bezier(.16,1,.3,1)",
                  transform:
                    hovMode === 0 ? "translateY(-3px)" : "translateY(0)",
                  boxShadow:
                    hovMode === 0
                      ? "0 16px 40px " + modes[0].accent + "12"
                      : "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -40,
                    right: -40,
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    background: modes[0].accent + "08",
                    transition: "all .3s",
                    transform: hovMode === 0 ? "scale(1.4)" : "scale(1)",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                  }}
                >
                  <div style={{ fontSize: 42, flexShrink: 0 }}>{modes[0].e}</div>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        marginBottom: 4,
                        letterSpacing: "-.01em",
                      }}
                    >
                      {modes[0].t}
                    </h3>
                    <p
                      style={{
                        fontSize: 14,
                        color: c.fgS,
                        lineHeight: 1.6,
                        marginBottom: 0,
                      }}
                    >
                      Master all five Watson-Glaser sections with guided, interactive
                      lessons. No access pass required.
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: hovMode === 0 ? 12 : 8,
                      fontSize: 14,
                      fontWeight: 600,
                      color: modes[0].accent,
                      flexShrink: 0,
                      transition: "gap .2s",
                    }}
                  >
                    Start learning {Icons.arr}
                  </div>
                </div>
              </div>

              {/* Unlock prompt */}
              <div
                style={{
                  padding: "36px 32px",
                  borderRadius: 20,
                  marginBottom: 28,
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                  background: d
                    ? `linear-gradient(145deg,${c.card} 0%,${c.ac}08 100%)`
                    : `linear-gradient(145deg,#FFFDF8 0%,${c.ac}06 100%)`,
                  border: "1px solid " + (d ? c.ac + "18" : c.ac + "10"),
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -80,
                    left: "50%",
                    marginLeft: -120,
                    width: 240,
                    height: 240,
                    borderRadius: "50%",
                    background: `radial-gradient(circle,${c.ac}06 0%,transparent 70%)`,
                    pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: c.ac,
                      textTransform: "uppercase",
                      letterSpacing: ".1em",
                      marginBottom: 14,
                    }}
                  >
                    Unlock full access
                  </div>
                  <h2
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      letterSpacing: "-.02em",
                      marginBottom: 8,
                    }}
                  >
                    Practice Mode, Mock Tests, and Analytics
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: c.fgS,
                      lineHeight: 1.7,
                      maxWidth: 480,
                      margin: "0 auto 22px",
                    }}
                  >
                    Get access to 1,500+ practice questions, full exam simulations,
                    performance tracking, and your personalised logic profile.
                  </p>
                  <Btn sz="lg" onClick={() => router.push("/pricing")}>
                    View Plans
                  </Btn>
                </div>
              </div>

              {/* Locked mode previews */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                {[modes[1], modes[2]].map((m, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "24px 22px",
                      borderRadius: 18,
                      background: c.card,
                      border: "1.5px solid " + c.bd,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{ position: "relative", zIndex: 1, opacity: 0.45 }}
                    >
                      <div style={{ fontSize: 26, marginBottom: 12 }}>{m.e}</div>
                      <h3
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          marginBottom: 4,
                          letterSpacing: "-.01em",
                        }}
                      >
                        {m.t}
                      </h3>
                      <p
                        style={{
                          fontSize: 12.5,
                          color: c.fgS,
                          lineHeight: 1.5,
                        }}
                      >
                        {m.d}
                      </p>
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        top: 14,
                        right: 14,
                        fontSize: 10,
                        fontWeight: 700,
                        color: c.mt,
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        padding: "3px 10px",
                        borderRadius: 100,
                        background: c.mtBg,
                        border: "1px solid " + c.bd,
                      }}
                    >
                      Locked
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Ctn>
    </div>
  );
}