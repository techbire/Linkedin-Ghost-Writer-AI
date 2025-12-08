-- Create user_credits table to track credit balance
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create credit_transactions table to track all credit usage
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for credits added, negative for credits used
  type TEXT NOT NULL CHECK (type IN ('purchase', 'text_generation', 'image_generation', 'bonus', 'refund')),
  description TEXT,
  reference_id TEXT, -- can be subscription_id, post_id, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_credits
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own credits
CREATE POLICY "Users can view their own credits"
  ON public.user_credits FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own credits (via functions only)
CREATE POLICY "Users can update their own credits"
  ON public.user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable RLS for credit_transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own transactions
CREATE POLICY "Users can view their own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Add updated_at trigger for user_credits
CREATE TRIGGER set_updated_at_user_credits
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);

-- Add credits column to subscription_plans
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS credits_per_month INTEGER DEFAULT 0;

-- Update existing plans with credits
UPDATE public.subscription_plans SET credits_per_month = 100 WHERE id = 'starter';
UPDATE public.subscription_plans SET credits_per_month = 500 WHERE id = 'pro';
UPDATE public.subscription_plans SET credits_per_month = 2000 WHERE id = 'enterprise';

-- Update plan prices to INR with new billing periods
UPDATE public.subscription_plans SET price = 600.00, currency = 'inr', billing_period = '6 months' WHERE id = 'starter';
UPDATE public.subscription_plans SET price = 1000.00, currency = 'inr', billing_period = '12 months' WHERE id = 'pro';
UPDATE public.subscription_plans SET price = 0.00, currency = 'inr', billing_period = 'custom' WHERE id = 'enterprise';

-- Update plan features to include credits
UPDATE public.subscription_plans 
SET features = jsonb_build_array(
  '100 credits/month',
  'Personalized tone learning',
  'Post & carousel generator',
  'Email support'
)
WHERE id = 'starter';

UPDATE public.subscription_plans 
SET features = jsonb_build_array(
  '500 credits/month',
  'Trend & idea finder',
  'Deep research integration',
  'Priority support',
  'Engagement analytics'
)
WHERE id = 'pro';

UPDATE public.subscription_plans 
SET features = jsonb_build_array(
  '2000 credits/billing period',
  'Unlimited content generation',
  'Team collaboration tools',
  'Dedicated account manager',
  'Advanced analytics dashboard'
)
WHERE id = 'enterprise';

-- Function to add credits to user account
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update user credits
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    credits = public.user_credits.credits + p_amount,
    updated_at = NOW();

  -- Record transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, description, reference_id)
  VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id);

  RETURN TRUE;
END;
$$;

-- Function to deduct credits from user account
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits
  FROM public.user_credits
  WHERE user_id = p_user_id;

  -- Check if user has enough credits
  IF current_credits IS NULL OR current_credits < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Deduct credits
  UPDATE public.user_credits
  SET credits = credits - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Record transaction (negative amount for deduction)
  INSERT INTO public.credit_transactions (user_id, amount, type, description, reference_id)
  VALUES (p_user_id, -p_amount, p_type, p_description, p_reference_id);

  RETURN TRUE;
END;
$$;

-- Function to get user's current credits
CREATE OR REPLACE FUNCTION public.get_user_credits(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_credits INTEGER;
BEGIN
  SELECT credits INTO user_credits
  FROM public.user_credits
  WHERE user_id = p_user_id;

  RETURN COALESCE(user_credits, 0);
END;
$$;
