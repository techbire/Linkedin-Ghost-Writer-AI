import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// This endpoint grants credits to the current user based on their active subscription
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's active subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*, subscription_plans(*)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle()

    if (!subscription) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 })
    }

    const subData = subscription as any
    const plan = subData?.subscription_plans
    const creditsToGrant = plan?.credits_per_month || 0

    if (creditsToGrant === 0) {
      return NextResponse.json({ error: "Plan has no credits" }, { status: 400 })
    }

    // Add credits using RPC function
    const { error: creditsError } = await supabase.rpc("add_credits", {
      p_user_id: user.id,
      p_amount: creditsToGrant,
      p_type: "purchase",
      p_description: `Manual credit grant for ${plan.name} plan`,
      p_reference_id: subData.id,
    } as any)

    if (creditsError) {
      console.error("Error granting credits:", creditsError)
      return NextResponse.json({ error: "Failed to grant credits" }, { status: 500 })
    }

    // Get updated credit balance
    const { data: userCredits } = await supabase
      .from("user_credits")
      .select("available_credits")
      .eq("user_id", user.id)
      .single()

    return NextResponse.json({
      success: true,
      message: `Successfully granted ${creditsToGrant} credits`,
      credits: (userCredits as any)?.available_credits || creditsToGrant,
    })
  } catch (error) {
    console.error("Error in grant-credits API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
