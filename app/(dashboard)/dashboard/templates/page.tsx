import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TemplatesForm } from "@/components/dashboard/templates-form"

export default async function TemplatesPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Writing Templates</h1>
        <p className="text-muted-foreground mt-2">
          Manage your writing templates and test post generation
        </p>
      </div>
      
      <TemplatesForm userId={user.id} />
    </div>
  )
}
