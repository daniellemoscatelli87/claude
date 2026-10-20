-- DM | Experience Intelligence · acesso da usuária master (D-011).
-- A usuária master (Dani Moscatelli) vê todos os projetos de todos os clientes. Todo acesso passa por
-- funções que registram quem viu o quê e quando:
--   * na auditoria da organização do cliente (audit_events), que a administração do cliente consegue ler;
--   * no registro da plataforma (master_access_log), inclusive para listagens gerais.
-- A master NÃO recebe leitura direta nas tabelas (RLS continua só para membros): sem a função, sem acesso,
-- e portanto nenhum acesso sem registro.
-- Quem é master: app_metadata.ei_master = true (definido só no servidor; separado do papel admin do site).

create table public.master_access_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users (id),
  action text not null,
  organization_id uuid references public.organizations (id) on delete set null,
  entity_id uuid,
  created_at timestamptz not null default now()
);
create index master_access_log_created_idx on public.master_access_log (created_at desc);
alter table public.master_access_log enable row level security;
revoke all on public.master_access_log from anon, authenticated;

create or replace function public.ei_is_master()
returns boolean language sql stable set search_path = '' as $$
  select coalesce((select auth.jwt() -> 'app_metadata' ->> 'ei_master')::boolean, false)
$$;

create or replace function public.ei_master_registrar(p_action text, p_org uuid, p_entity uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.master_access_log (actor_id, action, organization_id, entity_id) values (auth.uid(), p_action, p_org, p_entity);
  if p_org is not null then
    insert into public.audit_events (organization_id, actor_id, entity_type, entity_id, event_type, metadata_json)
      values (p_org, auth.uid(), case when p_entity is null then 'organization' else 'challenge' end,
              coalesce(p_entity, p_org), p_action, jsonb_build_object('by', 'platform_master'));
  end if;
end $$;

-- Lista de organizações clientes (dados de cadastro e contagens, sem conteúdo dos desafios).
create or replace function public.ei_master_organizations()
returns table (id uuid, name text, industry text, created_at timestamptz, members bigint, challenges bigint)
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.ei_is_master() then raise exception 'Acesso restrito.' using errcode = '42501'; end if;
  perform public.ei_master_registrar('master.listed_organizations', null, null);
  return query
    select o.id, o.name, o.industry, o.created_at,
      (select count(*) from public.organization_members m where m.organization_id = o.id),
      (select count(*) from public.challenges c where c.organization_id = o.id)
    from public.organizations o order by o.created_at desc;
end $$;

-- Desafios de uma organização (título, fase, datas). Registrado na auditoria do cliente.
create or replace function public.ei_master_challenges(p_org uuid)
returns table (id uuid, title text, original_statement text, current_phase text, structure_status text, created_at timestamptz, updated_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.ei_is_master() then raise exception 'Acesso restrito.' using errcode = '42501'; end if;
  perform public.ei_master_registrar('master.listed_challenges', p_org, null);
  return query
    select c.id, c.title, c.original_statement, c.current_phase, c.structure_status, c.created_at, c.updated_at
    from public.challenges c where c.organization_id = p_org order by c.created_at desc;
end $$;

-- Um desafio completo, com as respostas. Registrado na auditoria do cliente.
create or replace function public.ei_master_challenge(p_challenge uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_row public.challenges; v_org text;
begin
  if auth.uid() is null or not public.ei_is_master() then raise exception 'Acesso restrito.' using errcode = '42501'; end if;
  select * into v_row from public.challenges where id = p_challenge;
  if v_row.id is null then return null; end if;
  perform public.ei_master_registrar('master.viewed_challenge', v_row.organization_id, v_row.id);
  select name into v_org from public.organizations where id = v_row.organization_id;
  return jsonb_build_object(
    'organization_name', v_org,
    'challenge', to_jsonb(v_row),
    'answers', coalesce((select jsonb_agg(jsonb_build_object('question_key', q.question_key, 'status', q.status,
      'answer_summary', q.answer_summary, 'unknown_route', q.unknown_route) order by q.updated_at)
      from public.investigation_questions q where q.challenge_id = v_row.id), '[]'::jsonb)
  );
end $$;

revoke execute on function public.ei_is_master(), public.ei_master_registrar(text, uuid, uuid),
  public.ei_master_organizations(), public.ei_master_challenges(uuid), public.ei_master_challenge(uuid) from public, anon;
revoke execute on function public.ei_master_registrar(text, uuid, uuid) from authenticated;
grant execute on function public.ei_is_master(), public.ei_master_organizations(), public.ei_master_challenges(uuid),
  public.ei_master_challenge(uuid) to authenticated;
