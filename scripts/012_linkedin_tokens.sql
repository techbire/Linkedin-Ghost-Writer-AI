-- Create user_linkedin_tokens table to store LinkedIn OAuth tokens
CREATE TABLE IF NOT EXISTS public.user_linkedin_tokens (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  linkedin_access_token TEXT NOT NULL,
  linkedin_token_expires_at TIMESTAMPTZ NOT NULL,
  linkedin_refresh_token TEXT,
  linkedin_refresh_token_expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_linkedin_tokens_user_id ON public.user_linkedin_tokens(user_id);

-- Enable RLS
ALTER TABLE public.user_linkedin_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own LinkedIn tokens"
  ON public.user_linkedin_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can view all LinkedIn tokens"
  ON public.user_linkedin_tokens
  FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can insert their own LinkedIn tokens"
  ON public.user_linkedin_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert LinkedIn tokens"
  ON public.user_linkedin_tokens
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can update their own LinkedIn tokens"
  ON public.user_linkedin_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can update LinkedIn tokens"
  ON public.user_linkedin_tokens
  FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can delete their own LinkedIn tokens"
  ON public.user_linkedin_tokens
  FOR DELETE
  USING (auth.uid() = user_id);
