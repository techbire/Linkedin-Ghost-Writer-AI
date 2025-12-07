import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { Database } from "@/types/database"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      post_id,
      quality_rating,
      relevance_rating,
      tone_rating,
      engagement_potential_rating,
      overall_rating,
      liked_aspects,
      disliked_aspects,
      improvement_suggestions,
      was_helpful,
      would_use_again,
      met_expectations,
      generation_params,
      feedback_context,
    } = body

    // Validate required fields
    if (!overall_rating || overall_rating < 1 || overall_rating > 5) {
      return NextResponse.json(
        { error: "Overall rating is required and must be between 1 and 5" },
        { status: 400 }
      )
    }

    // Insert feedback
    const { data, error } = await (supabase
      .from("post_feedback")
      .insert({
        user_id: user.id,
        post_id,
        quality_rating,
        relevance_rating,
        tone_rating,
        engagement_potential_rating,
        overall_rating,
        liked_aspects,
        disliked_aspects,
        improvement_suggestions,
        was_helpful,
        would_use_again,
        met_expectations,
        generation_params,
        feedback_context,
      } as any)
      .select()
      .single())

    if (error) {
      console.error("Error creating feedback:", error)
      return NextResponse.json(
        { error: "Failed to submit feedback" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, message: "Feedback submitted successfully" })
  } catch (error) {
    console.error("Error in feedback submission:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const post_id = searchParams.get("post_id")
    const limit = parseInt(searchParams.get("limit") || "10")

    let query = supabase
      .from("post_feedback")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (post_id) {
      query = query.eq("post_id", post_id)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching feedback:", error)
      return NextResponse.json(
        { error: "Failed to fetch feedback" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error in feedback fetch:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { feedback_id, ...updates } = body

    if (!feedback_id) {
      return NextResponse.json(
        { error: "Feedback ID is required" },
        { status: 400 }
      )
    }

    // Update feedback
    const { data, error } = await ((supabase
      .from("post_feedback") as any)
      .update(updates)
      .eq("id", feedback_id)
      .eq("user_id", user.id)
      .select()
      .single())

    if (error) {
      console.error("Error updating feedback:", error)
      return NextResponse.json(
        { error: "Failed to update feedback" },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, message: "Feedback updated successfully" })
  } catch (error) {
    console.error("Error in feedback update:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
