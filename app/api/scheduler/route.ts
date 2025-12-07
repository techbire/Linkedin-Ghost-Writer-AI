// /app/api/scheduler/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { POST as LinkedInPostHandler } from "../linkedin/post/route";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const now = new Date().toISOString();

    // 1️⃣ Fetch all scheduled posts due now
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_date", now);

    if (postsError) throw postsError;
    if (!posts?.length) {
      console.log("ℹ️ No scheduled posts to publish at this time.");
      return NextResponse.json({ message: "No posts to publish." });
    }

    console.log(`🕒 Found ${posts.length} post(s) ready to publish`);

    const results: any[] = [];

    // 2️⃣ Iterate through each post
    for (const post of posts) {
      try {
        console.log(`🚀 Publishing post ID: ${post.id}`);

        // 3️⃣ Fetch user's LinkedIn access token from user_linkedin_tokens table
        const { data: tokenData, error: tokenError } = await supabase
          .from("user_linkedin_tokens")
          .select("linkedin_access_token, linkedin_token_expires_at")
          .eq("user_id", post.user_id)
          .single();

        if (tokenError || !tokenData?.linkedin_access_token) {
          throw new Error("User not authenticated with LinkedIn.");
        }

        const { linkedin_access_token, linkedin_token_expires_at } = tokenData;

        // 4️⃣ Check if token expired
        if (
          linkedin_token_expires_at &&
          new Date(linkedin_token_expires_at) < new Date()
        ) {
          throw new Error("User LinkedIn token expired.");
        }

        // 5️⃣ Prepare form data to reuse your LinkedIn POST handler
        const formData = new FormData();
        formData.append("message", post.content || "");
        formData.append("token", linkedin_access_token);

        if (post.image_urls && Array.isArray(post.image_urls)) {
          for (const imageUrl of post.image_urls) {
            try {
              const res = await fetch(imageUrl);
              const blob = await res.blob();
              const file = new File([blob], "image.jpg", {
                type: blob.type || "image/jpeg",
              });
              formData.append("files", file);
            } catch (imgErr) {
              console.warn(`⚠️ Failed to fetch image ${imageUrl}:`, imgErr);
            }
          }
        }

        // 6️⃣ Simulate a POST request to your LinkedIn post handler
        // const fakeReq = new NextRequest(
        //   "http://localhost:3000/api/linkedin/post",
        //   {
        //     method: "POST",
        //     body: formData as any,
        //   }
        // );

        let result: any = {};
try {
  const response = await fetch('http://localhost:3000/api/linkedin/post', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${tokenData.linkedin_access_token}`,
  },
  body: formData,
});

  result = await response.json();
} catch (err: any) {
  console.error('⚠️ LinkedIn post handler returned no JSON or crashed:', err.message);
  result = { success: false, error: 'LinkedIn post handler did not respond properly' };
}

        if (!result.success)
          throw new Error(result.error || "LinkedIn post failed");

        // 7️⃣ Update post in Supabase
        await supabase
          .from("posts")
          .update({
            status: "published",
            linkedin_post_id: result.postId || null,
            published_at: new Date().toISOString(),
          })
          .eq("id", post.id);

        console.log(`✅ Post ${post.id} published successfully`);
        results.push({ id: post.id, status: "published" });
      } catch (err: any) {
        console.error(`❌ Failed to post ${post.id}:`, err.message);
        await supabase
          .from("posts")
          .update({
            status: "failed",
            error_message: err.message,
          })
          .eq("id", post.id);

        results.push({ id: post.id, status: "failed", error: err.message });
      }
    }

    console.log("✅ Scheduler run completed.");
    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("💥 Scheduler error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
