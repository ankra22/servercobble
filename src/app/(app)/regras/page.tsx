import type { Metadata } from "next";
import { FixedVideoBackground } from "@/components/video/FixedVideoBackground";

export const metadata: Metadata = { title: "Regras" };

const RULES: Array<{ title: string; text: string }> = [
  {
    title: "Início simultâneo",
    text: "O servidor abre pra todo mundo no mesmo dia, 01 de dezembro. Nesse primeiro momento, todo treinador começa em Kanto e só pode capturar os Pokémon dessa região.",
  },
  {
    title: "Liberando a próxima região",
    text: "Kanto só libera a próxima região quando os primeiros dezesseis treinadores conseguirem vencer os oito ginásios, a Elite Four e o Campeão. Até isso acontecer, todo mundo continua jogando dentro de Kanto.",
  },
  {
    title: "O campeonato de Kanto",
    text: "Esses dezesseis treinadores que chegarem lá primeiro competem entre si pra decidir quem se torna o Campeão de Kanto, e quem vencer essa disputa leva um prêmio de R$ 50.",
  },
];

export default function RegrasPage() {
  return (
    <div className="relative min-h-full">
      <FixedVideoBackground src="/regras-reel.mp4" />
      {/* Scrim marinho sobre o vídeo pra tela ler — o card é opaco de qualquer jeito. */}
      <div className="pointer-events-none fixed inset-0 z-[1] bg-nv/70" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="t01-screen p-6 sm:p-8">
          <h1 className="font-pixel text-lg text-route sm:text-xl">Regras</h1>
          <p className="mt-2 font-body text-sm text-lcd-dim">
            Como funciona a largada do servidor e a corrida por Kanto.
          </p>

          <div className="mt-8 space-y-3">
            {RULES.map((rule, i) => (
              <section key={rule.title} className="border border-lcd-edge bg-lcd-sunken p-5">
                <p className="font-pixel text-[9px] uppercase tracking-[0.2em] text-[#9a6b12]">
                  Regra {i + 1}
                </p>
                <h2 className="mt-2 font-body text-lg font-semibold text-lcd-ink">{rule.title}</h2>
                <p className="mt-2 font-body text-sm leading-relaxed text-lcd-dim">{rule.text}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
