import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DebugVoicePage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user profile with business_context
  const { data: profile } = await supabase
    .from("profiles")
    .select("business_context")
    .eq("id", user.id)
    .single()

  const businessContext = (profile as any)?.business_context

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Voice Analysis Debug</h1>
      
      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Business Context (Full)</h2>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(businessContext, null, 2)}
          </pre>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Voice Analysis</h2>
          {businessContext?.voiceAnalysis ? (
            <pre className="bg-green-100 dark:bg-green-900 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(businessContext.voiceAnalysis, null, 2)}
            </pre>
          ) : (
            <p className="text-red-500">❌ No voice analysis data found</p>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Writing Template</h2>
          {businessContext?.writingTemplate ? (
            <pre className="bg-green-100 dark:bg-green-900 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(businessContext.writingTemplate, null, 2)}
            </pre>
          ) : (
            <p className="text-red-500">❌ No writing template data found</p>
          )}
        </div>

        <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900">
          <h2 className="text-xl font-semibold mb-2">ℹ️ How to Add Voice Analysis</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to onboarding page (if you haven't completed it)</li>
            <li>Or use the LinkedIn scraper to analyze posts</li>
            <li>The voice analysis will be automatically saved to business_context</li>
            <li>Refresh this page to see the updated data</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
