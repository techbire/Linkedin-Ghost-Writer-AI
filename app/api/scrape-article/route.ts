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
        { error: "URL is required" },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      )
    }

    // Call Firecrawl API to scrape the URL
    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY
    
    if (!firecrawlApiKey) {
      console.error("FIRECRAWL_API_KEY not configured")
      return NextResponse.json(
        { error: "Scraping service not configured" },
        { status: 500 }
      )
    }

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${firecrawlApiKey}`,
      },
      body: JSON.stringify({
        url: url,
        formats: ["markdown", "html"],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Firecrawl API error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to scrape URL" },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Extract the content
    const content = data.data?.markdown || data.data?.html || ""
    const title = data.data?.metadata?.title || ""
    const description = data.data?.metadata?.description || ""

    if (!content) {
      return NextResponse.json(
        { error: "No content extracted from URL" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      content,
      title,
      description,
      url,
    })
  } catch (error) {
    console.error("Error scraping URL:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
