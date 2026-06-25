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

  // --- NEW: IDEMPOTENCY CHECK ---
  // Try to insert the incoming Stripe event ID into a dedicated tracking table.
  // If we've already processed this event, Postgres will throw a unique constraint error (23505).
  const { error: logError } = await supabase
    .from("stripe_processed_events")
    .insert({ event_id: event.id });

  if (logError) {
    if (logError.code === "23505") {
      console.log(`Duplicate event ignored: ${event.id}`);
      // Return 200 OK so Stripe knows we received it and stops retrying
      return NextResponse.json({ received: true, duplicate: true });
    }
    // For any other DB error, return 500 so Stripe retries later
    console.error("Failed to log webhook event ID:", logError);
    return NextResponse.json({ error: "Event logging failed" }, { status: 500 });
  }
  // ------------------------------

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const hours = parseInt(session.metadata?.hours || "6");

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
        
        // CRITICAL CRASH RECOVERY:
        // Delete the event log entry so Stripe can retry safely when your DB recovers
        await supabase.from("stripe_processed_events").delete().eq("event_id", event.id);
        
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }

      console.log(`Access granted: user ${userId}, ${hours}h, expires ${expiresAt}`);
    }
  }

  return NextResponse.json({ received: true });
}
