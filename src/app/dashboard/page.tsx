"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getColors, fonts, SECTIONS } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import {
  Btn, Card, Ctn, Mono, Hdr, Logo, PB, ThemeToggle, Icons,
} from "@/components/ui";
import { BookOpen, Target, ClipboardCheck } from "lucide-react";
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

  const { profile, hasAccess: hasAcc, refreshProfile } = useAuth();
  const hasPromo = !!profile?.promo_code;
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
  const [hovSess, setHS] = useState<number | null>(null);

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

  // Logic Profile priority ranking
  const TEST_WEIGHTS: Record<string, number> = {
    Inference: 5, Deduction: 5, Assumptions: 12, Interpretation: 6, Arguments: 12,
  };

  const secCorrect: Record<string, number> = {};
  SECTIONS.forEach((s) => (secCorrect[s] = 0));
  hist.forEach((a) => {
    if (a.correct && secCorrect[a.section] !== undefined) secCorrect[a.section]++;
  });

  const profileRanked = unlocked
    ? SECTIONS.map((sec) => {
        const accuracy = sc[sec] > 0 ? secCorrect[sec] / sc[sec] : 0;
        return { section: sec, accuracy, priority: (1 - accuracy) * (TEST_WEIGHTS[sec] / 40) };
      }).sort((a, b) => b.priority - a.priority)
    : [];

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const [hovMode, setHM] = useState<number | null>(null);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoMsg, setPromoMsg] = useState("");
  const [promoErr, setPromoErr] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);

  const modes = [
    {
      e: <BookOpen size={28} color="#6366F1" />,
      t: "Learning Mode",
      d: "Guided lessons on each section type",
      bg: d ? "#6366F115" : "#6366F10A",
      bd: d ? "#6366F130" : "#6366F118",
      accent: "#6366F1",
      pg: "/learn",
    },
    {
      e: <Target size={28} color="#10B981" />,
      t: "Practice Mode",
      d: "Timed drills with 1,500+ questions",
      bg: d ? "#10B98115" : "#10B9810A",
      bd: d ? "#10B98130" : "#10B98118",
      accent: "#10B981",
      pg: "/practice",
    },
    {
      e: <ClipboardCheck size={28} color={c.ac} />,
      t: "Mock Test",
      d: "Full 40-question exam simulation",
      bg: d ? c.ac + "15" : c.ac + "0A",
      bd: d ? c.ac + "30" : c.ac + "18",
      accent: c.ac,
      pg: "/test",
    },
  ];

  const handlePromoSubmit = useCallback(async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoMsg("");

    try {
      const vRes = await fetch(`/api/promo?code=${encodeURIComponent(code)}`);
      const vData = await vRes.json();
      if (!vData.valid) {
        setPromoErr(true);
        setPromoMsg(vData.reason || "Invalid code");
        setPromoLoading(false);
        return;
      }

      const rRes = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const rData = await rRes.json();
      if (!rRes.ok) {
        setPromoErr(true);
        setPromoMsg(rData.error || "Failed to redeem code");
        setPromoLoading(false);
        return;
      }

      setPromoErr(false);
      setPromoMsg("Code redeemed! Redirecting...");
      await refreshProfile();
      router.push("/learn");
    } catch {
      setPromoErr(true);
      setPromoMsg("Something went wrong. Please try again.");
    } finally {
      setPromoLoading(false);
    }
  }, [promoCode, refreshProfile, router]);

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
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 8 }}>
            <Btn v="ghost" sz="sm" onClick={() => router.push("/profile")}>
              {Icons.user(c.mt)}
            </Btn>
            {hasAcc && (
              <Btn v="outline" sz="sm" onClick={() => router.push("/analytics")} style={isMobile ? { fontSize: 12, padding: "4px 10px" } : undefined}>
                Analytics
              </Btn>
            )}
            <ThemeToggle />
          </div>
        }
      />

      <Ctn style={{ padding: isMobile ? "24px 14px 60px" : "48px 28px 100px" }}>
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
              {hasAcc ? "Welcome back, " + name : "Hey, " + name + "!"}
            </h1>
            {hasAcc && (
              <p style={{ color: c.fgS, fontSize: 15, lineHeight: 1.6 }}>
                Pick up where you left off or start something new.
              </p>
            )}
          </div>

          {hasAcc ? (
            <>
              {/* ===== ACTIVE ACCESS LAYOUT ===== */}

              {/* Top row: Timer + Stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                {/* Timer card */}
                <div
                  style={{
                    padding: isMobile ? "24px 18px" : "32px 28px",
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
                        fontSize: isMobile ? "clamp(28px,6vw,36px)" : "clamp(36px,7vw,52px)",
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
                    padding: isMobile ? "24px 18px" : "32px 28px",
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
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
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
                        <div style={{ marginBottom: 14 }}>{m.e}</div>
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
                            <Mono style={{ fontSize: 16, fontWeight: 700, whiteSpace: "nowrap" }}>
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

              {/* Logic Profile */}
              <div
                style={{
                  padding: isMobile ? "20px 14px" : 28,
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
                    marginBottom: unlocked ? 22 : 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {Icons.target(c.fgS)}
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: c.fgS,
                        textTransform: "uppercase",
                        letterSpacing: ".1em",
                      }}
                    >
                      Logic Profile
                    </span>
                  </div>
                  {!unlocked ? (
                    <Mono style={{ fontSize: 13, color: c.mt }}>
                      {totC}/{SECTIONS.length * REQ}
                    </Mono>
                  ) : (
                    <button
                      onClick={() => router.push("/analytics?tab=profile")}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: c.ac,
                        cursor: "pointer",
                        border: "none",
                        background: "none",
                        fontFamily: fonts.b,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: 0,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                      View full profile {Icons.arr}
                    </button>
                  )}
                </div>

                {!unlocked ? (
                  <>
                    <p style={{ fontSize: 13, color: c.mt, marginBottom: 14 }}>
                      Complete 20 questions in each section to unlock
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
                      {SECTIONS.map((s) => (
                        <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: sc[s] >= REQ ? c.gn : c.bd,
                              transition: "background .3s",
                            }}
                          />
                          <span style={{ fontSize: 11.5, color: sc[s] >= REQ ? c.fg : c.mt }}>
                            {s} ({Math.min(sc[s], REQ)}/{REQ})
                          </span>
                        </div>
                      ))}
                    </div>
                    <PB
                      value={(totC / (SECTIONS.length * REQ)) * 100}
                      color="linear-gradient(90deg,#3B82F6,#06B6D4)"
                      height={5}
                    />
                  </>
                ) : (
                  <div
                    style={{
                      display: isMobile ? "flex" : "grid",
                      gridTemplateColumns: isMobile ? undefined : "repeat(5,1fr)",
                      gap: 10,
                      ...(isMobile ? { overflowX: "auto", flexWrap: "wrap", justifyContent: "center" } : {}),
                    }}
                  >
                    {profileRanked.map((item, i) => {
                      const col = i < 2 ? c.rd : i === 2 ? c.ac : c.gn;
                      const label = i < 2 ? "High Priority" : i === 2 ? "Focus" : "On Track";
                      const accPct = Math.round(item.accuracy * 100);
                      return (
                        <div key={item.section} style={{ textAlign: "center" }}>
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
                                strokeDasharray={`${accPct * 1.508} 150.8`}
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
                              {accPct}%
                            </Mono>
                          </div>
                          <div
                            style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 2 }}
                          >
                            {item.section}
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: col }}>
                            {label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* ===== NO ACCESS LAYOUT ===== */}

              {/* Learning Mode - hero card */}
              <div
                onMouseEnter={() => setHM(0)}
                onMouseLeave={() => setHM(null)}
                onClick={() => hasPromo ? router.push("/learn") : setPromoOpen((v) => !v)}
                style={{
                  padding: "32px 28px",
                  borderRadius: 20,
                  cursor: "pointer",
                  marginBottom: !hasPromo && promoOpen ? 0 : 28,
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
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 16,
                  }}
                >
                  <div style={{ flexShrink: 0 }}><BookOpen size={42} color="#6366F1" /></div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      justifyContent: "center",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        margin: 0,
                        letterSpacing: "-.01em",
                      }}
                    >
                      {modes[0].t}
                    </h3>
                    {hasPromo && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: c.gn,
                          textTransform: "uppercase",
                          letterSpacing: ".06em",
                          padding: "3px 10px",
                          borderRadius: 100,
                          background: c.gnS,
                          border: "1px solid " + c.gn + "30",
                        }}
                      >
                        Unlocked
                      </span>
                    )}
                  </div>
                  <div style={{ margin: 0, maxWidth: 420 }}>
                    <p
                      style={{
                        fontSize: 14,
                        color: c.fgS,
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      Master all five Watson-Glaser sections with interactive lessons.
                    </p>
                    <p
                      style={{
                        fontSize: 14,
                        color: c.ac,
                        fontWeight: 600,
                        lineHeight: 1.6,
                        margin: "4px 0 0",
                      }}
                    >
                      Free with a university society code.
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
                      transition: "gap .2s",
                      marginTop: 4,
                    }}
                  >
                    Start learning {Icons.arr}
                  </div>
                </div>
              </div>

              {/* Promo code expand */}
              {!hasPromo && (
                <div
                  style={{
                    overflow: "hidden",
                    maxHeight: promoOpen ? 180 : 0,
                    opacity: promoOpen ? 1 : 0,
                    transition: promoOpen
                      ? "max-height .35s cubic-bezier(.16,1,.3,1), opacity .2s ease .05s, margin .35s cubic-bezier(.16,1,.3,1)"
                      : "max-height .25s cubic-bezier(.4,0,.2,1), opacity .15s ease, margin .25s cubic-bezier(.4,0,.2,1)",
                    marginBottom: promoOpen ? 28 : 0,
                  }}
                >
                  <div style={{ paddingTop: 14 }}>
                    <div
                      style={{
                        padding: "20px 24px",
                        borderRadius: 16,
                        background: c.card,
                        border: "1.5px solid " + c.bd,
                      }}
                    >
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                        <input
                          type="text"
                          placeholder="Enter society code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            flex: 1,
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: "1.5px solid " + c.bd,
                            background: c.bg,
                            color: c.fg,
                            fontSize: 14,
                            fontFamily: fonts.b,
                            outline: "none",
                            letterSpacing: ".06em",
                            transition: "border-color .2s",
                          }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = modes[0].accent; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = c.bd; }}
                          onKeyDown={(e) => { if (e.key === "Enter") handlePromoSubmit(); }}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePromoSubmit(); }}
                          disabled={promoLoading || !promoCode.trim()}
                          style={{
                            padding: "10px 20px",
                            borderRadius: 10,
                            border: "none",
                            background: modes[0].accent,
                            color: "#fff",
                            fontSize: 13.5,
                            fontWeight: 600,
                            fontFamily: fonts.b,
                            cursor: promoLoading || !promoCode.trim() ? "default" : "pointer",
                            opacity: promoLoading || !promoCode.trim() ? 0.5 : 1,
                            transition: "opacity .2s",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {promoLoading ? "Unlocking..." : "Unlock"}
                        </button>
                      </div>
                      {promoMsg && (
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: promoErr ? c.rd : c.gn,
                            marginBottom: 8,
                          }}
                        >
                          {promoMsg}
                        </div>
                      )}
                      <div style={{ fontSize: 13, color: c.fgS }}>
                        Don&apos;t have a code?{" "}
                        <a
                          href="/pricing"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: c.ac,
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          View plans &rarr;
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Unlock prompt */}
              <div
                style={{
                  padding: isMobile ? "28px 16px" : "36px 32px",
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
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
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
                      <div style={{ marginBottom: 12 }}>{m.e}</div>
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
