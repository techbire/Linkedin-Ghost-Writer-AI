import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the user session
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        console.log('[Auth Callback] User authenticated:', user.id)
        console.log('[Auth Callback] User metadata:', user.user_metadata)
        
        // Wait a moment for trigger to execute
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Check if profile exists
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        console.log('[Auth Callback] Profile check:', { existingProfile, profileError })

        let currentProfile = existingProfile

        if (!existingProfile) {
          console.log('[Auth Callback] Profile does not exist, creating one...')
          
          // Extract data from Google OAuth metadata
          const fullName = user.user_metadata.full_name || 
                          user.user_metadata.name || 
                          user.user_metadata.display_name || 
                          user.email?.split('@')[0] || 
                          ''
          
          const avatarUrl = user.user_metadata.avatar_url || 
                           user.user_metadata.picture || 
                           null

          // Create profile for Google OAuth user
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: fullName,
              avatar_url: avatarUrl,
            })
            .select()
            .single()

          if (insertError) {
            console.error('[Auth Callback] Failed to create profile:', insertError)
          } else {
            console.log('[Auth Callback] Profile created successfully:', newProfile)
            currentProfile = newProfile
          }
        } else {
          console.log('[Auth Callback] Profile already exists')
        }
        
        // Check if user has completed onboarding (has profession and designation)
        const shouldOnboard = !currentProfile || 
                             !currentProfile.profession || 
                             !currentProfile.designation
        
        if (shouldOnboard) {
          console.log('[Auth Callback] User needs onboarding, redirecting...')
          return NextResponse.redirect(`${origin}/onboarding`)
        }
        
        // Also ensure user_credits record exists
        const { data: existingCredits } = await supabase
          .from('user_credits')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (!existingCredits) {
          console.log('[Auth Callback] Creating user_credits record...')
          await supabase
            .from('user_credits')
            .insert({
              user_id: user.id,
              credits: 100, // Starting credits for new users
            })
        }
      }
      
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
