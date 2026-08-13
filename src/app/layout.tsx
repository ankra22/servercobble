import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteSectionNav } from "@/components/navigation/SiteSectionNav";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="pt-BR" className={`${display.variable} ${data.variable} h-full`}>
      <body className="min-h-full antialiased">
        <div className="fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 2xl:block">
          <SiteSectionNav />
        </div>
        {children}
      </body>
    </html>
  );
}
