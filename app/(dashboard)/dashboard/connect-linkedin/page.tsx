import ConnectLinkedInPage from "@/components/dashboard/ConnectLinkedin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ConnectLinkedin() {
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
    <div className="max-w-7xl mx-auto">
      <ConnectLinkedInPage />
    </div>
  );
}
