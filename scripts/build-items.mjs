#!/usr/bin/env node
/**
 * Gera src/data/items.json + copia os ícones pra public/items/ — a aba ITENS
 * do site. Só entram itens do Cobblemon LIGADOS A POKÉMON: pedras de
 * evolução, bagas, itens segurados e qualquer coisa que uma espécie dropa ou
 * precisa pra evoluir. Não inventa nada: nome, efeito e ícone vêm do jar.
 *
 * Roda de novo quando o Cobblemon atualizar. Passo a passo:
 *
 *   1. Espécies + lang pt-BR (mesmo dump do build-pokedex):
 *      unzip -o "Cobblemon-fabric-X.jar" "data/cobblemon/species/*\/*.json" -d SPECIES_DIR
 *      unzip -o "Cobblemon-fabric-X.jar" "assets/cobblemon/lang/pt_br.json" -d SPECIES_DIR
 *
 *   2. Texturas de item:
 *      unzip -o "Cobblemon-fabric-X.jar" "assets/cobblemon/textures/item/*" -d TEX_DIR
 *
 *   3. node scripts/build-items.mjs SPECIES_DIR TEX_DIR
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const [, , speciesDirArg, texDirArg] = process.argv;
if (!speciesDirArg || !texDirArg) {
  console.error("Uso: node scripts/build-items.mjs <SPECIES_DIR> <TEX_DIR>");
  process.exit(1);
}

const speciesRoot = path.join(speciesDirArg, "data/cobblemon/species");
const langPath = path.join(speciesDirArg, "assets/cobblemon/lang/pt_br.json");
const texRoot = path.join(texDirArg, "assets/cobblemon/textures/item");
const lang = JSON.parse(fs.readFileSync(langPath, "utf8"));

const TYPE_PT = {
  normal: "Normal", fire: "Fogo", water: "Água", grass: "Planta", electric: "Elétrico",
  ice: "Gelo", fighting: "Lutador", poison: "Veneno", ground: "Terra", flying: "Voador",
  psychic: "Psíquico", bug: "Inseto", rock: "Pedra", ghost: "Fantasma", dragon: "Dragão",
  dark: "Sombrio", steel: "Aço", fairy: "Fada",
};

// Pasta da textura -> categoria pt-BR na aba. Ordem = prioridade quando um id
// aparece em mais de uma pasta (ex.: kings_rock em evolution e wearable).
const CATEGORY = [
  ["evolution", "Evolução"],
  ["held_items", "Itens segurados"],
  ["wearable", "Itens segurados"],
  ["battle_items", "Itens de batalha"],
  ["type_gem", "Gemas de tipo"],
  ["mints", "Hortelãs"],
  ["medicine", "Remédios"],
  ["berries", "Bagas"],
];
const CATEGORY_ORDER = ["Evolução", "Itens segurados", "Bagas", "Gemas de tipo", "Itens de batalha", "Hortelãs", "Remédios", "Outros"];

function itemName(bareOrFull) {
  const bare = String(bareOrFull).replace(/^#/, "").replace(/^cobblemon:/, "").split(" ")[0];
  return lang[`item.cobblemon.${bare}`] ?? null;
}

function itemEffect(bare) {
  const lines = [];
  const single = lang[`item.cobblemon.${bare}.tooltip`];
  if (single) lines.push(single);
  for (let i = 1; i <= 6; i++) {
    const line = lang[`item.cobblemon.${bare}.tooltip_${i}`];
    if (line) lines.push(line);
  }
  return lines;
}

function evolutionMethod(evo) {
  const parts = [];
  if (evo.requiredContext) parts.push(itemName(evo.requiredContext) ?? prettify(evo.requiredContext));
  for (const req of evo.requirements ?? []) {
    switch (req.variant) {
      case "level": parts.push(`Nível ${req.minLevel ?? req.level ?? "?"}`); break;
      case "friendship": parts.push("Amizade alta"); break;
      case "time_range": parts.push(req.range === "night" ? "à noite" : req.range === "day" ? "de dia" : req.range); break;
      case "held_item": parts.push(`segurando ${itemName(req.itemCondition) ?? prettify(req.itemCondition)}`); break;
      case "has_move_type": parts.push(`sabendo golpe ${TYPE_PT[req.type] ?? req.type}`); break;
      default: break;
    }
  }
  if (evo.variant === "trade") parts.unshift("Troca");
  return parts.join(", ") || "Subir de nível";
}

function prettify(id) {
  return String(id)
    .replace(/^#/, "")
    .replace(/^[a-z_]+:/, "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// 1. Índice de texturas: bareId -> { folder, file }
const texIndex = new Map();
for (const folder of fs.readdirSync(texRoot)) {
  const dir = path.join(texRoot, folder);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".png")) continue;
    const id = path.basename(file, ".png");
    const existing = texIndex.get(id);
    const rank = (f) => {
      const i = CATEGORY.findIndex(([name]) => name === f);
      return i === -1 ? CATEGORY.length : i;
    };
    if (!existing || rank(folder) < rank(existing.folder)) {
      texIndex.set(id, { folder, file: path.join(dir, file) });
    }
  }
}

// 2. Varre as espécies: drops + usos em evolução, por item.
const idToNumber = new Map();
const speciesFiles = [];
(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) { walk(full); continue; }
    if (!name.endsWith(".json")) continue;
    const data = JSON.parse(fs.readFileSync(full, "utf8"));
    if (!data.nationalPokedexNumber) continue;
    speciesFiles.push({ id: path.basename(name, ".json"), data });
    const base = path.basename(name, ".json").split(" ")[0].toLowerCase();
    if (!idToNumber.has(base)) idToNumber.set(base, data.nationalPokedexNumber);
  }
})(speciesRoot);

const resolveNumber = (ref) =>
  ref ? idToNumber.get(String(ref).split(" ")[0].toLowerCase()) ?? null : null;

const droppedBy = new Map(); // bareId -> [{ number, name, chance, sort }]
const evolves = new Map(); // bareId -> [{ from, into, method }]

for (const { data } of speciesFiles) {
  const number = data.nationalPokedexNumber;

  for (const entry of data.drops?.entries ?? []) {
    if (!entry.item) continue;
    const full = entry.item.split(" ")[0];
    if (!full.startsWith("cobblemon:")) continue;
    const bare = full.slice("cobblemon:".length);
    const pct = typeof entry.percentage === "number" ? entry.percentage : null;
    const list = droppedBy.get(bare) ?? [];
    list.push({
      number,
      name: data.name,
      chance: pct != null ? `${pct % 1 === 0 ? pct : pct.toFixed(1)}%` : "garantido",
      sort: pct != null ? pct : 1000,
    });
    droppedBy.set(bare, list);
  }

  for (const evo of data.evolutions ?? []) {
    const into = resolveNumber(evo.result);
    if (!into) continue;
    const method = evolutionMethod(evo);
    const items = new Set();
    if (typeof evo.requiredContext === "string" && evo.requiredContext.startsWith("cobblemon:")) {
      items.add(evo.requiredContext.slice("cobblemon:".length).split(" ")[0]);
    }
    for (const req of evo.requirements ?? []) {
      if (req.variant === "held_item" && typeof req.itemCondition === "string" && req.itemCondition.startsWith("cobblemon:")) {
        items.add(req.itemCondition.slice("cobblemon:".length).split(" ")[0]);
      }
    }
    for (const bare of items) {
      const list = evolves.get(bare) ?? [];
      if (!list.some((e) => e.from === number && e.into === into)) {
        list.push({ from: number, into, method });
      }
      evolves.set(bare, list);
    }
  }
}

// 3. Conjunto final de itens: dropados + usados em evolução + todas as bagas.
const ids = new Set([
  ...droppedBy.keys(),
  ...evolves.keys(),
  ...[...texIndex.entries()].filter(([, v]) => v.folder === "berries").map(([id]) => id),
]);

function categoryFor(bare) {
  const tex = texIndex.get(bare);
  if (tex) {
    const hit = CATEGORY.find(([name]) => name === tex.folder);
    if (hit) return hit[1];
  }
  if (bare.endsWith("_berry")) return "Bagas";
  return "Outros";
}

const items = [];
const publicDir = path.join(repoRoot, "public/items");
fs.rmSync(publicDir, { recursive: true, force: true });
fs.mkdirSync(publicDir, { recursive: true });

for (const bare of ids) {
  const name = itemName(bare);
  if (!name) continue; // sem tradução = item interno / não exposto

  const tex = texIndex.get(bare);
  let icon = null;
  if (tex) {
    fs.copyFileSync(tex.file, path.join(publicDir, `${bare}.png`));
    icon = `/items/${bare}.png`;
  }

  const drops = (droppedBy.get(bare) ?? [])
    .sort((a, b) => b.sort - a.sort || a.name.localeCompare(b.name))
    .map(({ number, name: n, chance }) => ({ number, name: n, chance }));

  items.push({
    id: bare,
    name,
    category: categoryFor(bare),
    effect: itemEffect(bare),
    icon,
    droppedBy: drops,
    evolves: (evolves.get(bare) ?? []).sort((a, b) => a.from - b.from),
  });
}

items.sort(
  (a, b) =>
    CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) ||
    a.name.localeCompare(b.name, "pt-BR"),
);

const outPath = path.join(repoRoot, "src/data/items.json");
fs.writeFileSync(outPath, JSON.stringify(items));
const withIcon = items.filter((i) => i.icon).length;
console.log(
  `Gerado ${path.relative(repoRoot, outPath)} com ${items.length} itens (${withIcon} com ícone) e copiados pra public/items/.`,
);
