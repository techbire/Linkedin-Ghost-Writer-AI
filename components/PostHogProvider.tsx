"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect, useState } from "react"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Only initialize PostHog on the client side to avoid hydration issues
    if (typeof window !== 'undefined' && !isInitialized) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: "/ingest",
        ui_host: "https://us.posthog.com",
        defaults: '2025-05-24',
        // Disable exception autocapture to prevent hydration mismatch
        // The autocapture script injection causes SSR/client HTML mismatch
        capture_exceptions: false,
        debug: process.env.NODE_ENV === "development",
        // Disable autocapture on initial load to prevent hydration issues
        autocapture: false,
        // Load script after hydration
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[PostHog] Initialized')
          }
        }
      })
      setIsInitialized(true)
    }
  }, [isInitialized])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
