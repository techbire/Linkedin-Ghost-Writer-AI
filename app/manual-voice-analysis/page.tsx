"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function ManualVoiceAnalysisPage() {
  const [voiceSource, setVoiceSource] = useState<"my_style" | "influencer">("my_style")
  const [profileUrl, setProfileUrl] = useState("")
  const [influencerUrl, setInfluencerUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleAnalyze = async () => {
    if (!profileUrl && voiceSource === "my_style") {
      toast({
        title: "URL Required",
        description: "Please enter your LinkedIn profile URL",
        variant: "destructive"
      })
      return
    }

    if (!influencerUrl && voiceSource === "influencer") {
      toast({
        title: "URL Required",
        description: "Please enter the influencer's LinkedIn URL",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)

    try {
      // Step 1: Scrape profile (if analyzing own posts)
      if (voiceSource === "my_style" && profileUrl) {
        const profileResponse = await fetch('/api/scrape-linkedin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileUrl,
            step: 'profile'
          })
        })

        if (!profileResponse.ok) {
          throw new Error('Profile scraping failed')
        }
      }

      // Step 2: Scrape posts and analyze
      const postsResponse = await fetch('/api/scrape-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileUrl,
          voiceSource,
          influencerUrl,
          step: 'posts'
        })
      })

      if (!postsResponse.ok) {
        throw new Error('Voice analysis failed')
      }

      toast({
        title: "Success!",
        description: "Voice analysis completed. Check the Configure page to see results.",
      })

      // Refresh the page after a delay
      setTimeout(() => {
        window.location.href = '/dashboard/configure'
      }, 2000)

    } catch (error: any) {
      console.error('Analysis error:', error)
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze voice. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Manual Voice Analysis</CardTitle>
          <CardDescription>
            Analyze LinkedIn posts to create your voice profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Voice Source</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="my_style"
                  name="voiceSource"
                  value="my_style"
                  checked={voiceSource === "my_style"}
                  onChange={(e) => setVoiceSource("my_style")}
                  className="h-4 w-4"
                />
                <Label htmlFor="my_style" className="font-normal cursor-pointer">
                  Analyze my LinkedIn posts
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="influencer"
                  name="voiceSource"
                  value="influencer"
                  checked={voiceSource === "influencer"}
                  onChange={(e) => setVoiceSource("influencer")}
                  className="h-4 w-4"
                />
                <Label htmlFor="influencer" className="font-normal cursor-pointer">
                  Analyze an influencer's posts
                </Label>
              </div>
            </div>
          </div>

          {voiceSource === "my_style" && (
            <div className="space-y-2">
              <Label htmlFor="profileUrl">Your LinkedIn Profile URL</Label>
              <Input
                id="profileUrl"
                placeholder="https://linkedin.com/in/yourprofile"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
              />
            </div>
          )}

          {voiceSource === "influencer" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profileUrl2">Your LinkedIn Profile URL (optional)</Label>
                <Input
                  id="profileUrl2"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="influencerUrl">Influencer's LinkedIn URL</Label>
                <Input
                  id="influencerUrl"
                  placeholder="https://linkedin.com/in/influencer"
                  value={influencerUrl}
                  onChange={(e) => setInfluencerUrl(e.target.value)}
                />
              </div>
            </div>
          )}

          <Button 
            onClick={handleAnalyze} 
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing... (This may take 2-3 minutes)
              </>
            ) : (
              'Start Analysis'
            )}
          </Button>

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>What this does:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Scrapes 5 recent LinkedIn posts</li>
              <li>Analyzes writing style with AI</li>
              <li>Extracts common themes and patterns</li>
              <li>Saves to your profile for future posts</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
