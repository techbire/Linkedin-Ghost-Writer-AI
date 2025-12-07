import { LoginForm } from "@/components/auth/login-form"
import Image from "next/image"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>
}) {
  const params = await searchParams
  
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white flex items-center justify-center">
      {/* Background Decorative Ovals */}
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
        className="relative z-10 flex flex-col lg:flex-row items-center justify-center lg:gap-[200px] gap-12 bg-white w-full max-w-[1440px] min-h-[600px] lg:h-[1024px] px-5 lg:px-8 py-8 lg:py-0"
        style={{
          opacity: 1
        }}
      >
        {/* Left Side - Login Form */}
        <div className="flex flex-col justify-center items-center gap-[30px] w-full max-w-[400px]">
          <LoginForm urlError={params.error} />
        </div>

        {/* Right Side - Payment Insights Card - Hidden on mobile/tablet */}
        <div className="hidden lg:flex w-full max-w-[660px] h-auto lg:h-[902px] bg-white border-2 border-black/10 rounded-2xl p-8 lg:p-12 items-center justify-center">
          <div className="flex flex-col items-center gap-[46px] w-full max-w-[544px]">
            {/* Payment Insights Image */}
            <div className="w-full">
              <Image 
                src="/assests/PAYMENT INSIGHTS.png" 
                alt="Payment Insights Dashboard"
                width={544}
                height={482}
                className="w-full h-auto"
                priority
              />
            </div>

            {/* Description Text */}
            <p className="text-[#616161] text-[16.875px] leading-[28px] text-center font-normal">
              Smash your goals with a clear source of truth across your entire stack. Track and manage payments, reporting, everything—from one beautiful dashboard.
            </p>

            {/* Learn More Button */}
            <div className="relative w-full h-12 flex items-center justify-center">
              <button className="border border-[#616161] rounded-full px-8 py-2.5 hover:bg-gray-50 transition-colors">
                <span className="text-[#333333] font-medium text-[17.16px] leading-[28px] flex items-center gap-2">
                  Learn more
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3.4 1.8L7.6 6L3.4 10.2" stroke="#333333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
