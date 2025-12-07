import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    // Get all preset templates, grouped by category
    const { data: templates, error } = await supabase
      .from("preset_templates")
      .select("*")
      .eq("is_active", true)
      .order("category", { ascending: true })
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching preset templates:", error)
      return NextResponse.json(
        { error: "Failed to fetch preset templates" },
        { status: 500 }
      )
    }

    // Group templates by category
    const groupedTemplates: Record<string, any[]> = {}
    ;(templates as any[]).forEach((template: any) => {
      if (!groupedTemplates[template.category]) {
        groupedTemplates[template.category] = []
      }
      groupedTemplates[template.category].push(template)
    })

    return NextResponse.json({
      templates: templates,
      grouped: groupedTemplates,
      categories: Object.keys(groupedTemplates),
    })
  } catch (error: any) {
    console.error("Preset templates API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
