import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// Design styles with specific prompts
const designStyles = [
  {
    id: "modern-gradient",
    name: "Modern Gradient",
    style: "Use vibrant gradient background (diagonal top-left to bottom-right). Add large geometric shapes (circles or rectangles) as design elements. Place text in white rounded-corner cards with drop shadows. Use 48-60pt headline font size. Add subtle pattern overlays.",
  },
  {
    id: "minimalist-bold",
    name: "Minimalist Bold",
    style: "Use pure SOLID color background (NO gradients). Ultra-minimal design with ZERO decorative elements. Headline must be 72pt+ font size. Use ONLY text - no shapes, no icons, no illustrations. Maximum 2 colors total (background + text). Brutalist typography.",
  },
  {
    id: "abstract-shapes",
    name: "Abstract Shapes",
    style: "Fill background with 5+ overlapping abstract blob/polygon shapes in different colors. Each shape must have 40%+ opacity. Asymmetric composition. Headline rotated 2-5 degrees. Use liquid/organic shapes, NOT geometric. Shapes must overlap text area.",
  },
  {
    id: "professional-grid",
    name: "Professional Grid",
    style: "Use strict 12-column grid system. Add visible sidebar (20% width) with accent color. Content in remaining 80%. Monochromatic color scheme. Sharp corners (border-radius: 0px). Use system fonts. Add subtle grid lines visible in background.",
  },
  {
    id: "gradient-mesh",
    name: "Gradient Mesh",
    style: "Create multi-point gradient mesh (4+ color stops). Apply glassmorphism effect on text containers (backdrop-blur + transparency). Use mesh gradients, NOT linear gradients. Add subtle grain texture overlay. Soft shadows everywhere.",
  },
  {
    id: "tech-inspired",
    name: "Tech Inspired",
    style: "Dark background (#0A0A0A to #1A1A1A). Add neon accent colors (cyan/magenta). Include circuit board pattern or HUD-style elements. Monospace font for numbers/stats. Add glowing borders (box-shadow with color). Futuristic/tech aesthetic. Scanlines optional.",
  },
  {
    id: "creative-asymmetric",
    name: "Creative Asymmetric",
    style: "Divide canvas asymmetrically (30/70 split). Place headline in smaller section. Rotate text blocks 8-15 degrees. Use cut-off design elements that extend beyond canvas edges. Duotone color palette. Bold experimental typography. Intentionally unbalanced composition.",
  },
  {
    id: "elegant-minimal",
    name: "Elegant Minimal",
    style: "Cream/beige background (#F5F5DC to #FAF9F6). Use serif fonts exclusively. Add gold/bronze accent color (#B8860B). Subtle paper texture overlay. Generous white space (60%+ empty). Classical proportions. Thin divider lines. Luxury aesthetic.",
  },
  {
    id: "bold-statement",
    name: "Bold Statement",
    style: "Headline occupies 60%+ of canvas. Font size 100pt+. Use bold/black font weight. High contrast colors (pure black + vibrant color). Minimal body text (under 10 words). Brutalist typography approach. Statement-making design. Fill the space with TYPE.",
  },
  {
    id: "layered-depth",
    name: "Layered Depth",
    style: "Create 3+ distinct Z-levels with shadows. Each card/element has visible elevation (8-24px shadows). Use isometric or perspective view. Add long shadows (45-degree angle). Layered paper cut aesthetic. Each layer distinct color. Strong 3D depth perception.",
  },
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slideIndex, slideContent, feedback, referenceSlide, theme, designStyle, totalSlides, currentSlideImageUrl } = body

    console.log(`\n========================================`)
    console.log(`🔄 REGENERATE SPECIFIC SLIDE REQUEST`)
    console.log(`========================================`)
    console.log(`📍 Slide Index: ${slideIndex + 1}`)
    console.log(`👤 Feedback: "${feedback}"`)
    console.log(`🎨 Design Style: ${designStyle}`)
    console.log(`🎨 Theme: Primary ${theme.primary}, Secondary ${theme.secondary}`)
    console.log(`📝 Current Slide Title: "${slideContent.title}"`)
    console.log(`📝 Reference Slide Title: "${referenceSlide.title}"`)
    console.log(`🖼️  Current Slide Image URL: ${currentSlideImageUrl ? 'PROVIDED ✓' : 'MISSING ✗'}`)
    console.log(`========================================\n`)

    // Get user session
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("❌ Unauthorized - no user session")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log(`✅ User authenticated: ${user.id}`)

    // Find the selected design style
    const selectedStyle = designStyles.find((s) => s.id === designStyle) || designStyles[0]
    console.log(`✅ Using design style: ${selectedStyle.name}`)

    // Check for Gemini API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error("❌ Gemini API key not configured")
      return NextResponse.json(
        { error: "Image generation API not configured" },
        { status: 500 }
      )
    }

    console.log(`✅ API key found`)

    // Create the regeneration prompt with user feedback
    
    // Prepare structured text data as JSON
    const textDataJson = JSON.stringify({
      slideNumber: `${slideIndex + 1}/${totalSlides || slideIndex + 1}`,
      title: slideContent.title,
      content: slideContent.content
    }, null, 2)
    
    const referenceTextJson = JSON.stringify({
      slideNumber: `1/${totalSlides || slideIndex + 1}`,
      title: referenceSlide.title,
      content: referenceSlide.content
    }, null, 2)
    
    const imagePrompt = `You are regenerating a specific slide in a social media carousel based on user feedback.

⚠️  CRITICAL: You are EDITING an existing slide image. Keep EVERYTHING exactly the same EXCEPT what the user asks to change.

CURRENT SLIDE TEXT DATA (JSON):
\`\`\`json
${textDataJson}
\`\`\`

USER'S SPECIFIC FEEDBACK/FIX REQUEST:
"${feedback}"

DESIGN STYLE: ${selectedStyle.style}

🎯 YOUR MISSION:
Look at the CURRENT slide image (provided above as context) and make ONLY the changes the user requested. Everything else must stay IDENTICAL.

🔤 TEXT HANDLING INSTRUCTIONS:

IF USER MENTIONS TEXT CHANGES (e.g., "fix typo", "change text", "update wording"):
- Apply ONLY that specific text change
- Keep all other text from JSON exactly as-is
- Example: User says "Change 'recieve' to 'receive'" → Only fix that word, keep everything else

IF USER DOES NOT MENTION TEXT:
- Render ALL text from JSON exactly as provided
- Copy "title" field character-by-character
- Copy "content" field character-by-character  
- Copy "slideNumber" field character-by-character
- Do NOT change any spelling, grammar, or wording

🎨 DESIGN HANDLING INSTRUCTIONS:

IF USER MENTIONS DESIGN CHANGES (e.g., "change color", "make bigger", "move title"):
- Apply ONLY that specific design change
- Keep all other design elements identical to current slide
- Example: User says "Change white to blue" → Only change that color, keep layout/fonts/everything else

IF USER DOES NOT MENTION DESIGN:
- Keep EXACT same layout, fonts, colors, sizes, positions
- Keep EXACT same background, shapes, patterns, decorative elements
- Keep EXACT same spacing, margins, padding
- Copy the current slide's design perfectly

🚫 WHAT YOU MUST NOT DO:
1. Do NOT redesign the slide
2. Do NOT "improve" anything the user didn't mention
3. Do NOT change fonts unless asked
4. Do NOT change colors unless asked
5. Do NOT rearrange layout unless asked
6. Do NOT fix spelling unless user explicitly asks
7. Do NOT add or remove design elements unless asked

✅ WHAT YOU MUST DO:
1. Look at the current slide image carefully
2. Identify what the user wants changed from their feedback
3. Make ONLY that specific change
4. Keep EVERYTHING else identical
5. Think: "Minimal change, maximum consistency"

CRITICAL REQUIREMENTS:

1. **ANALYZE THE USER'S FEEDBACK**:
   - Read: "${feedback}"
   - Identify what needs to change (text? color? layout?)
   - Make ONLY that change
   - Ignore everything else

2. **TEXT CHANGES**:
   - If user mentions text changes: Apply them
   - If user doesn't mention text: Use JSON data exactly as-is
   - Background: ${theme.primary}
   - Accent: ${theme.secondary}

3. **DESIGN CHANGES**:
   - If user mentions color: Change ONLY that color
   - If user mentions size: Change ONLY that size
   - If user mentions position: Change ONLY that position
   - Keep everything else identical to the current slide

4. **WHAT TO KEEP IDENTICAL**:
   - Same font family and typography style
   - Same layout and positioning (unless user asks to change)
   - Same colors (unless user asks to change)
   - Same background patterns and shapes
   - Same decorative elements
   - Same spacing and margins
   - Same slide number position and style
   - Render "slideNumber" from JSON: exactly as provided

REMEMBER: 
- Look at the CURRENT slide image (provided as context)
- Change ONLY what the user requested
- Keep EVERYTHING else identical
- Think: "Surgical precision - minimal change only"
- Canvas: 1080x1080px (square)

Generate the slide with the user's requested changes applied, keeping everything else identical to the current slide.`

    console.log(`\n📤 Sending request to Gemini Image API...`)
    console.log(`📋 Prompt length: ${imagePrompt.length} characters`)

    try {
      const geminiImageUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`

      const requestParts: any[] = [
        {
          text: `Generate an image: ${imagePrompt}`,
        },
      ]

      // Include the CURRENT slide image as context for minimal changes
      if (currentSlideImageUrl) {
        console.log(`📎 Including CURRENT slide image for context...`)
        try {
          // If it's a data URL, extract the base64 data
          if (currentSlideImageUrl.startsWith('data:image')) {
            const base64Data = currentSlideImageUrl.split(',')[1]
            const mimeType = currentSlideImageUrl.match(/data:(.*?);/)?.[1] || 'image/png'
            
            console.log(`✅ Including current slide image as base64 (${mimeType})`)
            requestParts.push({
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            })
          } else {
            // If it's a URL, fetch it and convert to base64
            console.log(`🌐 Fetching current slide image from URL: ${currentSlideImageUrl.substring(0, 60)}...`)
            const imageResponse = await fetch(currentSlideImageUrl)
            if (imageResponse.ok) {
              const imageBuffer = await imageResponse.arrayBuffer()
              const base64Data = Buffer.from(imageBuffer).toString('base64')
              
              console.log(`✅ Current slide image fetched and encoded (${(base64Data.length / 1024).toFixed(2)} KB)`)
              requestParts.push({
                inlineData: {
                  mimeType: 'image/png',
                  data: base64Data,
                },
              })
            } else {
              console.warn(`⚠️  Failed to fetch current slide image: ${imageResponse.status}`)
            }
          }
        } catch (fetchError: any) {
          console.warn(`⚠️  Error fetching current slide image: ${fetchError.message}`)
        }
      } else {
        console.warn(`⚠️  No current slide image URL provided - regeneration will recreate from scratch!`)
      }

      console.log(`📦 Request parts: ${requestParts.length} (text + ${requestParts.length > 1 ? 'current slide image ✓' : 'NO IMAGE ✗'})`)

      const response = await fetch(geminiImageUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: requestParts,
            },
          ],
          generationConfig: {
            responseModalities: ["image"],
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Gemini API error: ${response.status}`)
        console.error(`Error details: ${errorText}`)
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      console.log(`✅ Received response from Gemini`)

      // Extract base64 image from response
      const imagePart = data?.candidates?.[0]?.content?.parts?.find(
        (part: any) => part.inlineData?.mimeType?.startsWith("image/")
      )

      if (!imagePart?.inlineData?.data) {
        console.error("❌ No image data in response")
        console.error("Response structure:", JSON.stringify(data, null, 2))
        throw new Error("No image generated in response")
      }

      const base64Image = imagePart.inlineData.data
      const mimeType = imagePart.inlineData.mimeType
      console.log(`✅ Image generated: ${mimeType}, size: ${base64Image.length} bytes`)

      // Convert to data URL
      const dataUrl = `data:${mimeType};base64,${base64Image}`

      console.log(`\n========================================`)
      console.log(`✅ SLIDE ${slideIndex + 1} REGENERATED SUCCESSFULLY`)
      console.log(`========================================`)
      console.log(`📊 Image size: ${(base64Image.length / 1024).toFixed(2)} KB`)
      console.log(`🎯 Feedback addressed: "${feedback}"`)
      console.log(`========================================\n`)

      return NextResponse.json({
        success: true,
        imageUrl: dataUrl,
        slideIndex,
        message: `Slide ${slideIndex + 1} regenerated with your feedback applied`,
      })
    } catch (apiError: any) {
      console.error("❌ Image generation failed:", apiError.message)
      throw apiError
    }
  } catch (error: any) {
    console.error("Regenerate slide error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to regenerate slide" },
      { status: 500 }
    )
  }
}
