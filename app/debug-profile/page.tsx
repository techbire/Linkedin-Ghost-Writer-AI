import { getSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DebugProfilePage() {
  const supabase = await getSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Type assertion for JSONB field
  const profileData = profile as any

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Profile Debug Page</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User ID</h2>
        <code className="bg-gray-100 p-2 rounded block">{user.id}</code>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      {profileData && (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Profile Data</h2>
            <div className="bg-gray-100 p-4 rounded">
              <p><strong>Full Name:</strong> {profileData.full_name || 'Not set'}</p>
              <p><strong>Profession:</strong> {profileData.profession || 'Not set'}</p>
              <p><strong>Designation:</strong> {profileData.designation || 'Not set'}</p>
              <p><strong>Website:</strong> {profileData.website_url || 'Not set'}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Your Persona (JSONB)</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(profileData.business_context, null, 2)}
            </pre>
          </div>

          {profileData.business_context?.voiceAnalysis && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-green-600">✅ Voice Analysis Found</h2>
              <pre className="bg-green-50 p-4 rounded overflow-auto max-h-96 border border-green-200">
                {JSON.stringify(profileData.business_context.voiceAnalysis, null, 2)}
              </pre>
            </div>
          )}

          {profileData.business_context?.scrapedPosts && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-blue-600">✅ Scraped Posts Found ({profileData.business_context.scrapedPosts.length})</h2>
              <pre className="bg-blue-50 p-4 rounded overflow-auto max-h-96 border border-blue-200">
                {JSON.stringify(profileData.business_context.scrapedPosts, null, 2)}
              </pre>
            </div>
          )}

          {profileData.business_context?.targetAudience && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-purple-600">✅ Target Audience Found</h2>
              <div className="bg-purple-50 p-4 rounded border border-purple-200">
                <p>{profileData.business_context.targetAudience}</p>
              </div>
            </div>
          )}

          {profileData.business_context?.profileData && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-orange-600">✅ LinkedIn Profile Data Found</h2>
              <div className="bg-orange-50 p-4 rounded border border-orange-200">
                <p><strong>Name:</strong> {profileData.business_context.profileData.name || 'N/A'}</p>
                <p><strong>Headline:</strong> {profileData.business_context.profileData.headline || 'N/A'}</p>
                <p><strong>Location:</strong> {profileData.business_context.profileData.location || 'N/A'}</p>
                <p><strong>Followers:</strong> {profileData.business_context.profileData.followers || 'N/A'}</p>
                <p><strong>Connections:</strong> {profileData.business_context.profileData.connections || 'N/A'}</p>
                {profileData.business_context.profileData.about && (
                  <div className="mt-2">
                    <strong>About:</strong>
                    <p className="text-sm mt-1">{profileData.business_context.profileData.about}</p>
                  </div>
                )}
              </div>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">View Raw Profile Data</summary>
                <pre className="bg-orange-50 p-4 rounded overflow-auto max-h-96 border border-orange-200 mt-2 text-xs">
                  {JSON.stringify(profileData.business_context.profileData, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </>
      )}
    </div>
  )
}
