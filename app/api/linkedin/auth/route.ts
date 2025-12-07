// /app/api/linkedin/start/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id'); // 👈 get user_id from query

  if (!userId) {
    return NextResponse.json({ error: 'Missing user_id in request.' }, { status: 400 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID!;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI!;
  const state = Math.random().toString(36).substring(7); // Basic CSRF token

  const scope = [
     "r_basicprofile",
     "r_member_postAnalytics",
     "r_organization_followers",
     "r_organization_social",
     "rw_organization_admin",
     "r_organization_social_feed",
     "w_member_social",
     "r_member_profileAnalytics",
     "w_organization_social",
     "r_basicprofile",
     "w_organization_social_feed",
     "w_member_social_feed",
     "r_1st_connections_size",
    // "offline_access"
  ].join(" ");

  // 👇 include user_id as a param in redirect_uri
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code` +
    `&client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri + '?user_id=' + userId)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${state}`;

  return NextResponse.redirect(authUrl);
}
