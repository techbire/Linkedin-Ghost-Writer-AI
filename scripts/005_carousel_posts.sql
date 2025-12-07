-- Add carousel support to posts table
-- This migration adds fields needed to store carousel posts with images

-- Add new columns to posts table
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'single' CHECK (post_type IN ('single', 'carousel')),
ADD COLUMN IF NOT EXISTS slides JSONB,
ADD COLUMN IF NOT EXISTS image_urls TEXT[],
ADD COLUMN IF NOT EXISTS theme JSONB;

-- Add index for post_type
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON public.posts(post_type);

-- Add comment to explain the structure
COMMENT ON COLUMN public.posts.post_type IS 'Type of post: single (regular post) or carousel';
COMMENT ON COLUMN public.posts.slides IS 'Array of slide content for carousel posts';
COMMENT ON COLUMN public.posts.image_urls IS 'Array of image URLs stored in Supabase storage';
COMMENT ON COLUMN public.posts.theme IS 'Theme configuration with primary and secondary colors';
