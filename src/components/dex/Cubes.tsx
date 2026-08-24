"use client";

import { useCallback, useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import "./Cubes.css";

/**
 * Vendorizado a partir do registry do react-bits (@react-bits/Cubes-JS-CSS),
 * portado pra TypeScript. Lógica mantida como no original, CSS renomeado
 * (.default-animation -> .cubes-wrap) pra não colidir com outra classe do
 * site. https://reactbits.dev/animations/cubes
 *
 * NÃO usar em listas grandes — cada instância cria gridSize² cubos × 6
 * faces no DOM e roda um requestAnimationFrame contínuo. Rodar N instâncias
 * ao mesmo tempo (ex.: uma por card numa grade de centenas de itens) trava
 * o navegador. Só uma instância por vez (ex.: página de detalhe).
 */

interface CubeGap {
  col?: number;
  row?: number;
}

export interface CubesProps {
  gridSize?: number;
  cubeSize?: number;
  maxAngle?: number;
  radius?: number;
  easing?: string;
  duration?: { enter: number; leave: number };
  cellGap?: number | CubeGap;
  borderStyle?: string;
  faceColor?: string;
  shadow?: boolean | string;
  autoAnimate?: boolean;
  rippleOnClick?: boolean;
  rippleColor?: string;
  rippleSpeed?: number;
}

type CSSVars = CSSProperties & Record<string, string | number>;

export function Cubes({
  gridSize = 10,
  cubeSize,
  maxAngle = 45,
  radius = 3,
  easing = "power3.out",
  duration = { enter: 0.3, leave: 0.6 },
  cellGap,
  borderStyle = "1px solid #fff",
  faceColor = "#120f17",
  shadow = false,
  autoAnimate = true,
  rippleOnClick = true,
  rippleColor = "#fff",
  rippleSpeed = 2,
}: CubesProps) {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userActiveRef = useRef(false);
  const simPosRef = useRef({ x: 0, y: 0 });
  const simTargetRef = useRef({ x: 0, y: 0 });
  const simRAFRef = useRef<number | null>(null);

  const colGap = typeof cellGap === "number" ? `${cellGap}px` : cellGap?.col !== undefined ? `${cellGap.col}px` : "6%";
  const rowGap = typeof cellGap === "number" ? `${cellGap}px` : cellGap?.row !== undefined ? `${cellGap.row}px` : "6%";

  const enterDur = duration.enter;
  const leaveDur = duration.leave;

  const tiltAt = useCallback(
    (rowCenter: number, colCenter: number) => {
      if (!sceneRef.current) return;
      sceneRef.current.querySelectorAll<HTMLElement>(".cube").forEach((cube) => {
        const r = Number(cube.dataset.row);
        const c = Number(cube.dataset.col);
        const dist = Math.hypot(r - rowCenter, c - colCenter);
        if (dist <= radius) {
          const pct = 1 - dist / radius;
          const angle = pct * maxAngle;
          gsap.to(cube, { duration: enterDur, ease: easing, overwrite: true, rotateX: -angle, rotateY: angle });
        } else {
          gsap.to(cube, { duration: leaveDur, ease: "power3.out", overwrite: true, rotateX: 0, rotateY: 0 });
        }
      });
    },
    [radius, maxAngle, enterDur, leaveDur, easing],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      userActiveRef.current = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      const rect = sceneRef.current!.getBoundingClientRect();
      const cellW = rect.width / gridSize;
      const cellH = rect.height / gridSize;
      const colCenter = (e.clientX - rect.left) / cellW;
      const rowCenter = (e.clientY - rect.top) / cellH;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));

      idleTimerRef.current = setTimeout(() => {
        userActiveRef.current = false;
      }, 3000);
    },
    [gridSize, tiltAt],
  );

  const resetAll = useCallback(() => {
    if (!sceneRef.current) return;
    sceneRef.current
      .querySelectorAll<HTMLElement>(".cube")
      .forEach((cube) => gsap.to(cube, { duration: leaveDur, rotateX: 0, rotateY: 0, ease: "power3.out" }));
  }, [leaveDur]);

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      userActiveRef.current = true;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      const rect = sceneRef.current!.getBoundingClientRect();
      const cellW = rect.width / gridSize;
      const cellH = rect.height / gridSize;
      const touch = e.touches[0];
      const colCenter = (touch.clientX - rect.left) / cellW;
      const rowCenter = (touch.clientY - rect.top) / cellH;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));

      idleTimerRef.current = setTimeout(() => {
        userActiveRef.current = false;
      }, 3000);
    },
    [gridSize, tiltAt],
  );

  const onTouchStart = useCallback(() => {
    userActiveRef.current = true;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!sceneRef.current) return;
    resetAll();
  }, [resetAll]);

  const onClick = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!rippleOnClick || !sceneRef.current) return;
      const rect = sceneRef.current.getBoundingClientRect();
      const cellW = rect.width / gridSize;
      const cellH = rect.height / gridSize;

      const point = "touches" in e ? e.touches[0] : e;
      const clientX = point.clientX;
      const clientY = point.clientY;

      const colHit = Math.floor((clientX - rect.left) / cellW);
      const rowHit = Math.floor((clientY - rect.top) / cellH);

      const baseRingDelay = 0.15;
      const baseAnimDur = 0.3;
      const baseHold = 0.6;

      const spreadDelay = baseRingDelay / rippleSpeed;
      const animDuration = baseAnimDur / rippleSpeed;
      const holdTime = baseHold / rippleSpeed;

      const rings: Record<number, HTMLElement[]> = {};
      sceneRef.current.querySelectorAll<HTMLElement>(".cube").forEach((cube) => {
        const r = Number(cube.dataset.row);
        const c = Number(cube.dataset.col);
        const dist = Math.hypot(r - rowHit, c - colHit);
        const ring = Math.round(dist);
        (rings[ring] ??= []).push(cube);
      });

      Object.keys(rings)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach((ring) => {
          const delay = ring * spreadDelay;
          const faces = rings[ring].flatMap((cube) => Array.from(cube.querySelectorAll(".cube-face")));

          gsap.to(faces, { backgroundColor: rippleColor, duration: animDuration, delay, ease: "power3.out" });
          gsap.to(faces, {
            backgroundColor: faceColor,
            duration: animDuration,
            delay: delay + animDuration + holdTime,
            ease: "power3.out",
          });
        });
    },
    [rippleOnClick, gridSize, faceColor, rippleColor, rippleSpeed],
  );

  useEffect(() => {
    if (!autoAnimate || !sceneRef.current) return;
    simPosRef.current = { x: Math.random() * gridSize, y: Math.random() * gridSize };
    simTargetRef.current = { x: Math.random() * gridSize, y: Math.random() * gridSize };
    const speed = 0.02;
    const loop = () => {
      if (!userActiveRef.current) {
        const pos = simPosRef.current;
        const tgt = simTargetRef.current;
        pos.x += (tgt.x - pos.x) * speed;
        pos.y += (tgt.y - pos.y) * speed;
        tiltAt(pos.y, pos.x);
        if (Math.hypot(pos.x - tgt.x, pos.y - tgt.y) < 0.1) {
          simTargetRef.current = { x: Math.random() * gridSize, y: Math.random() * gridSize };
        }
      }
      simRAFRef.current = requestAnimationFrame(loop);
    };
    simRAFRef.current = requestAnimationFrame(loop);
    return () => {
      if (simRAFRef.current != null) cancelAnimationFrame(simRAFRef.current);
    };
  }, [autoAnimate, gridSize, tiltAt]);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", resetAll);
    el.addEventListener("click", onClick);
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", resetAll);
      el.removeEventListener("click", onClick);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [onPointerMove, resetAll, onClick, onTouchMove, onTouchStart, onTouchEnd]);

  const cells = Array.from({ length: gridSize });
  const sceneStyle: CSSProperties = {
    gridTemplateColumns: cubeSize ? `repeat(${gridSize}, ${cubeSize}px)` : `repeat(${gridSize}, 1fr)`,
    gridTemplateRows: cubeSize ? `repeat(${gridSize}, ${cubeSize}px)` : `repeat(${gridSize}, 1fr)`,
    columnGap: colGap,
    rowGap: rowGap,
  };
  const wrapperStyle: CSSVars = {
    "--cube-face-border": borderStyle,
    "--cube-face-bg": faceColor,
    "--cube-face-shadow": shadow === true ? "0 0 6px rgba(0,0,0,.5)" : shadow || "none",
    ...(cubeSize ? { width: `${gridSize * cubeSize}px`, height: `${gridSize * cubeSize}px` } : {}),
  };

  return (
    <div className="cubes-wrap" style={wrapperStyle}>
      <div ref={sceneRef} className="cubes-wrap--scene" style={sceneStyle}>
        {cells.map((_, r) =>
          cells.map((__, c) => (
            <div key={`${r}-${c}`} className="cube" data-row={r} data-col={c}>
              <div className="cube-face cube-face--top" />
              <div className="cube-face cube-face--bottom" />
              <div className="cube-face cube-face--left" />
              <div className="cube-face cube-face--right" />
              <div className="cube-face cube-face--front" />
              <div className="cube-face cube-face--back" />
            </div>
          )),
        )}
      </div>
    </div>
  );
}

export default Cubes;
