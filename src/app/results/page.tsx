"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getColors, fonts } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { Btn, Card, Ctn, Mono, PB, Icons } from "@/components/ui";

type SectionBreakdown = { section: string; correct: number; total: number; percentage: number };
type IncorrectQuestion = {
  id: number; section: string; passageText: string; questionText: string;
  options: string[]; correctAnswer: string; explanation: string; userAnswer: string;
};
type QuizResults = {
  totalCorrect: number; totalQuestions: number; percentage: number; timeSpent: number;
  sectionBreakdown: SectionBreakdown[]; incorrectQuestions: IncorrectQuestion[];
};

export default function ResultsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = getColors(theme === "dark");
  const [rv, sRV] = useState(false);
  const [qr, setQR] = useState<QuizResults | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("quizResults");
    if (stored) {
      try { setQR(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  if (!qr) {
    return (
      <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b }}>
        <Ctn style={{ padding: "120px 28px", textAlign: "center" }}>
          <p style={{ color: c.mt }}>No results.</p>
          <Btn onClick={() => router.push("/dashboard")} style={{ marginTop: 14 }}>Dashboard</Btn>
        </Ctn>
      </div>
    );
  }

  const { totalCorrect: tc, totalQuestions: tq, percentage: pct, timeSpent: ts, sectionBreakdown: sb, incorrectQuestions: iq } = qr;
  const gr = pct >= 90 ? { l: "Excellent", c: c.gn } : pct >= 75 ? { l: "Good", c: c.bl } : pct >= 60 ? { l: "Pass", c: c.ac } : { l: "Needs Work", c: c.rd };
  const fT = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  // Review view
  if (rv) {
    return (
      <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b }}>
        <Ctn style={{ padding: "44px 28px" }}>
          <div style={{ maxWidth: 740, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 26 }}>
              <h1 style={{ fontFamily: fonts.d, fontSize: 26, fontStyle: "italic" }}>Review</h1>
              <Btn v="outline" onClick={() => sRV(false)}>← Summary</Btn>
            </div>
            {iq.map((q, i) => (
              <Card key={i} hover style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: c.rd }}>{q.section}</span>
                {q.passageText && (
                  <div style={{ background: c.mtBg, padding: 12, borderRadius: 10, margin: "8px 0", fontSize: 13.5, lineHeight: 1.7, color: c.fgS }}>{q.passageText}</div>
                )}
                <h4 style={{ fontWeight: 600, margin: "8px 0", fontSize: 13.5, lineHeight: 1.5 }}>{q.questionText}</h4>
                {q.options.map((o, j) => (
                  <div key={j} style={{
                    padding: "7px 12px", borderRadius: 8, marginBottom: 2, fontSize: 13,
                    border: `1.5px solid ${o === q.correctAnswer ? c.gn : o === q.userAnswer ? c.rd : c.bd}`,
                    background: o === q.correctAnswer ? c.gnS : o === q.userAnswer ? c.rdS : "transparent",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span>{o}</span>
                    {o === q.correctAnswer && Icons.check(c.gn)}
                    {o === q.userAnswer && o !== q.correctAnswer && Icons.x(c.rd)}
                  </div>
                ))}
                <div style={{ background: c.blS, borderLeft: `3px solid ${c.bl}`, padding: 12, borderRadius: "0 8px 8px 0", marginTop: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 11.5 }}>Explanation</span>
                  <p style={{ fontSize: 12.5, color: c.fgS, marginTop: 3, lineHeight: 1.6 }}>{q.explanation}</p>
                </div>
              </Card>
            ))}
            <Btn full onClick={() => router.push("/dashboard")} style={{ marginTop: 10 }}>Dashboard</Btn>
          </div>
        </Ctn>
      </div>
    );
  }

  // Summary view
  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b }}>
      <Ctn style={{ padding: "44px 28px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div className="s1" style={{ textAlign: "center", marginBottom: 24 }}>
            <h1 style={{ fontFamily: fonts.d, fontSize: 34, fontStyle: "italic", marginBottom: 5 }}>Complete!</h1>
            <p style={{ color: c.fgS, fontSize: 14.5 }}>Here&apos;s how you performed</p>
          </div>
          <Card className="s2" style={{ textAlign: "center", marginBottom: 18 }}>
            <Mono style={{ fontSize: 56, fontWeight: 700, color: gr.c, display: "block", animation: "cu .5s ease-out" }}>{pct}%</Mono>
            <div style={{ fontSize: 17, fontWeight: 600, color: gr.c, marginBottom: 12 }}>{gr.l}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, fontSize: 13.5, color: c.mt }}>
              <span>✓ {tc}/{tq}</span>
              <span>⏱ {fT(ts)}</span>
            </div>
          </Card>
          <Card className="s3" style={{ marginBottom: 18 }}>
            <h3 style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 14 }}>Section Breakdown</h3>
            {sb.map((s, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{s.section}</span>
                  <Mono>{s.correct}/{s.total} ({s.percentage}%)</Mono>
                </div>
                <PB value={s.percentage} color={s.percentage >= 75 ? c.gn : s.percentage >= 50 ? c.ac : c.rd} height={5} />
              </div>
            ))}
          </Card>
          <div className="s4" style={{ display: "flex", gap: 10 }}>
            <Btn v="outline" full onClick={() => sRV(true)} disabled={!iq.length}>Review ({iq.length})</Btn>
            <Btn full onClick={() => router.push("/dashboard")}>Dashboard</Btn>
          </div>
        </div>
      </Ctn>
    </div>
  );
}