-- Add new fields to profiles table for enhanced onboarding
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profession TEXT,
ADD COLUMN IF NOT EXISTS designation TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS business_context JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS context_scraped_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_profession ON public.profiles(profession);
CREATE INDEX IF NOT EXISTS idx_profiles_designation ON public.profiles(designation);

-- Add comment for business_context field
COMMENT ON COLUMN public.profiles.business_context IS 'Stores scraped website data including business description, target audience, services, etc.';
