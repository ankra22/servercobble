-- ============================================================================
-- Cobblemon Tracker — schema do Supabase
-- ============================================================================
-- Este script é a fonte da verdade do banco. Rode no SQL Editor do Supabase
-- (Dashboard > SQL Editor > New query) num projeto novo.
--
-- O preenchimento das tabelas é feito pelo script Python (fora deste repo),
-- que lê os logs do servidor e insere os registros usando a service_role key.
-- O site (Next.js) só LÊ os dados, com a chave anônima (anon key) — por isso
-- as policies de RLS abaixo liberam apenas SELECT para o público.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- trainers
-- ----------------------------------------------------------------------------
create table if not exists public.trainers (
  id            uuid primary key default gen_random_uuid(),
  username      text not null unique,
  display_name  text not null,
  skin_url      text,
  badges_count  integer not null default 0,
  created_at    timestamptz not null default now()
);

comment on table public.trainers is 'Jogadores/treinadores do servidor Cobblemon.';
comment on column public.trainers.username is 'Username exato do Minecraft (usado nas URLs de perfil).';

create index if not exists trainers_username_idx on public.trainers (username);

-- ----------------------------------------------------------------------------
-- pokemons
-- ----------------------------------------------------------------------------
create table if not exists public.pokemons (
  id              uuid primary key default gen_random_uuid(),
  trainer_id      uuid not null references public.trainers (id) on delete cascade,
  species         text not null,
  nickname        text,
  level           integer not null default 1,
  is_shiny        boolean not null default false,
  nature          text,
  ability         text,
  held_item       text,
  location        text not null default 'pc' check (location in ('team', 'pc')),
  ivs             jsonb not null default '{}'::jsonb,
  caught_at       timestamptz not null default now(),
  caught_location text
);

comment on table public.pokemons is 'Pokémon capturados por cada treinador (time atual + PC).';
comment on column public.pokemons.ivs is 'IVs em formato jsonb, ex: {"hp":31,"atk":12,"def":20,"spa":31,"spd":18,"spe":25}.';
comment on column public.pokemons.location is 'Onde o Pokémon está agora: "team" (time ativo) ou "pc" (armazenado).';

create index if not exists pokemons_trainer_id_idx on public.pokemons (trainer_id);
create index if not exists pokemons_trainer_location_idx on public.pokemons (trainer_id, location);
create index if not exists pokemons_caught_at_idx on public.pokemons (caught_at desc);

-- ----------------------------------------------------------------------------
-- feed_events
-- ----------------------------------------------------------------------------
create table if not exists public.feed_events (
  id              uuid primary key default gen_random_uuid(),
  type            text not null check (
                    type in (
                      'rare_spawn',
                      'capture',
                      'gym_defeat',
                      'evolution',
                      'level_up',
                      'shiny_found'
                    )
                  ),
  trainer_id      uuid references public.trainers (id) on delete cascade,
  species         text,
  is_shiny        boolean not null default false,
  coordinates     jsonb,
  gym_leader_name text,
  message         text,
  created_at      timestamptz not null default now()
);

comment on table public.feed_events is 'Linha do tempo de eventos capturados dos logs do servidor, exibida no feed ao vivo.';
comment on column public.feed_events.coordinates is 'Coordenadas do evento em jsonb, ex: {"x":120,"y":64,"z":-340,"dimension":"overworld"}.';
comment on column public.feed_events.message is 'Texto humano pronto, gerado pelo script Python; a UI usa como legenda principal do card.';

create index if not exists feed_events_created_at_idx on public.feed_events (created_at desc);
create index if not exists feed_events_trainer_id_idx on public.feed_events (trainer_id);
create index if not exists feed_events_type_idx on public.feed_events (type);

-- ----------------------------------------------------------------------------
-- Row Level Security — leitura pública, escrita só via service_role
-- ----------------------------------------------------------------------------
alter table public.trainers enable row level security;
alter table public.pokemons enable row level security;
alter table public.feed_events enable row level security;

drop policy if exists "trainers are publicly readable" on public.trainers;
create policy "trainers are publicly readable"
  on public.trainers for select
  using (true);

drop policy if exists "pokemons are publicly readable" on public.pokemons;
create policy "pokemons are publicly readable"
  on public.pokemons for select
  using (true);

drop policy if exists "feed_events are publicly readable" on public.feed_events;
create policy "feed_events are publicly readable"
  on public.feed_events for select
  using (true);

-- Nenhuma policy de insert/update/delete é criada de propósito: o script
-- Python usa a service_role key, que ignora RLS. O site nunca escreve.

-- ----------------------------------------------------------------------------
-- Realtime — habilita a publicação para a tabela usada pelo feed ao vivo
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.feed_events;

-- Opcional: se quiser refletir capturas/evoluções na página de perfil em
-- tempo real também, descomente as linhas abaixo.
-- alter publication supabase_realtime add table public.pokemons;
-- alter publication supabase_realtime add table public.trainers;
