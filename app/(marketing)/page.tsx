import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { VideoDemo } from "@/components/landing/video-demo";
import { StepProcess } from "@/components/landing/step-process";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { IdeasWorthSharing } from "@/components/landing/ideas-worth-sharing";
import { CreatorsAI } from "@/components/landing/creators-ai";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <VideoDemo />
        <IdeasWorthSharing />
        <CreatorsAI />
        <StepProcess />
        <Pricing />
        {/* <Testimonials /> */}
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
