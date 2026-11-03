/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Dev and production get SEPARATE output directories. Running
  // `next dev` while a production build/server uses `.next` used to
  // corrupt chunks ("Cannot find module './276.js'") and race the
  // webpack cache renames on Windows. With this split the two can
  // coexist safely. `next build` / `next start` still use `.next`
  // (Docker/HuggingFace behaviour unchanged); `next dev` uses
  // `.next-dev`.
  distDir: process.env.NODE_ENV === "production" ? ".next" : ".next-dev",
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [80, 96, 128, 160, 256, 384],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async headers() {
    const swrImage = "public, max-age=86400, stale-while-revalidate=604800";
    return [
      // HTML: always revalidate — never serve stale pages.
      {
        source: "/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
      // Hashed build output: immutable for a year.
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // Source images (not hashed): a day fresh, a week reusable while
      // revalidating — pairs with the service worker's SWR strategy.
      { source: "/face/:path*", headers: [{ key: "Cache-Control", value: swrImage }] },
      { source: "/projects/:path*", headers: [{ key: "Cache-Control", value: swrImage }] },
      { source: "/publications/:path*", headers: [{ key: "Cache-Control", value: swrImage }] },
      { source: "/effects/:path*", headers: [{ key: "Cache-Control", value: swrImage }] },
    ];
  },
};

export default nextConfig;
