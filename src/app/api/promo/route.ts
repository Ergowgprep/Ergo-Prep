import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();

    const code = req.nextUrl.searchParams.get("code");
    if (!code) {
      return NextResponse.json(
        { valid: false, reason: "Missing code parameter" },
        { status: 400 }
      );
    }

    const { data: promo, error } = await supabase
      .from("promo_codes")
      .select("society_name, active, times_used, max_uses")
      .eq("code", code)
      .single();

    if (error || !promo) {
      return NextResponse.json({ valid: false, reason: "Promo code not found" });
    }

    if (!promo.active) {
      return NextResponse.json({ valid: false, reason: "Promo code is no longer active" });
    }

    if (promo.times_used >= promo.max_uses) {
      return NextResponse.json({ valid: false, reason: "Promo code has reached its usage limit" });
    }

    return NextResponse.json({ valid: true, society_name: promo.society_name });
  } catch (err) {
    console.error("Promo GET error:", err);
    return NextResponse.json({ error: "Failed to validate promo code" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json() as { code: string };
    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    // Validate the promo code
    const { data: promo, error: promoError } = await supabase
      .from("promo_codes")
      .select("society_name, active, times_used, max_uses")
      .eq("code", code)
      .single();

    if (promoError || !promo) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
    }

    if (!promo.active) {
      return NextResponse.json({ error: "Promo code is no longer active" }, { status: 400 });
    }

    if (promo.times_used >= promo.max_uses) {
      return NextResponse.json({ error: "Promo code has reached its usage limit" }, { status: 400 });
    }

    // Check if the user has already redeemed any promo code
    const { data: existing, error: redemptionError } = await supabase
      .from("promo_redemptions")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (redemptionError) throw redemptionError;

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "You have already redeemed a promo code" }, { status: 400 });
    }

    // 1. Insert redemption record
    const { error: insertError } = await supabase
      .from("promo_redemptions")
      .insert({ user_id: user.id, code });

    if (insertError) throw insertError;

    // 2. Increment times_used on the promo code
    const { error: updateCodeError } = await supabase
      .from("promo_codes")
      .update({ times_used: promo.times_used + 1 })
      .eq("code", code);

    if (updateCodeError) throw updateCodeError;

    // 3. Update the user's profile with the promo code
    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({ promo_code: code })
      .eq("id", user.id);

    if (updateProfileError) throw updateProfileError;

    return NextResponse.json({ success: true, society_name: promo.society_name });
  } catch (err) {
    console.error("Promo POST error:", err);
    return NextResponse.json({ error: "Failed to redeem promo code" }, { status: 500 });
  }
}
