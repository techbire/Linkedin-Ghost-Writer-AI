import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import type { Database } from "@/types/database"

type PostUpdate = Database["public"]["Tables"]["posts"]["Update"]

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { scheduled_date } = body

    const updateData = {
      status: "scheduled",
      scheduled_date,
      updated_at: new Date().toISOString(),
    }

    const { data: post, error } = await supabase
      .from("posts")
      // @ts-ignore - posts table exists but Supabase types need regeneration after migration
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error scheduling post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
