import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { contentType, tone, currentTopic } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      )
    }

    let prompt: string
    
    if (currentTopic && currentTopic.trim()) {
      // Generate ideas based on the user's input
      prompt = `The user has started writing about: "${currentTopic}"

Generate 8 engaging LinkedIn carousel topic ideas that expand on or are related to this topic. Use ${contentType} content style with a ${tone} tone.

Requirements:
- Build upon or relate to the user's initial idea: "${currentTopic}"
- Make topics more specific, actionable, and compelling
- Add professional value and trending perspectives
- Mix of angles: how-to, case studies, frameworks, lessons learned
- Keep each topic concise (5-12 words)

Format your response as a JSON array of strings. Example:
["Topic idea 1", "Topic idea 2", "Topic idea 3", ...]

Return ONLY the JSON array, no additional text.`
    } else {
      // Generate general trending ideas
      prompt = `Generate 8 engaging and trending LinkedIn carousel topic ideas for ${contentType} content with a ${tone} tone.

Requirements:
- Topics should be current, relevant, and valuable for LinkedIn professionals
- Each topic should be specific and actionable
- Mix of educational, inspirational, and practical topics
- Consider trending business and professional development themes
- Keep topics concise (5-10 words each)

Format your response as a JSON array of strings. Example:
["Topic idea 1", "Topic idea 2", "Topic idea 3", ...]

Return ONLY the JSON array, no additional text.`
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`

    const response = await fetch(geminiUrl, {
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
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1024,
        },
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate topic ideas from Gemini")
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    // Parse JSON response
    let topicIdeas: string[]
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        topicIdeas = JSON.parse(jsonMatch[0])
      } else {
        // Fallback: split by newlines and clean
        topicIdeas = text
          .split("\n")
          .map((line: string) => line.trim())
          .filter((line: string) => line && !line.startsWith("{") && !line.startsWith("}"))
          .map((line: string) => line.replace(/^[-*•]\s*/, "").replace(/^["']|["']$/g, ""))
          .filter((line: string) => line.length > 0)
          .slice(0, 8)
      }
    } catch (error) {
      console.error("Error parsing topic ideas:", error)
      // Fallback parsing
      topicIdeas = text
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line && line.length > 10)
        .slice(0, 8)
    }

    if (topicIdeas.length === 0) {
      throw new Error("No topic ideas generated")
    }

    return NextResponse.json({
      success: true,
      topicIdeas
    })

  } catch (error) {
    console.error("Error generating topic ideas:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate topic ideas" },
      { status: 500 }
    )
  }
}
