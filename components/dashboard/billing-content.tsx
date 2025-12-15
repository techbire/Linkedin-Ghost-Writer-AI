"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Database } from "@/types/database"
import { format } from "date-fns"
import { CheckoutButton } from "./checkout-button"
import { useSearchParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, CreditCard, Calendar, Crown, Check, Sparkles, TrendingUp, TrendingDown, ArrowUpCircle } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"]
type Payment = Database["public"]["Tables"]["payments"]["Row"]
type SubscriptionPlan = Database["public"]["Tables"]["subscription_plans"]["Row"]
type CreditTransaction = Database["public"]["Tables"]["credit_transactions"]["Row"]

interface BillingContentProps {
  subscription: Subscription | null
  payments: Payment[]
}

export function BillingContent({ subscription, payments }: BillingContentProps) {
  const searchParams = useSearchParams()
  const success = searchParams.get("success")
  const canceled = searchParams.get("canceled")
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null)
  const [credits, setCredits] = useState<number>(0)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])

  // Fetch subscription plans and current plan details
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
      }
    }

    fetchPlans()
  }, [])

  // Fetch user credits
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch('/api/credits')
        if (response.ok) {
          const data = await response.json()
          setCredits(data.credits || 0)
        }
      } catch (error) {
        console.error('Failed to fetch credits:', error)
      }
    }

    fetchCredits()
  }, [])

  // Fetch credit transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/credits/transactions')
        if (response.ok) {
          const data = await response.json()
          setTransactions(data.transactions || [])
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
      }
    }

    fetchTransactions()
  }, [])

  // Get current plan details
  useEffect(() => {
    if (subscription && plans.length > 0) {
      const plan = plans.find(p => p.id === subscription.plan_id)
      setCurrentPlan(plan || null)
    }
  }, [subscription, plans])

  return (
    <div className="space-y-6">
      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Payment successful! Your subscription is now active.</AlertDescription>
        </Alert>
      )}

      {canceled && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>Payment was canceled. Please try again.</AlertDescription>
        </Alert>
      )}

      {/* Credits Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Your Credits
          </CardTitle>
          <CardDescription>Track your AI generation credits and usage.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Available Credits</p>
              <p className="text-4xl font-bold">{credits}</p>
              <p className="text-xs text-muted-foreground mt-2">
                1 credit = 1 text generation | 5 credits = 1 image generation
              </p>
            </div>
            <Sparkles className="h-16 w-16 text-primary/20" />
          </div>

          {/* Recent Credit Activity */}
          {transactions.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {transactions.slice(0, 10).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-3">
                      {transaction.amount > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium capitalize">
                          {transaction.type.replace(/_/g, " ")}
                        </p>
                        {transaction.description && (
                          <p className="text-xs text-muted-foreground">{transaction.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                        {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.created_at), "MMM dd, HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Manage your subscription plan and billing information.</CardDescription>
        </CardHeader>
        <CardContent>
          {subscription && currentPlan ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                    {currentPlan.is_popular && <Crown className="h-5 w-5 text-yellow-500" />}
                    {subscription.status === "active" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  </div>
                  <p className="text-lg font-semibold">
                    ₹{currentPlan.price.toFixed(2)}
                    <span className="text-sm font-normal text-muted-foreground">/{currentPlan.billing_period}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                      {subscription.status}
                    </Badge>
                  </div>
                  {currentPlan.description && (
                    <p className="text-sm text-muted-foreground">{currentPlan.description}</p>
                  )}
                </div>
                <Button variant="default" size="sm" asChild>
                  <Link href="/dashboard/billing/upgrade">
                    <ArrowUpCircle className="mr-2 h-4 w-4" />
                    Upgrade Plan
                  </Link>
                </Button>
              </div>

              {/* Plan Features */}
              {currentPlan.features && Array.isArray(currentPlan.features) && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Plan Features:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {(currentPlan.features as string[]).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-3 w-3 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {subscription.current_period_end && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                  <Calendar className="h-4 w-4" />
                  <span>Next billing date: {format(new Date(subscription.current_period_end), "MMMM dd, yyyy")}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 py-6">
              <div className="text-center space-y-4">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">No Active Subscription</p>
                  <p className="text-sm text-muted-foreground">Choose a plan to unlock all features</p>
                </div>
                <Button size="lg" asChild>
                  <Link href="/dashboard/billing/upgrade">
                    <ArrowUpCircle className="mr-2 h-5 w-5" />
                    View Upgrade Plans
                  </Link>
                </Button>
              </div>

              {/* Quick Preview of Plans */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4 border-t">
                {plans.slice(0, 3).map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-4 border rounded-lg text-center space-y-2 ${
                      plan.is_popular ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    {plan.is_popular && (
                      <Badge className="mb-2">
                        <Crown className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    <h4 className="font-semibold">{plan.name}</h4>
                    <p className="text-2xl font-bold">
                      ₹{plan.price_inr ? (plan.price_inr / 100).toFixed(0) : '0'}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{plan.billing_period === '6_months' ? '6 months' : plan.billing_period === '12_months' ? '12 months' : plan.billing_period}
                      </span>
                    </p>
                    {plan.price_inr > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit mx-auto">
                        <Sparkles className="h-3 w-3" />
                        Credits included
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Button variant="link" asChild>
                  <Link href="/dashboard/billing/upgrade">
                    View detailed comparison →
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View your recent payment transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">No payment history yet.</p>
              <p className="text-sm text-muted-foreground">
                Your transactions will appear here once you make a payment.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {payment.currency.toUpperCase()} {payment.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(payment.created_at), "MMM dd, yyyy")} • {payment.payment_provider}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      payment.status === "succeeded"
                        ? "default"
                        : payment.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
