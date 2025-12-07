import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { GoogleAuth } from "google-auth-library"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    
    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    
    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      )
    }

    // Convert audio to base64 for Google Speech-to-Text
    const arrayBuffer = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString("base64")

    // Get access token using service account
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || "{}")
    const auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    })
    const client = await auth.getClient()
    const accessToken = await client.getAccessToken()

    // Call Google Speech-to-Text API
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken.token}`,
        },
        body: JSON.stringify({
          config: {
            encoding: "WEBM_OPUS", // or "LINEAR16", "MP3", etc. depending on the audio format
            sampleRateHertz: 48000, // Adjust based on your audio
            languageCode: "en-US",
            enableAutomaticPunctuation: true,
          },
          audio: {
            content: base64Audio,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error("Google Speech API error:", error)
      return NextResponse.json(
        { error: "Failed to transcribe audio" },
        { status: 500 }
      )
    }

    const data = await response.json()
    
    // Extract transcript from response
    const transcript = data.results
      ?.map((result: any) => result.alternatives[0]?.transcript)
      .join(" ") || ""

    if (!transcript) {
      return NextResponse.json(
        { error: "No speech detected in audio" },
        { status: 400 }
      )
    }

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error("Error transcribing audio:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
