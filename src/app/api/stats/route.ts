import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createSupabaseServer();

    const [{ count: total, error: e1 }, { count: correct, error: e2 }] =
      await Promise.all([
        supabase.from("attempts").select("*", { count: "exact", head: true }),
        supabase
          .from("attempts")
          .select("*", { count: "exact", head: true })
          .eq("correct", true),
      ]);

    if (e1 || e2) throw e1 || e2;

    const accuracy =
      total && total > 0 ? Math.round((correct! / total) * 100) : 0;

    return NextResponse.json({
      accuracy,
      total,
      correct,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error("Stats GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
