"use client";
import { useRouter } from "next/navigation";
import { getColors, fonts } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { Btn, Ctn, Hdr, Ftr, ThemeToggle } from "@/components/ui";

export default function AboutPage() {
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
        <h1 className="s1" style={{ fontFamily: fonts.d, fontSize: 34, fontStyle: "italic", marginBottom: 22 }}>About Us</h1>
        <div className="s2" style={{ color: c.fgS, lineHeight: 1.9, fontSize: 14.5 }}>
          <p style={{ marginBottom: 14 }}>Ergo was built to level the playing field for Watson-Glaser test preparation. Too many candidates are priced out of quality prep materials.</p>
          <p style={{ marginBottom: 14 }}>We offer 1,500+ practice questions across all five Watson-Glaser sections, with detailed explanations for every answer. Our content is designed by lawyers and trainees who&apos;ve taken the test themselves.</p>
          <p>Questions? Reach out at <a href="mailto:ergoprepuk@gmail.com" style={{ color: c.ac, textDecoration: "underline" }}>ergoprepuk@gmail.com</a></p>
        </div>
      </Ctn>
      <Ftr />
    </div>
  );
}