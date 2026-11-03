import type { Metadata, Viewport } from "next";
import { Bodoni_Moda } from "next/font/google";
import "./globals.css";
import { Chatbot } from "@/components/ui/chatbot";
import { BootSequence } from "@/components/ui/boot-sequence";
import { ServiceWorkerRegistrar } from "@/components/ui/sw-registrar";

// Self-hosted at build time: no render-blocking request to Google Fonts
// and one fewer DNS+TLS handshake on real networks.
const bodoni = Bodoni_Moda({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Leo Joseph — AI & Full-Stack Developer",
  description:
    "Portfolio of Leo Joseph, a Computer Science engineer and full-stack developer building AI-driven web applications and data-driven systems.",
  openGraph: {
    title: "Leo Joseph — AI & Full-Stack Developer",
    description:
      "AI developer, ML engineer and full-stack developer. Projects, publications and contact.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  // Lets us pad against the iPhone notch / home indicator.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${bodoni.variable}`}>
      <head>
        {/* Spline scenes pull assets from a remote CDN — warm up the
            connection early. */}
        <link rel="preconnect" href="https://prod.spline.design" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <BootSequence>{children}</BootSequence>
        <Chatbot />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
