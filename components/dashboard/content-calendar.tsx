"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Dot, PlusCircle, X } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  content: string;
  status: string;
  scheduled_for: string | null;
  category: string | null;
  tone: string;
  created_at: string;
  post_type?: string;
  slides?: string;
  image_urls?: string[];
}

interface ContentCalendarProps {
  initialPosts: Post[];
  userId: string;
}

function PostItem({ post }: { post: Post }) {
  return (
    <div className="bg-secondary text-secondary-foreground rounded-md p-2 text-xs w-full truncate hover:bg-secondary/80 cursor-pointer">
      {post.content}
    </div>
  );
}

export function ContentCalendar({
  initialPosts,
  userId,
}: ContentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="border rounded-lg p-4 h-[70vh] flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">
          Loading Calendar...
        </p>
      </div>
    );
  }

  const today = new Date();

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const TOTAL_CELLS = 35;
  const remainingCells = TOTAL_CELLS - days.length;
  const paddingEndDays = Array.from({
    length: remainingCells > 0 ? remainingCells : 0,
  });

  const getPostsForDate = (date: Date) => {
    return initialPosts
      .filter(
        (post) =>
          post.scheduled_for && isSameDay(new Date(post.scheduled_for), date)
      )
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
  };

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const goToToday = () => setCurrentMonth(new Date());

  const MAX_POSTS_VISIBLE = 2;

  const handleNextPost = (postsForDay: Post[]) => {
    setSelectedPostIndex((prev) => (prev + 1) % postsForDay.length);
    setSelectedImageIndex(0);
  };

  const handlePrevPost = (postsForDay: Post[]) => {
    setSelectedPostIndex(
      (prev) => (prev - 1 + postsForDay.length) % postsForDay.length
    );
    setSelectedImageIndex(0);
  };

  return (
    <div className="border min-w-[40vw] rounded-lg bg-card text-card-foreground shadow-sm">
      {/* Calendar Header */}
      <div className="flex flex-col items-center p-4 border-b ">
        <div className="w-full mb-2 flex flex-col gap-2">
          <h2 className="text-left font-bold text-xl">Select the date</h2>
          <p className="text-sm text-muted-foreground">
            What you want to see your scheduled post on
          </p>
          <div className="grid grid-cols-2 gap-5 w-full ">
            <Button variant="outline" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" onClick={goToToday}>
              Tomorrow
            </Button>
            <Button variant="outline" onClick={goToToday}>
              This Weekend
            </Button>
            <Button variant="outline" onClick={goToToday}>
              Next Week
            </Button>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center w-full p-4">
        <h2 className="text-xl font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 min-h-[50vh] min-w-[40vw]">
        {/* Weekday Headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground p-2"
          >
            {day}
          </div>
        ))}

        {days.map((date) => {
          const postsForDay = getPostsForDate(date);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isToday = isSameDay(date, today);

          return (
            <div
              key={date.toISOString()}
              onClick={() => {
                setSelectedDate(date);
                setSelectedPostIndex(0);
                setSelectedImageIndex(0);
              }}
              className={cn(
                "relative h-12 px-2 flex flex-col items-center justify-center rounded-2xl overflow-y-auto cursor-pointer hover:bg-accent/40 transition-all",
                !isCurrentMonth && "text-muted-foreground"
              )}
            >
              <div className="flex justify-end">
                <span
                  className={cn(
                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                    isToday && "bg-primary text-primary-foreground",
                    !isCurrentMonth && "opacity-50"
                  )}
                >
                  {format(date, "d")}
                </span>
              </div>
              <div className="flex items-center">
                {postsForDay.map((post, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 h-2 bg-blue-700 border rounded-full",
                      i !== 0 && "-ml-1"
                    )}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {paddingEndDays.map((_, index) => (
          <div
            key={`padding-${index}`}
            className="border-r border-b bg-muted/30"
          />
        ))}
      </div>

      {/* Scrollable Modal */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl h-[85vh] flex flex-col border border-white/10 p-4">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-card z-10">
              <h3 className="text-lg font-semibold">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDate(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4">
              {(() => {
                const postsForDay = getPostsForDate(selectedDate);
                if (postsForDay.length === 0) {
                  return (
                    <div className="text-center text-muted-foreground py-12">
                      No posts scheduled for this day.
                    </div>
                  );
                }

                const post = postsForDay[selectedPostIndex];
                const images = post.image_urls || [];

                return (
                  <div className="flex flex-col gap-4">
                    {/* Image Carousel */}
                    {images.length > 0 && (
                      <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                        <Image
                          src={images[selectedImageIndex]}
                          alt={`Slide ${selectedImageIndex + 1}`}
                          width={600}
                          height={400}
                          className="object-contain w-full h-full"
                        />
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                setSelectedImageIndex(
                                  (prev) =>
                                    (prev - 1 + images.length) % images.length
                                )
                              }
                              className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/60 p-1 rounded-full hover:bg-background"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() =>
                                setSelectedImageIndex(
                                  (prev) => (prev + 1) % images.length
                                )
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/60 p-1 rounded-full hover:bg-background"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Post Content */}
                    <div className="p-3 border rounded-md bg-secondary text-secondary-foreground">
                      <p className="text- whitespace-pre-wrap">
                        {post.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Tone: {post.tone}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer (fixed) */}
            <div className="p-4 border-t flex justify-between items-center sticky bottom-0 bg-card z-10">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={getPostsForDate(selectedDate).length <= 1}
                  onClick={() => {
                    const postsForDay = getPostsForDate(selectedDate);
                    handlePrevPost(postsForDay);
                  }}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={getPostsForDate(selectedDate).length <= 1}
                  onClick={() => {
                    const postsForDay = getPostsForDate(selectedDate);
                    handleNextPost(postsForDay);
                  }}
                >
                  Next
                </Button>
              </div>
              <Button
                onClick={() =>
                  (window.location.href = "/dashboard/create-post")
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
