-- Pesquisas do Studio (Projetos > Pesquisas). Primeira: hábitos de compra de moda em Curitiba.
-- Respostas e contatos de quem quer novidades ficam em tabelas separadas, sem ligação entre si.
-- O site grava pela função pesquisa (chave de serviço); o público não lê nem escreve direto nas tabelas.

create table public.pesquisas (
  slug text primary key check (slug ~ '^[a-z0-9-]{3,60}$'),
  titulo text not null,
  ativa boolean not null default true,
  criada_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
alter table public.pesquisas enable row level security;
create policy "Admin vê pesquisas" on public.pesquisas for select to authenticated using (public.is_admin());
create policy "Admin liga e desliga pesquisas" on public.pesquisas for update to authenticated using (public.is_admin()) with check (public.is_admin());
revoke all on public.pesquisas from anon, authenticated;
grant select on public.pesquisas to authenticated;
grant update (ativa, atualizado_em) on public.pesquisas to authenticated;

create table public.pesquisa_respostas (
  id uuid primary key default gen_random_uuid(),
  pesquisa text not null references public.pesquisas(slug) on delete cascade,
  envio_id uuid not null unique,               -- gerado no navegador: o mesmo envio repetido não duplica
  created_at timestamptz not null default now(),
  situacao text not null check (situacao in ('completa', 'fora_de_curitiba', 'sem_compras')),
  versao_questionario text not null,
  respostas jsonb not null,
  relato text check (relato is null or char_length(relato) <= 2000),
  quer_novidades boolean,
  visualizado_em timestamptz                    -- quando a administradora viu (para as notificações)
);
create index pesquisa_respostas_pesquisa_idx on public.pesquisa_respostas (pesquisa, created_at desc);
alter table public.pesquisa_respostas enable row level security;
create policy "Admin vê respostas" on public.pesquisa_respostas for select to authenticated using (public.is_admin());
create policy "Admin marca respostas como vistas" on public.pesquisa_respostas for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admin exclui respostas" on public.pesquisa_respostas for delete to authenticated using (public.is_admin());
revoke all on public.pesquisa_respostas from anon, authenticated;
grant select, delete on public.pesquisa_respostas to authenticated;
grant update (visualizado_em) on public.pesquisa_respostas to authenticated;

create table public.pesquisa_interessados (
  id uuid primary key default gen_random_uuid(),
  pesquisa text not null references public.pesquisas(slug) on delete cascade,
  envio_id uuid not null unique,               -- outro identificador, sem relação com o da resposta
  created_at timestamptz not null default now(),
  nome text not null check (char_length(nome) between 1 and 120),
  email text not null check (char_length(email) <= 254 and email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  whatsapp text not null check (whatsapp ~ '^[1-9][0-9]{9,10}$'),
  consentimento_em timestamptz not null,
  consentimento_versao text not null,
  consentimento_texto text not null
);
create index pesquisa_interessados_pesquisa_idx on public.pesquisa_interessados (pesquisa, created_at desc);
alter table public.pesquisa_interessados enable row level security;
create policy "Admin vê interessados" on public.pesquisa_interessados for select to authenticated using (public.is_admin());
create policy "Admin exclui interessados" on public.pesquisa_interessados for delete to authenticated using (public.is_admin());
revoke all on public.pesquisa_interessados from anon, authenticated;
grant select, delete on public.pesquisa_interessados to authenticated;

insert into public.pesquisas (slug, titulo, ativa) values ('moda-curitiba', 'Hábitos e experiências de compra de moda em Curitiba', true);
