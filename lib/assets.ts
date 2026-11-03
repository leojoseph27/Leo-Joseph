/**
 * Canonical URLs for heavy assets, shared between the components that
 * render them and the loader/prefetch system that prepares them.
 */

export const SCENE_HERO =
  "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";
export const SCENE_PUBLICATIONS =
  "https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode";

/** Mobile / desktop intro portraits (the loader preloads the active one). */
export const HERO_PORTRAIT_MOBILE = "/face/portrait-hero.webp";
export const HERO_PORTRAIT_DESKTOP = "/face/bg-wide.webp";

/** Priority-2 previews worth prefetching on fast connections. */
export const PREFETCH_IMAGES = [
  "/projects/derma.png",
  "/projects/cardioai.png",
  "/projects/mcq.png",
];
