"use client";

/**
 * BootSequence
 * ============
 *
 * The original neural-network loading screen, now driven by REAL
 * resource readiness instead of a fixed timer:
 *
 *  1. Server-side, a black fullscreen shell renders AROUND the page
 *     content, so the first paint is always the loader — never a flash
 *     of unstyled portfolio.
 *  2. On the client, a tracker prepares the essential first-viewport
 *     resources and reports actual progress (no fake percentage):
 *       - app shell (this script running = critical JS is in)
 *       - fonts (document.fonts.ready, 2.5s cap)
 *       - the intro portrait for the current breakpoint (decoded)
 *       - service worker registration (non-fatal, 2.5s cap)
 *  3. When every essential settles (or its timeout passes), the loader
 *     fades out and the portfolio is revealed. A 5s hard cap guarantees
 *     the site always opens even if something stalls.
 *  4. After the reveal, background prefetching of priority-2 assets
 *     (robot scenes + first project previews) begins — respecting
 *     Save-Data and slow connections.
 *
 * Subsequent visits resolve the essentials almost instantly from the
 * service worker / HTTP cache, so the loader is brief when warm.
 */

import { useEffect, useRef, useState } from "react";
import { NeuralNetworkLoader } from "@/components/ui/neural-network-loader";
import { HERO_PORTRAIT_DESKTOP, HERO_PORTRAIT_MOBILE } from "@/lib/assets";

const FADE_MS = 500;
const MIN_DISPLAY_MS = 1000; // keep the neural animation legible
const HARD_CAP_MS = 5000; // never trap the visitor on the loader

// ---- Robot readiness signal ----
// The hero robot mounts immediately under the loader; its onLoad
// resolves this promise so the tracker reports real 3D readiness.
let robotResolve: (() => void) | null = null;
const robotReadyPromise = new Promise<void>((resolve) => {
  robotResolve = resolve;
});

interface Tracked {
  weight: number;
  done: boolean;
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<unknown> {
  return Promise.race([p, new Promise((r) => setTimeout(r, ms))]);
}

function preloadImage(url: string): Promise<unknown> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (typeof img.decode === "function") {
        img.decode().then(resolve, resolve);
      } else {
        resolve(null);
      }
    };
    img.onerror = resolve; // failed preload is non-fatal — page <img> has its own path
    img.src = url;
  });
}

async function prepareEssentials(
  onProgress: (fraction: number) => void
): Promise<void> {
  const items: Record<string, Tracked> = {
    shell: { weight: 15, done: false },
    fonts: { weight: 20, done: false },
    hero: { weight: 25, done: false },
    robot: { weight: 30, done: false },
    sw: { weight: 10, done: false },
  };
  const report = () => {
    const total = Object.values(items).reduce((s, i) => s + i.weight, 0);
    const done = Object.values(items).reduce(
      (s, i) => s + (i.done ? i.weight : 0),
      0
    );
    onProgress(done / total);
  };

  const settle = (key: string) => () => {
    if (!items[key].done) {
      items[key].done = true;
      report();
    }
  };

  // Critical JS is running — the app shell is ready.
  setTimeout(settle("shell"), 0);

  const portrait =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 900px)").matches
      ? HERO_PORTRAIT_MOBILE
      : HERO_PORTRAIT_DESKTOP;

  await Promise.all([
    withTimeout(document.fonts.ready, 2500).then(settle("fonts")),
    withTimeout(preloadImage(portrait), 3500).then(settle("hero")),
    // The hero Spline robot: runtime download + scene load + renderer
    // init happen under the loader (mounted immediately). Its onLoad
    // resolves here — capped so WebGL failures never hang the reveal.
    withTimeout(robotReadyPromise, 4500).then(settle("robot")),
    withTimeout(
      "serviceWorker" in navigator
        ? navigator.serviceWorker.register("/sw.js").catch(() => null)
        : Promise.resolve(null),
      2500
    ).then(settle("sw")),
  ]);
}

export function BootSequence({ children }: { children: React.ReactNode }) {
  const [booting, setBooting] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let revealTimer = 0;

    const reveal = () => {
      if (cancelled || finishedRef.current) return;
      finishedRef.current = true;
      setProgress(100);
      setFading(true);
      window.setTimeout(() => !cancelled && setBooting(false), FADE_MS);
    };

    prepareEssentials((fraction) => {
      if (!cancelled) setProgress(Math.round(fraction * 100));
    }).then(() => {
      if (cancelled) return;
      // Hold the minimum display only as long as still needed.
      revealTimer = window.setTimeout(reveal, MIN_DISPLAY_MS);
    });

    // Absolute guarantee: the site opens no matter what.
    const cap = window.setTimeout(reveal, HARD_CAP_MS);

    // Priority-2 prefetch begins once the visitor is in the site.
    import("@/components/ui/prefetch").then(({ startBackgroundPrefetch }) => {
      window.setTimeout(() => !cancelled && startBackgroundPrefetch(), 1200);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(revealTimer);
      window.clearTimeout(cap);
    };
  }, []);

  if (!booting) {
    return <>{children}</>;
  }

  return (
    <>
      <div aria-hidden style={{ visibility: "hidden" }}>
        {children}
      </div>
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9999,
          background: "#000000",
          opacity: fading ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease`,
          pointerEvents: fading ? "none" : "auto",
        }}
      >
        <NeuralNetworkLoader onDone={() => {}} targetProgress={progress} />
      </div>
    </>
  );
}

// Called by the hero robot's SplineScene onLoad: resolves the readiness
// promise the loading screen tracks. (Also kept compatible with any
// earlier listener-style callers.)
let robotReady = false;
const readyListeners = new Set<() => void>();
export function onRobotLoaded() {
  if (robotReady) return;
  robotReady = true;
  robotResolve?.();
  readyListeners.forEach((fn) => fn());
}
