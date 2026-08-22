# Coletor de dados do servidor Cobblemon

Preenche o Supabase que o site (`../src`) lê. Tem duas partes que rodam
**fora do Next.js**, ao lado do servidor Minecraft:

```
collector/
  mod/        mod Fabric/Kotlin que roda DENTRO do servidor Minecraft.
              Escuta eventos do Cobblemon e grava cada um como uma linha
              JSON em tracker-events/events.jsonl (dentro da pasta do
              servidor).
  ingester/   script Python que roda AO LADO do servidor (mesma máquina).
              Fica de olho no events.jsonl e insere/atualiza os dados no
              Supabase usando a service_role key.
```

Cobre, por enquanto (Fase 1): **captura, spawn raro/lendário, shiny,
evolução e level up** — os eventos nativos do Cobblemon. Ginásio, raids,
monumentos lendários, breeding e economia (mods de terceiros do Cobbleverse)
ficam para uma Fase 2.

## 1. Buildar e instalar o mod

```bash
cd collector/mod
./gradlew build          # Windows: gradlew.bat build
```

O jar sai em `collector/mod/build/libs/cobblemon-tracker-collector-1.0.0.jar`.
Copie esse arquivo para a pasta `mods/` do servidor (a mesma onde está o
`Cobblemon-fabric-1.7.3+1.21.1.jar`), junto dos outros mods do Cobbleverse.
Não precisa de nenhuma configuração — ao iniciar o servidor ele já começa a
escrever eventos em `tracker-events/events.jsonl` (criado na raiz da pasta
do servidor).

## 2. Rodar o ingestor Python

```bash
cd collector/ingester
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env
```

Preencha o `.env`:
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — do mesmo projeto Supabase
  usado pelo site (Supabase Dashboard → Project Settings → API →
  **service_role**, não a `anon key` que o site usa).
- `EVENTS_FILE_PATH` — caminho completo pro `tracker-events/events.jsonl`
  dentro da pasta do servidor Minecraft.

Depois:

```bash
python ingest.py
```

Deixe rodando num terminal separado enquanto o servidor está de pé — ele
fica olhando o arquivo e processando cada linha nova conforme aparece.

## 3. Aplicar o schema mais recente no Supabase

Se o projeto Supabase já existia antes das colunas `game_uuid` e
`source_event_id`, rode de novo o `supabase/schema.sql` (na raiz do repo) no
SQL Editor — os `alter table ... add column if not exists` são seguros de
rodar de novo, não duplicam nada.

## Testando de ponta a ponta

1. Suba o servidor com o mod instalado e o `ingest.py` rodando.
2. Capture um Pokémon comum — deve aparecer uma linha em
   `tracker-events/events.jsonl` quase na hora, e o `ingest.py` deve logar
   `Processado: capture (...)`.
3. Confira no Supabase (Table Editor) que `trainers`, `pokemons` e
   `feed_events` foram preenchidos.
4. Rode `npm run dev` na raiz do repo e abra a home — o card do evento deve
   aparecer no feed ao vivo (via Supabase Realtime).
5. Evolua ou suba de nível o mesmo Pokémon — confira que a linha em
   `pokemons` foi **atualizada** (mesmo `game_uuid`), não duplicada.

## Por que dois processos separados?

O mod só sabe escrever no arquivo — nunca fala com o Supabase nem carrega a
`service_role key` (ela nunca entra no processo do servidor de jogo). O
ingestor Python é quem decide como os dados viram linhas no banco, e dá pra
ajustar essa lógica (corrigir um bug, adicionar um campo) sem precisar
recompilar o mod nem reiniciar o servidor — só reiniciar o script Python.
