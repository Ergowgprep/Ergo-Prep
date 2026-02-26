"use client";
import { useRouter } from "next/navigation";
import { getColors, fonts } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { Btn, Ctn, Hdr, Ftr, ThemeToggle } from "@/components/ui";

export default function PrivacyPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = getColors(theme === "dark");

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, transition: "background .4s, color .4s" }}>
      <Hdr
        left={<Btn v="ghost" sz="sm" onClick={() => router.push("/")}>← Back</Btn>}
        right={<ThemeToggle />}
      />
      <Ctn style={{ padding: "60px 28px", maxWidth: 640 }}>
        <h1 className="s1" style={{ fontFamily: fonts.d, fontSize: 34, fontStyle: "italic", marginBottom: 22 }}>Privacy Policy</h1>
        <div className="s2" style={{ color: c.fgS, lineHeight: 1.9, fontSize: 14.5 }}>
          <p style={{ marginBottom: 14 }}>Placeholder for the privacy policy of the Ergo platform. Full legal text would appear here in production.</p>
          <p style={{ marginBottom: 14 }}>Last updated January 2026. Contact our legal team for questions.</p>
          <p>By using this platform, you agree to these terms and our privacy practices.</p>
        </div>
      </Ctn>
      <Ftr />
    </div>
  );
}