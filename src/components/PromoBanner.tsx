"use client";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";
import { getColors, fonts } from "@/lib/theme";

export default function PromoBanner() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const c = getColors(isDark);

  if (loading || user) return null;

  return (
    <div
      style={{
        height: 38,
        background: isDark ? c.acM : c.acS,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: fonts.b,
        fontSize: 12.5,
        color: "#000",
        flexShrink: 0,
      }}
    >
      <a
        href="/login"
        style={{
          color: "#000",
          textDecoration: "none",
          transition: "color .2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = c.ac; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#000"; }}
      >
        Part of a university law society? Click here for reduced pricing!
      </a>
    </div>
  );
}
