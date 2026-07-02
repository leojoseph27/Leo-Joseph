"use client";

/**
 * BootSequence
 * ============
 *
 * Guarantees the AI loading screen is the FIRST thing painted and that no
 * part of the homepage is ever visible before the loader fades out.
 *
 * How the flash is eliminated
 * ---------------------------
 *  1. Server-side, the loader's black fullscreen shell is rendered AROUND
 *     the page content with `position: fixed; inset: 0; z-index: 9999`.
 *     So the very first byte of HTML the browser receives already contains
 *     a black layer covering the whole viewport. The homepage is in the DOM
 *     (so it can load assets in the background) but it is visually covered.
 *  2. On the client, after hydration, the NeuralNetworkLoader mounts its
 *     canvas INSIDE that shell and plays the animation.
 *  3. The loader only disappears once BOTH conditions are met:
 *       (a) the minimum display time (3.5s) has elapsed, AND
 *       (b) the Spline robot has signalled it finished loading.
 *     If the robot takes longer than 3.5s, the loader stays until it's ready.
 *  4. The loader then fades out over 700ms, and only then does the homepage
 *     become visible — with the robot already loaded and waving.
 *
 * Session guard
 * -------------
 * The boot animation plays once per browser session (sessionStorage) so
 * soft refreshes / client-side navigations don't replay it.
 */

import { useEffect, useRef, useState } from "react";
import { NeuralNetworkLoader } from "@/components/ui/neural-network-loader";

const STORAGE_KEY = "leo_boot_done";
const MIN_DISPLAY_MS = 3500; // minimum time the loader stays visible
const FADE_MS = 700; // loader fade-out duration

// ---- Robot readiness signal ----
// The homepage's Spline robot calls markRobotReady() via the onRobotLoaded
// prop threaded through <BootSequence onRobotLoaded={...}> -> page -> hero.
let robotReady = false;
const readyListeners = new Set<() => void>();

function markRobotReady() {
  if (robotReady) return;
  robotReady = true;
  readyListeners.forEach((fn) => fn());
}

export function BootSequence({ children }: { children: React.ReactNode }) {
  // `booting` controls whether the loader overlay is shown. It starts TRUE
  // on the very first render (server + client) so the black shell is in the
  // initial HTML — no flash possible.
  const [booting, setBooting] = useState(true);
  // `clientReady` flips true once we're on the client and have confirmed we
  // should play the boot (not already played this session).
  const [clientReady, setClientReady] = useState(false);
  const [fading, setFading] = useState(false);

  const minTimerDone = useRef(false);
  const [robotDone, setRobotDone] = useState(false);
  const finishedRef = useRef(false);

  // On mount: decide whether to play the boot this session.
  useEffect(() => {
    let alreadyDone = false;
    try {
      alreadyDone = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // sessionStorage unavailable — play it.
    }
    if (alreadyDone) {
      // Skip the boot entirely; show the page immediately.
      setBooting(false);
      setClientReady(false);
      return;
    }
    setClientReady(true);

    // (a) minimum display timer
    const minTimer = window.setTimeout(() => {
      minTimerDone.current = true;
      maybeFinish();
    }, MIN_DISPLAY_MS);

    // (b) robot readiness listener
    const onReady = () => {
      setRobotDone(true);
      maybeFinish();
    };
    if (robotReady) {
      onReady();
    } else {
      readyListeners.add(onReady);
    }

    // (c) safety fallback: if the Spline robot never fires onLoad within
    //     12s (e.g. blocked, network error), treat it as ready so the
    //     loader never hangs forever. The min-display timer still applies.
    const safety = window.setTimeout(() => {
      markRobotReady();
    }, 12000);

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(safety);
      readyListeners.delete(onReady);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function maybeFinish() {
    if (finishedRef.current) return;
    if (!minTimerDone.current) return; // min display not elapsed yet
    if (!robotReady) return; // robot not loaded yet
    finishedRef.current = true;
    // Trigger the fade-out; after it completes, unmount the loader.
    setFading(true);
    window.setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      setBooting(false);
    }, FADE_MS);
  }

  // Re-check finish whenever robotDone flips.
  useEffect(() => {
    if (robotDone) maybeFinish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [robotDone]);

  // Not booting: page is visible, loader is gone.
  if (!booting) {
    return <>{children}</>;
  }

  // Booting: page is in the DOM (loading assets) but fully covered by the
  // loader shell. The shell is rendered on the server too, so the first
  // paint is black — never the homepage.
  return (
    <>
      <div
        aria-hidden
        style={{
          // Keep the page mounted underneath so assets (Spline robot, fonts,
          // images) load during the boot. But visually hide it completely.
          visibility: "hidden",
        }}
      >
        {children}
      </div>

      {/* Loader overlay — fixed, fullscreen, above everything. The black
          background is inline so it paints even before CSS loads. */}
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
        {clientReady && <NeuralNetworkLoader onDone={() => {}} />}
      </div>
    </>
  );
}

// Re-export so the page can wire the robot's onLoad to the boot signal.
export { markRobotReady as onRobotLoaded };
