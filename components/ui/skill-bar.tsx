"use client";

import { useEffect, useRef, useState } from "react";

export function SkillBar({ name, pct }: { name: string; pct: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const el = ref.current;
    if (!el) return;

    if (mq.matches) {
      setShown(true);
      return;
    }

    // Own IntersectionObserver + CSS transition — deliberately not
    // framer-motion's whileInView, which proved unreliable on some
    // mobile WebViews.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="py-2.5 md:py-3" ref={ref}>
      <h3 className="flex justify-between text-white text-sm md:text-lg font-normal pb-1">
        {name} <span aria-label={`${name} skill level`}>{pct}%</span>
      </h3>
      <div
        className="w-full h-3 md:h-4 bg-[#222] rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={name}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400"
          style={{
            width: shown ? `${pct}%` : "0%",
            transition: reduce
              ? "none"
              : "width 1.1s cubic-bezier(0.21, 0.65, 0.35, 1)",
          }}
        />
      </div>
    </div>
  );
}
