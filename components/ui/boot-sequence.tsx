"use client";

/**
 * BootSequence
 * ============
 *
 * Client wrapper that shows the NeuralNetworkLoader for the AI boot
 * sequence, then reveals the underlying page content. The loader runs once
 * per browser session (guarded by sessionStorage so navigating between
 * routes or doing a soft refresh doesn't replay it).
 *
 * Hydration safety
 * ----------------
 * The loader uses a <canvas> + requestAnimationFrame, which only exist in
 * the browser. To avoid SSR/client hydration mismatches we NEVER render the
 * loader during server rendering. `mounted` starts false (so the server and
 * the client's first render both output only {children}), then becomes true
 * in an effect, after which we decide whether to play the boot animation.
 */

import { useEffect, useState } from "react";
import { NeuralNetworkLoader } from "@/components/ui/neural-network-loader";

const STORAGE_KEY = "leo_boot_done";

export function BootSequence({ children }: { children: React.ReactNode }) {
  // Start unmounted. Server renders only {children}; client's first render
  // (hydration) also renders only {children} — identical HTML, no mismatch.
  const [mounted, setMounted] = useState(false);
  const [booting, setBooting] = useState(false);

  useEffect(() => {
    // Now we're on the client. Decide whether to play the boot animation.
    let alreadyDone = false;
    try {
      alreadyDone = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // sessionStorage may be unavailable (e.g. privacy mode) — play it.
    }
    setMounted(true);
    if (!alreadyDone) {
      setBooting(true);
    }
  }, []);

  const handleDone = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setBooting(false);
  };

  // Before mount (SSR + first client render): just the page.
  if (!mounted) {
    return <>{children}</>;
  }

  // Mounted and no boot needed: just the page.
  if (!booting) {
    return <>{children}</>;
  }

  // Playing the boot animation: render the site underneath (so the Spline
  // robot starts loading immediately) and overlay the loader on top.
  return (
    <>
      <div aria-hidden>{children}</div>
      <NeuralNetworkLoader onDone={handleDone} />
    </>
  );
}
