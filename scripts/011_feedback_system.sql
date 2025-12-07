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
