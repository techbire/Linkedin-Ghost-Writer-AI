"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface SchedulePostDialogProps {
  postId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (postId: string, scheduledDate: string) => void
}

export function SchedulePostDialog({ postId, open, onOpenChange, onSuccess }: SchedulePostDialogProps) {
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState("09:00")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSchedule = async () => {
    if (!date) {
      toast({
        title: "Date required",
        description: "Please select a date to schedule the post",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Combine date and time
      const [hours, minutes] = time.split(":").map(Number)
      const scheduledDateTime = new Date(date)
      scheduledDateTime.setHours(hours, minutes, 0, 0)

      const response = await fetch(`/api/posts/${postId}/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduled_date: scheduledDateTime.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to schedule post")
      }

      toast({
        title: "Scheduled!",
        description: `Post scheduled for ${format(scheduledDateTime, "MMM d, yyyy 'at' h:mm a")}`,
      })

      onSuccess(postId, scheduledDateTime.toISOString())
    } catch (error) {
      console.error("Error scheduling post:", error)
      toast({
        title: "Schedule failed",
        description: "Failed to schedule post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Post</DialogTitle>
          <DialogDescription>
            Choose when you want this post to be published on LinkedIn
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={{ before: new Date() }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={isLoading || !date}>
            {isLoading ? "Scheduling..." : "Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
