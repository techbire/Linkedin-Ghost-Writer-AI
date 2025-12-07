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
import { AlertCircle, Loader2 } from "lucide-react"

interface LoginFormProps {
  urlError?: string
}

export function LoginForm({ urlError }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Check if user has completed onboarding
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('profession, designation')
          .eq('id', user.id)
          .single()
        
        // Type cast for TypeScript
        const typedProfile = profile as { profession: string | null; designation: string | null } | null
        
        // Redirect to onboarding if not completed
        if (!typedProfile || !typedProfile.profession || !typedProfile.designation) {
          router.push("/onboarding")
        } else {
          router.push("/dashboard")
        }
      } else {
        router.push("/dashboard")
      }
      
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
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

  return (
    <>
      {/* Intro Section */}
      <div className="flex flex-col items-start gap-[26px] w-full max-w-[400px]">
        <h1 className="font-['SF_Pro_Rounded'] font-medium text-[28px] md:text-[36px] leading-[100%] tracking-[0.01em] text-[#333333] flex items-center">
          Welcome Back 👋
        </h1>
        <p className="font-['Inter'] font-medium text-[14px] md:text-[16px] leading-[160%] tracking-[-0.04em] text-[#616161] w-full md:w-[326px]">
          Today is a new day. It's your day. You shape it. Sign in to start managing your post content.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="flex flex-col justify-center items-end gap-[26px] w-full max-w-[400px]">
        {(error || urlError === "connection_failed") && (
          <Alert variant="destructive" className="w-full">
            <AlertDescription>
              {error || "Unable to connect to authentication service. Please check your internet connection and try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* Email Input */}
        <div className="flex flex-col items-start gap-2 w-full">
          <Label 
            htmlFor="email" 
            className="font-['Roboto'] font-normal text-[14px] md:text-[16px] leading-[100%] tracking-[0.01em] text-[#333333]"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || googleLoading}
            className="w-full h-11 md:h-12 bg-[#FDFFFE] border border-[#D4D7E3] rounded-xl placeholder:text-[#8897AD] placeholder:text-[14px] md:placeholder:text-[16px]"
          />
        </div>

        {/* Password Input */}
        <div className="flex flex-col items-start gap-2 w-full">
          <Label 
            htmlFor="password" 
            className="font-['Roboto'] font-normal text-[14px] md:text-[16px] leading-[100%] tracking-[0.01em] text-[#333333]"
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || googleLoading}
            className="w-full h-11 md:h-12 bg-[#FDFFFE] border border-[#D4D7E3] rounded-xl placeholder:text-[#8897AD] placeholder:text-[14px] md:placeholder:text-[16px]"
          />
        </div>

        {/* Forgot Password Link */}
        <Link 
          href="/forgot-password" 
          className="font-['Roboto'] font-normal text-[14px] md:text-[16px] leading-[100%] tracking-[0.01em] text-[#1E4AE9] hover:underline self-end"
        >
          Forgot Password?
        </Link>

        {/* Sign In Button */}
        <Button 
          type="submit" 
          disabled={loading || googleLoading}
          className="w-full h-[48px] md:h-[52px] bg-[#34A853] hover:bg-[#2d9047] text-white rounded-xl shadow-[0px_0px_3px_rgba(0,0,0,0.084),0px_2px_3px_rgba(0,0,0,0.168)] font-['Roboto'] font-normal text-[18px] md:text-[20px] leading-[100%] tracking-[0.01em]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      {/* Social Sign In Section */}
      <div className="flex flex-col items-start gap-[26px] w-full max-w-[400px]">
        {/* Or Divider */}
        <div className="flex items-center justify-center gap-4 w-full py-2.5">
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
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full h-[50px] md:h-[54px] bg-white border border-black/5 shadow-[0px_0px_3px_rgba(0,0,0,0.084),0px_2px_3px_rgba(0,0,0,0.168)] rounded-[10px] hover:bg-gray-50"
        >
          {googleLoading ? (
            <>
              <Loader2 className="mr-3 md:mr-4 h-5 w-5 md:h-6 md:w-6 animate-spin" />
              <span className="font-['Roboto'] font-medium text-[18px] md:text-[20px] leading-[23px] text-[rgba(0,0,0,0.54)]">
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
              <span className="font-['Roboto'] font-medium text-[18px] md:text-[20px] leading-[23px] text-[rgba(0,0,0,0.54)]">
                Continue with Google
              </span>
            </>
          )}
        </Button>
      </div>

      {/* Sign Up Link */}
      <p className="w-full max-w-[400px] font-['Roboto'] font-normal text-[16px] md:text-[18px] leading-[160%] tracking-[0.01em] text-[#616161] text-center">
        Don't you have an account?{" "}
        <Link href="/signup" className="text-[#1E4AE9] hover:underline">
          Sign up
        </Link>
      </p>
    </>
  )
}
