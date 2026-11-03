"use client";

/**
 * SplineScene
 * ===========
 *
 * Wraps the @splinetool/react-spline Spline viewer with a
 * mount-ONCE policy:
 *
 *  - The heavy runtime + scene load the first time the container comes
 *    near the viewport (300px preload buffer) — then the component
 *    STAYS MOUNTED for the whole session. Scrolling away and back does
 *    not destroy or recreate the WebGL context, re-parse the scene, or
 *    reset the animation; the canvas is immediately as it was.
 *  - The scene file itself is cached by the service worker / HTTP
 *    cache, so even the very first mount after a reload reads from
 *    cache on repeat visits.
 *  - WebGL context loss (memory-constrained iPhones) remounts the
 *    viewer cleanly — the scene comes back from cache, not the network.
 *  - If the scene never loads (blocked, offline, WebGL unavailable) the
 *    spinner gives way to a quiet gradient after a bounded wait.
 */

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useOnScreen } from "@/components/ui/use-on-screen";

const Spline = lazy(() => import("@splinetool/react-spline"));

const LOAD_TIMEOUT_MS = 15000;

interface SplineSceneProps {
  scene: string;
  className?: string;
  /** Called once the Spline scene has finished loading. */
  onLoad?: () => void;
  /**
   * Mount immediately at hydration instead of waiting for the
   * container to approach the viewport. Used by the hero robot so the
   * loading screen can prepare it (runtime + scene + renderer) while
   * the visitor still sees the loader.
   */
  immediate?: boolean;
}

function Fallback({ quiet }: { quiet?: boolean }) {
  if (quiet) {
    return (
      <div
        className="w-full h-full"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 55%, rgba(168,85,247,0.10), transparent 70%)",
        }}
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center">
      <span className="loader"></span>
    </div>
  );
}

export function SplineScene({
  scene,
  className,
  onLoad,
  immediate = false,
}: SplineSceneProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  // Fires once when the container first approaches the viewport; the
  // viewer then stays mounted for the rest of the session.
  const nearViewport = useOnScreen(wrapRef, {
    rootMargin: "0px 0px 300px 0px",
    once: true,
  });
  const [mounted, setMounted] = useState(false);

  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  // Bumped on WebGL context loss to force a clean remount.
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    if (immediate || nearViewport) setMounted(true);
  }, [immediate, nearViewport]);

  useEffect(() => {
    if (!mounted || loaded) return;
    const t = window.setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [mounted, loaded]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onLost = (e: Event) => {
      e.preventDefault();
      setLoaded(false);
      setTimedOut(false);
      setGeneration((g) => g + 1);
    };
    // 'webglcontextlost' fires on the canvas and does not bubble.
    el.addEventListener("webglcontextlost", onLost, true);
    return () => el.removeEventListener("webglcontextlost", onLost, true);
  }, []);

  return (
    <div ref={wrapRef} className={className ?? "w-full h-full"}>
      {mounted && !timedOut ? (
        <Suspense fallback={<Fallback />}>
          <Spline
            key={generation}
            scene={scene}
            className="w-full h-full"
            onLoad={() => {
              setLoaded(true);
              onLoad?.();
            }}
          />
        </Suspense>
      ) : (
        <Fallback quiet={mounted} />
      )}
    </div>
  );
}
