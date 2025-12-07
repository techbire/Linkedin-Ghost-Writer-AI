-- Manually add credits to a user after successful payment
-- Replace 'YOUR_USER_ID' with your actual user ID from Supabase auth.users table

-- First, check your user ID (you can find this in Supabase Dashboard > Authentication > Users)
-- Then run one of these queries based on your plan:

-- For Starter Plan (100 credits)
SELECT add_credits(
  'YOUR_USER_ID'::UUID,
  100,
  'purchase',
  'Starter plan subscription - 100 credits',
  'manual_credit_grant'
);

-- For Pro Plan (500 credits)
SELECT add_credits(
  'YOUR_USER_ID'::UUID,
  500,
  'purchase',
  'Pro plan subscription - 500 credits',
  'manual_credit_grant'
);

-- For Enterprise Plan (2000 credits)
SELECT add_credits(
  'YOUR_USER_ID'::UUID,
  2000,
  'purchase',
  'Enterprise plan subscription - 2000 credits',
  'manual_credit_grant'
);

-- Example with actual UUID:
-- SELECT add_credits(
--   '123e4567-e89b-12d3-a456-426614174000'::UUID,
--   100,
--   'purchase',
--   'Starter plan subscription - 100 credits',
--   'manual_credit_grant'
-- );

-- To check your credits after adding:
-- SELECT * FROM user_credits WHERE user_id = 'YOUR_USER_ID';

-- To view your credit transactions:
-- SELECT * FROM credit_transactions WHERE user_id = 'YOUR_USER_ID' ORDER BY created_at DESC;
