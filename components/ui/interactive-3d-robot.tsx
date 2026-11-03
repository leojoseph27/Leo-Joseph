'use client';

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useOnScreen } from "@/components/ui/use-on-screen";

const Spline = lazy(() => import("@splinetool/react-spline"));

const LOAD_TIMEOUT_MS = 15000;

interface InteractiveRobotSplineProps {
  scene: string;
  className?: string;
}

/**
 * Same mount-ONCE policy as SplineScene: the viewer loads the first
 * time its container approaches the viewport, then stays mounted for
 * the whole browsing session — revisiting the section never recreates
 * the canvas, re-downloads the scene, or restarts the renderer.
 * Recovers from WebGL context loss; bounded wait if loading fails.
 */
export function InteractiveRobotSpline({
  scene,
  className,
}: InteractiveRobotSplineProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nearViewport = useOnScreen(wrapRef, {
    rootMargin: "0px 0px 300px 0px",
    once: true,
  });
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    if (nearViewport) setMounted(true);
  }, [nearViewport]);

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
    el.addEventListener("webglcontextlost", onLost, true);
    return () => el.removeEventListener("webglcontextlost", onLost, true);
  }, []);

  return (
    <div ref={wrapRef} className={className ?? "w-full h-full"}>
      {mounted && !timedOut ? (
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <span className="loader" />
            </div>
          }
        >
          <Spline
            key={generation}
            scene={scene}
            className="w-full h-full"
            onLoad={() => setLoaded(true)}
          />
        </Suspense>
      ) : (
        <div
          className="w-full h-full bg-gray-900"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 55%, rgba(168,85,247,0.10), transparent 70%)",
          }}
        />
      )}
    </div>
  );
}
