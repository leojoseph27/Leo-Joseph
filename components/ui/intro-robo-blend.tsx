"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import IntroAnimation from "@/components/ui/scroll-morph-hero";
import { SplineSceneBasic } from "@/components/ui/demo";

const SECTION_HEIGHT_VH = 220; // total scroll height for the blend (vh units)
const INTRO_COMPLETE_AT = 0.42; // intro animates 0→1 over first 42% of section scroll
const CROSSFADE_START = 0.38;
const CROSSFADE_END = 0.62;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function IntroRoboBlend() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(typeof window !== "undefined" ? window.innerHeight : 800);

  const updateProgress = useCallback(() => {
    const section = sectionRef.current;
    if (!section || typeof window === "undefined") return;
    const vh = window.innerHeight;
    setViewportHeight(vh);
    const rect = section.getBoundingClientRect();
    const sectionHeight = (SECTION_HEIGHT_VH / 100) * vh;
    const scrollable = sectionHeight - vh;
    if (scrollable <= 0) {
      setProgress(1);
      return;
    }
    const scrolled = -rect.top;
    const p = clamp(scrolled / scrollable, 0, 1);
    setProgress(p);
  }, []);

  useEffect(() => {
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [updateProgress]);

  const introProgress = Math.min(1, progress / INTRO_COMPLETE_AT);
  const introOpacity = progress <= CROSSFADE_START ? 1 : progress >= CROSSFADE_END ? 0 : 1 - (progress - CROSSFADE_START) / (CROSSFADE_END - CROSSFADE_START);
  const roboOpacity = progress <= CROSSFADE_START ? 0 : progress >= CROSSFADE_END ? 1 : (progress - CROSSFADE_START) / (CROSSFADE_END - CROSSFADE_START);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black"
      style={{ height: `${SECTION_HEIGHT_VH}vh` }}
    >
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        {/* Intro layer: scroll-driven, fades out during crossfade */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            opacity: introOpacity,
            pointerEvents: introOpacity > 0.5 ? "auto" : "none",
          }}
          transition={{ duration: 0.2 }}
        >
          <IntroAnimation
            showArcContent={false}
            scrollProgress={introProgress}
          />
        </motion.div>
        {/* Robo layer: fades in during crossfade; pointer-events only when visible */}
        <motion.div
          className="absolute inset-0 z-10"
          style={{
            opacity: roboOpacity,
            pointerEvents: roboOpacity > 0.5 ? "auto" : "none",
          }}
          transition={{ duration: 0.2 }}
        >
          <SplineSceneBasic />
        </motion.div>
      </div>
    </section>
  );
}
