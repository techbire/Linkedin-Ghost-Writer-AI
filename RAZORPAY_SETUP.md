# Razorpay Integration Setup Guide

## Current Status
✅ Razorpay is already integrated in the billing page  
✅ Payment provider is set to Razorpay  
✅ All necessary code is in place  

## What You Need To Do

### Step 1: Get Razorpay Credentials
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in to your account
3. Navigate to **Settings** → **API Keys**
4. Generate **Test Mode** keys (for testing) or **Live Mode** keys (for production)
5. You'll get:
   - `Key ID` (starts with `rzp_test_` for test mode)
   - `Key Secret` (keep this secret!)

### Step 2: Update Your `.env.local` File
Replace the placeholder values in `.env.local`:

```env
# Payment Provider (already set)
PAYMENT_PROVIDER=razorpay

# Razorpay Credentials (REPLACE THESE)
RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_from_razorpay

# Plan IDs (optional - for subscriptions, not needed for one-time orders)
RAZORPAY_STARTER_PLAN_ID=plan_starter_id
RAZORPAY_PRO_PLAN_ID=plan_pro_id
RAZORPAY_ENTERPRISE_PLAN_ID=plan_enterprise_id
```

### Step 3: Restart Your Development Server
After updating the `.env.local` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

### Step 4: Test the Payment Flow
1. Go to `http://localhost:3000/dashboard/billing`
2. Click "Choose Starter" (or any other plan)
3. Razorpay checkout should open
4. Use test card details:
   - **Card Number**: `4111 1111 1111 1111`
   - **Expiry**: Any future date (e.g., `12/25`)
   - **CVV**: Any 3 digits (e.g., `123`)
   - **Name**: Any name

## Current Plan Pricing

### Starter - ₹900/month ($9)
- 100 credits per month
- 1 credit per text generation
- 5 credits per image generation
- Basic support
- Mobile app access

### Pro - ₹2900/month ($29) - Most Popular
- 500 credits per month
- 1 credit per text generation
- 5 credits per image generation
- Priority support
- Advanced analytics
- Team collaboration

### Enterprise - ₹9900/month ($99)
- 2000 credits per month
- 1 credit per text generation
- 5 credits per image generation
- Dedicated support
- SLA guarantee
- Custom branding
- SSO integration

## How It Works

### When User Clicks "Choose Plan":
1. Frontend calls `/api/checkout` with `planId`
2. Server creates a Razorpay order with amount
3. Order details (orderId, amount) are sent to frontend
4. Razorpay checkout modal opens
5. User enters payment details
6. After successful payment, Razorpay calls the `handler` function
7. Handler calls `/api/payment-success` to:
   - Verify payment signature
   - Create subscription record in database
   - Add credits to user account
8. User is redirected to `/dashboard/billing?success=true`

## Troubleshooting

### Issue: "Payment System Not Ready" Error
**Solution**: Your Razorpay credentials are still set to placeholder values. Update `.env.local` with actual credentials.

### Issue: Razorpay Modal Doesn't Open
**Solution**: 
1. Check browser console for errors
2. Ensure Razorpay script is loaded (check Network tab)
3. Verify `RAZORPAY_KEY_ID` is set correctly
4. Restart your dev server after changing env variables

### Issue: Payment Succeeds but Subscription Not Created
**Solution**: 
1. Check terminal logs for errors in `/api/payment-success`
2. Verify database tables exist (run SQL migrations)
3. Check Supabase connection

### Issue: "Failed to create Razorpay subscription"
**Solution**: This error appears in terminal logs. Check:
1. Razorpay credentials are correct
2. API keys are for the correct mode (Test vs Live)
3. Network connection is stable

## Testing Without Real Credentials

If you don't have Razorpay credentials yet, the system will show:
- **Error**: "Payment system not configured"
- **Status**: 503 Service Unavailable

This is expected behavior. Get your credentials from Razorpay Dashboard to enable payments.

## Next Steps After Testing

1. ✅ Test payment flow with test credentials
2. ✅ Verify subscription is created in database
3. ✅ Verify credits are added to user account
4. ✅ Test credit deduction when generating posts/images
5. 🔄 Set up Razorpay webhook for production
6. 🔄 Switch to Live Mode credentials for production
7. 🔄 Configure webhook URL in Razorpay Dashboard

## Support

If you encounter issues:
1. Check browser console for frontend errors
2. Check terminal/server logs for backend errors
3. Verify all environment variables are set correctly
4. Ensure you restarted the server after changing `.env.local`
