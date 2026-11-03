"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Native IntersectionObserver visibility hook.
 *
 * Deliberately avoids framer-motion's useInView/whileInView viewport
 * tracking, which proved unreliable on some mobile Safari builds —
 * sections gated behind it never appeared. IntersectionObserver itself
 * is a browser primitive with universal support.
 */
export function useOnScreen<T extends Element>(
  ref: React.RefObject<T | null>,
  {
    rootMargin,
    threshold = 0,
    once = false,
  }: { rootMargin?: string; threshold?: number; once?: boolean } = {}
) {
  const [onScreen, setOnScreen] = useState(false);
  const onceRef = useRef(once);
  onceRef.current = once;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Already-visible elements (or IO failure) still resolve via the
    // fallback timer below.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOnScreen(true);
          if (onceRef.current) io.disconnect();
        } else if (!onceRef.current) {
          setOnScreen(false);
        }
      },
      { rootMargin, threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold]);

  return onScreen;
}
