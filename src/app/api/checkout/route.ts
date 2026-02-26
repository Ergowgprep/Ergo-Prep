import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

const PLANS: Record<string, { price: number; hours: number; name: string }> = {
  "6h": { price: 199, hours: 6, name: "6-Hour Pass" },
  "24h": { price: 499, hours: 24, name: "24-Hour Pass" },
  "1w": { price: 999, hours: 168, name: "1-Week Pass" },
};

export async function POST(req: NextRequest) {
  try {
    const { planId, userId } = await req.json();
    const plan = PLANS[planId];

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `Ergo — ${plan.name}`,
              description: `${plan.hours} hours of full access to 1,500+ Watson-Glaser questions`,
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.nextUrl.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/pricing`,
      metadata: {
        userId,
        planId,
        hours: String(plan.hours),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}