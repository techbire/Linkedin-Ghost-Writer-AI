import React from "react"
import Image from "next/image"

export function VideoDemo() {
  return (
    <section className="w-full bg-white flex justify-center px-4 py-20 md:py-24" id="demo">
      <div className="w-full max-w-[1200px] flex flex-col items-center gap-[60px]">
        {/* Top badge */}
        <div className="flex items-center gap-2 border border-[#616161] rounded-[8px] px-3 py-1.5">
          <Image
            src="/assests/meetghostwriter.png"
            alt="Meet Ghostwriter badge icon"
            width={24}
            height={24}
            className="w-6 h-6 object-contain rounded"
            priority
          />
          <span className="text-[#333] text-[12px] leading-5 font-normal" style={{fontFamily:'Inter, sans-serif'}}>
            Meet Ghostwriter AI
          </span>
        </div>

        {/* Video wrapper */}
        <div className="w-full max-w-[1200px] rounded-[28px] overflow-hidden bg-white">
          <div className="relative pt-[56.25%] bg-white">
            <iframe
              src="https://www.loom.com/embed/489697f76aef42e496a21f96c2b1e560"
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </div>

        {/* Bottom text */}
        <div className="flex flex-col items-center gap-[30px] max-w-[1004px] mt-10">
          <h2 className="text-center text-[#333] font-semibold text-[28px] leading-[32px] sm:text-[36px] sm:leading-[40px] md:text-[42px] md:leading-[42px]" style={{fontFamily:'Inter, sans-serif'}}>
            No clichés. No AI slop.
          </h2>
          <p className="text-center text-[#616161] italic text-[20px] leading-[30px] sm:text-[24px] sm:leading-[36px] md:text-[30px] md:leading-[42px]" style={{fontFamily:'Caladea, serif'}}>
            Just content that feels like you — and connects with people who care.
          </p>
        </div>
      </div>
    </section>
  )
}
