"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Floating Header */}
      <header className="fixed top-4 sm:top-6 md:top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-[95%] sm:max-w-[90%] lg:max-w-[1280px] px-2 sm:px-4">
        <div 
          className="flex flex-row justify-between items-center px-3 sm:px-4 lg:px-5 py-2 sm:py-[5px] gap-4 sm:gap-8 h-[55px] sm:h-[60px] lg:h-[64px] bg-white border border-black/20 rounded-xl sm:rounded-2xl"
          style={{ boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)' }}
        >
          {/* Logo/Brand */}
          <Link 
            href="/"
            className="text-2xl sm:text-3xl lg:text-4xl font-caladea text-black whitespace-nowrap"
            style={{
              fontFamily: 'Caladea, serif',
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: '2rem', // H5 spec, adjust as needed
              lineHeight: '100%',
              letterSpacing: '4%',
            }}
          >
            Ghostwriter AI
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link 
              href="#features" 
              className="text-sm font-medium text-black/70 hover:text-black transition-colors whitespace-nowrap"
            >
              Features
            </Link>
            <Link 
              href="#process" 
              className="text-sm font-medium text-black/70 hover:text-black transition-colors whitespace-nowrap"
            >
              Process
            </Link>
            <Link 
              href="#pricing" 
              className="text-sm font-medium text-black/70 hover:text-black transition-colors whitespace-nowrap"
            >
              Pricing
            </Link>
            <Link 
              href="#faq" 
              className="text-sm font-medium text-black/70 hover:text-black transition-colors whitespace-nowrap"
            >
              FAQ
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              variant="ghost" 
              asChild
              className="hidden lg:inline-flex text-black hover:text-black/70 hover:bg-black/5 text-sm"
            >
              <Link href="/login">Log in</Link>
            </Button>
            <Button 
              asChild
              className="hidden lg:inline-flex text-white rounded-lg text-sm px-4 lg:px-6"
              style={{
                background:
                  "linear-gradient(0deg, #2C8032, #2C8032), linear-gradient(180deg, #16DB93 0%, #0C754F 100%), #FFFFFF",
              }}
            >
              <Link href="/signup">Get Started</Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-black hover:bg-black/5 h-9 w-9" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div 
          className="fixed top-[70px] sm:top-[80px] md:top-[90px] left-1/2 -translate-x-1/2 z-40 w-full max-w-[95%] sm:max-w-[90%] lg:max-w-[1280px] px-2 sm:px-4 lg:hidden"
        >
          <div 
            className="bg-white border border-black/20 rounded-xl sm:rounded-2xl p-4 sm:p-6"
            style={{ boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)' }}
          >
            <nav className="flex flex-col gap-3 sm:gap-4">
              <Link
                href="#features"
                className="text-sm font-medium text-black/70 hover:text-black transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#process"
                className="text-sm font-medium text-black/70 hover:text-black transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Process
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium text-black/70 hover:text-black transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="#faq"
                className="text-sm font-medium text-black/70 hover:text-black transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <div className="flex flex-col gap-2 pt-3 sm:pt-4 border-t border-black/10">
                <Button variant="ghost" asChild className="text-black hover:bg-black/5 justify-start w-full">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild className="bg-black hover:bg-black/90 text-white w-full">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
