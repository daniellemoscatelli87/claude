-- Reversão completa das mudanças de 20/10/2026 (convite e limites da IA), voltando ao estado de 19/10/2026.
-- Ordem: 1) publicar a função da IA versão 1 (rollback/ei-interpretar-desafio-v1.ts), que usa ei_log_interpretation;
--        2) rodar este arquivo. Se a migração 20261020130000 estiver aplicada, ela é desfeita junto (as tabelas saem).
-- ATENÇÃO: apaga a lista de convidadas, o histórico de uso da IA e as sugestões guardadas. Só rodar com autorização.
-- Não toca em nenhuma tabela ou função do site do estúdio.

-- Funções do Corte 1 sem a exigência de convite (texto de 20261019120000_fundacao_e_desafio.sql).
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

grant execute on function public.ei_log_interpretation(uuid, jsonb) to authenticated;

drop function if exists public.ei_ai_finish(uuid, jsonb, jsonb);
drop function if exists public.ei_ai_begin(uuid);
drop function if exists public.ei_has_access();
drop table if exists public.ai_interpretations;
drop table if exists public.ai_usage;
drop table if exists public.ei_testers;
drop table if exists public.ei_settings;
