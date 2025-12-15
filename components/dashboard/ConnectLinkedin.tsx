"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Linkedin, ShieldCheck } from "lucide-react";
import Image from "next/image";

interface ConnectLinkedInPageProps {
  userId: string;
}

export default function ConnectLinkedInPage({ userId }: ConnectLinkedInPageProps) {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  const handleConnect = () => {
    setLoading(true);
    window.location.href = `/api/linkedin/auth?user_id=${userId}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-background text-center px-6">
      {/* LinkedIn Logo */}
      {/* <Linkedin className="h-12 w-12 text-blue-600 mb-4" /> */}
      <Image
        src={"/icons/medi_linkedin.png"}
        width={80}
        height={80}
        alt="Linked In Logo"
      />
      <h1 className="text-3xl text-[#0A66C2] font-bold mb-2">
        Connect LinkedIn
      </h1>
      <Image
        src={"/linked979.png"}
        width={500}
        height={500}
        alt="Linked In Logo"
      />
      {/* Title */}
      <h1 className="text-2xl font-semibold mb-2">
        Unlock LinkedIn Publishing
      </h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Securely connect your LinkedIn account to start creating and scheduling
        AI-powered content directly from GhostWriter.
      </p>

      {/* Example Carousel (like Meta) */}
      {/* <div className="flex items-center justify-center gap-3 mb-8 overflow-x-auto">
        {["photo1.avif", "photo4.avif", "photo3.avif"].map((img, i) => (
          <div
            key={i}
            className="w-32 h-40 bg-muted rounded-xl flex items-center justify-center text-xs font-medium text-muted-foreground"
          >
            <img
              src={`/${img}`}
              alt={`Example ${i + 1}`}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        ))}
      </div> */}

      {/* Button */}
      <Button
        onClick={handleConnect}
        disabled={loading}
        className="px-6 py-4 min-w-xl text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Image
              src={"/icons/sm_linkedin.png"}
              width={15}
              height={15}
              alt="Linked In Logo"
            />
            Connect LinkedIn
          </>
        )}
      </Button>

      <p className="text-xs text-[#34A853] mt-4 flex items-center gap-2">
        <span>
          <ShieldCheck className="w-4" />
        </span>
        Connection takes less than 30 seconds. Your data is securely encrypted.
      </p>
    </div>
  );
}
