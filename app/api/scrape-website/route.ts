import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import FirecrawlApp from "@mendable/firecrawl-js"

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log("[Scrape API] Auth check:", { 
      hasUser: !!user, 
      userId: user?.id,
      authError: authError?.message 
    })

    if (!user) {
      console.error("[Scrape API] No authenticated user")
      return NextResponse.json(
        { error: "Unauthorized - Please log in and try again" },
        { status: 401 }
      )
    }

    const { websiteUrl } = await req.json()

    if (!websiteUrl) {
      return NextResponse.json(
        { error: "Website URL is required" },
        { status: 400 }
      )
    }

    // Validate URL format
    let validUrl: URL
    try {
      validUrl = new URL(websiteUrl)
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        throw new Error("Invalid protocol")
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      )
    }

    const geminiApiKey = process.env.GEMINI_API_KEY
    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      )
    }

    if (!firecrawlApiKey) {
      return NextResponse.json(
        { error: "Firecrawl API key not configured" },
        { status: 500 }
      )
    }

    // Use Firecrawl to scrape the website, with fallback to simple fetch
    let websiteContent: string = ""
    let scrapingMethod: string = ""
    
    // Try Firecrawl first
    try {
      console.log("[Scrape API] Attempting Firecrawl scraping...")
      const firecrawl = new FirecrawlApp({ apiKey: firecrawlApiKey })
      
      const scrapeResult = await firecrawl.scrape(websiteUrl, {
        formats: ['markdown', 'html'],
        onlyMainContent: true,
      })

      websiteContent = scrapeResult.markdown || scrapeResult.html || ""
      
      if (websiteContent && websiteContent.length > 100) {
        console.log("[Scrape API] ✅ Firecrawl scraping successful")
        scrapingMethod = "firecrawl"
      } else {
        throw new Error("Insufficient content from Firecrawl")
      }
    } catch (firecrawlError: any) {
      console.error("[Scrape API] ⚠️ Firecrawl failed:", firecrawlError.message)
      console.log("[Scrape API] Attempting fallback: simple fetch...")
      
      // Fallback to simple fetch
      try {
        const response = await fetch(websiteUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const html = await response.text()
        
        // Simple HTML cleaning - remove scripts, styles, and extract text
        const cleanedHtml = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        
        websiteContent = cleanedHtml
        scrapingMethod = "simple-fetch"
        console.log("[Scrape API] ✅ Fallback fetch successful")
      } catch (fetchError: any) {
        console.error("[Scrape API] ❌ Fallback fetch also failed:", fetchError.message)
        return NextResponse.json(
          { 
            error: "Failed to scrape website. Please check the URL is accessible and try again.",
            details: `Firecrawl: ${firecrawlError.message}, Fetch: ${fetchError.message}`
          },
          { status: 400 }
        )
      }
    }
    
    // Limit content length for Gemini API
    if (websiteContent.length > 15000) {
      websiteContent = websiteContent.slice(0, 15000)
    }

    if (!websiteContent || websiteContent.length < 100) {
      return NextResponse.json(
        { error: "Insufficient content extracted from website. The page may be empty or protected." },
        { status: 400 }
      )
    }
    
    console.log("[Scrape API] Content length:", websiteContent.length, "Method:", scrapingMethod)

    // Use Gemini AI to extract business context
    console.log("[Scrape API] 🤖 Analyzing content with Gemini AI...")
    
    const prompt = `Analyze the following website content and extract key business information in JSON format.

Website Content:
${websiteContent}

Extract and provide the following information in valid JSON format:
{
  "businessName": "The company/business name (extract from content, not just domain)",
  "businessDescription": "A detailed description of what the business does (2-3 sentences, be specific based on actual content)",
  "industry": "Primary industry/sector (be specific: e.g., 'Web Development', 'Digital Marketing', 'E-commerce')",
  "services": ["List of main services or products offered - extract from actual content"],
  "targetAudience": "Description of target audience/customers based on content and services",
  "ageGroup": "Target age demographic (e.g., '25-45', 'All ages', 'Professionals', 'Students')",
  "valueProposition": "Main value proposition or unique selling points from the content",
  "keywords": ["5-10 relevant keywords for content generation based on actual website content"]
}

IMPORTANT: Extract real information from the website content. Do NOT use generic placeholders.
If you cannot find specific information, use "Not specified" instead of generic text.

Return ONLY valid JSON, no additional text or markdown formatting.`

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error("[Scrape API] ❌ Gemini API error:", errorText)
      throw new Error("Failed to analyze website content with Gemini AI")
    }

    const geminiData = await geminiResponse.json()
    const extractedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""
    
    console.log("[Scrape API] Gemini response length:", extractedText.length)

    // Parse the extracted business context
    let businessContext: any
    try {
      // Try to extract JSON from the response
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        businessContext = JSON.parse(jsonMatch[0])
        console.log("[Scrape API] ✅ Business context parsed successfully")
        console.log("[Scrape API] Business name:", businessContext.businessName)
        console.log("[Scrape API] Services count:", businessContext.services?.length || 0)
      } else {
        throw new Error("No JSON found in Gemini response")
      }
    } catch (error: any) {
      console.error("[Scrape API] ❌ Error parsing business context:", error.message)
      console.error("[Scrape API] Gemini response:", extractedText.substring(0, 500))
      
      // Return error instead of fallback - we don't want to save bad data
      return NextResponse.json(
        { 
          error: "Failed to extract business information from website. The content may not contain sufficient business details.",
          geminiResponse: extractedText.substring(0, 200)
        },
        { status: 400 }
      )
    }

    // Add metadata
    businessContext.sourceUrl = websiteUrl
    businessContext.scrapedAt = new Date().toISOString()
    businessContext.scrapingMethod = scrapingMethod

    console.log("[Scrape API] 💾 Saving business context to database...")
    console.log("[Scrape API] Business context:", JSON.stringify(businessContext, null, 2))

    // Fetch existing business context to preserve voice analysis and other data
    console.log("[Scrape API] 📖 Fetching existing business context...")
    // @ts-ignore - JSONB field not in generated types
    const { data: currentProfile } = await (supabase as any)
      .from('profiles')
      .select('business_context')
      .eq('id', user.id)
      .single()

    const existingContext = (currentProfile?.business_context as any) || {}
    console.log("[Scrape API] Existing context has voiceAnalysis:", !!existingContext.voiceAnalysis)
    console.log("[Scrape API] Existing context has writingTemplate:", !!existingContext.writingTemplate)

    // Merge website data with existing context to preserve voice analysis
    const mergedContext = {
      ...existingContext, // Preserve voice analysis, writing template, etc.
      ...businessContext, // Add/update website scraping data
      // Ensure these critical fields are preserved if they exist
      voiceAnalysis: existingContext.voiceAnalysis || businessContext.voiceAnalysis,
      writingTemplate: existingContext.writingTemplate || businessContext.writingTemplate,
    }

    console.log("[Scrape API] Merged context has voiceAnalysis:", !!mergedContext.voiceAnalysis)
    console.log("[Scrape API] Merged context has writingTemplate:", !!mergedContext.writingTemplate)

    // Update user profile with merged business context
    // @ts-ignore - Types will be updated after database migration  
    const { error: updateError } = await supabase
      .from('profiles')
      // @ts-ignore - Types will be updated after database migration
      .update({
        business_context: mergedContext,
        context_scraped_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error("[Scrape API] ❌ Error updating profile:", updateError)
      return NextResponse.json(
        { error: "Failed to save business context to database" },
        { status: 500 }
      )
    }

    console.log("[Scrape API] ✅ Business context saved successfully")

    return NextResponse.json({
      success: true,
      businessContext,
      scrapingMethod
    })

  } catch (error) {
    console.error("Error scraping website:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to scrape website" },
      { status: 500 }
    )
  }
}
