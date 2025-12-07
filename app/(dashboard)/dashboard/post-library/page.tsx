import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PostLibraryContent } from "@/components/dashboard/post-library-content";

export default async function PostLibraryPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch posts from database
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b pb-2">
        <h1 className="text-3xl font-bold tracking-tight">Post Library</h1>
        <p className="text-muted-foreground mt-2">
          Manage your saved and scheduled LinkedIn posts
        </p>
      </div>
      <PostLibraryContent initialPosts={posts || []} userId={user.id} />
    </div>
  );
}
