# Ghost Writer AI

A powerful AI-driven social media content platform that empowers creators and businesses to generate, customize, and publish engaging posts effortlessly. Designed with cutting-edge AI technologies, advanced content customization, and seamless social media integration.

[![Watch the demo video](https://img.youtube.com/vi/k--35ynGztc/maxresdefault.jpg)](https://youtu.be/k--35ynGztc)

## 🎯 Features

### Content Generation & Research
- **RAG Pipeline**: Web scraping, LLM-context parsing, and multi-source references (voice, articles, docs, text)
- **Deep Research**: Google Search grounding for fact-based content generation
- **Intelligent Post Creation**: AI-powered LinkedIn post generation with context awareness
- **Topic Ideas Generator**: Auto-generate trending topics and content ideas

### Content Tools & Customization
- **Carousel Generator V1 (Image-First)**: Text → AI JSON slides → editable preview → template selection → PNG export with visual consistency
- **Carousel Generator V2 (Text-First)**: Structured AI slides → customizable editor → dynamic PNG rendering at export for maximum flexibility
- **Image Styling**: Advanced image manipulation and styling tools
- **Preset Templates**: Pre-designed templates for quick content creation
- **Post Library**: Save and organize generated posts for reuse

### Social Media Integration
- **LinkedIn Connect**: Official LinkedIn API integration for scheduling and publishing posts directly from the platform
- **Post Scheduling**: Calendar-based scheduling system for optimal posting times
- **Multi-Source Publishing**: Seamless integration with LinkedIn ecosystem

### Account & Billing
- **Credit-Based System**: Flexible pay-as-you-go model with monthly credit allowances
- **Multiple Pricing Tiers**: Starter ($9/month), Pro ($29/month), and Enterprise ($99/month) plans
- **Stripe & Razorpay Integration**: Dual payment gateway support for global accessibility
- **Subscription Management**: Flexible subscription plans with automatic renewals
- **Usage Analytics**: Track credit consumption and content performance

### User Experience
- **Improved Onboarding**: Streamlined user setup with best practices
- **Intuitive Dashboard**: Centralized control hub for all platform features
- **Dark Mode**: Built-in theme switching for comfortable viewing
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## Tech Stack

- **Frontend Framework**: Next.js 15 (App Router)
- **Backend Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth (email/password, OAuth, magic links)
- **Payment Processing**: Stripe & Razorpay with webhook handling
- **Email Service**: Resend + React Email for transactional emails
- **UI Framework**: Tailwind CSS v4 with shadcn/ui + Radix UI components
- **Data Visualization**: Recharts for analytics and metrics
- **Form Management**: React Hook Form + Zod for type-safe validation
- **Language**: TypeScript for type safety and developer experience
- **Analytics**: Vercel Analytics for performance monitoring
- **Web Scraping**: Firecrawl for intelligent content extraction
- **AI Models**: Google Generative AI (Gemini) for content generation
- **Image Processing**: Sharp for high-quality image manipulation
- **Analytics Tracking**: PostHog for user behavior insights

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20 LTS)
- npm, yarn, or pnpm package manager
- Supabase account (free tier supported)
- Google Generative AI API key for content generation
- Stripe or Razorpay account (for payment processing)
- Resend account (for transactional emails)
- LinkedIn App credentials (for social integration)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ghost_Writter_AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure required environment variables** (see [Environment Setup](#environment-setup) section)

5. **Run database migrations**
   - Use the Supabase dashboard SQL editor to run scripts from the `scripts/` folder
   - Execute migrations in order: `001_create_profiles.sql`, `002_create_todos.sql`, `003_create_subscriptions.sql`, `004_credits_system.sql`

6. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Setup

### Required Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI & API Keys
GOOGLE_API_KEY=your_google_generative_ai_key
FIRECRAWL_API_KEY=your_firecrawl_key

# Email Configuration
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com

# Payment Provider (stripe or razorpay)
PAYMENT_PROVIDER=stripe

# Stripe Configuration (if using Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...

# Razorpay Configuration (if using Razorpay)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
RAZORPAY_STARTER_PLAN_ID=plan_id
RAZORPAY_PRO_PLAN_ID=plan_id

# LinkedIn Integration
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_linkedin_app_id
LINKEDIN_CLIENT_SECRET=your_linkedin_app_secret
NEXT_PUBLIC_LINKEDIN_REDIRECT_URI=http://localhost:3000/dashboard/connect-linkedin
```

### Optional Environment Variables

```env
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
POSTHOG_API_KEY=your_posthog_api_key

# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_vercel_analytics_id
```

## Project Structure

```
├── app/
│   ├── (auth)/                      # Authentication pages (login, signup, onboarding)
│   ├── (dashboard)/                 # Protected dashboard pages
│   │   ├── dashboard/               # Main dashboard overview
│   │   ├── create-post/             # Post creation flow
│   │   ├── carousel/                # Carousel V1 generator
│   │   ├── carousel-v2/             # Carousel V2 editor
│   │   ├── connect-linkedin/        # LinkedIn OAuth integration
│   │   ├── post-library/            # Saved posts collection
│   │   ├── billing/                 # Subscription & upgrade pages
│   │   ├── calendar/                # Post scheduling calendar
│   │   ├── configure/               # User preferences
│   │   ├── settings/                # Account settings
│   │   └── templates/               # Template browser
│   ├── (marketing)/                 # Public marketing pages
│   ├── api/
│   │   ├── generate-post/           # Text generation endpoint
│   │   ├── generate-carousel*/      # Carousel generation endpoints
│   │   ├── generate-image/          # Image generation/styling
│   │   ├── linkedin/                # LinkedIn API integration
│   │   ├── credits/                 # Credit system management
│   │   ├── checkout/                # Payment checkout
│   │   ├── webhook/                 # Stripe & Razorpay webhooks
│   │   └── scheduler/               # Post scheduling backend
│   ├── layout.tsx                   # Root layout with theming & providers
│   └── globals.css                  # Global styles
├── components/
│   ├── dashboard/                   # Dashboard-specific components
│   ├── landing/                     # Marketing page components
│   ├── ui/                          # Reusable shadcn/ui components
│   ├── PostHogProvider.tsx          # Analytics provider
│   └── CarouselEditor.tsx           # Carousel editing UI
├── hooks/
│   ├── use-user.ts                  # User authentication hook
│   ├── use-credits.ts               # Credit balance management
│   └── use-subscription.ts          # Subscription status hook
├── lib/
│   ├── payments/                    # Stripe/Razorpay integrations
│   ├── email/                       # Email utilities
│   ├── supabase/                    # Supabase client utilities
│   └── prompts/                     # AI system prompts
├── emails/                          # React Email templates
├── types/
│   └── database.ts                  # TypeScript database types
├── scripts/
│   ├── 001_create_profiles.sql      # User profiles table
│   ├── 002_create_todos.sql         # Todos CRUD example
│   ├── 003_create_subscriptions.sql # Subscription management
│   └── 004_credits_system.sql       # Credit system tables & functions
├── public/
│   ├── placeholder-logo.png         # App branding
│   └── systemprompt.md              # AI system prompt configuration
├── styles/
│   └── variables.css                # Design tokens
├── next.config.mjs                  # Next.js configuration
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.ts               # Tailwind CSS configuration
└── package.json                     # Project dependencies
```

## Key Features Guide

### Credit System

The platform uses a credit-based model for AI operations:

| Operation | Credits | Type |
|-----------|---------|------|
| Text Post Generation | 1 credit | Deducted on generation |
| Image Generation | 5 credits | Deducted on generation |
| Deep Research | 3 credits | Deducted on research |
| Carousel Generation | 10 credits | Deducted per carousel |

**Monthly Credit Allowances:**
- **Starter Plan**: 100 credits/month ($9)
- **Pro Plan**: 500 credits/month ($29)
- **Enterprise Plan**: 2000 credits/month ($99)

View your credit balance and transaction history in the Dashboard → Billing section.

### Carousel Creation

**Version 1 (Image-First)**
1. Enter text/topic
2. AI generates structured JSON slide content
3. Edit preview and arrange slides
4. Select visual template
5. Export as PNG carousel with visual consistency across slides

**Version 2 (Text-First)**
1. Input content structure
2. AI generates text-based slides
3. Customize in the editor
4. Text is stored in database
5. PNG is dynamically rendered at export time for maximum flexibility

### LinkedIn Integration

1. Navigate to Dashboard → Connect LinkedIn
2. Authenticate with your LinkedIn account
3. Grant necessary permissions
4. Schedule posts directly from the platform
5. Posts are queued and published at optimal times

### Post Library

- Save generated posts for future reference
- Organize posts by category or date
- Quick-repost functionality
- Export posts for external use

## Subscription & Payments

### Payment Providers

The platform supports two payment gateways:

**Stripe** (Recommended for US/International)
- Setup: [Stripe Documentation](SETUP_GUIDE.md#stripe-setup)
- Best for: International customers, ACH transfers

**Razorpay** (Recommended for India)
- Setup: [Razorpay Documentation](SETUP_GUIDE.md#razorpay-setup)
- Best for: Indian customers, UPI/local payment methods

### Subscription Management

- Automatic monthly billing
- Cancel anytime from settings
- Upgrade/downgrade plans instantly
- Tax handling included (Stripe)
- Invoice generation and history

See [SUBSCRIPTION_SETUP.md](SUBSCRIPTION_SETUP.md) for detailed setup instructions.

## API Endpoints

### Content Generation

| Endpoint | Method | Description | Credits |
|----------|--------|-------------|---------|
| `/api/generate-post` | POST | Generate AI-powered LinkedIn posts | 1 |
| `/api/generate-carousel` | POST | Generate carousel V1 (image-first) | 10 |
| `/api/generate-carousel-draft` | POST | Generate carousel V2 draft slides | 5 |
| `/api/generate-carousel-slides` | POST | Generate individual carousel slides | 2 per slide |
| `/api/generate-image` | POST | Generate/style images | 5 |
| `/api/generate-topic-ideas` | POST | Generate trending topic ideas | 1 |
| `/api/export-carousel` | POST | Export carousel as PNG | 0 (cached) |
| `/api/render-carousel-slide` | POST | Render individual slide | 0 (cached) |
| `/api/refine-post` | POST | Refine/edit generated post | 1 |

### Social Integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/linkedin/auth` | GET | Start LinkedIn OAuth flow |
| `/api/linkedin/callback` | GET | LinkedIn OAuth callback handler |
| `/api/linkedin/post` | POST | Publish post to LinkedIn |
| `/api/linkedin/status` | GET | Check LinkedIn connection status |
| `/api/linkedin/refresh` | POST | Refresh LinkedIn credentials |
| `/api/linkedin/disconnect` | POST | Revoke LinkedIn access |

### Credit Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/credits` | GET | Get current credit balance |
| `/api/credits/transactions` | GET | Get credit transaction history |
| `/api/credits/grant` | POST | Grant credits (admin only) |

### Payment & Billing

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/subscription-plans` | GET | Get available subscription plans |
| `/api/user-subscription` | GET | Get user's current subscription |
| `/api/checkout` | POST | Create checkout session |
| `/api/webhook/stripe` | POST | Stripe webhook handler |
| `/api/webhook/razorpay` | POST | Razorpay webhook handler |
| `/api/payment-success` | GET | Confirm successful payment |

### Data Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/save-carousel` | POST | Save carousel V1 to library |
| `/api/save-carousel-v2` | POST | Save carousel V2 to library |

## Database Schema

### Core Tables

**profiles**
- User profile information
- Social media handles and preferences
- Account settings and preferences

**user_credits**
- Current credit balance
- Last updated timestamp

**credit_transactions**
- Complete transaction history
- Type: text_generation, image_generation, deep_research, carousel_generation
- Reference tracking for audit trails

**subscriptions**
- Active subscription tier (starter, pro, enterprise)
- Billing cycle and renewal date
- Auto-renewal status

**subscription_plans**
- Plan definitions with credit allowances
- Pricing tiers
- Feature availability per tier

**payments**
- Payment transaction records
- Payment method and status
- Provider reference (Stripe/Razorpay transaction ID)

**carousel_saves**
- Saved carousel designs
- User-created templates and versions
- Export history

All tables include Row Level Security (RLS) policies for data protection and Row-level access control.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
   ```bash
   git add .
   git commit -m "Deploy Ghost Writer AI"
   git push origin main
   ```

2. Import repository in Vercel
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Click "Import"

3. Configure environment variables in Vercel dashboard
   - Add all required environment variables from the `.env.local` file
   - Ensure `NEXT_PUBLIC_` variables are exposed

4. Deploy
   - Click "Deploy"
   - Monitor build logs
   - Verify deployment is successful

### Post-Deployment Configuration

1. **Update API Endpoints**
   - Update webhook URLs in Stripe/Razorpay dashboards
   - Set production webhook URLs: `https://yourdomain.com/api/webhook/stripe`

2. **Update Environment**
   - Change `NEXT_PUBLIC_APP_URL` to your production domain
   - Update LinkedIn redirect URI to production domain

3. **Verify Integrations**
   - Test authentication flow
   - Test payment flow with test cards
   - Test email delivery
   - Test LinkedIn connection
   - Verify credit system operations

4. **Security Checks**
   - Verify all secrets are configured
   - Enable HTTPS only mode
   - Configure CORS if needed
   - Set up monitoring and alerting

## Development Workflow

### Available Commands

```bash
# Development
npm run dev              # Start dev server with hot reload

# Building & Production
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint

# Data Management
npm run scheduler        # Run background scheduler for LinkedIn publishing
npm run scraped-data:list    # List cached scraped content
npm run scraped-data:stats   # Show storage statistics
npm run scraped-data:cleanup # Remove old cached content
```

### Development Best Practices

- Use TypeScript for type safety
- Follow shadcn/ui component patterns
- Implement RLS policies for all new database tables
- Test payment flows with provider test cards
- Monitor credit deductions in development
- Use environment variables for all configuration

## Security Best Practices

✅ **Implemented Security Measures**
- Row Level Security (RLS) on all database tables
- API route authentication verification
- Webhook signature verification (Stripe/Razorpay)
- Environment variable protection (NEXT_PUBLIC_ only exposed)
- Password hashing via Supabase Auth
- HTTPS enforcement in production
- Credit transaction audit trail
- User-specific data isolation

## Monitoring & Analytics

### Metrics Tracked
- User signup and activation
- Feature usage (post generation, carousel creation, LinkedIn publishes)
- Credit consumption patterns
- Subscription metrics (signups, churn, MRR)
- Performance metrics (API response times, error rates)
- Revenue analytics

### Dashboard
- Access analytics via PostHog dashboard
- Vercel deployment monitoring
- Supabase database metrics

## Troubleshooting

### Common Issues

**Issue: "Credits insufficient" error**
- Solution: Check credit balance in Dashboard → Billing
- Upgrade subscription for more monthly credits
- Credits reset monthly on the subscription renewal date

**Issue: LinkedIn integration not working**
- Solution: Verify LinkedIn app credentials are configured
- Ensure redirect URI matches your domain exactly
- Check if LinkedIn token has expired (refresh automatically)
- Verify user has granted proper permissions

**Issue: Email not sending**
- Solution: Check Resend API key is valid
- Verify domain is verified in Resend (if using custom domain)
- Check email address is valid
- Review Resend dashboard for delivery failures

**Issue: Payment webhook not triggering**
- Solution: Verify webhook URL is correct in payment provider dashboard
- Check webhook secret is configured correctly
- Enable webhook retries in provider settings
- Review webhook delivery logs in provider dashboard

**Issue: Database connection errors**
- Solution: Verify Supabase credentials are correct
- Check internet connectivity
- Ensure Supabase project is active
- Review Supabase connection pool settings

### Getting Help

1. Check the relevant setup guide:
   - Payment issues → [SETUP_GUIDE.md](SETUP_GUIDE.md)
   - Subscription setup → [SUBSCRIPTION_SETUP.md](SUBSCRIPTION_SETUP.md)
   - Credit system → [CREDITS_SYSTEM.md](CREDITS_SYSTEM.md)
   - LinkedIn integration → [LinkedIn API Documentation](https://learn.microsoft.com/en-us/linkedin/)

2. Review application logs
3. Check browser console for client-side errors
4. Enable debug mode for detailed logging

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

Planned features and improvements:
- [ ] Multi-language content generation
- [ ] Advanced A/B testing framework
- [ ] Team collaboration features
- [ ] Mobile app (iOS/Android)
- [ ] Content calendar with team scheduling
- [ ] Advanced analytics with recommendations
- [ ] API for third-party integrations
- [ ] Custom AI model fine-tuning
- [ ] Bulk post generation
- [ ] Sentiment analysis and optimization

**Core Technologies**
- [Next.js](https://nextjs.org) - React framework
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

**UI & Components**
- [shadcn/ui](https://ui.shadcn.com) - High-quality React components
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [Lucide Icons](https://lucide.dev/) - Beautiful icon library

**AI & Processing**
- [Google Generative AI](https://ai.google.dev/) - Advanced text & image generation
- [Firecrawl](https://firecrawl.dev/) - Web scraping & data extraction
- [Sharp](https://sharp.pixelplumbing.com/) - Image processing

**Payment & Monetization**
- [Stripe](https://stripe.com) - Global payment processing
- [Razorpay](https://razorpay.com) - India-focused payments

**Email & Communication**
- [Resend](https://resend.com) - Transactional email service
- [React Email](https://react.email/) - Email template library

**Analytics & Monitoring**
- [Vercel](https://vercel.com) - Hosting & deployment
- [Vercel Analytics](https://vercel.com/analytics) - Performance monitoring
- [PostHog](https://posthog.com/) - Product analytics

**Social Integration**
- [LinkedIn API](https://www.linkedin.com/developers) - Social publishing

---

<div align="center">

</div>
