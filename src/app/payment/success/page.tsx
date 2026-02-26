"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getColors, fonts } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/AuthContext";
import { Btn, Card, Ctn, Icons } from "@/components/ui";
import { Suspense } from "react";

function SuccessContent() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = getColors(theme === "dark");
  const { refreshProfile } = useAuth();
  const searchParams = useSearchParams();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Refresh profile to pick up new access_expires_at
    const init = async () => {
      await refreshProfile();
      setLoaded(true);
    };
    init();
  }, [refreshProfile]);

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 480, textAlign: "center", animation: "fu .5s ease both" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-.02em", marginBottom: 10 }}>You&apos;re all set!</h1>
        <p style={{ color: c.fgS, fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
          Your access is now active. Start practising with 1,500+ questions across all five Watson-Glaser sections.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Btn sz="lg" onClick={() => router.push("/dashboard")}>Go to Dashboard {Icons.arr}</Btn>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><p>Loading...</p></div>}>
      <SuccessContent />
    </Suspense>
  );
}