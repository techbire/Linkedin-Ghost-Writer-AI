import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Loads the fixed system prompt for LinkedIn content generation
 * This is the foundational prompt used across all generation scenarios
 */
export function getSystemPrompt(): string {
  try {
    const promptPath = join(process.cwd(), 'public', 'systemprompt.md')
    return readFileSync(promptPath, 'utf-8')
  } catch (error) {
    console.error('Error loading system prompt:', error)
    // Fallback to inline prompt if file reading fails
    return `SYSTEM ROLE: "LinkedIn Native Content Strategist (2025)"

You are an advanced AI trained to generate authentic, high-performing LinkedIn posts.
You specialize in human-sounding, emotionally intelligent, and algorithmically optimized writing.
Your goal is to help professionals and creators express insights, lessons, and experiences in ways that drive genuine engagement — not just vanity metrics.

You are NOT a generic writing assistant.
You are a LinkedIn-native strategist who writes in the format, tone, and rhythm proven to perform best on LinkedIn in 2025.`
  }
}

/**
 * Builds comprehensive context for LLM including:
 * - System prompt (fixed)
 * - User persona/business context (from DB)
 * - Voice analysis (from DB)
 * - Additional context (template, topic, etc.)
 */
export interface ContextBuilderOptions {
  businessContext?: any
  voiceAnalysis?: any
  writingTemplate?: any
  presetTemplate?: any
  topic?: string
  contentType?: string
  tone?: string
  hook?: string
  additionalInstructions?: string
  referenceMaterial?: {
    type: 'voice' | 'text' | 'url' | 'youtube' | 'file'
    content: string
  }
}

export function buildLLMContext(options: ContextBuilderOptions): string {
  const {
    businessContext,
    voiceAnalysis,
    writingTemplate,
    presetTemplate,
    topic,
    contentType,
    tone,
    hook,
    additionalInstructions,
    referenceMaterial
  } = options

  // Start with system prompt
  let fullContext = getSystemPrompt()
  
  // Add separator
  fullContext += '\n\n---\n\n'

  // Add business/persona context
  if (businessContext) {
    fullContext += `📊 BUSINESS/PERSONA CONTEXT:\n`
    if (businessContext.businessName) {
      fullContext += `Business: ${businessContext.businessName}\n`
    }
    if (businessContext.businessDescription) {
      fullContext += `Description: ${businessContext.businessDescription}\n`
    }
    if (businessContext.industry) {
      fullContext += `Industry: ${businessContext.industry}\n`
    }
    if (businessContext.targetAudience) {
      fullContext += `Target Audience: ${businessContext.targetAudience}\n`
    }
    if (businessContext.services?.length > 0) {
      fullContext += `Services: ${businessContext.services.join(', ')}\n`
    }
    if (businessContext.keywords?.length > 0) {
      fullContext += `Keywords: ${businessContext.keywords.join(', ')}\n`
    }
    fullContext += '\n'
  }

  // Add voice analysis (critical for maintaining user's writing style)
  if (voiceAnalysis) {
    fullContext += `🎤 VOICE ANALYSIS (STRICTLY FOLLOW THIS STYLE):\n`
    if (voiceAnalysis.writingStyle) {
      fullContext += `Writing Style: ${voiceAnalysis.writingStyle}\n`
    }
    if (voiceAnalysis.personality) {
      fullContext += `Personality: ${voiceAnalysis.personality}\n`
    }
    if (voiceAnalysis.targetAudience) {
      fullContext += `Target Audience: ${voiceAnalysis.targetAudience}\n`
    }
    if (voiceAnalysis.postStructure) {
      fullContext += `Post Structure: ${voiceAnalysis.postStructure}\n`
    }
    fullContext += '\n'
  }

  // Add writing template (for both user-defined and preset templates)
  if (writingTemplate) {
    const templateName = writingTemplate.personName || writingTemplate.title || writingTemplate.category || 'Template'
    const isPreset = writingTemplate.isPreset === true
    
    fullContext += `\n${'='.repeat(80)}\n`
    fullContext += `📝 ${isPreset ? '🎯 PRESET' : '✍️ CUSTOM'} WRITING TEMPLATE - FOLLOW THIS EXACTLY:\n`
    fullContext += `${'='.repeat(80)}\n\n`
    fullContext += `Template Name: ${templateName}\n`
    
    if (writingTemplate.category && isPreset) {
      fullContext += `Category: ${writingTemplate.category}\n`
    }
    
    fullContext += `\n🔹 TEMPLATE COMPONENTS:\n\n`
    
    if (writingTemplate.openingPattern) {
      fullContext += `📌 Opening Pattern (How to start the post):\n${writingTemplate.openingPattern}\n\n`
    }
    
    if (writingTemplate.contentStructure) {
      fullContext += `📐 Content Structure (How to organize the body):\n${writingTemplate.contentStructure}\n\n`
    }
    
    if (writingTemplate.credibilityPattern) {
      fullContext += `🎓 Credibility Pattern (How to establish authority):\n${writingTemplate.credibilityPattern}\n\n`
    }
    
    if (writingTemplate.engagementPattern) {
      fullContext += `💬 Engagement Pattern (How to keep readers engaged):\n${writingTemplate.engagementPattern}\n\n`
    }
    
    if (writingTemplate.ctaPattern) {
      fullContext += `🎯 CTA Pattern (How to end with action):\n${writingTemplate.ctaPattern}\n\n`
    }
    
    if (writingTemplate.commonElements?.length > 0) {
      fullContext += `🔑 Common Elements (Must include these):\n${writingTemplate.commonElements.map((el: string) => `  • ${el}`).join('\n')}\n\n`
    }
    
    if (writingTemplate.generalTemplate) {
      fullContext += `📋 General Template Structure:\n${'─'.repeat(60)}\n${writingTemplate.generalTemplate}\n${'─'.repeat(60)}\n\n`
    }
    
    // Most important: Example Template
    if (writingTemplate.exampleTemplate) {
      fullContext += `⭐ EXAMPLE POST - THIS IS YOUR REFERENCE MODEL:\n`
      fullContext += `${'━'.repeat(60)}\n`
      fullContext += `${writingTemplate.exampleTemplate}\n`
      fullContext += `${'━'.repeat(60)}\n\n`
      fullContext += `👉 Study this example carefully and mirror its:\n`
      fullContext += `  • Opening style and hook\n`
      fullContext += `  • Paragraph structure and length\n`
      fullContext += `  • Tone and voice\n`
      fullContext += `  • Use of formatting (line breaks, bullets, etc.)\n`
      fullContext += `  • Closing and engagement approach\n\n`
    }
    
    fullContext += `⚠️  CRITICAL INSTRUCTION:\n`
    fullContext += `Strictly follow this template's structure, patterns, and style while adapting the content to the specific topic.\n`
    fullContext += `The example post above shows EXACTLY how your output should look and feel.\n`
    fullContext += `${'='.repeat(80)}\n\n`
  }

  // Add preset template (for preset templates)
  if (presetTemplate) {
    fullContext += `📋 PRESET TEMPLATE (FOLLOW THIS STRUCTURE):\n`
    if (presetTemplate.name) {
      fullContext += `Template Name: ${presetTemplate.name}\n`
    }
    if (presetTemplate.description) {
      fullContext += `Description: ${presetTemplate.description}\n`
    }
    if (presetTemplate.structure) {
      fullContext += `Structure:\n${presetTemplate.structure}\n`
    }
    if (presetTemplate.example) {
      fullContext += `\nExample:\n${presetTemplate.example}\n`
    }
    fullContext += '\n'
  }

  // Add reference material (voice, text, url, youtube, file)
  if (referenceMaterial?.content) {
    const referenceTypeLabels = {
      voice: '🎤 Voice Recording Transcript',
      text: '📝 Text/Transcript',
      url: '🌐 Article Content',
      youtube: '📺 YouTube Video Transcript',
      file: '📄 Document Content'
    }
    
    fullContext += `${'='.repeat(80)}\n`
    fullContext += `📚 REFERENCE MATERIAL - USE THIS AS CONTEXT:\n`
    fullContext += `${'='.repeat(80)}\n\n`
    fullContext += `Source Type: ${referenceTypeLabels[referenceMaterial.type] || referenceMaterial.type}\n\n`
    fullContext += `${'-'.repeat(80)}\n`
    fullContext += `${referenceMaterial.content}\n`
    fullContext += `${'-'.repeat(80)}\n\n`
    fullContext += `⚠️  IMPORTANT INSTRUCTIONS FOR REFERENCE MATERIAL:\n`
    fullContext += `• Use this reference content as the PRIMARY CONTEXT for your post\n`
    fullContext += `• Extract key insights, data points, quotes, and ideas from this material\n`
    fullContext += `• DO NOT simply summarize - synthesize the content into engaging LinkedIn format\n`
    fullContext += `• Maintain factual accuracy while adapting the tone to match the user's voice\n`
    fullContext += `• If the reference contains statistics or data, include them in your post\n`
    fullContext += `• Cite or reference the source naturally if appropriate (e.g., "According to the article...")\n`
    fullContext += `• Transform long-form content into scannable LinkedIn format with short paragraphs\n`
    fullContext += `• Extract actionable takeaways and present them clearly\n\n`
  }

  // Add generation parameters
  fullContext += `🎯 GENERATION PARAMETERS:\n`
  if (topic) {
    fullContext += `Topic: ${topic}\n`
  }
  if (contentType) {
    fullContext += `Content Type: ${contentType}\n`
  }
  if (tone) {
    fullContext += `Tone: ${tone}\n`
  }
  if (hook) {
    fullContext += `\n🎣 MANDATORY HOOK (Use this EXACT opening):\n"${hook}"\n`
  }
  if (additionalInstructions) {
    fullContext += `\n${additionalInstructions}\n`
  }

  return fullContext
}
