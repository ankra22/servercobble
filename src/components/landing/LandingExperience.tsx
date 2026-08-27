"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronMark } from "@/components/icons/Chevron";
import { FixedVideoBackground } from "@/components/video/FixedVideoBackground";

const SECTION_NUMBERS = ["01", "02", "03", "04", "05"] as const;
const SECTION_COUNT = SECTION_NUMBERS.length;

function reveal(active: boolean, delay = "") {
  return `transition-all duration-700 ease-out ${delay} ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`;
}

/**
 * Landing na identidade 01 ("Pokédex de bolso"). Sequência de telas cheias com
 * scroll-snap: o hero é o vídeo (`FixedVideoBackground`) em tela cheia; as
 * seções 2–5 são a mesma tela com um véu LCD forte por cima (o vídeo continua
 * atrás, quase escondido — ver `.landing-section` no globals.css). Sem os 5
 * tons por seção: um acento só (amarelo de rota) e o número grande 01–05.
 */
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
    const clamped = Math.max(0, Math.min(SECTION_COUNT - 1, index));
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
      <div className="landing-veil" data-hero={active === 0 ? "true" : "false"} aria-hidden="true" />
      <ProgressDots active={active} onSelect={goTo} />

      {/* ---- 01 · Hero ---- */}
      <Section index={0} hero registerRef={registerSection} onNext={() => goTo(1)}>
        <div className="mx-auto flex h-full w-full max-w-3xl flex-col justify-center px-6">
          <div className="landing-hero-plate w-full max-w-[30rem]">
            <h1
              className={`${reveal(active === 0)} inline-block bg-route px-3 py-2 font-pixel text-[13px] leading-[1.45] text-route-ink shadow-[4px_4px_0_rgb(12_18_54/0.4)] sm:text-base`}
            >
              <span className="block">Cobblemon</span>
              <span className="block">do Rafaum</span>
            </h1>
            <p
              className={`${reveal(active === 0, "delay-150")} mt-5 font-pixel text-xl leading-[1.35] text-[#eef1e4] [text-shadow:2px_2px_0_rgb(0_0_0/0.5)] sm:text-2xl`}
            >
              Agora tá no ar.
            </p>
            <p
              className={`${reveal(active === 0, "delay-200")} mt-4 max-w-md text-balance font-body text-sm leading-relaxed text-[#e7eadb] sm:text-base`}
            >
              Chegou dezembro, todo mundo de férias e online ao mesmo tempo — é agora que a gente
              finalmente vai atrás daquele server de Pokémon que sempre ficou só na ideia.
            </p>
            <button
              type="button"
              onClick={() => goTo(1)}
              className={`${reveal(active === 0, "delay-300")} mt-8 inline-flex items-center gap-2 bg-route px-4 py-2.5 font-pixel text-[11px] uppercase tracking-wide text-route-ink shadow-[4px_4px_0_rgb(12_18_54/0.45)] transition-[transform,box-shadow] duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[1px_1px_0_rgb(12_18_54/0.45)] motion-reduce:transition-none`}
            >
              Começar
              <ChevronMark className="h-3.5 w-3.5 -rotate-90 [color:var(--color-ball)]" />
            </button>
          </div>
        </div>
      </Section>

      {/* ---- 02 · O Conceito ---- */}
      <Section index={1} registerRef={registerSection} onNext={() => goTo(2)}>
        <div className="mx-auto flex h-full w-full max-w-3xl flex-col justify-center px-6">
          <SectionHead active={active === 1} number="02" title="O Conceito" />
          <p className={`${reveal(active === 1, "delay-150")} mt-5 max-w-xl text-balance font-body text-base leading-relaxed text-lcd-ink sm:text-lg`}>
            A gente sempre comentou que devia rolar um server assim com a galera, e agora finalmente
            saiu do papel. O Cobblemon do Rafaum é o lugar onde todo mundo se encontra, não importa
            se você já manja de Pokémon de cor ou se nunca encostou num jogo desses, porque aqui cada
            um vai construir sua própria jornada enquanto divide o mesmo mundo, os mesmos ginásios e
            as mesmas histórias malucas que vão surgindo no meio do caminho.
          </p>
        </div>
      </Section>

      {/* ---- 03 · Como Funciona ---- */}
      <Section index={2} registerRef={registerSection} onNext={() => goTo(3)}>
        <div className="mx-auto grid h-full w-full max-w-4xl items-center gap-6 px-6 sm:grid-cols-[minmax(0,220px)_1fr] sm:gap-12">
          <SectionHead active={active === 2} number="03" title="Como Funciona" />
          <p className={`${reveal(active === 2, "delay-150")} text-balance font-body text-base leading-relaxed text-lcd-ink sm:text-lg`}>
            Ninguém vai ficar mandando em como você joga. Se você quiser sumir sozinho explorando até
            virar campeão da região, beleza, o jogo é seu. Se preferir chamar todo mundo pra encarar
            uma rota junto, também é só combinar. As regiões vão sendo liberadas aos poucos conforme o
            server avança, e cada uma que abre traz Pokémon novos, ginásio novo e mais motivo pra
            continuar jogando.
          </p>
        </div>
      </Section>

      {/* ---- 04 · Feed ao Vivo ---- */}
      <Section index={3} registerRef={registerSection} onNext={() => goTo(4)}>
        <div className="mx-auto grid h-full w-full max-w-5xl items-center gap-8 px-6 sm:grid-cols-2 sm:gap-14">
          <div className="order-2 sm:order-1">
            <SectionHead active={active === 3} number="04" title="Feed ao Vivo" />
            <p className={`${reveal(active === 3, "delay-150")} mt-5 text-balance font-body text-sm leading-relaxed text-lcd-ink sm:text-base`}>
              Enquanto você não tá online, pode ser que algum amigo seu esteja justamente encontrando
              aquele Pokémon raro que você também queria pra sua equipe. Por isso o site mostra tudo
              que acontece no server assim que acontece, seja um spawn raro, uma captura, um líder de
              ginásio derrotado ou até aquele shiny que ninguém esperava. Dá pra acompanhar sem
              perder o timing dos seus amigos, ou dos seus rivais.
            </p>
            <Link
              href="/feed"
              className={`${reveal(active === 3, "delay-300")} mt-5 inline-flex items-center gap-1.5 font-body text-sm font-semibold text-lcd-ink transition-colors hover:text-[#b9791a]`}
            >
              Ver o feed ao vivo
              <ChevronMark className="h-3.5 w-3.5 -rotate-90" />
            </Link>
          </div>

          <div className={`${reveal(active === 3, "delay-300")} order-1 border-2 border-lcd-edge bg-lcd-sunken p-3.5 sm:order-2`}>
            <p className="font-pixel text-[8px] uppercase tracking-wider text-lcd-dim">
              Feed &middot; prévia
            </p>
            <ul className="mt-2.5 space-y-1">
              <FeedPreviewRow color="#b9791a" size={8}>
                <span className="text-lcd-ink">Gible shiny</span> capturado por Rafaum
              </FeedPreviewRow>
              <FeedPreviewRow color="#2f6ea0" size={5}>
                Charizard subiu ao nível 42
              </FeedPreviewRow>
              <FeedPreviewRow color="var(--color-ball)" size={8}>
                <span className="text-lcd-ink">Larvitar</span> avistado em Volcanic
              </FeedPreviewRow>
            </ul>
            <p className="mt-2.5 font-body text-[11px] text-lcd-dim">
              exemplo — o de verdade fica em <span className="text-lcd-ink">/feed</span>
            </p>
          </div>
        </div>
      </Section>

      {/* ---- 05 · Como Entrar ---- */}
      <Section index={4} registerRef={registerSection}>
        <div className="mx-auto flex h-full w-full max-w-2xl flex-col justify-center px-6">
          <SectionHead active={active === 4} number="05" title="Como Entrar" />
          <p className={`${reveal(active === 4, "delay-150")} mt-5 max-w-xl text-balance font-body text-base leading-relaxed text-lcd-ink sm:text-lg`}>
            Não tem mistério nenhum pra começar a jogar. É só baixar o modpack que a gente montou em
            cima do Cobbleverse com algumas modificações nossas, seguir o tutorial de instalação que
            deixamos aqui no site e conectar direto no server. Em poucos minutos você já tá escolhendo
            seu starter e começando sua própria história.
          </p>
          <div className={`${reveal(active === 4, "delay-300")} mt-8 flex flex-col gap-3 sm:flex-row`}>
            <button
              type="button"
              title="Em breve"
              className="inline-flex items-center justify-center bg-route px-4 py-2.5 font-pixel text-[11px] uppercase tracking-wide text-route-ink shadow-[4px_4px_0_rgb(12_18_54/0.35)] transition-[transform,box-shadow] duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[1px_1px_0_rgb(12_18_54/0.35)] motion-reduce:transition-none"
            >
              Baixar Modpack
            </button>
            <button
              type="button"
              title="Em breve"
              className="inline-flex items-center justify-center border-2 border-lcd-edge px-4 py-2.5 font-pixel text-[11px] uppercase tracking-wide text-lcd-ink transition-colors hover:border-[color:var(--color-ball)]"
            >
              Ver Tutorial
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}

function SectionHead({ active, number, title }: { active: boolean; number: string; title: string }) {
  return (
    <div className={reveal(active)}>
      <span className="block font-pixel text-4xl leading-none text-[#9a6b12] [text-shadow:3px_3px_0_rgb(12_18_54/0.28)] sm:text-6xl">
        {number}
      </span>
      <h2 className="mt-3 border-b border-lcd-edge pb-2 font-pixel text-xs uppercase tracking-wider text-lcd-ink sm:text-sm">
        {title}
      </h2>
    </div>
  );
}

function FeedPreviewRow({ color, size, children }: { color: string; size: number; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2 font-body text-xs text-lcd-ink">
      <span aria-hidden="true" className="shrink-0" style={{ width: size, height: size, background: color }} />
      <span className="min-w-0 truncate">{children}</span>
      <time className="ml-auto shrink-0 text-[10px] tabular-nums text-lcd-dim">agora</time>
    </li>
  );
}

function Section({
  index,
  hero = false,
  registerRef,
  onNext,
  children,
}: {
  index: number;
  hero?: boolean;
  registerRef: (index: number, el: HTMLElement | null) => void;
  onNext?: () => void;
  children: ReactNode;
}) {
  return (
    <section
      ref={(el) => registerRef(index, el)}
      className="landing-section relative z-10 flex h-dvh w-full items-center justify-center"
    >
      <CornerFrame />
      {children}
      {onNext && (
        <button
          type="button"
          aria-label="Ir para a próxima seção"
          onClick={onNext}
          className={`absolute bottom-7 left-1/2 z-20 -translate-x-1/2 transition-colors ${
            hero ? "text-white/60 hover:text-white/90" : "text-lcd-dim hover:text-lcd-ink"
          }`}
        >
          <ChevronMark className="h-5 w-5 animate-hint-bounce" />
        </button>
      )}
    </section>
  );
}

function CornerFrame() {
  const base = "pointer-events-none absolute z-[2] h-6 w-6 opacity-40 [color:var(--color-route)] sm:h-8 sm:w-8";
  return (
    <>
      <span className={`${base} left-4 top-4 border-l-2 border-t-2 border-current sm:left-8 sm:top-8`} />
      <span className={`${base} right-4 top-4 border-r-2 border-t-2 border-current sm:right-8 sm:top-8`} />
      <span className={`${base} bottom-4 left-4 border-b-2 border-l-2 border-current sm:bottom-8 sm:left-8`} />
      <span className={`${base} bottom-4 right-4 border-b-2 border-r-2 border-current sm:bottom-8 sm:right-8`} />
    </>
  );
}

function ProgressDots({ active, onSelect }: { active: number; onSelect: (index: number) => void }) {
  const onDark = active === 0;
  return (
    <nav
      aria-label="Progresso da landing"
      className="fixed right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-3 sm:right-6"
    >
      {SECTION_NUMBERS.map((number, index) => (
        <button
          key={number}
          type="button"
          aria-label={`Ir para a seção ${index + 1}`}
          aria-current={active === index ? "true" : undefined}
          onClick={() => onSelect(index)}
          className="group flex h-6 w-6 items-center justify-center"
        >
          <span
            className={`transition-all ${
              active === index
                ? "h-2.5 w-2.5 bg-route"
                : `h-1.5 w-1.5 ${onDark ? "bg-white/35 group-hover:bg-white/60" : "bg-lcd-edge/35 group-hover:bg-lcd-edge/60"}`
            }`}
          />
        </button>
      ))}
    </nav>
  );
}
