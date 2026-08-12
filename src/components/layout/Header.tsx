import Link from "next/link";
import { RadarMark } from "@/components/icons/Radar";

const NAV_LINKS = [
  { href: "/", label: "Feed" },
  { href: "/trainers", label: "Treinadores" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md supports-backdrop-blur:bg-bg/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <RadarMark className="h-7 w-7 text-brand transition-transform duration-300 group-hover:rotate-45" />
          <span className="flex flex-col leading-none">
            <span className="font-semibold tracking-tight text-ink">Cobblemon Tracker</span>
            <span className="font-data text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              live server feed
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
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
      </div>
    </header>
  );
}
