-- Rastreamento dos e-mails da Rede de Parceiros: entrega, abertura e clique de cada e-mail enviado pelo Resend
-- (convite da galeria e comunicados), associados ao cadastro do parceiro e avisados no painel da administradora.
-- A abertura é uma estimativa (alguns programas abrem o e-mail sozinhos; outros bloqueiam imagens).

-- 1) Um registro por e-mail enviado (gravado pelas funções de envio, com a chave de serviço).
create table if not exists public.email_envios (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  resend_id text not null unique,
  cadastro_id uuid not null references public.cadastros(id) on delete cascade,
  origem text not null check (origem in ('galeria-convite', 'comunicado')),
  assunto text not null,
  comunicado_id uuid references public.comunicados(id) on delete set null,
  entregue_em timestamptz,
  aberto_em timestamptz,
  ultimo_aberto_em timestamptz,
  aberturas integer not null default 0,
  clicado_em timestamptz,
  ultimo_clique_em timestamptz,
  cliques integer not null default 0,
  ultimo_link text,
  -- quando a administradora viu o aviso (abriu o perfil); volta a vazio na primeira abertura e no primeiro clique
  visualizado_em timestamptz
);
create index if not exists email_envios_cadastro_idx on public.email_envios (cadastro_id, created_at desc);
create index if not exists email_envios_avisos_idx on public.email_envios (created_at desc)
  where visualizado_em is null and (aberto_em is not null or clicado_em is not null);
alter table public.email_envios enable row level security;
create policy "Admin lê envios de e-mail" on public.email_envios for select to authenticated using ((select is_admin()));
create policy "Admin marca aviso de e-mail como visto" on public.email_envios for update to authenticated
  using ((select is_admin())) with check ((select is_admin()));
revoke update on public.email_envios from authenticated;
grant update (visualizado_em) on public.email_envios to authenticated;

-- 2) Eventos recebidos do Resend (um por aviso; o svix_id evita contar o mesmo aviso duas vezes).
create table if not exists public.email_eventos (
  id bigint generated always as identity primary key,
  svix_id text not null unique,
  envio_id uuid not null references public.email_envios(id) on delete cascade,
  tipo text not null check (tipo in ('entregue', 'aberto', 'clicado')),
  link text,
  ocorrido_em timestamptz not null,
  recebido_em timestamptz not null default now()
);
create index if not exists email_eventos_envio_idx on public.email_eventos (envio_id, ocorrido_em);
alter table public.email_eventos enable row level security;
create policy "Admin lê eventos de e-mail" on public.email_eventos for select to authenticated using ((select is_admin()));

-- 3) Registro atômico de um evento (chamado só pela função email-eventos, com a chave de serviço).
--    E-mails que não estão em email_envios (respostas de contato etc.) são ignorados.
create or replace function public.registrar_email_evento(p_svix_id text, p_resend_id text, p_tipo text, p_link text, p_quando timestamptz)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_envio public.email_envios;
  v_inserido bigint;
begin
  select * into v_envio from public.email_envios where resend_id = p_resend_id;
  if not found then return 'ignorado'; end if;
  insert into public.email_eventos (svix_id, envio_id, tipo, link, ocorrido_em)
    values (p_svix_id, v_envio.id, p_tipo, left(p_link, 2000), p_quando)
    on conflict (svix_id) do nothing
    returning id into v_inserido;
  if v_inserido is null then return 'repetido'; end if;
  if p_tipo = 'entregue' then
    update public.email_envios set entregue_em = coalesce(entregue_em, p_quando) where id = v_envio.id;
  elsif p_tipo = 'aberto' then
    update public.email_envios set
      aberto_em = least(coalesce(aberto_em, p_quando), p_quando),
      ultimo_aberto_em = greatest(coalesce(ultimo_aberto_em, p_quando), p_quando),
      aberturas = aberturas + 1,
      visualizado_em = case when aberto_em is null then null else visualizado_em end
    where id = v_envio.id;
  elsif p_tipo = 'clicado' then
    update public.email_envios set
      clicado_em = least(coalesce(clicado_em, p_quando), p_quando),
      ultimo_clique_em = greatest(coalesce(ultimo_clique_em, p_quando), p_quando),
      cliques = cliques + 1,
      ultimo_link = left(p_link, 2000),
      visualizado_em = case when clicado_em is null then null else visualizado_em end
    where id = v_envio.id;
  end if;
  return 'registrado';
end;
$$;
revoke all on function public.registrar_email_evento(text, text, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.registrar_email_evento(text, text, text, text, timestamptz) to service_role;
