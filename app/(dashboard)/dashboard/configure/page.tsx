import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ConfigureForm } from "@/components/dashboard/configure-form"
import { DashboardBusinessContext } from "@/components/dashboard/dashboard-business-context"

export default async function ConfigurePage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user profile with Your Persona
  // @ts-ignore - Types will be updated after database migration
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configure AI Settings</h1>
        <p className="text-muted-foreground mt-2">
          Customize your voice analysis and profile templates for personalized posts
        </p>
      </div>
      
      {/* Your Persona Section */}
      <DashboardBusinessContext
        businessContext={(profile as any)?.business_context}
        websiteUrl={(profile as any)?.website_url}
        profession={(profile as any)?.profession}
        designation={(profile as any)?.designation}
      />
      
      <ConfigureForm userId={user.id} />
    </div>
  )
}
