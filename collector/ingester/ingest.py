"""Ingestor do Cobblemon Tracker.

Le `tracker-events/events.jsonl` (escrito pelo mod em `collector/mod`) linha
por linha, conforme o arquivo cresce, e insere/atualiza os dados
correspondentes no Supabase usando a service_role key (ignora RLS).

Uso:
    python ingest.py

Mantem um offset de bytes em `.offset` (ao lado deste script) pra retomar
de onde parou se for reiniciado. Cada linha carrega um `source_event_id`
(UUID) gerado pelo mod; `feed_events.source_event_id` tem uma constraint
UNIQUE no banco, entao reprocessar a mesma linha (ex.: apos um crash no meio
do processamento) nao duplica a linha do feed.
"""

from __future__ import annotations

import json
import logging
import os
import time
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
EVENTS_FILE_PATH = Path(os.environ["EVENTS_FILE_PATH"])
OFFSET_FILE_PATH = Path(__file__).parent / ".offset"
POLL_INTERVAL_SECONDS = 1.0

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("ingest")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def read_offset() -> int:
    if OFFSET_FILE_PATH.exists():
        content = OFFSET_FILE_PATH.read_text().strip()
        return int(content) if content else 0
    return 0


def write_offset(offset: int) -> None:
    OFFSET_FILE_PATH.write_text(str(offset))


def skin_url(username: str) -> str:
    return f"https://mc-heads.net/skin/{username}"


def title_case(species: str) -> str:
    """Espelha `toTitleCase` do site (src/lib/format.ts) pra mensagens geradas aqui."""
    return " ".join(word.capitalize() for word in species.replace("_", " ").split())


def is_duplicate_key_error(exc: Exception) -> bool:
    message = str(exc).lower()
    return "duplicate key value" in message or "23505" in message


def upsert_trainer(username: str) -> str:
    """Retorna o id do treinador, criando-o (com display_name = username) se
    for a primeira vez que aparece. Nao sobrescreve treinadores existentes
    (display_name pode ter sido customizado manualmente no Supabase)."""
    existing = (
        supabase.table("trainers")
        .select("id")
        .ilike("username", username)
        .maybe_single()
        .execute()
    )
    if existing and existing.data:
        return existing.data["id"]

    inserted = (
        supabase.table("trainers")
        .insert({
            "username": username,
            "display_name": username,
            "skin_url": skin_url(username),
        })
        .execute()
    )
    return inserted.data[0]["id"]


def upsert_pokemon(trainer_id: str, pokemon: dict[str, Any]) -> None:
    row = {
        "trainer_id": trainer_id,
        "species": pokemon["species"],
        "nickname": pokemon.get("nickname"),
        "level": pokemon["level"],
        "is_shiny": pokemon["is_shiny"],
        "nature": pokemon.get("nature"),
        "ability": pokemon.get("ability"),
        "held_item": pokemon.get("held_item"),
        "location": pokemon.get("location", "pc"),
        "ivs": pokemon.get("ivs", {}),
        "game_uuid": pokemon["game_uuid"],
    }
    supabase.table("pokemons").upsert(row, on_conflict="game_uuid").execute()


def update_pokemon_by_game_uuid(game_uuid: str, fields: dict[str, Any]) -> None:
    supabase.table("pokemons").update(fields).eq("game_uuid", game_uuid).execute()


def insert_feed_event(row: dict[str, Any]) -> None:
    try:
        supabase.table("feed_events").insert(row).execute()
    except Exception as exc:
        if is_duplicate_key_error(exc):
            log.info("Evento %s ja tinha sido processado, ignorando.", row.get("source_event_id"))
        else:
            raise


def process_capture(event: dict[str, Any]) -> None:
    trainer_id = upsert_trainer(event["trainer"]["username"])
    upsert_pokemon(trainer_id, event["pokemon"])
    insert_feed_event({
        "type": "capture",
        "trainer_id": trainer_id,
        "species": event["pokemon"]["species"],
        "is_shiny": event["pokemon"]["is_shiny"],
        "coordinates": event.get("coordinates"),
        "source_event_id": event["source_event_id"],
    })


def process_shiny_found(event: dict[str, Any]) -> None:
    """Shiny avistado ainda selvagem (via spawn) — sem treinador, ninguém
    "achou" ainda. Capturar um shiny não gera esse evento: o card de
    `capture` já mostra o selo de shiny nele mesmo."""
    species_label = title_case(event["pokemon"]["species"])
    message = f"Um {species_label} shiny apareceu no mundo!"
    insert_feed_event({
        "type": "shiny_found",
        "trainer_id": None,
        "species": event["pokemon"]["species"],
        "is_shiny": True,
        "coordinates": event.get("coordinates"),
        "message": message,
        "source_event_id": event["source_event_id"],
    })


def process_evolution(event: dict[str, Any]) -> None:
    username = event["trainer"]["username"]
    trainer_id = upsert_trainer(username)
    pokemon = event["pokemon"]
    update_pokemon_by_game_uuid(pokemon["game_uuid"], {
        "species": pokemon["species"],
        "level": pokemon["level"],
        "ability": pokemon.get("ability"),
        "location": pokemon.get("location", "pc"),
    })
    from_species = event.get("from_species")
    if from_species:
        message = f"{title_case(from_species)} de {username} evoluiu para {title_case(pokemon['species'])}."
    else:
        message = None
    insert_feed_event({
        "type": "evolution",
        "trainer_id": trainer_id,
        "species": pokemon["species"],
        "is_shiny": pokemon["is_shiny"],
        "message": message,
        "source_event_id": event["source_event_id"],
    })


def process_level_up(event: dict[str, Any]) -> None:
    username = event["trainer"]["username"]
    trainer_id = upsert_trainer(username)
    pokemon = event["pokemon"]
    update_pokemon_by_game_uuid(pokemon["game_uuid"], {
        "level": pokemon["level"],
        "location": pokemon.get("location", "pc"),
    })
    old_level = event.get("old_level")
    new_level = event.get("new_level", pokemon["level"])
    message = f"{title_case(pokemon['species'])} de {username} subiu do nível {old_level} para o nível {new_level}."
    insert_feed_event({
        "type": "level_up",
        "trainer_id": trainer_id,
        "species": pokemon["species"],
        "is_shiny": pokemon["is_shiny"],
        "message": message,
        "source_event_id": event["source_event_id"],
    })


RARITY_LABEL = {"rare": "raro", "ultra-rare": "ultra-raro"}


def process_rare_spawn(event: dict[str, Any]) -> None:
    pokemon = event["pokemon"]
    rarity = event["rarity"]
    species_label = title_case(pokemon["species"])
    message = f"Um {species_label} {RARITY_LABEL.get(rarity, 'raro')} apareceu no mundo!"
    insert_feed_event({
        "type": "rare_spawn",
        "species": pokemon["species"],
        "is_shiny": pokemon["is_shiny"],
        "coordinates": event.get("coordinates"),
        "message": message,
        "rarity": rarity,
        "source_event_id": event["source_event_id"],
    })


def process_gym_defeat(event: dict[str, Any]) -> None:
    """Jogador derrotou um líder de ginásio de verdade do rctmod (não
    campeão/Elite Four/rival — ver RctModGymListener.kt no mod). Incrementa
    badges_count só quando a linha do feed é nova de verdade (não um
    reprocessamento do mesmo source_event_id)."""
    username = event["trainer"]["username"]
    trainer_id = upsert_trainer(username)
    gym_leader_name = event["gym_leader_name"]
    series = event["series"]

    try:
        supabase.table("feed_events").insert({
            "type": "gym_defeat",
            "trainer_id": trainer_id,
            "gym_leader_name": gym_leader_name,
            "series": series,
            "message": f"{username} derrotou o líder {gym_leader_name}.",
            "source_event_id": event["source_event_id"],
        }).execute()
    except Exception as exc:
        if is_duplicate_key_error(exc):
            log.info("Evento %s ja tinha sido processado, ignorando.", event["source_event_id"])
            return
        raise

    current = (
        supabase.table("trainers")
        .select("badges_count")
        .eq("id", trainer_id)
        .single()
        .execute()
    )
    supabase.table("trainers").update({
        "badges_count": current.data["badges_count"] + 1
    }).eq("id", trainer_id).execute()


def process_region_snapshot(event: dict[str, Any]) -> None:
    """Sincroniza a região/série atual do jogador no rctmod (roda a cada
    ~60s, junto do team_snapshot). Não gera card no feed."""
    trainer_id = upsert_trainer(event["trainer"]["username"])
    supabase.table("trainers").update({"current_series": event["series"]}).eq("id", trainer_id).execute()


def process_team_snapshot(event: dict[str, Any]) -> None:
    """Sincroniza `location` com o time atual do jogador (roda a cada ~60s
    pelo mod). Não gera card no feed — só corrige o time/PC de quem moveu
    Pokémon sem passar por captura/evolução/level up."""
    trainer_id = upsert_trainer(event["trainer"]["username"])
    team_uuids = event.get("team_game_uuids") or []

    if team_uuids:
        supabase.table("pokemons").update({"location": "team"}).eq(
            "trainer_id", trainer_id
        ).in_("game_uuid", team_uuids).execute()
        supabase.table("pokemons").update({"location": "pc"}).eq(
            "trainer_id", trainer_id
        ).not_.in_("game_uuid", team_uuids).execute()
    else:
        supabase.table("pokemons").update({"location": "pc"}).eq(
            "trainer_id", trainer_id
        ).execute()


HANDLERS = {
    "capture": process_capture,
    "shiny_found": process_shiny_found,
    "evolution": process_evolution,
    "level_up": process_level_up,
    "rare_spawn": process_rare_spawn,
    "gym_defeat": process_gym_defeat,
    "region_snapshot": process_region_snapshot,
    "team_snapshot": process_team_snapshot,
}


def process_line(line: str) -> None:
    line = line.strip()
    if not line:
        return
    event = json.loads(line)
    handler = HANDLERS.get(event.get("type"))
    if handler is None:
        log.warning("Tipo de evento desconhecido: %s", event.get("type"))
        return
    handler(event)
    log.info("Processado: %s (%s)", event["type"], event.get("source_event_id"))


def tail_loop() -> None:
    offset = read_offset()
    log.info("Lendo %s a partir do offset %d", EVENTS_FILE_PATH, offset)
    while True:
        if not EVENTS_FILE_PATH.exists():
            time.sleep(POLL_INTERVAL_SECONDS)
            continue

        with EVENTS_FILE_PATH.open("r", encoding="utf-8") as f:
            f.seek(offset)
            while True:
                # readline() (em vez de "for line in f") porque o iterador
                # de arquivo usa um buffer de leitura antecipada que
                # desabilita f.tell() — precisamos da posição exata pra
                # persistir o offset linha a linha.
                line = f.readline()
                if not line:
                    break
                if not line.endswith("\n"):
                    # Linha ainda incompleta (mod escrevendo agora mesmo) —
                    # espera a próxima rodada de poll pra ler ela inteira,
                    # sem avançar o offset.
                    break
                try:
                    process_line(line)
                except Exception:
                    log.exception("Erro processando linha, pulando: %s", line.strip())
                offset = f.tell()
                write_offset(offset)

        time.sleep(POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    tail_loop()
