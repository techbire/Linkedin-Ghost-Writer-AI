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
          price_inr: number
          billing_period: "monthly" | "6_months" | "12_months" | "custom"
          features: Json
          is_active: boolean
          is_popular: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price_inr: number
          billing_period: "monthly" | "6_months" | "12_months" | "custom"
          features?: Json
          is_active?: boolean
          is_popular?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price_inr?: number
          billing_period?: "monthly" | "6_months" | "12_months" | "custom"
          features?: Json
          is_active?: boolean
          is_popular?: boolean
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
          status: "draft" | "scheduled" | "published"
          scheduled_for: string | null
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
          status?: "draft" | "scheduled" | "published"
          scheduled_for?: string | null
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
          status?: "draft" | "scheduled" | "published"
          scheduled_for?: string | null
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
          total_credits: number
          used_credits: number
          available_credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_credits?: number
          used_credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_credits?: number
          used_credits?: number
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
      user_linkedin_tokens: {
        Row: {
          user_id: string
          linkedin_access_token: string
          linkedin_token_expires_at: string
          linkedin_refresh_token: string | null
          linkedin_refresh_token_expires_at: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          user_id: string
          linkedin_access_token: string
          linkedin_token_expires_at: string
          linkedin_refresh_token?: string | null
          linkedin_refresh_token_expires_at?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          user_id?: string
          linkedin_access_token?: string
          linkedin_token_expires_at?: string
          linkedin_refresh_token?: string | null
          linkedin_refresh_token_expires_at?: string | null
          updated_at?: string
          created_at?: string
        }
      }
    }
  }
}
