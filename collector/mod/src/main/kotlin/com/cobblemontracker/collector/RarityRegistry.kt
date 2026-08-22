package com.cobblemontracker.collector

import com.cobblemon.mod.common.api.spawning.CobblemonSpawnPools
import com.cobblemon.mod.common.api.spawning.detail.PokemonSpawnDetail
import com.cobblemon.mod.common.api.spawning.detail.SpawnDetail
import org.slf4j.LoggerFactory

/**
 * Classifica espécies por raridade de spawn ("rare"/"ultra-rare"), lendo o
 * spawn pool que o próprio Cobblemon já carregou (`bucket` de cada entrada,
 * o mesmo valor usado nos arquivos json de spawn_pool_world do Cobblemon).
 * Uma espécie com mais de uma entrada de spawn fica classificada pela mais
 * rara delas.
 */
object RarityRegistry {
    private val logger = LoggerFactory.getLogger("cobblemon-tracker-collector")
    private val speciesBucket = mutableMapOf<String, String>()

    private val RANK = mapOf(
        "common" to 0,
        "uncommon" to 1,
        "rare" to 2,
        "ultra-rare" to 3,
    )

    fun build() {
        speciesBucket.clear()
        val details: List<SpawnDetail> = CobblemonSpawnPools.WORLD_SPAWN_POOL.details
        for (detail: SpawnDetail in details) {
            if (detail !is PokemonSpawnDetail) continue
            val species = detail.pokemon.species?.lowercase() ?: continue
            val bucket = detail.bucket.name
            val existing = speciesBucket[species]
            if (existing == null || (RANK[bucket] ?: -1) > (RANK[existing] ?: -1)) {
                speciesBucket[species] = bucket
            }
        }
        logger.info("Tabela de raridade carregada: ${speciesBucket.size} espécies (do spawn pool do Cobblemon).")
    }

    /** "rare", "ultra-rare", ou null se for common/uncommon/não catalogada (ex.: lendário sem spawn selvagem). */
    fun bucketFor(species: String): String? = speciesBucket[species.lowercase()]
}
