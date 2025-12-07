import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has enough credits (5 credits for image generation)
    const { data: userCredits } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle()

    const currentCredits = (userCredits as any)?.credits ?? 0

    const body = await request.json()
    const { caption, ratio, count = 1 } = body

    if (!caption) {
      return NextResponse.json({ error: "Caption is required" }, { status: 400 })
    }

    // Validate count (1-4 images)
    const imageCount = Math.min(Math.max(1, parseInt(count)), 4)
    const creditsNeeded = 5 * imageCount

    // Update credit check for multiple images
    if (currentCredits < creditsNeeded) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${creditsNeeded} credits to generate ${imageCount} images. Please upgrade your plan or purchase more credits.` },
        { status: 402 } // Payment Required
      )
    }

    // Check for Gemini API key
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    // Map ratio to descriptive format for the prompt
    const ratioDescriptionMap: Record<string, string> = {
      "1:1": "square format (1:1 aspect ratio)",
      "4:5": "portrait format (4:5 aspect ratio, vertical)",
      "16:9": "landscape format (16:9 aspect ratio, wide horizontal)",
      "9:16": "story format (9:16 aspect ratio, tall vertical)",
    }

    const ratioDescription = ratioDescriptionMap[ratio] || "square format (1:1 aspect ratio)"

    // Create image prompt from caption with aspect ratio specified
    const imagePrompt = `Create a professional, eye-catching image for a LinkedIn post in ${ratioDescription}. The image should be modern, clean, and suitable for business social media. 

Based on this post caption, create a relevant visual:
${caption.substring(0, 500)}

Style: Professional, modern, minimalist, high quality, suitable for LinkedIn
Format: ${ratioDescription}
Focus on: Key themes from the caption, business imagery, inspiring visuals`

    // Use Gemini 2.5 Flash for image generation
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`

    console.log(`Generating ${imageCount} images with Gemini 2.5 Flash Image API...`)
    console.log("Aspect Ratio:", ratio, "-", ratioDescription)

    // Generate multiple images with slight variations in parallel
    const imagePromises = Array.from({ length: imageCount }, async (_, index) => {
      const variation = index === 0 ? "" : ` (Variation ${index + 1}: Use different visual style, color scheme, or composition)`
      
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
                  text: `Generate an image: ${imagePrompt}${variation}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["image"],
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Gemini Image API error for image ${index + 1}:`, errorText)
        throw new Error(`Failed to generate image ${index + 1}: ${response.status}`)
      }

      const data = await response.json()
      
      // Extract image from response
      const imagePart = data.candidates?.[0]?.content?.parts?.find(
        (part: any) => part.inlineData?.mimeType?.startsWith("image/")
      )

      if (!imagePart?.inlineData?.data) {
        console.error(`No image in response for image ${index + 1}:`, JSON.stringify(data))
        throw new Error(`No image generated for image ${index + 1}`)
      }

      // Return the base64 image data URL
      const mimeType = imagePart.inlineData.mimeType
      return `data:${mimeType};base64,${imagePart.inlineData.data}`
    })

    // Wait for all images to be generated
    const imageUrls = await Promise.all(imagePromises)

    // Deduct credits for all generated images
    try {
      const { error: deductError } = await supabase.rpc("deduct_credits", {
        p_user_id: user.id,
        p_amount: creditsNeeded,
        p_type: "image_generation",
        p_description: `Generated ${imageCount} image${imageCount > 1 ? 's' : ''} with ${ratio} ratio`,
      } as any)

      if (deductError) {
        console.error("Error deducting credits:", deductError)
        // Don't fail the request if credit deduction fails, but log it
      }
    } catch (creditError) {
      console.error("Credit deduction failed:", creditError)
    }

    console.log(`${imageCount} images generated successfully`)
    return NextResponse.json({ imageUrls, count: imageCount })
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
