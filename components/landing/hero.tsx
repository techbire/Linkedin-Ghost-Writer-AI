import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

// Landing hero redesigned to match the provided mock: center-aligned copy with a badge,
// green CTA, and decorative floating UI cards around the hero.
export function Hero() {
  return (
  <section className="relative w-full min-h-[880px] bg-white flex items-center justify-center px-4 pt-28 md:pt-32 pb-16 md:pb-20">
      {/* Floating decorative cards using provided SVG assets */}
      {/* Top-left LinkedIn notification */}
      <div className="absolute left-2 sm:left-4 md:left-8 top-32 sm:top-24 md:top-28 z-[10]">
        <Image
          src="/assests/notif.png"
          width={293}
          height={60}
          alt="LinkedIn notification"
          priority
          className="w-[180px] h-auto sm:w-[220px] md:w-[260px] lg:w-[293px]"
        />
              </div>

      {/* Right small "Generate post" pill with pointing cursor */}
      <div className="absolute right-2 sm:right-6 md:right-10 top-32 sm:top-36 md:top-40">
        <Image
          src="/assests/generate%20post.png"
          width={178}
          height={52}
          alt="Generate post"
          className="rotate-[2.21deg] w-[110px] h-auto sm:w-[130px] md:w-[150px] lg:w-[178px]"
        />
      </div>
  {/* Removed placeholder cursor box per request */}

      {/* Bottom-right schedule card */}
      <div className="absolute right-2 sm:right-6 md:right-10 bottom-12 sm:bottom-22 md:bottom-24">
        <Image
          src="/assests/schdeule%20post.svg"
          width={260}
          height={269}
          alt="Schedule the post"
          className="rotate-[9deg] w-[140px] h-auto sm:w-[180px] md:w-[220px] lg:w-[260px]"
        />
      </div>

      {/* Bottom-left impressions tile + slider */}
      <div className="absolute left-2 sm:left-12 md:left-24 bottom-24 sm:bottom-26 md:bottom-28">
        <Image
          src="/assests/impression.png"
          width={245}
          height={59}
          alt="Impressions tile"
          className="rotate-[6.85deg] w-[140px] h-auto sm:w-[180px] md:w-[220px] lg:w-[245px]"
        />
      </div>
      <div className="hidden sm:block absolute left-2 sm:left-6 md:left-8 bottom-6 sm:bottom-7 md:bottom-8">
        <Image
          src="/assests/loading%20bar.png"
          width={365}
          height={26}
          alt="Loading bar"
          className="w-[200px] h-auto sm:w-[280px] md:w-[320px] lg:w-[365px]"
        />
      </div>

    {/* Main copy block */}
  <div className="relative z-[1] flex flex-col items-center gap-[40px] w-full max-w-[799px]">
        {/* Small link/badge */}
  <div className="h-10 flex items-center gap-2 border border-black/20 rounded-full px-4 py-2 shadow-[inset_0_0_0_1px_rgba(22,26,38,0.05),inset_0_-1px_2px_rgba(0,0,0,0.12)] bg-white">
          <div className="relative w-5 h-5">
            <span className="absolute left-[16%] top-[29%] w-[9px] h-[9px] rounded-[2px] bg-[#2C8032]" />
            <span className="absolute left-[56%] top-[17%] w-[6px] h-[6px] rounded-[1px] bg-[#2C8032]/40" />
            <span className="absolute left-[56%] top-[58%] w-[6px] h-[6px] rounded-[1px] bg-[#2C8032]/40" />
          </div>
          <span className="text-[14px] font-semibold text-[#262E35]" style={{fontFamily:'Inter, sans-serif'}}>Posts & written content</span>
        </div>

        {/* Heading */}
        <h1 className="text-center text-black font-bold max-w-[640px] md:max-w-[720px] text-[28px] leading-[42px] sm:text-[32px] sm:leading-[46px] lg:text-[40px] lg:leading-[58px]" style={{fontFamily:'Poppins, ui-sans-serif, system-ui'}}>
          The AI co-writer that learns your voice and writes content people actually engage with.🔥
        </h1>

        {/* Subheading */}
        <p className="text-center text-black text-[16px] sm:text-[18px] md:text-[20px] leading-[30px] md:leading-[36px] max-w-[620px] md:max-w-[680px]" style={{fontFamily:'Caladea, serif'}}>
          Turn your <span className="font-semibold italic">ideas & notes</span> into scroll-stopping LinkedIn posts that sound human — and <span className="font-semibold italic">perform like viral.</span>
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <Button
            asChild
            className="h-[49px] rounded-[12px] px-7 text-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]"
            style={{
              background:
                "linear-gradient(0deg, #2C8032, #2C8032), linear-gradient(180deg, #16DB93 0%, #0C754F 100%), #FFFFFF",
            }}
          >
            <Link href="/signup" className="text-[16px] font-semibold" style={{fontFamily:'Inter, sans-serif'}}>
              Get Started Free
            </Link>
          </Button>
          <span className="text-[12px] text-black/50 font-medium" style={{fontFamily:'Inter, sans-serif'}}>No Credit Card Required</span>
        </div>
      </div>
    </section>
  )
}
