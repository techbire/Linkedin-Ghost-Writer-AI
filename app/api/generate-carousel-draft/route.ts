import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      topic,
      tone,
      contentType,
      hook,
      slideCount,
    } = body

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      )
    }

    // Check for Gemini API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      )
    }

    // PHASE 1: Generate text draft only using gemini-2.5-flash
    const prompt = `You are a professional social media content strategist.

Task:
Create ${slideCount} carousel slide content based on the given topic, tone, and content type.

CRITICAL SPELLING & GRAMMAR REQUIREMENTS:
- Use CORRECT English spelling at all times
- Double-check every word for proper spelling
- Use correct grammar and punctuation
- Ensure professional, error-free text
- Pay special attention to commonly misspelled words:
  * "receive" not "recieve"
  * "separate" not "seperate"
  * "definitely" not "definately"
  * "achieve" not "acheive"
  * "necessary" not "neccessary"
- Proofread all text before outputting
- Professional quality text ONLY

Structure:
1. Slide 1 – Introduction or Hook ${hook ? `(Use this hook: "${hook}")` : ""}
2. Middle Slides – Key points or story steps
3. Final Slide – Conclusion or Call to Action

Rules:
- Each slide should have a short title (5-8 words) and concise content (1-3 lines, max 120 characters)
- Maintain logical flow across slides
- Keep it engaging and actionable
- Use JSON format only
- Make Slide 1 especially compelling as it sets the tone
- ALL TEXT MUST BE SPELLED CORRECTLY

Topic: ${topic}
Tone: ${tone}
Content Type: ${contentType}
Number of Slides: ${slideCount}

Output format (JSON only, no markdown):
{
  "slides": [
    { "title": "Slide 1 Title", "content": "Brief message for slide 1" },
    { "title": "Slide 2 Title", "content": "Brief message for slide 2" },
    ...
  ]
}`

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Gemini API Error:", errorText)
      return NextResponse.json(
        { error: `Failed to generate content: ${response.statusText}` },
        { status: 500 }
      )
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    
    let slides: Array<{ title: string; content: string }> = []
    
    try {
      const parsed = JSON.parse(generatedText)
      slides = parsed.slides || []
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError)
      return NextResponse.json(
        { error: "Failed to parse generated content" },
        { status: 500 }
      )
    }

    if (slides.length === 0) {
      return NextResponse.json(
        { error: "No slides generated" },
        { status: 500 }
      )
    }

    console.log(`Generated ${slides.length} draft slides (text only)`)
    
    return NextResponse.json({
      slides,
      message: "Draft slides generated. Edit the first slide to set the template.",
    })
  } catch (error) {
    console.error("Error generating carousel draft:", error)
    return NextResponse.json(
      { error: "Failed to generate carousel draft" },
      { status: 500 }
    )
  }
}
