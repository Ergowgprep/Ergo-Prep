"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getColors, fonts } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { Btn, Card, Ctn, Icons, Hdr, ThemeToggle } from "@/components/ui";

type Attempt = {
  question_id: number;
  section: string;
  selected_answer: string;
  correct: boolean;
};

type Question = {
  id: number;
  section: string;
  passage_text: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
};

type ReviewItem = Question & { userAnswer: string; correct: boolean };

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const c = getColors(theme === "dark");
  const sessionId = searchParams.get("session_id");

  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!sessionId) { setLoading(false); setError(true); return; }
    let cancelled = false;

    (async () => {
      try {
        const attRes = await fetch(
          `/api/attempts?session_id=${sessionId}&fields=question_id,section,selected_answer,correct`
        );
        if (!attRes.ok) throw new Error("Failed to fetch attempts");
        const { data: attempts } = await attRes.json() as { data: Attempt[] };
        if (!attempts.length) { if (!cancelled) { setError(true); setLoading(false); } return; }

        const ids = attempts.map((a) => a.question_id).join(",");
        const qRes = await fetch(`/api/questions?ids=${ids}`);
        if (!qRes.ok) throw new Error("Failed to fetch questions");
        const { data: questions } = await qRes.json() as { data: Question[] };

        const qMap = new Map(questions.map((q) => [q.id, q]));
        const merged: ReviewItem[] = [];
        for (const a of attempts) {
          const q = qMap.get(a.question_id);
          if (q) merged.push({ ...q, userAnswer: a.selected_answer, correct: a.correct });
        }

        if (!cancelled) { setItems(merged); setLoading(false); }
      } catch (err) {
        console.error("Review fetch error:", err);
        if (!cancelled) { setError(true); setLoading(false); }
      }
    })();

    return () => { cancelled = true; };
  }, [sessionId]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 32, height: 32, border: `3px solid ${c.ac}44`, borderTopColor: c.ac, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: c.mt, fontSize: 14 }}>Loading review...</p>
        </div>
      </div>
    );
  }

  if (error || !items.length) {
    return (
      <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b }}>
        <Ctn style={{ padding: "120px 28px", textAlign: "center" }}>
          <p style={{ color: c.mt }}>No session data found.</p>
          <Btn onClick={() => router.push("/dashboard")} style={{ marginTop: 14 }}>Dashboard</Btn>
        </Ctn>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, transition: "background .4s, color .4s" }}>
      <Hdr
        left={
          <>
            <Btn v="ghost" sz="sm" onClick={() => router.push("/dashboard")}>← Back</Btn>
            <span style={{ fontWeight: 600, fontSize: 14.5 }}>Session Review</span>
          </>
        }
        right={<ThemeToggle />}
      />
      <Ctn style={{ padding: "44px 28px" }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          {items.map((q, i) => (
            <Card key={i} hover style={{ marginBottom: 12, borderLeft: `3px solid ${q.correct ? c.gn : c.rd}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: c.mt }}>{q.section}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, color: "#fff", background: q.correct ? c.gn : c.rd }}>{q.correct ? "Correct" : "Incorrect"}</span>
              </div>
              {q.passage_text && (
                <div style={{ background: c.mtBg, padding: 12, borderRadius: 10, margin: "8px 0", fontSize: 13.5, lineHeight: 1.7, color: c.fgS }}>{q.passage_text}</div>
              )}
              <h4 style={{ fontWeight: 600, margin: "8px 0", fontSize: 13.5, lineHeight: 1.5 }}>{q.question_text}</h4>
              {q.options.map((o, j) => (
                <div key={j} style={{
                  padding: "7px 12px", borderRadius: 8, marginBottom: 2, fontSize: 13,
                  border: `1.5px solid ${o === q.correct_answer ? c.gn : o === q.userAnswer ? c.rd : c.bd}`,
                  background: o === q.correct_answer ? c.gnS : o === q.userAnswer ? c.rdS : "transparent",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span>{o}</span>
                  {o === q.correct_answer && Icons.check(c.gn)}
                  {o === q.userAnswer && o !== q.correct_answer && Icons.x(c.rd)}
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

export default function ReviewPage() {
  return (
    <Suspense fallback={<div style={{ padding: 100, textAlign: "center" }}>Loading...</div>}>
      <ReviewContent />
    </Suspense>
  );
}
