import Razorpay from "razorpay"

export const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null

export const RAZORPAY_PLANS = {
  starter: {
    planId: process.env.RAZORPAY_STARTER_PLAN_ID || "plan_starter",
    name: "Starter",
    price: 60000, // ₹600 (100 paise = ₹1, so 60000 paise = ₹600 for 6 months)
  },
  pro: {
    planId: process.env.RAZORPAY_PRO_PLAN_ID || "plan_pro",
    name: "Pro",
    price: 100000, // ₹1000 (100000 paise = ₹1000 for 12 months)
  },
  enterprise: {
    planId: process.env.RAZORPAY_ENTERPRISE_PLAN_ID || "plan_enterprise",
    name: "Enterprise",
    price: 0, // Custom pricing
  },
}

export const isRazorpayConfigured = () => {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
}
