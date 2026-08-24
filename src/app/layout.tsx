import type { Metadata } from "next";
import { VT323, Press_Start_2P, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SiteSectionNav } from "@/components/navigation/SiteSectionNav";

const display = VT323({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
});

const pixel = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: ["400"],
});

const data = JetBrains_Mono({
  variable: "--font-data",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Cobblemon Tracker",
    template: "%s · Cobblemon Tracker",
  },
  description:
    "Acompanhe em tempo real capturas, shinies, evoluções e batalhas de ginásio do servidor.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${pixel.variable} ${data.variable} h-full`}>
      <body className="min-h-full antialiased">
        <ClerkProvider afterSignOutUrl="/feed">
          <div className="fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 2xl:block">
            <SiteSectionNav />
          </div>
          {children}
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}
