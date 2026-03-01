"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getColors, fonts, SECTIONS } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { Btn, Card, Ctn, Mono, Hdr, ThemeToggle } from "@/components/ui";

export default function TestPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = getColors(theme === "dark");
  const [newOnly, setNewOnly] = useState(false);
  const [newH, sNewH] = useState(false);

  const comp = [
    { s: "Inference", n: 5 },
    { s: "Deduction", n: 5 },
    { s: "Assumptions", n: 12 },
    { s: "Interpretation", n: 6 },
    { s: "Arguments", n: 12 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, transition: "background .4s, color .4s" }}>
      <Hdr
        left={
          <>
            <Btn v="ghost" sz="sm" onClick={() => router.push("/dashboard")}>← Back</Btn>
            <span style={{ fontWeight: 600, fontSize: 14.5 }}>⏱️ Mock Test</span>
          </>
        }
        right={<ThemeToggle />}
      />
      <Ctn style={{ padding: "44px 28px" }}>
        <div style={{ maxWidth: 540, margin: "0 auto" }}>
          {/* Warning */}
          <Card className="s1" style={{ marginBottom: 18, background: theme === "dark" ? c.card : `${c.ac}06`, border: `1px solid ${c.ac}20` }}>
            <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: 14.5 }}>⚠️ Real Exam Conditions</h3>
            <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.8 }}>
              <strong>40 questions</strong> in <strong>40 minutes</strong>. Timer starts immediately. Auto-submits at expiry. No explanations until submission.
            </p>
          </Card>

          {/* Composition */}
          <Card className="s2" style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 14 }}>Composition</h3>
            {comp.map((r, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", padding: "9px 14px",
                background: c.mtBg, borderRadius: 8, marginBottom: 3, fontFamily: fonts.m, fontSize: 13,
              }}>
                <span>{r.s}</span>
                <span style={{ fontWeight: 700 }}>{r.n}</span>
              </div>
            ))}
            <div style={{
              display: "flex", justifyContent: "space-between", padding: "9px 14px",
              background: c.acS, borderRadius: 8, marginTop: 3, fontFamily: fonts.m, fontSize: 13, fontWeight: 700,
            }}>
              <span>TOTAL</span>
              <span>40</span>
            </div>
          </Card>

          {/* New questions only */}
          <Card className="s3" style={{ marginBottom: 18 }}>
            <div
              onClick={() => setNewOnly((p) => !p)}
              onMouseEnter={() => sNewH(true)}
              onMouseLeave={() => sNewH(false)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", borderRadius: 10, padding: "2px 0",
                background: newH ? c.mtBg : "transparent", transition: "background .15s",
              }}
            >
              <div>
                <h3 style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 2 }}>New questions only</h3>
                <p style={{ fontSize: 12.5, color: c.mt, lineHeight: 1.5 }}>
                  {newOnly ? "Only questions you haven't attempted" : "Includes previously attempted questions"}
                </p>
              </div>
              <div style={{
                width: 44, height: 24, borderRadius: 12, padding: 2,
                background: newOnly ? c.ac : c.bd,
                transition: "background .2s", flexShrink: 0, marginLeft: 14,
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 10, background: "#fff",
                  transition: "transform .2s", transform: newOnly ? "translateX(20px)" : "translateX(0)",
                  boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                }} />
              </div>
            </div>
          </Card>

          {/* Start button */}
          <Btn full sz="lg"
            onClick={() => {
              const params = new URLSearchParams({
                mode: "test",
                sections: SECTIONS.join(","),
                limit: "40",
                comp: JSON.stringify(comp),
              });
              if (newOnly) params.set("exclude_attempted", "true");
              router.push(`/quiz?${params.toString()}`);
            }}>
            Start 40-Minute Mock Test
          </Btn>
          <p style={{ textAlign: "center", fontSize: 12.5, color: c.mt, marginTop: 12 }}>
            Ensure 40 uninterrupted minutes
          </p>
        </div>
      </Ctn>
    </div>
  );
}