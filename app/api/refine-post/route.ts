import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check credits
    const { data: userCredits } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle()

    const currentCredits = (userCredits as any)?.credits ?? 0

    console.log("🔍 Refine Post - Credit Check:")
    console.log("  User ID:", user.id)
    console.log("  Current Credits:", currentCredits)

    if (currentCredits < 1) {
      console.log("❌ Insufficient credits:", currentCredits)
      return NextResponse.json(
        { error: "Insufficient credits. Please upgrade your plan or purchase more credits." },
        { status: 402 } // Payment Required
      )
    }

    console.log("✅ Credits available:", currentCredits)

    const body = await request.json()
    const { originalContent, refinementPrompt, tone, contentType } = body

    if (!originalContent || !refinementPrompt) {
      return NextResponse.json(
        { error: "Original content and refinement prompt are required" },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const prompt = `You are an expert LinkedIn content editor. A user has generated a LinkedIn post and wants to refine it based on their feedback.

🎯 USER'S REFINEMENT REQUEST:
"${refinementPrompt}"

📄 ORIGINAL POST:
---
${originalContent}
---

📋 ORIGINAL SETTINGS:
- Tone: ${tone || "Standard (authoritative)"}
- Post Type: ${contentType || "Story"}

✍️ YOUR TASK:
1. **UNDERSTAND THE REQUEST**: Carefully analyze what the user wants to change
2. **PRESERVE THE GOOD**: Keep what works well in the original post
3. **IMPLEMENT CHANGES**: Apply the user's requested changes precisely
4. **MAINTAIN QUALITY**: Ensure the refined post is still high-quality LinkedIn content
5. **KEEP STRUCTURE**: Maintain LinkedIn best practices (short paragraphs, white space, engaging)

🚨 CRITICAL RULES:
- Output ONLY the refined post text - NO meta-commentary
- NO phrases like "Here's the refined version..." or "I've made the following changes..."
- If the user asks to make it shorter, actually reduce the word count
- If they ask for more details, add relevant content
- If they request a tone change, adjust the language style accordingly
- If they want to add elements (emojis, statistics, etc.), incorporate them naturally
- Keep the essence of the original message unless specifically told to change it
- Maintain professional LinkedIn standards unless asked otherwise

🎨 FORMATTING:
- Keep short paragraphs (1-3 lines)
- Use white space for readability
- Include emojis ONLY if requested or if they're in the original
- Maintain bullet points or structure if present
- Ensure proper line breaks

Generate the refined post now:`

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`

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
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json()
      console.error("Gemini API error:", errorData)
      throw new Error("Failed to refine post with AI")
    }

    const geminiData = await geminiResponse.json()
    const refinedContent = geminiData.candidates[0].content.parts[0].text.trim()

    // Deduct 1 credit for refinement
    try {
      const { error: deductError } = await supabase.rpc("deduct_credits", {
        p_user_id: user.id,
        p_amount: 1,
        p_type: "text_refinement",
        p_description: `Refined LinkedIn post with prompt: ${refinementPrompt.slice(0, 50)}...`,
      } as any)

      if (deductError) {
        console.error("Error deducting credits:", deductError)
        // Don't fail the request if credit deduction fails, but log it
      }
    } catch (creditError) {
      console.error("Credit deduction failed:", creditError)
    }

    console.log("✅ Post refined successfully")
    return NextResponse.json({
      content: refinedContent,
      creditsUsed: 1,
      creditsRemaining: currentCredits - 1,
    })
  } catch (error: any) {
    console.error("Error refining post:", error)
    return NextResponse.json(
      { error: error.message || "Failed to refine post" },
      { status: 500 }
    )
  }
}
