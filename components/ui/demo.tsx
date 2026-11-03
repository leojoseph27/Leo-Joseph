"use client";

import { useRef, useEffect } from "react";
import Typed from "typed.js";
import { motion, useReducedMotion } from "framer-motion";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { onRobotLoaded } from "@/components/ui/boot-sequence";
import { SCENE_HERO } from "@/lib/assets";

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
  const reduce = useReducedMotion();

  // The hero robot mounts IMMEDIATELY (immediate prop): the boot loader
  // prepares it — runtime download, scene load, renderer init — while
  // the loading screen is still showing, and tracks its real readiness
  // through onRobotLoaded. It then stays mounted for the whole session.

  useEffect(() => {
    if (!typedRef.current) return;
    const typed = new Typed(typedRef.current, {
      strings: TYPED_STRINGS,
      typeSpeed: 80,
      backSpeed: 40,
      backDelay: 1200,
      loop: true,
      showCursor: false,
    });
    return () => typed.destroy();
  }, []);

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 26, filter: "blur(8px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 0.8, delay, ease: [0.21, 0.65, 0.35, 1] as const },
        };

  return (
    <div className="w-full min-h-[100svh] bg-black/[0.96] relative overflow-hidden flex flex-col">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />

      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center md:gap-4">
        {/* Copy — first on mobile, left on desktop */}
        <div className="w-full md:w-[41%] md:flex-none px-6 md:px-0 md:pl-[2%] pt-10 md:pt-0 pb-2 md:pb-0 relative z-10 flex flex-col justify-center text-center md:text-left">
          <motion.p
            {...rise(0.05)}
            className="text-purple-400 text-xs md:text-sm font-medium uppercase tracking-[0.35em] mb-3"
          >
            hi there!
          </motion.p>
          <motion.h1
            {...rise(0.15)}
            className="font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 leading-[1.08]"
          >
            <span className="block text-[clamp(1.9rem,7vw,3.4rem)]">
              I Am a
            </span>
            <span
              ref={typedRef}
              className="block text-neutral-100 text-[clamp(1.7rem,6.4vw,3rem)] min-h-[1.2em]"
            />
          </motion.h1>
          <motion.p
            {...rise(0.3)}
            className="mt-4 md:mt-5 text-sm md:text-base lg:text-lg text-neutral-300 max-w-xl leading-relaxed mx-auto md:mx-0"
          >
            Computer Science Engineer and Full-Stack Developer skilled in
            building modern web applications, scalable software solutions, and
            data-driven systems. Experienced in developing end-to-end products,
            interactive tools, and integrating AI features into real-world
            applications for companies in India and Kuwait.
          </motion.p>
          <motion.a
            {...rise(0.45)}
            href="#about"
            className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-md bg-white/10 text-neutral-100 hover:bg-white/20 transition-colors w-fit font-medium text-sm md:text-base mx-auto md:mx-0"
          >
            about me <span aria-hidden>→</span>
          </motion.a>
        </div>

        {/* Robot — below the copy on mobile, right on desktop */}
        <motion.div
          {...(reduce
            ? {}
            : {
                initial: { opacity: 0, scale: 0.96 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 1.1, delay: 0.25, ease: "easeOut" },
              })}
          className="relative overflow-hidden w-full aspect-[13/10] md:w-[55%] md:ml-auto md:self-center md:max-h-[78svh]"
        >
          <SplineScene
            scene={SCENE_HERO}
            className="w-full h-full"
            onLoad={onRobotLoaded}
            immediate
          />
        </motion.div>
      </div>
    </div>
  );
}
