"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";
import { getColors, fonts } from "@/lib/theme";

const DISMISS_KEY = "ergo_promo_banner_dismissed";

export default function PromoBanner() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const c = getColors(theme === "dark");
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {}
  }, []);

  if (loading || user || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch {}
  };

  return (
    <div
      style={{
        height: 38,
        background: c.ac + "18",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: fonts.b,
        fontSize: 12.5,
        color: c.fgS,
        position: "relative",
        flexShrink: 0,
      }}
    >
      <a
        href="/login"
        style={{
          color: c.fgS,
          textDecoration: "none",
          transition: "color .2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = c.fg; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = c.fgS; }}
      >
        Part of a university law society? Create an account to enter your code for reduced pricing{" "}
        <span style={{ color: c.ac, fontWeight: 600 }}>&rarr;</span>
      </a>
      <button
        onClick={dismiss}
        aria-label="Dismiss banner"
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: c.mt,
          fontSize: 16,
          lineHeight: 1,
          padding: "2px 6px",
          borderRadius: 4,
          transition: "color .2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = c.fg; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = c.mt; }}
      >
        &times;
      </button>
    </div>
  );
}
