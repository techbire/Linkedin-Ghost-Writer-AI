'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Trash2,
  Plus,
  GripVertical,
  Download,
  Image as ImageIcon,
  Palette,
  User,
  Save,
  Monitor,
  Tablet,
  Smartphone,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const getBackgroundPattern = (texture: string, accentColor: string) => {
  switch (texture) {
    case 'Gradient':
      return `linear-gradient(135deg, ${accentColor}22, transparent)`;
    case 'Dots':
      return `radial-gradient(circle, ${accentColor}22 1px, transparent 1px)`;
    case 'Lines':
      return `repeating-linear-gradient(90deg, ${accentColor}22 0px, ${accentColor}22 1px, transparent 1px, transparent 40px)`;
    case 'Waves':
      return `repeating-linear-gradient(45deg, ${accentColor}11 0px, ${accentColor}11 2px, transparent 2px, transparent 10px)`;
    case 'Grid':
      return `linear-gradient(${accentColor}22 1px, transparent 1px), linear-gradient(90deg, ${accentColor}22 1px, transparent 1px)`;
    default:
      return 'none';
  }
};

interface Slide {
  id: string;
  title: string;
  content: string;
  number: number;
}

const colorPalettes = [
  { name: 'Professional', colors: ['#2F8A49', '#1F5A31', '#E8F3EA', '#FFFFFF'] },
  { name: 'Bold', colors: ['#D24B40', '#8B2E27', '#FFE5E3', '#FFFFFF'] },
  { name: 'Ocean', colors: ['#2196F3', '#0D47A1', '#E3F2FD', '#FFFFFF'] },
  { name: 'Sunset', colors: ['#FF5722', '#BF360C', '#FFE0B2', '#FFFFFF'] },
  { name: 'Purple', colors: ['#9C27B0', '#4A148C', '#F3E5F5', '#FFFFFF'] },
  { name: 'Teal', colors: ['#009688', '#004D40', '#E0F2F1', '#FFFFFF'] },
];

const backgrounds = [
  'None',
  'Gradient',
  'Dots',
  'Lines',
  'Waves',
  'Grid',
];

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [carouselTitle, setCarouselTitle] = useState('');
  const [slides, setSlides] = useState<Slide[]>([
    { id: '1', title: 'Intro Slide', content: 'Welcome to the carousel', number: 1 },
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Design settings
  const [logo, setLogo] = useState<string | null>(null);
  const [showNumbers, setShowNumbers] = useState(true);
  const [useCustomColors, setUseCustomColors] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState(0);
  const [backgroundTexture, setBackgroundTexture] = useState('None');

  // Headshot settings
  const [showHeadshot, setShowHeadshot] = useState(true);
  const [headshot, setHeadshot] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userHandle, setUserHandle] = useState('');
  const [headshotIntroOutroOnly, setHeadshotIntroOutroOnly] = useState(false);

  // LinkedIn preview
  const [linkedInComment, setLinkedInComment] = useState('');
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const title = searchParams.get('title');
    const generated = searchParams.get('generated');
    
    if (title) {
      setCarouselTitle(decodeURIComponent(title));
    }

    // Load generated slides from sessionStorage if available
    if (generated === 'true') {
      const storedSlides = sessionStorage.getItem('carouselSlides');
      if (storedSlides) {
        try {
          const parsedSlides = JSON.parse(storedSlides);
          setSlides(parsedSlides);
          sessionStorage.removeItem('carouselSlides'); // Clean up
          sessionStorage.removeItem('carouselMetadata');
        } catch (error) {
          console.error('Error loading generated slides:', error);
        }
      }
    }
  }, [searchParams]);

  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: `Slide ${slides.length + 1}`,
      content: 'Add your content here...',
      number: slides.length + 1,
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  const deleteSlide = (index: number) => {
    if (slides.length === 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one slide",
        variant: "destructive",
      });
      return;
    }
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1);
    }
  };

  const updateSlide = (index: number, field: 'title' | 'content', value: string) => {
    const newSlides = [...slides];
    newSlides[index][field] = value;
    setSlides(newSlides);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeadshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setHeadshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!carouselTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a carousel title before saving",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Saving to Library",
      description: "Saving your carousel...",
    });

    try {
      const response = await fetch('/api/save-carousel-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: carouselTitle,
          slides,
          design: {
            colors: colorPalettes[selectedPalette].colors,
            backgroundTexture,
            showNumbers,
            logo,
          },
          headshot: showHeadshot ? {
            show: true,
            image: headshot,
            name: userName,
            handle: userHandle,
            introOutroOnly: headshotIntroOutroOnly,
          } : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save carousel');
      }

      const data = await response.json();
      
      toast({
        title: "Saved Successfully",
        description: "Your carousel has been saved to the library",
      });
    } catch (error) {
      console.error('Error saving carousel:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save carousel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    toast({
      title: "Exporting Carousel",
      description: `Generating ${slides.length} slides...`,
    });

    try {
      const response = await fetch('/api/export-carousel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slides,
          carouselTitle,
          design: {
            colors: colorPalettes[selectedPalette].colors,
            backgroundTexture,
            showNumbers,
            logo,
          },
          headshot: showHeadshot ? {
            show: true,
            image: headshot,
            name: userName,
            handle: userHandle,
            introOutroOnly: headshotIntroOutroOnly,
          } : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export carousel');
      }

      // Download the ZIP file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${carouselTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-carousel.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Complete",
        description: `Successfully exported ${slides.length} slides!`,
      });
    } catch (error) {
      console.error('Error exporting carousel:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export carousel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCarousel = () => {
    if (confirm('Are you sure you want to delete this carousel?')) {
      router.push('/carousel-v2');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/carousel-v2')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteCarousel}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Carousel
          </Button>
        </div>

        {/* Carousel Title & Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <Input
                  value={carouselTitle}
                  onChange={(e) => setCarouselTitle(e.target.value)}
                  className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0"
                  placeholder="Enter carousel title..."
                />
                <p className="text-sm text-muted-foreground">
                  {slides.length} {slides.length === 1 ? 'slide' : 'slides'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveToLibrary} variant="outline" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Save to Library
                </Button>
                <Button onClick={handleExport} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Editor Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Tabs */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="slides" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="slides">Slides</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="headshot">Headshot</TabsTrigger>
              </TabsList>

              {/* Slides Tab */}
              <TabsContent value="slides" className="space-y-4 mt-4">
                <Button onClick={addSlide} variant="outline" className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Add Slide
                </Button>

                <div className="space-y-2">
                  {slides.map((slide, index) => (
                    <Card
                      key={slide.id}
                      className={`cursor-pointer transition-all ${
                        currentSlideIndex === index
                          ? 'ring-2 ring-primary'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setCurrentSlideIndex(index)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          {showNumbers && (
                            <span className="text-xs font-semibold text-primary">
                              {index + 1}
                            </span>
                          )}
                          <p className="text-sm font-medium truncate">{slide.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {slide.content}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSlide(index);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Design Tab */}
              <TabsContent value="design" className="space-y-6 mt-4">
                {/* Logo */}
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="flex-1"
                    />
                    {logo && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLogo(null)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {logo && (
                    <img src={logo} alt="Logo" className="h-12 w-auto mt-2" />
                  )}
                </div>

                {/* Show Numbers */}
                <div className="flex items-center justify-between">
                  <Label>Show Numbers</Label>
                  <Switch checked={showNumbers} onCheckedChange={setShowNumbers} />
                </div>

                {/* Color Palette */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Use Custom Colors</Label>
                    <Switch
                      checked={useCustomColors}
                      onCheckedChange={setUseCustomColors}
                    />
                  </div>
                  {!useCustomColors && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {colorPalettes.map((palette, index) => (
                        <Button
                          key={index}
                          variant={selectedPalette === index ? 'default' : 'outline'}
                          className="h-auto flex-col items-start p-3"
                          onClick={() => setSelectedPalette(index)}
                        >
                          <span className="text-xs font-medium mb-1">
                            {palette.name}
                          </span>
                          <div className="flex gap-1">
                            {palette.colors.map((color, i) => (
                              <div
                                key={i}
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Background */}
                <div className="space-y-2">
                  <Label>Background Texture</Label>
                  <Select
                    value={backgroundTexture}
                    onValueChange={setBackgroundTexture}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {backgrounds.map((bg) => (
                        <SelectItem key={bg} value={bg}>
                          {bg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Headshot Tab */}
              <TabsContent value="headshot" className="space-y-6 mt-4">
                {/* Show Headshot */}
                <div className="flex items-center justify-between">
                  <Label>Show Headshot</Label>
                  <Switch
                    checked={showHeadshot}
                    onCheckedChange={setShowHeadshot}
                  />
                </div>

                {showHeadshot && (
                  <>
                    {/* Profile Pic */}
                    <div className="space-y-2">
                      <Label>Upload Profile Pic</Label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleHeadshotUpload}
                          className="flex-1"
                        />
                        {headshot && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setHeadshot(null)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {headshot && (
                        <img
                          src={headshot}
                          alt="Profile"
                          className="h-16 w-16 rounded-full mt-2"
                        />
                      )}
                    </div>

                    {/* Your Name */}
                    <div className="space-y-2">
                      <Label>Your Name</Label>
                      <Input
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name"
                      />
                    </div>

                    {/* Your Handle */}
                    <div className="space-y-2">
                      <Label>Your Handle</Label>
                      <Input
                        value={userHandle}
                        onChange={(e) => setUserHandle(e.target.value)}
                        placeholder="@yourhandle"
                      />
                    </div>

                    {/* Show only in Intro & Outro */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="intro-outro"
                        checked={headshotIntroOutroOnly}
                        onCheckedChange={setHeadshotIntroOutroOnly}
                      />
                      <Label htmlFor="intro-outro" className="text-sm">
                        Show only in "Intro" and "Outro" slides
                      </Label>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Side - Slide Editor & Preview */}
          <div className="lg:col-span-2 space-y-4">
            {/* Slide Editor */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Edit Slide {currentSlideIndex + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Slide Title</Label>
                  <Input
                    value={slides[currentSlideIndex]?.title || ''}
                    onChange={(e) =>
                      updateSlide(currentSlideIndex, 'title', e.target.value)
                    }
                    placeholder="Enter slide title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slide Content</Label>
                  <Textarea
                    value={slides[currentSlideIndex]?.content || ''}
                    onChange={(e) =>
                      updateSlide(currentSlideIndex, 'content', e.target.value)
                    }
                    placeholder="Enter slide content..."
                    rows={8}
                  />
                </div>
              </CardContent>
            </Card>

            {/* LinkedIn Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>LinkedIn Preview</CardTitle>
                  <div className="flex items-center gap-1 border rounded-lg p-1">
                    <Button
                      variant={previewMode === 'mobile' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                      className="h-8 w-8 p-0"
                      title="Mobile View"
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'tablet' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('tablet')}
                      className="h-8 w-8 p-0"
                      title="Tablet View"
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'desktop' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                      className="h-8 w-8 p-0"
                      title="Desktop View"
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Responsive Preview Container */}
                <div className="flex justify-center">
                  <div
                    className="transition-all duration-300 w-full"
                    style={{
                      maxWidth: previewMode === 'mobile' ? '375px' : previewMode === 'tablet' ? '768px' : '100%',
                    }}
                  >
                    <div className="space-y-4">
                      {/* Profile Header */}
                      {showHeadshot && (
                        <div className="flex items-center gap-3">
                          {headshot ? (
                            <img
                              src={headshot}
                              alt="Profile"
                              className="h-12 w-12 rounded-full"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">
                              {userName || 'Your Name'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {userHandle || '@yourhandle'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Slide Preview */}
                      <div
                        className="relative border rounded-lg p-9 aspect-square flex flex-col justify-center items-center text-center scale-90"
                        style={{
                          backgroundColor: colorPalettes[selectedPalette].colors[2],
                          color: colorPalettes[selectedPalette].colors[0],
                          backgroundImage: backgroundTexture !== 'None' ? getBackgroundPattern(backgroundTexture, colorPalettes[selectedPalette].colors[1]) : 'none',
                          backgroundSize: backgroundTexture === 'Gradient' ? 'cover' : '40px 40px',
                        }}
                      >
                        {logo && (
                          <img
                            src={logo}
                            alt="Logo"
                            className="absolute top-4 right-4 w-auto"
                            style={{
                              height: previewMode === 'mobile' ? '1.5rem' : previewMode === 'tablet' ? '2.52rem' : '2.88rem'
                            }}
                          />
                        )}
                        
                        {/* Main Content - Always Centered */}
                        <div className="flex flex-col items-center justify-center">
                          {showNumbers && (
                            <div 
                              className="font-bold mb-4"
                              style={{
                                fontSize: previewMode === 'mobile' ? '1.5rem' : previewMode === 'tablet' ? '2.88rem' : '3.24rem'
                              }}
                            >
                              {currentSlideIndex + 1}
                            </div>
                          )}
                          <h2 
                            className="font-bold mb-4"
                            style={{
                              fontSize: previewMode === 'mobile' ? '1rem' : previewMode === 'tablet' ? '1.8rem' : '2.16rem'
                            }}
                          >
                            {slides[currentSlideIndex]?.title}
                          </h2>
                          <p 
                            style={{
                              fontSize: previewMode === 'mobile' ? '0.75rem' : previewMode === 'tablet' ? '1.26rem' : '1.44rem'
                            }}
                          >
                            {slides[currentSlideIndex]?.content}
                          </p>
                        </div>
                        
                        {/* Headshot - Absolutely Positioned at Bottom */}
                        {showHeadshot && headshot && (
                          <div 
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2"
                            style={{
                              fontSize: previewMode === 'mobile' ? '0.625rem' : previewMode === 'tablet' ? '1.08rem' : '1.26rem'
                            }}
                          >
                            <img
                              src={headshot}
                              alt="Profile"
                              className="rounded-full"
                              style={{
                                width: previewMode === 'mobile' ? '1.5rem' : previewMode === 'tablet' ? '2.52rem' : '2.88rem',
                                height: previewMode === 'mobile' ? '1.5rem' : previewMode === 'tablet' ? '2.52rem' : '2.88rem'
                              }}
                            />
                            <p>{userHandle}</p>
                          </div>
                        )}
                      </div>                      {/* Add First Comment */}
                      <div className="space-y-2">
                        <Label>Add first comment</Label>
                        <Textarea
                          value={linkedInComment}
                          onChange={(e) => setLinkedInComment(e.target.value)}
                          placeholder="Write your first comment..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CarouselV2EditorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditorContent />
    </Suspense>
  );
}
