"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
}

interface EditBusinessContextDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  businessContext: BusinessContext | null
  profession: string | null
  designation: string | null
  websiteUrl: string | null
}

export function EditBusinessContextDialog({
  open,
  onOpenChange,
  businessContext,
  profession,
  designation,
  websiteUrl,
}: EditBusinessContextDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    profession: profession || "",
    designation: designation || "",
    websiteUrl: websiteUrl || "",
    businessName: businessContext?.businessName || "",
    businessDescription: businessContext?.businessDescription || "",
    industry: businessContext?.industry || "",
    services: businessContext?.services?.join(", ") || "",
    targetAudience: businessContext?.targetAudience || "",
    ageGroup: businessContext?.ageGroup || "",
    valueProposition: businessContext?.valueProposition || "",
    keywords: businessContext?.keywords?.join(", ") || "",
  })

  // Update form data when props change
  useState(() => {
    setFormData({
      profession: profession || "",
      designation: designation || "",
      websiteUrl: websiteUrl || "",
      businessName: businessContext?.businessName || "",
      businessDescription: businessContext?.businessDescription || "",
      industry: businessContext?.industry || "",
      services: businessContext?.services?.join(", ") || "",
      targetAudience: businessContext?.targetAudience || "",
      ageGroup: businessContext?.ageGroup || "",
      valueProposition: businessContext?.valueProposition || "",
      keywords: businessContext?.keywords?.join(", ") || "",
    })
  })

  const handleSave = async () => {
    setLoading(true)
    
    try {
      // Prepare Your Persona data
      const updatedBusinessContext: BusinessContext = {
        businessName: formData.businessName || undefined,
        businessDescription: formData.businessDescription || undefined,
        industry: formData.industry || undefined,
        services: formData.services
          ? formData.services.split(",").map(s => s.trim()).filter(Boolean)
          : [],
        targetAudience: formData.targetAudience || undefined,
        ageGroup: formData.ageGroup || undefined,
        valueProposition: formData.valueProposition || undefined,
        keywords: formData.keywords
          ? formData.keywords.split(",").map(k => k.trim()).filter(Boolean)
          : [],
        sourceUrl: formData.websiteUrl || businessContext?.sourceUrl,
        scrapedAt: new Date().toISOString(),
      }

      // Update profile with new data
      const response = await fetch('/api/update-business-context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          profession: formData.profession || null,
          designation: formData.designation || null,
          websiteUrl: formData.websiteUrl || null,
          businessContext: updatedBusinessContext,
        }),
      })

      if (response.ok) {
        toast({
          title: "Your Persona updated!",
          description: "Your changes have been saved successfully.",
        })
        onOpenChange(false)
        
        // Refresh page to show updated data
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to update Your Persona")
      }
    } catch (error) {
      console.error("Error updating Your Persona:", error)
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update Your Persona",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Your Persona</DialogTitle>
          <DialogDescription>
            Update your professional information and business details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Professional Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Professional Information</h4>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profession">Profession</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  placeholder="e.g., Marketing, Software Development"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g., Marketing Manager, Senior Developer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-sm">Business Details</h4>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Your company name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g., Technology, Healthcare"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessDescription">Business Description</Label>
              <Textarea
                id="businessDescription"
                value={formData.businessDescription}
                onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                placeholder="Describe what your business does (2-3 sentences)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valueProposition">Value Proposition</Label>
              <Textarea
                id="valueProposition"
                value={formData.valueProposition}
                onChange={(e) => setFormData({ ...formData, valueProposition: e.target.value })}
                placeholder="What makes your business unique?"
                rows={2}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder="e.g., Small businesses, Enterprises"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ageGroup">Age Group</Label>
                <Input
                  id="ageGroup"
                  value={formData.ageGroup}
                  onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                  placeholder="e.g., 25-45, Gen Z, All ages"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="services">Services/Products (comma-separated)</Label>
              <Input
                id="services"
                value={formData.services}
                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                placeholder="e.g., Web Development, Mobile Apps, Consulting"
              />
              <p className="text-xs text-muted-foreground">Separate multiple services with commas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="e.g., innovation, technology, growth, leadership"
              />
              <p className="text-xs text-muted-foreground">These keywords will be used for content generation</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
