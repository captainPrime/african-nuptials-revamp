import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, packageId, durationMonths } = session.metadata!;

      // Update payment record
      await supabase
        .from("subscription_payments")
        .update({
          status: "completed",
          payment_date: new Date().toISOString(),
        })
        .eq("stripe_session_id", session.id);

      // Deactivate current subscriptions
      await supabase
        .from("user_subscriptions")
        .update({ is_active: false })
        .eq("user_id", userId)
        .eq("is_active", true);

      // Calculate end date
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + Number.parseInt(durationMonths));

      // Create new subscription
      await supabase.from("user_subscriptions").insert({
        user_id: userId,
        package_id: packageId,
        end_date: endDate.toISOString(),
        is_active: true,
        amount_paid: session.amount_total! / 100,
        payment_status: "completed",
        payment_method: "stripe",
      });

      // Update user's membership_plan
      const { data: packageData } = await supabase
        .from("subscription_packages")
        .select("name")
        .eq("id", packageId)
        .single();

      if (packageData) {
        await supabase
          .from("profiles")
          .update({ membership_plan: packageData.name })
          .eq("id", userId);
      }

      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Update payment record
      await supabase
        .from("subscription_payments")
        .update({
          status: "failed",
        })
        .eq("stripe_session_id", session.id);

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
