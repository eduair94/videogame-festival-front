import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GameEvents - Discover Indie Game Festivals & Events",
  description: "Your ultimate guide to indie game festivals, showcases, awards, and Steam featuring opportunities. Never miss a submission deadline again.",
  keywords: ["indie games", "game festivals", "game awards", "steam sales", "game showcases", "indie developers"],
  openGraph: {
    title: "GameEvents - Discover Indie Game Festivals & Events",
    description: "Your ultimate guide to indie game festivals, showcases, awards, and Steam featuring opportunities.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950`}
      >
        {children}
      </body>
    </html>
  );
}
