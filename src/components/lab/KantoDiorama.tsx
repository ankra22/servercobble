"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createKantoDiorama } from "@/lib/lab/kanto-scene";

gsap.registerPlugin(ScrollTrigger);

/**
 * PÁGINA DE TESTE — não é parte do site. Serve pra medir se a ideia de trocar
 * a landing por cenários voxel navegáveis no scroll é viável:
 *
 *  - three.js puro (sem react-three-fiber) pra ver o piso real de peso;
 *  - render sob demanda: 0 rAF, 0% GPU com a página parada;
 *  - câmera coreografada em 4 momentos via GSAP ScrollTrigger;
 *  - HUD com draw calls / triângulos / FPS pra abrir no celular.
 */

interface Beat {
  px: number; py: number; pz: number;
  tx: number; ty: number; tz: number;
}

const BEATS: Beat[] = [
  { px: 30, py: 20, pz: -34, tx: -1, ty: 7, tz: 9 }, // visão geral
  { px: 0, py: 4.5, pz: -12, tx: 0, ty: 3.5, tz: 6 }, // entrada do Centro
  { px: 26, py: 8, pz: -7, tx: 15, ty: 4.5, tz: 1 }, // poste de placas
  { px: -28, py: 16, pz: -30, tx: -4, ty: 7, tz: 8 }, // recuo
];

const PANELS = [
  {
    eyebrow: "REGIÃO 01",
    title: "Kanto",
    body: "Todo mundo começa aqui. Escolhe o starter em Viridian, cura no Centro Pokémon e cai na estrada.",
  },
  {
    eyebrow: "SEM PRESSA",
    title: "Cure, salve, siga",
    body: "O Centro Pokémon é o ponto de encontro. Time curado, história salva — e ninguém manda em como você joga.",
  },
  {
    eyebrow: "O MAPA ABRE AOS POUCOS",
    title: "Route 2, Viridian Forest, Pewter…",
    body: "Cada rota liberada traz Pokémon novo e um ginásio a mais. A região inteira só abre quando alguém vence o campeão.",
  },
  {
    eyebrow: "E DEPOIS?",
    title: "Johto vem em seguida",
    body: "Quatro regiões, uma de cada vez. Kanto é só o começo.",
  },
];

export function KantoDiorama() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);

  const hudCalls = useRef<HTMLSpanElement>(null);
  const hudTris = useRef<HTMLSpanElement>(null);
  const hudFps = useRef<HTMLSpanElement>(null);

  const spinningRef = useRef(false);
  const [spinning, setSpinning] = useState(false);
  const [stats, setStats] = useState<{ blocks: number; dpr: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const holder = holderRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !holder || !wrap) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- renderer / cena / luz --------------------------------------------
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(holder.clientWidth, holder.clientHeight, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setClearColor(0x8ec7ea);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x9ecde8, 70, 220);

    const camera = new THREE.PerspectiveCamera(
      48,
      holder.clientWidth / holder.clientHeight,
      0.1,
      600,
    );

    const hemi = new THREE.HemisphereLight(0xbfe0ff, 0x5a6a44, 1.5);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff1d6, 2.5);
    sun.position.set(24, 46, -26);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 170;
    const d = 54;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.bias = -0.0004;
    sun.target.position.set(0, 4, 10);
    scene.add(sun, sun.target);

    for (const lx of [-4, 4]) {
      const lamp = new THREE.PointLight(0xffcf95, 16, 22, 1.8);
      lamp.position.set(lx, 5, 2);
      scene.add(lamp);
    }

    const diorama = createKantoDiorama();
    scene.add(diorama.group);
    setStats({
      blocks: diorama.stats.solid + diorama.stats.glass + diorama.stats.clouds,
      dpr,
    });

    // ---- render sob demanda ----------------------------------------------
    const cam = { ...BEATS[0] };
    const applyCam = () => {
      camera.position.set(cam.px, cam.py, cam.pz);
      camera.lookAt(cam.tx, cam.ty, cam.tz);
      requestRender();
    };

    let rafId = 0;
    let needsRender = true;
    let spinAngle = Math.PI * 1.15;
    let lastT = performance.now();
    const fpsRing: number[] = [];

    const updateHud = () => {
      if (hudCalls.current) hudCalls.current.textContent = String(renderer.info.render.calls);
      if (hudTris.current) {
        hudTris.current.textContent = (renderer.info.render.triangles / 1000).toFixed(1) + "k";
      }
      if (hudFps.current) {
        hudFps.current.textContent = fpsRing.length
          ? String(Math.round(fpsRing.reduce((a, b) => a + b, 0) / fpsRing.length))
          : "—";
      }
    };

    const frame = (now: number) => {
      rafId = 0;
      const dt = Math.min(now - lastT, 100);
      lastT = now;

      if (spinningRef.current) {
        spinAngle += dt * 0.00035;
        const r = 36;
        camera.position.set(-1 + Math.cos(spinAngle) * r, 15, 9 + Math.sin(spinAngle) * r);
        camera.lookAt(-1, 6, 9);
        needsRender = true;
      }

      if (needsRender) {
        needsRender = false;
        renderer.render(scene, camera);
        if (dt > 0) {
          fpsRing.push(1000 / dt);
          if (fpsRing.length > 40) fpsRing.shift();
        }
        updateHud();
      }

      if (spinningRef.current || needsRender) rafId = requestAnimationFrame(frame);
    };

    function requestRender() {
      needsRender = true;
      if (!rafId) {
        lastT = performance.now();
        rafId = requestAnimationFrame(frame);
      }
    }

    (canvas as HTMLCanvasElement & { __spin?: () => void }).__spin = () => requestRender();

    // ---- coreografia de scroll -----------------------------------------
    const ctx = gsap.context(() => {
      const p = panelRefs.current.filter((el): el is HTMLDivElement => el !== null);
      if (p.length < PANELS.length) return;

      gsap.set(p.slice(1), { autoAlpha: 0, yPercent: 35 });
      gsap.set(p[0], { autoAlpha: 1, yPercent: 0 });

      if (reduce) {
        // Sem movimento contínuo: cada trecho do scroll salta pro próximo
        // momento e troca o texto na hora.
        BEATS.forEach((beat, i) => {
          ScrollTrigger.create({
            trigger: wrap,
            start: `${(i / BEATS.length) * 100}% top`,
            end: `${((i + 1) / BEATS.length) * 100}% top`,
            onToggle: (self) => {
              if (!self.isActive) return;
              Object.assign(cam, beat);
              applyCam();
              p.forEach((panel, pi) => {
                gsap.set(panel, { autoAlpha: pi === i ? 1 : 0, yPercent: 0 });
              });
            },
          });
        });
        applyCam();
        return;
      }

      const camTween = (beat: Beat) => ({
        px: beat.px, py: beat.py, pz: beat.pz,
        tx: beat.tx, ty: beat.ty, tz: beat.tz,
        duration: 3,
        ease: "none" as const,
        onUpdate: applyCam,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      tl.to(cam, camTween(BEATS[1]))
        .to(p[0], { autoAlpha: 0, yPercent: -35, duration: 1 }, "<")
        .fromTo(p[1], { autoAlpha: 0, yPercent: 35 }, { autoAlpha: 1, yPercent: 0, duration: 1 }, "<0.9")
        .to({}, { duration: 0.7 })
        .to(cam, camTween(BEATS[2]))
        .to(p[1], { autoAlpha: 0, yPercent: -35, duration: 1 }, "<")
        .fromTo(p[2], { autoAlpha: 0, yPercent: 35 }, { autoAlpha: 1, yPercent: 0, duration: 1 }, "<0.9")
        .to({}, { duration: 0.7 })
        .to(cam, camTween(BEATS[3]))
        .to(p[2], { autoAlpha: 0, yPercent: -35, duration: 1 }, "<")
        .fromTo(p[3], { autoAlpha: 0, yPercent: 35 }, { autoAlpha: 1, yPercent: 0, duration: 1 }, "<0.9");

      applyCam();
    }, holder);

    // ---- resize -------------------------------------------------------
    const onResize = () => {
      const w = holder.clientWidth;
      const h = holder.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      requestRender();
      ScrollTrigger.refresh();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(holder);

    requestRender();

    return () => {
      ro.disconnect();
      ctx.revert();
      if (rafId) cancelAnimationFrame(rafId);
      diorama.dispose();
      scene.remove(diorama.group);
      renderer.dispose();
    };
  }, []);

  const toggleSpin = () => {
    const next = !spinningRef.current;
    spinningRef.current = next;
    setSpinning(next);
    (canvasRef.current as (HTMLCanvasElement & { __spin?: () => void }) | null)?.__spin?.();
  };

  return (
    <div ref={wrapRef} className="relative h-[440vh] bg-[#8ec7ea]">
      <div ref={holderRef} className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {PANELS.map((panel, i) => (
          <div
            key={panel.title}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            className="pointer-events-none absolute inset-x-0 bottom-[8vh] flex justify-center px-6 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:justify-start sm:px-[8vw]"
          >
            <div className="max-w-md rounded-2xl bg-black/55 p-6 text-white backdrop-blur-sm sm:p-8">
              <p className="font-pixel text-[10px] tracking-[0.14em] text-[#7bffb0]">
                {panel.eyebrow}
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                {panel.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
                {panel.body}
              </p>
              {i === PANELS.length - 1 && (
                <span className="pointer-events-auto mt-5 inline-flex cursor-not-allowed items-center gap-1.5 text-sm font-semibold text-[#7bffb0] opacity-70">
                  Entrar no servidor →
                </span>
              )}
            </div>
          </div>
        ))}

        {/* HUD de medição */}
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg bg-black/65 px-3 py-2 font-data text-[11px] leading-relaxed text-white/90 backdrop-blur-sm">
          <div>draw calls: <span ref={hudCalls}>—</span></div>
          <div>triângulos: <span ref={hudTris}>—</span></div>
          <div>blocos: {stats?.blocks ?? "—"} · dpr: {stats?.dpr ?? "—"}</div>
          <div>fps: <span ref={hudFps}>—</span></div>
          <div className="mt-1 text-white/50">role a página · não arrasta</div>
        </div>

        <button
          type="button"
          onClick={toggleSpin}
          className="pointer-events-auto absolute right-4 top-4 rounded-lg bg-black/65 px-3 py-2 font-data text-[11px] text-white backdrop-blur-sm transition-colors hover:bg-black/80"
        >
          {spinning ? "■ parar" : "▶ girar 360° (teste FPS)"}
        </button>

        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 font-pixel text-[10px] tracking-[0.2em] text-white/70">
          ↓ role
        </div>
      </div>
    </div>
  );
}
