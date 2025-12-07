import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { ApifyClient } from 'apify-client'

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID // For posts
const APIFY_PROFILE_ACTOR_ID = process.env.APIFY_PROFILE_ACTOR_ID // For profile
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// Log API key status on module load
console.log('[LinkedIn Scraper] API Configuration:')
console.log('[LinkedIn Scraper] - APIFY_API_TOKEN:', APIFY_API_TOKEN ? '✅ Set' : '❌ Missing')
console.log('[LinkedIn Scraper] - APIFY_ACTOR_ID (Posts):', APIFY_ACTOR_ID ? '✅ Set' : '❌ Missing')
console.log('[LinkedIn Scraper] - APIFY_PROFILE_ACTOR_ID:', APIFY_PROFILE_ACTOR_ID ? '✅ Set' : '❌ Missing')
console.log('[LinkedIn Scraper] - GEMINI_API_KEY:', GEMINI_API_KEY ? '✅ Set' : '❌ Missing')

interface LinkedInPost {
  url?: string
  text?: string
  author?: {
    username?: string
    profile_url?: string
    name?: string
  }
  reactions?: number
  comments?: number
  shares?: number
}

async function scrapeLinkedInPosts(profileUrl: string, limit: number = 5): Promise<LinkedInPost[]> {
  console.log('[scrapeLinkedInPosts] 🚀 Starting function')
  console.log('[scrapeLinkedInPosts] Profile URL:', profileUrl)
  console.log('[scrapeLinkedInPosts] Limit:', limit)
  
  // Use the specified limit (default 5)
  const actualLimit = limit
  console.log('[scrapeLinkedInPosts] Using limit:', actualLimit)
  
  try {
    // Check API credentials
    if (!APIFY_API_TOKEN || !APIFY_ACTOR_ID) {
      throw new Error('Apify API credentials not configured')
    }
    
    // Extract username from profile URL
    const usernameMatch = profileUrl.match(/\/in\/([^/]+)/)
    const username = usernameMatch ? usernameMatch[1] : null

    console.log('[scrapeLinkedInPosts] ✅ Extracted username:', username)

    // Prepare actor input
    const actorInput = {
      username: username,
      profile_url: profileUrl,
      profileUrl: profileUrl,
      profileUrls: [profileUrl],
      profiles: [profileUrl],
      totalPostsToScrape: actualLimit,
      total_posts: actualLimit,
      totalPosts: actualLimit,
      maxPostsPerProfile: actualLimit,
      resultsLimit: actualLimit,
      startUrls: [{ url: profileUrl }],
      count: actualLimit,
      maxItems: actualLimit
    }

    console.log('[scrapeLinkedInPosts] 📤 Sending request to Apify...')
    
    // Start the actor run
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs?token=${APIFY_API_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actorInput)
      }
    )

    if (!runResponse.ok) {
      throw new Error(`Apify API error: ${runResponse.status} ${runResponse.statusText}`)
    }

    const runData = await runResponse.json()
    console.log('[scrapeLinkedInPosts] 📥 Apify response:', runData)
    
    const runId = runData.data.id
    const defaultDatasetId = runData.data.defaultDatasetId

    console.log('[scrapeLinkedInPosts] ✅ Actor run started')
    console.log('[scrapeLinkedInPosts] Run ID:', runId)
    console.log('[scrapeLinkedInPosts] Dataset ID:', defaultDatasetId)

    // Poll for completion
    let status = 'RUNNING'
    let attempts = 0
    const maxAttempts = 60

    console.log('[scrapeLinkedInPosts] ⏳ Polling for completion...')

    while (status === 'RUNNING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_API_TOKEN}`
      )
      
      const statusData = await statusResponse.json()
      status = statusData.data.status
      attempts++
      
      console.log(`[scrapeLinkedInPosts] 📊 Attempt ${attempts}/${maxAttempts} - Status: ${status}`)
    }

    if (status !== 'SUCCEEDED') {
      throw new Error(`Scraping failed with status: ${status}`)
    }

    console.log('[scrapeLinkedInPosts] ✅ Scraping completed successfully')
    console.log('[scrapeLinkedInPosts] 📥 Fetching results...')

    // Get results
    const resultsResponse = await fetch(
      `https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${APIFY_API_TOKEN}`
    )

    let results: LinkedInPost[] = await resultsResponse.json()
    console.log('[scrapeLinkedInPosts] 📊 Raw results count:', results.length)

    // Filter by username
    if (username && results.length > 0) {
      console.log('[scrapeLinkedInPosts] 🔍 Filtering results by username...')
      
      const filtered = results.filter(post => {
        const postUrl = post.url?.toLowerCase() || ''
        const authorUsername = post.author?.username?.toLowerCase() || ''
        const authorProfileUrl = post.author?.profile_url?.toLowerCase() || ''

        return (
          username.toLowerCase() === authorUsername ||
          postUrl.includes(username.toLowerCase()) ||
          authorProfileUrl.includes(username.toLowerCase())
        )
      })

      console.log('[scrapeLinkedInPosts] 📊 Filtered results count:', filtered.length)
      results = filtered.length > 0 ? filtered.slice(0, actualLimit) : results.slice(0, actualLimit)
    } else {
      results = results.slice(0, actualLimit)
    }

    console.log('[scrapeLinkedInPosts] ✅ Final results count:', results.length)
    return results

  } catch (error: any) {
    console.error('[scrapeLinkedInPosts] ❌ Error:', error.message)
    console.error('[scrapeLinkedInPosts] Stack:', error.stack)
    throw error
  }
}

async function analyzePostTemplates(posts: LinkedInPost[]) {
  console.log('[analyzePostTemplates] 🚀 Starting template analysis')
  console.log('[analyzePostTemplates] Posts count:', posts.length)
  
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured')
    }
    
    const model = 'gemini-2.0-flash-exp'
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`

    console.log('[analyzePostTemplates] Using model:', model)

    // Prepare posts text
    const postsText = posts.map((post, index) => 
      `Post ${index + 1}:\n${post.text || 'No text'}\n---`
    ).join('\n\n')

    console.log('[analyzePostTemplates] 📝 Posts text length:', postsText.length)

    const prompt = `Analyze these LinkedIn posts and extract a general writing template/pattern that can be used for future posts.

${postsText}

Based on these posts, identify the common structure and create a writing template with these sections:

1. **Attention-Grabbing Opening** (2 lines, 15-20 words):
   - Line 1: State impressive credential/achievement + tease valuable information
   - Line 2: Permission statement to share with audience
   Example: "A VP Sales doing $30M ARR shared his outbound secrets with me. And he said I could share them with you."

2. **Credibility Builder** (2 lines, 20-25 words):
   - Line 1: Personal connection + named authority + company
   - Line 2: Specific value proposition/achievement being shared
   Example: "I spent 1 hour with Jonathan Chemouny, VP Sales Dev at ElevenLabs. He walked me through the exact playbook that helped them scale outbound to $30M ARR."

3. **First Block** (4 lines):
   - Line 1: Single-line engagement question
   - Lines 2-4: Numbered action steps with emojis
   Example: "Want it? 1️⃣ Add me 2️⃣ Comment 'playbook' 3️⃣ I'll share it with you"

4. **Main Content Structure**:
   - How they organize their main points (numbered list, bullets, paragraphs, etc.)
   - Common hooks or transitions they use
   - How they build their argument or story

5. **Call-to-Action Pattern**:
   - How they typically end posts
   - What action they ask readers to take
   - Engagement tactics used

Provide the response as JSON with this structure:
{
  "generalTemplate": "Full template description with placeholders",
  "openingPattern": "Pattern for attention-grabbing openings",
  "credibilityPattern": "Pattern for building credibility",
  "engagementPattern": "Pattern for first engagement block",
  "contentStructure": "How main content is typically organized",
  "ctaPattern": "Call-to-action pattern",
  "commonElements": ["array of common elements found across posts"],
  "exampleTemplate": "A complete example template based on their style"
}

Return ONLY valid JSON, no markdown or explanation.`

    console.log('[analyzePostTemplates] 📤 Sending request to Gemini...')

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    console.log('[analyzePostTemplates] 📥 Gemini response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[analyzePostTemplates] ❌ Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('[analyzePostTemplates] 📊 Response received')
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    console.log('[analyzePostTemplates] 📝 Response text length:', text.length)

    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      console.log('[analyzePostTemplates] ✅ JSON parsed successfully')
      console.log('[analyzePostTemplates] Template keys:', Object.keys(parsed))
      return parsed
    }

    const parsed = JSON.parse(text)
    console.log('[analyzePostTemplates] ✅ Direct JSON parse successful')
    return parsed
    
  } catch (error: any) {
    console.error('[analyzePostTemplates] ❌ Error:', error.message)
    console.error('[analyzePostTemplates] Stack:', error.stack)
    return null
  }
}

async function analyzeProfileWithGemini(posts: LinkedInPost[], profileUrl: string) {
  console.log('[analyzeProfileWithGemini] 🚀 Starting analysis')
  console.log('[analyzeProfileWithGemini] Posts count:', posts.length)
  
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured')
    }
    
    const model = 'gemini-2.0-flash-exp'
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`

    console.log('[analyzeProfileWithGemini] Using model:', model)

    // Prepare posts text
    const postsText = posts.map((post, index) => 
      `Post ${index + 1}:\n${post.text || 'No text'}\nEngagement: ${post.reactions || 0} reactions, ${post.comments || 0} comments`
    ).join('\n\n')

    console.log('[analyzeProfileWithGemini] 📝 Posts text length:', postsText.length)

    const prompt = `Analyze these LinkedIn posts and create a detailed profile:

${postsText}

Based on these posts, provide a JSON response with:
1. writingStyle: Describe the writing style (tone, structure, formatting)
2. targetAudience: Who they seem to be writing for
3. personality: Brief personality description
4. postStructure: How they typically structure posts

Return ONLY valid JSON, no markdown or explanation.`

    console.log('[analyzeProfileWithGemini] 📤 Sending request to Gemini...')

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    console.log('[analyzeProfileWithGemini] 📥 Gemini response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[analyzeProfileWithGemini] ❌ Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('[analyzeProfileWithGemini] 📊 Response received')
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    console.log('[analyzeProfileWithGemini] 📝 Response text length:', text.length)

    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      console.log('[analyzeProfileWithGemini] ✅ JSON parsed successfully')
      console.log('[analyzeProfileWithGemini] Analysis keys:', Object.keys(parsed))
      return parsed
    }

    const parsed = JSON.parse(text)
    console.log('[analyzeProfileWithGemini] ✅ Direct JSON parse successful')
    return parsed
    
  } catch (error: any) {
    console.error('[analyzeProfileWithGemini] ❌ Error:', error.message)
    console.error('[analyzeProfileWithGemini] Stack:', error.stack)
    return null
  }
}

async function scrapeProfileInfo(profileUrl: string) {
  console.log('[scrapeProfileInfo] 🚀 Starting function')
  console.log('[scrapeProfileInfo] Profile URL:', profileUrl)
  
  try {
    // Check API credentials
    if (!APIFY_API_TOKEN || !APIFY_PROFILE_ACTOR_ID) {
      throw new Error('Apify API credentials not configured for profile scraping')
    }

    // Initialize ApifyClient
    const client = new ApifyClient({
      token: APIFY_API_TOKEN,
    })

    console.log('[scrapeProfileInfo] 📤 Using ApifyClient SDK')
    console.log('[scrapeProfileInfo] Actor ID:', APIFY_PROFILE_ACTOR_ID)
    
    // Prepare actor input
    // Actor e1xYKjtHLG2Js5YdC expects { url: "..." } for single profile
    const input = {
      url: profileUrl,
      proxyConfiguration: { useApifyProxy: true },
    }

    console.log('[scrapeProfileInfo] 📤 Starting actor run...')
    console.log('[scrapeProfileInfo] Input:', { url: profileUrl })
    
    // Run the Actor and wait for it to finish
    const run = await client.actor(APIFY_PROFILE_ACTOR_ID).call(input)
    
    console.log('[scrapeProfileInfo] ✅ Actor run completed')
    console.log('[scrapeProfileInfo] Run ID:', run.id)
    console.log('[scrapeProfileInfo] Dataset ID:', run.defaultDatasetId)

    // Fetch results from the Actor's dataset
    console.log('[scrapeProfileInfo] 📥 Fetching results...')
    const { items } = await client.dataset(run.defaultDatasetId).listItems()
    
    console.log('[scrapeProfileInfo] 📊 Results count:', items.length)

    if (!items || items.length === 0) {
      console.warn('[scrapeProfileInfo] ⚠️ No profile data found')
      return null
    }

    const profileData = items[0]
    console.log('[scrapeProfileInfo] ✅ Profile data retrieved')
    console.log('[scrapeProfileInfo] Profile keys:', Object.keys(profileData))
    console.log('[scrapeProfileInfo] Raw profile sample:', JSON.stringify(profileData, null, 2).substring(0, 1000))
    console.log('[scrapeProfileInfo] Profile name:', profileData.name || profileData.fullName || profileData.firstName)
    console.log('[scrapeProfileInfo] Profile headline:', profileData.headline)
    console.log('[scrapeProfileInfo] Profile about:', profileData.about || profileData.summary)

    // Try multiple possible field name variations from different Apify actors
    const getName = () => {
      return profileData.full_name || 
             profileData.fullName || 
             profileData.name || 
             profileData.unformatted_full_name ||
             (profileData.first_name && profileData.last_name ? `${profileData.first_name} ${profileData.last_name}` : null) ||
             (profileData.firstName && profileData.lastName ? `${profileData.firstName} ${profileData.lastName}` : null) ||
             null
    }

    const getHeadline = () => {
      return profileData.profile_headline ||
             profileData.headline || 
             profileData.position || 
             profileData.occupation ||
             profileData.job_title ||
             null
    }

    const getAbout = () => {
      return profileData.about || 
             profileData.summary || 
             profileData.description ||
             profileData.bio ||
             null
    }

    // Extract current position (most recent role)
    const experiences: any[] = Array.isArray(profileData.experience) ? profileData.experience : 
                               Array.isArray(profileData.positions) ? profileData.positions : 
                               Array.isArray(profileData.experiences) ? profileData.experiences : []
    
    console.log('[scrapeProfileInfo] 📊 Experiences found:', experiences.length)
    
    const currentPosition = experiences.length > 0 ? {
      company: experiences[0].company_name || experiences[0].companyName || experiences[0].company || experiences[0].raw_company_name || null,
      title: experiences[0].job_title || experiences[0].title || experiences[0].raw_job_title || null,
      location: experiences[0].job_location || experiences[0].location || 
                (experiences[0].job_location_city && experiences[0].job_location_state 
                  ? `${experiences[0].job_location_city}, ${experiences[0].job_location_state}` 
                  : null),
      started_on: experiences[0].job_started_on || experiences[0].startDate || experiences[0].start || null,
      summary: experiences[0].job_description?.[0] || experiences[0].description || null
    } : null

    // Extract recent roles (top 3 excluding current)
    const recentRoles = experiences.slice(1, 4).map((exp: any) => ({
      company: exp.company_name || exp.companyName || exp.company || exp.raw_company_name || null,
      title: exp.job_title || exp.title || exp.raw_job_title || null,
      period: `${exp.job_started_on || exp.startDate || exp.start || ''} — ${exp.job_ended_on || exp.endDate || exp.end || 'Present'}`,
      highlights: exp.job_description?.[0] || exp.description ? [(exp.job_description?.[0] || exp.description).substring(0, 150)] : []
    }))

    // Extract top skills (limit to 8)
    const skills: any[] = Array.isArray(profileData.skills) ? profileData.skills : []
    const topSkills = skills.slice(0, 8).map((skill: any) => 
      typeof skill === 'string' ? skill : skill.name || skill.title
    ).filter(Boolean)

    // Extract education (most recent)
    const educationList: any[] = Array.isArray(profileData.education) ? profileData.education : 
                                 Array.isArray(profileData.schools) ? profileData.schools : []
    
    console.log('[scrapeProfileInfo] 📊 Education found:', educationList.length)
    
    const education = educationList.slice(0, 2).map((edu: any) => ({
      institution: edu.university_name || edu.schoolName || edu.school || edu.name || null,
      degree: edu.degree_name || edu.degree || edu.fieldOfStudy || null,
      started_year: edu.start_year || edu.startYear || edu.start || null,
      expected_end_year: edu.end_year || edu.endYear || edu.end || null
    }))

    // Extract featured content
    const featuredList: any[] = Array.isArray(profileData.featured) ? profileData.featured : []
    const featured = featuredList.slice(0, 4).map((item: any) => ({
      type: item.type || 'Link',
      title: item.title || null,
      url: item.url || null
    }))

    // Extract languages
    const languagesList: any[] = Array.isArray(profileData.languages) ? profileData.languages : []
    const languages = languagesList.map((lang: any) => ({
      name: typeof lang === 'string' ? lang : lang.name,
      proficiency: typeof lang === 'object' ? lang.proficiency : null
    }))

    // Trim about text using helper function
    const aboutText = getAbout() || ''
    const aboutShort = typeof aboutText === 'string' && aboutText.length > 0 
      ? aboutText.substring(0, 250).trim() 
      : null

    // Extract display name using helper function
    const fullName = getName() || ''
    const displayName = profileData.firstName || 
                       (typeof fullName === 'string' && fullName.includes(' ') ? fullName.split(' ')[0] : fullName)

    // Get profile picture URLs
    const getAvatarUrl = () => {
      return profileData.profile_picture ||
             profileData.profilePictureUrl || 
             profileData.photoUrl || 
             profileData.photo_url ||
             profileData.profilePicture ||
             profileData.image_url ||
             null
    }

    const getBackgroundUrl = () => {
      return profileData.background_picture ||
             profileData.backgroundPictureUrl || 
             profileData.backgroundUrl || 
             profileData.background_picture ||
             profileData.coverImageUrl ||
             profileData.cover_image ||
             null
    }

    // Create compact, LLM-friendly profile
    const compactProfile = {
      // Basic identity
      username: profileData.username || profileData.public_identifier || profileData.publicIdentifier || null,
      profileUrl: profileData.profile_link || profileData.url || profileData.profile_url || profileUrl,
      full_name: fullName || null,
      display_name: displayName || null,
      avatar_url: getAvatarUrl(),
      background_picture: getBackgroundUrl(),
      
      // Professional summary
      headline: getHeadline(),
      location: profileData.location || profileData.location_county || profileData.geoLocation || profileData.geo_location || null,
      followers: profileData.followers || profileData.followersCount || profileData.followerCount || null,
      connections: profileData.connections || profileData.connectionsCount || profileData.connectionCount || null,
      is_creator: profileData.is_creator || profileData.isCreator || false,
      
      // About (trimmed to 250 chars for LLM efficiency)
      about_short: aboutShort,
      
      // Current work
      current_position: currentPosition,
      
      // Career history (recent roles only)
      recent_roles: recentRoles,
      
      // Skills (top 8)
      top_skills: topSkills,
      
      // Education (top 2)
      education: education,
      
      // Featured content (if available)
      featured: featured,
      
      // Audience insights for LLM
      audience_signals: {
        likely_audience: [], // Will be filled by AI analysis
        tone_preferences: "" // Will be filled by AI analysis
      },
      
      // Languages (if available)
      languages: languages
    }

    console.log('[scrapeProfileInfo] ✅ Compact profile created')
    console.log('[scrapeProfileInfo] Profile structure:', {
      hasCurrentPosition: !!compactProfile.current_position,
      recentRolesCount: compactProfile.recent_roles.length,
      topSkillsCount: compactProfile.top_skills.length,
      educationCount: compactProfile.education.length,
      hasName: !!compactProfile.full_name,
      hasHeadline: !!compactProfile.headline,
      hasAbout: !!compactProfile.about_short
    })

    return compactProfile

  } catch (error: any) {
    console.error('[scrapeProfileInfo] ❌ Error:', error.message)
    console.error('[scrapeProfileInfo] Stack:', error.stack)
    return null
  }
}

export async function POST(request: Request) {
  console.log('============================================')
  console.log('[Scrape LinkedIn API] 🚀 REQUEST RECEIVED')
  console.log('============================================')
  
  try {
    const supabase = await getSupabaseServerClient()
    
    // Get authenticated user
    console.log('[Scrape LinkedIn API] 🔐 Checking authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('[Scrape LinkedIn API] ❌ Authentication failed:', authError)
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log('[Scrape LinkedIn API] ✅ User authenticated:', user.id)

    const body = await request.json()
    const { profileUrl, voiceSource, influencerUrl, step } = body

    console.log('[Scrape LinkedIn API] 📋 Request parameters:', { 
      profileUrl, 
      voiceSource, 
      influencerUrl, 
      step,
      userId: user.id
    })

    // Step 1: Scrape profile info
    if (step === 'profile') {
      console.log('[Scrape LinkedIn API] 📊 Step 1: Scraping profile info...')
      const profileInfo = await scrapeProfileInfo(profileUrl)
      
      if (profileInfo) {
        console.log('[Scrape LinkedIn API] ✅ Profile info retrieved')
        console.log('[Scrape LinkedIn API] Profile name:', profileInfo.full_name)
        console.log('[Scrape LinkedIn API] Profile headline:', profileInfo.headline)
        
        // Save to user_personas table directly
        console.log('[Scrape LinkedIn API] 💾 Saving to user_personas table...')
        const { error: personaError } = await (supabase as any)
          .from('user_personas')
          .upsert({
            user_id: user.id,
            full_name: profileInfo.full_name,
            headline: profileInfo.headline,
            profile_url: profileInfo.profileUrl,
            avatar_url: profileInfo.avatar_url,
            location: profileInfo.location,
            current_position: profileInfo.current_position,
            top_skills: profileInfo.top_skills,
            recent_roles: profileInfo.recent_roles,
            education: profileInfo.education,
            scraped_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          })
        
        if (personaError) {
          console.error('[Scrape LinkedIn API] ❌ Persona save error:', personaError)
        } else {
          console.log('[Scrape LinkedIn API] ✅ Persona saved to user_personas table')
        }
      } else {
        console.warn('[Scrape LinkedIn API] ⚠️ No profile info retrieved')
      }
      
      return NextResponse.json({
        success: !!profileInfo,
        step: 'profile'
      })
    }

    // Step 2: Scrape posts and analyze with Gemini
    if (step === 'posts') {
      const urlToScrape = voiceSource === 'influencer' ? influencerUrl : profileUrl
      
      if (!urlToScrape) {
        console.error('[Scrape LinkedIn API] ❌ No URL provided')
        return NextResponse.json(
          { success: false, error: 'Profile URL is required' },
          { status: 400 }
        )
      }

      console.log('[Scrape LinkedIn API] 📝 Step 2: Scraping posts from:', urlToScrape)
      console.log('[Scrape LinkedIn API] Voice source:', voiceSource)
      
      // Scrape posts
      console.log('[Scrape LinkedIn API] 🔄 Starting LinkedIn post scraping...')
      const posts = await scrapeLinkedInPosts(urlToScrape, 5)
      
      if (!posts || posts.length === 0) {
        console.error('[Scrape LinkedIn API] ❌ No posts found')
        return NextResponse.json(
          { success: false, error: 'No posts found or scraping failed' },
          { status: 500 }
        )
      }

      console.log('[Scrape LinkedIn API] ✅ Found', posts.length, 'posts')
      console.log('[Scrape LinkedIn API] Post URLs:', posts.map(p => p.url))

      // Analyze with Gemini
      console.log('[Scrape LinkedIn API] 🤖 Analyzing posts with Gemini AI...')
      const analysis = await analyzeProfileWithGemini(posts, urlToScrape)
      
      if (analysis) {
        console.log('[Scrape LinkedIn API] ✅ Gemini analysis complete')
        console.log('[Scrape LinkedIn API] Analysis keys:', Object.keys(analysis))
      } else {
        console.warn('[Scrape LinkedIn API] ⚠️ Gemini analysis returned null')
      }

      // Analyze post templates
      console.log('[Scrape LinkedIn API] 📝 Analyzing post templates...')
      const templateAnalysis = await analyzePostTemplates(posts)
      
      if (templateAnalysis) {
        console.log('[Scrape LinkedIn API] ✅ Template analysis complete')
        console.log('[Scrape LinkedIn API] Template keys:', Object.keys(templateAnalysis))
      } else {
        console.warn('[Scrape LinkedIn API] ⚠️ Template analysis returned null')
      }

      // Extract person name from the posts author (use real LinkedIn user's name)
      const personName = posts[0]?.author?.name || null
      console.log('[Scrape LinkedIn API] 📝 Person name for template:', personName)

      // Get current profile business_context to merge with new data
      console.log('[Scrape LinkedIn API] 📥 Fetching current business_context...')
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('business_context')
        .eq('id', user.id)
        .single()

      // @ts-ignore - business_context is a JSONB field
      const currentContext = (currentProfile?.business_context as any) || {}
      console.log('[Scrape LinkedIn API] Current context keys:', Object.keys(currentContext))

      // Prepare updated business_context
      const updatedContext = {
        ...currentContext,
        // Update voice analysis from Gemini
        voiceAnalysis: analysis ? {
          writingStyle: analysis.writingStyle,
          targetAudience: analysis.targetAudience,
          personality: analysis.personality,
          postStructure: analysis.postStructure,
          analyzedFrom: voiceSource === 'influencer' ? 'influencer' : 'own_posts',
          influencerName: personName,
          lastUpdated: new Date().toISOString()
        } : currentContext.voiceAnalysis,
        // Update writing template from template analysis
        writingTemplate: templateAnalysis ? {
          personName: personName || 'Inspired by LinkedIn Analysis',
          openingPattern: templateAnalysis.openingPattern,
          contentStructure: templateAnalysis.contentStructure,
          ctaPattern: templateAnalysis.ctaPattern,
          commonElements: templateAnalysis.commonElements,
          exampleTemplate: templateAnalysis.exampleTemplate,
          generalTemplate: templateAnalysis.generalTemplate,
          lastUpdated: new Date().toISOString()
        } : currentContext.writingTemplate
      }

      // Save to business_context in profiles table
      console.log('[Scrape LinkedIn API] 💾 Saving voice analysis and template to business_context...')
      const { error: contextError } = await (supabase as any)
        .from('profiles')
        .update({
          business_context: updatedContext,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (contextError) {
        console.error('[Scrape LinkedIn API] ❌ Business context update error:', contextError)
      } else {
        console.log('[Scrape LinkedIn API] ✅ Voice analysis and template saved to business_context')
        console.log('[Scrape LinkedIn API] Voice analyzed from:', voiceSource === 'influencer' ? `Influencer: ${personName}` : 'Own posts')
      }

      console.log('============================================')
      console.log('[Scrape LinkedIn API] ✅ REQUEST COMPLETED')
      console.log('============================================')

      return NextResponse.json({
        success: true,
        step: 'posts'
      })
    }

    console.error('[Scrape LinkedIn API] ❌ Invalid step parameter:', step)
    return NextResponse.json(
      { success: false, error: 'Invalid step parameter' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('============================================')
    console.error('[Scrape LinkedIn API] ❌ ERROR OCCURRED')
    console.error('============================================')
    console.error('[Scrape LinkedIn API] Error message:', error.message)
    console.error('[Scrape LinkedIn API] Error stack:', error.stack)
    
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to scrape LinkedIn' },
      { status: 500 }
    )
  }
}
