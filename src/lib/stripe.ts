import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY non configurata");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}


export const PLANS = {
  starter: {
    id: "starter",
    name: "FleetMind Starter",
    price: 4900, // €49.00 in centesimi
    label: "Starter",
  },
  professional: {
    id: "professional",
    name: "FleetMind Professional",
    price: 14900, // €149.00
    label: "Professional",
  },
  business: {
    id: "business",
    name: "FleetMind Business",
    price: 29900, // €299.00
    label: "Business",
  },
} as const;

export type PlanId = keyof typeof PLANS;
