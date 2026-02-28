import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("access_expires_at")
      .eq("id", user.id)
      .single();

    const hasAccess =
      profile?.access_expires_at &&
      new Date(profile.access_expires_at) > new Date();

    if (!hasAccess) {
      return NextResponse.json({ error: "Access expired" }, { status: 403 });
    }

    const { mode, sections, total_questions, score } = await req.json() as {
      mode: string;
      sections: string[];
      total_questions: number;
      score: number;
    };

    const { data, error } = await supabase
      .from("test_sessions")
      .insert({ user_id: user.id, mode, sections, total_questions, score })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error("Sessions POST error:", err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}