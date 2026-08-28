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
  id              uuid primary key default gen_random_uuid(),
  username        text not null unique,
  display_name    text not null,
  skin_url        text,
  badges_count    integer not null default 0,
  current_series  text default 'kanto',
  created_at      timestamptz not null default now()
);

-- Migração idempotente pra bancos já provisionados antes desta coluna existir.
alter table public.trainers add column if not exists current_series text;
-- Todo treinador novo começa em Kanto (regra do servidor). O coletor também
-- passa 'kanto' explícito ao criar, mas o default cobre qualquer outro insert.
alter table public.trainers alter column current_series set default 'kanto';

comment on table public.trainers is 'Jogadores/treinadores do servidor Cobblemon.';
comment on column public.trainers.username is 'Username exato do Minecraft (usado nas URLs de perfil).';
comment on column public.trainers.current_series is 'Id da série/região atual do jogador no rctmod (ex.: "kanto") — começa em "kanto" e é sincronizado a cada ~60s pelo coletor (region_snapshot). Usado pra saber quem está "presente" em cada região em /regioes.';

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
  caught_location text,
  game_uuid       uuid unique
);

-- Migração idempotente pra bancos já provisionados antes desta coluna existir
-- (roda antes dos comments abaixo, já que "create table if not exists" é
-- ignorado quando a tabela já existe — e nesse caso a coluna nova do bloco
-- acima nunca chega a ser criada).
alter table public.pokemons add column if not exists game_uuid uuid unique;

comment on table public.pokemons is 'Pokémon capturados por cada treinador (time atual + PC).';
comment on column public.pokemons.ivs is 'IVs em formato jsonb, ex: {"hp":31,"atk":12,"def":20,"spa":31,"spd":18,"spe":25}.';
comment on column public.pokemons.location is 'Onde o Pokémon está agora: "team" (time ativo) ou "pc" (armazenado).';
comment on column public.pokemons.game_uuid is 'UUID interno do Pokémon no Cobblemon (Pokemon.uuid) — usado pelo coletor pra upsert idempotente e pra localizar o registro em evolução/level up.';

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
                      'shiny_found',
                      'breeding'
                    )
                  ),
  trainer_id      uuid references public.trainers (id) on delete cascade,
  species         text,
  is_shiny        boolean not null default false,
  coordinates     jsonb,
  gym_leader_name text,
  series          text,
  rank            text check (rank in ('gym', 'elite_four', 'champion')),
  message         text,
  created_at      timestamptz not null default now(),
  source_event_id uuid unique,
  rarity          text check (rarity in ('rare', 'ultra-rare'))
);

-- Migração idempotente pra bancos já provisionados antes destas colunas
-- existirem (ver comentário equivalente no bloco de pokemons acima).
alter table public.feed_events add column if not exists source_event_id uuid unique;
alter table public.feed_events add column if not exists rarity text check (rarity in ('rare', 'ultra-rare'));
alter table public.feed_events add column if not exists series text;
alter table public.feed_events add column if not exists rank text check (rank in ('gym', 'elite_four', 'champion'));

-- 'breeding' entrou depois (ovo gerado / ovo chocado). Recria o check do
-- `type` pra bancos já provisionados — o `create table` acima só vale na
-- primeira vez.
alter table public.feed_events drop constraint if exists feed_events_type_check;
alter table public.feed_events add constraint feed_events_type_check check (
  type in ('rare_spawn', 'capture', 'gym_defeat', 'evolution', 'level_up', 'shiny_found', 'breeding')
);

comment on table public.feed_events is 'Linha do tempo de eventos capturados dos logs do servidor, exibida no feed ao vivo.';
comment on column public.feed_events.rarity is 'Só preenchido em eventos "rare_spawn": raridade do bucket de spawn do Cobblemon ("rare" ou "ultra-rare"). O feed principal só mostra ultra-rare; a aba "Spawns raros" mostra os dois.';
comment on column public.feed_events.coordinates is 'Coordenadas do evento em jsonb, ex: {"x":120,"y":64,"z":-340,"dimension":"overworld"}.';
comment on column public.feed_events.message is 'Texto humano pronto, gerado pelo script Python; a UI usa como legenda principal do card.';
comment on column public.feed_events.source_event_id is 'UUID gerado pelo coletor no momento do evento — evita duplicar a linha do feed se o ingestor reprocessar o arquivo de eventos.';
comment on column public.feed_events.series is 'Só preenchido em eventos "gym_defeat": id da série/região do rctmod que o treinador pertence (ex.: "kanto", "johto", "hoenn", "sinnoh") — usado pela aba /regioes.';
comment on column public.feed_events.rank is 'Só preenchido em eventos "gym_defeat": "gym" (líder de ginásio), "elite_four" ou "champion".';

create index if not exists feed_events_created_at_idx on public.feed_events (created_at desc);
create index if not exists feed_events_trainer_id_idx on public.feed_events (trainer_id);
create index if not exists feed_events_type_idx on public.feed_events (type);
create index if not exists feed_events_series_idx on public.feed_events (series) where series is not null;

-- ----------------------------------------------------------------------------
-- user_preferences
-- ----------------------------------------------------------------------------
-- Preferências por usuário logado (login via Clerk, não via Supabase Auth).
-- `clerk_user_id` é o id do usuário no Clerk (ex.: "user_2abc..."), não um
-- uuid — por isso é `text`. Não tem policy pública nenhuma: só o site grava
-- e lê isso, sempre a partir de uma Server Action que confere a sessão
-- Clerk no servidor e usa a service_role key (ver src/lib/supabase/admin.ts).
-- Reservada pra preferências futuras que sejam "um valor só" por usuário —
-- a lista de espécies observadas mora em `watched_species` (tabela própria
-- logo abaixo, porque é um-pra-muitos).
create table if not exists public.user_preferences (
  id              uuid primary key default gen_random_uuid(),
  clerk_user_id   text not null unique,
  updated_at      timestamptz not null default now()
);

comment on table public.user_preferences is 'Preferências "de valor único" por treinador logado (Clerk).';
comment on column public.user_preferences.clerk_user_id is 'Id do usuário no Clerk (auth), não um id do Supabase.';

-- Migração idempotente: essa coluna existia numa versão anterior (uma só
-- espécie por usuário), substituída pela tabela watched_species abaixo.
alter table public.user_preferences drop column if exists watched_species;

create index if not exists user_preferences_clerk_user_id_idx on public.user_preferences (clerk_user_id);

-- ----------------------------------------------------------------------------
-- watched_species
-- ----------------------------------------------------------------------------
-- Lista de espécies que cada usuário logado marcou como "de olho" — o feed
-- destaca em vermelho qualquer evento dessas espécies. Um-pra-muitos por
-- treinador, por isso é tabela própria (não uma coluna em user_preferences).
create table if not exists public.watched_species (
  id            uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  species       text not null,
  created_at    timestamptz not null default now(),
  unique (clerk_user_id, species)
);

comment on table public.watched_species is 'Espécies que o usuário logado (Clerk) marcou como preferidas — destaque no feed.';
comment on column public.watched_species.species is 'Nome normalizado da espécie (lowercase), mesmo formato usado em pokemons.species/feed_events.species.';

create index if not exists watched_species_clerk_user_id_idx on public.watched_species (clerk_user_id);

-- ----------------------------------------------------------------------------
-- Row Level Security — leitura pública, escrita só via service_role
-- ----------------------------------------------------------------------------
alter table public.trainers enable row level security;
alter table public.pokemons enable row level security;
alter table public.feed_events enable row level security;
alter table public.user_preferences enable row level security;
alter table public.watched_species enable row level security;

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

-- Nenhuma policy de insert/update/delete é criada em trainers/pokemons/
-- feed_events de propósito: o coletor usa a service_role key, que ignora
-- RLS. Nenhuma policy é criada em user_preferences/watched_species também —
-- nem select público: só a service_role (via Server Action autenticada pelo
-- Clerk) lê ou escreve ali, então RLS fica de propósito sem nenhuma policy
-- (bloqueia geral pra anon key).

-- ----------------------------------------------------------------------------
-- Realtime — habilita a publicação para a tabela usada pelo feed ao vivo
-- ----------------------------------------------------------------------------
-- "alter publication ... add table" não aceita "if not exists", então o
-- check abaixo é o que torna esse bloco seguro de rodar de novo num banco
-- que já tinha a tabela publicada.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'feed_events'
  ) then
    alter publication supabase_realtime add table public.feed_events;
  end if;
end $$;

-- Opcional: se quiser refletir capturas/evoluções na página de perfil em
-- tempo real também, descomente as linhas abaixo (mesmo padrão do bloco
-- acima pra ficarem seguras de rodar de novo).
-- do $$
-- begin
--   if not exists (
--     select 1 from pg_publication_tables
--     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'pokemons'
--   ) then
--     alter publication supabase_realtime add table public.pokemons;
--   end if;
-- end $$;
--
-- do $$
-- begin
--   if not exists (
--     select 1 from pg_publication_tables
--     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'trainers'
--   ) then
--     alter publication supabase_realtime add table public.trainers;
--   end if;
-- end $$;
