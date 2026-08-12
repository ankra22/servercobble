import {
  Backpack,
  Crosshair,
  Sparkles,
  Swords,
  TrendingUp,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import type { FeedEventType } from "@/lib/database.types";

export interface FeedEventConfig {
  label: string;
  /** token de cor definido em globals.css (@theme) — vira text-{tone}/bg-{tone}/border-{tone} */
  tone: "rare" | "capture" | "battle" | "evolution" | "levelup" | "shiny";
  icon: LucideIcon;
  verb: string;
}

export const FEED_EVENT_CONFIG: Record<FeedEventType, FeedEventConfig> = {
  rare_spawn: {
    label: "Spawn raro",
    tone: "rare",
    icon: Crosshair,
    verb: "apareceu",
  },
  capture: {
    label: "Captura",
    tone: "capture",
    icon: Backpack,
    verb: "capturou",
  },
  gym_defeat: {
    label: "Ginásio",
    tone: "battle",
    icon: Swords,
    verb: "venceu o líder",
  },
  evolution: {
    label: "Evolução",
    tone: "evolution",
    icon: Wand2,
    verb: "evoluiu",
  },
  level_up: {
    label: "Level up",
    tone: "levelup",
    icon: TrendingUp,
    verb: "subiu de nível",
  },
  shiny_found: {
    label: "Shiny",
    tone: "shiny",
    icon: Sparkles,
    verb: "encontrou um shiny",
  },
};

export const FEED_EVENT_ORDER: FeedEventType[] = [
  "shiny_found",
  "rare_spawn",
  "capture",
  "evolution",
  "gym_defeat",
  "level_up",
];
