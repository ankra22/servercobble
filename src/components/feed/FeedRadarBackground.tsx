"use client";

import { useEffect, useState } from "react";
import { Radar } from "@/components/feed/radar/Radar";

/**
 * Fundo fixo só da página do feed — varredura de radar em verde-fósforo,
 * atrás do conteúdo (mesmo padrão do `.fixed-video-bg` da landing). Não
 * monta se o usuário pede menos animação (o Radar não tem pausa própria,
 * é WebGL com requestAnimationFrame contínuo).
 */
export function FeedRadarBackground() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setEnabled(!query.matches);
    const sync = () => setEnabled(!query.matches);
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-40" aria-hidden="true">
      <Radar
        speed={1}
        scale={0.5}
        ringCount={10}
        spokeCount={10}
        ringThickness={0.05}
        spokeThickness={0.01}
        sweepSpeed={1}
        sweepWidth={2}
        sweepLobes={1}
        color="#7bffb0"
        backgroundColor="#000000"
        falloff={2}
        brightness={1}
        enableMouseInteraction={false}
        mouseInfluence={0.1}
      />
    </div>
  );
}
