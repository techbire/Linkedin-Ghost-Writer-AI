"use client";

import { useState } from "react";
import Image from "next/image";

const testimonials = [
  {
    quote: "Woah.",
    text: "I used to second-guess every post. Now I publish confidently — and my engagement tripled.",
    author: "Aisha M.",
    role: "Startup Consultant",
    image: "/assests/testimonial-1.png",
  },
  {
    quote: "Amazing.",
    text: "This doesn't just sound like me. It sounds like my best self on LinkedIn.",
    author: "Nikhil D.",
    role: "Solopreneur Coach",
    image: "/assests/testimonial-1.png",
  },
  {
    quote: "Game changer.",
    text: "GhostWriter AI helped me turn one note into a viral post that brought 15 leads in 3 days.",
    author: "Rohan S.",
    role: "Freelance Marketer",
    image: "/assests/testimonial-1.png",
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="relative w-full flex flex-col items-center gap-[120px] py-20 px-4 bg-white">
      {/* Trusted by text */}
      <div className="flex flex-row justify-center items-center px-4 md:px-[150px] w-full max-w-[1440px]">
        <h2
          className="text-[24px] sm:text-[32px] md:text-[42px] lg:text-[52px] font-semibold text-center text-black max-w-[1140px]"
          style={{
            fontFamily: "Inter, sans-serif",
            lineHeight: "1.2",
          }}
        >
          Trusted by 10,000+ creators and solopreneurs building real LinkedIn influence
        </h2>
      </div>

      {/* Testimonial card */}
      <div className="w-full max-w-[1440px] flex flex-col justify-center items-center pt-[80px] gap-[110px] bg-black px-4 sm:px-8 md:px-12 pb-20 rounded-2xl">
        {/* Large Quote */}
        <div className="flex flex-col md:flex-row items-center gap-[40px] md:gap-[89px] max-w-[759px] relative z-10">
          {/* Image */}
          <div className="relative w-[265px] h-[337px] rounded-xl overflow-hidden flex-shrink-0">
            <div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 z-10"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0, 0, 0, 0) 56.77%, rgba(0, 0, 0, 0.71) 100%)",
              }}
            />
            <Image
              src={currentTestimonial.image}
              alt={currentTestimonial.author}
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col items-start gap-[25px] max-w-[405px] relative">
            {/* Quote mark */}
            <div className="absolute -right-[37px] top-[80px] w-[133px] h-[118px] opacity-10">
              <Image
                src="/assests/quote mark.png"
                alt="Quote mark"
                width={133}
                height={118}
                className="rotate-180"
              />
            </div>

            {/* Main quote */}
            <h3
              className="text-[40px] sm:text-[50px] md:text-[60px] font-normal text-white"
              style={{
                fontFamily: "Playfair Display, serif",
                lineHeight: "80px",
              }}
            >
              {currentTestimonial.quote}
            </h3>

            {/* Testimonial text */}
            <p
              className="text-[14px] sm:text-[16px] font-normal text-white"
              style={{
                fontFamily: "Poppins, sans-serif",
                lineHeight: "26px",
              }}
            >
              {currentTestimonial.text}
            </p>

            {/* Author info */}
            <div className="flex flex-col items-start gap-[2px]">
              <p
                className="text-[16px] font-bold text-white"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  lineHeight: "24px",
                }}
              >
                {currentTestimonial.author}
              </p>
              <p
                className="text-[14px] font-normal text-[#737373]"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  lineHeight: "21px",
                }}
              >
                {currentTestimonial.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-row items-start gap-[10px]">
          {/* Back button */}
          <button
            onClick={handlePrevious}
            className="flex flex-row items-center justify-center p-[10px] w-[50px] h-[36px] border border-white rounded-[10px] hover:bg-white/10 transition-colors"
            aria-label="Previous testimonial"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="rotate-180"
            >
              <path
                d="M5.75 2.25L11.5 8L5.75 13.75"
                stroke="white"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Forward button */}
          <button
            onClick={handleNext}
            className="flex flex-row items-center justify-center p-[10px] w-[50px] h-[36px] border border-white rounded-[10px] hover:bg-white/10 transition-colors"
            aria-label="Next testimonial"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.75 2.25L11.5 8L5.75 13.75"
                stroke="white"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
