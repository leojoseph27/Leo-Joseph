"use client";

/**
 * SplineScene
 * ===========
 *
 * Wraps the @splinetool/react-spline Spline viewer so it only renders on the
 * client AFTER hydration. The server and the client's first hydration render
 * both output the same fallback, which avoids React hydration mismatches
 * (the Spline lazy component otherwise SSRs a hidden <canvas> that differs
 * from the client's Suspense fallback). The real Spline scene loads on the
 * client once mounted.
 */

import { Suspense, lazy, useEffect, useState } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineSceneProps {
  scene: string;
  className?: string;
}

function Fallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <span className="loader"></span>
    </div>
  );
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  // Don't render the lazy Spline during SSR or the first client render —
  // both output <Fallback /> so hydration matches exactly. After mount we
  // swap to the real (lazy-loaded) Spline viewer.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Fallback />;
  }

  return (
    <Suspense fallback={<Fallback />}>
      <Spline scene={scene} className={className} />
    </Suspense>
  );
}
