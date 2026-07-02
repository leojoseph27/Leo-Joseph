import type { Metadata } from "next";
import "./globals.css";
import { Chatbot } from "@/components/ui/chatbot";
import { BootSequence } from "@/components/ui/boot-sequence";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Portfolio website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <BootSequence>{children}</BootSequence>
        <Chatbot />
      </body>
    </html>
  );
}
