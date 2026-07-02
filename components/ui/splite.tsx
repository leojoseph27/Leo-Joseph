"use client";

/**
 * SplineScene
 * ===========
 *
 * Wraps the @splinetool/react-spline Spline viewer so it only renders on the
 * client AFTER hydration (avoids React hydration mismatches). Calls
 * `onLoad()` once the Spline scene has finished loading, so the boot
 * sequence knows when the robot is ready to be revealed.
 */

import { Suspense, lazy, useEffect, useState } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineSceneProps {
  scene: string;
  className?: string;
  /** Called once the Spline scene has fully loaded. */
  onLoad?: () => void;
}

function Fallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <span className="loader"></span>
    </div>
  );
}

export function SplineScene({ scene, className, onLoad }: SplineSceneProps) {
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
      <Spline scene={scene} className={className} onLoad={onLoad} />
    </Suspense>
  );
}
