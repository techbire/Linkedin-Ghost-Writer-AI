import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { profession, designation, websiteUrl, businessContext } = await req.json()

    // Update user profile with Your Persona
    // @ts-ignore - Types will be updated after database migration
    const { error: updateError } = await supabase
      .from('profiles')
      // @ts-ignore - Types will be updated after database migration
      .update({
        profession: profession || null,
        designation: designation || null,
        website_url: websiteUrl || null,
        business_context: businessContext || {},
        context_scraped_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error("Error updating Your Persona:", updateError)
      return NextResponse.json(
        { error: "Failed to update Your Persona" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Your Persona updated successfully"
    })

  } catch (error) {
    console.error("Error updating Your Persona:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update Your Persona" },
      { status: 500 }
    )
  }
}
