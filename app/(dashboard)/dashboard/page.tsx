import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PenLine,
  ArrowRight,
  Sparkles,
  FileText,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import type { Database } from "@/types/database";
import Image from "next/image";

type Post = Database["public"]["Tables"]["posts"]["Row"];

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile with Your Persona
  // @ts-ignore - Types will be updated after database migration
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch user stats
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .returns<Post[]>();

  const totalPosts = posts?.length || 0;
  const draftPosts = posts?.filter((p) => p.status === "draft").length || 0;
  const scheduledPosts =
    posts?.filter((p) => p.status === "scheduled").length || 0;
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg  border p-8">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Hello
            {(profile as any)?.full_name
              ? `, ${(profile as any).full_name}`
              : ""}{" "}
            ✨
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Create engaging LinkedIn content that drives real results
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard/create-post">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Creating
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative  ">
          <Image
            alt="Paper 1"
            className="absolute right-0 bottom-0"
            src="/Paper.png"
            height={150}
            width={150}
          />
          <CardHeader className="flex flex-row items-center justify-between space-y-0  pb-2">
            <CardTitle className="text-xl font-bold">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card className="relative">
          <Image
            alt="Paper 2"
            className="absolute right-0 bottom-0"
            src="/Paper1.png"
            height={150}
            width={150}
          />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <PenLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftPosts}</div>
            <p className="text-xs text-muted-foreground">Saved in library</p>
          </CardContent>
        </Card>
        <Card className="relative  ">
          <Image
            alt="Paper 2"
            className="absolute right-0 bottom-0"
            src="/Paper1.png"
            height={150}
            width={150}
          />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledPosts}</div>
            <p className="text-xs text-muted-foreground">Ready to publish</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="relative hover:border-primary min-h-96 overflow-hidden rounded-xl">
          <button
            className="absolute top-6 right-6 w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center bg-transparent
               transition hover:border-primary/80 hover:scale-105 z-10"
            aria-label="Open in new window"
          >
            <Link href="/dashboard/create-post">
              <ArrowUpRight className="h-6 w-6 text-white/80" />
            </Link>
          </button>
          <div className="absolute inset-0 bg-[url('/linked_valnee.png')] bg-cover bg-center bg-no-repeat z-0" />
          <div className="absolute inset-0 bg-black/60 z-0" />

          <div className="absolute bottom-0 left-0 w-full pb-6 z-10 flex flex-col gap-4">
            <CardHeader>
              <CardTitle className="font-bold text-white text-xl">
                LinkedIn Post Generator
              </CardTitle>
              <CardDescription className="text-white font-semibold">
                Generate engaging, high-performing LinkedIn posts using AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-white mb-4 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">•</span>
                  <span>Choose from multiple post categories</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">•</span>
                  <span>Customize tone and style</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">•</span>
                  <span>AI-powered content generation</span>
                </li>
              </ul>
            </CardContent>
          </div>
        </Card>
        <Card className="relative hover:border-primary min-h-96 overflow-hidden rounded-xl">
          <button
            className="absolute top-6 right-6 w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center bg-transparent
               transition hover:border-primary/80 hover:scale-105 z-10"
            aria-label="Open in new window"
          >
            <Link href="/dashboard/post-library">
              <ArrowUpRight className="h-6 w-6 text-white/80" />
            </Link>
          </button>
          <div className="absolute inset-0 bg-[url('/post_valne.png')] bg-cover bg-center bg-no-repeat z-0" />
          <div className="absolute inset-0 bg-black/60 z-0" />

          <div className="absolute bottom-0 left-0 w-full pb-6 z-10 flex flex-col gap-4">
            <CardHeader>
              <CardTitle className="font-bold text-white text-xl">
                Post Library
              </CardTitle>
              <CardDescription className="text-white font-semibold">
                Manage your saved and scheduled LinkedIn posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-white mb-4 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">•</span>
                  <span>View all your saved posts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">•</span>
                  <span>Edit and update content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">•</span>
                  <span>Track post status</span>
                </li>
              </ul>
              {/*
              <Button asChild className="w-full font-bold">
                <Link href="/dashboard/create-post">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button> */}
            </CardContent>
          </div>
        </Card>
        <Card className="relative hover:border-primary min-h-96 overflow-hidden rounded-xl">
          <button
            className="absolute top-6 right-6 w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center bg-transparent
               transition hover:border-primary/80 hover:scale-105 z-10"
            aria-label="Open in new window"
          >
            <Link href="/dashboard/calendar">
              <ArrowUpRight className="h-6 w-6 text-white/80" />
            </Link>
          </button>
          <div className="absolute inset-0 bg-[url('/calendar_valnee.png')] bg-cover bg-center bg-no-repeat z-0" />
          <div className="absolute inset-0 bg-black/60 z-0" />

          <div className="absolute bottom-0 left-0 w-full pb-6 z-10 flex flex-col gap-4">
            <CardHeader>
              <CardTitle className="font-bold text-white text-xl">
                Content Calendar
              </CardTitle>
              <CardDescription className="text-white font-semibold">
                Schedule and manage your LinkedIn posts visually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-white mb-4 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">•</span>
                  <span>Visual calendar view</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">•</span>
                  <span>Schedule posts in advance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-0.5">•</span>
                  <span>Plan your content strategy</span>
                </li>
              </ul>
              {/*
              <Button asChild className="w-full font-bold">
                <Link href="/dashboard/create-post">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button> */}
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}
