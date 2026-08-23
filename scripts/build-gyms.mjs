#!/usr/bin/env node
/**
 * Gera src/data/gyms.json — a lista ordenada de líderes de ginásio, Elite
 * Four e campeão de cada região (kanto/johto/hoenn/sinnoh), extraída do
 * datapack RCT do Cobbleverse. Usada pelo "estojo de insígnias" no perfil
 * do treinador.
 *
 * A ordem vem da cadeia de pré-requisitos `requiredDefeats` de cada
 * treinador (`data/rctmod/mobs/trainers/single/<id>.json`) — não é
 * inventada. O "rank" (gym/elite_four/champion) vem do PADRÃO DO ID
 * (`<região>_league_*` / `<região>_champion_*`), não do campo `type` do
 * mob — o datapack tem uma inconsistência real: os membros da Elite Four
 * de Hoenn e Sinnoh estão com `type` igual ao dos líderes de ginásio
 * comuns (bug do próprio pack), então o id é a fonte confiável aqui (o
 * coletor, em RctModGymListener.kt, usa a mesma lógica de padrão de id).
 * Treinadores fora da cadeia principal (sem pré-requisito e sem ninguém
 * dependendo deles, ex.: "Lyris" em Hoenn) entram como "bônus" no fim.
 *
 * Passo a passo pra regerar se o datapack atualizar:
 *   unzip -o "COBBLEVERSE-RCT-DP-vXX.zip" "data/rctmod/mobs/trainers/single/*" "data/rctmod/trainers/*" -d RCT_DIR
 *   node scripts/build-gyms.mjs RCT_DIR
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const [, , rctDirArg] = process.argv;
if (!rctDirArg) {
  console.error("Uso: node scripts/build-gyms.mjs <RCT_DIR>");
  process.exit(1);
}

const REGIONS = ["kanto", "johto", "hoenn", "sinnoh"];
const mobsDir = path.join(rctDirArg, "data/rctmod/mobs/trainers/single");
const trainersDir = path.join(rctDirArg, "data/rctmod/trainers");

function readJson(dir, id) {
  return JSON.parse(fs.readFileSync(path.join(dir, `${id}.json`), "utf8"));
}

function rankOf(region, id) {
  if (id.startsWith(`${region}_champion_`)) return "champion";
  if (id.startsWith(`${region}_league_`)) return "elite_four";
  return "gym";
}

const gyms = {};

for (const region of REGIONS) {
  const ids = fs
    .readdirSync(mobsDir)
    .filter((f) => f.startsWith(`${region}_`) && f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));

  const prereqOf = new Map();
  const requiredBy = new Map();
  for (const id of ids) {
    const mob = readJson(mobsDir, id);
    const req = mob.requiredDefeats?.[0]?.[0];
    if (req && ids.includes(req)) {
      prereqOf.set(id, req);
      requiredBy.set(req, id);
    }
  }

  const roots = ids.filter((id) => !prereqOf.has(id));
  const chainLength = (root) => {
    let len = 1;
    let cur = root;
    while (requiredBy.has(cur)) {
      cur = requiredBy.get(cur);
      len++;
    }
    return len;
  };
  const mainRoot = roots.reduce((best, r) => (chainLength(r) > chainLength(best) ? r : best), roots[0]);

  const ordered = [];
  let cur = mainRoot;
  while (cur) {
    ordered.push({ id: cur, bonus: false });
    cur = requiredBy.get(cur);
  }

  const bonusRoots = roots.filter((id) => id !== mainRoot).sort();
  for (const root of bonusRoots) {
    let c = root;
    while (c) {
      ordered.push({ id: c, bonus: true });
      c = requiredBy.get(c);
    }
  }

  gyms[region] = ordered.map(({ id, bonus }, index) => {
    const trainer = readJson(trainersDir, id);
    return { id, name: trainer.name.literal, order: index + 1, bonus, rank: rankOf(region, id) };
  });
}

const outPath = path.join(repoRoot, "src/data/gyms.json");
fs.writeFileSync(outPath, JSON.stringify(gyms, null, 2));
for (const region of REGIONS) {
  const line = gyms[region]
    .map((g) => `${g.name}${g.rank !== "gym" ? `[${g.rank}]` : ""}${g.bonus ? "(bônus)" : ""}`)
    .join(" -> ");
  console.log(`${region}: ${gyms[region].length} treinadores — ${line}`);
}
console.log(`Gerado ${path.relative(repoRoot, outPath)}.`);
