import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import FirecrawlApp from "@mendable/firecrawl-js";
import { buildLLMContext } from "@/lib/prompts/system-prompt";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Returns tone-specific writing guidelines
 */
function getToneGuidelines(tone: string): string {
  const toneMap: Record<string, string> = {
    Authoritative: `- Use confident, declarative statements
- Cite facts, data, and research
- Avoid hedging words like "maybe" or "might"
- Write as an expert sharing proven insights
- Use phrases like "Research shows..." or "Data confirms..."`,

    Conversational: `- Write like you're talking to a friend over coffee
- Use contractions (I'm, you're, we're)
- Ask rhetorical questions
- Use casual but professional language
- Include personal anecdotes or relatable examples`,

    Inspirational: `- Use uplifting, empowering language
- Share personal transformation stories
- Focus on possibilities and potential
- End with motivational call-to-action
- Use phrases like "You can..." or "Imagine if..."`,

    Educational: `- Break down complex concepts simply
- Use examples and analogies
- Structure content with clear takeaways
- Define terms when needed
- Focus on teaching, not preaching`,

    "Data-driven": `- Lead with statistics and numbers
- Include specific metrics and percentages
- Reference studies, reports, and research
- Use charts/data visualization language
- Back every claim with evidence`,

    Humorous: `- Include witty observations or clever wordplay
- Use self-deprecating humor when appropriate
- Add unexpected twists or punchlines
- Keep it light but still valuable
- Balance humor with substance`,

    Provocative: `- Challenge common assumptions
- Take contrarian positions
- Use bold, attention-grabbing statements
- Question the status quo
- Create cognitive dissonance to spark thinking`,
  };

  return (
    toneMap[tone] ||
    `- Write in a ${tone.toLowerCase()} tone
- Maintain consistency throughout the post
- Let the tone inform word choice and sentence structure`
  );
}

/**
 * Gets context from a URL using Firecrawl.
 * @param url - The URL to scrape for content.
 * @returns A promise that resolves to the extracted text content.
 */
async function getContextFromUrl(url: string | null): Promise<string> {
  if (!url) {
    return "";
  }

  try {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) throw new Error("Firecrawl API key is not configured.");

    const app = new FirecrawlApp({ apiKey });
    const scrapeResult = await app.scrape(url, {
      timeout: 120000, // Timeout set to 120,000 milliseconds (2 minutes)
    });
    return (scrapeResult.markdown ?? "").substring(0, 15000);
  } catch (error) {
    console.error("Firecrawl scraping failed:", error);
    throw new Error("Could not retrieve content from the provided URL.");
  }
}

const deepResearchPrompt = (
  topic: string,
  context: string,
  tone: string,
  hook: string | null,
  contentType: string
) => `
You are an elite LinkedIn ghostwriter and market analyst who creates VIRAL, insight-driven content that establishes thought leadership.

**Primary Topic:** ${topic}
**Tone:** ${tone || "Expert and compelling"}
**Content Type:** ${contentType || "Standard post"}

**SOURCE CONTEXT:**
---
${
  context ||
  "No context provided. Generate based on the topic with strategic insights."
}
---

🎯 CRITICAL DIRECTIVES:

1. **NO META-COMMENTARY**: Output ONLY the raw LinkedIn post text. No introductions like "Here is the post..." or explanations. DO NOT include any "Resources:" or "Sources:" section at the end.

2. **DEEP SYNTHESIS WITH REAL-TIME DATA**: Use Google Search to find the most recent, credible information about this topic. Extract non-obvious insights from current events, recent studies, and breaking news. Find the angle others miss. Answer "So what?" and "Why does this matter NOW?"

3. **FACT-BASED CONTENT**: 
   - Include specific, verifiable facts and statistics throughout the post
   - Reference real companies, studies, reports, or news sources naturally
   - Use current data (prioritize information from the last 6-12 months)
   - Every major claim should be backed by evidence from your search
   - Write facts naturally - Google Search will automatically add citation markers
   - DO NOT manually add [1], [2], [3] citations - they will be added automatically by the grounding system

4. **H.R.R. STRUCTURE** (Hook → Retain → Reward):

   📌 HOOK (First 1-2 lines):
   ${
     hook
       ? `⚠️ CRITICAL - You MUST start with this EXACT opening line:\n   "${hook}"\n   Then seamlessly continue from this hook, expanding naturally on the topic.`
       : `- Lead with a contrarian statement, shocking stat, or bold claim backed by recent data\n   - Create pattern interrupt - make them STOP scrolling\n   - Examples: "Everyone is wrong about..." / "The $100B gap nobody's talking about..." / "New research reveals..."`
   }

   📌 RETENTION (Body - keep them reading):
   ${
     contentType === "Story"
       ? `- Structure as a COMPELLING NARRATIVE with strong emotional arc
   - Begin with a specific moment or realization
   - Use "I discovered..." or "One client told me..." for credibility
   - Build tension before revealing the lesson`
       : contentType === "Steps"
       ? `- Format as CLEAR, NUMBERED STEPS (3-7 steps maximum)
   - Each step should be immediately actionable
   - Use "Step X:" prefix for clarity
   - Include brief explanation (1-2 sentences) per step`
       : `- Use BULLET POINTS (•) or checkmarks (☑/✓) for scanability
   - Keep each point concise (1-2 lines maximum)
   - Use parallel structure (all starting with verbs or nouns)
   - Limit to 5-8 items for maximum impact`
   }
   - SHORT paragraphs (1-3 lines, then white space)
   - Include specific numbers and data naturally (Google will add citation markers automatically)

   📌 REWARD (Value delivery):
   - Deliver ACTIONABLE insights (not generic advice)
   - Reference data from Google Search results to build authority
   - Include specific examples or case studies from recent events
   - End with thought-provoking question that sparks discussion

5. **FORMATTING REQUIREMENTS**:
   - Use 1-3 professional emojis TOTAL (➤, •, ☑, ✓, 💡) - only for visual breaks
   - Break every 2-3 lines for white space
   - Mix short punchy sentences with longer explanatory ones
   - Strategic use of bold formatting for key phrases (if the context demands it)
   - Write facts naturally without manual citation numbers

6. **LANGUAGE STYLE**:
   - SPECIFIC over generic ("$500K budget" not "large budget")
   - CONCRETE examples over abstractions
   - ACTIVE voice ("We discovered" not "It was discovered")
   - CONVERSATIONAL but authoritative (smart colleague, not formal report)
   - POWER VERBS: discovered, revealed, transformed, eliminated, tested

7. **ENGAGEMENT OPTIMIZATION**:
   - End with SPECIFIC question (not "What do you think?")
   - Examples: "Where are you spending your time: chasing logos or solving problems?"
   - Create clear next step for reader engagement

🚫 STRICTLY AVOID:
- Corporate jargon ("leverage," "synergy," "paradigm shift")
- Overused phrases ("game changer," "unlock potential," "secret sauce")
- Generic advice that could apply to anything
- Long text blocks (always break into 2-3 line paragraphs)
- Excessive emojis (max 3 total)
- Adding a "Resources:" or "Sources:" section at the end
- Manually adding [1], [2], [3] citation numbers
- Uncited claims or statistics

✅ MUST INCLUDE:
- Pattern interrupt in opening line ${
  hook ? "(using the provided hook)" : "with compelling data"
}
- Specific numbers, percentages, and data points from recent sources
- Contrarian or surprising angle backed by recent research
- Real-world examples from current events
- Clear takeaways
- Conversation-starting question

📏 LENGTH: 300-700 words (optimal for LinkedIn engagement)

⚠️ IMPORTANT ABOUT CITATIONS:
- DO NOT manually type [1], [2], [3] or any citation markers
- Simply state facts naturally: "AI startups captured $192.7 billion in funding" or "65% of companies now use generative AI"
- Google Search grounding will automatically detect which statements are backed by sources and add citation markers
- The system will handle all citation display and source linking automatically

Generate ONLY the LinkedIn post text now (no preamble, no explanation). Include specific data and facts naturally - citations will be added automatically.`;

// --- MAIN API HANDLER ---
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has enough credits (1 credit for text generation)
    const { data: userCredits } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    const currentCredits = (userCredits as any)?.credits ?? 0;

    if (currentCredits < 1) {
      return NextResponse.json(
        {
          error:
            "Insufficient credits. Please upgrade your plan or purchase more credits.",
        },
        { status: 402 } // Payment Required
      );
    }

    const body = await request.json();
    const {
      topic,
      url,
      tone,
      contentType,
      hook,
      isDeepResearch,
      useProfileData,
      writingTemplate,
      userId,
      referenceMaterial,
    } = body;

    if (!topic && !url) {
      return NextResponse.json(
        { error: "A topic or URL is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Load profile data if requested
    let businessContextData = null;
    let voiceAnalysisData = null;
    let writingTemplateData = null;
    let templateType = "None"; // Track template type for logging

    if (useProfileData && userId) {
      try {
        console.log(
          "[Generate Post] 📖 Loading user profile data for userId:",
          userId
        );
        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("business_context")
          .eq("id", userId)
          .single();

        if (profile?.business_context) {
          const businessContext = profile.business_context as any;

          // Extract business context
          businessContextData = {
            businessName: businessContext.businessName,
            businessDescription: businessContext.businessDescription,
            industry: businessContext.industry,
            targetAudience: businessContext.targetAudience,
            services: businessContext.services,
            keywords: businessContext.keywords,
          };
          console.log("[Generate Post] ✅ Business context loaded");

          // Extract voice analysis - CHECK MULTIPLE LOCATIONS
          // Priority 1: Direct voiceAnalysis field in business_context
          if (businessContext.voiceAnalysis) {
            voiceAnalysisData = businessContext.voiceAnalysis;
            console.log(
              "[Generate Post] ✅ Voice analysis loaded from business_context.voiceAnalysis"
            );
          }
          // Priority 2: Voice analysis embedded in writingTemplate (from LinkedIn scraping)
          else if (businessContext.writingTemplate?.voiceAnalysis) {
            voiceAnalysisData = businessContext.writingTemplate.voiceAnalysis;
            console.log(
              "[Generate Post] ✅ Voice analysis loaded from writingTemplate.voiceAnalysis"
            );
          }
          // Priority 3: Voice analysis fields at top level of writingTemplate
          else if (
            businessContext.writingTemplate?.writingStyle ||
            businessContext.writingTemplate?.personality
          ) {
            voiceAnalysisData = {
              writingStyle: businessContext.writingTemplate.writingStyle,
              personality: businessContext.writingTemplate.personality,
              targetAudience: businessContext.writingTemplate.targetAudience,
              postStructure: businessContext.writingTemplate.postStructure,
            };
            console.log(
              "[Generate Post] ✅ Voice analysis extracted from writingTemplate (top-level)"
            );
          }
          // Priority 4: If LinkedIn template exists, consider it as voice analysis present
          else if (businessContext.writingTemplate) {
            // LinkedIn template exists, so voice analysis is present (they're the same)
            voiceAnalysisData = businessContext.writingTemplate;
            console.log(
              "[Generate Post] ✅ Voice analysis loaded from LinkedIn template"
            );
          }

          // Determine template type and extract writing template
          if (writingTemplate) {
            // Template passed from request (User-Defined or Preset)
            writingTemplateData = writingTemplate;
            const templateName =
              writingTemplate.personName ||
              writingTemplate.category ||
              writingTemplate.title ||
              "Unknown";

            if (writingTemplate.isPreset) {
              templateType = `Preset: ${
                writingTemplate.category || templateName
              }`;
              console.log(
                "[Generate Post] 📋 Using preset template:",
                templateName
              );
            } else {
              templateType = `Custom: ${templateName}`;
              console.log(
                "[Generate Post] 📝 Using custom template:",
                templateName
              );
            }
          } else if (businessContext.writingTemplate) {
            // Fallback to LinkedIn-scraped template from business_context
            writingTemplateData = businessContext.writingTemplate;
            templateType = `LinkedIn: ${businessContext.writingTemplate.personName}`;
            console.log(
              "[Generate Post] 🎤 Using LinkedIn template:",
              businessContext.writingTemplate.personName
            );
          } else {
            console.log("[Generate Post] ⚠️  No writing template available");
          }
        } else {
          console.log(
            "[Generate Post] ⚠️  No business_context found in profile"
          );
        }
      } catch (error) {
        console.error("[Generate Post] ❌ Error loading profile data:", error);
        // Continue without profile data
      }
    } else {
      console.log(
        "[Generate Post] ⚠️  useProfileData is false or no userId provided"
      );
    }

    // Construct the prompt with Post Type instructions
    let contentTypeGuideline = "";
    if (contentType === "Story") {
      contentTypeGuideline = `- Structure as a COMPELLING NARRATIVE with strong emotional arc
- Begin with a specific moment or realization that changed everything
- Use "I discovered..." or "One client told me..." for credibility
- Include dialogue or specific quotes to add authenticity
- Build tension before revealing the lesson or outcome
- End with reflection and actionable takeaway`;
    } else if (contentType === "Steps") {
      contentTypeGuideline = `- Format as CLEAR, NUMBERED STEPS (3-7 steps maximum)
- Each step should be immediately actionable
- Use "Step X:" prefix for clarity
- Include brief explanation (1-2 sentences) per step
- Add visual separators between steps
- End with expected outcome or results`;
    } else if (contentType === "Lists") {
      contentTypeGuideline = `- Use BULLET POINTS (•) or checkmarks (☑/✓) for scanability
- Keep each point concise (1-2 lines maximum)
- Use parallel structure (all starting with verbs or nouns)
- Add context or micro-examples within bullets
- Group related items together
- Limit to 5-8 items for maximum impact`;
    }

    // Build comprehensive LLM context using the system prompt + all available context
    const additionalInstructions = `
📋 H.R.R. MODEL (Hook → Retain → Reward):

${
  hook
    ? `🎯 CRITICAL - MANDATORY HOOK:\nYou MUST start your post with this EXACT opening line:\n"${hook}"\n\nThen seamlessly continue from this hook, expanding naturally on the topic. Make the transition smooth and compelling.`
    : `🎯 HOOK STRATEGY (First 1-2 lines):\nChoose ONE high-engagement hook type:\n- Bold Contrarian Statement: Challenge common beliefs\n- Shocking Statistic/Number: Lead with data that surprises\n- Personal Story Opening: "I discovered..." or "Last week..."\n- Pattern Interrupt: "Everyone is wrong about..."\n- Curiosity Gap: Hint at valuable info without revealing it yet`
}

${
  tone
    ? `🎨 TONE REQUIREMENT (CRITICAL):\nYou MUST write in a ${tone} tone throughout the entire post. This means:\n${getToneGuidelines(
        tone
      )}\n`
    : ""
}

 RETENTION STRUCTURE (Keep them reading):
${contentTypeGuideline}

💎 REWARD DELIVERY (Value per second):
- Deliver SPECIFIC, actionable insights (not generic advice)
- Include real numbers, examples, or case studies where possible
- Answer "So what?" and "Now what?" explicitly
- End with thought-provoking question or clear CTA

✍️ WRITING STYLE RULES:
1. SHORT PARAGRAPHS: 1-3 lines maximum, then white space
2. VARIED SENTENCE LENGTH: Mix short punchy lines with longer explanatory ones
3. STRATEGIC EMOJI USE: 1-3 emojis total - only for visual breaks or emphasis (➤, •, ☑, ✓, 💡)
4. NO FLUFF: Every sentence must add value or move the story forward
5. CONVERSATIONAL TONE: Write like you're talking to a smart colleague, not a formal report
6. POWER WORDS: Use compelling verbs (discovered, revealed, transformed, eliminated)
7. SPECIFICITY: Replace "many" with "73%", "things" with exact items, "recently" with "last Tuesday"

📐 FORMATTING STRUCTURE:
- Opening Hook (1-2 lines) - MUST grab attention immediately
- Context/Setup (2-3 short paragraphs) - Build credibility and relevance
- Main Content (organized per Post Type) - Deliver core value
- Closing Insight (1-2 paragraphs) - Tie it together with bigger lesson
- Engagement CTA (final line) - Question or conversation starter

🚫 AVOID:
- Generic corporate speak ("leverage," "synergy," "paradigm shift")
- Overused phrases ("game changer," "unlock," "secret sauce")
- Excessive emojis (max 3 total, placed strategically)
- Long blocks of text (break every 2-3 lines)
- Ending with "What do you think?" (be more specific)

✅ INCLUDE:
- Specific numbers and data points
- Real examples or mini case studies
- Contrarian or surprising insights
- Personal voice and authentic language
- Clear takeaways readers can implement

🎯 SUCCESS METRICS TO OPTIMIZE FOR:
- Pattern interrupt in first line (make them stop scrolling)
- "Keep reading" pull in first 3 lines
- Scannable structure (they can skim and still get value)
- Shareable insight (worth reposting)
- Comment-worthy ending (sparks discussion)

Write the complete LinkedIn post now (300-600 words optimal).`;

    // Build the comprehensive prompt using system prompt + all context
    const prompt = buildLLMContext({
      businessContext: businessContextData,
      voiceAnalysis: voiceAnalysisData,
      writingTemplate: writingTemplateData,
      topic,
      contentType,
      tone,
      hook,
      additionalInstructions,
      referenceMaterial,
    });

    // Log what context is being used
    console.log("=".repeat(60));
    console.log("[Generate Post] 🎯 REQUEST:");
    console.log("Topic:", topic);
    console.log(
      "Tone:",
      tone,
      "| Type:",
      contentType,
      "| Hook:",
      hook ? "✓" : "✗"
    );
    console.log(
      "Deep Research:",
      isDeepResearch,
      "| Reference:",
      referenceMaterial?.type || "None"
    );
    console.log("-".repeat(60));
    console.log("[Generate Post] � CONTEXT:");
    console.log("Business:", businessContextData ? "✓" : "✗");
    console.log("Voice Analysis:", voiceAnalysisData ? "✓" : "✗");
    console.log("Template:", writingTemplateData ? `✓ (${templateType})` : "✗");
    console.log("=".repeat(60));

    console.log("[Generate Post] 🚀 Calling Gemini API...");

    const contextText = await getContextFromUrl(url);

    const finalPrompt = isDeepResearch
      ? deepResearchPrompt(topic, contextText, tone, hook, contentType)
      : prompt;

    let generatedContent = "";
    let groundingMetadata: any = null;

    if (isDeepResearch) {
      // Use Google Search Grounding for Deep Research
      console.log(
        "[Generate Post] 🔍 Using Deep Research mode with Google Search grounding..."
      );
      console.log(
        "[Generate Post] ⚠️  Note: Google Search may not trigger for all queries - the AI decides dynamically"
      );

      const genAI = new GoogleGenerativeAI(apiKey);

      try {
        // Try gemini-2.0-flash-exp with Google Search first
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
        });

        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${finalPrompt}

IMPORTANT: You have access to Google Search. Please search for current, real-time information about this topic before generating the response. Include specific facts, statistics, and sources with inline citations [1], [2], [3].`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          tools: [
            {
              googleSearch: {},
            },
          ] as any,
        });

        const response = result.response;
        generatedContent = response.text();

        // Extract grounding metadata
        groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      } catch (deepResearchError: any) {
        // If the experimental model is overloaded or fails, fallback to standard model
        console.log(
          "[Generate Post] ⚠️  Deep Research model failed:",
          deepResearchError.message
        );
        console.log(
          "[Generate Post] 🔄 Falling back to standard Gemini model..."
        );

        const fallbackModel = "gemini-2.5-flash";
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent?key=${apiKey}`;

        const fallbackResponse = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: finalPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
          }),
        });

        if (!fallbackResponse.ok) {
          const errorText = await fallbackResponse.text();
          console.error("Fallback Gemini API Error:", errorText);
          return NextResponse.json(
            {
              error: `Failed to generate content: ${fallbackResponse.statusText}`,
            },
            { status: 500 }
          );
        }

        const fallbackData = await fallbackResponse.json();
        generatedContent =
          fallbackData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedContent) {
          console.error(
            "No content in fallback Gemini response:",
            JSON.stringify(fallbackData)
          );
          return NextResponse.json(
            { error: "No content generated from API" },
            { status: 500 }
          );
        }

        console.log(
          "[Generate Post] ✅ Content generated using fallback model (without Google Search)"
        );
      }

      // Log grounding metadata if available (only if deep research succeeded)
      if (groundingMetadata) {
        console.log("[Generate Post] 📚 Grounding metadata found:");
        console.log(
          "[Generate Post] - Grounding Chunks:",
          groundingMetadata.groundingChunks?.length || 0
        );
        console.log(
          "[Generate Post] - Grounding Supports:",
          groundingMetadata.groundingSupports?.length || 0
        );
        console.log(
          "[Generate Post] - Web Search Queries:",
          groundingMetadata.webSearchQueries?.length || 0
        );

        // Log search queries (cleaner format)
        if (
          groundingMetadata.webSearchQueries &&
          groundingMetadata.webSearchQueries.length > 0
        ) {
          console.log("[Generate Post] 🔍 Search Queries:");
          groundingMetadata.webSearchQueries.forEach(
            (query: string, index: number) => {
              console.log(`[Generate Post]   ${index + 1}. "${query}"`);
            }
          );
        }

        // Log citation details
        if (
          groundingMetadata.groundingChunks &&
          groundingMetadata.groundingChunks.length > 0
        ) {
          console.log("[Generate Post] 📖 Citations:");
          groundingMetadata.groundingChunks.forEach(
            (chunk: any, index: number) => {
              console.log(
                `[Generate Post]   [${index + 1}] ${
                  chunk.web?.title || "Unknown"
                }`
              );
            }
          );
        } else {
          console.log(
            "[Generate Post] ⚠️  No grounding chunks found - Google Search may not have been triggered"
          );
          console.log(
            "[Generate Post] 💡 Tip: Try more specific, current topics that require real-time data"
          );
        }
      } else if (isDeepResearch) {
        console.log(
          "[Generate Post] ⚠️  No grounding metadata found in response"
        );
        console.log(
          "[Generate Post] 💡 This means Google Search was not used for this query"
        );
      }
    } else {
      // Use standard API call for regular generation
      const model = "gemini-2.5-flash";
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: finalPrompt }] }],
          generationConfig: {
            temperature: 0.9,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API Error:", errorText);
        return NextResponse.json(
          { error: `Failed to generate content: ${response.statusText}` },
          { status: 500 }
        );
      }

      const data = await response.json();
      generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedContent) {
        console.error("No content in Gemini response:", JSON.stringify(data));
        return NextResponse.json(
          { error: "No content generated from API" },
          { status: 500 }
        );
      }
    }

    // Deduct 1 credit for text generation
    try {
      const { error: deductError } = await supabase.rpc("deduct_credits", {
        p_user_id: user.id,
        p_amount: 1,
        p_type: "text_generation",
        p_description: `Generated LinkedIn post about: ${topic}`,
      } as any);

      if (deductError) {
        console.error("Error deducting credits:", deductError);
        // Don't fail the request if credit deduction fails, but log it
      }
    } catch (creditError) {
      console.error("Credit deduction failed:", creditError);
    }

    console.log("Content generated successfully");

    // Return response with content and optional grounding metadata
    const response: any = { content: generatedContent };

    if (groundingMetadata) {
      response.groundingMetadata = groundingMetadata;
      console.log(
        "[Generate Post] ✅ Including grounding metadata in response"
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in generate-post API handler:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An internal server error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
