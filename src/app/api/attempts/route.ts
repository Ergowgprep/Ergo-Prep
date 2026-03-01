import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
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

    const fields = req.nextUrl.searchParams.get("fields") || "section, correct";
    const sessionId = req.nextUrl.searchParams.get("session_id");

    let query = supabase
      .from("attempts")
      .select(fields)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data: data ?? [] });
  } catch (err) {
    console.error("Attempts GET error:", err);
    return NextResponse.json({ error: "Failed to fetch attempts" }, { status: 500 });
  }
}

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

    const { attempts } = await req.json() as {
      attempts: { question_id: number; section: string; selected_answer: string; correct: boolean; mode: string; session_id?: string }[];
    };

    if (!attempts || !Array.isArray(attempts)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const rows = attempts.map((a) => ({
      user_id: user.id,
      question_id: a.question_id,
      section: a.section,
      selected_answer: a.selected_answer,
      correct: a.correct,
      mode: a.mode,
      session_id: a.session_id ?? null,
    }));

    const { error } = await supabase.from("attempts").insert(rows);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Attempts POST error:", err);
    return NextResponse.json({ error: "Failed to save attempts" }, { status: 500 });
  }
}