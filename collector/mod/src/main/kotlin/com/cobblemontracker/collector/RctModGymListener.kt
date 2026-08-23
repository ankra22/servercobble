package com.cobblemontracker.collector

import com.gitlab.srcmc.rctapi.api.RCTApi
import com.gitlab.srcmc.rctapi.api.battle.BattleState
import com.gitlab.srcmc.rctapi.api.events.Events
import com.gitlab.srcmc.rctapi.api.trainer.TrainerPlayer
import com.gitlab.srcmc.rctmod.api.RCTMod
import com.gitlab.srcmc.rctmod.world.entities.TrainerMob
import net.minecraft.server.level.ServerPlayer
import org.slf4j.LoggerFactory

/**
 * Escuta o fim de batalhas do rctmod (Radical Cobblemon Trainers) pra
 * detectar quando um jogador derrota um treinador de ginásio de verdade —
 * não campeão, não Elite Four, não rival/grupo — e emitir `gym_defeat`.
 *
 * Um treinador conta como "líder de ginásio" quando o id do `TrainerType`
 * dele bate com uma das séries que ele pertence (ex.: type "kanto" e
 * série "kanto"). Campeão (`kanto_champion`) e Elite Four (`kanto_league`)
 * têm id de tipo com sufixo, então não batem nessa checagem — fica tudo
 * orientado pelos dados do datapack, sem nome de região fixo no código.
 * rctapi/rctmod são opcionais ("suggests" no fabric.mod.json): se não
 * estiverem instalados, só loga um aviso e não faz nada.
 */
object RctModGymListener {
    private val logger = LoggerFactory.getLogger("cobblemon-tracker-collector")

    /** true só depois de `register()` achar a instância "rctmod" do rctapi. */
    var isAvailable: Boolean = false
        private set

    fun register() {
        val eventContext = RCTApi.getInstance("rctmod")?.eventContext
        if (eventContext == null) {
            logger.warn("rctapi (instância \"rctmod\") não encontrada — progresso de ginásio não vai ser rastreado.")
            return
        }

        eventContext.register(Events.BATTLE_ENDED) { event ->
            try {
                handleBattleEnded(event.value)
            } catch (e: Exception) {
                logger.error("Erro processando fim de batalha do rctmod", e)
            }
        }
        isAvailable = true
        logger.info("Escutando derrotas de treinador do rctmod pra progresso de ginásio.")
    }

    /**
     * Região/série atual do jogador no rctmod (ex.: "kanto"), ou `null` se
     * ele ainda não tem uma série de verdade atribuída (não registrado,
     * freeroam, etc.) — nesse caso não conta como "presente" em região
     * nenhuma pro site.
     */
    fun currentSeriesFor(player: ServerPlayer): String? {
        if (!isAvailable) return null
        return try {
            val series = RCTMod.getInstance().trainerManager.getData(player)?.currentSeries
            series?.takeIf { it.isNotBlank() && it != "empty" && it != "freeroam" }
        } catch (e: Exception) {
            logger.error("Erro lendo série atual do jogador ${player.gameProfile.name}", e)
            null
        }
    }

    private fun handleBattleEnded(battle: BattleState) {
        val winningPlayer: ServerPlayer = battle.winners
            .filterIsInstance<TrainerPlayer>()
            .firstOrNull()
            ?.player ?: return

        val defeatedTrainerMob = battle.losers
            .mapNotNull { it.entity as? TrainerMob }
            .firstOrNull() ?: return

        val trainerId = defeatedTrainerMob.trainerId ?: return
        val data = RCTMod.getInstance().trainerManager.getData(trainerId) ?: return
        val typeId = data.type.id()
        val isGymLeader = data.series.anyMatch { it == typeId }
        if (!isGymLeader) return

        val gymLeaderName = defeatedTrainerMob.name.string
        TrackerEventWriter.submit(EventFactory.gymDefeat(winningPlayer, gymLeaderName, typeId))
        logger.info("${winningPlayer.gameProfile.name} derrotou o líder $gymLeaderName ($typeId).")
    }
}
