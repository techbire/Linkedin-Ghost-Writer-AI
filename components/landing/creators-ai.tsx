import Image from "next/image"

export function CreatorsAI() {
  return (
    <section className="relative w-full flex justify-center px-4 py-20 md:py-24 lg:py-32 bg-white" id="creators-ai">
      <div className="w-full max-w-[1024px] flex flex-col items-center gap-[100px]">
        {/* Heading */}
        <div className="flex flex-col items-center gap-5 max-w-[753px]">
          <h2
            className="text-[#333] font-semibold text-[32px] leading-[40px] sm:text-[48px] sm:leading-[56px] md:text-[64px] md:leading-[72px] lg:text-[96px] lg:leading-[116px] text-center whitespace-nowrap"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            The Creator's AI
          </h2>
          <p
            className="text-[#616161] text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] leading-[20px] sm:leading-[24px] text-center px-4"
            style={{ fontFamily: "Caladea, serif" }}
          >
            A platform — built to help you sound human, write faster, and grow faster.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="relative w-full max-w-[1024px] h-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
          {/* Card 1: Smart Post Scheduling - Top Left Large */}
          <div className="relative col-span-1 md:col-span-1 lg:col-span-1 bg-[#F3F4F6] border border-[rgba(44,128,50,0.3)] rounded-[48px_12px_12px_12px] lg:rounded-[48px_12px_12px_12px] p-6 overflow-hidden min-h-[304px]">
            <div className="relative w-full h-[200px] mb-4">
              <Image
                src="/assests/frame1.png"
                alt="Smart Post Scheduling"
                fill
                className="object-contain"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#F7F7F8] via-[#F7F7F8] to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-2 mt-8">
              <h3 className="text-[#333] font-semibold text-[14px] leading-[20px] text-center" style={{ fontFamily: "Inter, sans-serif" }}>
                Smart Post Scheduling
              </h3>
              <p className="text-[#616161] text-[12px] leading-[16px] text-center" style={{ fontFamily: "Inter, sans-serif" }}>
                Auto-publishes to LinkedIn at personalized, peak engagement times.
              </p>
            </div>
          </div>

          {/* Card 2: Deep Research - Top Right Large */}
          <div className="relative col-span-1 md:col-span-1 lg:col-span-2 bg-[#F3F4F6] border border-[rgba(44,128,50,0.3)] rounded-[12px_48px_12px_12px] lg:rounded-[12px_48px_12px_12px] p-6 overflow-hidden min-h-[304px]">
            <div className="relative w-full h-[200px] mb-4">
              <Image
                src="/assests/frame2.png"
                alt="Deep Research & Authenticity Engine"
                fill
                className="object-contain"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#F7F7F8] via-[#F7F7F8] to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-2 mt-8">
              <h3 className="text-[#333] font-semibold text-[14px] leading-[20px] text-center" style={{ fontFamily: "Inter, sans-serif" }}>
                Deep Research & Authenticity Engine
              </h3>
              <p className="text-[#616161] text-[12px] leading-[16px] text-center" style={{ fontFamily: "Inter, sans-serif" }}>
                Guarantees fact-checked, trustworthy content and a spotless brand reputation.
              </p>
            </div>
          </div>

          {/* Card 3: Viral Ideation Agent - Bottom Left */}
          <div className="relative col-span-1 bg-[#F3F4F6] border border-[rgba(44,128,50,0.3)] rounded-[12px_12px_12px_48px] p-6 overflow-hidden min-h-[352px]">
            <div className="relative w-full h-[180px] mb-4">
              <Image
                src="/assests/frame3.png"
                alt="Viral Ideation Agent"
                fill
                className="object-contain"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#F7F7F8] via-[#F7F7F8] to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-2 mt-8">
              <h3 className="text-[#333] font-semibold text-[14px] leading-[20px] text-center" style={{ fontFamily: "Inter, sans-serif" }}>
                Viral Ideation Agent
              </h3>
              <p className="text-[#616161] text-[12px] leading-[20px] text-center" style={{ fontFamily: "Inter, sans-serif" }}>
                Delivers 3 high-performing post angles instantly for any topic.
              </p>
            </div>
          </div>

          {/* Card 4: Visual Storytelling Co-Pilot - Bottom Center */}
          <div className="relative col-span-1 bg-[#F3F4F6] border border-[rgba(44,128,50,0.3)] rounded-[12px] p-6 overflow-hidden min-h-[352px]">
            <div className="relative w-full h-[180px] mb-4">
              <Image
                src="/assests/frame4.png"
                alt="Visual Storytelling Co-Pilot"
                fill
                className="object-contain"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#F7F7F8] via-[#F7F7F8] to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-2 mt-8">
              <h3 className="text-[#333] font-semibold text-[14px] leading-[20px] text-center" style={{ fontFamily: "Inter, sans-serif" }}>
                Visual Storytelling Co-Pilot
              </h3>
              <p className="text-[#616161] text-[12px] leading-[20px] text-center" style={{ fontFamily: "Inter, sans-serif" }}>
                Generates branded, algorithm-optimized carousels and graphics in seconds.
              </p>
            </div>
          </div>

          {/* Card 5: Content Humanization - Bottom Right */}
          <div className="relative col-span-1 bg-[#F3F4F6] border border-[rgba(44,128,50,0.3)] rounded-[12px_12px_48px_12px] p-6 overflow-hidden min-h-[352px]">
            <div className="relative w-full h-[180px] mb-4">
              <Image
                src="/assests/frame5.png"
                alt="Content Humanization"
                fill
                className="object-contain"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#F7F7F8] via-[#F7F7F8] to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-2 mt-8">
              <h3 className="text-[#333] font-semibold text-[14px] leading-[20px] text-center" style={{ fontFamily: "Inter, sans-serif" }}>
                Content Humanization
              </h3>
              <p className="text-[#616161] text-[12px] leading-[20px] text-center" style={{ fontFamily: "Inter, sans-serif" }}>
                Applies psychological patterns to ensure AI-drafted content reads 100% human.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
