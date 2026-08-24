import type { FeedEventWithTrainer } from "@/lib/database.types";
import { toTitleCase } from "@/lib/format";

/**
 * O script Python normalmente já manda `message` pronta. Isso aqui é só um
 * fallback caso o evento chegue sem texto (ex.: durante testes manuais no
 * banco), pra o card nunca ficar em branco.
 */
export function fallbackMessage(event: FeedEventWithTrainer): string {
  const trainer = event.trainer?.display_name ?? "Um treinador";
  const species = event.species ? toTitleCase(event.species) : "um Pokémon";

  switch (event.type) {
    case "rare_spawn":
      return `Um ${species} raro apareceu no mundo.`;
    case "capture":
      return `${trainer} capturou ${species}.`;
    case "gym_defeat":
      return event.gym_leader_name
        ? `${trainer} derrotou o líder ${event.gym_leader_name}.`
        : `${trainer} venceu uma batalha de ginásio.`;
    case "evolution":
      return `O Pokémon de ${trainer} evoluiu para ${species}.`;
    case "level_up":
      return `${species} de ${trainer} subiu de nível.`;
    case "shiny_found":
      return `${trainer} encontrou um ${species} shiny!`;
    default:
      return `${trainer} teve uma novidade com ${species}.`;
  }
}

/**
 * Parte a mensagem na primeira ocorrência do nome da espécie, pra ela poder
 * viver na tipografia da frase em vez de numa pílula própria. Devolve null
 * quando não encontra — a frase então é renderizada inteira, sem ênfase.
 */
export function splitOnSpecies(
  message: string,
  species: string | null,
): [before: string, name: string, after: string] | null {
  if (!species) return null;

  const name = toTitleCase(species);
  const at = message.toLowerCase().indexOf(name.toLowerCase());
  if (at === -1) return null;

  return [message.slice(0, at), message.slice(at, at + name.length), message.slice(at + name.length)];
}
