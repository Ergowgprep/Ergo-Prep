"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Auth callback error:", error);
        router.push("/login");
        return;
      }
      if (session?.user) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from("profiles")
          .select("university")
          .eq("id", session.user.id)
          .single();

        if (!profile?.university) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/login");
      }
    };
    handleCallback();
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 32, height: 32, border: "3px solid #C9A20044",
          borderTopColor: "#C9A200", borderRadius: "50%",
          animation: "spin .8s linear infinite", margin: "0 auto 16px",
        }} />
        <p style={{ color: "#999", fontSize: 14 }}>Signing you in...</p>
      </div>
    </div>
  );
}