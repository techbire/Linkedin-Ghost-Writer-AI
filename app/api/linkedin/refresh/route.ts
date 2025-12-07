import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { user_id } = await req.json();

  if (!user_id) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
  }

  const { data: userToken, error } = await supabase
    .from('user_linkedin_tokens')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (error || !userToken?.linkedin_refresh_token) {
    return NextResponse.json({ error: 'No refresh token found for user' }, { status: 400 });
  }

  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID!;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;

    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: userToken.linkedin_refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const { data } = await axios.post(tokenUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    console.log("------refresh data-----",data);

    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token || userToken.linkedin_refresh_token; // LinkedIn might not always return new one
    const expiresIn = data.expires_in;
    const refreshExpiresIn = data.refresh_token_expires_in || 0;

    await supabase
      .from('user_linkedin_tokens')
      .update({
        linkedin_access_token: newAccessToken,
        linkedin_token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        linkedin_refresh_token: newRefreshToken,
        linkedin_refresh_token_expires_at: refreshExpiresIn
          ? new Date(Date.now() + refreshExpiresIn * 1000).toISOString()
          : userToken.linkedin_refresh_token_expires_at,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user_id);

    return NextResponse.json({ access_token: newAccessToken });
  } catch (err: any) {
    console.error('Error refreshing LinkedIn token:', err.response?.data || err.message);
    return NextResponse.json({ error: 'Failed to refresh LinkedIn token' }, { status: 500 });
  }
}
