import { SignupForm } from "@/components/auth/signup-form"
import Image from "next/image"

export default function SignupPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white flex items-center justify-center">
      {/* Background Decorative Ovals - Same as login */}
      <div 
        className="absolute w-[867px] h-[1335px] rounded-full opacity-5"
        style={{
          left: '-38.61%',
          top: '54.3%',
          background: 'rgba(52, 168, 83, 0.05)',
          transform: 'translateY(-50%)'
        }}
      />
      <div 
        className="absolute w-[1040px] h-[1284px] rounded-full opacity-[0.054]"
        style={{
          left: '29.1%',
          top: '-63.57%',
          background: 'rgba(52, 168, 83, 0.05)',
          mixBlendMode: 'normal',
          transform: 'rotate(100deg)'
        }}
      />
      <div 
        className="absolute w-[867px] h-[757px] rounded-full opacity-60"
        style={{
          left: '-38.61%',
          top: '-30.86%',
          background: 'rgba(52, 168, 83, 0.05)',
          mixBlendMode: 'normal',
          transform: 'rotate(160deg)'
        }}
      />
      <div 
        className="absolute w-[1168px] h-[799px] rounded-full opacity-100"
        style={{
          left: '29.1%',
          top: '32.91%',
          background: 'rgba(52, 168, 83, 0.05)',
          transform: 'rotate(-80deg)'
        }}
      />

      {/* Main Content Container - Responsive */}
      <div 
        className="relative z-10 flex flex-col lg:flex-row items-center justify-center lg:gap-[200px] gap-12 bg-white w-full max-w-[1440px] min-h-[600px] lg:h-[1024px] px-0 lg:px-8 py-8 lg:py-0"
        style={{
          opacity: 1
        }}
      >
        {/* Left Side - Branding & Text */}
        <div className="hidden lg:flex flex-col items-start gap-[30px] w-full max-w-[346px]">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-1.5 py-1.5 rounded-lg">
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

          {/* Intro Text */}
          <div className="flex flex-col items-start gap-4 w-full">
            <h1 className="font-['SF_Pro_Rounded'] font-medium text-[36px] leading-[43px] tracking-[0.01em] text-[#333333] w-full">
              Kickstart Your Content Creation
            </h1>
            <p className="font-['Inter'] font-medium text-[18px] leading-[160%] tracking-[-0.04em] text-[#616161] w-full">
              Stop staring at a blank page. Join Ghostwriter AI now and get a kickstart on powerful, professional, and unique content.
            </p>
          </div>
        </div>

        {/* Right Side - Signup Form Card */}
        <div className="w-full max-w-[650px] bg-white border-2 border-black/5 shadow-[0px_0px_19px_rgba(0,0,0,0.25)] rounded-2xl p-6 md:p-10 lg:p-[41px_40px] flex flex-col items-center gap-[26px]">
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
