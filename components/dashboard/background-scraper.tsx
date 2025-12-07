"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function BackgroundScraper({ onLoadingChange }: { onLoadingChange?: (loading: boolean) => void }) {
  const { toast } = useToast()

  useEffect(() => {
    console.log("[BackgroundScraper] Component mounted, checking localStorage...")
    
    // Check if there's a pending website scrape from signup
    const pendingWebsite = localStorage.getItem('pending_website_scrape')
    console.log("[BackgroundScraper] Pending website:", pendingWebsite)
    
    if (pendingWebsite) {
      console.log("[BackgroundScraper] Found pending website, starting scrape...")
      
      // Set loading state
      onLoadingChange?.(true)
      
      // Show toast that scraping has started
      toast({
        title: "Analyzing your website...",
        description: (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Extracting Your Persona from {new URL(pendingWebsite).hostname}</span>
          </div>
        ),
        duration: 30000, // 30 seconds
      })

      console.log("[BackgroundScraper] Calling /api/scrape-website...")
      
      // Trigger the scraping
      fetch('/api/scrape-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ websiteUrl: pendingWebsite }),
      })
        .then(async (response) => {
          console.log("[BackgroundScraper] Response status:", response.status)
          const data = await response.json()
          console.log("[BackgroundScraper] Response data:", data)
          
          if (response.ok && data.success) {
            console.log("[BackgroundScraper] Scraping successful!")
            
            // Remove from localStorage
            localStorage.removeItem('pending_website_scrape')
            
            // Show success toast
            toast({
              title: "Website analyzed successfully! ✨",
              description: "Your Your Persona has been extracted and saved. Refreshing...",
              duration: 3000,
            })
            
            // Refresh the page to show the Your Persona
            setTimeout(() => {
              console.log("[BackgroundScraper] Refreshing page...")
              window.location.reload()
            }, 1500)
          } else {
            console.error("[BackgroundScraper] Scraping failed:", response.status, data)
            // Remove from localStorage on failure
            localStorage.removeItem('pending_website_scrape')
            onLoadingChange?.(false)
            
            toast({
              title: "Analysis failed",
              description: data.error || "We couldn't analyze your website. Please try again later.",
              variant: "destructive",
            })
          }
        })
        .catch((error) => {
          console.error("[BackgroundScraper] Fetch error:", error)
          // Remove from localStorage on error
          localStorage.removeItem('pending_website_scrape')
          onLoadingChange?.(false)
          
          toast({
            title: "Analysis error",
            description: "Something went wrong. Please try again later.",
            variant: "destructive",
          })
        })
    } else {
      console.log("[BackgroundScraper] No pending website found")
    }
  }, [toast, onLoadingChange])

  return null // This component doesn't render anything
}
