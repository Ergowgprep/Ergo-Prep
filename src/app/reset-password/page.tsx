"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getColors, fonts } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { supabase } from "@/lib/supabase";
import { Btn, Card, Icons } from "@/components/ui";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = getColors(theme === "dark");

  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const [pwF, setPF] = useState(false);
  const [cfF, setCF] = useState(false);

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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Also check if we already have a session (user may have arrived via redirect)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  const onSubmit = async () => {
    setError("");
    if (pw !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (pw.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 400, animation: "fu .5s ease both" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <div style={{ width: 46, height: 46, background: c.ac, borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 18, cursor: "pointer" }}
            onClick={() => router.push("/")}>
            <span style={{ fontFamily: fonts.m, fontWeight: 700, fontSize: 21, color: c.acF }}>∴</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.02em", marginBottom: 7 }}>
            Reset your password
          </h1>
          <p style={{ color: c.fgS, fontSize: 14.5 }}>
            Enter a new password for your account
          </p>
        </div>

        <Card style={{ padding: 28 }}>
          {!ready ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{
                width: 24, height: 24, border: `2.5px solid ${c.ac}44`,
                borderTopColor: c.ac, borderRadius: "50%",
                animation: "spin .8s linear infinite", margin: "0 auto 14px",
              }} />
              <p style={{ color: c.mt, fontSize: 13.5 }}>Verifying reset link...</p>
            </div>
          ) : success ? (
            <div style={{ textAlign: "center", animation: "fu .3s ease both" }}>
              <div style={{ padding: "10px 14px", background: c.gnS, border: `1px solid ${c.gn}33`, borderRadius: 8, marginBottom: 18, fontSize: 13, color: c.gn }}>
                Password updated successfully!
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Btn full sz="lg" onClick={() => router.push("/login")}>
                  Go to login {Icons.arr}
                </Btn>
                <Btn full sz="lg" v="outline" onClick={() => router.push("/dashboard")}>
                  Go to dashboard {Icons.arr}
                </Btn>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fu .3s ease both" }}>
              {/* Error */}
              {error && (
                <div style={{ padding: "10px 14px", background: c.rdS, border: `1px solid ${c.rd}33`, borderRadius: 8, fontSize: 13, color: c.rd }}>
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: c.mt, marginBottom: 5 }}>New password</label>
                <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
                  onFocus={() => setPF(true)} onBlur={() => setPF(false)} placeholder="••••••••" style={inp(pwF)} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: c.mt, marginBottom: 5 }}>Confirm password</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  onFocus={() => setCF(true)} onBlur={() => setCF(false)} placeholder="••••••••" style={inp(cfF)} />
              </div>
              <Btn full sz="lg" disabled={loading || !pw || !confirm} onClick={onSubmit} style={{ marginTop: 4 }}>
                {loading ? (
                  <div style={{ width: 18, height: 18, border: `2px solid ${c.acF}44`, borderTopColor: c.acF, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                ) : (
                  <>Reset Password {Icons.arr}</>
                )}
              </Btn>
            </div>
          )}
        </Card>

        <p style={{ textAlign: "center", fontSize: 11.5, color: c.mt, marginTop: 18, lineHeight: 1.6 }}>
          Remember your password?{" "}
          <button onClick={() => router.push("/login")} style={{ color: c.ac, fontWeight: 700, fontSize: 11.5, cursor: "pointer", border: "none", background: "none", fontFamily: fonts.b }}>
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
