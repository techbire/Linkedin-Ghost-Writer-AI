"use client"

import { useState } from 'react'
import { MultiStepOnboarding } from './multi-step-onboarding'
import Image from "next/image"

interface OnboardingWrapperProps {
  userEmail: string
  initialFullName: string
}

export function OnboardingWrapper({ userEmail, initialFullName }: OnboardingWrapperProps) {
  const [currentStep, setCurrentStep] = useState(1)

  return (
    <>
      {/* Left Side - Branding & Text (Only show on Step 1) */}
      {currentStep === 1 && (
        <div className="hidden lg:flex flex-col items-start gap-[40px] w-full max-w-[384px]">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-1.5 py-1.5  rounded-lg">
            <div className="w-6 h-6 rounded-[4.8px] overflow-hidden relative">
              <Image
                src="/assests/meetghostwriter.png"
                alt="Ghostwriter AI"
                width={24}
                height={24}
                className="object-contain rounded"
              />
            </div>
            <span className="font-['SF_Pro'] text-2xl leading-[28px] tracking-[0.04em]  text-[#333333]">
              Ghostwriter AI
            </span>
          </div>

          {/* SVG Illustration Placeholder */}
          <div className="w-full flex py-8">
            <div className="w-[113.63px] h-[128px] relative">
              <Image
                src="/assests/Main → Button → SVG.png"
                alt="Illustration"
                width={114}
                height={128}
                className="object-contain"
              />
            </div>
          </div>

          {/* Intro Text */}
          <div className="flex flex-col items-start gap-4 w-full">
            <h1 className="font-['SF_Pro'] font-medium text-[36px] leading-[43px] tracking-[0.01em] text-[#333333] w-full">
              Almost There! Just Four Quick Steps Left
            </h1>
            <p className="font-['SF_Pro'] font-medium text-[18px] leading-[160%] tracking-[-0.04em] text-[#616161] w-full">
              You've secured your spot! Complete the remaining steps, and you'll be writing with Ghostwriter AI in less than a minute.
            </p>
          </div>
        </div>
      )}

      {/* Right Side - Form Card */}
      <div className={currentStep === 1 ? "w-full max-w-[650px] flex flex-col items-center gap-[26px]" : "w-full flex flex-col items-center gap-[26px]"}>
        <MultiStepOnboarding 
          userEmail={userEmail} 
          initialFullName={initialFullName}
          onStepChange={setCurrentStep}
        />
      </div>
    </>
  )
}
