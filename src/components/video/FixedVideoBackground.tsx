"use client";

import { useEffect, useRef } from "react";

/**
 * Vídeo fixo cobrindo a tela inteira, atrás do conteúdo da página. Pausa
 * sozinho quando o usuário pede menos animação.
 */
export function FixedVideoBackground({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // O atributo JSX `muted` nem sempre chega a tempo pro navegador liberar o
    // autoplay sem gesto do usuário — setar a propriedade via ref garante isso
    // antes do play(), senão a promise rejeita quieta e o vídeo trava no 1º frame.
    video.muted = true;
    video.defaultMuted = true;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      if (reducedMotionQuery.matches) video.pause();
      else video.play().catch((error) => console.warn("Não deu pra dar play no vídeo de fundo:", error));
    };

    sync();
    reducedMotionQuery.addEventListener("change", sync);
    return () => reducedMotionQuery.removeEventListener("change", sync);
  }, []);

  return (
    <video ref={videoRef} className="fixed-video-bg" src={src} autoPlay muted loop playsInline aria-hidden="true" />
  );
}
