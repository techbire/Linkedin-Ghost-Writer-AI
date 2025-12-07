'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Sparkles, Copy, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function GenerateWithTemplateContent() {
  const router = useRouter();
  const { toast } = useToast();

  // Template data from sessionStorage
  const [templateData, setTemplateData] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');

  // Post generation state
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Refinement state
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showRefinementInput, setShowRefinementInput] = useState(false);

  // Edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');

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
    setIsEditMode(false);

    try {
      console.log("=".repeat(80));
      console.log("[Generate With Template] 🎯 GENERATING POST:");
      console.log("[Generate With Template] Topic:", topic);
      console.log("[Generate With Template] User ID:", userId);
      console.log("[Generate With Template] Template:", templateData?.title || templateData?.personName);
      console.log("[Generate With Template] Is Preset:", templateData?.isPreset || false);
      console.log("=".repeat(80));

      const response = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          topic,
          writingTemplate: templateData,
          useProfileData: true,  // ✅ Enable profile context (business + voice analysis)
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate post");
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      setEditedContent(data.content);
      
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
          originalPost: isEditMode ? editedContent : generatedContent,
          refinementPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refine post");
      }

      const data = await response.json();
      const refinedContent = data.refinedPost;

      if (isEditMode) {
        setEditedContent(refinedContent);
      } else {
        setGeneratedContent(refinedContent);
        setEditedContent(refinedContent);
      }

      setRefinementPrompt("");
      setShowRefinementInput(false);

      toast({
        title: "✅ Post Refined",
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

  const handleSaveAndReturn = () => {
    // Clear sessionStorage when returning to dashboard
    sessionStorage.removeItem('selectedTemplate');
    sessionStorage.removeItem('selectedTemplateUserId');
    
    toast({
      title: "✅ Success",
      description: "Returning to dashboard",
    });
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
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-2xl">
                    {templateData.title || templateData.personName || 'Template'}
                  </CardTitle>
                  <Badge variant={templateData.isPreset ? "default" : "secondary"}>
                    {templateData.isPreset ? "Preset Template" : "Custom Template"}
                  </Badge>
                  {templateData.category && (
                    <Badge variant="outline">{templateData.category}</Badge>
                  )}
                </div>
                <CardDescription>
                  Generate content using this writing template
                </CardDescription>
              </div>
              <Sparkles className="h-8 w-8 text-primary flex-shrink-0" />
            </div>
          </CardHeader>
        </Card>

        {/* Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Post</CardTitle>
            <CardDescription>
              Enter a topic and we'll create content using your selected template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic or Post Idea</Label>
              <Textarea
                id="topic"
                placeholder="e.g., How to scale a SaaS startup, Tips for effective leadership, Building a personal brand..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Describe what you want to write about
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Post...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Post
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Content */}
        {(generatedContent || isGenerating) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Content</CardTitle>
                {generatedContent && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    {isEditMode ? (
                      <>
                        <Button
                          size="sm"
                          onClick={handleSave}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={handleSaveAndReturn}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save & Return
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditMode(true)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={handleSaveAndReturn}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Done
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isGenerating ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isEditMode ? (
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              ) : (
                <div className="prose prose-sm max-w-none p-4 bg-muted/50 rounded-lg">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {generatedContent}
                  </pre>
                </div>
              )}

              {generatedContent && (
                <div className="space-y-4 pt-4 border-t">
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
                      <Label htmlFor="refinement">Refinement Instructions</Label>
                      <Textarea
                        id="refinement"
                        placeholder="e.g., Make it more professional, Add more examples, Shorten it..."
                        value={refinementPrompt}
                        onChange={(e) => setRefinementPrompt(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowRefinementInput(false);
                            setRefinementPrompt('');
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
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
                            'Apply Refinement'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default GenerateWithTemplateContent;
