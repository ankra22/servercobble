# Cobblemon Tracker

Site para acompanhar em tempo real os treinadores de um servidor Cobblemon:
capturas, shinies, evoluções, spawns raros e batalhas de ginásio, num feed
ao vivo, além de um perfil público por treinador (time atual, PC, badges e
estatísticas).

**Stack:** Next.js (App Router) · Supabase (Postgres + Realtime) · Tailwind CSS v4 · deploy na Vercel.

O preenchimento do banco é feito por um script Python externo (fora deste
repositório), que lê os logs do servidor Minecraft e insere os dados no
Supabase usando a `service_role key`. Este site é **somente leitura**: usa a
`anon key` e consome os dados via client Supabase + `postgres_changes`
(Realtime).

## Estrutura do banco

O schema completo está em [`supabase/schema.sql`](./supabase/schema.sql) —
tabelas `trainers`, `pokemons` e `feed_events`, com índices, Row Level
Security (leitura pública, sem escrita pela anon key) e a publicação
Realtime habilitada em `feed_events`.

## Rodando localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um projeto no [Supabase](https://supabase.com) e rode o script
   `supabase/schema.sql` no SQL Editor do projeto.

3. Copie o arquivo de exemplo de variáveis de ambiente e preencha com a URL
   e a `anon key` do seu projeto (Project Settings → API):

   ```bash
   cp .env.local.example .env.local
   ```

4. Suba o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Abra [http://localhost:3000](http://localhost:3000). Sem as variáveis de
   ambiente preenchidas, as páginas mostram uma tela de instruções em vez de
   quebrar.

## Estrutura do projeto

```
src/
  app/
    page.tsx                    # Home — feed ao vivo + estatísticas do servidor
    trainers/page.tsx           # Diretório de treinadores (com busca)
    trainers/[username]/page.tsx  # Perfil: time, PC, badges, stats, atividade
  components/
    feed/                       # LiveFeed (realtime), cards, filtros, skeleton
    trainer/                    # Cards de treinador/Pokémon, tabs time/PC, badges
    layout/                     # Header, Footer
  lib/
    supabase/                   # Clients (browser + server, via @supabase/ssr)
    queries/                    # Funções de leitura (feed, treinadores, stats)
    database.types.ts           # Tipos gerados à mão a partir do schema.sql
```

## Deploy na Vercel

1. Suba o repositório pro GitHub e importe na Vercel (ou use `vercel deploy`).
2. Configure as env vars do projeto na Vercel (`NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) — as mesmas do `.env.local`.
3. Deploy. Não há build steps extras: é um Next.js padrão.

## Identidade visual

Tema fixo escuro ("tela de PC de Pokémon"), com tipografia Space Grotesk
(display) + JetBrains Mono (dados/coordenadas/IVs), paleta de cores por tipo
de evento (spawn raro, captura, ginásio, evolução, level up, shiny) definida
em `src/app/globals.css` e `src/lib/tone-classes.ts`, e avatares recortados
diretamente da skin Minecraft do treinador (`src/components/TrainerAvatar.tsx`).
