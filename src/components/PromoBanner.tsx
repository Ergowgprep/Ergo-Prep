"use client";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";
import { getColors, fonts } from "@/lib/theme";
import { usePathname } from "next/navigation";

export default function PromoBanner() {
  const { user, profile, loading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const c = getColors(isDark);
  const pathname = usePathname();

  const hiddenPages = ["/quiz", "/results", "/review"];

  if (loading) return null;
  if (hiddenPages.includes(pathname)) return null;
  if (user && profile?.promo_code) return null;

  const href = user ? "/profile" : "/login";

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
        href={href}
        style={{
          color: "#000",
          textDecoration: "none",
          transition: "color .2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = c.ac; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#000"; }}
      >
        Part of a university law society? Enter a code like WARWICK-LAW for reduced pricing!
      </a>
    </div>
  );
}
