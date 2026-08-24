"use client";

import { useRef, useEffect, useCallback, type ReactNode } from "react";

/**
 * Vendorizado a partir do registry do react-bits (@react-bits/ClickSpark-JS-CSS),
 * portado pra TypeScript. Lógica mantida como no original — canvas 2D leve,
 * sem WebGL, um único listener de clique na div que envolve o conteúdo.
 * https://reactbits.dev/animations/click-spark
 *
 * Duas diferenças do original:
 *
 * 1. A div de fora não força `height: 100%` (só faz sentido dentro de um
 *    container de altura fixa/explícita — aqui ela envolve o `<body>`
 *    inteiro, então precisa crescer com o conteúdo, não travar em 100% de
 *    um ancestral sem altura definida).
 * 2. O loop de animação só roda enquanto tem faísca na tela. O original
 *    chama requestAnimationFrame pra sempre, mesmo com sparksRef vazio —
 *    como isso envolve o site inteiro, era um loop infinito rodando em
 *    toda página o tempo todo, parado ou não (achado depois do usuário
 *    reportar o site pesado).
 */

type Easing = "linear" | "ease-in" | "ease-in-out" | "ease-out";

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

export interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: Easing;
  extraScale?: number;
  children?: ReactNode;
}

export function ClickSpark({
  sparkColor = "#fff",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = "ease-out",
  extraScale = 1.0,
  children,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparksRef = useRef<Spark[]>([]);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    let resizeTimeout: ReturnType<typeof setTimeout>;

    const resizeCanvas = () => {
      const { width, height } = parent.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(parent);

    resizeCanvas();

    return () => {
      ro.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, []);

  const easeFunc = useCallback(
    (t: number) => {
      switch (easing) {
        case "linear":
          return t;
        case "ease-in":
          return t * t;
        case "ease-in-out":
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    },
    [easing],
  );

  const animationIdRef = useRef<number | null>(null);

  const stopLoop = useCallback(() => {
    if (animationIdRef.current != null) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
  }, []);

  const startLoop = useCallback(() => {
    if (animationIdRef.current != null) return; // já rodando
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) {
          return false;
        }

        const progress = elapsed / duration;
        const eased = easeFunc(progress);

        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      if (sparksRef.current.length > 0) {
        animationIdRef.current = requestAnimationFrame(draw);
      } else {
        // Sem faísca sobrando — limpa o canvas uma última vez e para o loop
        // em vez de continuar redesenhando um frame vazio pra sempre.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animationIdRef.current = null;
      }
    };

    animationIdRef.current = requestAnimationFrame(draw);
  }, [sparkColor, sparkSize, sparkRadius, duration, easeFunc, extraScale]);

  useEffect(() => stopLoop, [stopLoop]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const now = performance.now();
    const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
      x,
      y,
      angle: (2 * Math.PI * i) / sparkCount,
      startTime: now,
    }));

    sparksRef.current.push(...newSparks);
    startLoop();
  };

  return (
    <div style={{ position: "relative", width: "100%" }} onClick={handleClick}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          userSelect: "none",
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
}

export default ClickSpark;
