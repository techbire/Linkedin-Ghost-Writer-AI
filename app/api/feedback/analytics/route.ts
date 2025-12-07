import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { Database } from "@/types/database"

type PostFeedback = Database["public"]["Tables"]["post_feedback"]["Row"]

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
    const days = parseInt(searchParams.get("days") || "30")

    // Get user's feedback summary
    const { data: feedbackData, error: feedbackError } = await supabase
      .from("post_feedback")
      .select("*")
      .eq("user_id", user.id)
      .gte(
        "created_at",
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      )

    if (feedbackError) {
      console.error("Error fetching feedback:", feedbackError)
      return NextResponse.json(
        { error: "Failed to fetch feedback data" },
        { status: 500 }
      )
    }

    // Calculate analytics
    const totalFeedback = feedbackData.length

    if (totalFeedback === 0) {
      return NextResponse.json({
        data: {
          total_feedback: 0,
          avg_overall_rating: 0,
          avg_quality_rating: 0,
          avg_relevance_rating: 0,
          avg_tone_rating: 0,
          avg_engagement_rating: 0,
          helpful_percentage: 0,
          would_use_again_percentage: 0,
          met_expectations_percentage: 0,
          most_liked_aspects: [],
          most_disliked_aspects: [],
          feedback_trend: [],
        },
      })
    }

    const avgOverallRating =
      feedbackData.reduce((sum: number, f: PostFeedback) => sum + f.overall_rating, 0) / totalFeedback

    const qualityRatings = feedbackData.filter((f: PostFeedback) => f.quality_rating !== null)
    const avgQualityRating =
      qualityRatings.length > 0
        ? qualityRatings.reduce((sum: number, f: PostFeedback) => sum + (f.quality_rating || 0), 0) /
          qualityRatings.length
        : 0

    const relevanceRatings = feedbackData.filter((f: PostFeedback) => f.relevance_rating !== null)
    const avgRelevanceRating =
      relevanceRatings.length > 0
        ? relevanceRatings.reduce((sum: number, f: PostFeedback) => sum + (f.relevance_rating || 0), 0) /
          relevanceRatings.length
        : 0

    const toneRatings = feedbackData.filter((f: PostFeedback) => f.tone_rating !== null)
    const avgToneRating =
      toneRatings.length > 0
        ? toneRatings.reduce((sum: number, f: PostFeedback) => sum + (f.tone_rating || 0), 0) /
          toneRatings.length
        : 0

    const engagementRatings = feedbackData.filter(
      (f: PostFeedback) => f.engagement_potential_rating !== null
    )
    const avgEngagementRating =
      engagementRatings.length > 0
        ? engagementRatings.reduce(
            (sum: number, f: PostFeedback) => sum + (f.engagement_potential_rating || 0),
            0
          ) / engagementRatings.length
        : 0

    const helpfulCount = feedbackData.filter((f: PostFeedback) => f.was_helpful === true).length
    const wouldUseAgainCount = feedbackData.filter(
      (f: PostFeedback) => f.would_use_again === true
    ).length
    const metExpectationsCount = feedbackData.filter(
      (f: PostFeedback) => f.met_expectations === true
    ).length

    // Calculate most common liked/disliked aspects
    const likedAspectsCount: Record<string, number> = {}
    const dislikedAspectsCount: Record<string, number> = {}

    feedbackData.forEach((feedback: PostFeedback) => {
      feedback.liked_aspects?.forEach((aspect: string) => {
        likedAspectsCount[aspect] = (likedAspectsCount[aspect] || 0) + 1
      })
      feedback.disliked_aspects?.forEach((aspect: string) => {
        dislikedAspectsCount[aspect] = (dislikedAspectsCount[aspect] || 0) + 1
      })
    })

    const mostLikedAspects = Object.entries(likedAspectsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([aspect, count]) => ({ aspect, count }))

    const mostDislikedAspects = Object.entries(dislikedAspectsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([aspect, count]) => ({ aspect, count }))

    // Calculate feedback trend (daily averages)
    const feedbackByDate: Record<string, { total: number; sum: number }> = {}
    feedbackData.forEach((feedback: PostFeedback) => {
      const date = new Date(feedback.created_at).toISOString().split("T")[0]
      if (!feedbackByDate[date]) {
        feedbackByDate[date] = { total: 0, sum: 0 }
      }
      feedbackByDate[date].total += 1
      feedbackByDate[date].sum += feedback.overall_rating
    })

    const feedbackTrend = Object.entries(feedbackByDate)
      .map(([date, { total, sum }]) => ({
        date,
        avg_rating: sum / total,
        count: total,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      data: {
        total_feedback: totalFeedback,
        avg_overall_rating: Math.round(avgOverallRating * 10) / 10,
        avg_quality_rating: Math.round(avgQualityRating * 10) / 10,
        avg_relevance_rating: Math.round(avgRelevanceRating * 10) / 10,
        avg_tone_rating: Math.round(avgToneRating * 10) / 10,
        avg_engagement_rating: Math.round(avgEngagementRating * 10) / 10,
        helpful_percentage: Math.round((helpfulCount / totalFeedback) * 100),
        would_use_again_percentage: Math.round(
          (wouldUseAgainCount / totalFeedback) * 100
        ),
        met_expectations_percentage: Math.round(
          (metExpectationsCount / totalFeedback) * 100
        ),
        most_liked_aspects: mostLikedAspects,
        most_disliked_aspects: mostDislikedAspects,
        feedback_trend: feedbackTrend,
      },
    })
  } catch (error) {
    console.error("Error in feedback analytics:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
