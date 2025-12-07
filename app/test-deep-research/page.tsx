"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search } from "lucide-react"
import { GroundedContentDisplay } from "@/components/dashboard/grounded-content-display"

export default function TestDeepResearchPage() {
  const [topic, setTopic] = useState("")
  const [tone, setTone] = useState("Expert and compelling")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState("")
  const [error, setError] = useState("")
  const [groundingInfo, setGroundingInfo] = useState<any>(null)

  const handleTest = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic")
      return
    }

    setIsLoading(true)
    setError("")
    setResult("")
    setGroundingInfo(null)

    try {
      const response = await fetch("/api/generate-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic.trim(),
          tone: tone || "Expert and compelling",
          contentType: "Story",
          isDeepResearch: true,
          useProfileData: false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate content")
      }

      setResult(data.content || "No content generated")
      
      // Check if grounding metadata is returned
      if (data.groundingMetadata) {
        setGroundingInfo(data.groundingMetadata)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6" />
            Deep Research Test - Google Search Grounding
          </CardTitle>
          <CardDescription>
            Test the Deep Research feature with Google Search integration. The AI will search the web for real-time information and include citations in the generated content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Latest trends in AI for 2025, Recent developments in quantum computing"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone (Optional)</Label>
              <Input
                id="tone"
                placeholder="Expert and compelling"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button 
              onClick={handleTest} 
              disabled={isLoading || !topic.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Researching & Generating...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Generate with Deep Research
                </>
              )}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="border-red-500 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600 font-medium">Error: {error}</p>
              </CardContent>
            </Card>
          )}

          {/* Result Display */}
          {result && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Generated Content</CardTitle>
                  <CardDescription>
                    {groundingInfo ? "Hover over italic text to see sources" : "Content generated without grounding"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <GroundedContentDisplay 
                      content={result} 
                      groundingMetadata={groundingInfo}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Grounding Metadata Display */}
              {groundingInfo && (
                <Card className="border-blue-500 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Grounding Metadata (Citations)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Don't display searchEntryPoint as it contains HTML/CSS formatting */}
                    
                    {groundingInfo.groundingChunks && groundingInfo.groundingChunks.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Sources ({groundingInfo.groundingChunks.length}):</h3>
                        <ul className="space-y-2">
                          {groundingInfo.groundingChunks.map((chunk: any, index: number) => (
                            <li key={index} className="text-sm">
                              <span className="font-medium">[{index + 1}]</span>{" "}
                              {chunk.web?.title || "Unknown Source"}
                              {chunk.web?.uri && (
                                <a 
                                  href={chunk.web.uri} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-2 text-blue-600 hover:underline"
                                >
                                  View Source
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {groundingInfo.groundingSupports && groundingInfo.groundingSupports.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">
                          Grounding Supports: {groundingInfo.groundingSupports.length}
                        </h3>
                        <p className="text-xs text-gray-600">
                          Number of times the AI referenced search results in the content
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Instructions */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm">How to Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <ol className="list-decimal list-inside space-y-1">
                <li>Enter a topic that requires current information (e.g., "Latest AI trends in 2025")</li>
                <li>Click "Generate with Deep Research"</li>
                <li>Wait for the AI to search and generate content (may take 15-30 seconds)</li>
                <li>Check the generated content for inline citations like [1], [2], [3]</li>
                <li>Look for the "Resources" section at the end with source links</li>
                <li>Review the grounding metadata to see which sources were used</li>
              </ol>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 text-xs">
                  <strong>Note:</strong> Make sure GEMINI_API_KEY is set in your .env.local file. 
                  Deep Research uses Google Search grounding which requires the Gemini API.
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
