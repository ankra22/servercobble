"use client";

import { usePathname, useRouter } from "next/navigation";
import { LineSidebar } from "@/components/navigation/LineSidebar";

const SECTIONS = [
  { label: "Início", href: "/" },
  { label: "Regras", href: "/regras" },
  { label: "Feed", href: "/feed" },
  { label: "Treinadores", href: "/trainers" },
] as const;

function activeIndexFor(pathname: string): number | null {
  if (pathname.startsWith("/regras")) return 1;
  if (pathname.startsWith("/feed")) return 2;
  if (pathname.startsWith("/trainers")) return 3;
  if (pathname === "/") return 0;
  return null;
}

/**
 * Navegação das divisões (páginas) do site, em telas grandes, usando o
 * LineSidebar do react-bits. `key={pathname}` força remontagem a cada troca
 * de rota — o componente só aceita `defaultActive` como estado inicial, sem
 * isso ele não refletiria a página atual ao navegar pelo histórico do
 * navegador.
 */
export function SiteSectionNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <LineSidebar
      key={pathname}
      items={SECTIONS.map((section) => section.label)}
      accentColor="#2dd4bf"
      textColor="#9db3aa"
      markerColor="#63776e"
      showIndex
      showMarker
      proximityRadius={80}
      maxShift={16}
      falloff="smooth"
      markerLength={32}
      markerGap={0}
      tickScale={0.5}
      scaleTick
      itemGap={22}
      fontSize={0.9}
      smoothing={100}
      defaultActive={activeIndexFor(pathname)}
      onItemClick={(index) => {
        const section = SECTIONS[index];
        if (section && section.href !== pathname) router.push(section.href);
      }}
    />
  );
}
