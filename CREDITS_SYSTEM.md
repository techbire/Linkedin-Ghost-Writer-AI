# Credit System Implementation Guide

## Overview
The Ghost Writer AI platform now includes a comprehensive credit-based system to manage AI generation usage.

## Credit Costs
- **Text Generation**: 1 credit per post
- **Image Generation**: 5 credits per image

## Subscription Plans

### Starter Plan - $9/month
- **100 credits per month**
- 1 credit per text generation
- 5 credits per image generation
- Basic support
- Mobile app access

### Pro Plan - $29/month (Most Popular)
- **500 credits per month**
- 1 credit per text generation
- 5 credits per image generation
- Priority support
- Advanced analytics
- Team collaboration

### Enterprise Plan - $99/month
- **2000 credits per month**
- 1 credit per text generation
- 5 credits per image generation
- Dedicated support
- SLA guarantee
- Custom branding
- SSO integration

## Database Setup

### 1. Run the Credit System Migration
Execute the SQL migration to set up the credit tables and functions:

```bash
# Connect to your Supabase project and run:
psql -h [YOUR_SUPABASE_HOST] -U postgres -d postgres -f scripts/004_credits_system.sql
```

Or use the Supabase Dashboard SQL Editor to run `scripts/004_credits_system.sql`

### 2. Tables Created
- **user_credits**: Stores each user's current credit balance
- **credit_transactions**: Records all credit additions and deductions
- **subscription_plans** (updated): Now includes `credits_per_month` column

### 3. Database Functions
- `add_credits(user_id, amount, type, description, reference_id)`: Add credits to a user
- `deduct_credits(user_id, amount, type, description, reference_id)`: Deduct credits from a user
- `get_user_credits(user_id)`: Get user's current credit balance

## API Endpoints

### GET /api/credits
Returns the current user's credit balance.

**Response:**
```json
{
  "credits": 100
}
```

### GET /api/credits/transactions
Returns the user's credit transaction history.

**Response:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "amount": -1,
      "type": "text_generation",
      "description": "Generated LinkedIn post about: Marketing",
      "reference_id": "post-uuid",
      "created_at": "2025-10-18T..."
    }
  ]
}
```

## Usage in Components

### Using the Credits Hook
```tsx
import { useCredits } from "@/hooks/use-credits"

function MyComponent() {
  const { credits, loading, error, refreshCredits } = useCredits()

  return (
    <div>
      <p>Credits: {credits}</p>
      <button onClick={refreshCredits}>Refresh</button>
    </div>
  )
}
```

### Credit Checking in APIs
Both `/api/generate-post` and `/api/generate-image` now:
1. Check if user has enough credits before generation
2. Return HTTP 402 (Payment Required) if insufficient credits
3. Automatically deduct credits after successful generation

## UI Components

### Billing Page (`/dashboard/billing`)
- Displays current credit balance with visual card
- Shows recent credit transactions with positive/negative indicators
- Lists all subscription plans with credit allocations
- Allows plan upgrades

### Create Post Form (`/dashboard/create-post`)
- Shows real-time credit balance in header
- Checks credits before text generation (1 credit required)
- Checks credits before image generation (5 credits required)
- Auto-refreshes credit balance after generation

### Pricing Page (`/`)
- Updated to show credits per plan
- Visual badges indicating credit allocations
- Clear cost breakdown (1 credit/text, 5 credits/image)

## Credit Transaction Types
- `purchase`: Credits added via subscription or purchase
- `text_generation`: Credits deducted for text generation
- `image_generation`: Credits deducted for image generation
- `bonus`: Promotional or bonus credits
- `refund`: Credits refunded to user

## Granting Credits (Admin)

### On Subscription Purchase
When a user subscribes to a plan, grant them credits:

```sql
SELECT add_credits(
  'user-uuid',
  100, -- amount from plan.credits_per_month
  'purchase',
  'Starter plan subscription',
  'subscription-uuid'
);
```

### Monthly Credit Renewal
Set up a cron job or scheduled function to renew credits monthly:

```sql
-- Example: Renew credits for all active subscriptions
INSERT INTO user_credits (user_id, credits)
SELECT s.user_id, sp.credits_per_month
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_id = sp.id
WHERE s.status = 'active'
ON CONFLICT (user_id)
DO UPDATE SET 
  credits = subscription_plans.credits_per_month,
  updated_at = NOW();
```

## Error Handling

### Insufficient Credits
When users don't have enough credits:
- API returns 402 status code with error message
- Frontend displays toast notification
- User is directed to upgrade plan

### Example Frontend Handling
```tsx
try {
  const response = await fetch("/api/generate-post", { /* ... */ })
  const data = await response.json()
  
  if (response.status === 402) {
    toast({
      title: "Insufficient credits",
      description: data.error,
      variant: "destructive",
    })
    return
  }
} catch (error) {
  // Handle error
}
```

## Testing the Credit System

### 1. Manually Add Test Credits
```sql
SELECT add_credits(
  'your-user-uuid',
  50,
  'bonus',
  'Testing credits'
);
```

### 2. Check Credit Balance
```sql
SELECT * FROM user_credits WHERE user_id = 'your-user-uuid';
```

### 3. View Transactions
```sql
SELECT * FROM credit_transactions 
WHERE user_id = 'your-user-uuid' 
ORDER BY created_at DESC;
```

## Security Considerations

1. **Row Level Security (RLS)**: Enabled on both `user_credits` and `credit_transactions` tables
2. **User Isolation**: Users can only view/modify their own credits
3. **Function Security**: Credit functions use `SECURITY DEFINER` to ensure proper permissions
4. **Server-Side Validation**: All credit checks happen on the server, not client-side

## Future Enhancements

- [ ] Credit purchase page (buy additional credits)
- [ ] Credit usage analytics dashboard
- [ ] Email notifications for low credits
- [ ] Credit expiration system
- [ ] Team credit pooling for Enterprise plans
- [ ] Webhook integration for automatic credit renewal

## Support

For issues or questions about the credit system:
1. Check database logs for RPC call errors
2. Verify user has active subscription
3. Ensure credits table is properly initialized
4. Check API error responses for specific error messages
