"use client";

import IntroAnimation from "@/components/ui/scroll-morph-hero";

export default function DemoPage() {
  return (
    <div className="w-full min-h-screen bg-black">
      <div className="w-full h-screen border border-white/10 rounded-none overflow-hidden">
        <IntroAnimation showArcContent={true} />
      </div>
    </div>
  );
}
