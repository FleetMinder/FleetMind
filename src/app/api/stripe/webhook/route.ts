import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook non configurato" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature error:", err);
    return NextResponse.json({ error: "Firma webhook non valida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Errore interno webhook" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_email;
  const customerId = session.customer as string;
  const plan = session.metadata?.plan || "professional";
  const subscriptionId = session.subscription as string;

  // Prima cerca per customerId (customer esistente — customer_email non viene popolato)
  let companyId: string | null = null;
  if (customerId) {
    const existing = await prisma.company.findFirst({
      where: { stripeCustomerId: customerId },
      select: { id: true },
    });
    if (existing) companyId = existing.id;
  }

  // Fallback: cerca per email (primo acquisto — customer_email è presente)
  if (!companyId && customerEmail) {
    const user = await prisma.user.findUnique({
      where: { email: customerEmail },
      select: { companyId: true },
    });
    if (user?.companyId) companyId = user.companyId;
  }

  if (!companyId) return;

  await prisma.company.update({
    where: { id: companyId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: "trialing",
      // subscriptionCurrentPeriodEnd arriva dal subscription.updated event
    },
  });

  await prisma.setting.upsert({
    where: { companyId_chiave: { companyId, chiave: "piano_abbonamento" } },
    create: { companyId, chiave: "piano_abbonamento", valore: plan },
    update: { valore: plan },
  });

  await prisma.activityLog.create({
    data: {
      companyId,
      tipo: "subscription_started",
      messaggio: `Abbonamento ${plan} attivato`,
    },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const status = subscription.status;
  // current_period_end exists at runtime but was removed from SDK v20 types
  const periodEndTs = (subscription as unknown as { current_period_end: number }).current_period_end;
  const periodEnd = periodEndTs ? new Date(periodEndTs * 1000) : null;

  const company = await prisma.company.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (company) {
    await prisma.company.update({
      where: { id: company.id },
      data: {
        subscriptionStatus: status,
        subscriptionCurrentPeriodEnd: periodEnd,
        stripeSubscriptionId: subscription.id,
      },
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const company = await prisma.company.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (company) {
    await prisma.company.update({
      where: { id: company.id },
      data: {
        subscriptionStatus: "canceled",
        stripeSubscriptionId: null,
      },
    });

    await prisma.activityLog.create({
      data: {
        companyId: company.id,
        tipo: "subscription_canceled",
        messaggio: "Abbonamento cancellato",
      },
    });
  }
}
