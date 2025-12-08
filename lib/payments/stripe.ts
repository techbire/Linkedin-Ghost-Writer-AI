import Stripe from "stripe"

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
    })
  : null

export const STRIPE_PLANS = {
  starter: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID || "price_starter",
    name: "Starter",
    price: 60000, // ₹600 in paise (60000 paise = ₹600 for 6 months)
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro",
    name: "Pro",
    price: 100000, // ₹1000 in paise (100000 paise = ₹1000 for 12 months)
  },
}

export const isStripeConfigured = () => {
  return !!process.env.STRIPE_SECRET_KEY
}
