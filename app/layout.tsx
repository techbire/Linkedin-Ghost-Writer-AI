import type React from "react";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Finger_Paint } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { PostHogProvider } from "../components/PostHogProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const fingerPaint = Finger_Paint({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-finger-paint",
  display: "swap",
});

const salmon = localFont({
  src: "../public/Salmon.ttf",
  variable: "--font-salmon",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SaaS MVP - Build and Scale Your Product",
  description:
    "The complete platform to build and scale your SaaS product with modern tools and best practices.",
  generator: "v0.app",
  icons: {
    icon: "/placeholder-logo.png", // favicon for tab
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} ${fingerPaint.variable} ${salmon.variable}`}
    >
      <body className="font-sans antialiased">
        <PostHogProvider>
          <Suspense fallback={<div>Loading...</div>}>
            {/* Default to light theme and ignore system preference */}
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={true}
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </Suspense>
          <Analytics />
        </PostHogProvider>
      </body>
    </html>
  );
}
