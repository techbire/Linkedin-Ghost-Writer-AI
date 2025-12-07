import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { Database } from "@/types/database"

type UserCredits = Database["public"]["Tables"]["user_credits"]["Row"]
type PostInsert = Database["public"]["Tables"]["posts"]["Insert"]
type Post = Database["public"]["Tables"]["posts"]["Row"]

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
      designStyle,
      theme,
      isDraft,
    } = body

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      )
    }

    // Calculate credits needed
    const creditsNeeded = slideCount * 5 + 2

    // Check user credits
    const { data: creditsData, error: creditsError } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .single<UserCredits>()

    if (creditsError || !creditsData) {
      return NextResponse.json(
        { error: "Failed to fetch user credits" },
        { status: 500 }
      )
    }

    if (creditsData.credits < creditsNeeded) {
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

    // Generate carousel content
    const slides: string[] = []

    // Generate multi-slide content using Gemini
    const prompt = `You are a LinkedIn carousel content expert. Create ${slideCount} engaging slides for a LinkedIn carousel post.
      
Format each slide as:
SLIDE [number]:
[Headline]
[Content - 2-3 sentences]

Make it engaging, actionable, and optimized for LinkedIn. ${hook ? `Start with this hook: "${hook}"` : ""}

Topic: ${topic}
Tone: ${tone}
Content Type: ${contentType}
Number of Slides: ${slideCount}

Create ${slideCount} carousel slides with compelling headlines and concise content.`

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            topP: 0.95,
            maxOutputTokens: 8192,
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
      
      // Parse slides from generated text
      const slideMatches = generatedText.match(/SLIDE \d+:([\s\S]*?)(?=SLIDE \d+:|$)/g)
      if (slideMatches) {
        slides.push(...slideMatches.map((s: string) => s.replace(/SLIDE \d+:\s*/, "").trim()))
      }

    // Generate images for each slide using Gemini 2.5 Flash Image
    const imageUrls: string[] = []
    const { primary, secondary } = theme

    // Define variety of design styles/templates
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

    console.log(`Generating ${slides.length} images with Gemini 2.5 Flash Image API...`)
    console.log(`Using design style: ${selectedStyle.name}`)
    
    try {
      const imagePromises = slides.map(async (slideContent, index) => {
        // Add variation to each slide's design
        const layoutVariations = [
          "centered composition with focal point in the middle",
          "left-aligned layout with strong visual hierarchy",
          "split-screen design with content on one side",
          "diagonal composition with dynamic flow",
          "top-heavy layout with bold header section"
        ]
        
        const layoutVariation = layoutVariations[index % layoutVariations.length]
        
        const imagePrompt = `Create a professional, eye-catching LinkedIn carousel slide image in landscape format (16:9 aspect ratio).

Design Style: ${selectedStyle.style}

Layout Approach: ${layoutVariation}

Color Palette:
- Primary Color: ${primary}
- Secondary Color: ${secondary}
- Use complementary colors and shades for visual interest
- Ensure high contrast for readability

Visual Elements:
- ${index === 0 ? "Eye-catching opener with strong visual hook" : ""}
- ${index === slides.length - 1 ? "Memorable closing design with call-to-action feel" : ""}
- Professional typography with varied font weights
- Modern UI elements and visual accents
- Subtle patterns or textures for depth
- Icons or abstract illustrations where appropriate

Content to Visualize:
${slideContent.substring(0, 300)}

Design Requirements:
- Each slide should feel unique but cohesive with the series
- High quality, Instagram/LinkedIn worthy aesthetic
- Business professional but visually engaging
- Stand out in a busy social feed
- Optimized for mobile and desktop viewing

Create slide ${index + 1} of ${slides.length} with this specific design style.`

        const geminiImageUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`

        const response = await fetch(geminiImageUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate an image: ${imagePrompt}`,
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
          console.error(`Failed to generate image ${index + 1}:`, response.status)
          return null
        }

        const data = await response.json()
        
        // Extract image from response
        const imagePart = data.candidates?.[0]?.content?.parts?.find(
          (part: any) => part.inlineData?.mimeType?.startsWith("image/")
        )

        if (!imagePart?.inlineData?.data) {
          console.error(`No image in response for slide ${index + 1}`)
          return null
        }

        // Return the base64 image data URL
        const mimeType = imagePart.inlineData.mimeType
        return `data:${mimeType};base64,${imagePart.inlineData.data}`
      })

      const results = await Promise.all(imagePromises)
      imageUrls.push(...results.filter((url): url is string => url !== null))
      
      console.log(`Successfully generated ${imageUrls.length} images`)
    } catch (imageError) {
      console.error("Error generating images:", imageError)
      // Continue without images if image generation fails
    }

    // Deduct credits using RPC function
    try {
      const { error: deductError } = await supabase.rpc("deduct_credits", {
        p_user_id: user.id,
        p_amount: creditsNeeded,
        p_type: "text_generation",
        p_description: `Carousel generation: ${slideCount} slides`,
      } as any)

      if (deductError) {
        console.error("Failed to deduct credits:", deductError)
        return NextResponse.json(
          { error: "Failed to process credits" },
          { status: 500 }
        )
      }
    } catch (creditError) {
      console.error("Credit deduction failed:", creditError)
      return NextResponse.json(
        { error: "Failed to process credits" },
        { status: 500 }
      )
    }

    // Upload images to Supabase storage and save to post library if isDraft is enabled
    let uploadedImageUrls: string[] = []
    let savedPost: Post | null = null

    if (isDraft && imageUrls.length > 0) {
      try {
        // Upload each image to Supabase storage bucket 'image'
        const uploadPromises = imageUrls.map(async (dataUrl, index) => {
          // Convert base64 data URL to blob
          const response = await fetch(dataUrl)
          const blob = await response.blob()
          
          // Create unique filename
          const timestamp = Date.now()
          const fileName = `carousel_${user.id}_${timestamp}_slide_${index + 1}.png`
          
          // Upload to Supabase storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("image")
            .upload(fileName, blob, {
              contentType: "image/png",
              cacheControl: "3600",
              upsert: false,
            })

          if (uploadError) {
            console.error(`Failed to upload image ${index + 1}:`, uploadError)
            return null
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from("image")
            .getPublicUrl(fileName)

          return publicUrl
        })

        const uploadResults = await Promise.all(uploadPromises)
        uploadedImageUrls = uploadResults.filter((url): url is string => url !== null)
        
        console.log(`Successfully uploaded ${uploadedImageUrls.length} images to storage`)

        // Save carousel to posts table
        const carouselContent = slides.join("\n\n---\n\n")
        
        const postData: PostInsert = {
          user_id: user.id,
          content: carouselContent,
          category: body.category || "Any",
          tone,
          status: "draft",
          post_type: "carousel",
          slides: slides as any,
          image_urls: uploadedImageUrls,
          theme: theme as any,
        }

        const { data: insertedPost, error: postError } = await supabase
          .from("posts")
          // @ts-ignore - posts table exists but Supabase types need regeneration after migration
          .insert(postData)
          .select()
          .single<Post>()

        if (postError) {
          console.error("Failed to save carousel to posts:", postError)
        } else {
          savedPost = insertedPost
          console.log("Carousel saved to post library:", insertedPost?.id)
        }
      } catch (storageError) {
        console.error("Error uploading images or saving post:", storageError)
        // Continue even if storage/save fails - user still gets the generated content
      }
    }

    // Note: Images are generated using Gemini 2.5 Flash Image API
    // Each slide is converted to a professional LinkedIn carousel image with custom themes
    
    return NextResponse.json({
      slides,
      imageUrls: uploadedImageUrls.length > 0 ? uploadedImageUrls : imageUrls,
      creditsUsed: creditsNeeded,
      saved: savedPost !== null,
      postId: savedPost?.id,
    })
  } catch (error) {
    console.error("Error generating carousel:", error)
    return NextResponse.json(
      { error: "Failed to generate carousel" },
      { status: 500 }
    )
  }
}
