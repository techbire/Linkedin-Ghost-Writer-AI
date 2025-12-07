"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Sparkles, Loader2, Eye, Edit, Download, ChevronLeft, ChevronRight, ImageIcon, Wand2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCredits } from "@/hooks/use-credits"

const themes = [
  { id: "professional", name: "Professional", primary: "#2563EB", secondary: "#1E40AF" },
  { id: "bold", name: "Bold", primary: "#DC2626", secondary: "#991B1B" },
  { id: "minimal", name: "Minimal", primary: "#374151", secondary: "#1F2937" },
  { id: "vibrant", name: "Vibrant", primary: "#7C3AED", secondary: "#5B21B6" },
  { id: "nature", name: "Nature", primary: "#059669", secondary: "#047857" },
  { id: "sunset", name: "Sunset", primary: "#F59E0B", secondary: "#D97706" },
]

const designStyles = [
  { 
    id: "modern-gradient", 
    name: "Modern Gradient", 
    description: "Gradient background with geometric shapes",
    prompt: "Use vibrant gradient background (diagonal top-left to bottom-right). Add large, semi-transparent geometric shapes (circles, hexagons) floating. White text with drop shadows. Modern sans-serif typography (Poppins). Slide number in top-right with subtle badge. Clean white card overlays for content sections."
  },
  { 
    id: "minimalist-bold", 
    name: "Minimalist Bold", 
    description: "Bold typography with clean layout",
    prompt: "Pure solid color background (no gradients). One accent color only. EXTRA LARGE bold typography for headline (72pt+). Maximum white space. Single thin line separator. Slide number bottom-right. Ultra-minimal - text and space only, NO shapes or decorations."
  },
  { 
    id: "abstract-shapes", 
    name: "Abstract Shapes", 
    description: "Geometric patterns and dynamic composition",
    prompt: "Background filled with overlapping irregular shapes (triangles, polygons, organic blobs). Asymmetric composition. Multiple contrasting colors (5+ colors). Text in white boxes with high contrast. Playful, energetic feel. Slide number integrated into a shape element."
  },
  { 
    id: "professional-grid", 
    name: "Professional Grid", 
    description: "Grid-based layout with clean lines",
    prompt: "Strict 12-column grid system visible with faint lines. Content aligned to grid. Sidebar color block (20% width) on left with slide number. Main content in grid cells. Monochromatic color scheme. Sharp corners. Business-formal aesthetic. Typography: IBM Plex or similar."
  },
  { 
    id: "gradient-mesh", 
    name: "Gradient Mesh", 
    description: "Smooth gradient mesh with flowing colors",
    prompt: "Smooth multi-point gradient mesh (4+ color stops creating organic flow). Blur effects throughout. Glassmorphism style - frosted glass panels for content. Soft rounded corners (24px+). Dreamy, ethereal aesthetic. Light typography. Slide number in frosted bubble."
  },
  { 
    id: "tech-inspired", 
    name: "Tech Inspired", 
    description: "Digital elements with futuristic feel",
    prompt: "Dark background (navy/black). Neon accent lines (cyan, magenta). Circuit board patterns or dot matrix. Monospace font for numbers. Futuristic HUD-style elements. Glowing effects. Small tech icons (chip, network). Slide number in hexagon with glow. Sci-fi aesthetic."
  },
  { 
    id: "creative-asymmetric", 
    name: "Creative Asymmetric", 
    description: "Asymmetric layout with dynamic composition",
    prompt: "Break all symmetry - diagonal splits (30/70 ratio). Rotated text elements (5-15 degrees). Cut-off shapes extending beyond frame. Layered paper-cut style. Bold contrasting colors. Dynamic tension. Text at unexpected angles. Slide number rotated 90 degrees on edge."
  },
  { 
    id: "elegant-minimal", 
    name: "Elegant Minimal", 
    description: "Refined typography with sophistication",
    prompt: "Luxury aesthetic - cream/beige background. Serif typography (Playfair, Cormorant). Gold or rose gold accent lines (1px thin). Centered layout. Generous margins (15% on all sides). Subtle texture (linen, paper grain). Small elegant flourish/ornament. Slide number in small serif font bottom center."
  },
  { 
    id: "bold-statement", 
    name: "Bold Statement", 
    description: "Large typography with strong visual impact",
    prompt: "Headline dominates 60% of space - HUGE bold type (100pt+). High contrast (black on yellow, white on red). Brutalist design - no rounded corners, harsh edges. Condensed sans-serif font. Minimal body text. Impact over elegance. Slide number oversized in corner (48pt)."
  },
  { 
    id: "layered-depth", 
    name: "Layered Depth", 
    description: "Layered design with 3D-inspired composition",
    prompt: "Multiple layers with strong shadows creating 3D depth. Elevated cards at different Z-levels. Isometric or 3D perspective elements. Long drop shadows (45-degree angle). Skeuomorphic details. Rich depth cues. Color layers stacked. Slide number on floating ribbon with shadow."
  }
]

const tones = [
  "Standard (authoritative)",
  "Witty",
  "Expert",
  "Casual",
  "Inspirational",
  "Storytelling",
  "Data-driven",
]

const contentTypes = [
  "Story",
  "Steps",
  "Lists",
]

const hooks = {
  Curiosity: [
    "You're doing this completely wrong…",
    "Nobody talks about this, but it changes everything.",
    "Watch what happens when I try this for the first time…",
    "What if you could [achieve result] without [pain point]?",
    "Most people don't know this secret about [topic]…",
    "Here's what I learned after 30 days of doing [X].",
    "The results were not what I expected…",
    "Everyone's doing this wrong—here's how to fix it.",
    "Wait—why does nobody teach this?",
    "I ran this experiment so you don't have to.",
  ],
  Value: [
    "Here's how to do [X] in under 10 minutes.",
    "Save this if you want to [achieve outcome].",
    "Don't scroll—this will change how you [task].",
    "This tool saved me hours every week.",
    "The one tip that made everything click…",
    "Steal my exact process for [outcome]…",
    "These 3 things boosted my [result] instantly.",
    "This shortcut is too good to gatekeep.",
    "How to go viral using just your phone.",
    "Here's a checklist I wish I had when I started.",
  ],
  Shock: [
    "I was today years old when I learned this.",
    "This shouldn't have worked… but it did.",
    "I made this one mistake and it cost me $5,000.",
    "No one warned me about this.",
    "This trend got me banned—here's why.",
    "This is going to sound insane, but hear me out…",
    "I can't believe I'm posting this…",
    "This might be controversial, but…",
    "It's wild how easy this is (once you know the trick).",
    "Every expert I follow got this wrong.",
  ],
  Relatability: [
    "Tell me you're a [blank] without telling me…",
    "POV: You just opened your laptop and instantly forgot why.",
    "If you've ever said 'I'll start tomorrow,' this is for you.",
    "This is your sign to stop overthinking it.",
    "Raise your hand if this has happened to you 🙋‍♀️",
    "If this is you, you're not alone.",
    "You're not the only one who [common struggle].",
    "Let's be real—nobody talks about this part.",
    "When you pretend everything's fine but your calendar says otherwise.",
    "The 'I can fix it' phase… yeah, we've all been there.",
  ],
  FOMO: [
    "If you're not doing this in 2025, you're already behind.",
    "You have 48 hours to jump on this trend.",
    "This trend is peaking—don't miss it.",
    "Here's what everyone will be doing next month.",
    "Mark my words, this is about to blow up.",
    "Every creator is talking about this—are you?",
    "The clock is ticking—this only works right now.",
    "Your competitors already know this—do you?",
    "This strategy won't work in 6 months.",
    "This is your chance to get in before it's saturated.",
  ],
}

export default function CarouselPage() {
  const { toast } = useToast()
  const { credits } = useCredits()
  
  // Form state
  const [topic, setTopic] = useState("")
  const [tone, setTone] = useState("Standard (authoritative)")
  const [contentType, setContentType] = useState("Story")
  const [selectedHook, setSelectedHook] = useState("")
  const [hooksDialogOpen, setHooksDialogOpen] = useState(false)
  const [selectedHookCategory, setSelectedHookCategory] = useState<keyof typeof hooks | null>(null)
  
  // Topic ideas state
  const [topicIdeasDialogOpen, setTopicIdeasDialogOpen] = useState(false)
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false)
  const [topicIdeas, setTopicIdeas] = useState<string[]>([])
  
  // Carousel settings
  const [slideCount, setSlideCount] = useState(5)
  const [selectedTheme, setSelectedTheme] = useState(themes[0])
  const [customPrimary, setCustomPrimary] = useState(themes[0].primary)
  const [customSecondary, setCustomSecondary] = useState(themes[0].secondary)
  const [selectedDesignStyle, setSelectedDesignStyle] = useState(designStyles[0].id)
  
  // Generation state
  const [generationStep, setGenerationStep] = useState<"idle" | "draft" | "editing" | "generating-images" | "complete">("idle")
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false)
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [draftSlides, setDraftSlides] = useState<Array<{ title: string; content: string }>>([])
  const [generatedSlides, setGeneratedSlides] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [savedPostId, setSavedPostId] = useState<string | null>(null)
  
  // Regenerate specific slide state
  const [regeneratePrompt, setRegeneratePrompt] = useState("")
  const [isRegeneratingSlide, setIsRegeneratingSlide] = useState(false)
  const [showRegenerateInput, setShowRegenerateInput] = useState(false)
  
  // Design style modal state
  const [designStyleDialogOpen, setDesignStyleDialogOpen] = useState(false)

  const creditsNeeded = slideCount * 5 + 2
  const hasEnoughCredits = credits >= creditsNeeded

  // Generate topic ideas using AI
  const handleGenerateTopicIdeas = async () => {
    setIsGeneratingTopics(true)
    setTopicIdeasDialogOpen(true)
    
    try {
      const response = await fetch("/api/generate-topic-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          tone,
          currentTopic: topic.trim(), // Pass current topic as context
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate topic ideas")
      }

      const data = await response.json()
      setTopicIdeas(data.topicIdeas)
    } catch (error: any) {
      toast({
        title: "Failed to generate topic ideas",
        description: error.message || "Please try again",
        variant: "destructive",
      })
      setTopicIdeasDialogOpen(false)
    } finally {
      setIsGeneratingTopics(false)
    }
  }

  const handleSelectTopic = (selectedTopic: string) => {
    setTopic(selectedTopic)
    setTopicIdeasDialogOpen(false)
    toast({
      title: "Topic selected!",
      description: "You can now generate your carousel",
    })
  }

  // PHASE 1: Generate text draft only
  const handleGenerateDraft = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for your carousel",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingDraft(true)
    setGenerationStep("draft")

    try {
      const response = await fetch("/api/generate-carousel-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          tone,
          contentType,
          hook: selectedHook,
          slideCount,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate draft")
      }

      const data = await response.json()
      setDraftSlides(data.slides)
      setGenerationStep("editing")
      setSavedPostId(null)

      toast({
        title: "Draft generated!",
        description: "Edit the first slide to set the template, then generate images.",
      })
    } catch (error: any) {
      toast({
        title: "Draft generation failed",
        description: error.message || "Failed to generate draft",
        variant: "destructive",
      })
      setGenerationStep("idle")
    } finally {
      setIsGeneratingDraft(false)
    }
  }

  // PHASE 3 & 4: Generate images progressively using first slide as context
  const handleGenerateImages = async () => {
    if (draftSlides.length === 0) {
      toast({
        title: "No draft available",
        description: "Generate a draft first",
        variant: "destructive",
      })
      return
    }

    if (!hasEnoughCredits) {
      toast({
        title: "Insufficient credits",
        description: `You need ${creditsNeeded} credits to generate images.`,
        variant: "destructive",
      })
      return
    }

    setIsGeneratingImages(true)
    setGenerationStep("generating-images")

    try {
      const response = await fetch("/api/generate-carousel-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slides: draftSlides,
          designStyle: selectedDesignStyle,
          theme: {
            primary: customPrimary,
            secondary: customSecondary,
          },
          slideCount: draftSlides.length,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate images")
      }

      const data = await response.json()
      setImageUrls(data.imageUrls)
      setGeneratedSlides(draftSlides.map((s: any) => `${s.title}\n\n${s.content}`))
      setCurrentSlideIndex(0)
      setGenerationStep("complete")

      toast({
        title: "Carousel complete!",
        description: `Generated ${data.imageUrls.length} images. Used ${data.creditsUsed} credits.`,
      })
    } catch (error: any) {
      toast({
        title: "Image generation failed",
        description: error.message || "Failed to generate images",
        variant: "destructive",
      })
      setGenerationStep("editing")
    } finally {
      setIsGeneratingImages(false)
    }
  }

  const handleGenerate = handleGenerateDraft // Legacy compatibility

  const handleSlideEdit = (index: number, field: "title" | "content", newValue: string) => {
    const updated = [...draftSlides]
    updated[index] = { ...updated[index], [field]: newValue }
    setDraftSlides(updated)
  }

  const handleDownload = () => {
    if (imageUrls.length === 0) {
      toast({
        title: "No images available",
        description: "Images are still being generated or unavailable",
        variant: "destructive",
      })
      return
    }

    // Download all images
    imageUrls.forEach((url, index) => {
      const link = document.createElement("a")
      link.href = url
      link.download = `carousel-slide-${index + 1}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })

    toast({
      title: "Download started",
      description: `Downloading ${imageUrls.length} slides`,
    })
  }

  const handleSaveToLibrary = async () => {
    if (generatedSlides.length === 0 || imageUrls.length === 0) {
      toast({
        title: "Nothing to save",
        description: "Generate a carousel first",
        variant: "destructive",
      })
      return
    }

    if (savedPostId) {
      toast({
        title: "Already saved",
        description: "This carousel is already in your Post Library",
      })
      return
    }

    setIsSaving(true)

    try {
      console.log("Calling save-carousel API...")
      console.log("Slides:", generatedSlides.length)
      console.log("Images:", imageUrls.length)

      const response = await fetch("/api/save-carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slides: generatedSlides,
          imageUrls: imageUrls,
          tone: tone,
          theme: {
            primary: customPrimary,
            secondary: customSecondary,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save carousel")
      }

      console.log("Save response:", data)

      // Update image URLs to storage URLs and save post ID
      if (data.imageUrls) {
        setImageUrls(data.imageUrls)
      }
      setSavedPostId(data.postId)

      toast({
        title: "Success! 🎉",
        description: "Carousel saved to your Post Library",
      })
    } catch (error: any) {
      console.error("Save error:", error)
      toast({
        title: "Failed to save",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Regenerate a specific slide with user feedback
  const handleRegenerateSlide = async () => {
    if (!regeneratePrompt.trim()) {
      toast({
        title: "Feedback required",
        description: "Please describe what needs to be fixed in this slide",
        variant: "destructive",
      })
      return
    }

    setIsRegeneratingSlide(true)

    try {
      const response = await fetch("/api/regenerate-carousel-slide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slideIndex: currentSlideIndex,
          slideContent: draftSlides[currentSlideIndex],
          feedback: regeneratePrompt,
          referenceSlide: draftSlides[0], // First slide text for reference
          theme: {
            primary: customPrimary,
            secondary: customSecondary,
          },
          designStyle: selectedDesignStyle,
          totalSlides: imageUrls.length, // Pass total slide count for numbering
          currentSlideImageUrl: imageUrls[currentSlideIndex], // Pass CURRENT slide image to modify
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to regenerate slide")
      }

      const data = await response.json()
      
      // Update the specific slide's image
      const updatedImageUrls = [...imageUrls]
      updatedImageUrls[currentSlideIndex] = data.imageUrl
      setImageUrls(updatedImageUrls)

      toast({
        title: "Slide regenerated! ✨",
        description: `Slide ${currentSlideIndex + 1} has been updated based on your feedback`,
      })

      setRegeneratePrompt("")
      setShowRegenerateInput(false)
    } catch (error: any) {
      toast({
        title: "Regeneration failed",
        description: error.message || "Failed to regenerate slide",
        variant: "destructive",
      })
    } finally {
      setIsRegeneratingSlide(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Carousel Generator</h1>
        <p className="text-muted-foreground mt-2">
          Create engaging LinkedIn carousel posts with AI-powered content and custom themes
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Settings</CardTitle>
              <CardDescription>Configure your carousel content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="topic">Topic *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateTopicIdeas}
                    disabled={isGeneratingTopics}
                  >
                    {isGeneratingTopics ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-3 w-3" />
                        Generate Ideas
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  id="topic"
                  placeholder="What's your carousel about?"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tone">Post Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contentType">Post Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger id="contentType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Hooks (Optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setHooksDialogOpen(true)}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  {selectedHook ? "Change Hook" : "Select a Hook"}
                </Button>
                {selectedHook && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm italic">"{selectedHook}"</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedHook("")}
                      className="mt-2 h-auto p-0 text-xs"
                    >
                      Clear hook
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Select a hook before generating to create a carousel around it
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Carousel Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Number of Slides: {slideCount}</Label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">3 to 10 slides</p>
              </div>

              <div className="space-y-2">
                <Label>Design Style</Label>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setDesignStyleDialogOpen(true)}
                >
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    <span>{designStyles.find(s => s.id === selectedDesignStyle)?.name || "Select Design Style"}</span>
                  </div>
                  <Badge variant="secondary">Change</Badge>
                </Button>
                <p className="text-xs text-muted-foreground">
                  {designStyles.find(s => s.id === selectedDesignStyle)?.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setSelectedTheme(theme)
                        setCustomPrimary(theme.primary)
                        setCustomSecondary(theme.secondary)
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedTheme.id === theme.id
                          ? "border-primary"
                          : "border-muted hover:border-muted-foreground"
                      }`}
                    >
                      <div className="flex gap-1 mb-1">
                        <div
                          className="h-4 flex-1 rounded"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <div
                          className="h-4 flex-1 rounded"
                          style={{ backgroundColor: theme.secondary }}
                        />
                      </div>
                      <p className="text-xs font-medium">{theme.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary">Primary Color</Label>
                  <input
                    id="primary"
                    type="color"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="w-full h-10 rounded border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary">Secondary Color</Label>
                  <input
                    id="secondary"
                    type="color"
                    value={customSecondary}
                    onChange={(e) => setCustomSecondary(e.target.value)}
                    className="w-full h-10 rounded border"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm font-medium">
                    {generationStep === "idle" && "Credits Required (Step 1: Draft is free)"}
                    {generationStep === "editing" && `Credits Required (Step 2: Images)`}
                    {generationStep === "complete" && "Carousel Complete"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You have {credits} credits
                  </p>
                </div>
                <Badge variant={hasEnoughCredits ? "default" : "destructive"}>
                  {creditsNeeded} credits
                </Badge>
              </div>

              {generationStep === "idle" && (
                <Button
                  onClick={handleGenerateDraft}
                  disabled={isGeneratingDraft}
                  className="w-full"
                  size="lg"
                >
                  {isGeneratingDraft ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Draft...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Step 1: Generate Text Draft
                    </>
                  )}
                </Button>
              )}

              {generationStep === "editing" && (
                <Button
                  onClick={handleGenerateImages}
                  disabled={isGeneratingImages || !hasEnoughCredits}
                  className="w-full"
                  size="lg"
                >
                  {isGeneratingImages ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Images...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Step 2: Generate Images ({creditsNeeded} credits)
                    </>
                  )}
                </Button>
              )}

              {(generationStep === "generating-images" || generationStep === "complete") && (
                <Button
                  onClick={handleGenerateImages}
                  disabled={isGeneratingImages}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  {isGeneratingImages ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Images...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Regenerate Images
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {generationStep === "idle" && "Preview"}
                {generationStep === "draft" && "Generating Draft..."}
                {generationStep === "editing" && "Draft Editor"}
                {generationStep === "generating-images" && "Generating Images..."}
                {generationStep === "complete" && "Carousel Complete"}
              </CardTitle>
              <CardDescription>
                {generationStep === "idle" && "Your carousel will appear here"}
                {generationStep === "editing" && draftSlides.length > 0 && `Slide ${currentSlideIndex + 1} of ${draftSlides.length} - Edit Slide 1 to set the template`}
                {generationStep === "complete" && imageUrls.length > 0 && `Slide ${currentSlideIndex + 1} of ${imageUrls.length}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* PHASE 2: Draft Editing Mode */}
              {generationStep === "editing" && draftSlides.length > 0 && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      📝 Step 2: Customize First Slide
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      The first slide sets the template for all others. Edit the title and content below, then generate images.
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-xs font-semibold text-amber-900 dark:text-amber-100 mb-1">
                      ✏️ Check Spelling & Grammar!
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Review all text carefully before generating images. The AI will copy text exactly as written, including any typos. Fix any errors now to avoid regenerating slides later.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="slide-title">Slide {currentSlideIndex + 1} Title</Label>
                      <Input
                        id="slide-title"
                        value={draftSlides[currentSlideIndex]?.title || ""}
                        onChange={(e) => handleSlideEdit(currentSlideIndex, "title", e.target.value)}
                        placeholder="Slide title"
                        className="font-semibold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slide-content">Slide {currentSlideIndex + 1} Content</Label>
                      <Textarea
                        id="slide-content"
                        value={draftSlides[currentSlideIndex]?.content || ""}
                        onChange={(e) => handleSlideEdit(currentSlideIndex, "content", e.target.value)}
                        rows={4}
                        placeholder="Slide content"
                      />
                    </div>

                    {currentSlideIndex === 0 && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded border border-amber-200 dark:border-amber-800">
                        <p className="text-xs text-amber-900 dark:text-amber-100">
                          ⭐ This is your template slide! The design, layout, and style will be applied to all other slides.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentSlideIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Badge variant="secondary">
                      Slide {currentSlideIndex + 1} / {draftSlides.length}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentSlideIndex((prev) => Math.min(draftSlides.length - 1, prev + 1))}
                      disabled={currentSlideIndex === draftSlides.length - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* PHASE 5: Complete Carousel with Images */}
              {generationStep === "complete" && imageUrls.length > 0 && (
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden relative">
                    <img
                      src={imageUrls[currentSlideIndex]}
                      alt={`Slide ${currentSlideIndex + 1}`}
                      className="w-full h-auto rounded"
                    />
                    {/* Loading overlay when regenerating current slide */}
                    {isRegeneratingSlide && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 rounded">
                        <Loader2 className="h-12 w-12 text-white animate-spin" />
                        <div className="text-center">
                          <p className="text-white font-semibold text-lg">
                            Regenerating Slide {currentSlideIndex + 1}...
                          </p>
                          <p className="text-white/80 text-sm mt-1">
                            Applying your feedback
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                      disabled={currentSlideIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <Badge variant="secondary">
                      {currentSlideIndex + 1} / {imageUrls.length}
                    </Badge>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentSlideIndex(Math.min(imageUrls.length - 1, currentSlideIndex + 1))}
                      disabled={currentSlideIndex === imageUrls.length - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Regenerate Slide Section */}
                  {showRegenerateInput ? (
                    <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            🔄 Regenerate Slide {currentSlideIndex + 1}
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            Describe what needs to be fixed. Be specific:
                          </p>
                          <ul className="text-xs text-blue-600 dark:text-blue-400 mt-2 space-y-1 ml-4 list-disc">
                            <li>For typos: "Fix typo: change 'recieve' to 'receive' in headline"</li>
                            <li>For colors: "Change white text to blue"</li>
                            <li>For layout: "Move title to center" or "Make headline bigger"</li>
                          </ul>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowRegenerateInput(false)
                            setRegeneratePrompt("")
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                      <Textarea
                        value={regeneratePrompt}
                        onChange={(e) => setRegeneratePrompt(e.target.value)}
                        placeholder="E.g., 'Fix spelling: headline should say receive not recieve' or 'Change white color to blue'"
                        rows={3}
                        className="resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleRegenerateSlide}
                          disabled={isRegeneratingSlide || !regeneratePrompt.trim()}
                          size="sm"
                          className="flex-1"
                        >
                          {isRegeneratingSlide ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Regenerating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Regenerate This Slide
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowRegenerateInput(false)
                            setRegeneratePrompt("")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRegenerateInput(true)}
                      className="w-full"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Fix This Slide (Regenerate with Prompt)
                    </Button>
                  )}

                  <div className="flex gap-2 justify-end pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSaveToLibrary}
                      disabled={isSaving || savedPostId !== null}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : savedPostId ? (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save to Library
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Download All
                    </Button>
                  </div>
                </div>
              )}

              {/* Idle State */}
              {generationStep === "idle" && (
                <div className="flex flex-col items-center justify-center h-[300px] text-center gap-4">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">No carousel generated yet</p>
                    <p className="text-xs text-muted-foreground">
                      Configure your settings and click "Generate Text Draft"
                    </p>
                  </div>
                </div>
              )}

              {/* Loading States */}
              {(generationStep === "draft" || generationStep === "generating-images") && (
                <div className="flex flex-col items-center justify-center h-[300px] text-center gap-4">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <div>
                    <p className="text-sm font-medium">
                      {generationStep === "draft" && "Generating text draft..."}
                      {generationStep === "generating-images" && "Generating images with consistent template..."}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {generationStep === "draft" && "This will only take a moment"}
                      {generationStep === "generating-images" && `Creating ${draftSlides.length} slides...`}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hooks Selection Dialog */}
      <Dialog open={hooksDialogOpen} onOpenChange={setHooksDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a Hook Category</DialogTitle>
            <DialogDescription>
              Select a category and pick a hook to make your carousel more engaging
            </DialogDescription>
          </DialogHeader>
          
          {!selectedHookCategory ? (
            <div className="grid grid-cols-1 gap-3">
              {Object.keys(hooks).map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  className="justify-start h-auto py-4"
                  onClick={() => setSelectedHookCategory(category as keyof typeof hooks)}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-semibold">{category}</div>
                    <div className="text-xs text-muted-foreground">
                      {hooks[category as keyof typeof hooks].length} hooks available
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedHookCategory(null)}
              >
                ← Back to categories
              </Button>
              <div className="space-y-2">
                {selectedHookCategory && hooks[selectedHookCategory].map((hook: string, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto py-3 text-left whitespace-normal"
                    onClick={() => {
                      setSelectedHook(hook)
                      setHooksDialogOpen(false)
                      setSelectedHookCategory(null)
                    }}
                  >
                    <span className="text-sm italic">"{hook}"</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Topic Ideas Dialog */}
      <Dialog open={topicIdeasDialogOpen} onOpenChange={setTopicIdeasDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI-Generated Topic Ideas
              </div>
            </DialogTitle>
            <DialogDescription>
              {topic.trim() 
                ? `Expanding on: "${topic.trim().slice(0, 60)}${topic.trim().length > 60 ? '...' : ''}"`
                : "Click on any topic to use it for your carousel"
              }
            </DialogDescription>
          </DialogHeader>
          
          {isGeneratingTopics ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <div className="text-center">
                <p className="text-sm font-medium">Generating topic ideas...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {topic.trim() 
                    ? `Building on your idea with ${contentType} content`
                    : `Creating ${contentType} content with ${tone} tone`
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {topic.trim() && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                  <p className="text-xs text-blue-900 dark:text-blue-100">
                    💡 These ideas are based on your input. Click any to use it, or type something else to get new suggestions.
                  </p>
                </div>
              )}
              {topicIdeas.length > 0 ? (
                topicIdeas.map((idea, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto py-4 text-left whitespace-normal hover:bg-primary/5 hover:border-primary transition-all"
                    onClick={() => handleSelectTopic(idea)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Badge variant="secondary" className="mt-0.5 shrink-0">
                        {index + 1}
                      </Badge>
                      <span className="text-sm leading-relaxed">{idea}</span>
                    </div>
                  </Button>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No topic ideas generated yet</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTopicIdeasDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateTopicIdeas}
              disabled={isGeneratingTopics}
            >
              {isGeneratingTopics ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Regenerate Ideas
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Design Style Selection Dialog */}
      <Dialog open={designStyleDialogOpen} onOpenChange={setDesignStyleDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Choose Design Style
              </div>
            </DialogTitle>
            <DialogDescription>
              Select a visual design style for your carousel. Each style has a unique look and feel.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {designStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => {
                  setSelectedDesignStyle(style.id)
                  setDesignStyleDialogOpen(false)
                  toast({
                    title: "Design style selected!",
                    description: `${style.name} will be used for your carousel`,
                  })
                }}
                className={`p-5 rounded-lg border-2 transition-all text-left hover:shadow-lg ${
                  selectedDesignStyle === style.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-base mb-1">{style.name}</p>
                    <p className="text-sm text-muted-foreground">{style.description}</p>
                  </div>
                  {selectedDesignStyle === style.id && (
                    <Badge variant="default" className="shrink-0">
                      Selected
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setDesignStyleDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
