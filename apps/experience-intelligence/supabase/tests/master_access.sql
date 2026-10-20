-- Teste do acesso da usuária master (D-011). Roda dentro de transação desfeita no final (ROLLBACK).
-- Verifica: a master vê organizações e desafios pelas funções; cada acesso fica registrado na auditoria
-- do cliente e no registro da plataforma; sem a função não há leitura direta; quem não é master
-- (inclusive a administradora do site sem a marca ei_master) não usa as funções.

begin;

insert into auth.users (id, email, aud, role, raw_app_meta_data, email_confirmed_at)
values
  ('00000000-0000-4000-a000-00000000000a', 'teste-a@ei.invalid', 'authenticated', 'authenticated', '{}', now()),
  ('00000000-0000-4000-a000-0000000000ad', 'teste-admin@ei.invalid', 'authenticated', 'authenticated', '{"role":"admin"}', now()),
  ('00000000-0000-4000-a000-0000000000ff', 'teste-master@ei.invalid', 'authenticated', 'authenticated', '{"ei_master":true}', now());

-- Pessoas de teste convidadas (acesso por convite, D-014).
insert into public.ei_testers (email) values ('teste-a@ei.invalid');

create temp table ei_resultado (mensagem text) on commit drop;

do $$
declare
  v_a constant uuid := '00000000-0000-4000-a000-00000000000a';
  v_adm constant uuid := '00000000-0000-4000-a000-0000000000ad';
  v_m constant uuid := '00000000-0000-4000-a000-0000000000ff';
  v_org uuid; v_ch uuid; v_n int; v_ok boolean; v_j jsonb;
  v_resultados text[] := '{}';
begin
  -- Cliente A cria organização e desafio.
  perform set_config('request.jwt.claims', json_build_object('sub', v_a, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_org := public.ei_create_organization('Cliente A (teste)', null);
  v_ch := public.ei_create_challenge(v_org, 'Clientes reclamam do tempo de resposta no atendimento.');

  -- Cliente A não usa as funções da master.
  v_ok := false;
  begin perform * from public.ei_master_organizations(); exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: cliente usou função da master'; end if;
  v_resultados := array_append(v_resultados, 'Cliente não usa as funções da master');

  -- Administradora do site sem a marca ei_master também não.
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', v_adm, 'role', 'authenticated', 'app_metadata', json_build_object('role', 'admin'))::text, true);
  execute 'set local role authenticated';
  v_ok := false;
  begin perform * from public.ei_master_challenge(v_ch); exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: papel admin do site virou master'; end if;
  v_resultados := array_append(v_resultados, 'O papel admin do site sozinho não dá acesso master');

  -- Master.
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', v_m, 'role', 'authenticated', 'app_metadata', json_build_object('ei_master', true))::text, true);
  execute 'set local role authenticated';
  select count(*) into v_n from public.challenges;
  if v_n <> 0 then raise exception 'FALHOU: master leu direto na tabela, sem registro'; end if;
  v_resultados := array_append(v_resultados, 'Master não lê direto nas tabelas (todo acesso passa pelas funções)');

  select count(*) into v_n from public.ei_master_organizations() o where o.id = v_org and o.challenges = 1;
  if v_n <> 1 then raise exception 'FALHOU: master não viu a organização do cliente'; end if;
  select count(*) into v_n from public.ei_master_challenges(v_org) c where c.id = v_ch;
  if v_n <> 1 then raise exception 'FALHOU: master não viu os desafios do cliente'; end if;
  v_j := public.ei_master_challenge(v_ch);
  if v_j -> 'challenge' ->> 'original_statement' <> 'Clientes reclamam do tempo de resposta no atendimento.' then
    raise exception 'FALHOU: master não viu o desafio completo';
  end if;
  v_resultados := array_append(v_resultados, 'Master vê organizações, lista de desafios e desafio completo');

  -- Registros.
  execute 'reset role';
  select count(*) into v_n from public.master_access_log where actor_id = v_m;
  if v_n <> 3 then raise exception 'FALHOU: registro da plataforma tem % acessos, esperado 3', v_n; end if;
  select count(*) into v_n from public.audit_events where organization_id = v_org and event_type in ('master.listed_challenges', 'master.viewed_challenge') and actor_id = v_m;
  if v_n <> 2 then raise exception 'FALHOU: auditoria do cliente tem % acessos da master, esperado 2', v_n; end if;
  v_resultados := array_append(v_resultados, 'Cada acesso da master fica registrado na plataforma e na auditoria do cliente');

  -- A administração do cliente consegue ver que a master acessou.
  perform set_config('request.jwt.claims', json_build_object('sub', v_a, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select count(*) into v_n from public.audit_events where organization_id = v_org and event_type = 'master.viewed_challenge';
  if v_n <> 1 then raise exception 'FALHOU: cliente não vê o registro do acesso da master'; end if;
  v_ok := false;
  begin select count(*) into v_n from public.master_access_log; exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: cliente leu o registro geral da plataforma'; end if;
  v_resultados := array_append(v_resultados, 'Cliente vê na própria auditoria que a master acessou, mas não o registro geral');

  execute 'reset role';
  insert into ei_resultado values ('OK: ' || array_length(v_resultados, 1) || ' verificações passaram: ' || array_to_string(v_resultados, ' | '));
end $$;

select mensagem from ei_resultado;

rollback;
