import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { Database } from "@/types/database"

type UserCredits = Database["public"]["Tables"]["user_credits"]["Row"]

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
      slides, // Array of { title, content }
      designStyle, // Design style ID
      theme, // { primary, secondary }
      slideCount,
    } = body

    if (!slides || slides.length === 0) {
      return NextResponse.json(
        { error: "Slides are required" },
        { status: 400 }
      )
    }

    // Define design styles
    const designStyles = [
      {
        id: "modern-gradient",
        name: "Modern Gradient",
        style: "Use vibrant gradient background (diagonal top-left to bottom-right). Add large, semi-transparent geometric shapes (circles, hexagons) floating. White text with drop shadows. Modern sans-serif typography (Poppins). Slide number in top-right with subtle badge. Clean white card overlays for content sections."
      },
      {
        id: "minimalist-bold",
        name: "Minimalist Bold",
        style: "Pure solid color background (no gradients). One accent color only. EXTRA LARGE bold typography for headline (72pt+). Maximum white space. Single thin line separator. Slide number bottom-right. Ultra-minimal - text and space only, NO shapes or decorations."
      },
      {
        id: "abstract-shapes",
        name: "Abstract Shapes",
        style: "Background filled with overlapping irregular shapes (triangles, polygons, organic blobs). Asymmetric composition. Multiple contrasting colors (5+ colors). Text in white boxes with high contrast. Playful, energetic feel. Slide number integrated into a shape element."
      },
      {
        id: "professional-grid",
        name: "Professional Grid",
        style: "Strict 12-column grid system visible with faint lines. Content aligned to grid. Sidebar color block (20% width) on left with slide number. Main content in grid cells. Monochromatic color scheme. Sharp corners. Business-formal aesthetic. Typography: IBM Plex or similar."
      },
      {
        id: "gradient-mesh",
        name: "Gradient Mesh",
        style: "Smooth multi-point gradient mesh (4+ color stops creating organic flow). Blur effects throughout. Glassmorphism style - frosted glass panels for content. Soft rounded corners (24px+). Dreamy, ethereal aesthetic. Light typography. Slide number in frosted bubble."
      },
      {
        id: "tech-inspired",
        name: "Tech Inspired",
        style: "Dark background (navy/black). Neon accent lines (cyan, magenta). Circuit board patterns or dot matrix. Monospace font for numbers. Futuristic HUD-style elements. Glowing effects. Small tech icons (chip, network). Slide number in hexagon with glow. Sci-fi aesthetic."
      },
      {
        id: "creative-asymmetric",
        name: "Creative Asymmetric",
        style: "Break all symmetry - diagonal splits (30/70 ratio). Rotated text elements (5-15 degrees). Cut-off shapes extending beyond frame. Layered paper-cut style. Bold contrasting colors. Dynamic tension. Text at unexpected angles. Slide number rotated 90 degrees on edge."
      },
      {
        id: "elegant-minimal",
        name: "Elegant Minimal",
        style: "Luxury aesthetic - cream/beige background. Serif typography (Playfair, Cormorant). Gold or rose gold accent lines (1px thin). Centered layout. Generous margins (15% on all sides). Subtle texture (linen, paper grain). Small elegant flourish/ornament. Slide number in small serif font bottom center."
      },
      {
        id: "bold-statement",
        name: "Bold Statement",
        style: "Headline dominates 60% of space - HUGE bold type (100pt+). High contrast (black on yellow, white on red). Brutalist design - no rounded corners, harsh edges. Condensed sans-serif font. Minimal body text. Impact over elegance. Slide number oversized in corner (48pt)."
      },
      {
        id: "layered-depth",
        name: "Layered Depth",
        style: "Multiple layers with strong shadows creating 3D depth. Elevated cards at different Z-levels. Isometric or 3D perspective elements. Long drop shadows (45-degree angle). Skeuomorphic details. Rich depth cues. Color layers stacked. Slide number on floating ribbon with shadow."
      }
    ]

    // Find the selected design style or default to first
    const selectedStyle = designStyles.find(s => s.id === designStyle) || designStyles[0]

    // Calculate credits needed (5 credits per slide + 2 base)
    const creditsNeeded = slideCount * 5 + 2

    // Check user credits
    const { data: creditsData, error: creditsError } = await supabase
      .from("user_credits")
      .select("available_credits")
      .eq("user_id", user.id)
      .single<UserCredits>()

    if (creditsError || !creditsData) {
      return NextResponse.json(
        { error: "Failed to fetch user credits" },
        { status: 500 }
      )
    }

    if (creditsData.available_credits < creditsNeeded) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${creditsNeeded} credits.` },
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

    const { primary, secondary } = theme
    const imageUrls: string[] = []

    console.log(`\n========================================`)
    console.log(`🎨 PROGRESSIVE CAROUSEL IMAGE GENERATION`)
    console.log(`========================================`)
    console.log(`📊 Total Slides: ${slides.length}`)
    console.log(`🎨 Design Style: ${selectedStyle.name}`)
    console.log(`🎨 Theme Colors:`)
    console.log(`   Primary: ${primary}`)
    console.log(`   Secondary: ${secondary}`)
    console.log(`========================================\n`)

    // PHASE 3 & 4: Generate images progressively
    // STEP 1: Generate FIRST slide explicitly and use as reference
    // STEP 2: Send first slide PNG to subsequent generations as VISUAL context
    
    let firstSlideImageBase64: string | null = null // Store first slide PNG as reference
    let firstSlideColorReference = `Background: ${primary}, Accent: ${secondary}`
    
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]
      const isFirstSlide = i === 0
      
      console.log(`\n--- Slide ${i + 1}/${slides.length} ---`)
      console.log(`📝 Title: "${slide.title}"`)
      console.log(`📄 Content: "${slide.content.substring(0, 50)}..."`)
      console.log(`⚙️  Processing: ${isFirstSlide ? 'FIRST SLIDE (Template)' : `Slide ${i + 1} (Using template)`}`)

      let imagePrompt = ""
      let textDataJson = ""

      if (isFirstSlide) {
        // PHASE 3: First slide - establish the template
        console.log(`🎨 Generating FIRST slide (template establishment)...`)
        
        // Prepare structured text data as JSON
        textDataJson = JSON.stringify({
          slideNumber: `1/${slides.length}`,
          title: slide.title,
          content: slide.content
        }, null, 2)
        
        imagePrompt = `You are a creative visual designer for social media carousels.

Create a single slide image that will serve as the TEMPLATE for all future slides in this carousel.

DESIGN STYLE TO USE: ${selectedStyle.style}

🔤 CRITICAL TEXT RENDERING INSTRUCTIONS:
I am providing the text content as structured JSON data below. You MUST render this text EXACTLY as provided in the JSON - character by character, including all punctuation, spacing, and capitalization.

TEXT DATA (JSON):
\`\`\`json
${textDataJson}
\`\`\`

MANDATORY RULES FOR TEXT:
1. Copy "title" field EXACTLY as written - do not change a single character
2. Copy "content" field EXACTLY as written - do not change a single character
3. Copy "slideNumber" field EXACTLY as written
4. Treat this as RAW DATA to render, NOT as text to edit or improve
5. Do NOT fix spelling, grammar, or punctuation
6. Do NOT rephrase or rewrite anything
7. Your job is to RENDER the JSON values as-is, like a printer

CRITICAL COLOR REQUIREMENTS:
- Background: Use EXACTLY ${primary} as the primary background color
- Accent/Text: Use EXACTLY ${secondary} as the secondary/accent color
- These exact hex colors MUST be used consistently
- Do NOT use any other colors or variations
- Keep the same color scheme for the entire carousel

DESIGN REQUIREMENTS:
- Professional, clean, modern design suitable for LinkedIn
- Bold, readable typography (white or high-contrast text)
- Clear hierarchy: Title at top, content below
- Minimalist but CREATIVE design with visual interest
- Aspect ratio: 1080x1080 (square format)
- This design will be the EXACT reference for all other slides

CREATIVE ELEMENTS TO INCLUDE:
- Subtle geometric shapes or patterns in the background (circles, triangles, lines)
- Gradient overlays or color transitions (using ${primary} and ${secondary})
- Dynamic diagonal lines or abstract shapes for visual flow
- Rounded corners or modern card-style layouts
- Icons or small visual elements that complement the content
- Depth with shadows or layered elements
- Modern, trendy design that stands out on social media

MANDATORY SLIDE NUMBERING:
- Render the "slideNumber" from JSON in the TOP RIGHT corner
- Use clean, modern font
- Color: white or ${secondary}
- Size: medium-small, clearly visible but not distracting
- Position: Consistent across all slides

Create a visually stunning first slide with these EXACT colors (Background ${primary}, Accents ${secondary}), creative design elements, and render ALL text EXACTLY from the JSON data provided above.`
      } else {
        // PHASE 4: Subsequent slides - use FIRST slide as visual reference
        console.log(`🔄 Generating slide ${i + 1} using FIRST slide as reference template...`)
        console.log(`📌 Reference: First slide stored and will be used as context`)
        
        // Prepare structured text data as JSON
        textDataJson = JSON.stringify({
          slideNumber: `${i + 1}/${slides.length}`,
          title: slide.title,
          content: slide.content
        }, null, 2)
        
        imagePrompt = `You are continuing a social media carousel design. This is slide ${i + 1} of ${slides.length}.

REFERENCE IMAGE PROVIDED: The first slide of this carousel is provided as visual reference.

DESIGN STYLE: ${selectedStyle.style}

CRITICAL: Look at the reference image and REPLICATE its exact design.

🔤 CRITICAL TEXT RENDERING INSTRUCTIONS:
I am providing the text content as structured JSON data below. You MUST render this text EXACTLY as provided in the JSON - character by character, including all punctuation, spacing, and capitalization.

TEXT DATA (JSON):
\`\`\`json
${textDataJson}
\`\`\`

MANDATORY RULES FOR TEXT:
1. Copy "title" field EXACTLY as written - do not change a single character
2. Copy "content" field EXACTLY as written - do not change a single character
3. Copy "slideNumber" field EXACTLY as written
4. Treat this as RAW DATA to render, NOT as text to edit or improve
5. Do NOT fix spelling, grammar, or punctuation
6. Do NOT rephrase or rewrite anything
7. Your job is to RENDER the JSON values as-is, like a printer printing text
8. Think of yourself as a rendering engine, not an editor

MANDATORY COLOR CONSISTENCY (DO NOT DEVIATE):
- Background: Use ONLY ${primary} (this exact hex code)
- Accent/Text: Use ONLY ${secondary} (this exact hex code)
- Do NOT use any other colors, shades, tints, or variations
- Do NOT use gradients, overlays, or color filters (unless the reference image uses them)
- Do NOT use AI interpretation of "similar" colors
- Copy the EXACT color values from reference: ${firstSlideColorReference}
- If you're unsure, default to white text on ${primary} background

MANDATORY DESIGN CONSISTENCY (COPY FROM REFERENCE IMAGE):
- EXACT same font family, size, and weight as reference
- EXACT same layout structure (title position, content position, spacing)
- EXACT same background style, patterns, and geometric shapes as reference
- EXACT same creative elements (circles, lines, shapes, gradients) as reference
- EXACT same text colors and styling
- EXACT same margins, padding, and whitespace
- EXACT same visual elements, icons, and decorations
- EXACT same depth effects (shadows, layers)
- Only the text content and slide number should change

MANDATORY SLIDE NUMBERING:
- Render the "slideNumber" from JSON in the TOP RIGHT corner
- Use the EXACT same position, font, size, and color as slide 1
- This number MUST be clearly visible
- Keep consistent with slide 1's numbering style

CREATIVE ELEMENTS FROM SLIDE 1 (MUST REPLICATE):
- Same geometric shapes or patterns
- Same gradient overlays or transitions
- Same diagonal lines or abstract shapes
- Same modern card-style layouts
- Same icons or visual elements style
- Same depth and shadow effects

FINAL REMINDER: 
- Render ALL text from JSON data EXACTLY as provided
- Colors: ${primary} (background), ${secondary} (accent)
- Design: Identical to slide 1, only text content changes`
      }

      try {
        const geminiImageUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`

        console.log(`📡 Calling Gemini API...`)
        
        // Build request body - include first slide as reference for subsequent slides
        const requestParts: any[] = [
          {
            text: `Generate an image: ${imagePrompt}`,
          },
        ]

        // STEP 2: For slides after first, include the first slide PNG as visual reference
        if (!isFirstSlide && firstSlideImageBase64) {
          console.log(`📎 Including FIRST slide as visual reference (PNG context)`)
          requestParts.push({
            inlineData: {
              mimeType: "image/png",
              data: firstSlideImageBase64,
            },
          })
        }

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
          console.error(`❌ Failed to generate image ${i + 1}:`, response.status)
          console.error(`Error details:`, errorText)
          throw new Error(`Image generation failed for slide ${i + 1}: ${response.status}`)
        }

        console.log(`✅ API call successful for slide ${i + 1}`)

        const data = await response.json()
        
        // Extract image from response
        const imagePart = data.candidates?.[0]?.content?.parts?.find(
          (part: any) => part.inlineData?.mimeType?.startsWith("image/")
        )

        if (!imagePart?.inlineData?.data) {
          console.error(`❌ No image in response for slide ${i + 1}`)
          throw new Error(`No image generated for slide ${i + 1}`)
        }

        // Store the base64 image data
        const base64Data = imagePart.inlineData.data
        const mimeType = imagePart.inlineData.mimeType
        const imageDataUrl = `data:${mimeType};base64,${base64Data}`
        
        // STEP 1: If this is the first slide, store it as reference for subsequent slides
        if (isFirstSlide) {
          firstSlideImageBase64 = base64Data // Store raw base64 for API calls
          console.log(`📌 FIRST slide generated and stored as reference (${(base64Data.length / 1024).toFixed(2)} KB)`)
          console.log(`✨ This slide will be used as VISUAL TEMPLATE for all subsequent slides`)
        }
        
        imageUrls.push(imageDataUrl)
        
        console.log(`✅ Successfully generated slide ${i + 1}/${slides.length}`)
        console.log(`   Image size: ${(base64Data.length / 1024).toFixed(2)} KB`)
      } catch (imageError) {
        console.error(`❌ Error generating image ${i + 1}:`, imageError)
        throw imageError
      }
    }

    console.log(`\n========================================`)
    console.log(`✅ GENERATION COMPLETE`)
    console.log(`========================================`)
    console.log(`📊 Total slides generated: ${imageUrls.length}/${slides.length}`)
    console.log(`📌 First slide used as template: ${firstSlideImageBase64 ? 'YES' : 'NO'}`)
    console.log(`========================================\n`)

    // Deduct credits
    console.log(`💳 Processing credits...`)
    console.log(`   User ID: ${user.id}`)
    console.log(`   Amount: ${creditsNeeded} credits`)
    
    try {
      const { error: deductError } = await supabase.rpc("deduct_credits", {
        p_user_id: user.id,
        p_amount: creditsNeeded,
        p_description: `Carousel generation: ${slideCount} slides with images`,
        p_reference_id: null,
      } as any)

      if (deductError) {
        console.error("❌ Failed to deduct credits:", deductError)
        return NextResponse.json(
          { error: "Failed to process credits" },
          { status: 500 }
        )
      }
      
      console.log(`✅ Credits deducted successfully`)
    } catch (creditError) {
      console.error("❌ Credit deduction failed:", creditError)
      return NextResponse.json(
        { error: "Failed to process credits" },
        { status: 500 }
      )
    }

    console.log(`\n🎉 Sending ${imageUrls.length} slides to frontend...`)
    
    return NextResponse.json({
      imageUrls,
      creditsUsed: creditsNeeded,
      message: `Generated ${imageUrls.length} images with consistent template`,
    })
  } catch (error) {
    console.error("Error generating carousel images:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate carousel images" },
      { status: 500 }
    )
  }
}
