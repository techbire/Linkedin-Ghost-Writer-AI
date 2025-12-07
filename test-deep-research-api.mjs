/**
 * Quick test script for Deep Research API
 * Run with: node test-deep-research-api.mjs
 * 
 * Make sure your dev server is running: npm run dev
 */

const API_URL = 'http://localhost:3000/api/generate-post'

const testDeepResearch = async () => {
  console.log('🧪 Testing Deep Research API...\n')

  const testPayload = {
    topic: "Who won the euro 2024?",
    tone: "Expert and compelling",
    contentType: "Story",
    isDeepResearch: true,
    useProfileData: false
  }

  console.log('📤 Sending request:')
  console.log(JSON.stringify(testPayload, null, 2))
  console.log('\n⏳ Waiting for response (this may take 15-30 seconds)...\n')

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ API Error:', data.error)
      console.error('Status:', response.status)
      return
    }

    console.log('✅ Response received!\n')
    console.log('=' .repeat(80))
    console.log('📝 GENERATED CONTENT:')
    console.log('=' .repeat(80))
    console.log(data.content)
    console.log('=' .repeat(80))

    // Check for citations
    const citationPattern = /\[\d+\]/g
    const citations = data.content.match(citationPattern)
    
    if (citations) {
      console.log('\n✅ Citations found:', citations.length, 'references')
      console.log('Citations:', citations.join(', '))
    } else {
      console.log('\n⚠️  No citations found in content')
    }

    // Check for Resources section
    if (data.content.includes('Resources:') || data.content.includes('📚')) {
      console.log('✅ Resources section found')
    } else {
      console.log('⚠️  No Resources section found')
    }

    // Check grounding metadata
    if (data.groundingMetadata) {
      console.log('\n📚 GROUNDING METADATA:')
      console.log('=' .repeat(80))
      
      if (data.groundingMetadata.searchEntryPoint) {
        console.log('🔍 Search Query:', data.groundingMetadata.searchEntryPoint.renderedContent)
      }
      
      if (data.groundingMetadata.groundingChunks) {
        console.log('\n📖 Sources (' + data.groundingMetadata.groundingChunks.length + '):')
        data.groundingMetadata.groundingChunks.forEach((chunk, index) => {
          console.log(`  [${index + 1}] ${chunk.web?.title || 'Unknown'}`)
          console.log(`      ${chunk.web?.uri || 'N/A'}`)
        })
      }
      
      if (data.groundingMetadata.groundingSupports) {
        console.log('\n✓ Grounding Supports:', data.groundingMetadata.groundingSupports.length)
      }
      
      console.log('=' .repeat(80))
    } else {
      console.log('\n⚠️  No grounding metadata in response')
      console.log('   This might mean:')
      console.log('   - The AI didn\'t need to search for this topic')
      console.log('   - Search grounding is not enabled')
      console.log('   - The model decided not to use web search')
    }

    console.log('\n✅ Test completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('\nPossible issues:')
    console.error('1. Make sure dev server is running: npm run dev')
    console.error('2. Check GEMINI_API_KEY in .env.local')
    console.error('3. Verify you have credits in your account')
  }
}

// Run the test
testDeepResearch()
