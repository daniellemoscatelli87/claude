-- Comunicados em massa para a Rede de Parceiros (site do estúdio).
-- 1) Cada parceiro ganha um token secreto para o link "deixar de receber" e a data do descadastro.
--    Descadastrar só interrompe os comunicados em massa; o parceiro continua na rede.
alter table public.cadastros
  add column if not exists comunicados_token uuid not null default gen_random_uuid(),
  add column if not exists comunicados_descadastro_em timestamptz;
create unique index if not exists cadastros_comunicados_token_idx on public.cadastros (comunicados_token);

-- 2) Histórico dos envios (quem enviou, filtros usados, quantos receberam). Só a administradora lê;
--    a gravação é feita pela função de envio com a chave de serviço.
create table if not exists public.comunicados (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  enviado_por uuid,
  assunto text not null,
  titulo text not null,
  mensagem text not null,
  filtros jsonb not null default '{}'::jsonb,
  destinatarios uuid[] not null default '{}',
  enviados integer not null default 0,
  falhas integer not null default 0
);
alter table public.comunicados enable row level security;
create policy "Admin lê comunicados" on public.comunicados for select to authenticated using ((select is_admin()));
