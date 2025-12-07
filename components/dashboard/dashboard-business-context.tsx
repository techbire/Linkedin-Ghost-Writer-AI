"use client"

import { useState, useEffect } from "react"
import { BusinessContextCard } from "./business-context-card"
import { BackgroundScraper } from "./background-scraper"

interface BusinessContext {
  businessName?: string
  businessDescription?: string
  industry?: string
  services?: string[]
  targetAudience?: string
  ageGroup?: string
  valueProposition?: string
  keywords?: string[]
  sourceUrl?: string
  scrapedAt?: string
  voiceAnalysis?: {
    writingStyle?: string
    targetAudience?: string
    personality?: string
    postStructure?: string
    analyzedFrom?: 'influencer' | 'own_posts'
    influencerName?: string | null
    lastUpdated?: string
  }
  writingTemplate?: {
    personName?: string
    openingPattern?: string
    contentStructure?: string
    ctaPattern?: string
    commonElements?: string[]
    exampleTemplate?: string
    generalTemplate?: string
    lastUpdated?: string
  }
}

interface DashboardBusinessContextProps {
  businessContext: BusinessContext | null
  websiteUrl: string | null
  profession: string | null
  designation: string | null
}

export function DashboardBusinessContext({
  businessContext,
  websiteUrl,
  profession,
  designation,
}: DashboardBusinessContextProps) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log("[DashboardBusinessContext] Component mounted")
    console.log("[DashboardBusinessContext] Props:", {
      hasBusinessContext: !!businessContext,
      websiteUrl,
      profession,
      designation
    })
    console.log("[DashboardBusinessContext] Full businessContext:", businessContext)
    console.log("[DashboardBusinessContext] Has voiceAnalysis?", !!businessContext?.voiceAnalysis)
    console.log("[DashboardBusinessContext] Has writingTemplate?", !!businessContext?.writingTemplate)
  }, [businessContext, websiteUrl, profession, designation])

  return (
    <>
      <BackgroundScraper onLoadingChange={setIsLoading} />
      
      {(isLoading || businessContext || websiteUrl || profession) && (
        <BusinessContextCard
          businessContext={businessContext}
          websiteUrl={websiteUrl}
          profession={profession}
          designation={designation}
          isLoading={isLoading}
        />
      )}
    </>
  )
}
