"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Edit,
  Copy,
  Calendar,
  Trash2,
  MoreVertical,
  Bookmark,
  Eye,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Undo2,
  Delete,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { SchedulePostDialog } from "./schedule-post-dialog";
import { formatISOToReadableDate } from "@/lib/utils";

interface Post {
  id: string;
  content: string;
  status: string;
  scheduled_date: string | null;
  category: string | null;
  tone: string;
  created_at: string;
  post_type?: "single" | "carousel";
  slides?: string[] | null;
  image_urls?: string[] | null;
  theme?: {
    primary: string;
    secondary: string;
  } | null;
}

interface PostLibraryContentProps {
  initialPosts: Post[];
  userId: string;
}

export function PostLibraryContent({
  initialPosts,
  userId,
}: PostLibraryContentProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingPost, setViewingPost] = useState<Post | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
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

  const handleSchedule = (postId: string) => {
    setSelectedPostId(postId);
    setScheduleDialogOpen(true);
  };

  const handleScheduleSuccess = (postId: string, scheduledDate: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, scheduled_date: scheduledDate, status: "scheduled" }
          : post
      )
    );
    setScheduleDialogOpen(false);
    setSelectedPostId(null);
  };

  const handleView = (post: Post) => {
    setViewingPost(post);
    setCurrentSlideIndex(0);
    setViewDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      setPosts(posts.filter((post) => post.id !== id));
      toast({
        title: "Deleted!",
        description: "Post removed from library",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      draft: "secondary",
      scheduled: "default",
      published: "outline",
    };
    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status}
      </Badge>
    );
  };
  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bookmark className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-muted-foreground text-center">
              No posts yet. Create your first LinkedIn post!
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/dashboard/create-post")}
            >
              Create Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="w-full">
          {posts.map((post) => (
            <div className="my-2 border-b pb-5">
              <div className="py-3 text-xl font-bold ">
                {formatISOToReadableDate(post.created_at)}
              </div>
              <Card
                key={post.id}
                className="flex flex-col bg-[#F7F8FA] dark:bg-card"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 flex items-center gap-2">
                      {getStatusBadge(post.status)}
                      {post.post_type === "carousel" && (
                        <Badge variant="outline" className="text-xs">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          Carousel
                        </Badge>
                      )}
                    </div>
                    {/* <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(post)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCopy(post.content)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleSchedule(post.id)}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(post.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu> */}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-xs line-clamp-7 border-b mb-2 whitespace-pre-wrap">
                    {post.content}
                  </p>
                  <div className="w-full flex items-center justify-between py-2">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-bold">
                        Building a Personal Brand for Career
                        Advancement_Dummy_prompt
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {post.tone}
                      </div>
                      <div>
                        {post.scheduled_date && (
                          <p className="text-xs text-muted-foreground">
                            Scheduled on{" "}
                            {format(
                              new Date(post.scheduled_date),
                              "MMM d, yyyy"
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleDelete(post.id)}
                        className="hover:bg-red-100 hover:text-red-500"
                        variant="ghost"
                      >
                        <Trash2 />
                      </Button>
                      <Button
                        disabled={post.scheduled_date ? true : false}
                        onClick={() => handleSchedule(post.id)}
                        variant="ghost"
                      >
                        <Calendar />
                      </Button>
                      <Button
                        onClick={() => handleCopy(post.content)}
                        variant="ghost"
                      >
                        <Copy />
                      </Button>
                      <Button variant="ghost">
                        <Undo2 />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {selectedPostId && (
        <SchedulePostDialog
          postId={selectedPostId}
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          onSuccess={handleScheduleSuccess}
        />
      )}

      {/* View Post Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewingPost?.post_type === "carousel"
                ? "Carousel Post"
                : "Post Preview"}
            </DialogTitle>
            <DialogDescription>
              {viewingPost?.tone}
              {viewingPost?.post_type === "carousel" && viewingPost?.slides && (
                <span> · {viewingPost.slides.length} slides</span>
              )}
            </DialogDescription>
          </DialogHeader>

          {viewingPost && (
            <div className="space-y-4">
              {/* Regular Post */}
              {viewingPost.post_type === "single" || !viewingPost.post_type ? (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <p className="whitespace-pre-wrap text-sm">
                      {viewingPost.content}
                    </p>
                  </div>
                  {viewingPost.scheduled_date && (
                    <p className="text-xs text-muted-foreground">
                      Scheduled:{" "}
                      {format(
                        new Date(viewingPost.scheduled_date),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                  )}
                </div>
              ) : (
                /* Carousel Post */
                <div className="space-y-4">
                  {viewingPost.image_urls &&
                  viewingPost.image_urls.length > 0 ? (
                    <>
                      {/* Image Carousel */}
                      <div className="rounded-lg border overflow-hidden bg-muted/50">
                        <div className="relative aspect-video">
                          <img
                            src={viewingPost.image_urls[currentSlideIndex]}
                            alt={`Slide ${currentSlideIndex + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      {/* Navigation */}
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentSlideIndex(
                              Math.max(0, currentSlideIndex - 1)
                            )
                          }
                          disabled={currentSlideIndex === 0}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>

                        <span className="text-sm text-muted-foreground">
                          Slide {currentSlideIndex + 1} of{" "}
                          {viewingPost.image_urls.length}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentSlideIndex(
                              Math.min(
                                viewingPost.image_urls!.length - 1,
                                currentSlideIndex + 1
                              )
                            )
                          }
                          disabled={
                            currentSlideIndex ===
                            viewingPost.image_urls.length - 1
                          }
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>

                      {/* Slide Text Content */}
                      {viewingPost.slides &&
                        viewingPost.slides[currentSlideIndex] && (
                          <div className="rounded-lg border p-4 bg-background">
                            <p className="text-sm font-medium mb-2">
                              Slide Content:
                            </p>
                            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                              {viewingPost.slides[currentSlideIndex]}
                            </p>
                          </div>
                        )}
                    </>
                  ) : (
                    /* No Images - Show Text Only */
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
                        <ImageIcon className="h-8 w-8" />
                        <p className="text-sm">
                          No images available for this carousel
                        </p>
                      </div>
                      {viewingPost.slides && viewingPost.slides.length > 0 && (
                        <div className="space-y-2">
                          {viewingPost.slides.map((slide, index) => (
                            <div
                              key={index}
                              className="rounded-lg border p-4 bg-muted/50"
                            >
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Slide {index + 1}
                              </p>
                              <p className="whitespace-pre-wrap text-sm">
                                {slide}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Theme Preview */}
                  {viewingPost.theme && (
                    <div className="rounded-lg border p-3 bg-muted/50">
                      <p className="text-xs font-medium mb-2">Theme Colors:</p>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded border"
                            style={{
                              backgroundColor: viewingPost.theme.primary,
                            }}
                          />
                          <span className="text-xs text-muted-foreground">
                            Primary
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded border"
                            style={{
                              backgroundColor: viewingPost.theme.secondary,
                            }}
                          />
                          <span className="text-xs text-muted-foreground">
                            Secondary
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewingPost.scheduled_date && (
                    <p className="text-xs text-muted-foreground">
                      Scheduled:{" "}
                      {format(
                        new Date(viewingPost.scheduled_date),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(viewingPost.content)}
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Content
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleSchedule(viewingPost.id);
                  }}
                  className="flex-1"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
