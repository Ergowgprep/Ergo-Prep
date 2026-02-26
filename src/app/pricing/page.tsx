"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getColors, fonts } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/AuthContext";
import { Btn, Card, Ctn, Hdr, IB, Mono, ThemeToggle, Icons } from "@/components/ui";

export default function PricingPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = getColors(theme === "dark");
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const feats = [
    "All 5 Watson-Glaser sections",
    "Learning, Practice & Mock modes",
    "Detailed explanations for every question",
    "Performance tracking vs. global averages",
    "Smart ranking adapts to your level",
  ];

  const tiers = [
    { id: "6h", name: "6-Hour Pass", price: "£1.99", hours: 6, sub: "6 hours", pop: false },
    { id: "24h", name: "24-Hour Pass", price: "£4.99", hours: 24, sub: "24 hours", pop: true },
    { id: "1w", name: "1-Week Pass", price: "£9.99", hours: 168, sub: "7 days", pop: false },
  ];

  const handleBuy = async (planId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, userId: user.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        setLoading(null);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setLoading(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, transition: "background .4s, color .4s" }}>
      <Hdr
        left={<Btn v="ghost" sz="sm" onClick={() => router.push("/")}>← Back</Btn>}
        right={<ThemeToggle />}
      />
      <Ctn style={{ padding: "80px 28px" }}>
        {/* Heading */}
        <div className="s1" style={{ textAlign: "center", marginBottom: 44 }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-.02em", marginBottom: 10 }}>Simple pricing</h1>
          <p style={{ fontSize: 15, color: c.fgS }}>No subscriptions. No hidden fees. Just pick your window.</p>
        </div>

        {/* Banner */}
        <div className="s2" style={{
          maxWidth: 700, margin: "0 auto 36px", padding: "16px 22px", borderRadius: 12,
          background: c.acS, border: `1px solid ${c.ac}25`, display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.6 }}>
            Every plan includes <strong style={{ color: c.fg }}>the exact same features</strong> — all 1,500+ questions, every mode, full analytics. The only difference is how long your access lasts.
          </p>
        </div>

        {/* Tier cards */}
        <div className="s3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, maxWidth: 800, margin: "0 auto 44px" }}>
          {tiers.map((t) => (
            <Card key={t.id} accent={t.pop} hover style={{ padding: 28, textAlign: "center", position: "relative", overflow: "hidden" }}>
              {t.pop && (
                <div style={{
                  position: "absolute", top: 12, right: 12, padding: "3px 10px", borderRadius: 100,
                  background: c.ac, fontSize: 10, fontWeight: 700, color: c.acF,
                  textTransform: "uppercase", letterSpacing: ".06em",
                }}>Popular</div>
              )}
              <div style={{ margin: "0 auto 14px" }}>
                <IB bg={t.pop ? c.ac : c.acS} size={48}>{Icons.clock(t.pop ? c.acF : c.ac)}</IB>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{t.name}</h3>
              <Mono style={{ fontSize: 38, fontWeight: 700, display: "block", marginBottom: 4 }}>{t.price}</Mono>
              <span style={{ fontSize: 13, color: c.mt, display: "block", marginBottom: 20 }}>{t.sub} of full access</span>
              <Btn
                full
                sz="md"
                v={t.pop ? "primary" : "outline"}
                disabled={loading === t.id}
                onClick={() => handleBuy(t.id)}
              >
                {loading === t.id ? (
                  <div style={{
                    width: 18, height: 18, border: `2px solid ${t.pop ? c.acF + "44" : c.ac + "44"}`,
                    borderTopColor: t.pop ? c.acF : c.ac, borderRadius: "50%",
                    animation: "spin .8s linear infinite",
                  }} />
                ) : (
                  t.pop ? "Get Started" : "Choose"
                )}
              </Btn>
            </Card>
          ))}
        </div>

        {/* Feature list */}
        <div className="s4" style={{ maxWidth: 400, margin: "0 auto 44px" }}>
          <h3 style={{
            fontSize: 14, fontWeight: 700, textAlign: "center", marginBottom: 16,
            color: c.fgS, textTransform: "uppercase", letterSpacing: ".08em",
          }}>Included in every plan</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {feats.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6, background: c.gnS,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>{Icons.check(c.gn)}</div>
                <span style={{ fontSize: 13.5, color: c.fgS }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Affordability section */}
        <div className="s5" style={{
          maxWidth: 560, margin: "0 auto", textAlign: "center", padding: "32px 28px",
          borderRadius: 14, background: c.card, border: `1px solid ${c.bd}`,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>I cannot afford this</h3>
          <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.75, marginBottom: 20 }}>
            Ergo&apos;s mission is to level the playing field. If you cannot afford my product, it is yours for free — just reach out to me with some details.
          </p>
          <Btn v="outline" onClick={() => window.open("mailto:hello@ergoprep.co.uk", "_blank")}>Contact us</Btn>
        </div>
      </Ctn>
    </div>
  );
}