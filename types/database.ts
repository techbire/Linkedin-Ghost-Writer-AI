export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          profession: string | null
          designation: string | null
          website_url: string | null
          business_context: Json | null
          context_scraped_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          profession?: string | null
          designation?: string | null
          website_url?: string | null
          business_context?: Json | null
          context_scraped_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          profession?: string | null
          designation?: string | null
          website_url?: string | null
          business_context?: Json | null
          context_scraped_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          currency: string
          billing_period: "month" | "year"
          features: Json
          is_popular: boolean
          stripe_price_id: string | null
          razorpay_plan_id: string | null
          is_active: boolean
          credits_per_month: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          price: number
          currency?: string
          billing_period: "month" | "year"
          features?: Json
          is_popular?: boolean
          stripe_price_id?: string | null
          razorpay_plan_id?: string | null
          is_active?: boolean
          credits_per_month?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          currency?: string
          billing_period?: "month" | "year"
          features?: Json
          is_popular?: boolean
          stripe_price_id?: string | null
          razorpay_plan_id?: string | null
          is_active?: boolean
          credits_per_month?: number
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: "active" | "canceled" | "past_due" | "trialing"
          plan_id: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          stripe_subscription_id: string | null
          razorpay_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status: "active" | "canceled" | "past_due" | "trialing"
          plan_id: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          stripe_subscription_id?: string | null
          razorpay_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: "active" | "canceled" | "past_due" | "trialing"
          plan_id?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          stripe_subscription_id?: string | null
          razorpay_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          status: "succeeded" | "failed" | "pending"
          payment_provider: "stripe" | "razorpay"
          provider_payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency?: string
          status: "succeeded" | "failed" | "pending"
          payment_provider: "stripe" | "razorpay"
          provider_payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          status?: "succeeded" | "failed" | "pending"
          payment_provider?: "stripe" | "razorpay"
          provider_payment_id?: string | null
          created_at?: string
        }
      }
      todos: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          category: string | null
          tone: string | null
          status: "draft" | "scheduled" | "published"
          scheduled_date: string | null
          post_type: "single" | "carousel"
          slides: Json | null
          image_urls: string[] | null
          theme: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          category?: string | null
          tone?: string | null
          status?: "draft" | "scheduled" | "published"
          scheduled_date?: string | null
          post_type?: "single" | "carousel"
          slides?: Json | null
          image_urls?: string[] | null
          theme?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          category?: string | null
          tone?: string | null
          status?: "draft" | "scheduled" | "published"
          scheduled_date?: string | null
          post_type?: "single" | "carousel"
          slides?: Json | null
          image_urls?: string[] | null
          theme?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      user_credits: {
        Row: {
          id: string
          user_id: string
          credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          credits?: number
          created_at?: string
          updated_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: "purchase" | "text_generation" | "image_generation" | "bonus" | "refund"
          description: string | null
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: "purchase" | "text_generation" | "image_generation" | "bonus" | "refund"
          description?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: "purchase" | "text_generation" | "image_generation" | "bonus" | "refund"
          description?: string | null
          reference_id?: string | null
          created_at?: string
        }
      }
      post_feedback: {
        Row: {
          id: string
          user_id: string
          post_id: string | null
          quality_rating: number | null
          relevance_rating: number | null
          tone_rating: number | null
          engagement_potential_rating: number | null
          overall_rating: number
          liked_aspects: string[] | null
          disliked_aspects: string[] | null
          improvement_suggestions: string | null
          was_helpful: boolean | null
          would_use_again: boolean | null
          met_expectations: boolean | null
          generation_params: Json | null
          feedback_context: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id?: string | null
          quality_rating?: number | null
          relevance_rating?: number | null
          tone_rating?: number | null
          engagement_potential_rating?: number | null
          overall_rating: number
          liked_aspects?: string[] | null
          disliked_aspects?: string[] | null
          improvement_suggestions?: string | null
          was_helpful?: boolean | null
          would_use_again?: boolean | null
          met_expectations?: boolean | null
          generation_params?: Json | null
          feedback_context?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string | null
          quality_rating?: number | null
          relevance_rating?: number | null
          tone_rating?: number | null
          engagement_potential_rating?: number | null
          overall_rating?: number
          liked_aspects?: string[] | null
          disliked_aspects?: string[] | null
          improvement_suggestions?: string | null
          was_helpful?: boolean | null
          would_use_again?: boolean | null
          met_expectations?: boolean | null
          generation_params?: Json | null
          feedback_context?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
