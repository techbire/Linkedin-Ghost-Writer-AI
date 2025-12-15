-- Migration: Rename price column to price_inr and convert values
-- This migrates from the old schema (price as decimal) to new schema (price_inr as integer in paise)

-- Step 1: Add the new price_inr column
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS price_inr INTEGER;

-- Step 2: Convert existing price values to paise (multiply by 100)
UPDATE public.subscription_plans 
SET price_inr = CAST(price * 100 AS INTEGER)
WHERE price_inr IS NULL;

-- Step 3: Make price_inr NOT NULL after data is migrated
ALTER TABLE public.subscription_plans 
ALTER COLUMN price_inr SET NOT NULL;

-- Step 4: Drop the old price column (comment out if you want to keep it temporarily)
-- ALTER TABLE public.subscription_plans DROP COLUMN IF EXISTS price;

-- Step 5: Drop currency column if it exists (we only use INR now)
-- ALTER TABLE public.subscription_plans DROP COLUMN IF EXISTS currency;

-- Step 6: Update billing_period values to new format
UPDATE public.subscription_plans 
SET billing_period = '6_months'
WHERE billing_period = '6 months';

UPDATE public.subscription_plans 
SET billing_period = '12_months'
WHERE billing_period = '12 months';

-- Step 7: Add constraint for new billing_period values
ALTER TABLE public.subscription_plans 
DROP CONSTRAINT IF EXISTS subscription_plans_billing_period_check;

ALTER TABLE public.subscription_plans 
ADD CONSTRAINT subscription_plans_billing_period_check 
CHECK (billing_period IN ('monthly', '6_months', '12_months', 'custom'));

-- Verify the migration
SELECT id, name, price_inr, billing_period, is_popular, is_active
FROM public.subscription_plans 
ORDER BY price_inr;


