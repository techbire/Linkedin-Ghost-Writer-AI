import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function CTASection() {
  return (
    <section className="w-full py-20 sm:py-24 md:py-32 px-4 sm:px-8 bg-white">
      <div className="relative flex flex-col items-center gap-[40px] max-w-[1280.5px] mx-auto">
        {/* Main Heading */}
        <h2
          className="text-[32px] sm:text-[42px] md:text-[52px] font-semibold text-center text-black w-full"
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            lineHeight: "63px",
          }}
        >
          Write like{" "}
          <span
            className="text-[98px] relative inline-block"
            style={{
              fontFamily: "Salmon, cursive",
              fontWeight: 400,
              fontStyle: "normal",
              lineHeight: "100%",
              letterSpacing: "0%",
            }}
          >
            you.
            {/* Hand Pencil Decoration */}
            <span className="absolute -right-[105px] -top-[10px]">
              <Image
                src="/handpencil.svg"
                alt="Hand with pencil"
                width={120}
                height={103}
              />
            </span>
          </span>{" "}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          Grow like{" "}
          <span
            style={{
              fontFamily: "Caladea, serif",
              fontWeight: 700,
              fontStyle: "italic",
            }}
          >
            viral.
          </span>
        </h2>

        {/* Subheading */}
        <p
          className="text-[20px] sm:text-[26px] md:text-[30px] font-normal text-center text-black w-full max-w-[1280.5px]"
          style={{
            fontFamily: "Caladea, serif",
            fontWeight: 400,
            lineHeight: "42px",
          }}
        >
          Your ideas deserve more than another <span className="italic font-bold">AI rewrite.</span> GhostWriter AI helps creators sound <span className="italic font-bold">real, post consistently,</span> and <span className="italic font-bold">grow their influence</span> one authentic post at a time.
        </p>

        {/* CTA Buttons */}
        <div className="relative flex flex-col sm:flex-row items-start justify-center gap-[40px] z-10">
          {/* Get Started Button with No Credit Card */}
          <div className="flex flex-col items-center gap-[12px] w-[188px]">
            <Button
              asChild
              className="w-[188px] h-[49px] px-[30px] py-[15px] rounded-[12px] text-white font-semibold text-[16px] hover:opacity-90"
              style={{
                background: "linear-gradient(0deg, #2C8032, #2C8032), linear-gradient(180deg, #16DB93 0%, #0C754F 100%), #FFFFFF",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                lineHeight: "19px",
              }}
            >
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <p
              className="text-[12px] font-medium text-black/50 text-center w-[188px]"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                lineHeight: "15px",
              }}
            >
              No Credit Card Required
            </p>
          </div>

          {/* Watch Demo Button */}
          <Button
            asChild
            className="w-[185px] h-[49px] px-[30px] py-[15px] bg-white border border-black rounded-[12px] hover:bg-gray-50 font-semibold text-[16px] text-black"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              lineHeight: "19px",
            }}
          >
            <Link href="#demo" className="flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 2L13 8L3 14V2Z" fill="black" stroke="black" strokeWidth="1"/>
              </svg>
              Watch Demo
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
