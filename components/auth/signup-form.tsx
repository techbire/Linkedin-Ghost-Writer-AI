"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { AlertCircle, Loader2, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const supabase = getSupabaseBrowserClient()

  if (!supabase) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="ml-2">
          <strong>Supabase Not Configured</strong>
          <p className="mt-2 text-sm">Please add your Supabase credentials to continue:</p>
          <ol className="mt-2 ml-4 list-decimal text-sm space-y-1">
            <li>Click the Gear icon in the top right</li>
            <li>Go to Environment Variables</li>
            <li>Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          </ol>
        </AlertDescription>
      </Alert>
    )
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError("Failed to create account")
        setLoading(false)
        return
      }

      console.log('[Signup] Account created:', authData.user.id)
      console.log('[Signup] Session exists:', !!authData.session)
      console.log('[Signup] User identities:', authData.user.identities)

      // Always redirect to verification-sent page for email signups
      // User will need to verify their email before they can access the app
      setLoading(false)
      
      // Use window.location for immediate redirect (doesn't wait for middleware)
      window.location.href = "/verification-sent"
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setError(null)
    setGoogleLoading(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  if (success) {
    return (
      <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
        <AlertDescription className="text-green-800 dark:text-green-100">
          <div className="flex flex-col gap-2">
            <p className="font-semibold">Account created successfully! 🎉</p>
            <p className="text-sm">Please check your email to verify your account.</p>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col items-center gap-[26px] w-full">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 w-full max-w-[570px]">
        <h1 className="font-['SF_Pro'] font-[590] text-[32px] md:text-[42px] leading-[50px] text-[#333333] text-center">
          Create an account
        </h1>
        <p className="font-['SF_Pro'] font-normal text-[16px] md:text-[18px] leading-[21px] text-[#333333] text-center">
          Enter your information to get started.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSignup} className="flex flex-col items-start gap-[26px] w-full max-w-[570px]">
        {error && (
          <Alert variant="destructive" className="w-full">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Full Name Input */}
        <div className="flex flex-col items-start gap-[17px] w-full">
          <Label 
            htmlFor="fullName" 
            className="font-['Inter'] font-medium text-[16px] md:text-[18px] leading-[22px] text-[#333333]"
          >
            Full Name
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={loading || googleLoading}
            className="w-full h-[52px] bg-[rgba(51,51,51,0.05)] border-0 rounded-xl placeholder:text-[#98989A] placeholder:font-['Inter'] placeholder:font-medium placeholder:text-[16px] md:placeholder:text-[18px] px-5 font-['Inter'] font-medium text-[16px] md:text-[18px]"
          />
        </div>

        {/* Email Input */}
        <div className="flex flex-col items-start gap-[17px] w-full">
          <Label 
            htmlFor="email" 
            className="font-['Inter'] font-medium text-[16px] md:text-[18px] leading-[22px] text-[#333333]"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || googleLoading}
            className="w-full h-[52px] bg-[rgba(51,51,51,0.05)] border-0 rounded-xl placeholder:text-[#98989A] placeholder:font-['Inter'] placeholder:font-medium placeholder:text-[16px] md:placeholder:text-[18px] px-5 font-['Inter'] font-medium text-[16px] md:text-[18px]"
          />
        </div>

        {/* Password Input */}
        <div className="flex flex-col items-start gap-[17px] w-full">
          <Label 
            htmlFor="password" 
            className="font-['Inter'] font-medium text-[16px] md:text-[18px] leading-[22px] text-[#333333]"
          >
            Set a password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || googleLoading}
            minLength={6}
            className="w-full h-[52px] bg-[rgba(51,51,51,0.05)] border-0 rounded-xl placeholder:text-[#98989A] placeholder:font-['Inter'] placeholder:font-medium placeholder:text-[16px] md:placeholder:text-[18px] px-5 font-['Inter'] font-medium text-[16px] md:text-[18px]"
          />
        </div>

        {/* Sign Up Button */}
        <Button 
          type="submit" 
          disabled={loading || googleLoading}
          className="w-full h-[48px] md:h-[52px] bg-[#34A853] hover:bg-[#2d9047] text-white rounded-xl shadow-[0px_0px_3px_rgba(0,0,0,0.084),0px_2px_3px_rgba(0,0,0,0.168)] font-['Roboto'] font-normal text-[18px] md:text-[20px] leading-[100%] tracking-[0.01em]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating...
            </>
          ) : (
            "Sign up"
          )}
        </Button>

        {/* Or Divider */}
        <div className="flex items-center justify-center gap-4 w-full">
          <div className="flex-1 h-0 border-t border-[rgba(97,97,97,0.5)]" />
          <span className="font-['Roboto'] font-normal text-[14px] md:text-[16px] leading-[100%] tracking-[0.01em] text-[rgba(97,97,97,0.5)]">
            Or
          </span>
          <div className="flex-1 h-0 border-t border-[rgba(97,97,97,0.5)]" />
        </div>

        {/* Continue with Google Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignup}
          disabled={loading || googleLoading}
          className="w-full h-[54px] bg-white border border-black/5 shadow-[0px_0px_3px_rgba(0,0,0,0.084),0px_2px_3px_rgba(0,0,0,0.168)] rounded-[10px] hover:bg-gray-50"
        >
          {googleLoading ? (
            <>
              <Loader2 className="mr-3 md:mr-4 h-5 w-5 md:h-6 md:w-6 animate-spin" />
              <span className="font-['Roboto'] font-medium text-[18px] md:text-[20px] leading-[23px] text-[rgba(51,51,51,0.54)]">
                Connecting...
              </span>
            </>
          ) : (
            <>
              {/* Google Logo */}
              <svg className="mr-3 md:mr-4 h-5 w-5 md:h-6 md:w-6" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="font-['Roboto'] font-medium text-[18px] md:text-[20px] leading-[23px] text-[rgba(51,51,51,0.54)]">
                Continue with Google
              </span>
            </>
          )}
        </Button>

        {/* Security Notice */}
        <div className="flex items-center gap-2 w-full justify-center pt-2">
          <Lock className="w-5 h-5 md:w-6 md:h-6 text-[rgba(97,97,97,0.5)]" />
          <span className="font-['Inter'] font-medium text-[16px] md:text-[18px] leading-[22px] text-[rgba(97,97,97,0.5)]">
            100% secure and end-to-end encrypted.
          </span>
        </div>
      </form>

      {/* Login Link */}
      <p className="w-full max-w-[570px] font-['Roboto'] font-normal text-[16px] md:text-[18px] leading-[160%] tracking-[0.01em] text-[#616161] text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-[#1E4AE9] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}