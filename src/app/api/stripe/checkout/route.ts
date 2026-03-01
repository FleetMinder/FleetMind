import { NextRequest, NextResponse } from "next/server";
import { getStripe, PLANS, type PlanId } from "@/lib/stripe";
import { getCompany } from "@/lib/company";

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();
    const company = await getCompany();

    const planData = PLANS[plan as PlanId];
    if (!planData) {
      return NextResponse.json({ error: "Piano non valido" }, { status: 400 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Riusa il customer Stripe esistente per evitare duplicati
    const customerParam = company.stripeCustomerId
      ? { customer: company.stripeCustomerId }
      : { customer_email: company.email || undefined };

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      ...customerParam,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: planData.name,
              description: `Piano ${planData.label} — FleetMind AI Dispatch Platform`,
            },
            unit_amount: planData.price,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: { plan },
      },
      metadata: { plan },
      allow_promotion_codes: true,
      success_url: `${baseUrl}/?payment=success`,
      cancel_url: `${baseUrl}/landing#pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Errore nella creazione del checkout" },
      { status: 500 }
    );
  }
}
