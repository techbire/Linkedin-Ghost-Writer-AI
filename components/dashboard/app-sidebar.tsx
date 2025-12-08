"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  LogOut,
  ChevronUp,
  User2,
  PenLine,
  Library,
  Calendar as CalendarIcon,
  Sparkles,
  ImageIcon,
  Cable,
  Unplug,
  Settings,
  FileText,
  MessageSquare,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { FeedbackModal } from "@/components/dashboard/feedback-modal";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const { user, profile } = useUser();
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  useEffect(() => {
    const checkLinkedInStatus = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/linkedin/status?user_id=${user.id}`);
        const data = await res.json();
        setIsLinkedInConnected(data.connected);
      } catch (err) {
        console.error("Failed to check LinkedIn status:", err);
      }
    };

    checkLinkedInStatus();
  }, [user?.id]);

  const handleDisconnectLinkedIn = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/linkedin/disconnect?user_id=${user.id}`, {
        method: "POST",
      });
      if (res.ok) {
        setIsLinkedInConnected(false);
      } else {
        const err = await res.json();
        alert(`Failed to disconnect: ${err.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error disconnecting LinkedIn.");
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
    { title: "Create Post", url: "/dashboard/create-post", icon: PenLine },
    { title: "Configure", url: "/dashboard/configure", icon: Settings },
    { title: "Templates", url: "/dashboard/templates", icon: FileText },
        {
      title: "Carousel Generator",
      url: "/dashboard/carousel",
      icon: ImageIcon,
    },{  title: "Carousel Generator",
      url: "/carousel-v2",
      icon: ImageIcon,
    },
    { title: "Post Library", url: "/dashboard/post-library", icon: Library },
    { title: "Calendar", url: "/dashboard/calendar", icon: CalendarIcon },
    ...(!isLinkedInConnected
      ? [
          {
            title: "Connect LinkedIn",
            // url: `/api/linkedin/auth?user_id=${user?.id}`,
            url: `/dashboard/connect-linkedin?user_id=${user?.id}`,
            icon: Cable,
            isLinkedIn: true,
          },
        ]
      : []),
  ];

  const handleSignOut = async () => {
    try {
      if (!supabase) {
        console.error("Supabase client not initialized");
        return;
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
        return;
      }

      // Clear any local storage
      localStorage.clear();

      // Redirect to home page
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const userEmail = user?.email || "user@example.com";
  const userName = profile?.full_name || profile?.username || "User";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="">
                <div className="flex aspect-square size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">GhostWriter</span>
                  <span className="text-xs text-muted-foreground">
                    AI Content Studio
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.url;
                const isLinkedInItem = item.isLinkedIn;

                return (
                  <SidebarMenuItem key={item.title}>
                    {isLinkedInItem && !isLinkedInConnected ? (
                      <SidebarMenuButton
                        asChild
                        className=""
                        tooltip="Connect LinkedIn to post"
                      >
                        <Link href={item.url}>
                          <item.icon className="" />
                          <span>Connect LinkedIn</span>
                        </Link>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/* Feedback Button */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setFeedbackModalOpen(true)}
              tooltip="Give Feedback"
              className="mb-2"
            >
              <MessageSquare />
              <span>Give Feedback</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={profile?.avatar_url || ""}
                      alt={userName}
                    />
                    <AvatarFallback className="rounded-lg">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userName}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {userEmail}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <User2 className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/billing" className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                {isLinkedInConnected && (
                  <DropdownMenuItem
                    onClick={handleDisconnectLinkedIn}
                    disabled={loading}
                  >
                    <Unplug className="w-4 h-4" />
                    <span className="">
                      {loading ? "Disconnecting..." : "Disconnect LinkedIn"}
                    </span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm">Theme</span>
                    <ThemeToggle />
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        generationParams={{
          page: pathname,
        }}
        onFeedbackSubmitted={() => {
          // Optional: Add toast notification here if needed
        }}
      />
    </Sidebar>
  );
}
