-- DM | Experience Intelligence · Corte 1 (fundação SaaS) + Corte 2 (entrada do desafio)
-- Tabelas do produto no mesmo projeto Supabase do site (D-006), isoladas por organização.
-- Regras:
--   * RLS em todas as tabelas; leitura só para membros da organização.
--   * Nenhuma escrita direta pelas APIs: tudo passa por funções que conferem o papel do membro
--     e gravam, na mesma transação, a versão do desafio e o evento de auditoria.
--   * O papel "admin" do site NÃO dá acesso a estas tabelas (o acesso do estúdio não é global).
--   * original_statement é gravado uma única vez e nunca é sobrescrito.

-- ---------- Tabelas ----------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  industry text check (char_length(industry) <= 80),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('org_admin', 'manager', 'contributor', 'viewer', 'studio_consultant')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);
create index organization_members_user_idx on public.organization_members (user_id);

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  owner_id uuid not null references auth.users (id),
  created_by uuid not null references auth.users (id),
  title text check (char_length(title) <= 120),
  original_statement text not null check (char_length(btrim(original_statement)) between 10 and 4000),
  current_problem_statement text check (char_length(current_problem_statement) <= 4000),
  desired_outcome text check (char_length(desired_outcome) <= 600),
  affected_people jsonb not null default '[]'::jsonb check (jsonb_typeof(affected_people) = 'array'),
  context_json jsonb not null default '{}'::jsonb check (jsonb_typeof(context_json) = 'object'),
  known_information jsonb not null default '[]'::jsonb check (jsonb_typeof(known_information) = 'array'),
  unknown_information jsonb not null default '[]'::jsonb check (jsonb_typeof(unknown_information) = 'array'),
  structure_status text not null default 'pending' check (structure_status in ('pending', 'confirmed')),
  current_phase text not null default 'intake'
    check (current_phase in ('intake', 'framing', 'discovery', 'sensemaking', 'opportunities', 'experiment', 'measurement', 'continuous')),
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  -- null = ainda não avaliado (não presumir risco antes de investigar).
  risk_level text check (risk_level in ('low', 'moderate', 'high', 'critical')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index challenges_org_idx on public.challenges (organization_id, created_at desc);

create table public.challenge_versions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  changed_by uuid not null references auth.users (id),
  snapshot_json jsonb not null,
  reason text not null check (char_length(reason) between 1 and 300),
  created_at timestamptz not null default now()
);
create index challenge_versions_challenge_idx on public.challenge_versions (challenge_id, created_at);

-- Perguntas de enquadramento e suas respostas (inclusive "não sei"). Tabela prevista na
-- metodologia (seção 15); antecipada para persistir as respostas do Corte 2 (C2-05, C2-06, AC-12).
create table public.investigation_questions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  question_key text not null check (question_key ~ '^[a-z_]{2,40}$'),
  wording text not null check (char_length(wording) between 3 and 300),
  priority integer not null default 0,
  status text not null check (status in ('answered', 'unknown', 'pending')),
  answer_summary text check (char_length(answer_summary) <= 2000),
  unknown_route text check (unknown_route in ('find', 'produce', 'ask', 'pending')),
  answered_by uuid not null references auth.users (id),
  updated_at timestamptz not null default now(),
  unique (challenge_id, question_key)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  actor_id uuid references auth.users (id),
  entity_type text not null,
  entity_id uuid,
  event_type text not null,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_events_org_idx on public.audit_events (organization_id, created_at desc);

-- ---------- Integridade ----------

-- O texto original do desafio nunca é sobrescrito, nem por função nem por acesso direto.
create or replace function public.ei_proteger_texto_original()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.original_statement is distinct from old.original_statement then
    raise exception 'O texto original do desafio não pode ser alterado.' using errcode = 'check_violation';
  end if;
  if new.organization_id is distinct from old.organization_id then
    raise exception 'O desafio não pode mudar de organização.' using errcode = 'check_violation';
  end if;
  return new;
end $$;
create trigger challenges_texto_original_imutavel before update on public.challenges
  for each row execute function public.ei_proteger_texto_original();

-- ---------- Acesso ----------

-- Membro da organização (opcionalmente com um dos papéis indicados).
create or replace function public.ei_is_member(p_org uuid, p_roles text[] default null)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = p_org
      and m.user_id = (select auth.uid())
      and (p_roles is null or m.role = any (p_roles))
  )
$$;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_versions enable row level security;
alter table public.investigation_questions enable row level security;
alter table public.audit_events enable row level security;

create policy "Membros leem a organização" on public.organizations
  for select to authenticated using ((select public.ei_is_member(id)));
create policy "Membros leem os membros" on public.organization_members
  for select to authenticated using ((select public.ei_is_member(organization_id)));
create policy "Membros leem os desafios" on public.challenges
  for select to authenticated using ((select public.ei_is_member(organization_id)));
create policy "Membros leem as versões" on public.challenge_versions
  for select to authenticated using ((select public.ei_is_member(organization_id)));
create policy "Membros leem as perguntas" on public.investigation_questions
  for select to authenticated using ((select public.ei_is_member(organization_id)));
create policy "Gestores leem a auditoria" on public.audit_events
  for select to authenticated using ((select public.ei_is_member(organization_id, array['org_admin', 'manager'])));

-- Sem políticas de insert/update/delete: as APIs não escrevem direto nas tabelas.
revoke all on public.organizations, public.organization_members, public.challenges,
  public.challenge_versions, public.investigation_questions, public.audit_events from anon;
grant select on public.organizations, public.organization_members, public.challenges,
  public.challenge_versions, public.investigation_questions, public.audit_events to authenticated;
revoke insert, update, delete, truncate on public.organizations, public.organization_members, public.challenges,
  public.challenge_versions, public.investigation_questions, public.audit_events from authenticated;

-- ---------- Casos de uso (únicas portas de escrita) ----------

create or replace function public.ei_snapshot(p_challenge public.challenges)
returns jsonb language sql immutable set search_path = '' as $$
  select jsonb_build_object(
    'title', p_challenge.title,
    'original_statement', p_challenge.original_statement,
    'current_problem_statement', p_challenge.current_problem_statement,
    'desired_outcome', p_challenge.desired_outcome,
    'affected_people', p_challenge.affected_people,
    'context', p_challenge.context_json,
    'known_information', p_challenge.known_information,
    'unknown_information', p_challenge.unknown_information,
    'structure_status', p_challenge.structure_status,
    'current_phase', p_challenge.current_phase,
    'status', p_challenge.status
  )
$$;

-- Cria a organização e torna quem criou administradora da organização.
create or replace function public.ei_create_organization(p_name text, p_industry text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_org uuid;
begin
  if v_user is null then raise exception 'Entre na sua conta para continuar.' using errcode = '42501'; end if;
  insert into public.organizations (name, industry, created_by)
    values (btrim(p_name), nullif(btrim(coalesce(p_industry, '')), ''), v_user) returning id into v_org;
  insert into public.organization_members (organization_id, user_id, role) values (v_org, v_user, 'org_admin');
  insert into public.audit_events (organization_id, actor_id, entity_type, entity_id, event_type)
    values (v_org, v_user, 'organization', v_org, 'organization.created');
  return v_org;
end $$;

-- Registra o desafio com o texto original literal.
create or replace function public.ei_create_challenge(p_org uuid, p_statement text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_row public.challenges;
begin
  if v_user is null then raise exception 'Entre na sua conta para continuar.' using errcode = '42501'; end if;
  if not public.ei_is_member(p_org, array['org_admin', 'manager', 'contributor']) then
    raise exception 'Você não tem permissão para criar desafios nesta organização.' using errcode = '42501';
  end if;
  insert into public.challenges (organization_id, owner_id, created_by, original_statement)
    values (p_org, v_user, v_user, p_statement) returning * into v_row;
  insert into public.challenge_versions (challenge_id, organization_id, changed_by, snapshot_json, reason)
    values (v_row.id, p_org, v_user, public.ei_snapshot(v_row), 'Descrição original registrada');
  insert into public.audit_events (organization_id, actor_id, entity_type, entity_id, event_type)
    values (p_org, v_user, 'challenge', v_row.id, 'challenge.created');
  return v_row.id;
end $$;

-- Confirma (ou edita) a estrutura do desafio. Nunca toca no texto original.
-- p_source: 'ai_accepted' (sugestão da IA aceita sem mudança), 'ai_edited' (sugestão editada) ou 'manual'.
create or replace function public.ei_confirm_structure(
  p_challenge uuid, p_structure jsonb, p_reason text, p_source text, p_ai_meta jsonb default '{}'::jsonb
) returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_row public.challenges; v_first boolean;
begin
  if v_user is null then raise exception 'Entre na sua conta para continuar.' using errcode = '42501'; end if;
  select * into v_row from public.challenges where id = p_challenge for update;
  if v_row.id is null or not public.ei_is_member(v_row.organization_id, array['org_admin', 'manager', 'contributor']) then
    raise exception 'Desafio não encontrado.' using errcode = '42501';
  end if;
  if p_source not in ('ai_accepted', 'ai_edited', 'manual') then raise exception 'Origem inválida.'; end if;
  if jsonb_typeof(p_structure) <> 'object'
     or jsonb_typeof(coalesce(p_structure -> 'affected_people', '[]')) <> 'array'
     or jsonb_typeof(coalesce(p_structure -> 'known_information', '[]')) <> 'array'
     or jsonb_typeof(coalesce(p_structure -> 'unknown_information', '[]')) <> 'array'
     or jsonb_typeof(coalesce(p_structure -> 'context', '{}')) <> 'object'
     or char_length(coalesce(p_structure ->> 'title', '')) not between 3 and 120 then
    raise exception 'Estrutura do desafio inválida.' using errcode = 'check_violation';
  end if;
  v_first := v_row.structure_status = 'pending';
  update public.challenges set
    title = btrim(p_structure ->> 'title'),
    desired_outcome = nullif(btrim(coalesce(p_structure ->> 'desired_outcome', '')), ''),
    affected_people = coalesce(p_structure -> 'affected_people', '[]'),
    context_json = coalesce(p_structure -> 'context', '{}'),
    known_information = coalesce(p_structure -> 'known_information', '[]'),
    unknown_information = coalesce(p_structure -> 'unknown_information', '[]'),
    structure_status = 'confirmed',
    current_phase = case when current_phase = 'intake' then 'framing' else current_phase end,
    updated_at = now()
  where id = p_challenge returning * into v_row;
  insert into public.challenge_versions (challenge_id, organization_id, changed_by, snapshot_json, reason)
    values (v_row.id, v_row.organization_id, v_user, public.ei_snapshot(v_row),
            left(coalesce(nullif(btrim(p_reason), ''), case when v_first then 'Estrutura confirmada' else 'Estrutura editada' end), 300));
  insert into public.audit_events (organization_id, actor_id, entity_type, entity_id, event_type, metadata_json)
    values (v_row.organization_id, v_user, 'challenge', v_row.id,
            case when v_first then 'challenge.structure_confirmed' else 'challenge.structure_edited' end,
            jsonb_build_object('source', p_source, 'ai', coalesce(p_ai_meta, '{}'::jsonb)));
end $$;

-- Registra a resposta a uma pergunta de enquadramento (inclusive "não sei").
create or replace function public.ei_answer_question(
  p_challenge uuid, p_key text, p_wording text, p_status text, p_answer text default null, p_route text default null
) returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_org uuid;
begin
  if v_user is null then raise exception 'Entre na sua conta para continuar.' using errcode = '42501'; end if;
  select organization_id into v_org from public.challenges where id = p_challenge;
  if v_org is null or not public.ei_is_member(v_org, array['org_admin', 'manager', 'contributor']) then
    raise exception 'Desafio não encontrado.' using errcode = '42501';
  end if;
  if p_status = 'answered' and char_length(btrim(coalesce(p_answer, ''))) = 0 then
    raise exception 'Escreva a resposta ou escolha "Não sei".' using errcode = 'check_violation';
  end if;
  insert into public.investigation_questions
    (challenge_id, organization_id, question_key, wording, status, answer_summary, unknown_route, answered_by, updated_at)
  values (p_challenge, v_org, p_key, p_wording, p_status, nullif(btrim(coalesce(p_answer, '')), ''),
          case when p_status = 'answered' then null else p_route end, v_user, now())
  on conflict (challenge_id, question_key) do update set
    wording = excluded.wording, status = excluded.status, answer_summary = excluded.answer_summary,
    unknown_route = excluded.unknown_route, answered_by = excluded.answered_by, updated_at = now();
  insert into public.audit_events (organization_id, actor_id, entity_type, entity_id, event_type, metadata_json)
    values (v_org, v_user, 'challenge', p_challenge, 'challenge.question_answered',
            jsonb_build_object('question_key', p_key, 'status', p_status, 'route', p_route));
end $$;

-- Registro de auditoria da interpretação feita pela IA (chamado pela edge function, com o token da pessoa).
create or replace function public.ei_log_interpretation(p_challenge uuid, p_meta jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_org uuid;
begin
  select organization_id into v_org from public.challenges where id = p_challenge;
  if v_user is null or v_org is null or not public.ei_is_member(v_org) then
    raise exception 'Desafio não encontrado.' using errcode = '42501';
  end if;
  insert into public.audit_events (organization_id, actor_id, entity_type, entity_id, event_type, metadata_json)
    values (v_org, v_user, 'challenge', p_challenge, 'challenge.interpretation_proposed', coalesce(p_meta, '{}'::jsonb));
end $$;

revoke execute on function public.ei_is_member(uuid, text[]), public.ei_snapshot(public.challenges),
  public.ei_create_organization(text, text), public.ei_create_challenge(uuid, text),
  public.ei_confirm_structure(uuid, jsonb, text, text, jsonb), public.ei_answer_question(uuid, text, text, text, text, text),
  public.ei_log_interpretation(uuid, jsonb), public.ei_proteger_texto_original() from public, anon;
grant execute on function public.ei_is_member(uuid, text[]), public.ei_create_organization(text, text),
  public.ei_create_challenge(uuid, text), public.ei_confirm_structure(uuid, jsonb, text, text, jsonb),
  public.ei_answer_question(uuid, text, text, text, text, text), public.ei_log_interpretation(uuid, jsonb) to authenticated;
