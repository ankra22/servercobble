import * as THREE from "three";

/**
 * Texturas de bloco 16px desenhadas em canvas — nada de asset da Mojang.
 * Cada bloco é um ruído determinístico sobre uma base, no espírito das
 * texturas de Minecraft: chapado de longe, com grão de perto.
 *
 * Um material por tipo de bloco → o cenário vira ~1 draw call por tipo
 * (dez e poucos no total), o que continua trivial pra GPU.
 */

export type BlockName =
  | "grass"
  | "dirt"
  | "path"
  | "stone_bricks"
  | "white"
  | "red"
  | "black"
  | "planks"
  | "log"
  | "leaves"
  | "lantern"
  | "glow"
  | "cloud"
  | "red_glass"
  | "blue_glass"
  | "water";

function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(size = 16): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  return { canvas, ctx };
}

function fill(ctx: CanvasRenderingContext2D, color: string, size: number): void {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
}

/** Espalha pixels de 1px sobre a base. */
function scatter(
  ctx: CanvasRenderingContext2D,
  rand: () => number,
  colors: string[],
  amount: number,
  size: number,
): void {
  const n = Math.floor(size * size * amount);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
    ctx.fillRect(Math.floor(rand() * size), Math.floor(rand() * size), 1, 1);
  }
}

function texture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestMipmapNearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

type Draw = (ctx: CanvasRenderingContext2D, rand: () => number, size: number) => void;

const RECIPES: Record<BlockName, { seed: number; size: number; draw: Draw }> = {
  grass: {
    seed: 11,
    size: 16,
    draw: (ctx, rand, s) => {
      fill(ctx, "#6aa63a", s);
      scatter(ctx, rand, ["#5f9a33", "#75b444", "#588f2e", "#7fbd4d"], 0.5, s);
      scatter(ctx, rand, ["#c9d66a"], 0.03, s);
    },
  },
  dirt: {
    seed: 22,
    size: 16,
    draw: (ctx, rand, s) => {
      fill(ctx, "#79583a", s);
      scatter(ctx, rand, ["#6c4d31", "#8a6a48", "#6f5136", "#5f4329"], 0.55, s);
      scatter(ctx, rand, ["#9a8a76"], 0.04, s);
    },
  },
  path: {
    seed: 33,
    size: 16,
    draw: (ctx, rand, s) => {
      fill(ctx, "#9b9b9b", s);
      for (let i = 0; i < 26; i++) {
        ctx.fillStyle = ["#8a8a8a", "#a8a8a8", "#7d7d7d", "#b2b2b2"][Math.floor(rand() * 4)];
        const w = 1 + Math.floor(rand() * 3);
        ctx.fillRect(Math.floor(rand() * s), Math.floor(rand() * s), w, w);
      }
      ctx.strokeStyle = "#6f6f6f";
      ctx.strokeRect(0.5, 0.5, s - 1, s - 1);
    },
  },
  stone_bricks: {
    seed: 44,
    size: 16,
    draw: (ctx, rand, s) => {
      fill(ctx, "#9a9a9a", s);
      scatter(ctx, rand, ["#909090", "#a4a4a4", "#888888"], 0.4, s);
      ctx.fillStyle = "#6c6c6c";
      ctx.fillRect(0, s / 2 - 1, s, 1); // junta horizontal
      ctx.fillRect(s / 2 - 1, 0, 1, s / 2); // vertical de cima
      ctx.fillRect(s / 4 - 1, s / 2, 1, s / 2); // vertical de baixo (deslocada)
      ctx.fillRect((s * 3) / 4 - 1, s / 2, 1, s / 2);
    },
  },
  white: {
    seed: 55,
    size: 16,
    draw: (ctx, rand, s) => {
      fill(ctx, "#dddfde", s);
      scatter(ctx, rand, ["#d5d7d6", "#e6e8e7", "#d9dbda"], 0.28, s);
    },
  },
  red: {
    seed: 66,
    size: 16,
    draw: (ctx, rand, s) => {
      fill(ctx, "#a62b1c", s);
      scatter(ctx, rand, ["#9a2616", "#b53625", "#8f2213"], 0.35, s);
    },
  },
  black: {
    seed: 77,
    size: 16,
    draw: (ctx, rand, s) => {
      fill(ctx, "#1d1d23", s);
      scatter(ctx, rand, ["#26262d", "#181820"], 0.3, s);
    },
  },
  planks: {
    seed: 88,
    size: 16,
    draw: (ctx, rand, s) => {
      fill(ctx, "#b68851", s);
      scatter(ctx, rand, ["#a97c46", "#c1935c", "#9c7040"], 0.3, s);
      ctx.fillStyle = "#8a6238";
      for (let y = 0; y < s; y += 5) ctx.fillRect(0, y, s, 1);
      ctx.fillRect(s / 2, 0, 1, 5);
      ctx.fillRect(s / 3, s - 5, 1, 5);
    },
  },
  log: {
    seed: 99,
    size: 16,
    draw: (ctx, rand, s) => {
      fill(ctx, "#6b5335", s);
      for (let x = 0; x < s; x++) {
        ctx.fillStyle = ["#5c4529", "#74593a", "#634d30"][Math.floor(rand() * 3)];
        ctx.fillRect(x, 0, 1, s);
      }
      ctx.fillStyle = "#4c3a22";
      ctx.fillRect(0, 0, 1, s);
      ctx.fillRect(s - 1, 0, 1, s);
    },
  },
  leaves: {
    seed: 123,
    size: 16,
    draw: (ctx, rand, s) => {
      for (let x = 0; x < s; x++) {
        for (let y = 0; y < s; y++) {
          const r = rand();
          if (r < 0.14) continue; // buracos → alphaTest
          ctx.fillStyle =
            r < 0.4 ? "#3f6a22" : r < 0.72 ? "#4c7a2c" : r < 0.9 ? "#5a8c37" : "#356018";
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },
  },
  lantern: {
    seed: 202,
    size: 16,
    draw: (ctx, _rand, s) => {
      fill(ctx, "#ffcf5a", s);
      ctx.fillStyle = "#fff1c4";
      ctx.fillRect(s / 2 - 2, s / 2 - 2, 4, 4);
      ctx.fillStyle = "#a87a2c";
      ctx.strokeStyle = "#a87a2c";
      ctx.fillRect(0, 0, s, 2);
      ctx.fillRect(0, s - 2, s, 2);
      ctx.fillRect(0, 0, 2, s);
      ctx.fillRect(s - 2, 0, 2, s);
    },
  },
  glow: {
    seed: 210,
    size: 16,
    draw: (ctx, rand, s) => {
      fill(ctx, "#fff6cf", s);
      scatter(ctx, rand, ["#fff0b4", "#ffffff", "#ffe98f"], 0.4, s);
    },
  },
  cloud: {
    seed: 211,
    size: 16,
    draw: (ctx, rand, s) => {
      fill(ctx, "#f4f7fa", s);
      scatter(ctx, rand, ["#e8edf3", "#ffffff"], 0.3, s);
    },
  },
  red_glass: {
    seed: 301,
    size: 16,
    draw: (ctx, _rand, s) => {
      ctx.clearRect(0, 0, s, s);
      ctx.fillStyle = "rgba(214,56,45,0.42)";
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = "rgba(120,20,14,0.9)";
      ctx.fillRect(0, 0, s, 1);
      ctx.fillRect(0, s - 1, s, 1);
      ctx.fillRect(0, 0, 1, s);
      ctx.fillRect(s - 1, 0, 1, s);
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.fillRect(3, 2, 1, s - 4);
    },
  },
  blue_glass: {
    seed: 302,
    size: 16,
    draw: (ctx, _rand, s) => {
      ctx.clearRect(0, 0, s, s);
      ctx.fillStyle = "rgba(169,214,229,0.36)";
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = "rgba(90,140,160,0.85)";
      ctx.fillRect(0, 0, s, 1);
      ctx.fillRect(0, s - 1, s, 1);
      ctx.fillRect(0, 0, 1, s);
      ctx.fillRect(s - 1, 0, 1, s);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(3, 2, 2, 5);
    },
  },
  water: {
    seed: 303,
    size: 16,
    draw: (ctx, rand, s) => {
      fill(ctx, "#2f6fb0", s);
      ctx.fillStyle = "#3a7cbd";
      for (let i = 0; i < 6; i++) ctx.fillRect(0, Math.floor(rand() * s), s, 1);
      ctx.fillStyle = "#2a68a8";
      for (let i = 0; i < 4; i++) ctx.fillRect(0, Math.floor(rand() * s), s, 1);
    },
  },
};

export interface BlockMaterials {
  materials: Record<BlockName, THREE.Material>;
  noShadowCast: Set<BlockName>;
  noShadowReceive: Set<BlockName>;
  dispose: () => void;
}

export function createBlockMaterials(): BlockMaterials {
  const materials = {} as Record<BlockName, THREE.Material>;
  const textures: THREE.Texture[] = [];

  (Object.keys(RECIPES) as BlockName[]).forEach((name) => {
    const recipe = RECIPES[name];
    const { canvas, ctx } = makeCanvas(recipe.size);
    recipe.draw(ctx, mulberry32(recipe.seed), recipe.size);
    const map = texture(canvas);
    textures.push(map);

    if (name === "leaves") {
      materials[name] = new THREE.MeshLambertMaterial({ map, alphaTest: 0.5 });
    } else if (name === "red_glass" || name === "blue_glass") {
      materials[name] = new THREE.MeshLambertMaterial({ map, transparent: true });
    } else if (name === "water") {
      materials[name] = new THREE.MeshLambertMaterial({ map, transparent: true, opacity: 0.82 });
    } else if (name === "cloud") {
      materials[name] = new THREE.MeshLambertMaterial({ map, transparent: true, opacity: 0.9 });
    } else if (name === "lantern" || name === "glow") {
      materials[name] = new THREE.MeshLambertMaterial({
        map,
        emissive: new THREE.Color(name === "glow" ? 0xfff4c0 : 0xffcf5a),
        emissiveMap: map,
        emissiveIntensity: 0.9,
      });
    } else {
      materials[name] = new THREE.MeshLambertMaterial({ map });
    }
  });

  return {
    materials,
    noShadowCast: new Set<BlockName>(["red_glass", "blue_glass", "water", "cloud", "glow", "lantern"]),
    noShadowReceive: new Set<BlockName>(["water", "cloud", "glow", "red_glass", "blue_glass"]),
    dispose: () => {
      textures.forEach((t) => t.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    },
  };
}

/** Decalque redondo da Poké Ball pro emblema do telhado (plano, não voxel). */
export function createPokeballDecal(): { texture: THREE.CanvasTexture; dispose: () => void } {
  const size = 128;
  const { canvas, ctx } = makeCanvas(size);
  ctx.clearRect(0, 0, size, size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#f2f2f2";
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "#cf2f22";
  ctx.fillRect(0, 0, size, cy);
  ctx.restore();

  ctx.lineWidth = size * 0.11;
  ctx.strokeStyle = "#161616";
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.17, 0, Math.PI * 2);
  ctx.fillStyle = "#161616";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = "#f2f2f2";
  ctx.fill();

  ctx.lineWidth = size * 0.045;
  ctx.strokeStyle = "#161616";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.LinearFilter;
  return { texture: tex, dispose: () => tex.dispose() };
}
