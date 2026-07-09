import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CursorGlow } from "@/components/ui/CursorGlow";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TerpSense — Stop Bad Decisions Before They Happen",
  description: "An AI agent for real-time financial decision intervention.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen bg-[#09090b] text-zinc-100 antialiased font-sans">
        {/* Dynamic mouse gradient background */}
        <CursorGlow />
        
        {/* Main app content sitting above the background */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}