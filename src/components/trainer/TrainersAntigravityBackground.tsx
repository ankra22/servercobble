"use client";

import { useEffect, useState } from "react";
import { Antigravity } from "@/components/trainer/antigravity/Antigravity";

/**
 * Fundo fixo só da listagem de treinadores — campo de partículas que foge
 * do cursor (mesmo padrão do FeedRadarBackground/RegionsWavesBackground,
 * exceto que aqui o mouse-tracking fica ligado de propósito: é o efeito
 * inteiro do componente). Não monta se o usuário pede menos animação.
 */
export function TrainersAntigravityBackground() {
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
    <div className="fixed inset-0 z-0 opacity-60" aria-hidden="true">
      <Antigravity
        count={300}
        magnetRadius={10}
        ringRadius={10}
        waveSpeed={0.4}
        waveAmplitude={1}
        particleSize={2}
        lerpSpeed={0.1}
        color="#7bffb0"
        autoAnimate={false}
        particleVariance={1}
        rotationSpeed={0}
        depthFactor={1}
        pulseSpeed={3}
        particleShape="capsule"
        fieldStrength={10}
      />
    </div>
  );
}
