package com.cobblemontracker.collector

import com.cobblemon.mod.common.api.Priority
import com.cobblemon.mod.common.api.events.CobblemonEvents
import net.fabricmc.api.ModInitializer
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerLifecycleEvents
import net.fabricmc.fabric.api.event.lifecycle.v1.ServerTickEvents
import net.minecraft.server.level.ServerPlayer
import org.slf4j.LoggerFactory

/**
 * Ponto de entrada do mod complementar do Cobblemon Tracker.
 *
 * Não tem nenhuma UI nem lógica de jogo: só escuta os eventos públicos do
 * Cobblemon (captura, evolução, level up, spawn) e grava uma linha JSON por
 * evento em `tracker-events/events.jsonl`, que o ingestor Python
 * (`collector/ingester/`) lê e insere no Supabase.
 */
object CobblemonTrackerCollector : ModInitializer {
    private val logger = LoggerFactory.getLogger("cobblemon-tracker-collector")

    /** ~60s a 20 TPS (menos, se o servidor estiver lento — sem problema, é só o intervalo do sync de time/PC). */
    private const val TEAM_SYNC_INTERVAL_TICKS = 1200
    private var tickCounter = 0

    override fun onInitialize() {
        TrackerEventWriter.start()

        // Precisa rodar depois que o Cobblemon (e o rctmod, se instalado) já
        // carregaram — RarityRegistry usa o spawn pool, RctModGymListener
        // usa a instância "rctmod" do rctapi, registrada no init deles.
        ServerLifecycleEvents.SERVER_STARTED.register {
            RarityRegistry.build()
            RctModGymListener.register()
        }

        // O evento `capture` já carrega `is_shiny` — o card no site já mostra
        // o selo/brilho de shiny nele. Não emite um `shiny_found` redundante
        // aqui; esse tipo de evento fica reservado pro shiny selvagem, ainda
        // não capturado (ver POKEMON_ENTITY_SPAWN abaixo).
        CobblemonEvents.POKEMON_CAPTURED.subscribe(Priority.NORMAL) { event ->
            TrackerEventWriter.submit(EventFactory.capture(event.pokemon, event.player))
        }

        // Pokémon inicial: não passa por PokemonCapturedEvent (não é pego com
        // pokébola), então sem isso ele nunca entraria na tabela `pokemons`.
        CobblemonEvents.STARTER_CHOSEN.subscribe(Priority.NORMAL) { event ->
            TrackerEventWriter.submit(EventFactory.capture(event.pokemon, event.player))
        }

        CobblemonEvents.EVOLUTION_COMPLETE.subscribe(Priority.NORMAL) { event ->
            val owner: ServerPlayer? = event.pokemon.getOwnerPlayer()
            if (owner != null) {
                val fromSpecies = event.sourcePokemon.species.showdownId()
                TrackerEventWriter.submit(EventFactory.evolution(event.pokemon, owner, fromSpecies))
            } else {
                logger.info("Evolução de ${event.pokemon.species.showdownId()} ignorada: dono não está online.")
            }
        }

        CobblemonEvents.LEVEL_UP_EVENT.subscribe(Priority.NORMAL) { event ->
            val owner: ServerPlayer? = event.pokemon.getOwnerPlayer()
            if (owner != null) {
                TrackerEventWriter.submit(EventFactory.levelUp(event.pokemon, owner, event.oldLevel, event.newLevel))
            }
        }

        CobblemonEvents.POKEMON_ENTITY_SPAWN.subscribe(Priority.NORMAL) { event ->
            val pokemon = event.entity.pokemon
            val rarity = RarityRegistry.bucketFor(pokemon.species.showdownId())
            if (rarity == "rare" || rarity == "ultra-rare") {
                TrackerEventWriter.submit(EventFactory.rareSpawn(pokemon, event.entity, rarity))
            }
            if (pokemon.shiny) {
                TrackerEventWriter.submit(EventFactory.wildShinyFound(pokemon, event.entity))
            }
        }

        ServerTickEvents.END_SERVER_TICK.register { server ->
            tickCounter++
            if (tickCounter >= TEAM_SYNC_INTERVAL_TICKS) {
                tickCounter = 0
                for (player in server.playerList.players) {
                    TrackerEventWriter.submit(EventFactory.teamSnapshot(player))
                }
            }
        }

        logger.info("Cobblemon Tracker Collector inicializado.")
    }
}
