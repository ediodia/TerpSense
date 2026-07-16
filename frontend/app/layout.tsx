import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CursorGlow } from "@/components/ui/CursorGlow";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TerpSense — Stop bad decisions before they happen",
  description: "TerpSense catches risky purchases before checkout, grounds every insight in your real spending data, and turns saving money into something that feels like winning.",
  openGraph: {
    title: "TerpSense — Stop bad decisions before they happen",
    description: "TerpSense catches risky purchases before checkout, grounds every insight in your real spending data, and turns saving money into something that feels like winning.",
    images: ["/og-image.png"],
    url: "https://your-actual-vercel-url.vercel.app",
  },
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