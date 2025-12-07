import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import type { Database } from "@/types/database"

type PostInsert = Database["public"]["Tables"]["posts"]["Insert"]
type Post = Database["public"]["Tables"]["posts"]["Row"]

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { content, tone, status = "draft", scheduled_date } = body

    const postData = {
      user_id: user.id,
      content,
      tone,
      status,
      scheduled_date,
    }

    const { data: post, error } = await supabase
      .from("posts")
      // @ts-ignore - posts table exists but Supabase types need regeneration after migration
      .insert(postData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
