-- Galeria de profissionais da Rede de Parceiros: autorização de exibição do perfil (LGPD: consentimento
-- específico, informado, registrado e revogável).
-- cadastros: token pessoal do link de autorização, situação atual, cargo curto escolhido pelo parceiro,
--            data do convite enviado e foto (URL salva pela administradora; por padrão, a do LinkedIn).
alter table public.cadastros
  add column if not exists galeria_token uuid not null default gen_random_uuid(),
  add column if not exists galeria_status text check (galeria_status in ('autorizado', 'recusado')),
  add column if not exists galeria_decidido_em timestamptz,
  add column if not exists galeria_cargo text,
  add column if not exists galeria_linkedin text,
  add column if not exists galeria_foto_url text,
  add column if not exists galeria_convite_em timestamptz;
create unique index if not exists cadastros_galeria_token_idx on public.cadastros (galeria_token);

-- Histórico imutável de cada decisão (prova do consentimento): o texto exato exibido, a versão,
-- o que seria publicado e o navegador usado. Só a administradora lê; a gravação é feita pela função.
create table if not exists public.galeria_autorizacoes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  cadastro_id uuid not null references public.cadastros (id) on delete cascade,
  decisao text not null check (decisao in ('autorizado', 'recusado')),
  texto_versao text not null,
  texto text not null,
  dados_exibidos jsonb not null default '{}'::jsonb,
  user_agent text
);
alter table public.galeria_autorizacoes enable row level security;
create policy "Admin lê autorizações da galeria" on public.galeria_autorizacoes for select to authenticated using ((select is_admin()));

-- Galeria pública: só dados profissionais de quem está com autorização ativa (nunca e-mail, telefone ou cidade).
create or replace function public.galeria_publica()
returns table (nome text, cargo text, areas text[], segmentos text[], linkedin text, foto_url text)
language sql stable security definer set search_path = '' as $$
  select c.nome, c.galeria_cargo, c.areas_experiencia, c.segmentos, c.galeria_linkedin, c.galeria_foto_url
  from public.cadastros c
  where c.galeria_status = 'autorizado'
  order by c.galeria_decidido_em;
$$;
revoke all on function public.galeria_publica() from public;
grant execute on function public.galeria_publica() to anon, authenticated;
