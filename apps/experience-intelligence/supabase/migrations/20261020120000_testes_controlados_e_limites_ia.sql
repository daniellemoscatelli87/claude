-- DM | Experience Intelligence · testes reais controlados e limites de uso da IA (D-014, D-015).
-- 1. Acesso por convite: só pessoas da lista de teste (e-mail confirmado) ou a master criam organizações,
--    criam desafios e usam a IA. Ter conta no Supabase Auth continua não dando acesso a nada.
-- 2. IA com custo controlado: a sugestão fica guardada por desafio e não é pedida de novo ao recarregar
--    a página; há limites por desafio, por pessoa por dia e da plataforma por dia; uma chave liga e
--    desliga a IA sem publicar código. Os limites ficam em ei_settings e podem ser ajustados no banco.

-- ---------- Configuração da plataforma (uma linha só) ----------

create table public.ei_settings (
  id boolean primary key default true check (id),
  ai_enabled boolean not null default true,
  ai_per_challenge integer not null default 3 check (ai_per_challenge >= 0),
  ai_per_user_day integer not null default 20 check (ai_per_user_day >= 0),
  ai_global_day integer not null default 100 check (ai_global_day >= 0),
  updated_at timestamptz not null default now()
);
insert into public.ei_settings (id) values (true);

-- ---------- Lista de pessoas em teste ----------

create table public.ei_testers (
  email text primary key check (email = lower(btrim(email)) and email like '%@%'),
  note text check (char_length(note) <= 200),
  created_at timestamptz not null default now()
);

-- ---------- Uso e sugestões guardadas da IA ----------

create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'started' check (status in ('started', 'succeeded', 'failed')),
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
create index ai_usage_challenge_idx on public.ai_usage (challenge_id);
create index ai_usage_user_day_idx on public.ai_usage (user_id, created_at);
create index ai_usage_created_idx on public.ai_usage (created_at);

create table public.ai_interpretations (
  challenge_id uuid primary key references public.challenges (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  proposal jsonb not null check (jsonb_typeof(proposal) = 'object' and octet_length(proposal::text) <= 20000),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Nenhuma destas tabelas é lida ou escrita direto pelas APIs: só pelas funções abaixo.
alter table public.ei_settings enable row level security;
alter table public.ei_testers enable row level security;
alter table public.ai_usage enable row level security;
alter table public.ai_interpretations enable row level security;
revoke all on public.ei_settings, public.ei_testers, public.ai_usage, public.ai_interpretations from anon, authenticated;

-- ---------- Acesso ----------

-- A pessoa logada pode usar a plataforma: master, ou e-mail confirmado que está na lista de teste.
create or replace function public.ei_has_access()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.ei_is_master() or exists (
    select 1 from auth.users u join public.ei_testers t on t.email = lower(u.email)
    where u.id = (select auth.uid()) and u.email_confirmed_at is not null
  )
$$;

-- Mesmas funções do Corte 1, agora exigindo acesso de teste.
create or replace function public.ei_create_organization(p_name text, p_industry text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_org uuid;
begin
  if v_user is null then raise exception 'Entre na sua conta para continuar.' using errcode = '42501'; end if;
  if not public.ei_has_access() then
    raise exception 'A plataforma está em fase de testes, com acesso por convite.' using errcode = '42501';
  end if;
  insert into public.organizations (name, industry, created_by)
    values (btrim(p_name), nullif(btrim(coalesce(p_industry, '')), ''), v_user) returning id into v_org;
  insert into public.organization_members (organization_id, user_id, role) values (v_org, v_user, 'org_admin');
  insert into public.audit_events (organization_id, actor_id, entity_type, entity_id, event_type)
    values (v_org, v_user, 'organization', v_org, 'organization.created');
  return v_org;
end $$;

create or replace function public.ei_create_challenge(p_org uuid, p_statement text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_row public.challenges;
begin
  if v_user is null then raise exception 'Entre na sua conta para continuar.' using errcode = '42501'; end if;
  if not public.ei_is_member(p_org, array['org_admin', 'manager', 'contributor']) then
    raise exception 'Você não tem permissão para criar desafios nesta organização.' using errcode = '42501';
  end if;
  if not public.ei_has_access() then
    raise exception 'A plataforma está em fase de testes, com acesso por convite.' using errcode = '42501';
  end if;
  insert into public.challenges (organization_id, owner_id, created_by, original_statement)
    values (p_org, v_user, v_user, p_statement) returning * into v_row;
  insert into public.challenge_versions (challenge_id, organization_id, changed_by, snapshot_json, reason)
    values (v_row.id, p_org, v_user, public.ei_snapshot(v_row), 'Descrição original registrada');
  insert into public.audit_events (organization_id, actor_id, entity_type, entity_id, event_type)
    values (p_org, v_user, 'challenge', v_row.id, 'challenge.created');
  return v_row.id;
end $$;

-- ---------- IA: reservar e concluir ----------

-- Chamada pela edge function antes de falar com a IA. Devolve:
--   {status:'cached', proposal, meta}  sugestão já guardada (não chama a IA de novo);
--   {status:'go', usage_id, statement} pode chamar a IA (o uso já foi contado);
--   {status:'confirmed'|'disabled'|'limit'|'busy'|'no_access'} não chamar a IA.
create or replace function public.ei_ai_begin(p_challenge uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_row public.challenges; v_cfg public.ei_settings;
  v_cache public.ai_interpretations; v_usage uuid;
begin
  select * into v_row from public.challenges where id = p_challenge;
  if v_user is null or v_row.id is null or not public.ei_is_member(v_row.organization_id, array['org_admin', 'manager', 'contributor']) then
    raise exception 'Desafio não encontrado.' using errcode = '42501';
  end if;
  if not public.ei_has_access() then return jsonb_build_object('status', 'no_access'); end if;
  if v_row.structure_status <> 'pending' then return jsonb_build_object('status', 'confirmed'); end if;

  select * into v_cache from public.ai_interpretations where challenge_id = p_challenge;
  if v_cache.challenge_id is not null then
    return jsonb_build_object('status', 'cached', 'proposal', v_cache.proposal, 'meta', v_cache.meta);
  end if;

  -- Uma reserva por vez em toda a plataforma: os limites não são furados por chamadas simultâneas.
  perform pg_advisory_xact_lock(hashtext('ei_ai_begin'));
  select * into v_cfg from public.ei_settings where id;
  if not coalesce(v_cfg.ai_enabled, false) then return jsonb_build_object('status', 'disabled'); end if;
  if exists (select 1 from public.ai_usage where challenge_id = p_challenge and status = 'started'
             and created_at > now() - interval '2 minutes') then
    return jsonb_build_object('status', 'busy');
  end if;
  if (select count(*) from public.ai_usage where challenge_id = p_challenge) >= v_cfg.ai_per_challenge
     or (select count(*) from public.ai_usage where user_id = v_user and created_at > now() - interval '1 day') >= v_cfg.ai_per_user_day
     or (select count(*) from public.ai_usage where created_at > now() - interval '1 day') >= v_cfg.ai_global_day then
    return jsonb_build_object('status', 'limit');
  end if;

  insert into public.ai_usage (challenge_id, organization_id, user_id)
    values (p_challenge, v_row.organization_id, v_user) returning id into v_usage;
  return jsonb_build_object('status', 'go', 'usage_id', v_usage, 'statement', v_row.original_statement);
end $$;

-- Chamada pela edge function depois da IA. Guarda a sugestão (se houver) e registra na auditoria
-- modelo e versão do prompt. Substitui ei_log_interpretation.
create or replace function public.ei_ai_finish(p_usage uuid, p_proposal jsonb default null, p_meta jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_use public.ai_usage; v_meta jsonb;
begin
  select * into v_use from public.ai_usage where id = p_usage for update;
  if v_user is null or v_use.id is null or v_use.user_id <> v_user or v_use.status <> 'started' then
    raise exception 'Uso da IA não encontrado.' using errcode = '42501';
  end if;
  v_meta := jsonb_build_object('model', left(coalesce(p_meta ->> 'model', ''), 80),
                               'prompt_version', left(coalesce(p_meta ->> 'prompt_version', ''), 80));
  update public.ai_usage set status = case when p_proposal is null then 'failed' else 'succeeded' end, finished_at = now()
    where id = p_usage;
  if p_proposal is not null then
    insert into public.ai_interpretations (challenge_id, organization_id, proposal, meta)
      values (v_use.challenge_id, v_use.organization_id, p_proposal, v_meta)
      on conflict (challenge_id) do update set proposal = excluded.proposal, meta = excluded.meta, created_at = now();
    insert into public.audit_events (organization_id, actor_id, entity_type, entity_id, event_type, metadata_json)
      values (v_use.organization_id, v_user, 'challenge', v_use.challenge_id, 'challenge.interpretation_proposed', v_meta);
  end if;
end $$;

revoke execute on function public.ei_has_access(), public.ei_ai_begin(uuid), public.ei_ai_finish(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.ei_has_access(), public.ei_ai_begin(uuid), public.ei_ai_finish(uuid, jsonb, jsonb) to authenticated;
-- A auditoria da IA passa a ser gravada só por ei_ai_finish, ligada a um uso real reservado.
revoke execute on function public.ei_log_interpretation(uuid, jsonb) from authenticated;
