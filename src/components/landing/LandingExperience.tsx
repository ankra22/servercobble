"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { ChevronMark } from "@/components/icons/Chevron";
import { FixedVideoBackground } from "@/components/video/FixedVideoBackground";
import { TONE_CLASSES, type Tone } from "@/lib/tone-classes";

interface SectionData {
  tone: Tone;
  number: string;
}

const SECTIONS: SectionData[] = [
  { tone: "brand", number: "01" },
  { tone: "evolution", number: "02" },
  { tone: "capture", number: "03" },
  { tone: "levelup", number: "04" },
  { tone: "rare", number: "05" },
];

/** Custom property `--glow`, consumida por `.landing-section` no globals.css. */
function glowStyle(tone: Tone): CSSProperties {
  return { "--glow": `var(--color-${tone})` } as CSSProperties;
}

function reveal(active: boolean, delay = "") {
  return `transition-all duration-700 ease-out ${delay} ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`;
}

export function LandingExperience() {
  const shellRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!mostVisible) return;
        const index = sectionRefs.current.indexOf(mostVisible.target as HTMLElement);
        if (index !== -1) setActive(index);
      },
      { root: shell, threshold: [0.5, 0.75] },
    );

    sectionRefs.current.forEach((section) => section && observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(SECTIONS.length - 1, index));
    sectionRefs.current[clamped]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const registerSection = useCallback((index: number, el: HTMLElement | null) => {
    sectionRefs.current[index] = el;
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        goTo(active + 1);
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        goTo(active - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, goTo]);

  return (
    <div ref={shellRef} className="landing-shell relative">
      <FixedVideoBackground src="/hero-reel.mp4" />
      <ProgressDots active={active} onSelect={goTo} />

      <Section index={0} registerRef={registerSection} onNext={() => goTo(1)}>
        <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-6 text-center">
          <h1
            className={`${reveal(active === 0)} landing-hero-title text-[13vw] font-bold uppercase leading-[0.95] tracking-tight text-black sm:text-6xl md:text-7xl`}
          >
            <span className="block">Cobblemon</span>
            <span className="block">do Rafaum</span>
          </h1>
          <p className={`${reveal(active === 0, "delay-200")} mt-6 max-w-xl text-balance text-base text-ink-dim sm:text-lg`}>
            Chegou dezembro, todo mundo de férias e online ao mesmo tempo, então é agora que a gente finalmente vai
            atrás daquele server de Pokémon que sempre ficou só na ideia.
          </p>
          <button
            type="button"
            onClick={() => goTo(1)}
            className={`${reveal(active === 0, "delay-300")} mt-10 flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.03] active:scale-[0.98]`}
          >
            Começar
            <ChevronMark className="h-4 w-4 -rotate-90" />
          </button>
        </div>
      </Section>

      <Section index={1} registerRef={registerSection} onNext={() => goTo(2)}>
        <div className="mx-auto flex h-full max-w-3xl flex-col justify-center px-6">
          <h2 className={`${reveal(active === 1)} text-2xl font-semibold tracking-tight text-evolution sm:text-3xl`}>
            O Conceito
          </h2>
          <p className={`${reveal(active === 1, "delay-150")} mt-5 text-balance text-lg leading-relaxed text-ink-dim sm:text-xl`}>
            A gente sempre comentou que devia rolar um server assim com a galera, e agora finalmente saiu do papel. O
            Cobblemon do Rafaum é o lugar onde todo mundo se encontra, não importa se você já manja de Pokémon de cor
            ou se nunca encostou num jogo desses, porque aqui cada um vai construir sua própria jornada enquanto
            divide o mesmo mundo, os mesmos ginásios e as mesmas histórias malucas que vão surgindo no meio do
            caminho.
          </p>
        </div>
      </Section>

      <Section index={2} registerRef={registerSection} onNext={() => goTo(3)}>
        <div className="mx-auto grid h-full max-w-4xl items-center gap-6 px-6 sm:grid-cols-[minmax(0,220px)_1fr] sm:gap-12">
          <h2 className={`${reveal(active === 2)} text-2xl font-semibold tracking-tight text-capture sm:text-3xl`}>
            Como Funciona
          </h2>
          <p className={`${reveal(active === 2, "delay-150")} text-balance text-lg leading-relaxed text-ink-dim sm:text-xl`}>
            Ninguém vai ficar mandando em como você joga. Se você quiser sumir sozinho explorando até virar campeão
            da região, beleza, o jogo é seu. Se preferir chamar todo mundo pra encarar uma rota junto, também é só
            combinar. As regiões vão sendo liberadas aos poucos conforme o server avança, e cada uma que abre traz
            Pokémon novos, ginásio novo e mais motivo pra continuar jogando.
          </p>
        </div>
      </Section>

      <Section index={3} registerRef={registerSection} onNext={() => goTo(4)}>
        <div className="mx-auto grid h-full max-w-5xl items-center gap-8 px-6 sm:grid-cols-2 sm:gap-14">
          <div className="order-2 sm:order-1">
            <h2 className={`${reveal(active === 3)} text-2xl font-semibold tracking-tight text-levelup sm:text-3xl`}>
              Feed ao Vivo
            </h2>
            <p className={`${reveal(active === 3, "delay-150")} mt-5 text-balance text-base leading-relaxed text-ink-dim sm:text-lg`}>
              Enquanto você não tá online, pode ser que algum amigo seu esteja justamente encontrando aquele Pokémon
              raro que você também queria pra sua equipe. Por isso o site mostra tudo que acontece no server assim
              que acontece, seja um spawn raro, uma captura, um líder de ginásio derrotado ou até aquele shiny que
              ninguém esperava. Dá pra acompanhar tudo sem perder o timing dos seus amigos, ou dos seus rivais.
            </p>
            <Link
              href="/feed"
              className={`${reveal(active === 3, "delay-300")} mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-levelup transition-colors hover:text-ink`}
            >
              Ver o feed ao vivo
              <ChevronMark className="h-3.5 w-3.5 -rotate-90" />
            </Link>
          </div>

          <div
            className={`${reveal(active === 3, "delay-300")} order-1 flex min-h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border-strong bg-panel/40 p-8 text-center sm:order-2 sm:min-h-80`}
          >
            <p className="font-data text-xs uppercase tracking-[0.3em] text-ink-faint">feed_preview</p>
            <p className="mt-2 max-w-xs text-sm text-ink-faint">
              Em breve, aqui entra o preview ao vivo do feed puxando direto do Supabase.
            </p>
          </div>
        </div>
      </Section>

      <Section index={4} registerRef={registerSection}>
        <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-6 text-center">
          <h2 className={`${reveal(active === 4)} text-2xl font-semibold tracking-tight text-rare sm:text-3xl`}>
            Como Entrar
          </h2>
          <p className={`${reveal(active === 4, "delay-150")} mt-5 text-balance text-lg leading-relaxed text-ink-dim sm:text-xl`}>
            Não tem mistério nenhum pra começar a jogar. É só baixar o modpack que a gente montou em cima do
            Cobbleverse com algumas modificações nossas, seguir o tutorial de instalação que deixamos aqui no site e
            conectar direto no server. Em poucos minutos você já tá escolhendo seu starter e começando sua própria
            história.
          </p>
          <div className={`${reveal(active === 4, "delay-300")} mt-9 flex flex-col gap-3 sm:flex-row`}>
            <button
              type="button"
              title="Em breve"
              className="rounded-full bg-rare px-7 py-3 text-sm font-semibold text-bg transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Baixar Modpack
            </button>
            <button
              type="button"
              title="Em breve"
              className="rounded-full border border-border-strong px-7 py-3 text-sm font-semibold text-ink transition-colors hover:border-rare/40 hover:text-rare"
            >
              Ver Tutorial de Instalação
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({
  index,
  registerRef,
  onNext,
  children,
}: {
  index: number;
  registerRef: (index: number, el: HTMLElement | null) => void;
  onNext?: () => void;
  children: ReactNode;
}) {
  const { tone } = SECTIONS[index]!;
  return (
    <section
      ref={(el) => registerRef(index, el)}
      style={glowStyle(tone)}
      className="landing-section relative z-10 flex h-dvh w-full items-center justify-center"
    >
      <CornerFrame tone={tone} />
      {children}
      {onNext && (
        <button
          type="button"
          aria-label="Ir para a próxima seção"
          onClick={onNext}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 text-ink-faint transition-colors hover:text-ink"
        >
          <ChevronMark className="h-5 w-5 animate-hint-bounce" />
        </button>
      )}
    </section>
  );
}

function CornerFrame({ tone }: { tone: Tone }) {
  const color = TONE_CLASSES[tone].text;
  const base = "pointer-events-none absolute h-6 w-6 opacity-25 sm:h-8 sm:w-8";
  return (
    <>
      <span className={`${base} left-4 top-4 border-l border-t border-current sm:left-8 sm:top-8 ${color}`} />
      <span className={`${base} right-4 top-4 border-r border-t border-current sm:right-8 sm:top-8 ${color}`} />
      <span className={`${base} bottom-4 left-4 border-b border-l border-current sm:bottom-8 sm:left-8 ${color}`} />
      <span className={`${base} bottom-4 right-4 border-b border-r border-current sm:bottom-8 sm:right-8 ${color}`} />
    </>
  );
}

function ProgressDots({ active, onSelect }: { active: number; onSelect: (index: number) => void }) {
  return (
    <nav
      aria-label="Progresso da landing"
      className="fixed right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-3 sm:right-6"
    >
      {SECTIONS.map((section, index) => (
        <button
          key={section.number}
          type="button"
          aria-label={`Ir para a seção ${index + 1}`}
          aria-current={active === index ? "true" : undefined}
          onClick={() => onSelect(index)}
          className="group flex h-6 w-6 items-center justify-center"
        >
          <span
            className={`rounded-full transition-all ${
              active === index ? `h-2.5 w-2.5 ${TONE_CLASSES[section.tone].dot}` : "h-1.5 w-1.5 bg-ink-faint group-hover:bg-ink-dim"
            }`}
          />
        </button>
      ))}
    </nav>
  );
}
