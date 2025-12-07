import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Return null if credentials are not configured
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[v0] Supabase credentials not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.",
    )
    return null
  }

  if (client) {
    return client
  }

  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

  return client
}
