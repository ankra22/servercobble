package com.cobblemontracker.collector

import com.cobblemon.mod.common.Cobblemon
import com.cobblemon.mod.common.api.pokemon.stats.Stats
import com.cobblemon.mod.common.pokemon.Pokemon
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import net.minecraft.core.registries.BuiltInRegistries
import net.minecraft.server.level.ServerPlayer
import net.minecraft.world.entity.Entity
import java.time.Instant
import java.util.UUID

object EventFactory {

    private fun base(type: String): JsonObject {
        val json = JsonObject()
        json.addProperty("type", type)
        json.addProperty("source_event_id", UUID.randomUUID().toString())
        json.addProperty("timestamp", Instant.now().toString())
        return json
    }

    private fun trainerJson(player: ServerPlayer): JsonObject {
        val trainer = JsonObject()
        trainer.addProperty("username", player.gameProfile.name)
        return trainer
    }

    private fun coordinatesJson(entity: Entity): JsonObject {
        val coords = JsonObject()
        coords.addProperty("x", entity.blockX)
        coords.addProperty("y", entity.blockY)
        coords.addProperty("z", entity.blockZ)
        coords.addProperty("dimension", entity.level().dimension().location().path)
        return coords
    }

    private fun ivsJson(pokemon: Pokemon): JsonObject {
        val ivs = pokemon.ivs
        val json = JsonObject()
        json.addProperty("hp", ivs.getOrDefault(Stats.HP))
        json.addProperty("atk", ivs.getOrDefault(Stats.ATTACK))
        json.addProperty("def", ivs.getOrDefault(Stats.DEFENCE))
        json.addProperty("spa", ivs.getOrDefault(Stats.SPECIAL_ATTACK))
        json.addProperty("spd", ivs.getOrDefault(Stats.SPECIAL_DEFENCE))
        json.addProperty("spe", ivs.getOrDefault(Stats.SPEED))
        return json
    }

    private fun heldItemId(pokemon: Pokemon): String? {
        val stack = pokemon.heldItem()
        if (stack.isEmpty) return null
        return BuiltInRegistries.ITEM.getKey(stack.item).path
    }

    /** "team" se o Pokémon está no time atual do treinador, "pc" caso contrário. */
    private fun locationFor(pokemon: Pokemon, player: ServerPlayer): String {
        val inParty = Cobblemon.storage.getParty(player).get(pokemon.uuid) != null
        return if (inParty) "team" else "pc"
    }

    /** Campos comuns de um Pokémon; sem `location`, que só faz sentido pra quem tem dono. */
    private fun wildPokemonJson(pokemon: Pokemon): JsonObject {
        val json = JsonObject()
        json.addProperty("game_uuid", pokemon.uuid.toString())
        json.addProperty("species", pokemon.species.showdownId())
        json.addProperty("nickname", pokemon.nickname?.string)
        json.addProperty("level", pokemon.level)
        json.addProperty("is_shiny", pokemon.shiny)
        json.addProperty("nature", pokemon.nature.name.path)
        json.addProperty("ability", pokemon.ability.name)
        json.addProperty("held_item", heldItemId(pokemon))
        json.add("ivs", ivsJson(pokemon))
        return json
    }

    private fun pokemonJson(pokemon: Pokemon, player: ServerPlayer): JsonObject {
        val json = wildPokemonJson(pokemon)
        json.addProperty("location", locationFor(pokemon, player))
        return json
    }

    fun capture(pokemon: Pokemon, player: ServerPlayer): JsonObject {
        val json = base("capture")
        json.add("trainer", trainerJson(player))
        json.add("pokemon", pokemonJson(pokemon, player))
        json.add("coordinates", coordinatesJson(player))
        return json
    }

    fun evolution(pokemon: Pokemon, player: ServerPlayer, fromSpecies: String): JsonObject {
        val json = base("evolution")
        json.add("trainer", trainerJson(player))
        json.add("pokemon", pokemonJson(pokemon, player))
        json.addProperty("from_species", fromSpecies)
        return json
    }

    fun levelUp(pokemon: Pokemon, player: ServerPlayer, oldLevel: Int, newLevel: Int): JsonObject {
        val json = base("level_up")
        json.add("trainer", trainerJson(player))
        json.add("pokemon", pokemonJson(pokemon, player))
        json.addProperty("old_level", oldLevel)
        json.addProperty("new_level", newLevel)
        return json
    }

    /** Shiny avistado no mundo, ainda não capturado — sem treinador associado. */
    fun wildShinyFound(pokemon: Pokemon, entity: Entity): JsonObject {
        val json = base("shiny_found")
        json.add("pokemon", wildPokemonJson(pokemon))
        json.add("coordinates", coordinatesJson(entity))
        return json
    }

    fun rareSpawn(pokemon: Pokemon, entity: Entity, rarity: String): JsonObject {
        val json = base("rare_spawn")
        json.add("pokemon", wildPokemonJson(pokemon))
        json.add("coordinates", coordinatesJson(entity))
        json.addProperty("rarity", rarity)
        return json
    }

    /**
     * Snapshot periódico do time atual do jogador — não é um evento de feed
     * (não gera card), só serve pra manter `pokemons.location` sincronizado
     * quando alguém move Pokémon entre time/PC sem passar por nenhum dos
     * eventos acima (o Cobblemon não expõe um evento público pra isso).
     * O ingestor marca esses `game_uuid`s como "team" e todo o resto do
     * treinador como "pc".
     */
    /** Jogador derrotou um treinador de ginásio de verdade do rctmod (não campeão/Elite Four/rival). */
    fun gymDefeat(player: ServerPlayer, gymLeaderName: String, series: String): JsonObject {
        val json = base("gym_defeat")
        json.add("trainer", trainerJson(player))
        json.addProperty("gym_leader_name", gymLeaderName)
        json.addProperty("series", series)
        return json
    }

    fun teamSnapshot(player: ServerPlayer): JsonObject {
        val json = base("team_snapshot")
        json.add("trainer", trainerJson(player))
        val uuids = JsonArray()
        for (pokemon in Cobblemon.storage.getParty(player)) {
            uuids.add(pokemon.uuid.toString())
        }
        json.add("team_game_uuids", uuids)
        return json
    }
}
