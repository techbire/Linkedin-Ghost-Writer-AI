'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Loader2, 
  Sparkles, 
  Copy, 
  Save, 
  RefreshCw, 
  Link as LinkIcon,
  Youtube,
  FileText,
  Mic,
  Upload,
  Lightbulb,
  Eye,
  Edit,
  Bookmark
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GroundedContentDisplay } from "@/components/dashboard/grounded-content-display";

const tones = [
  "Standard (authoritative)",
  "Witty",
  "Expert",
  "Casual",
  "Inspirational",
  "Storytelling",
  "Data-driven",
];

const contentTypes = [
  "Story",
  "Steps",
  "Lists",
];

const hooks = {
  Curiosity: [
    "You're doing this completely wrong…",
    "Nobody talks about this, but it changes everything.",
    "What if you could [achieve result] without [pain point]?",
  ],
  Value: [
    "Here's how to do [X] in under 10 minutes.",
    "Save this if you want to [achieve outcome].",
    "Don't scroll—this will change how you [task].",
  ],
  Shock: [
    "I was today years old when I learned this.",
    "This shouldn't have worked… but it did.",
    "No one warned me about this.",
  ],
  Relatability: [
    "Tell me you're a [blank] without telling me…",
    "If you've ever said 'I'll start tomorrow,' this is for you.",
    "You're not the only one who [common struggle].",
  ],
  FOMO: [
    "If you're not doing this in 2025, you're already behind.",
    "This trend is peaking—don't miss it.",
    "Mark my words, this is about to blow up.",
  ],
};

export default function GenerateWithTemplateContent() {
  const router = useRouter();
  const { toast } = useToast();

  // Template data from sessionStorage
  const [templateData, setTemplateData] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');

  // Input states
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState("Standard (authoritative)");
  const [contentType, setContentType] = useState("Story");
  const [selectedHook, setSelectedHook] = useState<string>("");
  const [isDeepResearch, setIsDeepResearch] = useState(false);

  // Reference Material states (EXACT copy from create-post-form)
  const [referenceMaterialMode, setReferenceMaterialMode] = useState<"text" | "url" | "youtube" | "file" | "voice" | null>(null);
  const [referenceMaterialTranscript, setReferenceMaterialTranscript] = useState("");
  const [referenceMaterialUrl, setReferenceMaterialUrl] = useState("");
  const [referenceMaterialFile, setReferenceMaterialFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showReferenceMaterialOptions, setShowReferenceMaterialOptions] = useState(false);
  const [isProcessingReference, setIsProcessingReference] = useState(false);
  const [processedReferenceContent, setProcessedReferenceContent] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  // Post generation state
  const [generatedContent, setGeneratedContent] = useState('');
  const [groundingMetadata, setGroundingMetadata] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Refinement state
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showRefinementInput, setShowRefinementInput] = useState(false);

  // Edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  // Saving
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Get template data from sessionStorage instead of URL params
    console.log('[Generate With Template] Page loaded');
    
    // Skip if we already have template data (prevents re-running in Strict Mode)
    if (templateData) {
      console.log('[Generate With Template] Template already loaded, skipping...');
      return;
    }
    
    try {
      const templateStr = sessionStorage.getItem('selectedTemplate');
      const userIdStr = sessionStorage.getItem('selectedTemplateUserId');

      console.log('[Generate With Template] Template exists in sessionStorage:', !!templateStr);
      console.log('[Generate With Template] UserId exists in sessionStorage:', !!userIdStr);

      if (!templateStr || !userIdStr) {
        console.error('[Generate With Template] Missing data in sessionStorage');
        toast({
          title: "Missing Data",
          description: "Template data not found. Redirecting...",
          variant: "destructive",
        });
        setTimeout(() => router.push('/dashboard'), 2000);
        return;
      }

      const parsedTemplate = JSON.parse(templateStr);
      console.log('[Generate With Template] ✅ Template loaded successfully:', parsedTemplate.title || parsedTemplate.category);
      setTemplateData(parsedTemplate);
      setUserId(userIdStr);

      // Don't clear sessionStorage here - let it persist during the session
      // It will be cleared when user navigates away or closes browser
    } catch (error) {
      console.error('[Generate With Template] Failed to load template data:', error);
      toast({
        title: "Error",
        description: "Failed to load template data",
        variant: "destructive",
      });
      setTimeout(() => router.push('/dashboard'), 2000);
    }
  }, [router, toast, templateData]);

  // Reference Material Handlers (EXACT copy from create-post-form)
  const handleVoiceRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          setIsProcessingReference(true);

          try {
            const formData = new FormData();
            formData.append('audio', audioBlob);

            const response = await fetch('/api/transcribe-voice', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) throw new Error('Transcription failed');

            const data = await response.json();
            setReferenceMaterialTranscript(data.transcript);
            setProcessedReferenceContent(data.transcript);
            
            toast({
              title: "Voice Transcribed!",
              description: "Your voice note has been converted to text",
            });
          } catch (error) {
            console.error('Transcription error:', error);
            toast({
              title: "Transcription Failed",
              description: "Could not transcribe your voice note",
              variant: "destructive",
            });
          } finally {
            setIsProcessingReference(false);
            stream.getTracks().forEach(track => track.stop());
          }
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        setAudioChunks([]);
      } catch (error) {
        console.error('Microphone access error:', error);
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to record",
          variant: "destructive",
        });
      }
    } else {
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
      }
    }
  };

  const handleArticleUrlProcess = async () => {
    if (!referenceMaterialUrl.trim()) return;

    setIsProcessingReference(true);

    try {
      const response = await fetch('/api/scrape-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: referenceMaterialUrl }),
      });

      if (!response.ok) throw new Error('Failed to scrape article');

      const data = await response.json();
      setProcessedReferenceContent(data.content);
      
      toast({
        title: "Article Scraped!",
        description: "Content extracted successfully",
      });
    } catch (error) {
      console.error('Article scraping error:', error);
      toast({
        title: "Scraping Failed",
        description: "Could not extract article content",
        variant: "destructive",
      });
    } finally {
      setIsProcessingReference(false);
    }
  };

  const handleYoutubeProcess = async () => {
    if (!referenceMaterialUrl.trim()) return;

    setIsProcessingReference(true);

    try {
      const response = await fetch('/api/extract-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: referenceMaterialUrl }),
      });

      if (!response.ok) throw new Error('Failed to extract YouTube transcript');

      const data = await response.json();
      setProcessedReferenceContent(data.transcript);
      
      toast({
        title: "Transcript Extracted!",
        description: "YouTube transcript ready to use",
      });
    } catch (error) {
      console.error('YouTube extraction error:', error);
      toast({
        title: "Extraction Failed",
        description: "Could not extract YouTube transcript",
        variant: "destructive",
      });
    } finally {
      setIsProcessingReference(false);
    }
  };

  const handleFileProcess = async () => {
    if (!referenceMaterialFile) return;

    setIsProcessingReference(true);

    try {
      const formData = new FormData();
      formData.append('file', referenceMaterialFile);

      const response = await fetch('/api/process-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to process document');

      const data = await response.json();
      setProcessedReferenceContent(data.content);
      
      toast({
        title: "Document Processed!",
        description: "Content extracted successfully",
      });
    } catch (error) {
      console.error('Document processing error:', error);
      toast({
        title: "Processing Failed",
        description: "Could not process document",
        variant: "destructive",
      });
    } finally {
      setIsProcessingReference(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your post",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");
    setGroundingMetadata(null);
    setIsEditMode(false);

    try {
      console.log("=".repeat(80));
      console.log("[Generate With Template] 🎯 GENERATING POST:");
      console.log("[Generate With Template] Topic:", topic);
      console.log("[Generate With Template] User ID:", userId);
      console.log("[Generate With Template] Template:", templateData?.title || templateData?.personName);
      console.log("[Generate With Template] Is Preset:", templateData?.isPreset || false);
      console.log("[Generate With Template] Tone:", tone);
      console.log("[Generate With Template] Content Type:", contentType);
      console.log("[Generate With Template] Hook:", selectedHook || "None");
      console.log("[Generate With Template] Deep Research:", isDeepResearch);
      console.log("=".repeat(80));

      const requestBody: any = {
        userId,
        topic,  // Always use topic (can contain URL too)
        useProfileData: true,  // ✅ Enable profile context (business + voice analysis)
        writingTemplate: templateData,
        tone,
        contentType,
        hook: selectedHook || undefined,
        isDeepResearch,
      };

      // Add reference material if provided (EXACT pattern from create-post-form)
      if (processedReferenceContent) {
        requestBody.referenceMaterial = {
          type: referenceMaterialMode,
          content: processedReferenceContent
        };
      }

      const response = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to generate post");
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      setEditedContent(data.content);
      
      // Set grounding metadata if deep research was used
      if (data.groundingMetadata) {
        setGroundingMetadata(data.groundingMetadata);
      }
      
      toast({
        title: "✅ Post Generated",
        description: "Your post has been generated successfully!",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!refinementPrompt.trim()) {
      toast({
        title: "Refinement Prompt Required",
        description: "Please enter how you'd like to refine the post",
        variant: "destructive",
      });
      return;
    }

    setIsRefining(true);

    try {
      const response = await fetch("/api/refine-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          originalContent: isEditMode ? editedContent : generatedContent,
          refinementPrompt,
          writingTemplate: templateData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refine post");
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      setEditedContent(data.content);
      setRefinementPrompt("");
      setShowRefinementInput(false);
      
      toast({
        title: "✨ Post Refined",
        description: "Your post has been refined successfully!",
      });
    } catch (error) {
      console.error("Refinement error:", error);
      toast({
        title: "Refinement Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopy = () => {
    const contentToCopy = isEditMode ? editedContent : generatedContent;
    navigator.clipboard.writeText(contentToCopy);
    toast({
      title: "📋 Copied!",
      description: "Post content copied to clipboard",
    });
  };

  const handleSave = () => {
    setGeneratedContent(editedContent);
    setIsEditMode(false);
    toast({
      title: "💾 Saved",
      description: "Changes saved successfully",
    });
  };

  const handleSaveToLibrary = async () => {
    if (!generatedContent.trim()) {
      toast({
        title: "No Content",
        description: "Please generate a post first",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          content: isEditMode ? editedContent : generatedContent,
          topic: topic,
          tone,
          content_type: contentType,
          template_id: templateData?.id || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save post");
      }

      toast({
        title: "✅ Saved to Library",
        description: "Post saved successfully!",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReturn = () => {
    // Clear sessionStorage when returning to dashboard
    sessionStorage.removeItem('selectedTemplate');
    sessionStorage.removeItem('selectedTemplateUserId');
    router.push('/dashboard');
  };

  if (!templateData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              // Clear sessionStorage when going back
              sessionStorage.removeItem('selectedTemplate');
              sessionStorage.removeItem('selectedTemplateUserId');
              router.push('/dashboard');
            }}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Template Info Card */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">
                  {templateData.title || templateData.personName || templateData.category}
                </CardTitle>
                <CardDescription>
                  Generate posts using this {templateData.isPreset ? 'preset' : 'custom'} template
                </CardDescription>
              </div>
              <Badge variant={templateData.isPreset ? "default" : "secondary"}>
                {templateData.isPreset ? '🎯 Preset' : '✍️ Custom'} Template
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {templateData.category && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">Category:</span>
                <Badge variant="outline">{templateData.category}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Generation Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate Post
            </CardTitle>
            <CardDescription>
              Fill in the details below to generate your LinkedIn post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Topic Input */}
            <div className="space-y-2">
              <Label htmlFor="topic">Post Topic *</Label>
              <Textarea
                id="topic"
                placeholder="What do you want to write about?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground">
                Enter your topic or paste a URL to generate content
              </p>
            </div>

            {/* Post Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tone */}
              <div className="space-y-2">
                <Label htmlFor="tone">Post Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Select tone" />
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

              {/* Content Type */}
              <div className="space-y-2">
                <Label htmlFor="contentType">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger id="contentType">
                    <SelectValue placeholder="Select type" />
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

            {/* Hook Input
            <div className="space-y-2">
              <Label htmlFor="hook">Hook (Optional)</Label>
              <Input
                id="hook"
                placeholder="Enter a hook to start your post"
                value={selectedHook}
                onChange={(e) => setSelectedHook(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Add a compelling hook to grab attention
              </p>
            </div> */}

            {/* Deep Research Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="deep-research"
                checked={isDeepResearch}
                onCheckedChange={setIsDeepResearch}
              />
              <Label htmlFor="deep-research" className="flex items-center gap-2 cursor-pointer">
                <Lightbulb className="h-4 w-4" />
                Enable Deep Research (Google Search)
              </Label>
            </div>

            {/* Reference Material */}
            <div className="space-y-2">
              <Label>Reference Material (Optional)</Label>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowReferenceMaterialOptions(true)}
              >
                <FileText className="mr-2 h-4 w-4" />
                {processedReferenceContent 
                  ? `Reference Added (${referenceMaterialMode})` 
                  : "Add Reference Material"}
              </Button>
              {processedReferenceContent && (
                <div className="p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded text-xs text-green-700 dark:text-green-300">
                  ✓ Reference material will be included in generation
                </div>
              )}
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
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
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Post
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Content */}
        {generatedContent && (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Post</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditMode(!isEditMode)}
                  >
                    {isEditMode ? (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveToLibrary}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Bookmark className="h-4 w-4 mr-2" />
                    )}
                    Save to Library
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditMode ? (
                <div className="space-y-4">
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[300px] font-mono"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSave} variant="default">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => {
                        setEditedContent(generatedContent);
                        setIsEditMode(false);
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Display with citation hover if grounding metadata exists, otherwise simple display */}
                  {groundingMetadata ? (
                    <GroundedContentDisplay 
                      content={generatedContent}
                      groundingMetadata={groundingMetadata} 
                    />
                  ) : (
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap font-sans bg-muted p-4 rounded-lg">
                        {generatedContent}
                      </pre>
                    </div>
                  )}
                </>
              )}

              {/* Refinement */}
              {!showRefinementInput ? (
                <Button
                  variant="outline"
                  onClick={() => setShowRefinementInput(true)}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refine Post
                </Button>
              ) : (
                <div className="space-y-4 border-t pt-4">
                  <Label htmlFor="refinement">Refinement Instructions</Label>
                  <Textarea
                    id="refinement"
                    placeholder="How would you like to refine this post?"
                    value={refinementPrompt}
                    onChange={(e) => setRefinementPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRefine}
                      disabled={isRefining}
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
                          Apply Refinement
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRefinementInput(false);
                        setRefinementPrompt("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Return to Dashboard */}
              <Button
                variant="secondary"
                onClick={handleReturn}
                className="w-full"
              >
                Done - Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reference Material Dialog (EXACT copy from create-post-form) */}
      <Dialog open={showReferenceMaterialOptions} onOpenChange={setShowReferenceMaterialOptions}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-background/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Add Reference Material</DialogTitle>
            <DialogDescription>
              Attach reference content to enhance your post with additional context
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
                    setReferenceMaterialMode(null)
                    setReferenceMaterialTranscript("")
                    setReferenceMaterialUrl("")
                    setReferenceMaterialFile(null)
                    setProcessedReferenceContent("")
                    setIsProcessingReference(false)
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
                        setReferenceMaterialTranscript(e.target.value)
                        setProcessedReferenceContent(e.target.value)
                      }}
                      rows={10}
                    />
                    {processedReferenceContent && (
                      <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-xs text-green-700 dark:text-green-300 font-medium">✓ Text will be used as reference</p>
                      </div>
                    )}
                    <Button
                      onClick={() => {
                        setShowReferenceMaterialOptions(false)
                        toast({
                          title: "Reference added!",
                          description: "Text will be included in your post generation",
                        })
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
                      disabled={isProcessingReference || !referenceMaterialUrl.trim()}
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
                          <p className="text-xs text-green-700 dark:text-green-300 font-medium">✓ Content extracted successfully</p>
                        </div>
                        <Button
                          onClick={() => {
                            setShowReferenceMaterialOptions(false)
                            toast({
                              title: "Reference added!",
                              description: "Article content will be included in your post generation",
                            })
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
                      disabled={isProcessingReference || !referenceMaterialUrl.trim()}
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
                          <p className="text-xs text-green-700 dark:text-green-300 font-medium">✓ Transcript extracted successfully</p>
                        </div>
                        <Button
                          onClick={() => {
                            setShowReferenceMaterialOptions(false)
                            toast({
                              title: "Reference added!",
                              description: "YouTube transcript will be included in your post generation",
                            })
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
                        const file = e.target.files?.[0]
                        if (file) setReferenceMaterialFile(file)
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
                          <p className="text-xs text-green-700 dark:text-green-300 font-medium">✓ Document processed successfully</p>
                        </div>
                        <Button
                          onClick={() => {
                            setShowReferenceMaterialOptions(false)
                            toast({
                              title: "Reference added!",
                              description: "Document content will be included in your post generation",
                            })
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
                      <Mic className={`h-12 w-12 mb-3 ${isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
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
                        {isRecording ? "Recording in progress..." : "Click to start recording"}
                      </p>
                    </div>
                    {processedReferenceContent && (
                      <>
                        <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg space-y-2">
                          <p className="text-xs text-green-700 dark:text-green-300 font-medium">✓ Voice transcribed successfully</p>
                          <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-md border border-green-200 dark:border-green-800">
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{processedReferenceContent}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setShowReferenceMaterialOptions(false)
                            toast({
                              title: "Reference added!",
                              description: "Voice transcript will be included in your post generation",
                            })
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
