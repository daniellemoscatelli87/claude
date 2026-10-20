-- Reversão da migração 20261020130000_ia_desligada_e_conclusao_pelo_servidor.
-- Volta ei_ai_finish à versão de 20261020120000 (chamada com o token da pessoa) e devolve a permissão às pessoas logadas.
-- Usar junto com a função da IA versão 2 (rollback/ei-interpretar-desafio-v2.ts).
-- A chave da IA (ai_enabled) NÃO é religada aqui: religar só com autorização da dona do produto.

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

revoke execute on function public.ei_ai_finish(uuid, jsonb, jsonb) from public, anon, service_role;
grant execute on function public.ei_ai_finish(uuid, jsonb, jsonb) to authenticated;
