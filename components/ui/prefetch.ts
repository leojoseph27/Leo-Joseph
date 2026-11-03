"use client";

/**
 * Priority-2 background prefetching, started by the boot sequence after
 * the portfolio is revealed. Uses <link rel="prefetch"> so the browser
 * schedules it at lowest priority, and skips entirely on Save-Data or
 * 2g-class connections. The service worker (when active) stores the
 * results for repeat visits.
 */

import { SCENE_PUBLICATIONS, PREFETCH_IMAGES } from "@/lib/assets";

let started = false;

type ConnectionInfo = {
  saveData?: boolean;
  effectiveType?: string;
};

export function startBackgroundPrefetch() {
  if (started || typeof document === "undefined") return;
  started = true;

  const conn = (navigator as Navigator & { connection?: ConnectionInfo })
    .connection;
  if (conn?.saveData) return; // respect data-saver
  const et = conn?.effectiveType || "";
  if (et.includes("2g")) return; // too slow to waste data on

  const idle: (cb: () => void) => void =
    typeof window.requestIdleCallback === "function"
      ? (cb) => window.requestIdleCallback(cb, { timeout: 4000 })
      : (cb) => window.setTimeout(cb, 2000);

  idle(() => {
    const head = document.head;
    const add = (url: string, as: string) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = as;
      link.href = url;
      head.appendChild(link);
    };
    // Publications robot scene — the hero scene is already prepared by
    // the boot loader.
    add(SCENE_PUBLICATIONS, "fetch");
    // First project previews for the carousel.
    for (const src of PREFETCH_IMAGES) add(src, "image");
  });
}
