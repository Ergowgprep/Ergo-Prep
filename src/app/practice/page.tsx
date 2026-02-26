"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getColors, fonts, SECTIONS } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { Btn, Card, Ctn, Hdr, ThemeToggle } from "@/components/ui";

export default function PracticePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = getColors(theme === "dark");
  const acColor = c.gn;
  const acBg = c.gnS;

  const [sel, setSel] = useState<string[]>([...SECTIONS]);
  const [cnt, setCnt] = useState(20);

  const tog = (s: string) =>
    setSel((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, transition: "background .4s, color .4s" }}>
      <Hdr
        left={
          <>
            <Btn v="ghost" sz="sm" onClick={() => router.push("/dashboard")}>← Back</Btn>
            <span style={{ fontWeight: 600, fontSize: 14.5 }}>🎯 Practice Setup</span>
          </>
        }
        right={<ThemeToggle />}
      />
      <Ctn style={{ padding: "44px 28px" }}>
        <div style={{ maxWidth: 540, margin: "0 auto" }}>
          {/* About */}
          <Card className="s1" style={{ marginBottom: 18, background: theme === "dark" ? c.card : `${acColor}06`, border: `1px solid ${acColor}20` }}>
            <h3 style={{ fontWeight: 700, marginBottom: 5, fontSize: 14.5 }}>About Practice Mode</h3>
            <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}>Explanations shown after answering. Customise sections and volume.</p>
          </Card>

          {/* Sections */}
          <Card className="s2" style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 14 }}>Sections</h3>
            {SECTIONS.map((s) => (
              <div key={s} onClick={() => tog(s)} style={{
                display: "flex", alignItems: "center", gap: 11, padding: "11px 14px", borderRadius: 10,
                cursor: "pointer", marginBottom: 3, background: sel.includes(s) ? acBg : "transparent", transition: "background .15s",
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6, border: `2px solid ${sel.includes(s) ? acColor : c.bd}`,
                  background: sel.includes(s) ? acColor : "transparent", display: "flex", alignItems: "center",
                  justifyContent: "center", transition: "all .2s",
                }}>
                  {sel.includes(s) && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>}
                </div>
                <span style={{ fontWeight: 500, fontSize: 13.5 }}>{s}</span>
              </div>
            ))}
          </Card>

          {/* Volume */}
          <Card className="s3" style={{ marginBottom: 18 }}>
            <style>{`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}input[type=number]{-moz-appearance:textfield;}`}</style>
            <h3 style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 14 }}>Volume</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: c.mt }}>Questions</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => setCnt((p) => Math.max(1, p - 1))} style={{
                  width: 30, height: 30, borderRadius: 8, border: "1.5px solid " + c.bd, background: "transparent",
                  color: c.fgS, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", fontFamily: fonts.m, transition: "all .15s",
                }}>-</button>
                <input type="number" min={1} max={50} value={cnt} onChange={(e) => { const v = Math.max(1, Math.min(50, +e.target.value || 1)); setCnt(v); }}
                  style={{
                    width: 52, textAlign: "center", fontSize: 20, fontWeight: 700, fontFamily: fonts.m,
                    background: c.bg, border: "1.5px solid " + c.bd, borderRadius: 8, color: c.fg, padding: "4px 0", outline: "none",
                  }} />
                <button onClick={() => setCnt((p) => Math.min(50, p + 1))} style={{
                  width: 30, height: 30, borderRadius: 8, border: "1.5px solid " + c.bd, background: "transparent",
                  color: c.fgS, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", fontFamily: fonts.m, transition: "all .15s",
                }}>+</button>
              </div>
            </div>
            <input type="range" min={5} max={50} value={Math.min(cnt, 50)} onChange={(e) => setCnt(+e.target.value)}
              style={{ width: "100%", accentColor: c.gn }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 11, color: c.mt }}>5</span>
              <span style={{ fontSize: 11, color: c.mt }}>20</span>
            </div>
          </Card>

          {/* Start button */}
          <Btn full sz="lg" v="green" disabled={sel.length === 0}
            onClick={() => {
              const params = new URLSearchParams({
                mode: "practice",
                sections: sel.join(","),
                limit: String(cnt),
              });
              router.push(`/quiz?${params.toString()}`);
            }}>
            Start Practice ({sel.length} sections, {cnt} questions)
          </Btn>
        </div>
      </Ctn>
    </div>
  );
}