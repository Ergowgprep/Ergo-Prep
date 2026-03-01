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

    const { sections, exclude_attempted } = await req.json() as {
      sections: { section: string; limit: number }[];
      exclude_attempted?: boolean;
    };

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Build set of attempted question IDs when exclusion is requested
    let attemptedIds: Set<number> | null = null;
    if (exclude_attempted) {
      const { data: attempts } = await supabase
        .from("attempts")
        .select("question_id")
        .eq("user_id", user.id);
      if (attempts) {
        attemptedIds = new Set(attempts.map((a) => a.question_id));
      }
    }

    const results = await Promise.all(
      sections.map(async ({ section, limit }) => {
        if (limit === 0) return [];
        const safeLimit = Math.min(limit, 200);

        const { data, error } = await supabase
          .from("questions")
          .select("id, section, passage_text, question_text, options, correct_answer, explanation")
          .eq("section", section)
          .limit(attemptedIds ? safeLimit + attemptedIds.size : safeLimit);

        if (error) throw error;
        if (!data) return [];

        if (!attemptedIds) return data.slice(0, safeLimit);

        // Prefer unattempted questions, fall back to attempted to fill the limit
        const fresh = data.filter((q) => !attemptedIds!.has(q.id));
        if (fresh.length >= safeLimit) return fresh.slice(0, safeLimit);
        const attempted = data.filter((q) => attemptedIds!.has(q.id));
        return [...fresh, ...attempted].slice(0, safeLimit);
      })
    );

    return NextResponse.json({ data: results.flat() });
  } catch (err) {
    console.error("Questions API error:", err);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}