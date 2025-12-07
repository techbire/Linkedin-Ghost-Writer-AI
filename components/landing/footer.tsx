import Link from "next/link"
import { Mail, ArrowUpRight } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#131313] text-white py-16 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-16 mb-16">
          {/* Left Section - Logo & Newsletter */}
          <div className="flex flex-col gap-12 lg:max-w-xs flex-shrink-0">
            {/* Logo */}
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-normal font-caladea text-white tracking-wide">
                Ghostwriter AI
              </h3>
              <p className="text-xs font-medium text-[#98A2B3]">
                Ghostwriter AI by techbire
              </p>
            </div>

            {/* Newsletter Section */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-[#98A2B3]">
                Have a project in mind? Let us work together
              </p>

              {/* Email Input */}
              <div className="relative">
                <input
                  type="email"
                  placeholder="Send E-Mail Address"
                  className="w-full px-4 py-3 bg-transparent border-b border-[#98A2B3] text-sm text-white placeholder-[#98A2B3] focus:outline-none focus:border-white transition-colors"
                />
                <button className="absolute right-0 top-3 text-[#98A2B3] hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Columns - Right Side */}
          <div className="flex flex-col sm:flex-row gap-8 lg:gap-12 flex-1 lg:justify-end">
            {/* Nav Column 4 - Company */}
            <div className="flex flex-col gap-4 w-full sm:w-auto">
              <h4 className="text-sm font-normal text-[#98A2B3]">Company</h4>
              <ul className="space-y-2 flex flex-col">
                <li>
                  <Link href="#" className="text-sm text-[#667085] hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-[#667085] hover:text-white transition-colors">
                    Process
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-[#667085] hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-[#667085] hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Nav Column 5 - Resources */}
            <div className="flex flex-col gap-4 w-full sm:w-auto">
              <h4 className="text-sm font-normal text-[#98A2B3]">Resources</h4>
              <ul className="space-y-2 flex flex-col">
                <li>
                  <Link href="#" className="text-sm text-[#667085] hover:text-white transition-colors">
                    Tutorials
                  </Link>
                </li>
              </ul>
            </div>

            {/* Nav Column 6 - Legal */}
            <div className="flex flex-col gap-4 w-full sm:w-auto">
              <h4 className="text-sm font-normal text-[#98A2B3]">Legal</h4>
              <ul className="space-y-2 flex flex-col">
                <li>
                  <Link href="#" className="text-sm text-[#667085] hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-[#667085] hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-[#667085] hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-[#667085] hover:text-white transition-colors">
                    GDPR Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#98A2B3]/25 mb-6"></div>

        {/* Bottom Section - Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-sm text-[#98A2B3]">
            © 2025 Ghostwriter AI. All rights reserved.
          </p>
         
        
        </div>
      </div>
    </footer>
  )
}
