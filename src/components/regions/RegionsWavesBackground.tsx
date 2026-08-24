"use client";

import { useEffect, useState } from "react";
import { GradientWaves } from "@/components/regions/waves/GradientWaves";

/**
 * Fundo fixo só da página de listagem de regiões — ondas em raymarching
 * (mesmo padrão do FeedRadarBackground). Não monta se o usuário pede menos
 * animação (WebGL com requestAnimationFrame contínuo).
 */
export function RegionsWavesBackground() {
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
    <div className="pointer-events-none fixed inset-0 z-0 opacity-50" aria-hidden="true">
      <GradientWaves
        horizonColor="#10bd0c"
        waveColor="#0a0aff"
        crestColor="#00df59"
        speed={0.4}
        amplitude={2.5}
        waveScale={0.6}
        waveRatio={0.9}
        swell={35}
        turbulence={20}
        tilt={1.11}
        zoom={1}
        height={5.5}
        fogDepth={15}
        detail="medium"
        brightness={1}
        opacity={1}
        grain
        grainIntensity={0.05}
        mouseInteraction={false}
        parallaxStrength={0.5}
      />
    </div>
  );
}
