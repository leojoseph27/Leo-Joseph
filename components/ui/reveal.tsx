"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useOnScreen } from "@/components/ui/use-on-screen";

interface RevealProps {
  children: ReactNode;
  /** Pixels of upward travel. */
  y?: number;
  delay?: number;
  className?: string;
  once?: boolean;
}

/**
 * Fade + rise entrance triggered when the element scrolls into view.
 *
 * Uses a native IntersectionObserver (not framer-motion's whileInView,
 * which never fired for some mobile Safari users, leaving whole
 * sections invisible) plus two guarantees:
 *  - reduced-motion users get plain content immediately
 *  - a 6s safety timer force-reveals, so content can never stay blank
 */
export function Reveal({
  children,
  y = 28,
  delay = 0,
  className,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(ref, { threshold: 0.12, once });
  const [reduce, setReduce] = useState(false);
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);

    // Safety net: whatever happens with IO on any browser, the content
    // becomes visible.
    const t = window.setTimeout(() => setForceShow(true), 6000);
    return () => window.clearTimeout(t);
  }, []);

  const show = reduce || forceShow || onScreen;

  return (
    <div
      ref={ref}
      className={className}
      style={
        reduce
          ? undefined
          : {
              opacity: show ? 1 : 0,
              transform: show ? "none" : `translateY(${y}px)`,
              filter: show ? "blur(0px)" : "blur(6px)",
              transition: show
                ? `opacity 0.7s cubic-bezier(0.21,0.65,0.35,1) ${delay}s, transform 0.7s cubic-bezier(0.21,0.65,0.35,1) ${delay}s, filter 0.7s cubic-bezier(0.21,0.65,0.35,1) ${delay}s`
                : "none",
            }
      }
    >
      {children}
    </div>
  );
}
