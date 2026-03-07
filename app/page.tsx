'use client';

import dynamic from "next/dynamic";
import { HeroSection } from "@/components/home/HeroSection";

const AISection = dynamic(() => import("@/components/home/AISection").then(m => m.AISection), {
  ssr: false,
});

const FinalCTA = dynamic(() => import("@/components/home/FinalCTA").then(m => m.FinalCTA), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="flex flex-col overflow-hidden">
      <HeroSection />
      <AISection />
      <FinalCTA />
    </div>
  );
}
