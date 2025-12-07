import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    
    // Get user_id from query params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    
    console.log('[user-subscription] Fetching data for user:', userId)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    // Fetch user's profile with business_context
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, business_context')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('[user-subscription] Error fetching profile:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    // Fetch from new tables
    console.log('[user-subscription] 📥 Fetching persona and templates from new tables...')
    
    const { data: persona, error: personaError } = await (supabase as any)
      .from('user_personas')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    // Fetch ALL templates ordered by most recent first
    const { data: templates, error: templatesError } = await (supabase as any)
      .from('writing_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (personaError && personaError.code !== 'PGRST116') {
      console.error('[user-subscription] Error fetching persona:', personaError)
    }
    
    if (templatesError && templatesError.code !== 'PGRST116') {
      console.error('[user-subscription] Error fetching templates:', templatesError)
    }

    console.log('[user-subscription] Profile found:', !!profile)
    console.log('[user-subscription] Persona found:', !!persona)
    console.log('[user-subscription] Templates found:', templates?.length || 0)
    // @ts-expect-error - Supabase type inference issue with JSONB
    console.log('[user-subscription] Has business_context:', !!profile?.business_context)
    
    // Check if we have profile data from persona table
    const hasProfileData = !!persona
    console.log('[user-subscription] Has profileData (from persona table):', hasProfileData)

    return NextResponse.json({
      success: true,
      profile,
      persona,
      templates: templates || []
    })

  } catch (error: any) {
    console.error('[user-subscription] Error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
