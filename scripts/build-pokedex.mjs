#!/usr/bin/env node
/**
 * Gera src/data/pokedex.json (a "wiki" do site) a partir dos dados que o
 * próprio Cobblemon e o datapack do Cobbleverse já têm — não inventa nada,
 * só extrai e traduz.
 *
 * Precisa rodar de novo se o modpack (Cobblemon ou o datapack do
 * Cobbleverse) atualizar. Passo a passo:
 *
 *   1. Extrai as espécies + descrições (pt-BR) do jar do Cobblemon:
 *      unzip -o "Cobblemon-fabric-X.jar" "data/cobblemon/species/*\/*.json" -d SPECIES_DIR
 *      unzip -o "Cobblemon-fabric-X.jar" "assets/cobblemon/lang/pt_br.json" -d SPECIES_DIR
 *
 *   2. Extrai o spawn pool do datapack do Cobbleverse (é ele que manda —
 *      sobrescreve o spawn pool padrão do Cobblemon):
 *      unzip -o "COBBLEVERSE-DP-vXX.zip" "data/cobblemon/spawn_pool_world/*" -d SPAWNPOOL_DIR
 *
 *   3. node scripts/build-pokedex.mjs SPECIES_DIR SPAWNPOOL_DIR
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const [, , speciesDirArg, spawnPoolDirArg] = process.argv;
if (!speciesDirArg || !spawnPoolDirArg) {
  console.error("Uso: node scripts/build-pokedex.mjs <SPECIES_DIR> <SPAWNPOOL_DIR>");
  process.exit(1);
}

const speciesRoot = path.join(speciesDirArg, "data/cobblemon/species");
const langPath = path.join(speciesDirArg, "assets/cobblemon/lang/pt_br.json");
const spawnPoolRoot = path.join(spawnPoolDirArg, "data/cobblemon/spawn_pool_world");

const lang = JSON.parse(fs.readFileSync(langPath, "utf8"));

// Nome do bioma em inglês mesmo (sem tradução) — só limpa o prefixo do tag
// e formata (ex.: "#cobblemon:is_tropical_island" -> "Tropical Island").
// Alguns tags do Cobblemon têm um segmento extra separado por "/" (ex.:
// "#cobblemon:nether/is_basalt" -> "Nether – Basalt").
function biomeLabel(tag) {
  const key = tag.replace(/^#?[a-z_]+:/, "");
  return key
    .split("/")
    .map((segment) =>
      segment
        .replace(/^is_/, "")
        .replaceAll("_", " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    )
    .join(" – ");
}

// Locais "custom_spawn/*" do datapack do Cobbleverse não são biomas de
// verdade — são os monumentos lendários (torres, templos, etc.). De
// propósito NÃO extraímos o nome do monumento pra lugar nenhum (nem no
// JSON) — só se sabe que existe um, o jogador descobre qual explorando.
const RARITY_RANK = { common: 0, uncommon: 1, rare: 2, "ultra-rare": 3 };

// Labels do Cobblemon que marcam um Pokémon como "especial". Pra esses o
// local de spawn NUNCA vai pro JSON (nem bioma nem monumento) — a Dex mostra
// só um "?". Decisão do usuário: todo lendário fica com a interrogação,
// mesmo os que tecnicamente spawnam num bioma comum (bucket ultra-rare).
const HIDDEN_LOCATION_LABELS = new Set(["legendary", "mythical", "ultra_beast"]);

// Condições de horário/clima que o Cobblemon suporta no spawn. Só viram
// texto na Dex quando valem pra TODOS os spawns naturais da espécie (ver
// spawnConditions() abaixo) — aí é uma regra de verdade, não uma variação.
const TIME_LABELS = { day: "Dia", night: "Noite", dawn: "Amanhecer", dusk: "Entardecer" };

const TYPE_PT = {
  normal: "Normal", fire: "Fogo", water: "Água", grass: "Planta", electric: "Elétrico",
  ice: "Gelo", fighting: "Lutador", poison: "Veneno", ground: "Terra", flying: "Voador",
  psychic: "Psíquico", bug: "Inseto", rock: "Pedra", ghost: "Fantasma", dragon: "Dragão",
  dark: "Sombrio", steel: "Aço", fairy: "Fada",
};

// Nome pt-BR de um item ("cobblemon:thunder_stone" -> "Pedra do Trovão").
// Cai pro id formatado quando não há tradução (itens minecraft:).
function itemName(itemId) {
  if (!itemId) return null;
  const bare = String(itemId).split(" ")[0].replace(/^#/, "");
  return (
    lang[`item.${bare.replace(":", ".")}`] ??
    bare
      .replace(/^[a-z_]+:/, "")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

// Texto curto do método de evolução, em pt-BR ("Nível 16", "Pedra do Trovão",
// "Troca segurando Revestimento Metálico", "Amizade alta, à noite").
function evolutionMethod(evo) {
  const parts = [];
  if (evo.requiredContext) parts.push(itemName(evo.requiredContext));
  for (const req of evo.requirements ?? []) {
    switch (req.variant) {
      case "level":
        parts.push(`Nível ${req.minLevel ?? req.level ?? "?"}`);
        break;
      case "friendship":
        parts.push("Amizade alta");
        break;
      case "time_range":
        parts.push(req.range === "night" ? "à noite" : req.range === "day" ? "de dia" : req.range);
        break;
      case "held_item":
        parts.push(`segurando ${itemName(req.itemCondition)}`);
        break;
      case "has_move_type":
        parts.push(`sabendo golpe ${TYPE_PT[req.type] ?? req.type}`);
        break;
      case "has_move":
        parts.push(`sabendo ${itemName(req.move) ?? req.move}`);
        break;
      case "move_type":
        parts.push(`com golpe ${TYPE_PT[req.type] ?? req.type}`);
        break;
      case "properties":
        break; // detalhe interno, não vira texto
      default:
        break;
    }
  }
  if (evo.variant === "trade") parts.unshift("Troca");
  return parts.join(", ") || "Subir de nível";
}

// Ordem canônica dos 6 stats + rótulo curto pt-BR (o JSON do Cobblemon usa
// grafia britânica: "defence", "special_defence").
const STAT_KEYS = [
  ["hp", "hp"],
  ["attack", "atk"],
  ["defence", "def"],
  ["special_attack", "spa"],
  ["special_defence", "spd"],
  ["speed", "spe"],
];

function baseStats(raw) {
  if (!raw) return null;
  const out = {};
  let total = 0;
  for (const [src, key] of STAT_KEYS) {
    const value = Number(raw[src] ?? 0);
    out[key] = value;
    total += value;
  }
  out.total = total;
  return out;
}

// Deriva as condições fixas de uma espécie a partir da lista de condições
// dos seus spawns naturais (`condSet`). "Fixa" = presente em todos eles.
function spawnConditions(conds) {
  if (!conds.length) return [];
  const out = [];

  // Horário: só é regra se todo spawn natural define timeRange E o conjunto
  // de valores não cobre o dia inteiro (day+night = sem regra na prática).
  if (conds.every((c) => c.timeRange)) {
    const times = [...new Set(conds.map((c) => c.timeRange))];
    const coversDay = times.includes("day") && times.includes("night");
    if (!coversDay) {
      for (const t of ["day", "dawn", "dusk", "night"]) {
        if (times.includes(t)) out.push(TIME_LABELS[t]);
      }
    }
  }

  // Clima.
  if (conds.every((c) => c.isThundering === true)) out.push("Tempestade");
  else if (conds.every((c) => c.isRaining === true)) out.push("Chuva");
  else if (conds.every((c) => c.isRaining === false)) out.push("Tempo limpo");

  return out;
}

// 1. Spawn pool -> Map<species_id, { rarity, biomeSet, monumentSet, condSet }>
const spawnInfo = new Map();
for (const file of fs.readdirSync(spawnPoolRoot)) {
  if (!file.endsWith(".json")) continue;
  const data = JSON.parse(fs.readFileSync(path.join(spawnPoolRoot, file), "utf8"));
  if (data.enabled === false) continue;
  for (const spawn of data.spawns ?? []) {
    if (spawn.type !== "pokemon") continue;
    // Nota: mantém a chave crua (ex.: "pikachu region_bias=alola") como o
    // script sempre fez — mudar pra base "pikachu" mesclaria formas e
    // alteraria o JSON já publicado.
    const speciesId = (spawn.pokemon ?? "").toLowerCase();
    if (!speciesId) continue;
    const entry =
      spawnInfo.get(speciesId) ??
      { rarity: null, biomeSet: new Set(), monumentSet: new Set(), condSet: [] };
    if (spawn.bucket && (entry.rarity === null || RARITY_RANK[spawn.bucket] > RARITY_RANK[entry.rarity])) {
      entry.rarity = spawn.bucket;
    }
    for (const biome of spawn.condition?.biomes ?? []) {
      // "custom_spawn" (com ou sem "/nome-do-local" depois) é sempre um
      // monumento/local especial do Cobbleverse, nunca um bioma de verdade.
      if (/custom_spawn/.test(biome)) {
        entry.monumentSet.add(biome);
      } else {
        entry.biomeSet.add(biome);
      }
    }
    // Só spawns "naturais" (no chão/água, sem preset de estrutura/pesca)
    // contam pra regra de horário/clima — o resto é encontro pontual.
    const cond = spawn.condition ?? {};
    const natural = !spawn.presets?.length || spawn.presets.includes("natural");
    if (natural && !cond.rodType && !cond.bait && !cond.bobber) {
      entry.condSet.push(cond);
    }
    spawnInfo.set(speciesId, entry);
  }
}

// 2. Lê todos os arquivos de espécie primeiro (precisa do mapa id -> número
//    da dex montado antes de resolver a cadeia de evolução).
const rawSpecies = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
      continue;
    }
    if (!name.endsWith(".json")) continue;
    const data = JSON.parse(fs.readFileSync(full, "utf8"));
    // "implemented" não é um sinal confiável (várias espécies com spawn de
    // verdade, ex. Groudon, não têm esse campo) — só exige o número da dex.
    if (!data.nationalPokedexNumber) continue;
    rawSpecies.push({ id: path.basename(name, ".json"), data });
  }
}
walk(speciesRoot);

// id da espécie (forma base, sem sufixo de forma) -> número nacional.
const idToNumber = new Map();
for (const { id, data } of rawSpecies) {
  const base = id.split(" ")[0].toLowerCase();
  if (!idToNumber.has(base)) idToNumber.set(base, data.nationalPokedexNumber);
}
function resolveNumber(speciesRef) {
  if (!speciesRef) return null;
  return idToNumber.get(String(speciesRef).split(" ")[0].toLowerCase()) ?? null;
}

// 3. Espécies -> entrada final da dex
const entries = [];
for (const { id, data } of rawSpecies) {
  const descKey = data.pokedex?.[0];
  const description = descKey ? (lang[descKey] ?? null) : null;
  const spawn = spawnInfo.get(id);
  const labels = data.labels ?? [];
  const locationHidden = labels.some((label) => HIDDEN_LOCATION_LABELS.has(label));

  // Cadeia de evolução: número da pré-evolução + lista das evoluções
  // (número + método em texto). Dedup por número de destino porque algumas
  // evoluções ramificam em formas que compartilham número.
  const evoTo = [];
  const seenEvo = new Set();
  for (const evo of data.evolutions ?? []) {
    const number = resolveNumber(evo.result);
    if (!number || seenEvo.has(number)) continue;
    seenEvo.add(number);
    evoTo.push({ number, method: evolutionMethod(evo) });
  }

  entries.push({
    number: data.nationalPokedexNumber,
    id,
    name: data.name,
    types: [data.primaryType, data.secondaryType].filter(Boolean),
    description,
    labels,
    rarity: spawn?.rarity ?? null,
    biomes:
      spawn && !locationHidden
        ? [...spawn.biomeSet]
            .map(biomeLabel)
            .filter((b, i, arr) => arr.indexOf(b) === i)
            .sort()
        : [],
    // Lendário -> sempre "?" na Dex, mesmo sem monumento no spawn pool.
    hasMonument: locationHidden || Boolean(spawn?.monumentSet.size),
    // Horário/clima exigido pra spawnar (só quando vale pra todo spawn
    // natural da espécie) — ex.: ["Noite"], ["Chuva"]. [] = qualquer hora.
    spawnConditions: spawn ? spawnConditions(spawn.condSet) : [],
    // Stats base (hp/atk/def/spa/spd/spe + total).
    baseStats: baseStats(data.baseStats),
    // { from: número da pré-evolução | null, to: [{ number, method }] }
    evolution: {
      from: resolveNumber(data.preEvolution),
      to: evoTo,
    },
  });
}

// Um arquivo por forma às vezes compartilha o número da dex com a forma
// base (ex.: variações regionais) — mantém só a primeira ocorrência de cada
// número (a forma "principal") pra não duplicar entradas na listagem.
entries.sort((a, b) => a.number - b.number || a.id.localeCompare(b.id));
const seenNumbers = new Set();
const deduped = entries.filter((entry) => {
  if (seenNumbers.has(entry.number)) return false;
  seenNumbers.add(entry.number);
  return true;
});

const outPath = path.join(repoRoot, "src/data/pokedex.json");
fs.writeFileSync(outPath, JSON.stringify(deduped));
console.log(`Gerado ${path.relative(repoRoot, outPath)} com ${deduped.length} espécies.`);
