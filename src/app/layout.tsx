import type { Metadata } from "next";
import { IBM_Plex_Mono, Silkscreen, Rubik } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SiteSectionNav } from "@/components/navigation/SiteSectionNav";
import { ClickSpark } from "@/components/ClickSpark";

// Identidade "Pokédex de bolso": fonte de leitura — arredondada e quente, pra
// corpo e listas. Variável, sem weight fixo.
const body = Rubik({
  variable: "--font-body",
  subsets: ["latin"],
});

// Mono pra dados tabulares (contagens, horários, IVs, @username).
const data = IBM_Plex_Mono({
  variable: "--font-data",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Bitmap de verdade. Só em rótulos curtos: eyebrow, cabeçalho, chip, wordmark.
const pixel = Silkscreen({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: ["400", "700"],
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
    <html lang="pt-BR" className={`${body.variable} ${data.variable} ${pixel.variable} h-full`}>
      <body className="min-h-full antialiased">
        <ClerkProvider afterSignOutUrl="/feed">
          <ClickSpark sparkColor="#f2c12e" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
            <div className="fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 2xl:block">
              <SiteSectionNav />
            </div>
            {children}
          </ClickSpark>
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}
