"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

// ✨ BEST PRACTICE: Added a unique `id` for more stable React keys instead of using the array index.
const faqs = [
  {
    id: "faq-1",
    question: "How does GhostWriter AI sound like me?",
    answer:
      "It learns your phrasing, tone, and style from your posts and notes, then adapts continuously to your voice.",
  },
  {
    id: "faq-2",
    question: "Is the content original and safe to post?",
    answer:
      "Yes. Every piece is fact-checked and cross-referenced for plagiarism-free originality.",
  },
  {
    id: "faq-3",
    question: "Can I use it for my LinkedIn clients?",
    answer:
      "Definitely. Create multiple voice profiles and manage all your clients in one dashboard.",
  },
  {
    id: "faq-4",
    question: "Does it generate visuals too?",
    answer:
      "Yes — GhostWriter AI can turn your text into stunning carousels and branded post visuals.",
  },
  {
    id: "faq-5",
    question: "Is it optimized for LinkedIn's 2025 algorithm?",
    answer:
      "Completely. It's designed to maximize saves, shares, and dwell time — LinkedIn's key engagement metrics.",
  },
]

interface FAQItemProps {
  id: string
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  const bgColor = isOpen ? "bg-[#2C8032]" : "bg-[#333333]"
  const hoverColor = isOpen ? "hover:bg-[#2C8032]/90" : "hover:bg-[#333333]/80"
  
  return (
    <div className={`w-full ${bgColor} border border-white/10 rounded-2xl overflow-hidden transition-all duration-200`}>
      <button
        onClick={onToggle}
        className={`w-full px-8 py-6 flex items-center justify-between ${hoverColor} transition-colors`}
      >
        <h3 className="text-xl font-semibold text-white text-left max-w-2xl">
          {question}
        </h3>
        <ChevronDown
          className={`w-6 h-6 text-white flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-8 py-4 bg-[#2C8032]/80 border-t border-white/20">
          <p className="text-base font-normal text-white/90 leading-relaxed">
            {answer}
          </p>
        </div>
      )}
    </div>
  )
}

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>("faq-1")

  return (
    <section id="faq" className="px-4 sm:px-8 py-20 sm:py-24 md:py-32 bg-white">
      <div className="flex flex-col items-center gap-12 max-w-5xl mx-auto">
        {/* Section Title */}
        <div className="text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-black">
            FAQ Section
          </h2>
          <p
            className="mt-4 text-[16px] sm:text-[18px] lg:text-[20px] font-normal text-center text-black max-w-[764px] mx-auto"
            style={{
              fontFamily: "Caladea, serif",
              lineHeight: "30px",
            }}
          >
            You've got questions. We've got clarity.
          </p>
        </div>

        {/* FAQ Items Container */}
        <div className="w-full flex flex-col gap-4">
          {faqs.map((faq) => (
            <FAQItem
              key={faq.id}
              id={faq.id}
              question={faq.question}
              answer={faq.answer}
              isOpen={openId === faq.id}
              onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}