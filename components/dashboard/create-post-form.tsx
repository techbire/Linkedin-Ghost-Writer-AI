"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  UploadCloud,
  Mic,
  FileText,
  Link as LinkIcon,
  Youtube,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Copy,
  Bookmark,
  Calendar,
  RefreshCw,
  Loader2,
  Edit,
  Eye,
  Zap,
  ImageIcon,
  Paperclip,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCredits } from "@/hooks/use-credits";
import { useRouter } from "next/navigation";
import { SchedulePostDialog } from "./schedule-post-dialog";
// import { GroundedContentDisplay } from "@/components/dashboard/grounded-content-display";
import { Iphone } from "../ui/iphone";
import { Safari } from "../ui/safari";
import Image from "next/image";
import LinkedInPostCard from "./LinkedInPostCard";

const tones = [
  "Standard (authoritative)",
  "Witty",
  "Expert",
  "Casual",
  "Inspirational",
  "Storytelling",
  "Data-driven",
];

const contentTypes = ["Story", "Steps", "Lists"];

const imageRatios = [
  { label: "Square (1:1)", value: "1:1" },
  { label: "Portrait (4:5)", value: "4:5" },
  { label: "Landscape (16:9)", value: "16:9" },
  { label: "Story (9:16)", value: "9:16" },
];

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
};

interface CreatePostFormProps {
  userId: string;
}

export function CreatePostForm({ userId }: CreatePostFormProps) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Standard (authoritative)");
  const [contentType, setContentType] = useState("Story");
  const [selectedHook, setSelectedHook] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [groundingMetadata, setGroundingMetadata] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [savedPostId, setSavedPostId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [hooksDialogOpen, setHooksDialogOpen] = useState(false);
  const [selectedHookCategory, setSelectedHookCategory] = useState<
    keyof typeof hooks | null
  >(null);
  const [imageRatioDialogOpen, setImageRatioDialogOpen] = useState(false);
  const [selectedImageRatio, setSelectedImageRatio] = useState("1:1");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageCount, setImageCount] = useState(3);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");

  const [inputMode, setInputMode] = useState<"topic" | "url">("topic");
  const [url, setUrl] = useState("");
  const [isDeepResearch, setIsDeepResearch] = useState(false);
  const [topicIdeasDialogOpen, setTopicIdeasDialogOpen] = useState(false);
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [topicIdeas, setTopicIdeas] = useState<string[]>([]);

  // Reference Material states
  const [referenceMaterialMode, setReferenceMaterialMode] = useState<
    "text" | "url" | "youtube" | "file" | "voice" | null
  >(null);
  const [referenceMaterialTranscript, setReferenceMaterialTranscript] =
    useState("");
  const [referenceMaterialUrl, setReferenceMaterialUrl] = useState("");
  const [referenceMaterialFile, setReferenceMaterialFile] =
    useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showReferenceMaterialOptions, setShowReferenceMaterialOptions] =
    useState(false);
  const [isProcessingReference, setIsProcessingReference] = useState(false);
  const [processedReferenceContent, setProcessedReferenceContent] =
    useState("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  // Refinement prompt state
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [showRefinementInput, setShowRefinementInput] = useState(false);

  const { toast } = useToast();
  const { credits, refreshCredits } = useCredits();
  const router = useRouter();

  // Generate topic ideas using AI
  const handleGenerateTopicIdeas = async () => {
    setIsGeneratingTopics(true);
    setTopicIdeasDialogOpen(true);

    try {
      const response = await fetch("/api/generate-topic-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          tone,
          currentTopic: topic.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate topic ideas");
      }

      const data = await response.json();
      setTopicIdeas(data.topicIdeas);

      toast({
        title: "Ideas generated!",
        description: `Got ${data.topicIdeas.length} topic ideas for you`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to generate topic ideas",
        description: error.message,
        variant: "destructive",
      });
      setTopicIdeasDialogOpen(false);
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  // Reference Material Handlers
  const handleVoiceRecording = async () => {
    if (!isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: "audio/webm" });
          stream.getTracks().forEach((track) => track.stop());

          // Upload to transcription API
          setIsProcessingReference(true);
          try {
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.webm");

            const response = await fetch("/api/transcribe-voice", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              throw new Error("Transcription failed");
            }

            const data = await response.json();
            setProcessedReferenceContent(data.transcript);
            toast({
              title: "Voice transcribed!",
              description: "Your audio has been converted to text.",
            });
          } catch (error) {
            console.error("Transcription error:", error);
            toast({
              title: "Transcription failed",
              description: "Failed to transcribe audio. Please try again.",
              variant: "destructive",
            });
          } finally {
            setIsProcessingReference(false);
          }
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        setAudioChunks([]);
      } catch (error) {
        console.error("Microphone access error:", error);
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access to record audio.",
          variant: "destructive",
        });
      }
    } else {
      // Stop recording
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
        setMediaRecorder(null);
      }
    }
  };

  const handleArticleUrlProcess = async () => {
    if (!referenceMaterialUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a URL to scrape.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingReference(true);
    try {
      const response = await fetch("/api/scrape-article", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: referenceMaterialUrl }),
      });

      if (!response.ok) {
        throw new Error("Scraping failed");
      }

      const data = await response.json();
      setProcessedReferenceContent(data.content);
      toast({
        title: "Article scraped!",
        description: `Successfully extracted content from: ${
          data.title || "the article"
        }`,
      });
    } catch (error) {
      console.error("Scraping error:", error);
      toast({
        title: "Scraping failed",
        description: "Failed to extract content from URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingReference(false);
    }
  };

  const handleYoutubeProcess = async () => {
    if (!referenceMaterialUrl.trim()) {
      toast({
        title: "YouTube URL required",
        description: "Please enter a YouTube video URL.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingReference(true);
    try {
      const response = await fetch("/api/extract-youtube", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: referenceMaterialUrl }),
      });

      if (!response.ok) {
        throw new Error("YouTube extraction failed");
      }

      const data = await response.json();
      setProcessedReferenceContent(data.transcript);
      toast({
        title: "YouTube transcript extracted!",
        description: `Successfully extracted transcript from: ${
          data.videoTitle || "the video"
        }`,
      });
    } catch (error) {
      console.error("YouTube extraction error:", error);
      toast({
        title: "YouTube extraction failed",
        description:
          "Failed to extract transcript. Please ensure the video has captions.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingReference(false);
    }
  };

  const handleFileProcess = async () => {
    if (!referenceMaterialFile) {
      toast({
        title: "File required",
        description: "Please select a file to process.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingReference(true);
    try {
      const formData = new FormData();
      formData.append("file", referenceMaterialFile);

      const response = await fetch("/api/process-document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Document processing failed");
      }

      const data = await response.json();
      setProcessedReferenceContent(data.content);
      toast({
        title: "Document processed!",
        description: `Successfully extracted content from: ${data.fileName}`,
      });
    } catch (error) {
      console.error("Document processing error:", error);
      toast({
        title: "Document processing failed",
        description: "Failed to process document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingReference(false);
    }
  };

  const handleGenerate = async () => {
    // A user must provide either a topic or a URL
    if (!topic.trim() && !url.trim()) {
      toast({
        title: "Input required",
        description:
          "Please enter a topic or provide a URL to generate a post.",
        variant: "destructive",
      });
      return;
    }
    // Check credits before generation
    if (credits < 1) {
      toast({
        title: "Insufficient credits",
        description:
          "You need at least 1 credit to generate a post. Please upgrade your plan.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");

    try {
      console.log("=".repeat(80));
      console.log("[Create Post Form] 🎯 GENERATING POST:");
      console.log("[Create Post Form] Topic:", topic);
      console.log("[Create Post Form] URL:", url || "None");
      console.log("[Create Post Form] Tone:", tone);
      console.log("[Create Post Form] Content Type:", contentType);
      console.log("[Create Post Form] Selected Hook:", selectedHook || "None");
      console.log("[Create Post Form] Deep Research:", isDeepResearch);
      console.log("[Create Post Form] User ID:", userId);
      console.log("[Create Post Form] Use Profile Data: true");
      console.log(
        "[Create Post Form] Reference Material:",
        processedReferenceContent ? "Yes" : "No"
      );
      console.log("=".repeat(80));

      const response = await fetch("/api/generate-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic,
          url: url,
          tone: tone,
          isDeepResearch: isDeepResearch,
          contentType,
          hook: selectedHook || null,
          userId: userId, // ✅ Add userId
          useProfileData: true, // ✅ Enable profile context
          referenceMaterial: processedReferenceContent
            ? {
                type: referenceMaterialMode,
                content: processedReferenceContent,
              }
            : null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate post");
      }

      setGeneratedContent(data.content);
      setEditedContent(data.content);
      setGroundingMetadata(data.groundingMetadata || null);
      setIsEditMode(false);

      // Refresh credits after generation
      refreshCredits();

      toast({
        title: "Post generated!",
        description:
          "Your LinkedIn post has been created successfully (1 credit used)",
      });
    } catch (error) {
      console.error("Error generating post:", error);
      toast({
        title: "Generation failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Refine/Regenerate post with user feedback
  const handleRefinePost = async () => {
    if (!refinementPrompt.trim()) {
      toast({
        title: "Feedback required",
        description: "Please describe what changes you want to make",
        variant: "destructive",
      });
      return;
    }

    if (!generatedContent) {
      toast({
        title: "No content to refine",
        description: "Generate a post first",
        variant: "destructive",
      });
      return;
    }

    // Check credits before refinement
    if (credits < 1) {
      toast({
        title: "Insufficient credits",
        description:
          "You need at least 1 credit to refine the post. Please upgrade your plan.",
        variant: "destructive",
      });
      return;
    }

    setIsRefining(true);

    try {
      const response = await fetch("/api/refine-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalContent: isEditMode ? editedContent : generatedContent,
          refinementPrompt: refinementPrompt,
          tone: tone,
          contentType: contentType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to refine post");
      }

      setGeneratedContent(data.content);
      setEditedContent(data.content);
      setIsEditMode(false);
      setRefinementPrompt("");
      setShowRefinementInput(false);

      // Refresh credits after refinement
      refreshCredits();

      toast({
        title: "Post refined! ✨",
        description:
          "Your post has been updated based on your feedback (1 credit used)",
      });
    } catch (error) {
      console.error("Error refining post:", error);
      toast({
        title: "Refinement failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to refine post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopy = async () => {
    const contentToCopy = isEditMode ? editedContent : generatedContent;
    if (!contentToCopy) return;

    try {
      await navigator.clipboard.writeText(contentToCopy);
      toast({
        title: "Copied!",
        description: "Post copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleHookSelect = (hook: string) => {
    setSelectedHook(hook);
    setHooksDialogOpen(false);
    setSelectedHookCategory(null);
    toast({
      title: "Hook selected!",
      description: "This hook will be used when you generate your post",
    });
  };

  const handleGenerateImage = async () => {
    if (!generatedContent) {
      toast({
        title: "Generate post first",
        description: "Please generate a post before creating an image",
        variant: "destructive",
      });
      return;
    }

    // Check credits before image generation (5 credits per image)
    const creditsNeeded = 5 * imageCount;
    if (credits < creditsNeeded) {
      toast({
        title: "Insufficient credits",
        description: `You need ${creditsNeeded} credits to generate ${imageCount} images. Please upgrade your plan.`,
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingImage(true);
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caption: generatedContent,
          ratio: selectedImageRatio,
          count: imageCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate images");
      }

      setGeneratedImages(data.imageUrls);
      setCurrentImageIndex(0);
      setImageRatioDialogOpen(false);

      // Refresh credits after generation
      refreshCredits();

      toast({
        title: "Images generated!",
        description: `${imageCount} AI-generated images are ready (${creditsNeeded} credits used)`,
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Generation failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSave = async (status: "draft" | "scheduled" = "draft") => {
    const contentToSave = isEditMode ? editedContent : generatedContent;
    if (!contentToSave) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contentToSave,
          tone,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save post");
      }

      toast({
        title: "Saved!",
        description: "Post saved to your library",
      });

      // Redirect to post library
      router.push("/dashboard/post-library");
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        title: "Save failed",
        description: "Failed to save post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSchedule = async () => {
    const contentToSchedule = isEditMode ? editedContent : generatedContent;
    if (!contentToSchedule) return;

    // First save the post as draft
    setIsSaving(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contentToSchedule,
          tone,
          status: "draft",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save post");
      }

      setSavedPostId(data.post.id);
      setScheduleDialogOpen(true);
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        title: "Save failed",
        description: "Failed to save post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleScheduleSuccess = (postId: string, scheduledDate: string) => {
    setScheduleDialogOpen(false);
    setSavedPostId(null);
    toast({
      title: "Success!",
      description: "Post scheduled successfully",
    });
    router.push("/dashboard/calendar");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Post Settings</CardTitle>
              <CardDescription>
                Configure your LinkedIn post parameters
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className="flex items-center gap-2 px-3 py-2"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-semibold">{credits}</span>
              <span className="text-xs text-muted-foreground">credits</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* --- NEW TABS FOR INPUT --- */}
          <div className="flex items-center justify-between">
            <Label htmlFor="topic">
              What would you like the post to be about...
            </Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateTopicIdeas}
                disabled={isGeneratingTopics}
                className="shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 transition-all"
              >
                <Sparkles className="mr-1 h-3 w-3" />
                {isGeneratingTopics ? "Generating..." : "Ideas"}
              </Button>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Textarea
              id="topic"
              placeholder="Example: How to write LinkedIn posts that flood your calendar..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
            />
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() =>
                setShowReferenceMaterialOptions(!showReferenceMaterialOptions)
              }
              className={`shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 transition-all ${
                processedReferenceContent ? "bg-primary/10 border-primary" : ""
              }`}
            >
              <Paperclip className="h-5 w-5" />
              {processedReferenceContent && (
                <span className="ml-1 text-[10px] font-bold">1</span>
              )}
            </Button>
          </div>

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

          <div className="space-y-2">
            <Label>Hooks (Optional)</Label>
            <Button
              variant={selectedHook ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setHooksDialogOpen(true)}
            >
              <Zap className="mr-2 h-4 w-4" />
              {selectedHook ? "Hook Selected ✓" : "Choose a Hook"}
            </Button>
            {selectedHook && (
              <div className="text-xs p-2 bg-muted rounded-md">
                <p className="font-medium mb-1">Selected Hook:</p>
                <p className="text-muted-foreground">{selectedHook}</p>

                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-6 text-xs"
                  onClick={() => {
                    setSelectedHook("");
                    toast({ title: "Hook removed" });
                  }}
                >
                  Remove Hook
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Select a hook before generating to create a post around it
            </p>
          </div>

          {/* --- NEW DEEP RESEARCH SWITCH --- */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label htmlFor="deep-research">Deep Research</Label>
              <p className="text-sm text-muted-foreground">
                Includes web research with added citations and references.
              </p>
            </div>
            <Switch
              id="deep-research"
              checked={isDeepResearch}
              onCheckedChange={setIsDeepResearch}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate
                </>
              )}
            </Button>
            {generatedContent && (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ... (keep the Generated Content Card and SchedulePostDialog as they are) */}
      {/* Generated Content */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Post</CardTitle>
          <CardDescription>
            {generatedContent
              ? "Your AI-generated LinkedIn post"
              : "Generate a post to see it here"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {generatedContent ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-2">
                  <Button
                    variant={isEditMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsEditMode(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant={!isEditMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsEditMode(false)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </div>

              {isEditMode ? (
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                />
              ) : (
                // <div className="space-y-4">
                //   <div className="rounded-lg border bg-muted/30 p-4 max-h-[400px] overflow-y-auto">
                //     <GroundedContentDisplay
                //       content={editedContent || generatedContent}
                //       groundingMetadata={groundingMetadata}
                //     />
                //   </div>

                //   {generatedImages.length > 0 && (
                //     <div className="rounded-lg border overflow-hidden">
                //       <div className="relative">
                //         <img
                //           src={generatedImages[currentImageIndex]}
                //           alt={`Generated image ${currentImageIndex + 1}`}
                //           className="w-full h-auto"
                //         />

                //         {/* Carousel Navigation */}
                //         {generatedImages.length > 1 && (
                //           <>
                //             <Button
                //               variant="outline"
                //               size="icon"
                //               className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                //               onClick={() =>
                //                 setCurrentImageIndex((prev) =>
                //                   prev === 0
                //                     ? generatedImages.length - 1
                //                     : prev - 1
                //                 )
                //               }
                //             >
                //               <ChevronLeft className="h-4 w-4" />
                //             </Button>

                //             <Button
                //               variant="outline"
                //               size="icon"
                //               className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                //               onClick={() =>
                //                 setCurrentImageIndex((prev) =>
                //                   prev === generatedImages.length - 1
                //                     ? 0
                //                     : prev + 1
                //                 )
                //               }
                //             >
                //               <ChevronRight className="h-4 w-4" />
                //             </Button>

                //             {/* Dot Indicators */}
                //             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                //               {generatedImages.map((_, index) => (
                //                 <button
                //                   key={index}
                //                   onClick={() => setCurrentImageIndex(index)}
                //                   className={`h-2 w-2 rounded-full transition-all ${
                //                     index === currentImageIndex
                //                       ? "bg-primary w-4"
                //                       : "bg-primary/30 hover:bg-primary/50"
                //                   }`}
                //                   aria-label={`Go to image ${index + 1}`}
                //                 />
                //               ))}
                //             </div>
                //           </>
                //         )}

                //         {/* Image Counter */}
                //         <div className="absolute top-2 right-2 bg-background/80 px-2 py-1 rounded text-xs font-medium">
                //           {currentImageIndex + 1} / {generatedImages.length}
                //         </div>
                //       </div>
                //     </div>
                //   )}
                // </div>
                <div className="w-full max-w-4xl mx-auto p-6">
                  <Tabs defaultValue="iphone" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="iphone">
                        <Image
                          width={20}
                          height={20}
                          src="/icons/phone.png"
                          alt="phone"
                        />
                      </TabsTrigger>
                      <TabsTrigger value="safari">
                        <Image
                          width={20}
                          height={20}
                          src="/icons/tab.png"
                          alt="phone"
                        />
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="iphone" className="mt-6">
                      <div className="flex justify-center p-5">
                        <LinkedInPostCard
                          content={editedContent || generatedContent}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="safari" className="mt-6">
                      <div className="flex justify-center p-5">
                        <Safari
                          // url="yourapp.com"
                          className="w-full h-auto"
                          mode="default"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Refinement Prompt Section */}
              {showRefinementInput ? (
                <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        ✨ Refine Your Post
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Describe what you want to change (e.g., "Make it more
                        professional" or "Add statistics" or "Shorten to 200
                        words")
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowRefinementInput(false);
                        setRefinementPrompt("");
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                  <Textarea
                    value={refinementPrompt}
                    onChange={(e) => setRefinementPrompt(e.target.value)}
                    placeholder="E.g., 'Make the tone more casual and add emojis' or 'Focus more on the benefits' or 'Make it shorter and punchier'"
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRefinePost}
                      disabled={isRefining || !refinementPrompt.trim()}
                      size="sm"
                      className="flex-1"
                    >
                      {isRefining ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Refining...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Refine Post (1 credit)
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowRefinementInput(false);
                        setRefinementPrompt("");
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
                  onClick={() => setShowRefinementInput(true)}
                  className="w-full"
                  disabled={isEditMode}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Refine with AI
                </Button>
              )}

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleCopy} variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  onClick={() => setImageRatioDialogOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Create Image
                </Button>
                <Button
                  onClick={() => handleSave("draft")}
                  variant="outline"
                  size="sm"
                  disabled={isSaving}
                >
                  <Bookmark className="mr-2 h-4 w-4" />
                  Bookmark
                </Button>
                <Button
                  onClick={handleSchedule}
                  variant="outline"
                  size="sm"
                  disabled={isSaving}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mb-4 opacity-20" />
              <p>Enter your topic and click Generate to create your post</p>
            </div>
          )}
        </CardContent>
      </Card>

      {savedPostId && (
        <SchedulePostDialog
          postId={savedPostId}
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          onSuccess={handleScheduleSuccess}
        />
      )}

      {/* Hooks Selection Dialog */}
      <Dialog open={hooksDialogOpen} onOpenChange={setHooksDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-background/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Choose a Hook Category</DialogTitle>
            <DialogDescription>
              Select a hook type to add a compelling opening to your post
            </DialogDescription>
          </DialogHeader>

          {!selectedHookCategory ? (
            <div className="grid grid-cols-2 gap-4 py-4">
              {(Object.keys(hooks) as Array<keyof typeof hooks>).map(
                (category) => (
                  <Button
                    key={category}
                    variant="outline"
                    className="h-20 text-lg font-semibold"
                    onClick={() => setSelectedHookCategory(category)}
                  >
                    {category}
                  </Button>
                )
              )}
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedHookCategory(null)}
              >
                ← Back to categories
              </Button>
              <div className="space-y-2">
                {hooks[selectedHookCategory].map((hook, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal"
                    onClick={() => handleHookSelect(hook)}
                  >
                    {hook}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Ratio Selection Dialog */}
      <Dialog
        open={imageRatioDialogOpen}
        onOpenChange={setImageRatioDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Generate AI Images</DialogTitle>
            <DialogDescription>
              Choose aspect ratio and number of images to generate
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Image Count Selector */}
            <div className="space-y-2">
              <Label htmlFor="image-count">Number of Images</Label>
              <Select
                value={imageCount.toString()}
                onValueChange={(value) => setImageCount(parseInt(value))}
              >
                <SelectTrigger id="image-count">
                  <SelectValue placeholder="Select count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Image (5 credits)</SelectItem>
                  <SelectItem value="2">2 Images (10 credits)</SelectItem>
                  <SelectItem value="3">3 Images (15 credits)</SelectItem>
                  <SelectItem value="4">4 Images (20 credits)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <div className="grid grid-cols-2 gap-4">
                {imageRatios.map((ratio) => (
                  <Button
                    key={ratio.value}
                    variant={
                      selectedImageRatio === ratio.value ? "default" : "outline"
                    }
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => setSelectedImageRatio(ratio.value)}
                  >
                    <div className="text-lg font-semibold">{ratio.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {ratio.value}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Credit Cost Display */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
              <span className="text-sm font-medium">Total Cost:</span>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold">
                  {5 * imageCount} credits
                </span>
              </div>
            </div>

            <Button
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || credits < 5 * imageCount}
              className="w-full"
            >
              {isGeneratingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating {imageCount} Image{imageCount > 1 ? "s" : ""}...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Generate {imageCount} Image{imageCount > 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Topic Ideas Dialog */}
      <Dialog
        open={topicIdeasDialogOpen}
        onOpenChange={setTopicIdeasDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-background/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Topic Ideas</DialogTitle>
            <DialogDescription>
              {topic.trim()
                ? `Here are topic ideas related to: "${topic}"`
                : "Here are trending LinkedIn topic ideas for you"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {isGeneratingTopics ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">
                  Generating topic ideas...
                </p>
              </div>
            ) : (
              <>
                {topicIdeas.map((idea, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-4 px-4 whitespace-normal hover:bg-primary/10"
                    onClick={() => {
                      setTopic(idea);
                      setTopicIdeasDialogOpen(false);
                      toast({
                        title: "Topic selected",
                        description: "You can now generate your post",
                      });
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Badge variant="secondary" className="mt-0.5 shrink-0">
                        {index + 1}
                      </Badge>
                      <span className="text-sm leading-relaxed">{idea}</span>
                    </div>
                  </Button>
                ))}
                {topicIdeas.length === 0 && !isGeneratingTopics && (
                  <p className="text-center text-muted-foreground py-8">
                    No topic ideas generated
                  </p>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reference Material Dialog */}
      <Dialog
        open={showReferenceMaterialOptions}
        onOpenChange={setShowReferenceMaterialOptions}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-background/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Add Reference Material</DialogTitle>
            <DialogDescription>
              Attach reference content to enhance your post with additional
              context
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!referenceMaterialMode ? (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent"
                  onClick={() => setReferenceMaterialMode("voice")}
                >
                  <Mic className="h-6 w-6" />
                  <span className="text-sm font-medium">Voice Note</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent"
                  onClick={() => setReferenceMaterialMode("text")}
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-sm font-medium">Text/Transcript</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent"
                  onClick={() => setReferenceMaterialMode("url")}
                >
                  <LinkIcon className="h-6 w-6" />
                  <span className="text-sm font-medium">Article URL</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent"
                  onClick={() => setReferenceMaterialMode("youtube")}
                >
                  <Youtube className="h-6 w-6" />
                  <span className="text-sm font-medium">YouTube</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent col-span-2"
                  onClick={() => setReferenceMaterialMode("file")}
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-sm font-medium">File Upload</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReferenceMaterialMode(null);
                    setReferenceMaterialTranscript("");
                    setReferenceMaterialUrl("");
                    setReferenceMaterialFile(null);
                    setProcessedReferenceContent("");
                    setIsProcessingReference(false);
                  }}
                >
                  ← Back
                </Button>

                {referenceMaterialMode === "text" && (
                  <div className="space-y-2">
                    <Label>Text or Transcript</Label>
                    <Textarea
                      placeholder="Paste your text, transcript, or notes here..."
                      value={referenceMaterialTranscript}
                      onChange={(e) => {
                        setReferenceMaterialTranscript(e.target.value);
                        setProcessedReferenceContent(e.target.value);
                      }}
                      rows={10}
                    />
                    {processedReferenceContent && (
                      <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                          ✓ Text will be used as reference
                        </p>
                      </div>
                    )}
                    <Button
                      onClick={() => {
                        setShowReferenceMaterialOptions(false);
                        toast({
                          title: "Reference added!",
                          description:
                            "Text will be included in your post generation",
                        });
                      }}
                      disabled={!processedReferenceContent}
                      className="w-full"
                    >
                      Add Reference
                    </Button>
                  </div>
                )}

                {referenceMaterialMode === "url" && (
                  <div className="space-y-2">
                    <Label>Article URL</Label>
                    <Input
                      type="url"
                      placeholder="https://example.com/article"
                      value={referenceMaterialUrl}
                      onChange={(e) => setReferenceMaterialUrl(e.target.value)}
                    />
                    <Button
                      onClick={handleArticleUrlProcess}
                      disabled={
                        isProcessingReference || !referenceMaterialUrl.trim()
                      }
                      className="w-full"
                    >
                      {isProcessingReference ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Scraping Article...
                        </>
                      ) : (
                        "Extract Content"
                      )}
                    </Button>
                    {processedReferenceContent && (
                      <>
                        <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                            ✓ Content extracted successfully
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            setShowReferenceMaterialOptions(false);
                            toast({
                              title: "Reference added!",
                              description:
                                "Article content will be included in your post generation",
                            });
                          }}
                          className="w-full"
                        >
                          Done
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {referenceMaterialMode === "youtube" && (
                  <div className="space-y-2">
                    <Label>YouTube URL</Label>
                    <Input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={referenceMaterialUrl}
                      onChange={(e) => setReferenceMaterialUrl(e.target.value)}
                    />
                    <Button
                      onClick={handleYoutubeProcess}
                      disabled={
                        isProcessingReference || !referenceMaterialUrl.trim()
                      }
                      className="w-full"
                    >
                      {isProcessingReference ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Extracting Transcript...
                        </>
                      ) : (
                        "Extract Transcript"
                      )}
                    </Button>
                    {processedReferenceContent && (
                      <>
                        <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                            ✓ Transcript extracted successfully
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            setShowReferenceMaterialOptions(false);
                            toast({
                              title: "Reference added!",
                              description:
                                "YouTube transcript will be included in your post generation",
                            });
                          }}
                          className="w-full"
                        >
                          Done
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {referenceMaterialMode === "file" && (
                  <div className="space-y-2">
                    <Label>Upload File (PDF, TXT, DOCX)</Label>
                    <Input
                      type="file"
                      accept=".pdf,.txt,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setReferenceMaterialFile(file);
                      }}
                    />
                    {referenceMaterialFile && (
                      <>
                        <p className="text-xs text-muted-foreground">
                          Selected: {referenceMaterialFile.name}
                        </p>
                        <Button
                          onClick={handleFileProcess}
                          disabled={isProcessingReference}
                          className="w-full"
                        >
                          {isProcessingReference ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing Document...
                            </>
                          ) : (
                            "Process Document"
                          )}
                        </Button>
                      </>
                    )}
                    {processedReferenceContent && (
                      <>
                        <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                            ✓ Document processed successfully
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            setShowReferenceMaterialOptions(false);
                            toast({
                              title: "Reference added!",
                              description:
                                "Document content will be included in your post generation",
                            });
                          }}
                          className="w-full"
                        >
                          Done
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {referenceMaterialMode === "voice" && (
                  <div className="space-y-2">
                    <Label>Record Voice Note</Label>
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                      <Mic
                        className={`h-12 w-12 mb-3 ${
                          isRecording
                            ? "text-red-500 animate-pulse"
                            : "text-muted-foreground"
                        }`}
                      />
                      <Button
                        variant={isRecording ? "destructive" : "default"}
                        onClick={handleVoiceRecording}
                        disabled={isProcessingReference}
                      >
                        {isProcessingReference ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Transcribing...
                          </>
                        ) : isRecording ? (
                          "Stop Recording"
                        ) : (
                          "Start Recording"
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        {isRecording
                          ? "Recording in progress..."
                          : "Click to start recording"}
                      </p>
                    </div>
                    {processedReferenceContent && (
                      <>
                        <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg space-y-2">
                          <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                            ✓ Voice transcribed successfully
                          </p>
                          <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-md border border-green-200 dark:border-green-800">
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {processedReferenceContent}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setShowReferenceMaterialOptions(false);
                            toast({
                              title: "Reference added!",
                              description:
                                "Voice transcript will be included in your post generation",
                            });
                          }}
                          className="w-full"
                        >
                          Done
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
