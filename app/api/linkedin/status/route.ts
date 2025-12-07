// /app/api/linkedin/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json({ connected: false });
  }

  const { data, error } = await supabase
    .from("user_linkedin_tokens")
    .select("linkedin_access_token, linkedin_refresh_token, linkedin_token_expires_at")
    .eq("user_id", user_id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ connected: false });
  }

  const now = new Date();
  const isExpired = data.linkedin_token_expires_at
    ? new Date(data.linkedin_token_expires_at) < now
    : true;

  const connected = !!data.linkedin_refresh_token || (!isExpired && !!data.linkedin_access_token);

  return NextResponse.json({ connected });
}
