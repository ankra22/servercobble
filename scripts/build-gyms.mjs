#!/usr/bin/env node
/**
 * Gera src/data/gyms.json — a lista ordenada de líderes de ginásio de cada
 * região (kanto/johto/hoenn/sinnoh), extraída do datapack RCT do
 * Cobbleverse. Usada pelo "estojo de insígnias" no perfil do treinador.
 *
 * A ordem vem da cadeia de pré-requisitos `requiredDefeats` de cada
 * treinador (`data/rctmod/mobs/trainers/single/<id>.json`) — não é
 * inventada. Treinadores fora da cadeia principal (ex.: alguns extras em
 * Hoenn/Sinnoh que dependem do campeão, ou sem pré-requisito nenhum e sem
 * ninguém dependendo deles) entram no fim como "bônus", em vez de forçados
 * numa ordem que não existe nos dados.
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

const gyms = {};

for (const region of REGIONS) {
  const ids = fs
    .readdirSync(mobsDir)
    .filter((f) => f.startsWith(`${region}_`) && f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .filter((id) => !id.includes("champion") && !id.includes("league"))
    .filter((id) => readJson(mobsDir, id).type === region);

  // prereq -> id que exige ele (só considera pré-requisitos DENTRO da
  // própria região — um treinador que exige o campeão, por exemplo, não
  // tem prereq resolvível aqui e vira raiz/bônus).
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
  const mainRoot = roots.find((id) => {
    let len = 1;
    let cur = id;
    while (requiredBy.has(cur)) {
      cur = requiredBy.get(cur);
      len++;
    }
    return len === Math.max(...roots.map((r) => {
      let l = 1;
      let c = r;
      while (requiredBy.has(c)) {
        c = requiredBy.get(c);
        l++;
      }
      return l;
    }));
  });

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
    return { id, name: trainer.name.literal, order: index + 1, bonus };
  });
}

const outPath = path.join(repoRoot, "src/data/gyms.json");
fs.writeFileSync(outPath, JSON.stringify(gyms, null, 2));
for (const region of REGIONS) {
  console.log(`${region}: ${gyms[region].length} treinadores — ${gyms[region].map((g) => g.name).join(" -> ")}`);
}
console.log(`Gerado ${path.relative(repoRoot, outPath)}.`);
