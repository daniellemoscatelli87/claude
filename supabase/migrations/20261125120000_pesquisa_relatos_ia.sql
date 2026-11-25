-- Cache do agrupamento dos relatos de pesquisa por temas, feito com IA (função relatos-ia).
-- Só a função (chave de serviço) lê e grava: RLS ligada e sem políticas para o público ou para usuários logados.
-- conteudo: { temas: [{ nome, resumo, ids }], sintese, modelo }; ids são identificadores de pesquisa_respostas.
create table if not exists public.pesquisa_relatos_ia (
  hash text primary key,
  pesquisa text not null references public.pesquisas(slug) on delete cascade,
  conteudo jsonb not null,
  base integer not null,
  gerado_em timestamptz not null default now()
);
create index if not exists pesquisa_relatos_ia_pesquisa_idx on public.pesquisa_relatos_ia (pesquisa, gerado_em desc);
alter table public.pesquisa_relatos_ia enable row level security;
