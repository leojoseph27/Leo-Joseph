"use client";

import { useEffect } from "react";

/**
 * Registers the service worker in production only, after the page has
 * loaded so it never competes with critical resources. Browsers without
 * SW support (or in private modes where registration fails) simply skip
 * it — the site works identically without it.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // A service worker must never run against the development server:
    // it would serve stale build HTML against fresh dev JS and break
    // hydration. If one ever got registered on this origin (e.g. a
    // production build once ran on this port), remove it now.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => {
          for (const r of regs) r.unregister();
          if (regs.length && window.caches) {
            caches.keys().then((keys) => {
              for (const k of keys) caches.delete(k);
            });
          }
        })
        .catch(() => {});
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* private mode / disabled storage — non-fatal */
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
