'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Edit3, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const tones = [
  "Formal",
  "Casual",
  "Professional",
  "Friendly",
  "Inspirational",
  "Educational",
];

export default function CarouselV2Page() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Form states
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Formal');
  const [carouselTitle, setCarouselTitle] = useState('');
  const [slideCount, setSlideCount] = useState(7);
  const [includeOutro, setIncludeOutro] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your carousel",
        variant: "destructive",
      });
      return;
    }

    if (!carouselTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your carousel",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-carousel-slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          tone,
          carouselTitle,
          slideCount,
          includeOutro,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate carousel');
      }

      const data = await response.json();

      // Store generated slides in sessionStorage
      sessionStorage.setItem('carouselSlides', JSON.stringify(data.slides));
      sessionStorage.setItem('carouselMetadata', JSON.stringify(data.metadata));

      toast({
        title: "Carousel Generated",
        description: `Created ${data.slides.length} slides successfully!`,
      });

      router.push(`/carousel-v2/editor?title=${encodeURIComponent(carouselTitle)}&generated=true`);
    } catch (error) {
      console.error('Error generating carousel:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate carousel slides. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetIdeas = async () => {
    setIsGeneratingIdeas(true);
    try {
      const response = await fetch('/api/generate-topic-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contentType: 'carousel',
          tone: tone,
          currentTopic: topic || '',
        }),
      });

      if (!response.ok) throw new Error('Failed to generate ideas');
      
      const data = await response.json();
      if (data.topicIdeas && data.topicIdeas.length > 0) {
        // Use the first generated topic idea
        setTopic(data.topicIdeas[0]);
        toast({
          title: "Idea Generated!",
          description: "Topic has been updated with a new idea",
        });
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      toast({
        title: "Failed to generate ideas",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Carousel Maker V2</h1>
          <p className="text-muted-foreground">
            Create stunning LinkedIn carousels with AI-powered content
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Create Your Carousel
            </CardTitle>
            <CardDescription>
              Generate a professional carousel from your topic or build one manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Topic Input with Get Ideas Button */}
            <div className="space-y-2">
              <Label htmlFor="topic">Enter a topic</Label>
              <div className="relative">
                <Textarea
                  id="topic"
                  placeholder="E.g., AI scams in the digital age, social media marketing tips, etc."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={4}
                  className="resize-none pr-32"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGetIdeas}
                  disabled={isGeneratingIdeas}
                  className="absolute top-2 right-2 gap-1"
                >
                  {isGeneratingIdeas ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin" />
                      <span className="text-xs">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span className="text-xs">Get Ideas</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Tone Selector */}
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
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

            {/* Carousel Title */}
            <div className="space-y-2">
              <Label htmlFor="carouselTitle">
                Carousel Title <span className="text-xs text-muted-foreground">(Will be used on LinkedIn)</span>
              </Label>
              <Input
                id="carouselTitle"
                placeholder="Enter your carousel title..."
                value={carouselTitle}
                onChange={(e) => setCarouselTitle(e.target.value)}
              />
            </div>

            {/* Number of Slides */}
            <div className="space-y-2">
              <Label htmlFor="slideCount">Number of Slides</Label>
              <Select value={slideCount.toString()} onValueChange={(val) => setSlideCount(parseInt(val))}>
                <SelectTrigger id="slideCount">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} slides
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Include Outro */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="includeOutro">Include Outro Slide</Label>
                <p className="text-xs text-muted-foreground">
                  Show "Thank you, follow me" on last slide
                </p>
              </div>
              <Switch
                id="includeOutro"
                checked={includeOutro}
                onCheckedChange={setIncludeOutro}
              />
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
                  <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
