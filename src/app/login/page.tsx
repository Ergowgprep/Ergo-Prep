"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getColors, fonts } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { supabase } from "@/lib/supabase";
import { Btn, Card, Ctn, Icons } from "@/components/ui";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 010-9.18l-7.98-6.19a24.1 24.1 0 000 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
);

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
    {open ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>)
      : (<><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>)}
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = getColors(theme === "dark");

  const [isSignUp, setISU] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setSPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailF, setEF] = useState(false);
  const [pwF, setPF] = useState(false);

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

  const handleOAuth = async (provider: "google" | "linkedin_oidc") => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  const onSubmit = async () => {
    setLoading(true);
    setError("");
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password: pw,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) { setError(error.message); setLoading(false); }
      else { setError(""); setLoading(false); alert("Check your email for a confirmation link!"); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) { setError(error.message); setLoading(false); }
      // AuthContext handles redirect
    }
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
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p style={{ color: c.fgS, fontSize: 14.5 }}>
            {isSignUp ? "Start your Watson-Glaser prep" : "Log in to continue practising"}
          </p>
        </div>

        <Card style={{ padding: 28 }}>
          {/* Error */}
          {error && (
            <div style={{ padding: "10px 14px", background: c.rdS, border: `1px solid ${c.rd}33`, borderRadius: 8, marginBottom: 16, fontSize: 13, color: c.rd }}>
              {error}
            </div>
          )}

          {/* OAuth */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
            <button onClick={() => handleOAuth("google")} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px 18px",
              background: c.bg, border: `1.5px solid ${c.bd}`, borderRadius: 10, cursor: "pointer",
              fontSize: 14, fontWeight: 600, color: c.fg, fontFamily: fonts.b, transition: "border-color .2s",
            }}>
              <GoogleIcon /> Continue with Google
            </button>
            <button onClick={() => handleOAuth("linkedin_oidc")} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "12px 18px",
              background: c.bg, border: `1.5px solid ${c.bd}`, borderRadius: 10, cursor: "pointer",
              fontSize: 14, fontWeight: 600, color: c.fg, fontFamily: fonts.b, transition: "border-color .2s",
            }}>
              <LinkedInIcon /> Continue with LinkedIn
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <div style={{ flex: 1, height: 1, background: c.bd }} />
            <span style={{ fontSize: 11.5, color: c.mt, fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: c.bd }} />
          </div>

          {/* Email + Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: c.mt, marginBottom: 5 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEF(true)} onBlur={() => setEF(false)} placeholder="you@example.com" style={inp(emailF)} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: c.mt }}>Password</label>
                {!isSignUp && <button style={{ fontSize: 11.5, color: c.ac, fontWeight: 600, cursor: "pointer", border: "none", background: "none", fontFamily: fonts.b }}>Forgot password?</button>}
              </div>
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)}
                  onFocus={() => setPF(true)} onBlur={() => setPF(false)} placeholder="••••••••"
                  style={{ ...inp(pwF), paddingRight: 46 }} />
                <button onClick={() => setSPw(!showPw)} style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  display: "flex", alignItems: "center", padding: 0, cursor: "pointer", border: "none", background: "none",
                }}><EyeIcon open={showPw} /></button>
              </div>
            </div>
            <Btn full sz="lg" disabled={loading || !email || !pw} onClick={onSubmit} style={{ marginTop: 4 }}>
              {loading ? (
                <div style={{ width: 18, height: 18, border: `2px solid ${c.acF}44`, borderTopColor: c.acF, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
              ) : (
                <>{isSignUp ? "Create Account" : "Log In"} {Icons.arr}</>
              )}
            </Btn>
          </div>

          {/* Toggle */}
          <div style={{ textAlign: "center", marginTop: 22, paddingTop: 18, borderTop: `1px solid ${c.bd}` }}>
            <span style={{ fontSize: 13.5, color: c.mt }}>
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button onClick={() => { setISU(!isSignUp); setError(""); }} style={{
                color: c.ac, fontWeight: 700, fontSize: 13.5, cursor: "pointer", border: "none", background: "none", fontFamily: fonts.b,
              }}>{isSignUp ? "Log in" : "Sign up"}</button>
            </span>
          </div>
        </Card>

        <p style={{ textAlign: "center", fontSize: 11.5, color: c.mt, marginTop: 18, lineHeight: 1.6 }}>
          By continuing, you agree to our{" "}
          <button onClick={() => router.push("/terms")} style={{ color: c.mt, textDecoration: "underline", fontSize: 11.5, cursor: "pointer", border: "none", background: "none", fontFamily: fonts.b }}>Terms</button>
          {" "}and{" "}
          <button onClick={() => router.push("/privacy")} style={{ color: c.mt, textDecoration: "underline", fontSize: 11.5, cursor: "pointer", border: "none", background: "none", fontFamily: fonts.b }}>Privacy Policy</button>
        </p>
      </div>
    </div>
  );
}