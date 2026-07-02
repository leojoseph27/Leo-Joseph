"use client";

import { useRef, useEffect } from "react";
import Typed from "typed.js";
import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { onRobotLoaded } from "@/components/ui/boot-sequence";

const TYPED_STRINGS = [
  "AI Developer",
  "ML Engineer",
  "AI Engineer",
  "Data Scientist",
  "Web Developer",
  "Backend Developer",
  "Frontend Developer",
  "Full-Stack Developer",
  "Software Engineer",
  "AI Researcher",
  "NLP Engineer",
  "CV Engineer",
  "Tech Innovator",
  "AI Specialist",
];

export function SplineSceneBasic() {
  const typedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!typedRef.current) return;
    const typed = new Typed(typedRef.current, {
      strings: TYPED_STRINGS,
      typeSpeed: 80,
      backSpeed: 40,
      backDelay: 1200,
      loop: true,
    });
    return () => typed.destroy();
  }, []);

  return (
    <Card className="w-full h-full min-h-full bg-black/[0.96] relative overflow-hidden border-0">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />

      <div className="flex h-full">
        <div className="flex-[1.1] p-8 pl-[10%] relative z-10 flex flex-col justify-center">
          <h2 className="text-[2.03rem] md:text-[2.53rem] font-semibold text-neutral-300">
            hi there!
          </h2>
          <h1 className="mt-2 font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            <span className="text-[2.58rem] md:text-[3.44rem]">I Am a </span>
            <span ref={typedRef} className="text-neutral-100 text-[2.26rem] md:text-[3.02rem]" />
          </h1>
          <p className="mt-4 text-[1.35rem] text-neutral-300 max-w-xl leading-relaxed">
            Computer Science Engineer and Full-Stack Developer skilled in
            building modern web applications, scalable software solutions, and
            data-driven systems. Experienced in developing end-to-end products,
            interactive tools, and integrating AI features into real-world
            applications for companies in India and Kuwait.
          </p>
          <a
            href="#about"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-white/10 text-neutral-100 hover:bg-white/20 transition-colors w-fit font-medium text-[1.35rem]"
          >
            about me <span aria-hidden>→</span>
          </a>
        </div>

        <div className="flex-[0.9] relative">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
            onLoad={onRobotLoaded}
          />
        </div>
        {/* if Spline never fires onLoad (e.g. blocked), fall back to ready
            after a generous timeout so the loader never hangs forever */}
      </div>
    </Card>
  );
}
