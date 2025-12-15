import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { stripe, STRIPE_PLANS, isStripeConfigured } from "@/lib/payments/stripe"
import { razorpay, RAZORPAY_PLANS, isRazorpayConfigured } from "@/lib/payments/razorpay"

const PAYMENT_PROVIDER = (process.env.PAYMENT_PROVIDER || "stripe") as "stripe" | "razorpay"

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured() && !isRazorpayConfigured()) {
      return NextResponse.json(
        { error: "Payment system not configured. Please add payment provider credentials." },
        { status: 503 },
      )
    }

    const { planId } = await request.json()

    const supabase = await getSupabaseServerClient()

    let user
    try {
      const getUserPromise = supabase.auth.getUser()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase request timeout")), 5000),
      )

      const result = (await Promise.race([getUserPromise, timeoutPromise])) as any
      user = result?.data?.user
    } catch (supabaseError) {
      return NextResponse.json(
        { error: "Authentication service unavailable. Please try again later." },
        { status: 503 },
      )
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch plan from database
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .eq("is_active", true)
      .single()

    if (planError || !plan) {
      console.error("[v0] Plan fetch error:", planError)
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    let profile
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
      profile = data
    } catch (profileError) {
      // Continue without profile - not critical for checkout
    }

    if (PAYMENT_PROVIDER === "stripe") {
      if (!isStripeConfigured() || !stripe) {
        return NextResponse.json({ error: "Stripe is not configured. Please add Stripe credentials." }, { status: 503 })
      }

      // Note: For Stripe, you'll need to create price IDs in Stripe dashboard
      // and store them in the database or use the hardcoded STRIPE_PLANS
      const stripePlan = STRIPE_PLANS[plan.name.toLowerCase() as keyof typeof STRIPE_PLANS]
      if (!stripePlan) {
        return NextResponse.json({ error: "Stripe plan configuration missing" }, { status: 400 })
      }

      try {
        const session = await stripe.checkout.sessions.create({
          customer_email: user.email,
          line_items: [
            {
              price: stripePlan.priceId,
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/billing?success=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/billing?canceled=true`,
          metadata: {
            userId: user.id,
            planId: plan.id,
            planName: plan.name,
          },
        })

        return NextResponse.json({ url: session.url })
      } catch (stripeError) {
        console.error("[v0] Stripe error:", stripeError)
        return NextResponse.json(
          { error: "Failed to create Stripe checkout session. Please try again." },
          { status: 500 },
        )
      }
    } else {
      if (!isRazorpayConfigured() || !razorpay) {
        return NextResponse.json(
          { error: "Razorpay is not configured. Please add Razorpay credentials." },
          { status: 503 },
        )
      }

      // Use price_inr from database
      if (!plan.price_inr) {
        return NextResponse.json({ error: "Plan price not configured" }, { status: 400 })
      }

      try {
        // For testing: Create a simple order instead of subscription
        const order = await razorpay.orders.create({
          amount: plan.price_inr, // Amount in paise from database
          currency: 'INR',
          receipt: `ord_${Date.now().toString().slice(-8)}`, // Max 40 chars, using last 8 digits of timestamp
          notes: {
            userId: user.id,
            planId: plan.id,
            planName: plan.name,
            type: 'test_payment'
          }
        })

        return NextResponse.json({
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
          userId: user.id,
          success: true
        })
      } catch (razorpayError) {
        console.error("[v0] Razorpay error:", razorpayError)
        return NextResponse.json(
          { error: "Failed to create Razorpay subscription. Please try again." },
          { status: 500 },
        )
      }
    }
  } catch (error) {
    console.error("[v0] Checkout error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 },
    )
  }
}
