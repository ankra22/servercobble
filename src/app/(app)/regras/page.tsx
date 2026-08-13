import type { Metadata } from "next";
import { FixedVideoBackground } from "@/components/video/FixedVideoBackground";
import { TONE_CLASSES, type Tone } from "@/lib/tone-classes";

export const metadata: Metadata = { title: "Regras" };

const RULES: Array<{ tone: Tone; title: string; text: string }> = [
  {
    tone: "rare",
    title: "Início simultâneo",
    text: "O servidor abre pra todo mundo no mesmo dia, 01 de dezembro. Nesse primeiro momento, todo treinador começa em Kanto e só pode capturar os Pokémon dessa região.",
  },
  {
    tone: "levelup",
    title: "Liberando a próxima região",
    text: "Kanto só libera a próxima região quando os primeiros dezesseis treinadores conseguirem vencer os oito ginásios, a Elite Four e o Campeão. Até isso acontecer, todo mundo continua jogando dentro de Kanto.",
  },
  {
    tone: "battle",
    title: "O campeonato de Kanto",
    text: "Esses dezesseis treinadores que chegarem lá primeiro competem entre si pra decidir quem se torna o Campeão de Kanto, e quem vencer essa disputa leva um prêmio de R$ 50.",
  },
];

export default function RegrasPage() {
  return (
    <>
      <FixedVideoBackground src="/regras-reel.mp4" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-border bg-bg/75 p-6 backdrop-blur-sm sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Regras</h1>
          <p className="mt-1.5 text-sm text-ink-dim">Como funciona a largada do servidor e a corrida por Kanto.</p>

          <div className="mt-8 space-y-4">
            {RULES.map((rule, i) => {
              const tone = TONE_CLASSES[rule.tone];
              return (
                <section key={rule.title} className={`rounded-2xl border ${tone.softBorder} bg-panel/70 p-6`}>
                  <p className={`font-data text-xs uppercase tracking-[0.3em] ${tone.text}`}>Regra {i + 1}</p>
                  <h2 className="mt-2 text-lg font-semibold text-ink">{rule.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-dim">{rule.text}</p>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
