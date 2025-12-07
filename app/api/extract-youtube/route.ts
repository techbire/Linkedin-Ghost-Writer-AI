import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

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

    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      )
    }

    // Extract video ID from YouTube URL
    const videoIdMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    )
    
    if (!videoIdMatch) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      )
    }

    const videoId = videoIdMatch[1]

    // Use YouTube Transcript API (via RapidAPI or similar service)
    // Alternative: Use youtube-transcript npm package server-side
    
    // For now, we'll use a direct approach with YouTube's timedtext API
    const transcriptResponse = await fetch(
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`
    )

    if (!transcriptResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch transcript. Video may not have captions available." },
        { status: 404 }
      )
    }

    const transcriptXML = await transcriptResponse.text()
    
    // Parse XML to extract text
    const textMatches = transcriptXML.matchAll(/<text[^>]*>([^<]+)<\/text>/g)
    const transcript = Array.from(textMatches)
      .map((match) => decodeHTML(match[1]))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()

    if (!transcript) {
      return NextResponse.json(
        { error: "No transcript found for this video" },
        { status: 404 }
      )
    }

    // Get video metadata
    const videoTitle = await getVideoTitle(videoId)

    return NextResponse.json({
      transcript,
      videoId,
      videoTitle,
      url,
    })
  } catch (error) {
    console.error("Error extracting YouTube transcript:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Helper function to decode HTML entities
function decodeHTML(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
}

// Helper function to get video title
async function getVideoTitle(videoId: string): Promise<string> {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    )
    
    if (response.ok) {
      const data = await response.json()
      return data.title || "Unknown Video"
    }
  } catch (error) {
    console.error("Error fetching video title:", error)
  }
  
  return "Unknown Video"
}
