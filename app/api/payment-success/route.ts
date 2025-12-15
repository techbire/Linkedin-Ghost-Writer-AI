import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use admin client for secure operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: Request) {
  try {
    const { paymentId, orderId, signature, planId, userId } = await request.json()

    if (!paymentId || !planId || !userId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Get the subscription plan
    const { data: plan, error: planError } = await supabaseAdmin
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    // Create a payment record (if payments table exists)
    try {
      await supabaseAdmin
        .from("payments")
        .insert({
          user_id: userId,
          amount: plan.price_inr / 100, // Convert paise to rupees
          currency: 'INR',
          status: "succeeded" as const,
          payment_provider: "razorpay" as const,
          provider_payment_id: paymentId,
        })
    } catch (paymentError) {
      console.warn("Payment record creation skipped (table may not exist):", paymentError)
      // Continue even if payments table doesn't exist
    }

    // Calculate subscription period based on billing_period
    let periodDays = 30 // default
    if (plan.billing_period === '6_months') {
      periodDays = 180
    } else if (plan.billing_period === '12_months') {
      periodDays = 365
    }

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabaseAdmin
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle()

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabaseAdmin
        .from("user_subscriptions")
        .update({
          plan_id: planId,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString(),
          payment_id: paymentId,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingSubscription.id)

      if (updateError) {
        console.error("Subscription update error:", updateError)
        return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
      }
    } else {
      // Create new subscription
      const { error: subscriptionError } = await supabaseAdmin
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          status: "active" as const,
          plan_id: planId,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false,
          payment_provider: "razorpay",
          payment_id: paymentId,
        })

      if (subscriptionError) {
        console.error("Subscription creation error:", subscriptionError)
        return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
      }
    }

    // Extract credits from plan features (first feature usually mentions credits)
    let creditsToAdd = 100 // default
    if (plan.name === 'Starter') creditsToAdd = 100
    else if (plan.name === 'Pro') creditsToAdd = 500
    else if (plan.name === 'Enterprise') creditsToAdd = 2000

    // Add credits to user account using the RPC function
    const { error: creditsError } = await supabaseAdmin.rpc("add_credits", {
      p_user_id: userId,
      p_amount: creditsToAdd,
      p_type: "purchase",
      p_description: `${plan.name} plan subscription - ${creditsToAdd} credits`,
      p_reference_id: paymentId,
    })

    if (creditsError) {
      console.error("Credits addition error:", creditsError)
      // Don't fail the request, but log the error
      console.warn("Warning: Subscription created but credits were not added. Manual intervention may be required.")
    }

    return NextResponse.json({ 
      success: true, 
      message: "Subscription activated successfully",
      redirectUrl: "/dashboard/billing?success=true"
    })

  } catch (error) {
    console.error("Payment success handler error:", error)
    return NextResponse.json(
      { error: "Failed to process payment success" },
      { status: 500 }
    )
  }
}