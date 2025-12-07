"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const handleCallback = async () => {
      if (!supabase) {
        router.push("/login")
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('profession, designation')
          .eq('id', session.user.id)
          .single()
        
        // Redirect to onboarding if not completed
        const typedProfile = profile as { profession: string | null; designation: string | null } | null
        if (!typedProfile || !typedProfile.profession || !typedProfile.designation) {
          router.push("/onboarding")
        } else {
          router.push("/dashboard")
        }
      } else {
        router.push("/login")
      }
    }

    handleCallback()
  }, [router, supabase])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Authenticating...</h2>
        <p className="text-muted-foreground">Please wait while we sign you in.</p>
      </div>
    </div>
  )
}
