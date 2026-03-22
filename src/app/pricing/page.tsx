"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getColors, fonts } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/AuthContext";
import { Btn, Card, Ctn, Hdr, IB, Mono, ThemeToggle, Icons } from "@/components/ui";
import { Lightbulb } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = getColors(theme === "dark");
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMsg, setPromoMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const hasPromo = !!profile?.promo_code;

  const feats = [
    "All 5 Watson-Glaser sections",
    "Learning, Practice & Mock modes",
    "Detailed explanations for every question",
    "Performance tracking vs. global averages",
    "Smart ranking adapts to your level",
  ];

  const tiers = [
    { id: "6h",  name: "6-Hour Pass",  price: "£4.99",  promoPrice: "£1.99",  hours: 6,   sub: "6 hours",  pop: false },
    { id: "24h", name: "24-Hour Pass", price: "£7.99",  promoPrice: "£4.99",  hours: 24,  sub: "24 hours", pop: true },
    { id: "1w",  name: "1-Week Pass",  price: "£10.99", promoPrice: "£9.99",  hours: 168, sub: "7 days",   pop: false },
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

  const handlePromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoMsg(null);
    try {
      const check = await fetch(`/api/promo?code=${encodeURIComponent(code)}`);
      const checkData = await check.json();
      if (!checkData.valid) {
        setPromoMsg({ text: checkData.reason || "Invalid code", ok: false });
        setPromoLoading(false);
        return;
      }
      const redeem = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const redeemData = await redeem.json();
      if (redeemData.success) {
        setPromoMsg({ text: `Society discount applied — ${redeemData.society_name}`, ok: true });
        await refreshProfile();
      } else {
        setPromoMsg({ text: redeemData.error || "Could not apply code", ok: false });
      }
    } catch {
      setPromoMsg({ text: "Something went wrong — try again", ok: false });
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, transition: "background .4s, color .4s" }}>
      <Hdr
        left={<Btn v="ghost" sz="sm" onClick={() => router.push("/")}>← Back</Btn>}
        right={<ThemeToggle />}
      />
      <Ctn style={{ padding: isMobile ? "40px 16px" : "80px 28px" }}>
        {/* Heading */}
        <div className="s1" style={{ textAlign: "center", marginBottom: 44 }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-.02em", marginBottom: 10 }}>Simple pricing</h1>
          <p style={{ fontSize: 15, color: c.fgS }}>No subscriptions. Just pick your window.</p>
        </div>

        {/* Banner */}
        <div className="s2" style={{
          maxWidth: 700, margin: "0 auto 36px", padding: "16px 22px", borderRadius: 12,
          background: c.acS, border: `1px solid ${c.ac}25`, display: "flex", flexDirection: isMobile ? "column" : "row", textAlign: isMobile ? "center" : "left", alignItems: "center", gap: 12,
        }}>
          <Lightbulb size={20} color={c.ac} />
          <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.6 }}>
            Every plan includes <strong style={{ color: c.fg }}>the exact same features</strong> — all 1,500+ questions, every mode, full analytics.
            {hasPromo
              ? <> Your society discount is applied — prices start from <strong style={{ color: c.fg }}>just £1.99</strong>.</>
              : <> The only difference is how long your access lasts.</>
            }
          </p>
        </div>

        {/* Promo banner */}
        {hasPromo && (
          <div style={{
            maxWidth: 800, margin: "0 auto 20px", padding: "10px 18px", borderRadius: 10,
            background: c.gnS, border: `1px solid ${c.gn}25`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span style={{ fontSize: 13.5, color: c.gn, fontWeight: 600 }}>
              ✓ Society discount applied — your reduced prices are shown below
            </span>
          </div>
        )}

        {/* Tier cards */}
        <div className="s3" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 16, maxWidth: 800, margin: "0 auto 44px" }}>
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
              {hasPromo ? (
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 16, color: c.mt, textDecoration: "line-through", marginRight: 8 }}>{t.price}</span>
                  <Mono style={{ fontSize: 38, fontWeight: 700 }}>{t.promoPrice}</Mono>
                </div>
              ) : (
                <Mono style={{ fontSize: 38, fontWeight: 700, display: "block", marginBottom: 4 }}>{t.price}</Mono>
              )}
              <span style={{ fontSize: 13, color: c.mt, display: "block", marginBottom: hasPromo ? 20 : 4 }}>{t.sub} of full access</span>
              {!hasPromo && (
                <span style={{ fontSize: 12, color: c.ac, display: "block", marginBottom: 14 }}>
                  {t.promoPrice} with a society code
                </span>
              )}
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

        {/* Promo code input — logged-in users without a code */}
        {user && !hasPromo && (
          <div style={{
            maxWidth: 800, margin: "0 auto 36px", padding: "16px 22px", borderRadius: 12,
            background: c.card, border: `1px solid ${c.bd}`,
            display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: c.fgS, whiteSpace: "nowrap" }}>Have a society code?</span>
            <input
              type="text"
              placeholder="e.g. WARWICK-LAW"
              value={promoInput}
              onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoMsg(null); }}
              onKeyDown={(e) => e.key === "Enter" && handlePromo()}
              style={{
                flex: "1 1 160px", minWidth: 0, padding: "8px 12px", borderRadius: 8,
                border: `1px solid ${c.bd}`, background: c.bg, color: c.fg,
                fontSize: 13.5, fontFamily: fonts.b, outline: "none",
                textTransform: "uppercase", letterSpacing: ".04em",
              }}
            />
            <Btn v="outline" sz="sm" disabled={promoLoading || !promoInput.trim()} onClick={handlePromo}>
              {promoLoading ? "Applying…" : "Apply"}
            </Btn>
            {promoMsg && (
              <span style={{
                width: "100%", fontSize: 12.5, fontWeight: 600,
                color: promoMsg.ok ? c.gn : c.rd,
              }}>
                {promoMsg.ok ? "✓" : "✗"} {promoMsg.text}
              </span>
            )}
          </div>
        )}

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
          maxWidth: 560, margin: "0 auto", textAlign: "center", padding: isMobile ? "24px 16px" : "32px 28px",
          borderRadius: 14, background: c.card, border: `1px solid ${c.bd}`,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>I cannot afford this</h3>
          <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.75, marginBottom: 20 }}>
            Ergo&apos;s mission is to level the playing field. If you cannot afford our product, we can provide a pass for free — just reach out with some details.
          </p>
          <Btn v="outline" onClick={() => window.open("mailto:hello@ergoprep.co.uk", "_blank")}>Contact us</Btn>
        </div>
      </Ctn>
    </div>
  );
}
