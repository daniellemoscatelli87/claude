-- DM | Experience Intelligence · contexto mínimo da organização (UX-3a, D-022, D-024).
-- Campos opcionais que a IA usa para adaptar o plano de investigação ao contexto real:
--   * organização: segmento (coluna industry já existente), o que oferece, tipo e porte;
--   * membro: área de atuação da pessoa na organização.
-- Nenhum dado fiscal. Escrita só por funções do banco, com auditoria (sem guardar os valores no evento).
-- Reversão: supabase/rollback/20261021090000_reverter.sql.

alter table public.organizations
  add column offering text check (char_length(offering) <= 200),
  add column org_type text check (org_type in ('privada', 'publica', 'terceiro_setor', 'outra', 'nao_informar')),
  add column size_band text check (size_band in ('1_10', '11_50', '51_200', '201_mais', 'nao_informar')),
  add column context_updated_at timestamptz;

alter table public.organization_members
  add column job_area text check (job_area in ('gestao', 'atendimento_operacoes', 'produto_tecnologia', 'pessoas_cultura', 'qualidade_experiencia', 'outra', 'nao_informar'));

-- Cria a organização já com o contexto. Mesmas regras de ei_create_organization (login e convite).
create or replace function public.ei_setup_organization(
  p_name text, p_industry text default null, p_offering text default null,
  p_org_type text default null, p_size_band text default null, p_job_area text default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_org uuid;
begin
  if v_user is null then raise exception 'Entre na sua conta para continuar.' using errcode = '42501'; end if;
  if not public.ei_has_access() then
    raise exception 'A plataforma está em fase de testes, com acesso por convite.' using errcode = '42501';
  end if;
  insert into public.organizations (name, industry, offering, org_type, size_band, created_by, context_updated_at)
    values (btrim(p_name), nullif(btrim(coalesce(p_industry, '')), ''), nullif(btrim(coalesce(p_offering, '')), ''),
            p_org_type, p_size_band, v_user, now())
    returning id into v_org;
  insert into public.organization_members (organization_id, user_id, role, job_area) values (v_org, v_user, 'org_admin', p_job_area);
  insert into public.audit_events (organization_id, actor_id, entity_type, entity_id, event_type)
    values (v_org, v_user, 'organization', v_org, 'organization.created');
  return v_org;
end $$;

-- Atualiza o contexto (só administração da organização). A auditoria registra quais campos mudaram.
create or replace function public.ei_update_organization_context(
  p_org uuid, p_name text, p_industry text default null, p_offering text default null,
  p_org_type text default null, p_size_band text default null
) returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_old public.organizations; v_changed text[] := '{}';
begin
  if v_user is null or not public.ei_is_member(p_org, array['org_admin']) then
    raise exception 'Sua conta não tem permissão para alterar esta organização.' using errcode = '42501';
  end if;
  select * into v_old from public.organizations where id = p_org for update;
  if v_old.name is distinct from btrim(p_name) then v_changed := array_append(v_changed, 'name'); end if;
  if v_old.industry is distinct from nullif(btrim(coalesce(p_industry, '')), '') then v_changed := array_append(v_changed, 'industry'); end if;
  if v_old.offering is distinct from nullif(btrim(coalesce(p_offering, '')), '') then v_changed := array_append(v_changed, 'offering'); end if;
  if v_old.org_type is distinct from p_org_type then v_changed := array_append(v_changed, 'org_type'); end if;
  if v_old.size_band is distinct from p_size_band then v_changed := array_append(v_changed, 'size_band'); end if;
  update public.organizations set
    name = btrim(p_name), industry = nullif(btrim(coalesce(p_industry, '')), ''),
    offering = nullif(btrim(coalesce(p_offering, '')), ''), org_type = p_org_type, size_band = p_size_band,
    context_updated_at = now()
  where id = p_org;
  insert into public.audit_events (organization_id, actor_id, entity_type, entity_id, event_type, metadata_json)
    values (p_org, v_user, 'organization', p_org, 'organization.context_updated', jsonb_build_object('fields', to_jsonb(v_changed)));
end $$;

-- A própria pessoa informa sua área de atuação na organização.
create or replace function public.ei_update_my_job_area(p_org uuid, p_job_area text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null or not public.ei_is_member(p_org) then
    raise exception 'Organização não encontrada.' using errcode = '42501';
  end if;
  update public.organization_members set job_area = p_job_area where organization_id = p_org and user_id = v_user;
  insert into public.audit_events (organization_id, actor_id, entity_type, entity_id, event_type)
    values (p_org, v_user, 'organization', p_org, 'organization.member_area_updated');
end $$;

revoke execute on function public.ei_setup_organization(text, text, text, text, text, text),
  public.ei_update_organization_context(uuid, text, text, text, text, text),
  public.ei_update_my_job_area(uuid, text) from public, anon;
grant execute on function public.ei_setup_organization(text, text, text, text, text, text),
  public.ei_update_organization_context(uuid, text, text, text, text, text),
  public.ei_update_my_job_area(uuid, text) to authenticated;
