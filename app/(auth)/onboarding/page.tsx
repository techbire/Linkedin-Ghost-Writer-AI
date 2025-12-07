import { OnboardingWrapper } from '@/components/auth/onboarding-wrapper'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function OnboardingPage() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if already onboarded
  const { data: profile } = await supabase
    .from('profiles')
    .select('profession, designation, full_name')
    .eq('id', user.id)
    .single()

  const typedProfile = profile as Pick<Profile, 'profession' | 'designation' | 'full_name'> | null

  if (typedProfile?.profession && typedProfile?.designation) {
    redirect('/dashboard')
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white flex items-center justify-center">
      {/* Background Decorative Ovals */}
      <div 
        className="absolute w-[867px] h-[1335px] rounded-full opacity-5"
        style={{
          left: '-15.35%',
          right: '53.19%',
          top: '29.79%',
          bottom: '-17.19%',
          background: 'rgba(52, 168, 83, 0.05)',
        }}
      />
      <div 
        className="absolute w-[1040px] h-[1284px] rounded-full"
        style={{
          left: '50.56%',
          right: '-22.92%',
          top: '-88.09%',
          bottom: '86.33%',
          background: 'rgba(52, 168, 83, 0.05)',
          mixBlendMode: 'normal',
          opacity: 0.54,
          transform: 'rotate(100deg)'
        }}
      />
      <div 
        className="absolute w-[867px] h-[757px] rounded-full"
        style={{
          left: '-17.15%',
          right: '55%',
          top: '-55.37%',
          bottom: '67.97%',
          background: 'rgba(52, 168, 83, 0.05)',
          mixBlendMode: 'normal',
          opacity: 0.6,
          transform: 'rotate(160deg)'
        }}
      />

      {/* Main Content Container */}
      <div 
        className="relative z-10 flex flex-col lg:flex-row items-start justify-center gap-[50px] lg:gap-[200px] w-full max-w-[1234px] px-4 lg:px-8 py-12 lg:py-0"
      >
        <OnboardingWrapper 
          userEmail={user.email || ''} 
          initialFullName={typedProfile?.full_name || ''}
        />
      </div>
    </div>
  )
}
