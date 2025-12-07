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
    price: 900, // $9 = ₹900 (100 paise = ₹1, so 900 paise = ₹9)
  },
  pro: {
    planId: process.env.RAZORPAY_PRO_PLAN_ID || "plan_pro",
    name: "Pro",
    price: 2900, // $29 = ₹2900
  },
  enterprise: {
    planId: process.env.RAZORPAY_ENTERPRISE_PLAN_ID || "plan_enterprise",
    name: "Enterprise",
    price: 9900, // $99 = ₹9900
  },
}

export const isRazorpayConfigured = () => {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
}
