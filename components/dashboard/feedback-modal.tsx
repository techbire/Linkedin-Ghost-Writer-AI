"use client"

import { useState } from "react"
import { Star, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface FeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId?: string
  generationParams?: Record<string, any>
  onFeedbackSubmitted?: () => void
}

const ASPECT_OPTIONS = [
  "hook",
  "structure",
  "tone",
  "length",
  "clarity",
  "engagement",
  "formatting",
  "call-to-action",
  "storytelling",
  "professional",
]

export function FeedbackModal({
  open,
  onOpenChange,
  postId,
  generationParams,
  onFeedbackSubmitted,
}: FeedbackModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Ratings
  const [overallRating, setOverallRating] = useState(0)
  const [qualityRating, setQualityRating] = useState(0)
  const [relevanceRating, setRelevanceRating] = useState(0)
  const [toneRating, setToneRating] = useState(0)
  const [engagementRating, setEngagementRating] = useState(0)

  // Aspects
  const [likedAspects, setLikedAspects] = useState<string[]>([])
  const [dislikedAspects, setDislikedAspects] = useState<string[]>([])
  const [improvementSuggestions, setImprovementSuggestions] = useState("")

  // Boolean feedback
  const [wasHelpful, setWasHelpful] = useState(true)
  const [wouldUseAgain, setWouldUseAgain] = useState(true)
  const [metExpectations, setMetExpectations] = useState(true)

  const handleAspectToggle = (
    aspect: string,
    type: "liked" | "disliked"
  ) => {
    if (type === "liked") {
      setLikedAspects((prev) =>
        prev.includes(aspect)
          ? prev.filter((a) => a !== aspect)
          : [...prev, aspect]
      )
      // Remove from disliked if adding to liked
      setDislikedAspects((prev) => prev.filter((a) => a !== aspect))
    } else {
      setDislikedAspects((prev) =>
        prev.includes(aspect)
          ? prev.filter((a) => a !== aspect)
          : [...prev, aspect]
      )
      // Remove from liked if adding to disliked
      setLikedAspects((prev) => prev.filter((a) => a !== aspect))
    }
  }

  const handleSubmit = async () => {
    if (overallRating === 0) {
      toast({
        title: "Rating required",
        description: "Please provide an overall rating",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postId,
          overall_rating: overallRating,
          quality_rating: qualityRating > 0 ? qualityRating : null,
          relevance_rating: relevanceRating > 0 ? relevanceRating : null,
          tone_rating: toneRating > 0 ? toneRating : null,
          engagement_potential_rating: engagementRating > 0 ? engagementRating : null,
          liked_aspects: likedAspects.length > 0 ? likedAspects : null,
          disliked_aspects: dislikedAspects.length > 0 ? dislikedAspects : null,
          improvement_suggestions: improvementSuggestions || null,
          was_helpful: wasHelpful,
          would_use_again: wouldUseAgain,
          met_expectations: metExpectations,
          generation_params: generationParams || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback")
      }

      toast({
        title: "Feedback submitted!",
        description: "Thank you for helping us improve.",
      })

      // Reset form
      setOverallRating(0)
      setQualityRating(0)
      setRelevanceRating(0)
      setToneRating(0)
      setEngagementRating(0)
      setLikedAspects([])
      setDislikedAspects([])
      setImprovementSuggestions("")
      setWasHelpful(true)
      setWouldUseAgain(true)
      setMetExpectations(true)

      onOpenChange(false)
      onFeedbackSubmitted?.()
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit feedback",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number
    onChange: (value: number) => void
    label: string
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-colors"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us improve your content generation experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <StarRating
            value={overallRating}
            onChange={setOverallRating}
            label="Overall Rating *"
          />

          {/* Detailed Ratings */}
          <div className="grid grid-cols-2 gap-4">
            <StarRating
              value={qualityRating}
              onChange={setQualityRating}
              label="Content Quality"
            />
            <StarRating
              value={relevanceRating}
              onChange={setRelevanceRating}
              label="Relevance"
            />
            <StarRating
              value={toneRating}
              onChange={setToneRating}
              label="Tone & Voice"
            />
            <StarRating
              value={engagementRating}
              onChange={setEngagementRating}
              label="Engagement Potential"
            />
          </div>

          {/* What did you like? */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-600" />
              What did you like?
            </Label>
            <div className="flex flex-wrap gap-2">
              {ASPECT_OPTIONS.map((aspect) => (
                <button
                  key={aspect}
                  type="button"
                  onClick={() => handleAspectToggle(aspect, "liked")}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    likedAspects.includes(aspect)
                      ? "bg-green-100 border-green-500 text-green-700"
                      : "border-gray-300 hover:border-green-500"
                  }`}
                >
                  {aspect}
                </button>
              ))}
            </div>
          </div>

          {/* What could be better? */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ThumbsDown className="h-4 w-4 text-orange-600" />
              What could be better?
            </Label>
            <div className="flex flex-wrap gap-2">
              {ASPECT_OPTIONS.map((aspect) => (
                <button
                  key={aspect}
                  type="button"
                  onClick={() => handleAspectToggle(aspect, "disliked")}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    dislikedAspects.includes(aspect)
                      ? "bg-orange-100 border-orange-500 text-orange-700"
                      : "border-gray-300 hover:border-orange-500"
                  }`}
                >
                  {aspect}
                </button>
              ))}
            </div>
          </div>

          {/* Improvement Suggestions */}
          <div className="space-y-2">
            <Label htmlFor="suggestions">
              Any suggestions for improvement?
            </Label>
            <Textarea
              id="suggestions"
              value={improvementSuggestions}
              onChange={(e) => setImprovementSuggestions(e.target.value)}
              placeholder="Share your thoughts on how we can make this better..."
              rows={4}
            />
          </div>

          {/* Boolean Questions */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="helpful"
                checked={wasHelpful}
                onCheckedChange={(checked) => setWasHelpful(checked as boolean)}
              />
              <label
                htmlFor="helpful"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                This content was helpful
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-again"
                checked={wouldUseAgain}
                onCheckedChange={(checked) =>
                  setWouldUseAgain(checked as boolean)
                }
              />
              <label
                htmlFor="use-again"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I would use this feature again
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="expectations"
                checked={metExpectations}
                onCheckedChange={(checked) =>
                  setMetExpectations(checked as boolean)
                }
              />
              <label
                htmlFor="expectations"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                This met my expectations
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
