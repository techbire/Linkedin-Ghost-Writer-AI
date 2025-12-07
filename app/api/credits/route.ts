import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's current credits
    const { data: userCredits, error: creditsError } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle()

    if (creditsError) {
      console.error("Error fetching credits:", creditsError)
      return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 })
    }

    // If no credits record exists, return 0
    const credits = (userCredits as { credits: number } | null)?.credits ?? 0

    return NextResponse.json({ credits })
  } catch (error) {
    console.error("Error in credits API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
