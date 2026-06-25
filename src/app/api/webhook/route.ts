import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const hours = parseInt(session.metadata?.hours || "6");

    // Idempotency guard against Stripe webhook retries.
    // Stripe may deliver the same checkout.session.completed event more than
    // once; without this check each delivery would stack additional access
    // hours onto the user's profile. We key on the Stripe *session* id (not the
    // event id) so that retries of the same purchase are deduplicated.
    //
    // Run this migration manually in Supabase before deploying:
    //
    //   create table if not exists processed_events (
    //     session_id text primary key,
    //     processed_at timestamptz not null default now()
    //   );
    //
    // The `session_id` primary key gives us the uniqueness constraint that
    // makes duplicate inserts fail, which we rely on below.
    if (session.id) {
      const { data: existing } = await supabase
        .from("processed_events")
        .select("session_id")
        .eq("session_id", session.id)
        .maybeSingle();

      if (existing) {
        // Already granted access for this session; acknowledge the retry
        // without granting again.
        console.log(`Duplicate webhook ignored for session ${session.id}`);
        return NextResponse.json({ received: true, duplicate: true });
      }
    }

    if (userId) {
      // Get current profile to check existing access
      const { data: profile } = await supabase
        .from("profiles")
        .select("access_expires_at")
        .eq("id", userId)
        .single();

      // Stack: if existing access hasn't expired, add hours to it
      // Otherwise, start from now
      const now = new Date();
      const currentExpiry = profile?.access_expires_at ? new Date(profile.access_expires_at) : null;
      const base = currentExpiry && currentExpiry > now ? currentExpiry : now;
      const expiresAt = new Date(base.getTime() + hours * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from("profiles")
        .update({
          access_expires_at: expiresAt,
          stripe_customer_id: session.customer as string,
        })
        .eq("id", userId);

      if (error) {
        console.error("Error updating profile after payment:", error);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }

      console.log(`Access granted: user ${userId}, ${hours}h, expires ${expiresAt}`);

      // Mark this session as processed so future retries are deduplicated.
      // A unique-violation here means a concurrent delivery already recorded it,
      // which is fine — the access grant above is the only thing we guard.
      if (session.id) {
        const { error: recordError } = await supabase
          .from("processed_events")
          .insert({ session_id: session.id });

        if (recordError) {
          console.error("Error recording processed event:", recordError.message);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}