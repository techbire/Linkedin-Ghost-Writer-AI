const steps = [
  {
    number: "01",
    color: "linear-gradient(135deg, #E4A321 0%, #E4A321 100%)",
    shadow: "#CF9114",
    title: "Share Your Thought",
    description: "Drop your idea, note, or URL — choose tone, category, and format to start creating.",
  },
  {
    number: "02",
    color: "linear-gradient(140.02deg, #F6914F 15.24%, #F97549 92.51%)",
    shadow: "#EF4F19",
    title: "GhostWriter Learns Your Writing Tone",
    description: "AI analyzes your content and mirrors your unique phrasing, tone, and rhythm.",
  },
  {
    number: "03",
    color: "linear-gradient(146.23deg, #6BCDEE 14.63%, #1CC0CB 86.96%)",
    shadow: "#16858C",
    title: "Get Three Engaging Drafts",
    description: "Receive three viral-ready post drafts crafted for saves, shares, and engagement.",
  },
  {
    number: "04",
    color: "linear-gradient(134.33deg, #EC6271 13.2%, #F13F47 85.45%)",
    shadow: "rgba(188, 20, 28, 0.25)",
    title: "Design Your Carousel",
    description: "Turn ideas into branded, scroll-stopping carousels in your chosen style and theme.",
  },
  {
    number: "05",
    color: "linear-gradient(134.33deg, #00BE0E 13.2%, #2C8032 85.45%)",
    shadow: "rgba(46, 139, 0, 0.25)",
    title: "Refine & Publish",
    description: "Edit, schedule, or post directly to LinkedIn — all from one seamless workspace.",
  },
];

export function StepProcess() {
  return (
    <section id="process" className="relative w-full flex flex-col items-center py-16 sm:py-20 px-4 bg-white">
      {/* Header section */}
      <div className="flex flex-col items-center gap-5 w-full max-w-[1280.5px] mb-12 sm:mb-16 lg:mb-20">
        <h2
          className="text-[28px] sm:text-[36px] md:text-[48px] lg:text-[52px] font-semibold text-center text-black w-full"
          style={{ 
            fontFamily: "Inter, sans-serif",
            lineHeight: "63px"
          }}
        >
          How It Works
        </h2>
        
        <p
          className="text-[16px] sm:text-[18px] lg:text-[20px] font-normal text-center text-black max-w-[784px]"
          style={{ 
            fontFamily: "Caladea, serif",
            lineHeight: "30px"
          }}
        >
          From <span className="font-bold italic">idea to LinkedIn</span>-ready content — 5 simple steps to create, refine, and publish effortlessly.
        </p>
      </div>

      {/* Responsive grid layout */}
      <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-8 sm:gap-12 lg:flex-nowrap lg:gap-16 w-full max-w-[1280px]">
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center w-full max-w-[205px] gap-6 mx-auto sm:mx-0">
            {/* Step Circles */}
            <div className="relative flex items-center justify-center w-[180px] sm:w-[190px] aspect-square">
              {/* Outer white border */}
              <div
                className="absolute rounded-full bg-white inset-0"
                style={{
                  border: "1.5px solid transparent",
                  backgroundImage: `linear-gradient(white, white), ${step.color}`,
                  backgroundOrigin: "border-box",
                  backgroundClip: "content-box, border-box",
                }}
              />

              {/* Middle colored ellipse */}
              <div
                className="absolute rounded-full inset-[13px]"
                style={{ background: step.color }}
              />

              {/* Inner white ellipse */}
              <div
                className="absolute rounded-full bg-white inset-[35px]"
                style={{ boxShadow: `0px 8px 6px ${step.shadow}` }}
              />

              {/* Small side dots */}
              <div
                className="absolute w-[16px] h-[16px] rounded-full bg-white left-[-0.75px] top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{
                  border: "1px solid transparent",
                  backgroundImage: `linear-gradient(white, white), ${step.color}`,
                  backgroundOrigin: "border-box",
                  backgroundClip: "content-box, border-box",
                }}
              />
              <div
                className="absolute w-[16px] h-[16px] rounded-full bg-white right-[-0.75px] top-1/2 -translate-y-1/2 translate-x-1/2"
                style={{
                  border: "1px solid transparent",
                  backgroundImage: `linear-gradient(white, white), ${step.color}`,
                  backgroundOrigin: "border-box",
                  backgroundClip: "content-box, border-box",
                }}
              />

              {/* Step Number & Label */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 z-10">
                <span
                  className="text-[32px] sm:text-[35px] font-bold text-[#2E2E2E] leading-none"
                  style={{ fontFamily: "Urbanist, sans-serif" }}
                >
                  {step.number}
                </span>
                <span
                  className="text-[14px] sm:text-[16px] font-medium text-[#2E2E2E] uppercase tracking-wide leading-none"
                  style={{ fontFamily: "Urbanist, sans-serif" }}
                >
                  Step
                </span>
              </div>
            </div>

            {/* Step Content */}
            <div className="flex flex-col items-center gap-3 w-full">
              {/* Step Title */}
              <h3
                className="text-[18px] sm:text-[20px] font-semibold text-center text-[#333] leading-tight"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {step.title}
              </h3>

              {/* Step Description */}
              <p
                className="text-[14px] sm:text-[16px] font-medium text-center text-[#616161] leading-snug"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
