"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Database } from "@/types/database"

interface OnboardingFormProps {
  userEmail: string
  initialFullName?: string
}

export function OnboardingForm({ userEmail, initialFullName = '' }: OnboardingFormProps) {
  const [fullName, setFullName] = useState(initialFullName)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profession, setProfession] = useState("")
  const [designation, setDesignation] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = getSupabaseBrowserClient()

  if (!supabase) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Supabase Not Configured</strong>
        </AlertDescription>
      </Alert>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate required fields
      if (!fullName.trim() || !profession.trim() || !designation.trim()) {
        setError("Please fill in all required fields")
        setLoading(false)
        return
      }

      // Validate password if provided
      if (password && password !== confirmPassword) {
        setError("Passwords do not match")
        setLoading(false)
        return
      }

      if (password && password.length < 6) {
        setError("Password must be at least 6 characters")
        setLoading(false)
        return
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError("User not found. Please log in again.")
        setLoading(false)
        return
      }

      // Update password if provided
      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: password
        })

        if (passwordError) {
          throw passwordError
        }
      }

      // Update profile
      console.log('[Onboarding] Updating profile with:', {
        full_name: fullName,
        profession: profession,
        designation: designation,
        website_url: websiteUrl || null,
      })
      
      const { error: profileError } = await supabase
        .from('profiles')
        // @ts-expect-error - Supabase type inference issue with optional fields
        .update({
          full_name: fullName,
          profession: profession,
          designation: designation,
          website_url: websiteUrl || null,
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('[Onboarding] Profile update error:', profileError)
        throw profileError
      }

      console.log('[Onboarding] Profile updated successfully')

      // If user provided a website URL, save it to localStorage for background scraping
      if (websiteUrl && websiteUrl.trim()) {
        console.log('[Onboarding] Saving website URL to localStorage:', websiteUrl)
        localStorage.setItem('pending_website_scrape', websiteUrl.trim())
      }

      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      console.error('Onboarding error:', err)
      setError(err.message || "Failed to complete onboarding")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome! Let's get you set up</CardTitle>
        <CardDescription>
          Complete your profile to start creating amazing content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                This email is linked to your Google account
              </p>
            </div>
          </div>

          {/* Set Password (Optional) */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Set Password (Optional)</h3>
              <p className="text-sm text-muted-foreground">
                Set a password to enable email/password login in addition to Google
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Professional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="profession">
                Profession <span className="text-destructive">*</span>
              </Label>
              <Input
                id="profession"
                type="text"
                placeholder="e.g., Marketing, Software Development, Consulting"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">
                Designation <span className="text-destructive">*</span>
              </Label>
              <Input
                id="designation"
                type="text"
                placeholder="e.g., Marketing Manager, Senior Developer, CEO"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL (Optional)</Label>
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://yourcompany.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing Setup...
              </>
            ) : (
              "Complete Setup"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
