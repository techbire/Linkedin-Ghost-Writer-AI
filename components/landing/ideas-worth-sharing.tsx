import Image from "next/image"

export function IdeasWorthSharing() {
  return (
    <section className="relative isolate w-full flex justify-center px-8 sm:px-12 md:px-16 lg:px-20 pt-40 sm:pt-48 md:pt-56 lg:pt-64 pb-32 sm:pb-40 md:pb-48 lg:pb-56 bg-white" id="ideas">
      {/* Left decorative image (pencil stroke) */}
      <div className="absolute left-2 sm:left-4 md:left-6 -top-4 md:-top-6 rotate-[-7deg] z-[3]">
        <Image
          src="/assests/penical%20stroke.png"
          alt="pencil stroke"
          width={163}
          height={229}
          className="w-[80px] h-[112px] sm:w-[100px] sm:h-[140px] md:w-[130px] md:h-[182px] lg:w-[163px] lg:h-[229px] drop-shadow-[0px_1px_0.4px_rgba(0,0,0,0.03),0px_2px_0.8px_rgba(0,0,0,0.04),0px_3px_1.6px_rgba(0,0,0,0.043),0px_5px_2.9px_rgba(0,0,0,0.047),0px_9px_5.3px_rgba(0,0,0,0.047),0px_15px_10.4px_rgba(0,0,0,0.05),0px_31px_22.8px_rgba(0,0,0,0.055)]"
        />
      </div>

      {/* Right decorative image (black book and pen) */}
      <div className="absolute right-2 sm:right-4 md:right-6 -bottom-8 sm:-bottom-6 md:-bottom-22 lg:bottom-4 rotate-[12deg] z-[2]">
        <Image
          src="/assests/black%20book%20and%20pen.png"
          alt="black book and pen"
          width={163}
          height={229}
          className="w-[80px] h-[112px] sm:w-[100px] sm:h-[140px] md:w-[130px] md:h-[182px] lg:w-[163px] lg:h-[229px] drop-shadow-[0px_1px_0.4px_rgba(0,0,0,0.03),0px_2px_0.8px_rgba(0,0,0,0.04),0px_3px_1.6px_rgba(0,0,0,0.043),0px_5px_2.9px_rgba(0,0,0,0.047),0px_9px_5.3px_rgba(0,0,0,0.047),0px_15px_10.4px_rgba(0,0,0,0.05),0px_31px_22.8px_rgba(0,0,0,0.055)]"
        />
      </div>

      {/* Content */}
      <div className="w-full max-w-[1110px] flex flex-col items-center gap-10 text-center px-4 sm:px-6 md:px-8">
        <h2
          className="text-[#333] font-semibold text-[28px] leading-[38px] sm:text-[36px] sm:leading-[48px] lg:text-[52px] lg:leading-[70px]"
          style={{fontFamily:'Inter, sans-serif'}}
        >
          You have ideas worth sharing. Let’s make sure people actually see them.
        </h2>
        <p
          className="max-w-[916px] text-[#616161] text-[18px] leading-[28px] sm:text-[20px] sm:leading-[32px]"
          style={{fontFamily:'Caladea, serif'}}
        >
          You’ve done the hard part — building knowledge, experience, and perspective. GhostWriter AI helps you express it powerfully, consistently, and in your authentic voice.
        </p>
      </div>
    </section>
  )
}
