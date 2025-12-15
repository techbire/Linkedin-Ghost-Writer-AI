import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams, protocol, host } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const userId = searchParams.get("user_id");

  if (!code || !state || !userId) {
    return NextResponse.json(
      { error: "Missing authorization code, state, or user ID." },
      { status: 400 }
    );
  }

  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID!;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
    const redirectUri = `${process.env.LINKEDIN_REDIRECT_URI!}?user_id=${userId}`;

    // Exchange authorization code for access & refresh tokens
    const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    });

    const { data } = await axios.post(tokenUrl, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;
    const expiresIn = data.expires_in; // seconds
    const refreshExpiresIn = data.refresh_token_expires_in;

    // 🧠 If you want to mimic short-lived access tokens (e.g., 1 hour)
    // const customExpiry = 3600; // 1 hour
    // const accessTokenExpiry = new Date(Date.now() + customExpiry * 1000);

    const accessTokenExpiry = new Date(Date.now() + (expiresIn || 3600) * 1000);
    // If refresh token expiry is not provided, default to 60 days
    const refreshExpiry = refreshExpiresIn 
      ? new Date(Date.now() + refreshExpiresIn * 1000)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    // Save tokens in Supabase
    await supabase.from("user_linkedin_tokens").upsert(
      {
        user_id: userId,
        linkedin_access_token: accessToken,
        linkedin_token_expires_at: accessTokenExpiry.toISOString(),
        linkedin_refresh_token: refreshToken || null,
        linkedin_refresh_token_expires_at: refreshToken ? refreshExpiry.toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    // Set cookies (token + user_id)
    const cookieStore = await cookies();
    cookieStore.set("linkedin_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn || 3600, // or customExpiry
    });
    cookieStore.set("user_id", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: refreshExpiresIn || 60 * 24 * 60 * 60, // match refresh token lifetime or default 60 days
    });

    // Use the current request's host for local dev, env vars for production
    const isLocalDev = host.includes('localhost') || host.includes('127.0.0.1');
    const appBaseUrl = isLocalDev ? `${protocol}//${host}` : (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL);
    return NextResponse.redirect(`${appBaseUrl}/dashboard/connect-linkedin?success=true`);
  } catch (error: any) {
    console.error("Error exchanging LinkedIn auth code:", error.response?.data || error.message);
    const isLocalDev = host.includes('localhost') || host.includes('127.0.0.1');
    const appBaseUrl = isLocalDev ? `${protocol}//${host}` : (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL);
    return NextResponse.redirect(`${appBaseUrl}/dashboard/connect-linkedin?error=auth_failed`);
  }
}
