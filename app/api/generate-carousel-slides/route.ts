import { NextRequest, NextResponse } from 'next/server';

// We'll use fetch API directly with the imagen endpoint instead of the SDK

interface SlideContent {
  title: string;
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { topic, tone, carouselTitle, slideCount = 7, includeOutro = true } = await req.json();

    if (!topic || !tone) {
      return NextResponse.json(
        { error: 'Topic and tone are required' },
        { status: 400 }
      );
    }

    // Use GEMINI_API_KEY (same as other routes)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const outroInstruction = includeOutro 
      ? '- Last slide should be a "Thank you" outro with a call to follow'
      : '- Last slide should be a clear call-to-action or summary';

    const prompt = `You are a LinkedIn carousel content creator. Generate ${slideCount} slides for a carousel about: "${topic}"

Tone: ${tone}
Carousel Title: ${carouselTitle}

Requirements:
- First slide should be an engaging intro/hook
${outroInstruction}
- Middle slides should provide valuable, actionable content
- Keep titles under 10 words
- Keep content concise (2-4 lines per slide)
- Use the ${tone.toLowerCase()} tone throughout
- Make it engaging and scrollable

Return ONLY a valid JSON array with exactly ${slideCount} objects, each with "title" and "content" fields.
Example format:
[
  {"title": "Hook title here", "content": "Engaging opening statement that makes people want to read more"},
  {"title": "Key point 1", "content": "Valuable insight or tip that provides real value"},
  {"title": "Final takeaway", "content": "Clear call-to-action or memorable conclusion"}
]

Do not include any markdown formatting, explanations, or text outside the JSON array.`;

    // Use the same endpoint as generate-carousel-images
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate content from Gemini API', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Clean up the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON response
    let slides: SlideContent[];
    try {
      slides = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse LLM response:', text);
      return NextResponse.json(
        { error: 'Failed to parse LLM response', details: text },
        { status: 500 }
      );
    }

    // Validate the response structure
    if (!Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json(
        { error: 'Invalid response format from LLM' },
        { status: 500 }
      );
    }

    // Ensure all slides have required fields
    const validatedSlides = slides.map((slide, index) => ({
      id: `slide-${Date.now()}-${index}`,
      number: index + 1,
      title: slide.title || `Slide ${index + 1}`,
      content: slide.content || '',
    }));

    return NextResponse.json({
      slides: validatedSlides,
      metadata: {
        topic,
        tone,
        carouselTitle,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error generating carousel slides:', error);
    return NextResponse.json(
      { error: 'Failed to generate carousel slides', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
