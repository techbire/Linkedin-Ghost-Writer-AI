import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { Database } from "@/types/database"

type PostInsert = Database["public"]["Tables"]["posts"]["Insert"]
type Post = Database["public"]["Tables"]["posts"]["Row"]

export async function POST(request: Request) {
  console.log("=== Save Carousel API Called ===")
  
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

    const body = await request.json()
    const {
      slides,
      imageUrls,
      tone,
      theme,
    } = body

    console.log("Request body:", {
      slidesCount: slides?.length,
      imageUrlsCount: imageUrls?.length,
      tone,
    })

    if (!slides || slides.length === 0) {
      console.error("No slides provided")
      return NextResponse.json(
        { error: "Slides are required" },
        { status: 400 }
      )
    }

    if (!imageUrls || imageUrls.length === 0) {
      console.error("No image URLs provided")
      return NextResponse.json(
        { error: "Image URLs are required" },
        { status: 400 }
      )
    }

    // Upload images to Supabase storage
    console.log("Starting image upload process...")
    const uploadedUrls: string[] = []

    for (let index = 0; index < imageUrls.length; index++) {
      const dataUrl = imageUrls[index]
      
      // Check if it's already a storage URL
      if (dataUrl.startsWith("http")) {
        console.log(`Image ${index + 1} already uploaded:`, dataUrl.substring(0, 50))
        uploadedUrls.push(dataUrl)
        continue
      }

      try {
        console.log(`Converting image ${index + 1} from base64...`)
        
        // Convert base64 to buffer
        const base64Data = dataUrl.split(",")[1]
        const buffer = Buffer.from(base64Data, "base64")
        
        console.log(`Image ${index + 1} buffer size:`, buffer.length, "bytes")
        
        // Create unique filename
        const timestamp = Date.now()
        const fileName = `carousel_${user.id}_${timestamp}_slide_${index + 1}.png`
        
        console.log(`Uploading to storage: ${fileName}`)
        
        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("image")
          .upload(fileName, buffer, {
            contentType: "image/png",
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          console.error(`Failed to upload image ${index + 1}:`, uploadError)
          // Continue with other images
          continue
        }

        console.log(`Image ${index + 1} uploaded successfully:`, uploadData.path)

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("image")
          .getPublicUrl(fileName)

        console.log(`Image ${index + 1} public URL:`, publicUrl)
        uploadedUrls.push(publicUrl)
      } catch (imgError) {
        console.error(`Error processing image ${index + 1}:`, imgError)
        // Continue with other images
      }
    }

    console.log(`Successfully uploaded ${uploadedUrls.length} out of ${imageUrls.length} images`)

    if (uploadedUrls.length === 0) {
      console.error("Failed to upload any images")
      return NextResponse.json(
        { error: "Failed to upload images to storage" },
        { status: 500 }
      )
    }

    // Save to posts table
    console.log("Saving carousel to posts table...")
    const carouselContent = slides.join("\n\n---\n\n")
    
    const postData: PostInsert = {
      user_id: user.id,
      content: carouselContent,
      status: "draft",
      post_type: "carousel",
      slides: slides as any,
      image_urls: uploadedUrls,
      theme: theme as any,
    }

    console.log("Post data prepared:", {
      user_id: user.id,
      post_type: postData.post_type,
      slidesCount: slides.length,
      imageUrlsCount: uploadedUrls.length,
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

    console.log("Successfully saved carousel:", savedPost?.id)

    return NextResponse.json({
      success: true,
      postId: savedPost?.id,
      imageUrls: uploadedUrls,
      message: `Carousel saved with ${uploadedUrls.length} images`,
    })
  } catch (error: any) {
    console.error("Error saving carousel:", error)
    return NextResponse.json(
      { error: error.message || "Failed to save carousel" },
      { status: 500 }
    )
  }
}
