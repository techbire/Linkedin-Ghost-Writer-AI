"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckoutButton } from "@/components/dashboard/checkout-button"
import { Sparkles, Check, Crown, ArrowLeft, Zap } from "lucide-react"
import Link from "next/link"
import type { Database } from "@/types/database"

type SubscriptionPlan = Database["public"]["Tables"]["subscription_plans"]["Row"]

export default function UpgradePage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/subscription-plans')
        if (response.ok) {
          const data = await response.json()
          setPlans(data.plans || [])
        }
      } catch (error) {
        console.error('Failed to fetch subscription plans:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/billing">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Billing
          </Link>
        </Button>
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Upgrade Your Plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your content creation needs. All plans include access to AI-powered post generation, carousel creator, and more.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-3/4 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-12 bg-muted rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 bg-muted rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all hover:shadow-lg ${
                plan.is_popular
                  ? "border-primary shadow-xl scale-105"
                  : "border-border"
              }`}
            >
              {plan.is_popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Crown className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  {plan.name}
                  {plan.is_popular && <Crown className="h-5 w-5 text-yellow-500" />}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold">
                      ₹{plan.price_inr ? (plan.price_inr / 100).toFixed(0) : '0'}
                    </span>
                    <span className="text-muted-foreground">
                      /{plan.billing_period === '6_months' ? '6 months' : plan.billing_period === '12_months' ? '12 months' : plan.billing_period}
                    </span>
                  </div>
                  {plan.price_inr > 0 && (
                    <Badge variant="secondary" className="mt-3 flex items-center gap-1 w-fit mx-auto">
                      <Sparkles className="h-3 w-3" />
                      <span>Credits included in plan</span>
                    </Badge>
                  )}
                </div>

                {/* Features */}
                {plan.features && Array.isArray(plan.features) && (
                  <div className="space-y-3">
                    {(plan.features as string[]).map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                        </div>
                        <span className="text-sm flex-1">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA Button */}
                <div className="pt-4">
                  {plan.is_popular ? (
                    <CheckoutButton planId={plan.id}>
                      <span className="flex items-center justify-center w-full">
                        <Zap className="mr-2 h-4 w-4" />
                        Get Started
                      </span>
                    </CheckoutButton>
                  ) : (
                    <CheckoutButton planId={plan.id}>
                      Choose Plan
                    </CheckoutButton>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* FAQ / Additional Info */}
      <Card className="max-w-4xl mx-auto mt-12">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1">What are credits?</h4>
            <p className="text-sm text-muted-foreground">
              Credits are used to generate AI content. Each plan includes monthly credits that refresh with your billing cycle.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Can I change my plan later?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">What payment methods do you accept?</h4>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards and payment methods through Stripe and Razorpay.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Do unused credits roll over?</h4>
            <p className="text-sm text-muted-foreground">
              Credits refresh with your subscription billing cycle. Unused credits do not carry over to the next period.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
