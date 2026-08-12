/**
 * Tipos do banco Supabase, escritos à mão a partir de `supabase/schema.sql`.
 *
 * Se o schema mudar, o ideal é regenerar com:
 *   npx supabase gen types typescript --project-id SEU_PROJETO > src/lib/database.types.ts
 * (mantendo o formato `Database` abaixo, consumido pelos clients tipados).
 */

export type PokemonLocation = "team" | "pc";

export type FeedEventType =
  | "rare_spawn"
  | "capture"
  | "gym_defeat"
  | "evolution"
  | "level_up"
  | "shiny_found";

export interface PokemonIVs {
  hp?: number;
  atk?: number;
  def?: number;
  spa?: number;
  spd?: number;
  spe?: number;
  [key: string]: number | undefined;
}

export interface EventCoordinates {
  x?: number;
  y?: number;
  z?: number;
  dimension?: string;
  [key: string]: unknown;
}

export interface Database {
  public: {
    Tables: {
      trainers: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          skin_url: string | null;
          badges_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          display_name: string;
          skin_url?: string | null;
          badges_count?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["trainers"]["Insert"]>;
        Relationships: [];
      };
      pokemons: {
        Row: {
          id: string;
          trainer_id: string;
          species: string;
          nickname: string | null;
          level: number;
          is_shiny: boolean;
          nature: string | null;
          ability: string | null;
          held_item: string | null;
          location: PokemonLocation;
          ivs: PokemonIVs;
          caught_at: string;
          caught_location: string | null;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          species: string;
          nickname?: string | null;
          level?: number;
          is_shiny?: boolean;
          nature?: string | null;
          ability?: string | null;
          held_item?: string | null;
          location?: PokemonLocation;
          ivs?: PokemonIVs;
          caught_at?: string;
          caught_location?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["pokemons"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "pokemons_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: false;
            referencedRelation: "trainers";
            referencedColumns: ["id"];
          },
        ];
      };
      feed_events: {
        Row: {
          id: string;
          type: FeedEventType;
          trainer_id: string | null;
          species: string | null;
          is_shiny: boolean;
          coordinates: EventCoordinates | null;
          gym_leader_name: string | null;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: FeedEventType;
          trainer_id?: string | null;
          species?: string | null;
          is_shiny?: boolean;
          coordinates?: EventCoordinates | null;
          gym_leader_name?: string | null;
          message?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["feed_events"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "feed_events_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: false;
            referencedRelation: "trainers";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

export type Trainer = Database["public"]["Tables"]["trainers"]["Row"];
export type Pokemon = Database["public"]["Tables"]["pokemons"]["Row"];
export type FeedEvent = Database["public"]["Tables"]["feed_events"]["Row"];

/** Evento de feed já acompanhado dos dados do treinador (via join). */
export type FeedEventWithTrainer = FeedEvent & {
  trainer: Pick<Trainer, "id" | "username" | "display_name" | "skin_url"> | null;
};
