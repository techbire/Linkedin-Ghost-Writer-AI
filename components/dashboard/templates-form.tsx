"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Loader2, RefreshCw, FileText, Zap, Plus, ChevronLeft, ChevronRight, Sparkles, Eye, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface TemplatesFormProps {
  userId: string
}

export function TemplatesForm({ userId }: TemplatesFormProps) {
  const [topic, setTopic] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedContent, setEditedContent] = useState("")
  
  // Writing Template Data
  const [writingTemplates, setWritingTemplates] = useState<any[]>([])
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0)
  const [writingTemplate, setWritingTemplate] = useState<any>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  // Preset Templates Data
  const [presetTemplates, setPresetTemplates] = useState<any[]>([])
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<string | null>(null)
  const [isLoadingPresets, setIsLoadingPresets] = useState(false)
  
  // Add Template Dialog State
  const [showAddTemplateDialog, setShowAddTemplateDialog] = useState(false)
  const [templatePersonName, setTemplatePersonName] = useState("")
  const [templatePosts, setTemplatePosts] = useState("")
  const [isAnalyzingTemplate, setIsAnalyzingTemplate] = useState(false)
  
  // Preset Template Dialog State
  const [showPresetDialog, setShowPresetDialog] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<any>(null)
  
  // Test Generation Dialog State
  const [showTestGenerationDialog, setShowTestGenerationDialog] = useState(false)
  
  // Refinement prompt state
  const [refinementPrompt, setRefinementPrompt] = useState("")
  const [isRefining, setIsRefining] = useState(false)
  const [showRefinementInput, setShowRefinementInput] = useState(false)
  
  const { toast } = useToast()
  const router = useRouter()

  // Load user's writing templates
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoadingData(true)
        const response = await fetch(`/api/user-subscription?user_id=${userId}`)
        const data = await response.json()
        
        let allTemplates: any[] = []
        
        // Only load templates from writing_templates table (user-defined templates)
        // Do NOT include LinkedIn-scraped voice analysis from business_context
        if (data.templates && data.templates.length > 0) {
          allTemplates = data.templates.map((t: any) => ({
            id: t.id,
            personName: t.person_name,
            openingPattern: t.opening_pattern,
            contentStructure: t.content_structure,
            ctaPattern: t.cta_pattern,
            commonElements: t.common_elements,
            generalTemplate: t.general_template,
            credibilityPattern: t.credibility_pattern,
            engagementPattern: t.engagement_pattern,
            exampleTemplate: t.example_template,
            analyzedAt: t.analyzed_at || t.created_at,
            postsAnalyzed: t.posts_analyzed
          }))
        }
        // Removed: LinkedIn voice analysis is NOT shown in User Defined Templates
        // It's only shown in "Your Persona" section
        
        setWritingTemplates(allTemplates)
        if (allTemplates.length > 0) {
          setCurrentTemplateIndex(0)
          setWritingTemplate(allTemplates[0])
        } else {
          setWritingTemplate(null)
        }
      } catch (error) {
        console.error('Failed to load templates:', error)
        toast({
          title: "Error",
          description: "Failed to load your templates",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    loadUserData()
  }, [userId, toast])

  // Load preset templates
  useEffect(() => {
    const loadPresetTemplates = async () => {
      try {
        setIsLoadingPresets(true)
        const response = await fetch('/api/preset-templates')
        if (!response.ok) throw new Error('Failed to load preset templates')
        
        const data = await response.json()
        setPresetTemplates(data.templates || [])
      } catch (error) {
        console.error('Failed to load preset templates:', error)
        // Don't show error toast for presets, just log it
      } finally {
        setIsLoadingPresets(false)
      }
    }

    loadPresetTemplates()
  }, [])

  const handlePreviousTemplate = () => {
    const newIndex = currentTemplateIndex + 1
    if (newIndex < writingTemplates.length) {
      setCurrentTemplateIndex(newIndex)
      setWritingTemplate(writingTemplates[newIndex])
      toast({
        title: "Template Changed",
        description: `Viewing template ${newIndex + 1} of ${writingTemplates.length}`,
      })
    }
  }

  const handleNextTemplate = () => {
    const newIndex = currentTemplateIndex - 1
    if (newIndex >= 0) {
      setCurrentTemplateIndex(newIndex)
      setWritingTemplate(writingTemplates[newIndex])
      toast({
        title: "Template Changed",
        description: `Viewing template ${newIndex + 1} of ${writingTemplates.length}`,
      })
    }
  }

  const handleAnalyzeTemplate = async () => {
    if (!templatePersonName.trim() || !templatePosts.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both person name and LinkedIn posts",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzingTemplate(true)

    try {
      const response = await fetch("/api/analyze-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          personName: templatePersonName,
          posts: templatePosts,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze template")
      }

      const data = await response.json()
      
      toast({
        title: "Success!",
        description: `Writing template for ${templatePersonName} has been created`,
      })
      
      setShowAddTemplateDialog(false)
      setTemplatePersonName("")
      setTemplatePosts("")
      
      router.refresh()
      window.location.reload()
    } catch (error: any) {
      console.error("Template analysis error:", error)
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzingTemplate(false)
    }
  }

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic to generate content about",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedContent("")
    setIsEditMode(false)

    try {
      console.log("=" .repeat(80))
      console.log("[Templates Form] 🎯 GENERATING WITH TEMPLATE:")
      console.log("[Templates Form] Topic:", topic)
      console.log("[Templates Form] User ID:", userId)
      console.log("[Templates Form] Template Present:", !!writingTemplate)
      if (writingTemplate) {
        console.log("[Templates Form] - Template Person:", writingTemplate.personName)
        console.log("[Templates Form] - Is Preset:", writingTemplate.isPreset || false)
        console.log("[Templates Form] - Category:", writingTemplate.category || "User-Defined")
        console.log("[Templates Form] - Has Opening Pattern:", !!writingTemplate.openingPattern)
        console.log("[Templates Form] - Has General Template:", !!writingTemplate.generalTemplate)
      }
      console.log("=".repeat(80))
      
      const response = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          contentType: "Story",
          userId,
          useProfileData: true,
          writingTemplate: writingTemplate,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to generate post" }))
        console.error("API Error Response:", response.status, errorData)
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      console.log("Post generated successfully")
      setGeneratedContent(data.content)
      setEditedContent(data.content)
      
      toast({
        title: "Success!",
        description: "Post generated successfully",
      })
    } catch (error: any) {
      console.error("Generation error:", error)
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRefine = async () => {
    if (!refinementPrompt.trim()) {
      toast({
        title: "Refinement Prompt Required",
        description: "Please provide refinement instructions",
        variant: "destructive",
      })
      return
    }

    setIsRefining(true)

    try {
      const response = await fetch("/api/refine-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalPost: isEditMode ? editedContent : generatedContent,
          refinementPrompt,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to refine post")
      }

      const data = await response.json()
      setGeneratedContent(data.content)
      setEditedContent(data.content)
      setShowRefinementInput(false)
      setRefinementPrompt("")
      
      toast({
        title: "Success!",
        description: "Post refined successfully",
      })
    } catch (error: any) {
      console.error("Refinement error:", error)
      toast({
        title: "Refinement Failed",
        description: error.message || "Failed to refine post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefining(false)
    }
  }

  const handleCopyToClipboard = () => {
    const contentToCopy = isEditMode ? editedContent : generatedContent
    navigator.clipboard.writeText(contentToCopy)
    toast({
      title: "Copied!",
      description: "Post content copied to clipboard",
    })
  }

  const handleSaveToLibrary = async () => {
    try {
      const contentToSave = isEditMode ? editedContent : generatedContent
      
      if (!contentToSave.trim()) {
        toast({
          title: "Error",
          description: "No content to save",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: contentToSave,
          tone: "Standard",
          status: "draft",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save post")
      }

      const data = await response.json()
      
      toast({
        title: "✅ Saved to Library",
        description: "Post saved successfully as draft",
      })

      // Optionally redirect to posts library
      // router.push('/dashboard')
    } catch (error: any) {
      console.error("Save error:", error)
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save post. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Get unique categories from preset templates
  const categories = Array.from(new Set(presetTemplates.map((t: any) => t.category)))

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div>
        <h2 className="text-3xl font-bold tracking-tight">Writing Templates</h2>
        <p className="text-muted-foreground mt-2">
          Manage your writing templates and test post generation
        </p>
      </div> */}

      {/* Templates Section - Full Width */}
      <div className="space-y-6">
        <Tabs defaultValue="user-defined" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="user-defined" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              User Defined
            </TabsTrigger>
            <TabsTrigger value="preset" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Preset Templates
            </TabsTrigger>
          </TabsList>

          {/* User Defined Templates Tab */}
          <TabsContent value="user-defined" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      User Defined Template
                    </CardTitle>
                    <CardDescription>
                      Your post structure and patterns
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddTemplateDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
            {writingTemplate ? (
              <div className="space-y-3">
                {/* Template Navigation */}
                {writingTemplates.length > 1 && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePreviousTemplate}
                      disabled={currentTemplateIndex >= writingTemplates.length - 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Template {currentTemplateIndex + 1} of {writingTemplates.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNextTemplate}
                      disabled={currentTemplateIndex <= 0}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {writingTemplate.personName && (
                  <div>
                    <Label className="text-sm font-medium">Inspired by</Label>
                    <p className="text-sm text-muted-foreground font-semibold">{writingTemplate.personName}</p>
                  </div>
                )}
                {writingTemplate.analyzedAt && (
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-xs text-muted-foreground">
                      {new Date(writingTemplate.analyzedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium">Opening Pattern</Label>
                  <p className="text-sm text-muted-foreground">{writingTemplate.openingPattern || 'Not defined'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Content Structure</Label>
                  <p className="text-sm text-muted-foreground">{writingTemplate.contentStructure || 'Not defined'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">CTA Pattern</Label>
                  <p className="text-sm text-muted-foreground">{writingTemplate.ctaPattern || 'Not defined'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Common Elements</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {writingTemplate.commonElements?.slice(0, 6).map((element: string, index: number) => (
                      <Badge key={index} variant="outline">{element}</Badge>
                    )) || <p className="text-sm text-muted-foreground">No common elements found</p>}
                  </div>
                </div>
                
                {/* Use Template Button */}
                <Button
                  onClick={() => {
                    console.log("=".repeat(80))
                    console.log("[Templates Form] 🚀 USE TEMPLATE CLICKED - USER DEFINED")
                    console.log("[Templates Form] User ID:", userId)
                    console.log("[Templates Form] Template:", writingTemplate.personName)
                    console.log("=".repeat(80))
                    
                    const selectedTemplate = {
                      personName: writingTemplate.personName,
                      openingPattern: writingTemplate.openingPattern,
                      contentStructure: writingTemplate.contentStructure,
                      ctaPattern: writingTemplate.ctaPattern,
                      commonElements: writingTemplate.commonElements,
                      generalTemplate: writingTemplate.generalTemplate,
                      exampleTemplate: writingTemplate.exampleTemplate,
                      credibilityPattern: writingTemplate.credibilityPattern,
                      engagementPattern: writingTemplate.engagementPattern,
                      isPreset: false
                    }
                    
                    console.log("[Templates Form] ✅ Template object created")
                    
                    // Store template in sessionStorage
                    sessionStorage.setItem('selectedTemplate', JSON.stringify(selectedTemplate))
                    sessionStorage.setItem('selectedTemplateUserId', userId)
                    
                    console.log("[Templates Form] 🔗 Navigating to generate page")
                    
                    router.push('/generate-with-template')
                    
                    toast({
                      title: "✅ Template Selected",
                      description: `Opening generation page for "${writingTemplate.personName}"`,
                    })
                  }}
                  className="w-full mt-4"
                  size="lg"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Use Template
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No writing template found. Click "Add Template" to create one.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          {/* Preset Templates Tab */}
          <TabsContent value="preset" className="mt-4">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Choose a category to see available templates
              </div>

              {isLoadingPresets ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading preset templates...</span>
                </div>
              ) : selectedPresetCategory ? (
                // Show templates for selected category
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedPresetCategory(null)}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back to Categories
                    </Button>
                    <Badge variant="outline" className="text-sm">
                      {selectedPresetCategory}
                    </Badge>
                  </div>
                  
                  {/* Grid layout for preset templates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {presetTemplates
                      .filter((t: any) => t.category === selectedPresetCategory)
                      .map((template: any) => (
                        <Card 
                          key={template.id} 
                          className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                                  {template.title}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                  Updated {new Date(template.updated_at || template.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {template.description}
                            </p>
                            
                            {/* Template features */}
                            <div className="flex flex-wrap gap-1.5">
                              {template.opening_pattern && (
                                <Badge variant="secondary" className="text-xs">Opening</Badge>
                              )}
                              {template.content_structure && (
                                <Badge variant="secondary" className="text-xs">Structure</Badge>
                              )}
                              {template.example_template && (
                                <Badge variant="secondary" className="text-xs">Example</Badge>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex-1"
                                onClick={() => {
                                  setSelectedPreset(template)
                                  setShowPresetDialog(true)
                                }}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                Preview
                              </Button>
                              <Button 
                                size="sm"
                                className="flex-1 bg-primary hover:bg-primary/90"
                                onClick={(e) => {
                                  e.preventDefault();
                                  console.log("=".repeat(80))
                                  console.log("[Templates Form] 📋 PRESET TEMPLATE SELECTED:")
                                  console.log("[Templates Form] Template ID:", template.id)
                                  console.log("[Templates Form] Title:", template.title)
                                  console.log("[Templates Form] Category:", template.category)
                                  console.log("[Templates Form] User ID:", userId)
                                  console.log("=".repeat(80))
                                  
                                  const selectedTemplate = {
                                    title: template.title,
                                    personName: template.title,
                                    openingPattern: template.opening_pattern,
                                    contentStructure: template.content_structure,
                                    ctaPattern: template.cta_pattern,
                                    commonElements: template.common_elements,
                                    generalTemplate: template.general_template,
                                    exampleTemplate: template.example_template,
                                    credibilityPattern: template.credibility_pattern,
                                    engagementPattern: template.engagement_pattern,
                                    isPreset: true,
                                    category: template.category
                                  }
                                  
                                  console.log("[Templates Form] ✅ Template object created")
                                  
                                  // Store template in sessionStorage to avoid URL length issues
                                  sessionStorage.setItem('selectedTemplate', JSON.stringify(selectedTemplate))
                                  sessionStorage.setItem('selectedTemplateUserId', userId)
                                  
                                  console.log("[Templates Form] 🔗 Navigating to generate page")
                                  
                                  router.push('/generate-with-template')
                                  
                                  toast({
                                    title: "✅ Template Selected",
                                    description: `Opening generation page for "${template.title}"`,
                                  })
                                }}
                              >
                                <Zap className="h-3.5 w-3.5 mr-1.5" />
                                Use Template
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              ) : (
                // Show category cards
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => {
                    const categoryTemplates = presetTemplates.filter((t: any) => t.category === category)
                    const templateCount = categoryTemplates.length
                    const template = categoryTemplates[0] // Get first template of category for preview
                    
                    return (
                      <Card 
                        key={category} 
                        className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary"
                        onClick={() => setSelectedPresetCategory(category)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <CardTitle className="text-base group-hover:text-primary transition-colors">
                                {category}
                              </CardTitle>
                              <Badge variant="outline" className="text-xs w-fit">
                                {templateCount} {templateCount === 1 ? 'Template' : 'Templates'}
                              </Badge>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Professional templates</span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Template Dialog */}
      <Dialog open={showAddTemplateDialog} onOpenChange={setShowAddTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Writing Template</DialogTitle>
            <DialogDescription>
              Paste LinkedIn posts from any creator to analyze their writing style and create a template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="personName">Person Name</Label>
              <Input
                id="personName"
                placeholder="e.g., Justin Welsh, Alex Hormozi"
                value={templatePersonName}
                onChange={(e) => setTemplatePersonName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="posts">LinkedIn Posts (3-5 posts)</Label>
              <Textarea
                id="posts"
                placeholder="Paste 3-5 LinkedIn posts here, separated by line breaks..."
                value={templatePosts}
                onChange={(e) => setTemplatePosts(e.target.value)}
                rows={12}
              />
              <p className="text-xs text-muted-foreground">
                Paste full LinkedIn posts including text content. The AI will analyze the writing patterns.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddTemplateDialog(false)
                setTemplatePersonName("")
                setTemplatePosts("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAnalyzeTemplate}
              disabled={isAnalyzingTemplate || !templatePersonName.trim() || !templatePosts.trim()}
            >
              {isAnalyzingTemplate ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Create Template"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preset Template Details Dialog */}
      <Dialog open={showPresetDialog} onOpenChange={setShowPresetDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPreset?.category}</DialogTitle>
            <DialogDescription>
              {selectedPreset?.title}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPreset && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedPreset.description}</p>
              </div>
              
              {selectedPreset.general_template && (
                <div>
                  <Label className="text-sm font-medium">General Template</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedPreset.general_template}</p>
                </div>
              )}
              
              {selectedPreset.opening_pattern && (
                <div>
                  <Label className="text-sm font-medium">Opening Pattern</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedPreset.opening_pattern}</p>
                </div>
              )}
              
              {selectedPreset.content_structure && (
                <div>
                  <Label className="text-sm font-medium">Content Structure</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedPreset.content_structure}</p>
                </div>
              )}
              
              {selectedPreset.cta_pattern && (
                <div>
                  <Label className="text-sm font-medium">CTA Pattern</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedPreset.cta_pattern}</p>
                </div>
              )}
              
              {selectedPreset.common_elements && selectedPreset.common_elements.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Common Elements</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedPreset.common_elements.map((element: string, index: number) => (
                      <Badge key={index} variant="outline">{element}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedPreset.example_template && (
                <div>
                  <Label className="text-sm font-medium">Example Template</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap font-sans">{selectedPreset.example_template}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPresetDialog(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                const selectedTemplate = {
                  title: selectedPreset?.title,
                  personName: selectedPreset?.title,
                  openingPattern: selectedPreset?.opening_pattern,
                  contentStructure: selectedPreset?.content_structure,
                  ctaPattern: selectedPreset?.cta_pattern,
                  commonElements: selectedPreset?.common_elements,
                  generalTemplate: selectedPreset?.general_template,
                  exampleTemplate: selectedPreset?.example_template,
                  credibilityPattern: selectedPreset?.credibility_pattern,
                  engagementPattern: selectedPreset?.engagement_pattern,
                  isPreset: true,
                  category: selectedPreset?.category
                }
                
                setShowPresetDialog(false)
                
                // Store template in sessionStorage to avoid URL length issues
                sessionStorage.setItem('selectedTemplate', JSON.stringify(selectedTemplate))
                sessionStorage.setItem('selectedTemplateUserId', userId)
                
                router.push('/generate-with-template')
                
                toast({
                  title: "Template Selected",
                  description: `Opening generation page for "${selectedPreset?.title || selectedPreset?.category}"`,
                })
              }}
            >
              Use This Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Post Generation Dialog */}
      <Dialog open={showTestGenerationDialog} onOpenChange={setShowTestGenerationDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Test Post Generation</DialogTitle>
            <DialogDescription>
              Generate a test post using the selected template
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Show selected template info */}
            {writingTemplate && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={writingTemplate.isPreset ? "default" : "secondary"} className="text-sm">
                      {writingTemplate.isPreset ? "Preset Template" : "Custom Template"}
                    </Badge>
                    <span className="font-semibold text-base">
                      {writingTemplate.personName || writingTemplate.title || writingTemplate.category || 'Selected Template'}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setWritingTemplate(null)
                      setShowTestGenerationDialog(false)
                      toast({
                        title: "Template Cleared",
                        description: "No template will be used for generation",
                      })
                    }}
                  >
                    Clear
                  </Button>
                </div>
                {writingTemplate.category && (
                  <p className="text-sm text-muted-foreground">
                    Category: {writingTemplate.category}
                  </p>
                )}
              </div>
            )}
            
            {/* Topic Input */}
            <div className="space-y-2">
              <Label htmlFor="test-topic" className="text-base font-medium">Topic or Main Idea</Label>
              <Textarea
                id="test-topic"
                placeholder="e.g., The importance of AI in modern business"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Generate Test Post
                </>
              )}
            </Button>

            {/* Generated Content */}
            {generatedContent && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Generated Post</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditMode(!isEditMode)
                        if (!isEditMode) {
                          setEditedContent(generatedContent)
                        }
                      }}
                    >
                      {isEditMode ? "Preview" : "Edit"}
                    </Button>
                  </div>
                </div>

                {isEditMode ? (
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={15}
                    className="font-mono text-sm"
                  />
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap text-sm">{generatedContent}</p>
                  </div>
                )}

                {/* Refinement Section */}
                {!showRefinementInput ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowRefinementInput(true)}
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refine Post
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor="refinement" className="text-sm font-medium">Refinement Instructions</Label>
                    <Textarea
                      id="refinement"
                      placeholder="e.g., Make it more professional, Add statistics, Shorter paragraphs..."
                      value={refinementPrompt}
                      onChange={(e) => setRefinementPrompt(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleRefine}
                        disabled={isRefining || !refinementPrompt.trim()}
                        className="flex-1"
                      >
                        {isRefining ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Refining...
                          </>
                        ) : (
                          "Apply Refinement"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowRefinementInput(false)
                          setRefinementPrompt("")
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCopyToClipboard}
                    className="w-full"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                  
                  <Button
                    onClick={handleSaveToLibrary}
                    className="w-full"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save to Library
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTestGenerationDialog(false)
                setGeneratedContent("")
                setTopic("")
                setShowRefinementInput(false)
                setRefinementPrompt("")
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
