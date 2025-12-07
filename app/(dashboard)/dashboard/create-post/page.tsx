import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreatePostForm } from "@/components/dashboard/create-post-form";
import { useSidebar } from "@/components/ui/sidebar";

export default async function CreatePostPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Post</h1>
        <p className="text-muted-foreground mt-2">
          Generate engaging, high-performing LinkedIn posts using AI
        </p>
      </div>
      <CreatePostForm userId={user.id} />
    </div>
  );
}
