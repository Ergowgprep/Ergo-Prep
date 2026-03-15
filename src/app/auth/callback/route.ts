import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? null;

  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if this is a password recovery flow
      const { data: { user } } = await supabase.auth.getUser();
      // Supabase sets the recovery factor when the code is from a password reset
      const isRecovery = searchParams.get("type") === "recovery";
      if (isRecovery) {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // If a specific redirect was requested, use it
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // Check profile to decide where to redirect
      try {
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("university")
            .eq("id", user.id)
            .single();

          if (profile?.university) {
            return NextResponse.redirect(`${origin}/dashboard`);
          }
        }
      } catch {
        // Fall through to onboarding
      }

      return NextResponse.redirect(`${origin}/onboarding`);
    }
  }

  // If code exchange failed or no code, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
