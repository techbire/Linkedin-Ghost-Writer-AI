import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ContentCalendar } from "@/components/dashboard/content-calendar";

export default async function CalendarPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch scheduled posts
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .not("scheduled_date", "is", null)
    .order("scheduled_date", { ascending: true });

  return (
    <div className=" w-full mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
        <p className="text-muted-foreground mt-2">
          Schedule and manage your LinkedIn posts visually
        </p>
      </div>
      <div className="w-full">
        <div className="w-1/2">
          <ContentCalendar initialPosts={posts || []} userId={user.id} />
        </div>
      </div>
    </div>
  );
}
