"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Check, User, Mic, Target, CheckCircle, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Local Progress component (fallback) — simple progress bar used when '@/components/ui/progress' is not available
function Progress({ value = 0, className = '' }: { value?: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={`w-full bg-muted rounded ${className}`} style={{ overflow: 'hidden' }}>
      <div style={{ width: `${pct}%` }} className="h-full bg-primary rounded" />
    </div>
  )
}

interface MultiStepOnboardingProps {
  userEmail: string
  initialFullName?: string
  onStepChange?: (step: number) => void
}

type Step = 1 | 2 | 3 | 4

export function MultiStepOnboarding({ userEmail, initialFullName = '', onStepChange }: MultiStepOnboardingProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  // Step 1: Basic Info
  const [fullName, setFullName] = useState(initialFullName)
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [profession, setProfession] = useState("")
  const [designation, setDesignation] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")

  // Step 2: Voice Setup
  const [voiceSource, setVoiceSource] = useState<"my_style" | "influencer" | null>(null)
  const [influencerUrl, setInfluencerUrl] = useState("")
  const [showInfluencerModal, setShowInfluencerModal] = useState(false)

  // Step 3: Target Audience
  const [targetAudience, setTargetAudience] = useState("")
  const [commonChallenges, setCommonChallenges] = useState("")

  // Step 4: Processing
  const [processingSteps, setProcessingSteps] = useState({
    scrapingProfile: 'pending' as 'pending' | 'in-progress' | 'completed',
    creatingContext: 'pending' as 'pending' | 'in-progress' | 'completed',
    scrapingPosts: 'pending' as 'pending' | 'in-progress' | 'completed',
    creatingVoice: 'pending' as 'pending' | 'in-progress' | 'completed',
  })

  const steps = [
    { number: 1, title: "LinkedIn Profile", icon: User, status: currentStep > 1 ? "completed" : currentStep === 1 ? "in-progress" : "pending" },
    { number: 2, title: "Voice Setup", icon: Mic, status: currentStep > 2 ? "completed" : currentStep === 2 ? "in-progress" : "pending" },
    { number: 3, title: "Target Audience", icon: Target, status: currentStep > 3 ? "completed" : currentStep === 3 ? "in-progress" : "pending" },
    { number: 4, title: "Review & Submit", icon: CheckCircle, status: currentStep === 4 ? "in-progress" : "pending" },
  ]

  const validateStep1 = () => {
    if (!fullName.trim()) {
      setError("Please enter your full name")
      return false
    }
    if (!profession.trim()) {
      setError("Please enter your profession")
      return false
    }
    if (!designation.trim()) {
      setError("Please enter your designation")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!voiceSource) {
      setError("Please select a voice source")
      return false
    }
    if (voiceSource === "influencer" && !influencerUrl.trim()) {
      setError("Please enter an influencer's LinkedIn URL")
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (!targetAudience.trim() || targetAudience.length < 10) {
      setError("Please describe your target audience (minimum 10 characters)")
      return false
    }
    return true
  }

  const handleNext = () => {
    console.log('[Onboarding Client] 🔘 handleNext called, currentStep:', currentStep)
    setError(null)
    
    if (currentStep === 1 && !validateStep1()) {
      console.log('[Onboarding Client] ❌ Step 1 validation failed')
      return
    }
    if (currentStep === 2 && !validateStep2()) {
      console.log('[Onboarding Client] ❌ Step 2 validation failed')
      return
    }
    if (currentStep === 3 && !validateStep3()) {
      console.log('[Onboarding Client] ❌ Step 3 validation failed')
      return
    }
    
    // If on step 3, move to step 4 and start processing
    if (currentStep === 3) {
      console.log('[Onboarding Client] ✅ Moving to Step 4 and starting processing...')
      setCurrentStep(4)
      onStepChange?.(4)
      // Start processing immediately
      handleFinalSubmit()
    } else if (currentStep < 3) {
      console.log('[Onboarding Client] ✅ Moving to next step:', currentStep + 1)
      const nextStep = (currentStep + 1) as Step
      setCurrentStep(nextStep)
      onStepChange?.(nextStep)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setError(null)
      const prevStep = (currentStep - 1) as Step
      setCurrentStep(prevStep)
      onStepChange?.(prevStep)
    }
  }

  const handleFinalSubmit = async () => {
    console.log('[Onboarding Client] 🚀 Starting final submit')
    console.log('[Onboarding Client] Form data:', {
      fullName,
      linkedinUrl,
      profession,
      designation,
      websiteUrl,
      voiceSource,
      influencerUrl,
      targetAudience,
      commonChallenges
    })
    
    if (!supabase) {
      console.error('[Onboarding Client] ❌ Supabase client not available')
      setError("Supabase client not available")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      console.log('[Onboarding Client] 🔐 Getting user...')
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('[Onboarding Client] ❌ User not found')
        setError("User not found. Please log in again.")
        return
      }

      console.log('[Onboarding Client] ✅ User authenticated:', user.id)

      // Step 1: Scraping LinkedIn Profile (if URL provided)
      console.log('[Onboarding Client] 📊 Step 1: Scraping profile...')
      setProcessingSteps(prev => ({ ...prev, scrapingProfile: 'in-progress' }))
      
      if (linkedinUrl) {
        try {
          console.log('[Onboarding Client] 📤 Calling /api/scrape-linkedin (profile step)')
          const profileResponse = await fetch('/api/scrape-linkedin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profileUrl: linkedinUrl,
              step: 'profile'
            })
          })
          
          console.log('[Onboarding Client] 📥 Profile response status:', profileResponse.status)
          
          if (!profileResponse.ok) {
            const errorText = await profileResponse.text()
            console.error('[Onboarding Client] ❌ Profile scrape failed:', errorText)
            throw new Error(`Profile scrape failed: ${profileResponse.status}`)
          }
          
          const profileData = await profileResponse.json()
          console.log('[Onboarding Client] ✅ Profile scraped:', profileData)
        } catch (error: any) {
          console.error('[Onboarding Client] ❌ Profile scrape error:', error.message)
          console.error('[Onboarding Client] Error details:', error)
        }
      } else {
        console.log('[Onboarding Client] ⏭️ Skipping profile scrape (no URL)')
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      setProcessingSteps(prev => ({ ...prev, scrapingProfile: 'completed', creatingContext: 'in-progress' }))

      // Step 2: Creating Context
      console.log('[Onboarding Client] 📊 Step 2: Creating context...')
      await new Promise(resolve => setTimeout(resolve, 1500))
      setProcessingSteps(prev => ({ ...prev, creatingContext: 'completed', scrapingPosts: 'in-progress' }))

      // Step 3: Scraping Posts and Analyzing with Gemini
      console.log('[Onboarding Client] 📊 Step 3: Scraping posts...')
      const shouldScrapeLinkedIn = linkedinUrl || (voiceSource === 'influencer' && influencerUrl)
      console.log('[Onboarding Client] Should scrape LinkedIn?', shouldScrapeLinkedIn)
      
      if (shouldScrapeLinkedIn) {
        try {
          const requestBody = {
            profileUrl: linkedinUrl,
            voiceSource: voiceSource,
            influencerUrl: influencerUrl,
            step: 'posts'
          }
          
          console.log('[Onboarding Client] 📤 Calling /api/scrape-linkedin (posts step)')
          console.log('[Onboarding Client] Request body:', requestBody)
          
          const postsResponse = await fetch('/api/scrape-linkedin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          })
          
          console.log('[Onboarding Client] 📥 Posts response status:', postsResponse.status)
          
          if (!postsResponse.ok) {
            const errorText = await postsResponse.text()
            console.error('[Onboarding Client] ❌ Posts scrape failed:', errorText)
            throw new Error(`Posts scrape failed: ${postsResponse.status}`)
          }
          
          const postsData = await postsResponse.json()
          console.log('[Onboarding Client] ✅ Posts scraped and analyzed:', postsData)
          
          if (!postsData.success) {
            console.error('[Onboarding Client] ❌ Post scraping failed:', postsData.error)
          }
        } catch (error: any) {
          console.error('[Onboarding Client] ❌ Post scrape error:', error.message)
          console.error('[Onboarding Client] Error details:', error)
        }
      } else {
        console.log('[Onboarding Client] ⏭️ Skipping posts scrape')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
      setProcessingSteps(prev => ({ ...prev, scrapingPosts: 'completed', creatingVoice: 'in-progress' }))

      // Step 4: Creating Voice Profile
      console.log('[Onboarding Client] 📊 Step 4: Creating voice profile...')
      await new Promise(resolve => setTimeout(resolve, 1500))
      setProcessingSteps(prev => ({ ...prev, creatingVoice: 'completed' }))

      // Update profile in database
      console.log('[Onboarding Client] 💾 Updating profile in database...')
      console.log('[Onboarding Client] Profile data:', {
        full_name: fullName,
        profession: profession,
        designation: designation,
        website_url: websiteUrl || null,
      })
      
      // Get current business_context to merge with existing data (voice analysis)
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('business_context')
        .eq('id', user.id)
        .single()
      
      const currentContext = (currentProfile as any)?.business_context || {}
      console.log('[Onboarding Client] Current business_context keys:', Object.keys(currentContext))
      
      // Merge existing context (including voice analysis) with onboarding data
      const updatedBusinessContext = {
        ...currentContext,
        linkedinUrl: linkedinUrl || null,
        voiceSource: voiceSource,
        influencerUrl: voiceSource === 'influencer' ? influencerUrl : null,
        targetAudience: targetAudience,
        commonChallenges: commonChallenges || null,
        onboardingCompletedAt: new Date().toISOString(),
      }
      
      console.log('[Onboarding Client] Updating with merged context:', {
        hasVoiceAnalysis: !!updatedBusinessContext.voiceAnalysis,
        hasWritingTemplate: !!updatedBusinessContext.writingTemplate,
        keys: Object.keys(updatedBusinessContext)
      })
      
      const { error: profileError } = await supabase
        .from('profiles')
        // @ts-expect-error - Supabase type inference issue with optional fields
        .update({
          full_name: fullName,
          profession: profession,
          designation: designation,
          website_url: websiteUrl || null,
          business_context: updatedBusinessContext,
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('[Onboarding Client] ❌ Profile update error:', profileError)
        throw profileError
      }

      console.log('[Onboarding Client] ✅ Profile updated successfully')

      // Save website URL for background scraping
      if (websiteUrl && websiteUrl.trim()) {
        console.log('[Onboarding Client] 💾 Saving website URL to localStorage:', websiteUrl)
        localStorage.setItem('pending_website_scrape', websiteUrl.trim())
      }

      // Small delay before redirect
      console.log('[Onboarding Client] 🎉 Onboarding complete! Redirecting...')
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      console.error('[Onboarding Client] ❌ ERROR:', err.message)
      console.error('[Onboarding Client] Error details:', err)
      setError(err.message || "Failed to complete onboarding")
      setIsProcessing(false)
    }
  }

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

  const overallProgress = (currentStep / 4) * 100

  // Step 1: Custom Figma Design (No Card wrapper)
  if (currentStep === 1) {
    return (
      <>
        <div className="w-full max-w-[650px] flex flex-col items-center gap-[20px] pb-[430px] pt-[45px] scale-[0.9] origin-top">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 w-full">
            <h1 className="font-['Arial'] font-[590] text-[36px] leading-[42px] text-[#333333]">
              Let's Get to Know You Better
            </h1>
            <p className="font-['Arial'] font-normal text-[16px] leading-[22px] text-center text-[#333333] w-full">
              Just a few details to help us understand your background.
              <br />
              Your Profession and Designation are required.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form Inputs */}
          <div className="flex flex-col items-start gap-4 w-full pt-3">
            {/* Profession */}
            <div className="flex flex-col items-start gap-[14px] w-full">
              <label 
                htmlFor="profession" 
                className="font-['SF_Pro'] font-medium text-[16px] leading-[20px] text-[#333333]"
              >
                Profession*
              </label>
              <input
                id="profession"
                type="text"
                placeholder="e.g., Marketing, Software Development, Consulting"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="box-border flex items-center px-4 py-[12px] w-full h-[48px] bg-[rgba(6,6,6,0.02)] border border-[#D5D5D5] rounded-xl font-['SF_Pro'] font-medium text-[16px] leading-[20px] text-[#333333] placeholder:text-[#98989A] focus:outline-none focus:ring-2 focus:ring-[#34A853] focus:border-transparent"
              />
            </div>

            {/* Designation (Email label from Figma) */}
            <div className="flex flex-col items-start gap-[14px] w-full">
              <label 
                htmlFor="designation" 
                className="font-['SF_Pro'] font-medium text-[16px] leading-[20px] text-[#333333]"
              >
                Email*
              </label>
              <input
                id="designation"
                type="text"
                placeholder="e.g., Marketing Manager, Senior Developer, CEO"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="box-border flex items-center px-4 py-[12px] w-full h-[48px] bg-[rgba(6,6,6,0.02)] border border-[#D5D5D5] rounded-xl font-['SF_Pro'] font-medium text-[16px] leading-[20px] text-[#333333] placeholder:text-[#98989A] focus:outline-none focus:ring-2 focus:ring-[#34A853] focus:border-transparent"
              />
            </div>

            {/* Website URL */}
            <div className="flex flex-col items-start gap-[14px] w-full">
              <label 
                htmlFor="websiteUrl" 
                className="font-['SF_Pro'] font-medium text-[16px] leading-[20px] text-[#333333]"
              >
                Website URL (Optional)
              </label>
              <input
                id="websiteUrl"
                type="url"
                placeholder="https://yourcompany.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="box-border flex items-center px-4 py-[12px] w-full h-[48px] bg-[rgba(6,6,6,0.02)] border border-[#D5D5D5] rounded-xl font-['SF_Pro'] font-medium text-[16px] leading-[20px] text-[#333333] placeholder:text-[#98989A] focus:outline-none focus:ring-2 focus:ring-[#34A853] focus:border-transparent"
              />
            </div>

            {/* LinkedIn URL */}
            <div className="flex flex-col items-start gap-[14px] w-full">
              <label 
                htmlFor="linkedinUrl" 
                className="font-['SF_Pro'] font-medium text-[16px] leading-[20px] text-[#333333]"
              >
                Connect your linkedin
              </label>
              <input
                id="linkedinUrl"
                type="url"
                placeholder="https://www.linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="box-border flex items-center px-4 py-[12px] w-full h-[48px] bg-[rgba(6,6,6,0.02)] border border-[#D5D5D5] rounded-xl font-['SF_Pro'] font-medium text-[16px] leading-[20px] text-[#333333] placeholder:text-[#98989A] focus:outline-none focus:ring-2 focus:ring-[#34A853] focus:border-transparent"
              />
              <p className="font-['SF_Pro'] font-normal text-[13px] leading-[115%] tracking-[-0.03em] text-center text-[#666666] w-full">
                Securely connect your account to post effortlessly
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleNext}
            disabled={isProcessing}
            className="flex items-center justify-center px-[30px] py-3 gap-2.5 w-full h-[48px] bg-[#34A853] shadow-[0px_0px_3px_rgba(0,0,0,0.084),0px_2px_3px_rgba(0,0,0,0.168)] rounded-xl font-['Roboto'] font-normal text-[18px] leading-[100%] tracking-[0.01em] text-white hover:bg-[#2d9148] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Next step'
            )}
          </button>
        </div>

        {/* Footer with Steps - Only show on Step 1 */}
        <div className="fixed bottom-0 left-0 right-0 flex items-center justify-center py-6 bg-white/95 backdrop-blur-sm border-t border-gray-200">
          <div className="flex flex-col items-center gap-4 w-full max-w-[600px] px-4">
            {/* Steps Indicator */}
            <div className="flex items-center gap-0 w-full">
              {/* Step 1 - Active */}
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className="flex items-center w-full">
                  <div className="flex-1 h-[4px] bg-transparent opacity-0" />
                  <div className="flex items-center justify-center w-10 h-10 bg-[#34A853] rounded-full p-1">
                    <div className="flex items-center justify-center w-7 h-7 bg-[#34A853] border-[3px] border-white rounded-full">
                      <span className="font-['Roboto'] text-sm text-white">1</span>
                    </div>
                  </div>
                  <div className="flex-1 h-[4px] bg-[#34A853]" />
                </div>
                <span className="font-['Roboto'] font-medium text-sm text-[#333333]">
                  Linkedin Profile
                </span>
              </div>

              {/* Step 2 - Pending */}
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className="flex items-center w-full">
                  <div className="flex-1 h-[4px] bg-[#DCDCDC]" />
                  <div className="flex items-center justify-center w-7 h-7 bg-[#DCDCDC] rounded-full">
                    <span className="font-['Roboto'] text-sm text-[#333333]">2</span>
                  </div>
                  <div className="flex-1 h-[4px] bg-[#DCDCDC]" />
                </div>
                <span className="font-['Roboto'] font-normal text-sm text-[#444444]">
                  Voice Setup
                </span>
              </div>

              {/* Step 3 - Pending */}
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className="flex items-center w-full">
                  <div className="flex-1 h-[4px] bg-[#DCDCDC]" />
                  <div className="flex items-center justify-center w-7 h-7 bg-[#DCDCDC] rounded-full">
                    <span className="font-['Roboto'] text-sm text-[#333333]">3</span>
                  </div>
                  <div className="flex-1 h-[4px] bg-[#DCDCDC]" />
                </div>
                <span className="font-['Roboto'] font-normal text-sm text-[#444444]">
                  Target Audience
                </span>
              </div>

              {/* Step 4 - Pending */}
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className="flex items-center w-full">
                  <div className="flex-1 h-[4px] bg-[#DCDCDC]" />
                  <div className="flex items-center justify-center w-7 h-7 bg-[#DCDCDC] rounded-full">
                    <span className="font-['Roboto'] text-sm text-[#444444]">4</span>
                  </div>
                  <div className="flex-1 h-[4px] bg-[#DCDCDC] opacity-0" />
                </div>
                <span className="font-['Roboto'] font-normal text-sm text-[#444444]">
                  Review & Submit
                </span>
              </div>
            </div>

            {/* Footer Text */}
            <p className="font-['Inter'] font-normal text-sm leading-[160%] tracking-[-0.04em] text-[#616161]">
              You're just 3 steps away!
            </p>

          
          </div>
        </div>
      </>
    )
  }

  // Step 2: Voice Setup - Custom Figma Design (No Card wrapper)
  if (currentStep === 2) {
    return (
      <>
        {/* Main Content - Two Column Layout */}
        <div className="flex flex-row items-center gap-[140px] w-full max-w-[1061px] mx-auto pt-20 pb-[280px] origin-top">
          {/* Left Column - Text Content */}
          <div className="flex flex-col items-start gap-6 w-[354px]">
              {/* Logo */}
          <div className="flex items-center gap-2 px-1.5 py-1.5 rounded-lg">
            <div className="w-6 h-6 rounded-[4.8px] overflow-hidden relative">
              <Image
                src="/assests/meetghostwriter.png"
                alt="Ghostwriter AI"
                width={24}
                height={24}
                className="object-contain rounded"
              />
            </div>
            <span className="font-['Caladea'] text-2xl leading-[28px] tracking-[0.04em] text-[#333333]">
              Ghostwriter AI
            </span>
          </div>

            {/* Microphone Illustration */}
            <div className="relative w-28 h-28">
              <img 
                src="/assests/illu..png" 
                alt="Microphone illustration"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Intro Text */}
            <div className="flex flex-col items-start gap-3 w-[354px]">
              <h2 className="font-['SF_Pro_Rounded'] font-medium text-[32px] leading-[38px] tracking-[0.01em] text-[#0C1421] w-full">
                Configure Your Writing Voice
              </h2>
              <p className="font-['Inter'] font-medium text-[14px] leading-[160%] tracking-[-0.04em] text-[#313957] w-full">
                Pick a source to personalize AI to write exactly the way you want (structure, tone, etc.)
              </p>
            </div>
          </div>

          {/* Right Column - Cards */}
          <div className="flex flex-col items-start gap-6 w-[474px]">
            {/* Card 1 - Use My Writing Style */}
            <button
              onClick={() => setVoiceSource("my_style")}
              className={`
                box-border flex flex-col items-start p-5 gap-2.5 w-[474px] rounded-[18px] transition-all
                ${voiceSource === "my_style" 
                  ? 'bg-[rgba(6,6,6,0.02)] border-2 border-[#34A853]' 
                  : 'bg-[rgba(6,6,6,0.02)] border border-[#D5D5D5]'
                }
              `}
            >
              {/* Icon + Title */}
              <div className="flex flex-row items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.8667 8C16.8667 9.47276 15.6728 10.6667 14.2 10.6667C12.7272 10.6667 11.5333 9.47276 11.5333 8C11.5333 6.52724 12.7272 5.33333 14.2 5.33333C15.6728 5.33333 16.8667 6.52724 16.8667 8Z" stroke="#34A853" strokeWidth="2"/>
                  <path d="M23.3333 11.3333C23.3333 13.1743 21.8409 14.6667 20 14.6667C18.159 14.6667 16.6667 13.1743 16.6667 11.3333C16.6667 9.49238 18.159 8 20 8C21.8409 8 23.3333 9.49238 23.3333 11.3333Z" stroke="#34A853" strokeWidth="2"/>
                  <path d="M8 18.6667C5.05448 18.6667 2.66667 21.0545 2.66667 24V25.3333C2.66667 26.0697 3.26362 26.6667 4 26.6667H10.6667C11.403 26.6667 12 26.0697 12 25.3333V24C12 21.0545 9.61219 18.6667 6.66667 18.6667H8Z" stroke="#34A853" strokeWidth="2"/>
                  <path d="M20 17.3333C16.3181 17.3333 13.3333 20.3181 13.3333 24V25.3333C13.3333 26.0697 13.9303 26.6667 14.6667 26.6667H25.3333C26.0697 26.6667 26.6667 26.0697 26.6667 25.3333V24C26.6667 20.3181 23.6819 17.3333 20 17.3333Z" stroke="#34A853" strokeWidth="2"/>
                </svg>
                <span className="font-['Inter'] font-medium text-[18px] leading-[160%] tracking-[-0.04em] text-black">
                  Use My Writing Style
                </span>
              </div>
              
              {/* Description */}
              <p className="font-['Inter'] font-medium text-[14px] leading-[160%] tracking-[-0.04em] text-[#313957] w-[414px] text-left">
                Analyze your Linkedin posts to learn your authentic voice and tone.
              </p>
            </button>

            {/* Card 2 - Learn from an Influencer */}
            <button
              onClick={() => {
                setVoiceSource("influencer")
                setShowInfluencerModal(true)
              }}
              className={`
                box-border flex flex-col items-start p-5 gap-2.5 w-[474px] rounded-[18px] transition-all
                ${voiceSource === "influencer" 
                  ? 'bg-[rgba(6,6,6,0.02)] border-2 border-[#34A853]' 
                  : 'bg-[rgba(6,6,6,0.02)] border border-[#D5D5D5]'
                }
              `}
            >
              {/* Icon + Title */}
              <div className="flex flex-row items-center gap-2">
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 28L8.5 16L4 4L16 8.5L28 4L23.5 16L28 28L16 23.5L4 28Z" fill="#34A853"/>
                </svg>
                <span className="font-['Inter'] font-medium text-[18px] leading-[160%] tracking-[-0.04em] text-black">
                  Learn from an Influencer
                </span>
              </div>
              
              {/* Description */}
              <p className="font-['Inter'] font-medium text-[14px] leading-[160%] tracking-[-0.04em] text-[#313957] w-[414px] text-left">
                Mimic the writing style of a successful content creator or thought leader.
              </p>
            </button>

            {/* Info Message */}
            <div className="flex flex-row items-start gap-2 w-[474px]">
              <span className="text-[22px] leading-[22px]">💡</span>
              <p className="font-['Inter'] font-normal text-[13px] leading-[160%] tracking-[-0.04em] text-[#313957] flex-1">
                You can always change your voice style later in your configuration settings. For now, we will scrape the last 5 posts from your source with the most engagement.
              </p>
            </div>
          </div>
        </div>

        {/* Influencer URL Input (conditionally shown as overlay/modal style) */}
        {showInfluencerModal && voiceSource === "influencer" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Enter Influencer Profile</h3>
              <Label htmlFor="influencerUrl" className="mb-2 block">Influencer LinkedIn Profile URL</Label>
              <Input
                id="influencerUrl"
                placeholder="https://linkedin.com/in/influencer-name"
                value={influencerUrl}
                onChange={(e) => setInfluencerUrl(e.target.value)}
                className="w-full mb-4"
              />
              <div className="flex gap-2">
                <Button onClick={() => {
                  setVoiceSource(null)
                  setInfluencerUrl("")
                  setShowInfluencerModal(false)
                }} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (influencerUrl.trim()) {
                      setError(null)
                      setShowInfluencerModal(false)
                    } else {
                      setError("Please enter a valid influencer URL")
                    }
                  }} 
                  type="button"
                  className="flex-1"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Footer with Steps */}
        <div className="fixed bottom-0 left-0 right-0 flex flex-row justify-between items-center px-4 py-6 bg-white/95 backdrop-blur-sm border-t border-gray-200">
          {/* Go Back Button */}
          <button
            onClick={handlePrevious}
            className="box-border flex flex-row justify-center items-center px-[26px] py-[13px] gap-[13px] w-[140px] h-[48px] bg-white border border-[rgba(0,0,0,0.4)] rounded-[10px] hover:bg-gray-50 transition-colors"
          >
            <span className="font-['Roboto'] font-medium text-[18px] leading-[21px] text-[rgba(0,0,0,0.54)]">
              Go back
            </span>
          </button>

          {/* Steps Indicator */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-row items-center gap-0 w-[600px]">
              {/* Step 1 - Completed */}
              <div className="flex flex-col items-center gap-1.5 w-[150px]">
                <div className="flex flex-row items-center w-full">
                  <div className="flex-1 h-[4px] bg-[#DCDCDC] opacity-0" />
                  <div className="flex flex-col items-start p-1.5 w-7 h-7 bg-[#34A853] border-[3px] border-white rounded-full">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3333 4L6 11.3333L2.66666 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1 h-[4px] bg-[#34A853]" />
                </div>
                <span className="font-['Roboto'] font-medium text-[14px] text-[#333333]">
                  Linkedin Profile
                </span>
              </div>

              {/* Step 2 - Active */}
              <div className="flex flex-col items-center gap-1.5 w-[150px]">
                <div className="flex flex-row items-center w-full">
                  <div className="flex-1 h-[4px] bg-[#34A853]" />
                  <div className="flex items-center justify-center p-1 w-10 h-10 bg-[#34A853] rounded-full">
                    <div className="flex items-center justify-center w-7 h-7 bg-[#34A853] border-[3px] border-white rounded-full">
                      <span className="font-['Roboto'] text-[14px] text-white">2</span>
                    </div>
                  </div>
                  <div className="flex-1 h-[4px] bg-[#34A853]" />
                </div>
                <span className="font-['Roboto'] font-normal text-[14px] text-[#444444]">
                  Voice Setup
                </span>
              </div>

              {/* Step 3 - Pending */}
              <div className="flex flex-col items-center gap-1.5 w-[150px]">
                <div className="flex flex-row items-center w-full">
                  <div className="flex-1 h-[4px] bg-[#DCDCDC]" />
                  <div className="flex flex-col items-start p-1.5 w-7 h-7 bg-[#DCDCDC] rounded-full">
                    <span className="font-['Roboto'] text-[14px] text-[#444444]">3</span>
                  </div>
                  <div className="flex-1 h-[4px] bg-[#DCDCDC]" />
                </div>
                <span className="font-['Roboto'] font-normal text-[14px] text-[#444444]">
                  Target Audience
                </span>
              </div>

              {/* Step 4 - Pending */}
              <div className="flex flex-col items-center gap-1.5 w-[150px]">
                <div className="flex flex-row items-center w-full">
                  <div className="flex-1 h-[4px] bg-[#DCDCDC]" />
                  <div className="flex flex-col items-start p-1.5 w-7 h-7 bg-[#DCDCDC] rounded-full">
                    <span className="font-['Roboto'] text-[14px] text-[#444444]">4</span>
                  </div>
                  <div className="flex-1 h-[4px] bg-[#DCDCDC] opacity-0" />
                </div>
                <span className="font-['Roboto'] font-normal text-[14px] text-[#444444]">
                  Review & Submit
                </span>
              </div>
            </div>

            {/* Footer Text */}
            <p className="font-['Inter'] font-normal text-[13px] leading-[160%] tracking-[-0.04em] text-[#616161]">
              You're just 2 steps away!
            </p>
          </div>

          {/* Next Step Button */}
          <button
            onClick={handleNext}
            disabled={isProcessing || !voiceSource}
            className="flex flex-row items-center justify-center px-[26px] py-[14px] gap-2 w-[140px] h-[48px] bg-[#34A853] shadow-[0px_0px_3px_rgba(0,0,0,0.084),0px_2px_3px_rgba(0,0,0,0.168)] rounded-xl font-['Roboto'] font-normal text-[18px] text-white hover:bg-[#2d9148] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Next Step'
            )}
          </button>
        </div>
      </>
    )
  }

  // Step 3: Target Audience - Custom Figma Design (No Card wrapper)
  if (currentStep === 3) {
    return (
      <>
        {/* Main Content - Two Column Layout */}
        <div className="flex flex-row items-center gap-[140px] w-full max-w-[1100px] mx-auto pt-20 pb-[280px] origin-top">
          {/* Left Column - Text Content */}
          <div className="flex flex-col items-start gap-6 w-[354px]">
             {/* Logo */}
          <div className="flex items-center gap-2 px-1.5 py-1.5 rounded-lg">
            <div className="w-6 h-6 rounded-[4.8px] overflow-hidden relative">
              <Image
                src="/assests/meetghostwriter.png"
                alt="Ghostwriter AI"
                width={24}
                height={24}
                className="object-contain rounded"
              />
            </div>
            <span className="font-['Caladea'] text-2xl leading-[28px] tracking-[0.04em] text-[#333333]">
              Ghostwriter AI
            </span>
          </div>

            {/* Illustration */}
            <div className="relative w-28 h-28">
              <img 
                src="/assests/step3illu.png" 
                alt="Target Audience illustration"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Intro Text */}
            <div className="flex flex-col items-start gap-3 w-[354px]">
              <h2 className="font-['SF_Pro_Rounded'] font-medium text-[32px] leading-[38px] tracking-[0.01em] text-[#0C1421] w-full">
                Define Your Target Audience
              </h2>
              <p className="font-['Inter'] font-medium text-[14px] leading-[160%] tracking-[-0.04em] text-[#313957] w-full">
                Help us understand who you're creating content for so we can tailor the content for your ICP.
              </p>
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="flex flex-col items-center gap-8 w-[570px]">
            {/* Target Audience Input */}
            <div className="flex flex-col items-start gap-2.5 w-full">
              <label 
                htmlFor="targetAudience" 
                className="font-['Inter'] font-medium text-[18px] leading-[160%] tracking-[-0.04em] text-black w-full"
              >
                Target Audience*
              </label>
              <p className="font-['Inter'] font-medium text-[13px] leading-[160%] tracking-[-0.04em] text-[#313957] w-full">
                Describe who you want to reach with your content (minimum 10 characters)
              </p>
              <textarea
                id="targetAudience"
                placeholder="e.g., Tech startup founders who are scaling their businesses and need to build thought leadership on LinkedIn"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                rows={2}
                className="box-border flex flex-row items-center px-4 py-[13px] w-full h-[56px] bg-[rgba(6,6,6,0.02)] border border-[#D5D5D5] rounded-xl font-['Inter'] font-medium text-[13px] leading-[16px] text-[#333333] placeholder:text-[#98989A] focus:outline-none focus:ring-2 focus:ring-[#34A853] focus:border-transparent resize-none"
              />
            </div>

            {/* Common Challenges Input */}
            <div className="flex flex-col items-start gap-2.5 w-full">
              <label 
                htmlFor="commonChallenges" 
                className="font-['Inter'] font-medium text-[18px] leading-[160%] tracking-[-0.04em] text-black w-full"
              >
                Common Challenges (Optional)
              </label>
              <p className="font-['Inter'] font-medium text-[13px] leading-[160%] tracking-[-0.04em] text-[#313957] w-full">
                What problems or pain points does your audience face?
              </p>
              <textarea
                id="commonChallenges"
                placeholder="e.g., Struggling to find time for content creation, difficulty standing out in a crowded market, need help building credibility and trust with potential customers"
                value={commonChallenges}
                onChange={(e) => setCommonChallenges(e.target.value)}
                rows={3}
                className="box-border flex flex-row items-center px-4 py-[13px] w-full h-[72px] bg-[rgba(6,6,6,0.02)] border border-[#D5D5D5] rounded-xl font-['Inter'] font-medium text-[13px] leading-[16px] text-[#333333] placeholder:text-[#98989A] focus:outline-none focus:ring-2 focus:ring-[#34A853] focus:border-transparent resize-none"
              />
            </div>

            {/* Info Message */}
            <div className="flex flex-row items-start gap-2 w-full">
              <span className="text-[22px] leading-[22px]">💡</span>
              <p className="font-['Inter'] font-normal text-[13px] leading-[160%] tracking-[-0.04em] text-[#313957] flex-1">
                Be specific! "Marketing professionals" vs "B2B SaaS marketing managers" will generate very different content. You can always change this later.
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Steps */}
        <div className="fixed bottom-0 left-0 right-0 flex flex-row justify-between items-center px-4 py-6 bg-white/95 backdrop-blur-sm border-t border-gray-200">
          {/* Go Back Button */}
          <button
            onClick={handlePrevious}
            className="box-border flex flex-row justify-center items-center px-[26px] py-[13px] gap-[13px] w-[140px] h-[48px] bg-white border border-[rgba(0,0,0,0.4)] rounded-[10px] hover:bg-gray-50 transition-colors"
          >
            <span className="font-['Roboto'] font-medium text-[18px] leading-[21px] text-[rgba(0,0,0,0.54)]">
              Go back
            </span>
          </button>

          {/* Steps Indicator */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-row items-center gap-0 w-[600px]">
              {/* Step 1 - Completed */}
              <div className="flex flex-col items-center gap-1.5 w-[150px]">
                <div className="flex flex-row items-center w-full">
                  <div className="flex-1 h-[4px] bg-[#DCDCDC] opacity-0" />
                  <div className="flex flex-col items-start p-1.5 w-7 h-7 bg-[#34A853] border-[3px] border-white rounded-full">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3333 4L6 11.3333L2.66666 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1 h-[4px] bg-[#34A853]" />
                </div>
                <span className="font-['Roboto'] font-medium text-[14px] text-[#333333]">
                  Linkedin Profile
                </span>
              </div>

              {/* Step 2 - Completed */}
              <div className="flex flex-col items-center gap-1.5 w-[150px]">
                <div className="flex flex-row items-center w-full">
                  <div className="flex-1 h-[4px] bg-[#34A853]" />
                  <div className="flex flex-col items-start p-1.5 w-7 h-7 bg-[#34A853] rounded-full">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3333 4L6 11.3333L2.66666 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1 h-[4px] bg-[#34A853]" />
                </div>
                <span className="font-['Roboto'] font-normal text-[14px] text-[#444444]">
                  Voice Setup
                </span>
              </div>

              {/* Step 3 - Active */}
              <div className="flex flex-col items-center gap-1.5 w-[150px]">
                <div className="flex flex-row items-center w-full">
                  <div className="flex-1 h-[4px] bg-[#34A853]" />
                  <div className="flex items-center justify-center p-1 w-10 h-10 bg-[#34A853] rounded-full">
                    <div className="flex items-center justify-center w-7 h-7 bg-[#34A853] border-[3px] border-white rounded-full">
                      <span className="font-['Roboto'] text-[14px] text-white">3</span>
                    </div>
                  </div>
                  <div className="flex-1 h-[4px] bg-[#34A853]" />
                </div>
                <span className="font-['Roboto'] font-normal text-[14px] text-[#444444]">
                  Target Audience
                </span>
              </div>

              {/* Step 4 - Pending */}
              <div className="flex flex-col items-center gap-1.5 w-[150px]">
                <div className="flex flex-row items-center w-full">
                  <div className="flex-1 h-[4px] bg-[#DCDCDC]" />
                  <div className="flex flex-col items-start p-1.5 w-7 h-7 bg-[#DCDCDC] rounded-full">
                    <span className="font-['Roboto'] text-[14px] text-[#444444]">4</span>
                  </div>
                  <div className="flex-1 h-[4px] bg-[#DCDCDC] opacity-0" />
                </div>
                <span className="font-['Roboto'] font-normal text-[14px] text-[#444444]">
                  Review & Submit
                </span>
              </div>
            </div>

            {/* Footer Text */}
            <p className="font-['Inter'] font-normal text-[13px] leading-[160%] tracking-[-0.04em] text-[#616161]">
              You're just 1 step away!
            </p>
          </div>

          {/* Next Step Button */}
          <button
            onClick={handleNext}
            disabled={isProcessing || !targetAudience || targetAudience.length < 10}
            className="flex flex-row items-center justify-center px-[26px] py-[14px] gap-2 w-[140px] h-[48px] bg-[#34A853] shadow-[0px_0px_3px_rgba(0,0,0,0.084),0px_2px_3px_rgba(0,0,0,0.168)] rounded-xl font-['Roboto'] font-normal text-[18px] text-white hover:bg-[#2d9148] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Next Step'
            )}
          </button>
        </div>
      </>
    )
  }

  // Step 4: Processing Step (Custom Figma Design)
  if (currentStep === 4) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white scale-[0.85] origin-top">
        <div className="flex flex-col items-center justify-center gap-[40px] w-[800px] pb-[200px]">
          {/* Logo and Title Section */}
          <div className="flex flex-row items-center justify-center gap-[10px] px-[6px] py-[6px] pr-[12px] rounded-[8px]">
            <Image
              src="/assests/meetghostwriter.png"
              alt="Ghostwriter AI"
              width={24}
              height={24}
              className="rounded-[4.8px]"
            />
            <span
              className="text-[24px] leading-[28px] text-center tracking-[0.04em] text-[#333333]"
              style={{ fontFamily: 'Caladea, serif' }}
            >
              Ghostwriter AI
            </span>
          </div>

          {/* Loader Animation */}
          <div className="relative w-[128px] h-[128px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-[96px] h-[96px] animate-spin" viewBox="0 0 96 96" style={{ animationDuration: '1.5s' }}>
                {/* Four rotating dots */}
                <circle cx="48" cy="8" r="6" fill="#34A853" />
                <circle cx="88" cy="48" r="6" fill="#34A853" opacity="0.7" />
                <circle cx="48" cy="88" r="6" fill="#34A853" opacity="0.4" />
                <circle cx="8" cy="48" r="6" fill="#34A853" opacity="0.2" />
              </svg>
            </div>
          </div>

          {/* Intro Section */}
          <div className="flex flex-col items-center justify-center gap-[16px] w-[800px]">
            <h1
              className="w-full text-[36px] leading-[43px] text-center tracking-[0.01em] text-[#0C1421] font-medium"
              style={{ fontFamily: 'SF Pro Rounded, system-ui, sans-serif' }}
            >
              Configuring the AI to write for you
            </h1>
            <p
              className="w-full text-[16px] leading-[160%] text-center tracking-[-0.04em] text-[#313957] font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Please wait while we analyze your data to teach AI your unique writing style...
            </p>
          </div>

          {/* Processing Steps with Overflow Container */}
          <div className="relative w-[800px] h-[174px] overflow-hidden">
            {/* Fade Gradients */}
            <div className="absolute top-0 left-0 w-full h-[48px] bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-[48px] bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

            {/* Scrollable Content */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 flex flex-col items-center gap-[20px] py-[40px]">
              <ProcessingStepCard
                title="Scraping your LinkedIn profile"
                description="Analyzing your background, expertise, education, and professional preferences"
                status={processingSteps.scrapingProfile}
                width="592px"
              />
              <ProcessingStepCard
                title="Creating context for AI to use"
                description="Building a knowledge base from your background, expertise, and experiences to personalize your content"
                status={processingSteps.creatingContext}
                width="685px"
              />
              <ProcessingStepCard
                title="Scraping LinkedIn posts"
                description="Learning from your / influencers posts to understand the styles, structure, formatting you want"
                status={processingSteps.scrapingPosts}
                width="685px"
              />
              <ProcessingStepCard
                title="Creating your voice profile"
                description="Building a detailed guide for the AI to write authentically in your unique style and tone"
                status={processingSteps.creatingVoice}
                width="626px"
              />
            </div>
          </div>

          {/* Footer Section */}
          <div className="absolute bottom-[40px] left-0 right-0 flex flex-row items-center justify-between px-[80px] gap-[160px]">
            {/* Go Back Button (Hidden) */}
            <button
              className="flex items-center justify-center px-[30px] py-[15px] gap-[15px] w-[150px] h-[53px] bg-white border border-[rgba(0,0,0,0.4)] rounded-[10px] opacity-0 pointer-events-none"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              <span className="text-[20px] leading-[23px] text-[rgba(0,0,0,0.54)] font-medium">
                Go back
              </span>
            </button>

            {/* Step Indicators */}
            <div className="flex flex-col items-center gap-[20px] w-[600px]">
              <div className="flex flex-row items-center w-full h-[75px]">
                {/* Step 1 - Completed */}
                <div className="flex flex-col items-center gap-[8px] w-[150px]">
                  <div className="flex flex-row items-center w-full h-[48px]">
                    <div className="flex-1 h-[5px] bg-[#DCDCDC] opacity-0" />
                    <div className="flex items-center justify-center w-[32px] h-[32px] bg-[#34A853] border-4 border-white rounded-full">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8L6 12L14 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex-1 h-[5px] bg-[#34A853]" />
                  </div>
                  <span className="text-[16px] leading-[19px] text-center text-[#333333] font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    LinkedIn Profile
                  </span>
                </div>

                {/* Step 2 - Completed */}
                <div className="flex flex-col items-center gap-[8px] w-[150px]">
                  <div className="flex flex-row items-center w-full h-[48px]">
                    <div className="flex-1 h-[5px] bg-[#34A853]" />
                    <div className="flex items-center justify-center w-[32px] h-[32px] bg-[#34A853] rounded-full">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8L6 12L14 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex-1 h-[5px] bg-[#34A853]" />
                  </div>
                  <span className="text-[16px] leading-[19px] text-center text-[#444444]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Voice Setup
                  </span>
                </div>

                {/* Step 3 - Completed */}
                <div className="flex flex-col items-center gap-[8px] w-[150px]">
                  <div className="flex flex-row items-center w-full h-[48px]">
                    <div className="flex-1 h-[5px] bg-[#34A853]" />
                    <div className="flex items-center justify-center w-[32px] h-[32px] bg-[#34A853] rounded-full">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8L6 12L14 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex-1 h-[5px] bg-[#34A853]" />
                  </div>
                  <span className="text-[16px] leading-[19px] text-center text-[#444444]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Target Audience
                  </span>
                </div>

                {/* Step 4 - Active */}
                <div className="flex flex-col items-center gap-[8px] w-[150px]">
                  <div className="flex flex-row items-center w-full h-[48px]">
                    <div className="flex-1 h-[5px] bg-[#34A853]" />
                    <div className="flex items-center justify-center w-[44px] h-[44px] bg-[#34A853] rounded-full">
                      <div className="flex items-center justify-center w-[32px] h-[32px] bg-[#34A853] border-4 border-white rounded-full">
                        <span className="text-[16px] leading-[16px] text-white font-normal" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          4
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 h-[5px] bg-[#34A853] opacity-0" />
                  </div>
                  <span className="text-[16px] leading-[19px] text-center text-[#444444]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Review & Submit
                  </span>
                </div>
              </div>

              {/* Almost there text */}
              <span className="text-[16px] leading-[160%] tracking-[-0.04em] text-[#616161]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Almost there!
              </span>
            </div>

            {/* Next Button (Hidden) */}
            <button
              className="flex items-center justify-center px-[30px] py-[16px] gap-[10px] w-[150px] h-[52px] bg-[#34A853] rounded-[12px] shadow-md opacity-0 pointer-events-none"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              <span className="text-[20px] leading-[100%] text-center tracking-[0.01em] text-white">
                Next Step
              </span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Fallback: Should never reach here
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl">Set Up to Write for You</CardTitle>
        <CardDescription>
          Complete these steps to personalize your content and tailor it exactly the way you want.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* This Card is now only a fallback and should never render */}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Invalid step. Please refresh the page.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

function ProcessingStep({ 
  title, 
  description, 
  status 
}: { 
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
}) {
  return (
    <div className={`
      flex items-start gap-3 p-4 rounded-lg border-2 transition-all
      ${status === 'completed' ? 'bg-green-50 border-green-200' : ''}
      ${status === 'in-progress' ? 'bg-primary/5 border-primary' : ''}
      ${status === 'pending' ? 'bg-muted border-muted-foreground/10' : ''}
    `}>
      <div className={`
        flex items-center justify-center w-6 h-6 rounded-full mt-0.5
        ${status === 'completed' ? 'bg-green-500' : ''}
        ${status === 'in-progress' ? 'bg-primary' : ''}
        ${status === 'pending' ? 'bg-muted-foreground/20' : ''}
      `}>
        {status === 'completed' && <Check className="h-4 w-4 text-white" />}
        {status === 'in-progress' && <Loader2 className="h-4 w-4 text-white animate-spin" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-sm">{title}</h4>
          <Badge 
            variant={status === 'completed' ? 'default' : 'secondary'}
            className={`text-xs ${status === 'completed' ? 'bg-green-500' : status === 'in-progress' ? 'bg-primary' : ''}`}
          >
            {status === 'completed' ? 'Completed' : status === 'in-progress' ? 'In Progress' : 'Pending'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function ProcessingStepCard({ 
  title, 
  description, 
  status,
  width
}: { 
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  width: string
}) {
  return (
    <div 
      className="flex items-center justify-center px-[20px] py-[20px] gap-[16px] bg-white rounded-[18px]"
      style={{ width, minHeight: '94px' }}
    >
      {/* Loader Icon */}
      <div className="relative w-[48px] h-[48px] flex-shrink-0">
        {status === 'in-progress' && (
          <div className="absolute inset-0">
            <svg className="w-full h-full animate-spin" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="#34A853"
                strokeWidth="3"
                strokeDasharray="31.4 31.4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
        {status === 'completed' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[48px] h-[48px] rounded-full bg-[#34A853] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 12L10 18L20 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}
        {status === 'pending' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[48px] h-[48px] rounded-full border-3 border-gray-300" />
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="flex flex-col items-start justify-center flex-1 gap-[2px]">
        <h4 
          className="text-[20px] leading-[160%] tracking-[-0.04em] text-black font-semibold"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {title}
        </h4>
        <p 
          className="text-[14px] leading-[160%] tracking-[-0.04em] text-black font-medium"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {description}
        </p>
      </div>
    </div>
  )
}
