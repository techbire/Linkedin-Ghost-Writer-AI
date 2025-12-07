"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Sparkles, Loader2, Eye, Edit, Download, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

interface CarouselDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  topic: string
  tone: string
  contentType: string
  selectedHook: string
  credits: number
  onGenerate: (carouselData: any) => Promise<void>
}

export function CarouselDialog({
  open,
  onOpenChange,
  topic,
  tone,
  contentType,
  selectedHook,
  credits,
  onGenerate,
}: CarouselDialogProps) {
  const [selectedTheme, setSelectedTheme] = useState(themes[0])
  const [customPrimary, setCustomPrimary] = useState("")
  const [customSecondary, setCustomSecondary] = useState("")
  const [slideCount, setSlideCount] = useState(5)
  const [selectedDesignStyle, setSelectedDesignStyle] = useState(designStyles[0].id)
  const [isDraft, setIsDraft] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSlides, setGeneratedSlides] = useState<string[]>([])
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editedSlides, setEditedSlides] = useState<string[]>([])
  const { toast } = useToast()

  const handleGenerateCarousel = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for your carousel",
        variant: "destructive",
      })
      return
    }

    const creditsNeeded = slideCount * 5 + 2
    if (credits < creditsNeeded) {
      toast({
        title: "Insufficient credits",
        description: `You need ${creditsNeeded} credits to generate this carousel`,
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-carousel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          tone,
          contentType,
          hook: selectedHook || null,
          mode: "slide",
          slideCount: slideCount,
          designStyle: selectedDesignStyle,
          theme: {
            name: selectedTheme.name,
            primary: customPrimary || selectedTheme.primary,
            secondary: customSecondary || selectedTheme.secondary,
          },
          isDraft,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate carousel")
      }

      setGeneratedSlides(data.slides)
      setEditedSlides(data.slides)
      setGeneratedImages(data.imageUrls || [])
      setCurrentSlideIndex(0)

      toast({
        title: "Carousel generated!",
        description: `Your ${slideCount}-slide carousel is ready`,
      })

      // Call parent handler
      if (onGenerate) {
        await onGenerate(data)
      }
    } catch (error) {
      console.error("Error generating carousel:", error)
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate carousel",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedImages.length === 0) return

    generatedImages.forEach((imageUrl, index) => {
      const link = document.createElement("a")
      link.href = imageUrl
      link.download = `carousel-slide-${index + 1}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })

    toast({
      title: "Downloaded!",
      description: `${generatedImages.length} carousel slides downloaded`,
    })
  }

  const handleSlideEdit = (index: number, newContent: string) => {
    const updated = [...editedSlides]
    updated[index] = newContent
    setEditedSlides(updated)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Create Carousel Post</DialogTitle>
          <DialogDescription>
            Generate multi-slide visual carousels for LinkedIn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Slide Count Selection */}
          <div className="space-y-3">
            <Label>Number of Slides</Label>
            <Select value={slideCount.toString()} onValueChange={(value) => setSlideCount(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                  <SelectItem key={count} value={count.toString()}>
                    {count} slides
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Generate multiple slides with headlines and content for each
            </p>
          </div>

          {/* Step 2: Design Style Selection */}
          <div className="space-y-3">
            <Label>Design Style</Label>
            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
              {designStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedDesignStyle(style.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedDesignStyle === style.id
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">{style.name}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {style.description}
                      </p>
                    </div>
                    {selectedDesignStyle === style.id && (
                      <Badge variant="default" className="ml-2 shrink-0">✓</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Choose a design style for your carousel images
            </p>
          </div>

          {/* Step 3: Theme Selection */}
          <div className="space-y-3">
            <Label>Theme Customization</Label>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((theme) => (
                <Button
                  key={theme.id}
                  variant={selectedTheme.id === theme.id ? "default" : "outline"}
                  className="h-auto flex flex-col items-start p-4"
                  onClick={() => setSelectedTheme(theme)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
                    />
                    <span className="font-medium text-sm">{theme.name}</span>
                  </div>
                </Button>
              ))}
            </div>

            {/* Custom Colors */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="custom-primary">Custom Primary Color</Label>
                <div className="flex gap-2">
                  <input
                    id="custom-primary"
                    type="color"
                    value={customPrimary || selectedTheme.primary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="h-10 w-16 rounded border cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground flex items-center">
                    {customPrimary || selectedTheme.primary}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-secondary">Custom Secondary Color</Label>
                <div className="flex gap-2">
                  <input
                    id="custom-secondary"
                    type="color"
                    value={customSecondary || selectedTheme.secondary}
                    onChange={(e) => setCustomSecondary(e.target.value)}
                    className="h-10 w-16 rounded border cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground flex items-center">
                    {customSecondary || selectedTheme.secondary}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Draft Toggle */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label htmlFor="draft-toggle">Mark as Draft</Label>
              <p className="text-sm text-muted-foreground">
                Save as incomplete or work in progress
              </p>
            </div>
            <Switch
              id="draft-toggle"
              checked={isDraft}
              onCheckedChange={setIsDraft}
            />
          </div>

          {/* Preview Section */}
          {generatedSlides.length > 0 && (
            <div className="space-y-3 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <Label>Generated Carousel Preview</Label>
                <div className="flex gap-2">
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {isEditing ? "Editing" : "Edit"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download All
                  </Button>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <Label>Slide {currentSlideIndex + 1} of {editedSlides.length}</Label>
                  <Textarea
                    value={editedSlides[currentSlideIndex]}
                    onChange={(e) => handleSlideEdit(currentSlideIndex, e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentSlideIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentSlideIndex((prev) => Math.min(editedSlides.length - 1, prev + 1))}
                      disabled={currentSlideIndex === editedSlides.length - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedImages.length > 0 ? (
                    <div className="relative">
                      <img
                        src={generatedImages[currentSlideIndex]}
                        alt={`Carousel slide ${currentSlideIndex + 1}`}
                        className="w-full h-auto rounded-lg border"
                      />
                      {generatedImages.length > 1 && (
                        <div className="flex justify-between items-center mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                            disabled={currentSlideIndex === 0}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <Badge variant="secondary">
                            {currentSlideIndex + 1} / {generatedImages.length}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentSlideIndex((prev) => Math.min(generatedImages.length - 1, prev + 1))}
                            disabled={currentSlideIndex === generatedImages.length - 1}
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border bg-muted/30 p-4 max-h-[300px] overflow-y-auto">
                      <p className="whitespace-pre-wrap text-sm">
                        {editedSlides[currentSlideIndex]}
                      </p>
                      {editedSlides.length > 1 && (
                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                            disabled={currentSlideIndex === 0}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Badge variant="secondary">
                            Slide {currentSlideIndex + 1} / {editedSlides.length}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentSlideIndex((prev) => Math.min(editedSlides.length - 1, prev + 1))}
                            disabled={currentSlideIndex === editedSlides.length - 1}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Generate Button */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
            <div className="space-y-1">
              <p className="text-sm font-medium">Credit Cost</p>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-lg font-bold">
                  {slideCount * 5 + 2} credits
                </span>
              </div>
            </div>
            <Button
              onClick={handleGenerateCarousel}
              disabled={isGenerating || credits < (slideCount * 5 + 2)}
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Generate Carousel
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
