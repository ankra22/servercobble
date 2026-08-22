# Cobblemon Tracker

Site para acompanhar em tempo real os treinadores de um servidor Cobblemon:
capturas, shinies, evoluções, spawns raros e batalhas de ginásio, num feed
ao vivo, além de um perfil público por treinador (time atual, PC, badges e
estatísticas).

**Stack:** Next.js (App Router) · Supabase (Postgres + Realtime) · Tailwind CSS v4 · deploy na Vercel.

O preenchimento do banco é feito pelo coletor em [`collector/`](./collector) —
um mod Fabric/Kotlin que roda dentro do servidor Minecraft (escuta os
eventos do Cobblemon) mais um script Python que lê o que o mod escreve e
insere no Supabase usando a `service_role key`. Os dados do jogo
(`trainers`, `pokemons`, `feed_events`) são **somente leitura** pelo site —
ele usa a `anon key` e consome via client Supabase + `postgres_changes`
(Realtime).

Login é opcional (via [Clerk](https://clerk.com)) e serve só pra salvar
preferências do usuário (`user_preferences`, ex.: espécie que ele está de
olho) — essa tabela é a única em que o site escreve, sempre a partir de uma
Server Action que confere a sessão do Clerk no servidor e usa a
`service_role key` (nunca a `anon key`, nunca direto do navegador). Ver
`src/lib/preferences.ts` e `src/lib/supabase/admin.ts`.

## Estrutura do banco

O schema completo está em [`supabase/schema.sql`](./supabase/schema.sql) —
tabelas `trainers`, `pokemons`, `feed_events` (leitura pública, sem escrita
pela anon key) e `user_preferences` (sem policy pública nenhuma — só a
service_role acessa), com índices e a publicação Realtime habilitada em
`feed_events`.

## Rodando localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um projeto no [Supabase](https://supabase.com) e rode o script
   `supabase/schema.sql` no SQL Editor do projeto.

3. Copie o arquivo de exemplo de variáveis de ambiente e preencha (Supabase:
   Project Settings → API; Clerk: dashboard.clerk.com → API Keys, ou
   `vercel integration add clerk`):

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
    feed/                       # LiveFeed (realtime), cards, filtros, busca por espécie
    trainer/                    # Cards de treinador/Pokémon, tabs time/PC, badges
    layout/                     # Header (com login Clerk), Footer
  lib/
    supabase/                   # Clients: browser + server (anon, leitura) e admin (service_role, só Server Actions)
    queries/                    # Funções de leitura (feed, treinadores, stats)
    preferences.ts              # Server Actions de preferências do usuário logado (Clerk)
    database.types.ts           # Tipos gerados à mão a partir do schema.sql
  proxy.ts                      # Ativa a sessão do Clerk (não bloqueia rotas — site continua público)
collector/                      # Coletor (mod Kotlin + ingestor Python) — ver collector/README.md
```

## Deploy na Vercel

1. Suba o repositório pro GitHub e importe na Vercel (ou use `vercel deploy`).
2. Configure as env vars do projeto na Vercel — todas as do `.env.local.example`
   (Supabase + Clerk). Já estão registradas em Development/Production neste
   projeto (`vercel env ls` pra conferir); `vercel integration add clerk`
   provisiona as duas do Clerk automaticamente num projeto novo.
3. Deploy. Não há build steps extras: é um Next.js padrão. Analytics
   (`@vercel/analytics`) já vem plugado no layout — visitas aparecem no
   dashboard da Vercel assim que o deploy estiver no ar.

## Identidade visual

Tema fixo escuro ("tela de PC de Pokémon"), com tipografia Space Grotesk
(display) + JetBrains Mono (dados/coordenadas/IVs), paleta de cores por tipo
de evento (spawn raro, captura, ginásio, evolução, level up, shiny) definida
em `src/app/globals.css` e `src/lib/tone-classes.ts`, e avatares recortados
diretamente da skin Minecraft do treinador (`src/components/TrainerAvatar.tsx`).
