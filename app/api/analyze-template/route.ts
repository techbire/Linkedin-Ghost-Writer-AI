import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { personName, posts, userId } = body

    if (!personName || !posts) {
      return NextResponse.json(
        { error: 'Person name and posts are required' },
        { status: 400 }
      )
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    console.log('[analyze-template] Analyzing posts for:', personName)
    console.log('[analyze-template] Posts length:', posts.length)

    const model = 'gemini-2.0-flash-exp'
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`

    const prompt = `Analyze these LinkedIn posts from ${personName} and extract a general writing template/pattern that can be used for future posts.

${posts}

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
  "personName": "${personName}",
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

    console.log('[analyze-template] Sending request to Gemini...')

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

    console.log('[analyze-template] Gemini response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[analyze-template] Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    console.log('[analyze-template] Response text length:', text.length)

    // Try to extract JSON from the response
    let template
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      template = JSON.parse(jsonMatch[0])
      console.log('[analyze-template] JSON parsed successfully')
    } else {
      template = JSON.parse(text)
      console.log('[analyze-template] Direct JSON parse successful')
    }

    // Save to writing_templates table (insert new template, don't upsert)
    console.log('[analyze-template] Saving template to database...')
    const { error: saveError } = await (supabase as any)
      .from('writing_templates')
      .insert({
        user_id: userId,
        person_name: personName,
        general_template: template.generalTemplate,
        opening_pattern: template.openingPattern,
        credibility_pattern: template.credibilityPattern,
        engagement_pattern: template.engagementPattern,
        content_structure: template.contentStructure,
        cta_pattern: template.ctaPattern,
        common_elements: template.commonElements,
        example_template: template.exampleTemplate,
        source_url: null, // User manually added
        posts_analyzed: posts.split('\n\n').length,
        is_active: true, // Mark as active template
        analyzed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (saveError) {
      console.error('[analyze-template] Save error:', saveError)
      throw new Error('Failed to save template')
    }

    // Also update business_context for backward compatibility AND add voice analysis
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('business_context')
      .eq('id', userId)
      .single()

    // @ts-expect-error - Supabase type inference issue with JSONB
    const existingContext = existingProfile?.business_context || {}
    
    // Create voice analysis from template data
    const voiceAnalysis = {
      writingStyle: template.generalTemplate || 'Professional and engaging',
      targetAudience: 'LinkedIn professionals',
      personality: 'Authoritative and helpful',
      postStructure: template.contentStructure || 'Structured with clear sections',
      analyzedFrom: 'manual_template' as const,
      influencerName: personName,
      lastUpdated: new Date().toISOString()
    }
    
    const updatedContext = {
      ...existingContext,
      voiceAnalysis,
      writingTemplate: template,
      templateSource: 'manual',
      templatePersonName: personName,
      templateUpdatedAt: new Date().toISOString()
    }

    await supabase
      .from('profiles')
      // @ts-expect-error - Supabase type inference issue
      .update({
        business_context: updatedContext
      })
      .eq('id', userId)

    console.log('[analyze-template] ✅ Template and voice analysis saved successfully')

    return NextResponse.json({
      success: true,
      template
    })

  } catch (error: any) {
    console.error('[analyze-template] Error:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze template' },
      { status: 500 }
    )
  }
}
