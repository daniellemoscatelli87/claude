-- DM | Experience Intelligence · contexto mínimo da empresa ou negócio (UX-3a, D-022, D-024, D-026, P-007).
-- Campos opcionais que a IA usa para adaptar o plano de investigação ao contexto real:
--   * empresa: segmento (coluna industry já existente), o que oferece, tipo, porte e CNPJ;
--   * membro: área de atuação da pessoa na empresa.
-- CNPJ (P-007): opcional, validado pelos dígitos e único, para evitar empresas duplicadas. Quem não tem CNPJ
-- (autônomos, organizações estrangeiras) continua cadastrando. O CNPJ não vai para a IA.
-- Nenhum outro dado fiscal. Escrita só por funções do banco, com auditoria (sem guardar os valores no evento).
-- Reversão: supabase/rollback/20261021090000_reverter.sql.

alter table public.organizations
  add column offering text check (char_length(offering) <= 200),
  add column org_type text check (org_type in ('privada', 'publica', 'terceiro_setor', 'outra', 'nao_informar')),
  add column size_band text check (size_band in ('1_10', '11_50', '51_200', '201_mais', 'nao_informar')),
  add column cnpj text unique check (cnpj ~ '^[0-9]{14}$'),
  add column context_updated_at timestamptz;

alter table public.organization_members
  add column job_area text check (job_area in ('gestao', 'atendimento_operacoes', 'produto_tecnologia', 'pessoas_cultura', 'qualidade_experiencia', 'outra', 'nao_informar'));

-- CNPJ válido pelos dígitos verificadores (sem consultar a Receita).
create or replace function public.ei_cnpj_valido(p text)
returns boolean language plpgsql immutable set search_path = '' as $$
declare pesos1 int[] := array[5,4,3,2,9,8,7,6,5,4,3,2]; pesos2 int[] := array[6,5,4,3,2,9,8,7,6,5,4,3,2]; s int; r int; i int;
begin
  if p is null or p !~ '^[0-9]{14}$' or p ~ '^(.)\1{13}$' then return false; end if;
  s := 0; for i in 1..12 loop s := s + substr(p, i, 1)::int * pesos1[i]; end loop;
  r := s % 11; r := case when r < 2 then 0 else 11 - r end;
  if r <> substr(p, 13, 1)::int then return false; end if;
  s := 0; for i in 1..13 loop s := s + substr(p, i, 1)::int * pesos2[i]; end loop;
  r := s % 11; r := case when r < 2 then 0 else 11 - r end;
  return r = substr(p, 14, 1)::int;
end $$;

-- Normaliza e confere o CNPJ informado (vazio = sem CNPJ).
create or replace function public.ei_cnpj_normalizado(p text)
returns text language plpgsql immutable set search_path = '' as $$
declare v text := nullif(regexp_replace(coalesce(p, ''), '\D', '', 'g'), '');
begin
  if v is not null and not public.ei_cnpj_valido(v) then
    raise exception 'Confira o CNPJ informado.' using errcode = 'check_violation';
  end if;
  return v;
end $$;

-- Cria a empresa já com o contexto. Mesmas regras de ei_create_organization (login e convite).
create or replace function public.ei_setup_organization(
  p_name text, p_industry text default null, p_offering text default null,
  p_org_type text default null, p_size_band text default null, p_job_area text default null, p_cnpj text default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_org uuid;
begin
  if v_user is null then raise exception 'Entre na sua conta para continuar.' using errcode = '42501'; end if;
  if not public.ei_has_access() then
    raise exception 'A plataforma está em fase de testes, com acesso por convite.' using errcode = '42501';
  end if;
  begin
    insert into public.organizations (name, industry, offering, org_type, size_band, cnpj, created_by, context_updated_at)
      values (btrim(p_name), nullif(btrim(coalesce(p_industry, '')), ''), nullif(btrim(coalesce(p_offering, '')), ''),
              p_org_type, p_size_band, public.ei_cnpj_normalizado(p_cnpj), v_user, now())
      returning id into v_org;
  exception when unique_violation then
    raise exception 'Já existe uma empresa ou negócio cadastrado com este CNPJ. Peça a quem administra para convidar você.' using errcode = 'check_violation';
  end;
  insert into public.organization_members (organization_id, user_id, role, job_area) values (v_org, v_user, 'org_admin', p_job_area);
  insert into public.audit_events (organization_id, actor_id, entity_type, entity_id, event_type)
    values (v_org, v_user, 'organization', v_org, 'organization.created');
  return v_org;
end $$;

-- Atualiza o contexto (só administração da empresa). A auditoria registra quais campos mudaram, sem os valores.
create or replace function public.ei_update_organization_context(
  p_org uuid, p_name text, p_industry text default null, p_offering text default null,
  p_org_type text default null, p_size_band text default null, p_cnpj text default null
) returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_old public.organizations; v_changed text[] := '{}'; v_cnpj text;
begin
  if v_user is null or not public.ei_is_member(p_org, array['org_admin']) then
    raise exception 'Sua conta não tem permissão para alterar esta empresa ou negócio.' using errcode = '42501';
  end if;
  v_cnpj := public.ei_cnpj_normalizado(p_cnpj);
  select * into v_old from public.organizations where id = p_org for update;
  if v_old.name is distinct from btrim(p_name) then v_changed := array_append(v_changed, 'name'); end if;
  if v_old.industry is distinct from nullif(btrim(coalesce(p_industry, '')), '') then v_changed := array_append(v_changed, 'industry'); end if;
  if v_old.offering is distinct from nullif(btrim(coalesce(p_offering, '')), '') then v_changed := array_append(v_changed, 'offering'); end if;
  if v_old.org_type is distinct from p_org_type then v_changed := array_append(v_changed, 'org_type'); end if;
  if v_old.size_band is distinct from p_size_band then v_changed := array_append(v_changed, 'size_band'); end if;
  if v_old.cnpj is distinct from v_cnpj then v_changed := array_append(v_changed, 'cnpj'); end if;
  begin
    update public.organizations set
      name = btrim(p_name), industry = nullif(btrim(coalesce(p_industry, '')), ''),
      offering = nullif(btrim(coalesce(p_offering, '')), ''), org_type = p_org_type, size_band = p_size_band, cnpj = v_cnpj,
      context_updated_at = now()
    where id = p_org;
  exception when unique_violation then
    raise exception 'Já existe uma empresa ou negócio cadastrado com este CNPJ.' using errcode = 'check_violation';
  end;
  insert into public.audit_events (organization_id, actor_id, entity_type, entity_id, event_type, metadata_json)
    values (p_org, v_user, 'organization', p_org, 'organization.context_updated', jsonb_build_object('fields', to_jsonb(v_changed)));
end $$;

-- A própria pessoa informa sua área de atuação na empresa.
create or replace function public.ei_update_my_job_area(p_org uuid, p_job_area text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null or not public.ei_is_member(p_org) then
    raise exception 'Empresa ou negócio não encontrado.' using errcode = '42501';
  end if;
  update public.organization_members set job_area = p_job_area where organization_id = p_org and user_id = v_user;
  insert into public.audit_events (organization_id, actor_id, entity_type, entity_id, event_type)
    values (p_org, v_user, 'organization', p_org, 'organization.member_area_updated');
end $$;

revoke execute on function public.ei_cnpj_valido(text), public.ei_cnpj_normalizado(text),
  public.ei_setup_organization(text, text, text, text, text, text, text),
  public.ei_update_organization_context(uuid, text, text, text, text, text, text),
  public.ei_update_my_job_area(uuid, text) from public, anon;
revoke execute on function public.ei_cnpj_valido(text), public.ei_cnpj_normalizado(text) from authenticated;
grant execute on function public.ei_setup_organization(text, text, text, text, text, text, text),
  public.ei_update_organization_context(uuid, text, text, text, text, text, text),
  public.ei_update_my_job_area(uuid, text) to authenticated;
