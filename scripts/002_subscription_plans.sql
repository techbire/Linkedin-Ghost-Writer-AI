-- Create subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  billing_period TEXT NOT NULL CHECK (billing_period IN ('month', 'year')),
  features JSONB DEFAULT '[]',
  is_popular BOOLEAN DEFAULT FALSE,
  stripe_price_id TEXT,
  razorpay_plan_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for subscription plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read subscription plans (they're public)
CREATE POLICY "Allow public read access to subscription plans"
  ON public.subscription_plans FOR SELECT
  USING (is_active = true);

-- Add updated_at trigger for subscription plans
CREATE TRIGGER set_updated_at_subscription_plans
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (id, name, description, price, currency, billing_period, features, is_popular, stripe_price_id, razorpay_plan_id) 
VALUES 
  ('starter', 'Starter', 'For new creators finding their voice', 600.00, 'inr', '6 months', 
   '["100 credits/month", "Personalized tone learning", "Post & carousel generator", "Email support"]', false, 
   'price_starter_6months', 'plan_starter_6months'),
  ('pro', 'Pro', 'For growing creators and ghostwriters', 1000.00, 'inr', '12 months', 
   '["500 credits/month", "Trend & idea finder", "Deep research integration", "Priority support", "Engagement analytics"]', true, 
   'price_pro_12months', 'plan_pro_12months'),
  ('enterprise', 'Enterprise', 'For agencies and multi-brand founders', 0.00, 'inr', 'custom', 
   '["2000 credits/billing period", "Unlimited content generation", "Team collaboration tools", "Dedicated account manager", "Advanced analytics dashboard"]', false, 
   'price_enterprise_custom', 'plan_enterprise_custom')
ON CONFLICT (id) DO NOTHING;