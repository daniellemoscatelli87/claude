-- DM | Experience Intelligence · IA desligada até a revisão do tratamento de dados e conclusão do uso só pelo servidor (D-017).
-- 1. A IA começa desligada: nenhuma chamada ao Gemini acontece até a dona do produto religar (ei_settings.ai_enabled).
-- 2. ei_ai_finish deixa de ser chamável por pessoas logadas: só a função da IA, com a chave de serviço, conclui um uso
--    e guarda a sugestão. Assim ninguém grava uma "sugestão da IA" inventada nem registra na auditoria um uso falso.
-- Reversão: supabase/rollback/20261020130000_reverter.sql.

update public.ei_settings set ai_enabled = false, updated_at = now() where id;

-- Mesma assinatura; agora confiada apenas ao servidor. Só conclui um uso ainda aberto e recente.
create or replace function public.ei_ai_finish(p_usage uuid, p_proposal jsonb default null, p_meta jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare v_use public.ai_usage; v_meta jsonb;
begin
  select * into v_use from public.ai_usage where id = p_usage for update;
  if v_use.id is null or v_use.status <> 'started' or v_use.created_at < now() - interval '10 minutes' then
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
      values (v_use.organization_id, v_use.user_id, 'challenge', v_use.challenge_id, 'challenge.interpretation_proposed', v_meta);
  end if;
end $$;

revoke execute on function public.ei_ai_finish(uuid, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.ei_ai_finish(uuid, jsonb, jsonb) to service_role;
