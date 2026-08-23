#!/usr/bin/env node
/**
 * Remove o fundo branco/quase-branco das imagens de insígnia em
 * public/insignias/, deixando transparente — só o fundo (via flood-fill a
 * partir dos 4 cantos), não mexe em branco que faça parte do desenho em si
 * (ex.: brilho/destaque no meio do ícone).
 *
 * Uso: node scripts/remove-white-bg.mjs [--threshold 235] [arquivo...]
 * Sem arquivo nenhum, processa tudo em public/insignias/. Sobrescreve como
 * .png (preserva o nome base, troca a extensão se precisar).
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const badgesDir = path.join(repoRoot, "public/insignias");

const args = process.argv.slice(2);
let threshold = 235;
const thresholdIdx = args.indexOf("--threshold");
if (thresholdIdx !== -1) {
  threshold = Number(args[thresholdIdx + 1]);
  args.splice(thresholdIdx, 2);
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(png|jpe?g|webp)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

const targets =
  args.length > 0 ? args.map((f) => (path.isAbsolute(f) ? f : path.join(badgesDir, f))) : walk(badgesDir);

function isNearWhite(r, g, b, t) {
  return r >= t && g >= t && b >= t;
}

async function processImage(filePath) {
  const image = sharp(filePath).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const visited = new Uint8Array(width * height);
  const queue = [];

  const pushIfWhite = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const p = idx * channels;
    if (isNearWhite(data[p], data[p + 1], data[p + 2], threshold)) {
      visited[idx] = 1;
      queue.push(idx);
    }
  };

  for (let x = 0; x < width; x++) {
    pushIfWhite(x, 0);
    pushIfWhite(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushIfWhite(0, y);
    pushIfWhite(width - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop();
    const p = idx * channels;
    data[p + 3] = 0; // alpha = 0
    const x = idx % width;
    const y = Math.floor(idx / width);
    pushIfWhite(x + 1, y);
    pushIfWhite(x - 1, y);
    pushIfWhite(x, y + 1);
    pushIfWhite(x, y - 1);
  }

  const outPath = filePath.replace(/\.(png|jpe?g|webp)$/i, ".png");
  await sharp(data, { raw: { width, height, channels } }).png().toFile(outPath);
  if (outPath !== filePath) fs.unlinkSync(filePath);
  console.log(`OK: ${path.basename(outPath)}`);
}

if (targets.length === 0) {
  console.log("Nenhuma imagem encontrada em public/badges/.");
  process.exit(0);
}

for (const target of targets) {
  await processImage(target);
}
