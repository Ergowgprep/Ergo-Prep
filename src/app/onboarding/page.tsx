"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getColors, fonts } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { Btn, Card, Ctn, Icons } from "@/components/ui";
import { useAuth } from "@/lib/AuthContext";

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgraduate", "Graduate / Alumni"];

export default function OnboardingPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = getColors(theme === "dark");
  const { user, refreshProfile } = useAuth();

  const [name, setName] = useState("");
  const [uni, setUni] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameF, setNF] = useState(false);
  const [uniF, setUF] = useState(false);
  const [courseF, setCF] = useState(false);

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

  const handleSubmit = async () => {
    if (!canSubmit || !user) return;
    setLoading(true);

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
        console.error("Onboarding save error:", await res.text());
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Onboarding save error:", err);
      setLoading(false);
      return;
    }

    await refreshProfile();
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, transition: "background .4s, color .4s" }}>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 480, animation: "fu .5s ease both" }}>

          <div style={{ textAlign: "center", marginBottom: 34 }}>
            <div style={{
              width: 46, height: 46, background: c.ac, borderRadius: 12,
              display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
            }}>
              <span style={{ fontFamily: fonts.m, fontWeight: 700, fontSize: 21, color: c.acF }}>∴</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.02em", marginBottom: 7 }}>Welcome to Ergo</h1>
            <p style={{ color: c.fgS, fontSize: 14.5, lineHeight: 1.5 }}>Tell us a bit about yourself to get started.</p>
          </div>

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
                <p style={{ fontSize: 13, color: c.mt }}>This helps us understand our users</p>
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
                <input
                  type="text"
                  value={uni}
                  onChange={(e) => setUni(e.target.value)}
                  onFocus={() => setUF(true)}
                  onBlur={() => setUF(false)}
                  placeholder="e.g. University of Warwick"
                  style={inp(uniF)}
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

              <Btn full sz="lg" disabled={!canSubmit || loading} onClick={handleSubmit} style={{ marginTop: 6 }}>
                {loading ? (
                  <div style={{
                    width: 18, height: 18, border: `2px solid ${c.acF}44`,
                    borderTopColor: c.acF, borderRadius: "50%", animation: "spin .8s linear infinite",
                  }} />
                ) : (
                  <>Continue to Dashboard {Icons.arr}</>
                )}
              </Btn>
            </div>
          </Card>

          <p style={{ textAlign: "center", fontSize: 11.5, color: c.mt, marginTop: 16, lineHeight: 1.6 }}>
            You can update these details anytime in your profile settings.
          </p>
        </div>
      </div>
    </div>
  );
}