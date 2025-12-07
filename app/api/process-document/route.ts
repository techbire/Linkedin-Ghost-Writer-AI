import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

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
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/msword", // .doc
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, TXT, DOC, and DOCX are supported" },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      )
    }

    // Initialize Gemini AI
    const geminiApiKey = process.env.GEMINI_API_KEY
    
    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY not configured")
      return NextResponse.json(
        { error: "Document processing service not configured" },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(arrayBuffer).toString("base64")

    // Determine MIME type
    let mimeType = file.type
    if (file.name.endsWith(".doc")) {
      mimeType = "application/msword"
    } else if (file.name.endsWith(".docx")) {
      mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }

    // Process document with Gemini
    const contents = [
      {
        role: "user",
        parts: [
          { text: "Extract and summarize the main content from this document. Provide the key points, main ideas, and important information in a clear, structured format." },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ]

    const result = await model.generateContent({
      contents,
    })

    const extractedText = result.response.text()

    if (!extractedText) {
      return NextResponse.json(
        { error: "Failed to extract content from document" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      content: extractedText,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    })
  } catch (error: any) {
    console.error("Error processing document:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
