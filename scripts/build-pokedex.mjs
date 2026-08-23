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

// Tradução dos tags de bioma mais comuns do spawn pool — o que não estiver
// aqui cai num fallback automático (remove prefixo, capitaliza).
const BIOME_LABELS = {
  is_overworld: "Superfície",
  is_freezing: "Regiões geladas",
  is_ocean: "Oceano",
  is_jungle: "Selva",
  is_swamp: "Pântano",
  is_forest: "Floresta",
  is_lush: "Caverna luxuriante",
  is_freshwater: "Água doce",
  is_arid: "Árido",
  is_spooky: "Sombrio",
  is_coast: "Litoral",
  is_hills: "Colinas",
  is_mountain: "Montanha",
  is_frozen_ocean: "Oceano congelado",
  is_tropical_island: "Ilha tropical",
  is_deep_dark: "Profundezas sombrias",
  is_taiga: "Taiga",
  is_badlands: "Terras áridas",
  is_magical: "Área mágica",
  is_temperate: "Clima temperado",
  is_savanna: "Savana",
  is_floral: "Área florida",
  is_desert: "Deserto",
  is_cold_ocean: "Oceano frio",
  is_plains: "Planície",
  is_beach: "Praia",
  is_tundra: "Tundra",
  is_warm_ocean: "Oceano quente",
  is_mushroom: "Campo de cogumelos",
  is_grassland: "Campina",
  is_volcanic: "Vulcânico",
  is_sky: "Céu",
  is_snowy_forest: "Floresta nevada",
  is_end: "The End",
  is_dripstone: "Caverna de estalactites",
  is_bamboo: "Bambuzal",
  is_river: "Rio",
  is_island: "Ilha",
  is_thermal: "Termal",
  is_deep_ocean: "Oceano profundo",
  is_lukewarm_ocean: "Oceano morno",
  is_sandy: "Arenoso",
  is_glacial: "Glacial",
  is_snowy: "Nevado",
  is_peak: "Picos nevados",
  is_cherry_blossom: "Flor de cerejeira",
  is_cold: "Frio",
  is_snowy_taiga: "Taiga nevada",
  is_cave: "Caverna",
  is_highlands: "Terras altas",
  saccharine_trees: "Árvores sacarinas",
  flowers: "Flores",
  ruin: "Ruínas",
  shipwreck_cove: "Baía de naufrágios",
  white_flowers: "Flores brancas",
  red_flowers: "Flores vermelhas",
  blue_flowers: "Flores azuis",
  yellow_flowers: "Flores amarelas",
  pink_flowers: "Flores rosas",
  orange_flowers: "Flores laranjas",
};

function biomeLabel(tag) {
  const key = tag.replace(/^#?[a-z_]+:/, "");
  if (BIOME_LABELS[key]) return BIOME_LABELS[key];
  return key
    .replace(/^is_/, "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Locais "custom_spawn/*" do datapack do Cobbleverse não são biomas de
// verdade — são os monumentos lendários (torres, templos, etc.). Nomes
// conhecidos traduzidos à mão; o resto cai num fallback automático.
const MONUMENT_LABELS = {
  articuno_tower: "Torre do Articuno",
  zapdos_tower: "Torre do Zapdos",
  moltres_tower: "Torre do Moltres",
  bell_tower: "Torre do Sino",
  ilex_shrine: "Santuário de Ilex",
  whirl_island: "Ilha do Redemoinho",
  newmoon_island: "Ilha da Lua Nova",
  sky_pillar: "Pilar do Céu",
  groudon_vulcano: "Vulcão do Groudon",
  kyogre_temple: "Templo do Kyogre",
  regirock_temple: "Templo do Regirock",
  regice_temple: "Templo do Regice",
  registeel_temple: "Templo do Registeel",
  deoxys_meteorite: "Meteorito do Deoxys",
  sinnoh_temple: "Templo de Sinnoh",
  origin_temple: "Templo da Origem",
  jirachi_structure: "Estrutura do Jirachi",
  eternatus_cocoon: "Casulo do Eternatus",
  crown_spire: "Torre da Coroa",
  crown_cemetery: "Cemitério da Coroa",
  split_decision_temple: "Templo da Decisão",
  secret_garden: "Jardim Secreto",
  secrt_garden: "Jardim Secreto",
  flower_paradise: "Paraíso das Flores",
  team_rocket_radio: "Rádio da Equipe Rocket",
};

function monumentLabel(tag) {
  const slug = tag.replace(/^#?[a-z_]+:custom_spawn\//, "");
  if (MONUMENT_LABELS[slug]) return MONUMENT_LABELS[slug];
  return slug.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const RARITY_RANK = { common: 0, uncommon: 1, rare: 2, "ultra-rare": 3 };

// 1. Spawn pool -> Map<species_id, { rarity, biomeSet, monumentSet }>
const spawnInfo = new Map();
for (const file of fs.readdirSync(spawnPoolRoot)) {
  if (!file.endsWith(".json")) continue;
  const data = JSON.parse(fs.readFileSync(path.join(spawnPoolRoot, file), "utf8"));
  if (data.enabled === false) continue;
  for (const spawn of data.spawns ?? []) {
    if (spawn.type !== "pokemon") continue;
    const speciesId = (spawn.pokemon ?? "").toLowerCase();
    if (!speciesId) continue;
    const entry = spawnInfo.get(speciesId) ?? { rarity: null, biomeSet: new Set(), monumentSet: new Set() };
    if (spawn.bucket && (entry.rarity === null || RARITY_RANK[spawn.bucket] > RARITY_RANK[entry.rarity])) {
      entry.rarity = spawn.bucket;
    }
    for (const biome of spawn.condition?.biomes ?? []) {
      if (/custom_spawn\//.test(biome)) {
        entry.monumentSet.add(biome);
      } else {
        entry.biomeSet.add(biome);
      }
    }
    spawnInfo.set(speciesId, entry);
  }
}

// 2. Espécies implementadas -> entrada final da dex
const entries = [];
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

    const id = path.basename(name, ".json");
    const descKey = data.pokedex?.[0];
    const description = descKey ? (lang[descKey] ?? null) : null;
    const spawn = spawnInfo.get(id);

    entries.push({
      number: data.nationalPokedexNumber,
      id,
      name: data.name,
      types: [data.primaryType, data.secondaryType].filter(Boolean),
      description,
      labels: data.labels ?? [],
      rarity: spawn?.rarity ?? null,
      biomes: spawn
        ? [...spawn.biomeSet]
            .map(biomeLabel)
            .filter((b, i, arr) => arr.indexOf(b) === i)
            .sort()
        : [],
      monuments: spawn
        ? [...spawn.monumentSet]
            .map(monumentLabel)
            .filter((m, i, arr) => arr.indexOf(m) === i)
            .sort()
        : [],
    });
  }
}
walk(speciesRoot);

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
