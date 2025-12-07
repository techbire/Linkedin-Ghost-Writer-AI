"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function TestScrapePage() {
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTest = async () => {
    if (!websiteUrl) {
      setError("Please enter a website URL")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("Testing scrape API with URL:", websiteUrl)
      
      const response = await fetch('/api/scrape-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ websiteUrl }),
      })

      console.log("Response status:", response.status)
      
      const data = await response.json()
      console.log("Response data:", data)

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || "Failed to scrape website")
      }
    } catch (err) {
      console.error("Test error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test Website Scraping API</CardTitle>
          <CardDescription>
            Test the Firecrawl integration to scrape websites and extract Your Persona
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button onClick={handleTest} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scraping website...
              </>
            ) : (
              "Test Scrape"
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="ml-2">
                <div className="space-y-2">
                  <p className="font-semibold text-green-800 dark:text-green-100">
                    ✅ Scraping successful!
                  </p>
                  
                  {result.businessContext && (
                    <div className="mt-4 space-y-2 text-sm">
                      <div>
                        <strong>Business Name:</strong> {result.businessContext.businessName}
                      </div>
                      <div>
                        <strong>Industry:</strong> {result.businessContext.industry}
                      </div>
                      <div>
                        <strong>Description:</strong> {result.businessContext.businessDescription}
                      </div>
                      {result.businessContext.services?.length > 0 && (
                        <div>
                          <strong>Services:</strong> {result.businessContext.services.join(", ")}
                        </div>
                      )}
                      {result.businessContext.keywords?.length > 0 && (
                        <div>
                          <strong>Keywords:</strong> {result.businessContext.keywords.join(", ")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <details className="text-sm">
              <summary className="cursor-pointer font-semibold">View Full Response</summary>
              <pre className="mt-2 overflow-auto rounded bg-muted p-4">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          )}

          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Test URLs:</strong></p>
            <ul className="ml-4 list-disc space-y-1">
              <li>https://www.stripe.com</li>
              <li>https://vercel.com</li>
              <li>https://www.shopify.com</li>
              <li>https://www.airbnb.com</li>
            </ul>
            <p className="mt-4">
              <strong>Note:</strong> Check the browser console (F12) and terminal logs for detailed debugging information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
