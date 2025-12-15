import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { Database } from "@/types/database"

type PostInsert = Database["public"]["Tables"]["posts"]["Insert"]
type Post = Database["public"]["Tables"]["posts"]["Row"]

interface SaveCarouselV2Request {
  title: string
  slides: Array<{
    id: string
    title: string
    content: string
  }>
  design: {
    colors: {
      primary: string
      secondary: string
      background: string
      text: string
    }
    backgroundTexture: string
    showNumbers: boolean
    logo: string | null
  }
  headshot?: {
    showHeadshot: boolean
    profilePic: string | null
    name: string
    handle: string
    showOnIntroOutroOnly: boolean
  }
}

export async function POST(request: Request) {
  console.log("=== Save Carousel V2 API Called ===")
  
  try {
    const supabase = await getSupabaseServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error("Auth error:", authError)
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log("User authenticated:", user.id)

    const body: SaveCarouselV2Request = await request.json()
    const { title, slides, design, headshot } = body

    console.log("Request body:", {
      title,
      slidesCount: slides?.length,
      hasLogo: !!design?.logo,
      hasHeadshot: !!headshot?.showHeadshot,
    })

    // Validation
    if (!title || title.trim() === "") {
      console.error("No title provided")
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    if (!slides || slides.length === 0) {
      console.error("No slides provided")
      return NextResponse.json(
        { error: "Slides are required" },
        { status: 400 }
      )
    }

    // Prepare carousel data for storage
    // Store text content only, images will be rendered on export
    const carouselContent = slides.map(slide => 
      `${slide.title}\n\n${slide.content}`
    ).join("\n\n---\n\n")

    // Extract just the text content for slides array
    const slidesText = slides.map(slide => slide.content)

    // Prepare theme object with design settings
    const theme = {
      version: 2, // Mark as v2 carousel
      colors: design.colors,
      backgroundTexture: design.backgroundTexture,
      showNumbers: design.showNumbers,
      logo: design.logo,
      headshot: headshot?.showHeadshot ? {
        profilePic: headshot.profilePic,
        name: headshot.name,
        handle: headshot.handle,
        showOnIntroOutroOnly: headshot.showOnIntroOutroOnly,
      } : null,
      // Store full slide data with titles for regeneration
      slidesData: slides,
    }

    const postData: PostInsert = {
      user_id: user.id,
      content: carouselContent,
      status: "draft",
      post_type: "carousel",
      slides: slidesText as any, // Store text array for compatibility
      image_urls: [], // Empty - images rendered on export
      theme: theme as any,
    }

    console.log("Post data prepared:", {
      user_id: user.id,
      title_length: title.length,
      post_type: postData.post_type,
      slidesCount: slides.length,
      version: theme.version,
    })

    const { data: savedPost, error: postError } = await supabase
      .from("posts")
      // @ts-ignore - posts table exists but Supabase types need regeneration after migration
      .insert(postData)
      .select()
      .single<Post>()

    if (postError) {
      console.error("Failed to save to posts table:", postError)
      return NextResponse.json(
        { error: `Failed to save carousel: ${postError.message}` },
        { status: 500 }
      )
    }

    console.log("Successfully saved carousel v2:", savedPost?.id)

    return NextResponse.json({
      success: true,
      carousel: {
        id: savedPost?.id,
        title,
        slideCount: slides.length,
        createdAt: savedPost?.created_at,
      },
      message: "Carousel saved to library successfully",
    })
  } catch (error: any) {
    console.error("Error saving carousel v2:", error)
    return NextResponse.json(
      { error: error.message || "Failed to save carousel" },
      { status: 500 }
    )
  }
}
