"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getColors, fonts } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { Btn, Card, Ctn, Hdr, ThemeToggle, Icons, SearchableDropdown } from "@/components/ui";
import { useAuth } from "@/lib/AuthContext";
import { UK_UNIVERSITIES } from "@/lib/universities";

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgraduate", "Graduate / Alumni"];

export default function ProfilePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = getColors(theme === "dark");

  const { user, profile: authProfile, refreshProfile, signOut } = useAuth();

  const [name, setName] = useState(authProfile?.name || "");
  const [uni, setUni] = useState(authProfile?.university || "");
  const [course, setCourse] = useState(authProfile?.course || "");
  const [year, setYear] = useState(authProfile?.year_of_study || "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [nameF, setNF] = useState(false);

  const [courseF, setCF] = useState(false);

  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMsg, setPromoMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [promoF, setPF] = useState(false);

  const canSubmit = name.trim() && uni.trim() && course.trim() && year;

  const inp = (focused: boolean) => ({
    width: "100%",
    padding: "14px 16px",
    background: c.bg,
    border: `1.5px solid ${focused ? c.ac : c.bd}`,
    borderRadius: 10,
    color: c.fg,
    fontSize: 15,
    fontFamily: fonts.b,
    outline: "none",
    transition: "border-color .2s, box-shadow .2s",
    boxShadow: focused ? `0 0 0 3px ${c.acS}` : "none",
  });

  const handleSave = async () => {
    if (!canSubmit || !user) return;
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          university: uni.trim(),
          course: course.trim(),
          year_of_study: year,
        }),
      });

      if (!res.ok) {
        console.error("Profile save error:", await res.text());
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Profile save error:", err);
      setLoading(false);
      return;
    }

    await refreshProfile();
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePromo = async () => {
    const code = promoInput.trim();
    if (!code || !user) return;
    setPromoLoading(true);
    setPromoMsg(null);

    try {
      const valRes = await fetch(`/api/promo?code=${encodeURIComponent(code)}`);
      const valData = await valRes.json();
      if (!valData.valid) {
        setPromoMsg({ ok: false, text: valData.reason || "Invalid code" });
        setPromoLoading(false);
        return;
      }

      const redeemRes = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const redeemData = await redeemRes.json();
      if (!redeemRes.ok) {
        setPromoMsg({ ok: false, text: redeemData.error || "Failed to apply code" });
        setPromoLoading(false);
        return;
      }

      await refreshProfile();
      setPromoMsg({ ok: true, text: `Code applied — ${redeemData.society_name || "society"} discount active` });
    } catch {
      setPromoMsg({ ok: false, text: "Something went wrong. Please try again." });
    }
    setPromoLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, transition: "background .4s, color .4s" }}>
      <Hdr
        left={
          <>
            <Btn v="ghost" sz="sm" onClick={() => router.push("/dashboard")}>← Back</Btn>
            <span style={{ fontWeight: 600, fontSize: 14.5 }}>Your Profile</span>
          </>
        }
        right={<ThemeToggle />}
      />

      <Ctn style={{ padding: "44px 28px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <Card style={{ padding: 30 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: c.acS,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {Icons.user(c.ac)}
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Student Profile</h3>
                <p style={{ fontSize: 13, color: c.mt }}>Update your details below</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: c.mt, marginBottom: 5 }}>First Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setNF(true)}
                  onBlur={() => setNF(false)}
                  placeholder="e.g. Irfaan"
                  style={inp(nameF)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: c.mt, marginBottom: 5 }}>University</label>
                <SearchableDropdown
                  value={uni}
                  onChange={setUni}
                  options={UK_UNIVERSITIES}
                  placeholder="e.g. University of Warwick"
                  inputStyle={inp}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: c.mt, marginBottom: 5 }}>Course / Degree</label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  onFocus={() => setCF(true)}
                  onBlur={() => setCF(false)}
                  placeholder="e.g. Law"
                  style={inp(courseF)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: c.mt, marginBottom: 8 }}>Year of Study</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {YEARS.map((y) => {
                    const isSel = year === y;
                    return (
                      <button
                        key={y}
                        onClick={() => setYear(y)}
                        style={{
                          padding: "12px 16px",
                          borderRadius: 10,
                          border: `1.5px solid ${isSel ? c.ac : c.bd}`,
                          background: isSel ? c.acS : "transparent",
                          color: isSel ? c.ac : c.fg,
                          fontSize: 13.5,
                          fontWeight: isSel ? 700 : 500,
                          cursor: "pointer",
                          fontFamily: fonts.b,
                          transition: "all .2s",
                        }}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <Btn v="outline" full onClick={() => router.push("/dashboard")}>Cancel</Btn>
                <Btn full disabled={!canSubmit || loading} onClick={handleSave}>
                  {loading ? (
                    <div style={{
                      width: 18, height: 18, border: `2px solid ${c.acF}44`,
                      borderTopColor: c.acF, borderRadius: "50%", animation: "spin .8s linear infinite",
                    }} />
                  ) : saved ? (
                    <>{Icons.check("#fff")} Saved!</>
                  ) : (
                    "Save Changes"
                  )}
                </Btn>
              </div>
            </div>
          </Card>

          {/* Society Code */}
          <div style={{ marginTop: 20, padding: "22px 24px", background: c.card, borderRadius: 14, border: `1px solid ${c.bd}` }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: c.mt, marginBottom: 8 }}>Society Code</label>
            {authProfile?.promo_code ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="text"
                  value={authProfile.promo_code}
                  readOnly
                  style={{ ...inp(false), background: c.mtBg, color: c.mt, cursor: "default", flex: 1 }}
                />
                <span style={{
                  padding: "6px 12px", borderRadius: 8, background: c.gnS,
                  fontSize: 12, fontWeight: 700, color: c.gn, whiteSpace: "nowrap",
                }}>Applied</span>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    onFocus={() => setPF(true)}
                    onBlur={() => setPF(false)}
                    placeholder="e.g. WARWICK-LAW"
                    style={{ ...inp(promoF), flex: 1 }}
                  />
                  <Btn v="primary" sz="md" disabled={!promoInput.trim() || promoLoading} onClick={handlePromo}>
                    {promoLoading ? (
                      <div style={{
                        width: 16, height: 16, border: `2px solid ${c.acF}44`,
                        borderTopColor: c.acF, borderRadius: "50%", animation: "spin .8s linear infinite",
                      }} />
                    ) : "Apply Code"}
                  </Btn>
                </div>
                {promoMsg && (
                  <p style={{ fontSize: 12.5, marginTop: 8, color: promoMsg.ok ? c.gn : c.rd, fontWeight: 500 }}>
                    {promoMsg.ok ? "✓" : "✗"} {promoMsg.text}
                  </p>
                )}
              </>
            )}
          </div>

          <div style={{ marginTop: 20, padding: "18px 24px", background: c.card, borderRadius: 14, border: `1px solid ${c.bd}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Log out</p>
              <p style={{ fontSize: 12.5, color: c.mt }}>Signed in as {authProfile?.email || "—"}</p>
            </div>
            <Btn v="outline" sz="sm" onClick={() => signOut()}>Log out</Btn>
          </div>
        </div>
      </Ctn>
    </div>
  );
}