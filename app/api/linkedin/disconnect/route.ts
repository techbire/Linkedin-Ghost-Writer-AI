import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServerClient()

    // Get current session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Delete LinkedIn token from database
    const { error } = await supabase
      .from("user_linkedin_tokens")
      .delete()
      .eq("user_id", user.id)

    if (error) {
      console.error("Error disconnecting LinkedIn:", error)
      return NextResponse.json({ error: "Failed to disconnect LinkedIn" }, { status: 500 })
    }

    // Clear any LinkedIn-related cookies
    const res = NextResponse.json({ success: true })
    res.cookies.set("linkedin_access_token", "", { maxAge: 0 })
    // res.cookies.set("linkedin_refresh_token", "", { maxAge: 0 })

    return res
  } catch (err) {
    console.error("Disconnect error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
