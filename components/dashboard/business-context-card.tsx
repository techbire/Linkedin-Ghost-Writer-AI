"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Target, Sparkles, ExternalLink, Calendar, Loader2, Pencil, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EditBusinessContextDialog } from "./edit-business-context-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

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

interface BusinessContextCardProps {
  businessContext: BusinessContext | null
  websiteUrl: string | null
  profession: string | null
  designation: string | null
  isLoading?: boolean
}

export function BusinessContextCard({
  businessContext,
  websiteUrl,
  profession,
  designation,
  isLoading = false,
}: BusinessContextCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  
  const handleRefresh = async () => {
    if (!websiteUrl) {
      toast({
        title: "No Website URL",
        description: "Please add a website URL in settings to scrape your business context.",
        variant: "destructive"
      })
      return
    }
    
    setIsRefreshing(true)
    
    try {
      const response = await fetch('/api/scrape-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape website')
      }
      
      toast({
        title: "Success!",
        description: "Your business context has been refreshed from your website.",
      })
      
      // Refresh the page to show updated data
      router.refresh()
    } catch (error: any) {
      console.error('Refresh error:', error)
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh business context. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }
  
  if (!businessContext && !websiteUrl && !profession && !isLoading) {
    return null
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <>
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Your Persona
                {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              </CardTitle>
              <CardDescription>
                {isLoading ? "Analyzing your website..." : "AI-powered insights about your business"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {businessContext?.scrapedAt && !isLoading && (
                <Badge variant="secondary" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(businessContext.scrapedAt)}
                </Badge>
              )}
              {!isLoading && websiteUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-8"
                  title="Re-scrape website to refresh business context"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
              )}
              {!isLoading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditDialogOpen(true)}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit Your Persona</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Extracting business insights from your website...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Professional Information */}
        {(profession || designation) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {profession && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Profession</p>
                <p className="text-sm font-semibold">{profession}</p>
              </div>
            )}
            {designation && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Designation</p>
                <p className="text-sm font-semibold">{designation}</p>
              </div>
            )}
          </div>
        )}

        {businessContext && (
          <>
            {/* Business Name and Industry */}
            {(businessContext.businessName || businessContext.industry) && (
              <div className="grid gap-3 sm:grid-cols-2">
                {businessContext.businessName && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Business Name</p>
                    <p className="text-sm font-semibold">{businessContext.businessName}</p>
                  </div>
                )}
                {businessContext.industry && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Industry</p>
                    <Badge variant="outline">{businessContext.industry}</Badge>
                  </div>
                )}
              </div>
            )}

            {/* Business Description */}
            {businessContext.businessDescription && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  What You Do
                </p>
                <p className="text-sm leading-relaxed">{businessContext.businessDescription}</p>
              </div>
            )}

            {/* Target Audience */}
            {(businessContext.targetAudience || businessContext.ageGroup) && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Target Audience
                </p>
                <div className="flex flex-wrap gap-2">
                  {businessContext.targetAudience && (
                    <p className="text-sm">{businessContext.targetAudience}</p>
                  )}
                  {businessContext.ageGroup && (
                    <Badge variant="secondary" className="text-xs">
                      {businessContext.ageGroup}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Value Proposition */}
            {businessContext.valueProposition && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Value Proposition
                </p>
                <p className="text-sm leading-relaxed">{businessContext.valueProposition}</p>
              </div>
            )}

            {/* Services */}
            {businessContext.services && businessContext.services.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Services & Products</p>
                <div className="flex flex-wrap gap-1.5">
                  {businessContext.services.map((service, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {businessContext.keywords && businessContext.keywords.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Content Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {businessContext.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Voice Analysis Section */}
            {businessContext.voiceAnalysis && (
              <div className="pt-4 border-t space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Voice Analysis
                    </p>
                    {businessContext.voiceAnalysis.influencerName && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Inspired by {businessContext.voiceAnalysis.influencerName}'s writing style
                        {businessContext.voiceAnalysis.analyzedFrom === 'influencer' ? ' (Influencer)' : ' (Your Posts)'}
                      </p>
                    )}
                  </div>
                  {businessContext.voiceAnalysis.lastUpdated && (
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(businessContext.voiceAnalysis.lastUpdated)}
                    </Badge>
                  )}
                </div>

                {businessContext.voiceAnalysis.writingStyle && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Writing Style</p>
                    <p className="text-sm leading-relaxed">{businessContext.voiceAnalysis.writingStyle}</p>
                  </div>
                )}

                {businessContext.voiceAnalysis.personality && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Personality</p>
                    <p className="text-sm leading-relaxed">{businessContext.voiceAnalysis.personality}</p>
                  </div>
                )}

                {businessContext.voiceAnalysis.postStructure && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Post Structure</p>
                    <p className="text-sm leading-relaxed">{businessContext.voiceAnalysis.postStructure}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Website Link */}
        {websiteUrl && (
          <div className="pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              asChild
            >
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Visit Website
              </a>
            </Button>
          </div>
        )}

        {!businessContext && websiteUrl && !isLoading && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Website analysis pending. We'll extract your Your Persona soon.
            </p>
          </div>
        )}
          </>
        )}
      </CardContent>
    </Card>

    <EditBusinessContextDialog
      open={editDialogOpen}
      onOpenChange={setEditDialogOpen}
      businessContext={businessContext}
      profession={profession}
      designation={designation}
      websiteUrl={websiteUrl}
    />
    </>
  )
}
