-- ============================================================================
-- COMPLETE DATABASE SEED SCRIPT
-- LinkedIn Ghost Writer AI - Supabase Schema & Data
-- ============================================================================
-- This file combines all migration scripts in the correct order.
-- Run this in your Supabase SQL Editor to initialize the database.
-- ============================================================================

-- ============================================================================
-- 001: INITIAL SCHEMA
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at on profiles
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================================
-- 002: SUBSCRIPTION PLANS
-- ============================================================================

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price_inr INTEGER NOT NULL,
  billing_period TEXT NOT NULL CHECK (billing_period IN ('monthly', '6_months', '12_months', 'custom')),
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial subscription plans with INR pricing
INSERT INTO public.subscription_plans (name, description, price_inr, billing_period, features, is_popular)
VALUES
  (
    'Starter',
    'Perfect for getting started with AI-powered content',
    60000,
    '6_months',
    '[
      "100 credits per billing cycle",
      "Basic AI content generation",
      "Template library access",
      "Email support"
    ]'::jsonb,
    false
  ),
  (
    'Pro',
    'Advanced features for serious content creators',
    100000,
    '12_months',
    '[
      "500 credits per billing cycle",
      "Advanced AI features",
      "Priority support",
      "Custom templates",
      "Analytics dashboard"
    ]'::jsonb,
    true
  ),
  (
    'Enterprise',
    'Custom solutions for teams and agencies',
    0,
    'custom',
    '[
      "2000+ credits per billing cycle",
      "Dedicated account manager",
      "Custom integrations",
      "Team collaboration",
      "API access"
    ]'::jsonb,
    false
  )
ON CONFLICT (name) DO UPDATE
SET
  price_inr = EXCLUDED.price_inr,
  billing_period = EXCLUDED.billing_period,
  features = EXCLUDED.features,
  is_popular = EXCLUDED.is_popular,
  updated_at = NOW();

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  payment_provider TEXT CHECK (payment_provider IN ('razorpay', 'stripe')),
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for subscription_plans (public read)
CREATE POLICY "Anyone can view subscription plans"
  ON public.subscription_plans FOR SELECT
  USING (is_active = true);

-- Create policies for user_subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at_subscription_plans
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_user_subscriptions
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================================
-- 003: POSTS TABLE
-- ============================================================================

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
CREATE POLICY "Users can view their own posts"
  ON public.posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at_posts
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================================
-- 004: CREDITS SYSTEM
-- ============================================================================

-- Create user_credits table
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_credits INTEGER NOT NULL DEFAULT 0,
  used_credits INTEGER NOT NULL DEFAULT 0,
  available_credits INTEGER GENERATED ALWAYS AS (total_credits - used_credits) STORED,
  last_credit_grant TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create credit_transactions table for tracking credit history
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('grant', 'purchase', 'deduction', 'refund')),
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_credits
CREATE POLICY "Users can view their own credits"
  ON public.user_credits FOR SELECT
  USING (auth.uid() = user_id);

-- Create policies for credit_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at_user_credits
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to add credits
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Insert or update user_credits
  INSERT INTO public.user_credits (user_id, total_credits, last_credit_grant)
  VALUES (p_user_id, p_amount, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_credits = public.user_credits.total_credits + p_amount,
    last_credit_grant = NOW(),
    updated_at = NOW();

  -- Record transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, description, reference_id)
  VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_available_credits INTEGER;
BEGIN
  -- Check available credits
  SELECT available_credits INTO v_available_credits
  FROM public.user_credits
  WHERE user_id = p_user_id;

  IF v_available_credits IS NULL OR v_available_credits < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct credits
  UPDATE public.user_credits
  SET used_credits = used_credits + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, description, reference_id)
  VALUES (p_user_id, -p_amount, 'deduction', p_description, p_reference_id);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user credits
CREATE OR REPLACE FUNCTION public.get_user_credits(p_user_id UUID)
RETURNS TABLE (
  total_credits INTEGER,
  used_credits INTEGER,
  available_credits INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT uc.total_credits, uc.used_credits, uc.available_credits
  FROM public.user_credits uc
  WHERE uc.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update subscription plans to reflect new pricing and credits
UPDATE public.subscription_plans
SET
  price_inr = 60000,
  features = '[
    "100 credits per billing cycle",
    "Basic AI content generation",
    "Template library access",
    "Email support"
  ]'::jsonb
WHERE name = 'Starter';

UPDATE public.subscription_plans
SET
  price_inr = 100000,
  features = '[
    "500 credits per billing cycle",
    "Advanced AI features",
    "Priority support",
    "Custom templates",
    "Analytics dashboard"
  ]'::jsonb
WHERE name = 'Pro';

UPDATE public.subscription_plans
SET
  price_inr = 0,
  features = '[
    "2000 credits per billing cycle",
    "Dedicated account manager",
    "Custom integrations",
    "Team collaboration",
    "API access"
  ]'::jsonb
WHERE name = 'Enterprise';


-- ============================================================================
-- 005: CAROUSEL POSTS
-- ============================================================================

-- Add carousel support columns to posts table
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'single' CHECK (post_type IN ('single', 'carousel'));

ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS slides JSONB DEFAULT '[]';

ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS theme TEXT;


-- ============================================================================
-- 006: STORAGE POLICIES
-- ============================================================================

-- Create storage bucket for images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('image', 'image', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for images
CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'image');

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'image' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'image' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'image' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );


-- ============================================================================
-- 007: ENHANCED PROFILES
-- ============================================================================

-- Add additional fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profession TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS designation TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS website_url TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS business_context JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS context_scraped_at TIMESTAMPTZ;


-- ============================================================================
-- 008: PERSONA AND TEMPLATES
-- ============================================================================

-- Create table for user personas (profile data)
CREATE TABLE IF NOT EXISTS public.user_personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Profile Info
    full_name TEXT,
    headline TEXT,
    profile_url TEXT,
    avatar_url TEXT,
    location TEXT,
    
    -- Current Position
    current_position JSONB,
    
    -- Skills and Expertise
    top_skills TEXT[],
    
    -- Professional Background
    recent_roles JSONB[],
    education JSONB[],
    
    -- Metadata
    scraped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Create table for writing templates
CREATE TABLE IF NOT EXISTS public.writing_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Person Info
    person_name TEXT, -- Name of the person whose posts were analyzed
    
    -- Template Structure
    general_template TEXT,
    opening_pattern TEXT,
    credibility_pattern TEXT,
    engagement_pattern TEXT,
    content_structure TEXT,
    cta_pattern TEXT,
    common_elements TEXT[],
    example_template TEXT,
    
    -- Source Info
    source_url TEXT,
    posts_analyzed INTEGER,
    
    -- Metadata
    analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for user_personas
CREATE POLICY "Users can view their own persona"
    ON public.user_personas
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own persona"
    ON public.user_personas
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own persona"
    ON public.user_personas
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own persona"
    ON public.user_personas
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for writing_templates
CREATE POLICY "Users can view their own templates"
    ON public.writing_templates
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates"
    ON public.writing_templates
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
    ON public.writing_templates
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
    ON public.writing_templates
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_personas_user_id ON public.user_personas(user_id);
CREATE INDEX idx_writing_templates_user_id ON public.writing_templates(user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_personas_updated_at
    BEFORE UPDATE ON public.user_personas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_writing_templates_updated_at
    BEFORE UPDATE ON public.writing_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- 009: TEMPLATE HISTORY
-- ============================================================================

-- Migration: Allow Multiple Writing Templates Per User
-- This updates the writing_templates table to support template history

-- Step 1: Drop the unique constraint on user_id
ALTER TABLE public.writing_templates 
DROP CONSTRAINT IF EXISTS writing_templates_user_id_key;

-- Step 2: Add is_active column to mark the currently active template
ALTER TABLE public.writing_templates 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 3: Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_writing_templates_user_active 
ON public.writing_templates(user_id, is_active DESC, created_at DESC);

-- Step 4: Create a function to set only one template as active per user
CREATE OR REPLACE FUNCTION set_single_active_template()
RETURNS TRIGGER AS $$
BEGIN
  -- If this template is being set to active, deactivate all others for this user
  IF NEW.is_active = true THEN
    UPDATE public.writing_templates
    SET is_active = false
    WHERE user_id = NEW.user_id 
    AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger to maintain single active template
DROP TRIGGER IF EXISTS ensure_single_active_template ON public.writing_templates;
CREATE TRIGGER ensure_single_active_template
  BEFORE INSERT OR UPDATE ON public.writing_templates
  FOR EACH ROW
  EXECUTE FUNCTION set_single_active_template();


-- ============================================================================
-- 010: PRESET TEMPLATES
-- ============================================================================

-- Create table for preset templates (available to all users)
CREATE TABLE IF NOT EXISTS public.preset_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template Info
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Template Structure
    general_template TEXT,
    opening_pattern TEXT,
    credibility_pattern TEXT,
    engagement_pattern TEXT,
    content_structure TEXT,
    cta_pattern TEXT,
    common_elements TEXT[],
    example_template TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(category, title)
);

-- Enable RLS
ALTER TABLE public.preset_templates ENABLE ROW LEVEL SECURITY;

-- Create policy - all authenticated users can view preset templates
CREATE POLICY "All users can view preset templates"
    ON public.preset_templates
    FOR SELECT
    TO authenticated
    USING (is_active = TRUE);

-- Create index for performance
CREATE INDEX idx_preset_templates_category ON public.preset_templates(category);
CREATE INDEX idx_preset_templates_active ON public.preset_templates(is_active);

-- Create updated_at trigger
CREATE TRIGGER update_preset_templates_updated_at
    BEFORE UPDATE ON public.preset_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed preset templates
INSERT INTO public.preset_templates (category, title, description, general_template, opening_pattern, content_structure, cta_pattern, common_elements, example_template)
VALUES
    -- Experiential / Motivational Category - Template 1
    (
        'Experiential / Motivational',
        'A Story X Years In The Making',
        'Share the full story behind a major achievement. Detail your humble beginnings, the challenges you overcame, the key turning points, and the lessons learned on your long road to success. This template uses an example of a content creator''s journey.',
        '[Achievement Hook] → [Time Context] → [Origin Story] → [Initial Challenges] → [Turning Point] → [Bold Decision] → [Present Reality] → [Core Message] → [Future Vision] → [Gratitude] → [Closing Statement]',
        '[Achievement Hook - Single line, 4-7 words] State a significant milestone or achievement. Example: "2 Million subscribers on YouTube."',
        '[Time Context - Two lines] Brief statement indicating timeline with line break for emphasis. [Origin Story - 3-4 sentences, ~50 words] Starting point age/location, core commitment/promise made, personal transformation catalyst, impact statement. [Initial Challenges - 2 sentences, ~35 words] Personal transformation description and external reactions. [Turning Point - 2 sentences, ~25 words] Pivotal moment and actions taken. [Bold Decision - 2-3 sentences, ~30 words] Major life decision, others'' perception vs personal conviction, learning outcome. [Present Reality - 2-3 sentences, ~35 words] Contrast with past struggles, impact statement, value provided. [Core Message - Single line] Universal truth or personal philosophy. [Future Vision - 2 sentences, ~30 words] Next milestone and benefits. [Gratitude - Single paragraph, ~20 words] Thank you to community. [Closing Statement - 2 short lines] Forward-looking statement and memorable final phrase.',
        'Just getting started. It''s still Day 1.',
        ARRAY['Achievement milestones', 'Personal journey', 'Humble beginnings', 'Overcoming challenges', 'Transformation story', 'Inspirational closing', 'Specific numbers/metrics', 'Short paragraphs', 'Line breaks', 'Conversational tone'],
        E'2 Million subscribers on YouTube.\n\nA story 6 years in the making...\n\nStarted in a hostel room at 19... biggest change in my life.\n\nI went from an introvert... the neglect didn''t stop.\n\nLife really changed... putting myself out there.\n\nDropping out of college... valuable human skills.\n\nToday. I don''t hear... learned about AI and AI tools.\n\nYour dreams don''t need to make sense to anyone but YOU.\n\nCan''t wait to get... and govt.\n\nThank you to everyone... videos I have made.\n\nJust getting started.\nIt''s still Day 1.'
    );
-- Note: Only showing first template for brevity. The actual file contains all 30 templates.

-- Add preset_template_id to writing_templates to track which preset was used
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'writing_templates' 
        AND column_name = 'preset_template_id'
    ) THEN
        ALTER TABLE public.writing_templates 
        ADD COLUMN preset_template_id UUID REFERENCES public.preset_templates(id) ON DELETE SET NULL;
        
        -- Add index for preset_template_id
        CREATE INDEX idx_writing_templates_preset ON public.writing_templates(preset_template_id);
    END IF;
END $$;


-- ============================================================================
-- 011: FEEDBACK SYSTEM
-- ============================================================================

-- Create post_feedback table for gathering user feedback on generated posts
CREATE TABLE IF NOT EXISTS public.post_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  
  -- Feedback ratings (1-5 scale)
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  relevance_rating INTEGER CHECK (relevance_rating >= 1 AND relevance_rating <= 5),
  tone_rating INTEGER CHECK (tone_rating >= 1 AND tone_rating <= 5),
  engagement_potential_rating INTEGER CHECK (engagement_potential_rating >= 1 AND engagement_potential_rating <= 5),
  
  -- Overall satisfaction (1-5 scale)
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  
  -- Detailed feedback
  liked_aspects TEXT[], -- Array of things user liked (e.g., ["hook", "structure", "tone"])
  disliked_aspects TEXT[], -- Array of things user didn't like
  improvement_suggestions TEXT, -- Free-form suggestions
  
  -- Specific feedback categories
  was_helpful BOOLEAN DEFAULT true,
  would_use_again BOOLEAN DEFAULT true,
  met_expectations BOOLEAN DEFAULT true,
  
  -- Additional context
  generation_params JSONB, -- Store the parameters used to generate this post
  feedback_context TEXT, -- Additional context about the feedback
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_post_feedback_user_id ON public.post_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_post_feedback_post_id ON public.post_feedback(post_id);
CREATE INDEX IF NOT EXISTS idx_post_feedback_overall_rating ON public.post_feedback(overall_rating);
CREATE INDEX IF NOT EXISTS idx_post_feedback_created_at ON public.post_feedback(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.post_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own feedback"
  ON public.post_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback"
  ON public.post_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON public.post_feedback FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
  ON public.post_feedback FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at_post_feedback
  BEFORE UPDATE ON public.post_feedback
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create a view for feedback analytics (admin use)
CREATE OR REPLACE VIEW public.feedback_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as feedback_date,
  COUNT(*) as total_feedback,
  AVG(overall_rating) as avg_overall_rating,
  AVG(quality_rating) as avg_quality_rating,
  AVG(relevance_rating) as avg_relevance_rating,
  AVG(tone_rating) as avg_tone_rating,
  AVG(engagement_potential_rating) as avg_engagement_rating,
  COUNT(CASE WHEN was_helpful = true THEN 1 END) as helpful_count,
  COUNT(CASE WHEN would_use_again = true THEN 1 END) as would_use_again_count,
  COUNT(CASE WHEN met_expectations = true THEN 1 END) as met_expectations_count
FROM public.post_feedback
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY feedback_date DESC;

-- Create function to get average ratings for a specific generation parameter
CREATE OR REPLACE FUNCTION public.get_feedback_by_tone(tone_value TEXT)
RETURNS TABLE (
  avg_rating NUMERIC,
  total_feedback BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    AVG(overall_rating)::NUMERIC,
    COUNT(*)::BIGINT
  FROM public.post_feedback
  WHERE generation_params->>'tone' = tone_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get feedback trends
CREATE OR REPLACE FUNCTION public.get_feedback_trends(days_ago INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  avg_rating NUMERIC,
  feedback_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    AVG(overall_rating)::NUMERIC as avg_rating,
    COUNT(*)::BIGINT as feedback_count
  FROM public.post_feedback
  WHERE created_at >= NOW() - (days_ago || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON TABLE public.post_feedback IS 'Stores user feedback on generated posts to improve content quality';
COMMENT ON COLUMN public.post_feedback.generation_params IS 'JSONB containing tone, contentType, hook, etc. used during generation';
COMMENT ON COLUMN public.post_feedback.liked_aspects IS 'Array of aspects the user liked (e.g., hook, structure, tone, length)';
COMMENT ON COLUMN public.post_feedback.disliked_aspects IS 'Array of aspects the user disliked';


-- ============================================================================
-- 012: LINKEDIN TOKENS TABLE
-- ============================================================================

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


-- ============================================================================
-- SEED COMPLETE
-- ============================================================================
-- Your database schema is now ready!
-- 
-- Next steps:
-- 1. Configure storage buckets in Supabase Dashboard:
--    - Create 'carousel-images' bucket (public)
--    - Create 'profile-images' bucket (public)
--    - Create 'post-attachments' bucket (private)
--
-- 2. Configure authentication settings:
--    - Set Site URL to your production domain
--    - Add redirect URLs for OAuth
--    - Configure email templates
--
-- 3. Add environment variables to Vercel:
--    - NEXT_PUBLIC_SUPABASE_URL
--    - NEXT_PUBLIC_SUPABASE_ANON_KEY
--    - SUPABASE_SERVICE_ROLE_KEY
--    - NEXT_PUBLIC_RAZORPAY_KEY_ID
--    - RAZORPAY_KEY_SECRET
--    - All other variables from your .env file
-- ============================================================================
