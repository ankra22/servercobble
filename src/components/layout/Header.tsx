"use client";

import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { RadarMark } from "@/components/icons/Radar";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/regras", label: "Regras" },
  { href: "/feed", label: "Feed" },
  { href: "/dex", label: "Dex" },
  { href: "/regioes", label: "Regiões" },
  { href: "/trainers", label: "Treinadores" },
];

/**
 * Barra do site na identidade 01 ("Pokédex de bolso"): carcaça marinho,
 * wordmark em bitmap, nav em Rubik. Aparece nas páginas dentro de (app) —
 * a landing tem chrome próprio.
 */
export function Header() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-40 border-b border-nv-line bg-nv-deep/85 backdrop-blur-md supports-backdrop-blur:bg-nv-deep/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/feed" className="group flex shrink-0 items-center gap-2.5">
          <RadarMark className="h-7 w-7 text-route transition-transform duration-300 group-hover:rotate-45" />
          <span className="font-pixel text-[11px] leading-none tracking-tight text-lcd">
            Cobblemon <span className="text-route">do Rafaum</span>
          </span>
        </Link>

        <nav className="flex min-w-0 items-center gap-0.5 overflow-x-auto 2xl:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 px-2.5 py-2 font-body text-sm text-lcd/60 transition-colors hover:bg-nv-line/40 hover:text-lcd"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {isLoaded && (
            <>
              {isSignedIn ? (
                <UserButton />
              ) : (
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="border border-nv-line px-3 py-1.5 font-body text-sm text-lcd/80 transition-colors hover:border-route/50 hover:text-lcd"
                  >
                    Entrar
                  </button>
                </SignInButton>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
