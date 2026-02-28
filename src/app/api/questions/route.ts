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

    const { sections } = await req.json() as {
      sections: { section: string; limit: number }[];
    };

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const results = await Promise.all(
      sections.map(async ({ section, limit }) => {
        if (limit === 0) return [];
        const { data, error } = await supabase
          .from("questions")
          .select("id, section, passage_text, question_text, options, correct_answer, explanation")
          .eq("section", section)
          .limit(Math.min(limit, 200));

        if (error) throw error;
        return data ?? [];
      })
    );

    return NextResponse.json({ data: results.flat() });
  } catch (err) {
    console.error("Questions API error:", err);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}