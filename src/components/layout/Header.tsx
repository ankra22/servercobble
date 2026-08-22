"use client";

import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { RadarMark } from "@/components/icons/Radar";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/regras", label: "Regras" },
  { href: "/feed", label: "Feed" },
  { href: "/spawns-raros", label: "Spawns raros" },
  { href: "/trainers", label: "Treinadores" },
];

export function Header() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md supports-backdrop-blur:bg-bg/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/feed" className="group flex items-center gap-2.5">
          <RadarMark className="h-7 w-7 text-brand transition-transform duration-300 group-hover:rotate-45" />
          <span className="font-semibold tracking-tight text-ink">Cobblemon do Rafaum</span>
        </Link>

        <nav className="flex items-center gap-1 2xl:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-dim transition-colors hover:bg-panel hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isLoaded && (
            <>
              {isSignedIn ? (
                <UserButton />
              ) : (
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink-dim transition-colors hover:border-border-strong hover:text-ink"
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
