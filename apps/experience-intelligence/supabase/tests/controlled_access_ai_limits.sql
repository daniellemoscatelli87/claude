-- Teste do acesso por convite e dos limites da IA (D-014, D-015).
-- Roda no banco real dentro de uma transação desfeita no final (ROLLBACK): nada fica gravado.
-- Pessoas simuladas: C (convidada, e-mail confirmado), N (sem convite), U (convidada sem confirmar o e-mail),
-- M (master, sem convite) e O (convidada, de outra organização).
-- Qualquer falha interrompe o teste com "FALHOU: ...". Sucesso termina com "OK: ...".

begin;

insert into auth.users (id, email, aud, role, raw_app_meta_data, email_confirmed_at)
values
  ('00000000-0000-4000-b000-00000000000c', 'teste-c@ei.invalid', 'authenticated', 'authenticated', '{}', now()),
  ('00000000-0000-4000-b000-00000000000e', 'teste-n@ei.invalid', 'authenticated', 'authenticated', '{}', now()),
  ('00000000-0000-4000-b000-00000000000f', 'teste-u@ei.invalid', 'authenticated', 'authenticated', '{}', null),
  ('00000000-0000-4000-b000-0000000000aa', 'teste-m@ei.invalid', 'authenticated', 'authenticated', '{"ei_master":true}', now()),
  ('00000000-0000-4000-b000-0000000000bb', 'teste-o@ei.invalid', 'authenticated', 'authenticated', '{}', now());
insert into public.ei_testers (email) values ('teste-c@ei.invalid'), ('teste-u@ei.invalid'), ('teste-o@ei.invalid');
-- Limites conhecidos durante o teste (o valor real é restaurado pelo ROLLBACK).
update public.ei_settings set ai_enabled = true, ai_per_challenge = 2, ai_per_user_day = 100, ai_global_day = 1000 where id;

create temp table ei_resultado (mensagem text) on commit drop;
grant insert on ei_resultado to authenticated;

create function pg_temp.como(p_user uuid, p_app jsonb default '{}') returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated', 'app_metadata', p_app)::text, true);
  execute 'set local role authenticated';
end $$;

do $$
declare
  v_c constant uuid := '00000000-0000-4000-b000-00000000000c';
  v_n constant uuid := '00000000-0000-4000-b000-00000000000e';
  v_u constant uuid := '00000000-0000-4000-b000-00000000000f';
  v_m constant uuid := '00000000-0000-4000-b000-0000000000aa';
  v_o constant uuid := '00000000-0000-4000-b000-0000000000bb';
  v_org uuid; v_ch uuid; v_ch2 uuid; v_r jsonb; v_usage uuid; v_n_int int; v_ok boolean;
  v_resultados text[] := '{}';
begin
  -- ---- Acesso por convite ----
  perform pg_temp.como(v_n);
  if public.ei_has_access() then raise exception 'FALHOU: pessoa sem convite tem acesso'; end if;
  v_ok := false;
  begin perform public.ei_create_organization('Sem convite (teste)', null);
  exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: pessoa sem convite criou organização'; end if;

  perform pg_temp.como(v_u);
  v_ok := false;
  begin perform public.ei_create_organization('Sem confirmar (teste)', null);
  exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: convidada sem e-mail confirmado criou organização'; end if;
  v_resultados := array_append(v_resultados, 'Sem convite, ou com convite sem e-mail confirmado, não cria organização');

  perform pg_temp.como(v_m, '{"ei_master":true}');
  if not public.ei_has_access() then raise exception 'FALHOU: master sem acesso'; end if;
  v_resultados := array_append(v_resultados, 'A master tem acesso sem estar na lista');

  perform pg_temp.como(v_c);
  v_org := public.ei_create_organization('Convidada (teste)', null);
  v_ch := public.ei_create_challenge(v_org, 'Muitas pessoas reclamam da espera na recepção.');
  v_resultados := array_append(v_resultados, 'Convidada com e-mail confirmado cria organização e desafio');

  -- ---- Tabelas de controle fechadas para as APIs ----
  v_ok := false;
  begin perform 1 from public.ei_testers; exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: lista de convidadas legível'; end if;
  v_ok := false;
  begin perform 1 from public.ai_interpretations; exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: sugestões guardadas legíveis direto'; end if;
  v_ok := false;
  begin update public.ei_settings set ai_global_day = 999999 where id; exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: pessoa conseguiu mudar os limites'; end if;
  v_ok := false;
  begin perform public.ei_log_interpretation(v_ch, '{}'); exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: auditoria da IA pode ser gravada sem uso real'; end if;
  v_resultados := array_append(v_resultados, 'Lista, limites, uso e sugestões da IA não são lidos nem alterados direto');

  -- ---- Reserva, chamada em andamento e sugestão guardada ----
  v_r := public.ei_ai_begin(v_ch);
  if v_r ->> 'status' <> 'go' or v_r ->> 'statement' <> 'Muitas pessoas reclamam da espera na recepção.' then
    raise exception 'FALHOU: primeira reserva não liberou a IA: %', v_r;
  end if;
  v_usage := (v_r ->> 'usage_id')::uuid;
  if public.ei_ai_begin(v_ch) ->> 'status' <> 'busy' then raise exception 'FALHOU: segunda chamada simultânea liberada'; end if;

  -- Outra pessoa não conclui o uso nem reserva no desafio alheio.
  perform pg_temp.como(v_o);
  v_ok := false;
  begin perform public.ei_ai_finish(v_usage, '{"title":"Adulterado"}', '{}'); exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: outra pessoa concluiu o uso da IA'; end if;
  v_ok := false;
  begin perform public.ei_ai_begin(v_ch); exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: outra organização reservou IA no desafio'; end if;
  v_resultados := array_append(v_resultados, 'Chamada simultânea bloqueada; outra organização não usa nem conclui a IA do desafio');

  perform pg_temp.como(v_c);
  perform public.ei_ai_finish(v_usage, '{"title":"Espera na recepção"}', '{"model":"teste","prompt_version":"v-teste","extra":"descartado"}');
  v_r := public.ei_ai_begin(v_ch);
  if v_r ->> 'status' <> 'cached' or v_r -> 'proposal' ->> 'title' <> 'Espera na recepção' or v_r -> 'meta' ? 'extra' then
    raise exception 'FALHOU: sugestão não foi guardada ou meta não filtrada: %', v_r;
  end if;
  select count(*) into v_n_int from public.audit_events where entity_id = v_ch and event_type = 'challenge.interpretation_proposed';
  if v_n_int <> 1 then raise exception 'FALHOU: auditoria da IA não registrada'; end if;
  v_ok := false;
  begin perform public.ei_ai_finish(v_usage, '{"title":"De novo"}', '{}'); exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: uso concluído duas vezes'; end if;
  v_resultados := array_append(v_resultados, 'Sugestão guardada: recarregar devolve a mesma, sem nova chamada; auditoria registrada uma vez');

  -- ---- Limite por desafio (2 no teste) ----
  v_ch2 := public.ei_create_challenge(v_org, 'Os pacientes não sabem para onde ir depois da consulta.');
  for i in 1..2 loop
    v_r := public.ei_ai_begin(v_ch2);
    if v_r ->> 'status' <> 'go' then raise exception 'FALHOU: tentativa % bloqueada antes do limite: %', i, v_r; end if;
    perform public.ei_ai_finish((v_r ->> 'usage_id')::uuid, null, '{}');
  end loop;
  if public.ei_ai_begin(v_ch2) ->> 'status' <> 'limit' then raise exception 'FALHOU: limite por desafio não aplicado'; end if;
  v_resultados := array_append(v_resultados, 'Limite por desafio aplicado, contando também as tentativas que falharam');

  -- ---- IA desligada e limite diário por pessoa ----
  execute 'reset role';
  update public.ei_settings set ai_enabled = false where id;
  perform pg_temp.como(v_c);
  v_ch := public.ei_create_challenge(v_org, 'A equipe da recepção não sabe o tempo de espera.');
  if public.ei_ai_begin(v_ch) ->> 'status' <> 'disabled' then raise exception 'FALHOU: IA desligada continuou liberada'; end if;
  execute 'reset role';
  update public.ei_settings set ai_enabled = true, ai_per_user_day = 3 where id;
  perform pg_temp.como(v_c);
  if public.ei_ai_begin(v_ch) ->> 'status' <> 'limit' then raise exception 'FALHOU: limite diário por pessoa não aplicado'; end if;
  v_resultados := array_append(v_resultados, 'Chave de desligar a IA e limite diário por pessoa funcionam');

  -- ---- Pessoa removida da lista ----
  execute 'reset role';
  update public.ei_testers set email = 'removida-c@ei.invalid' where email = 'teste-c@ei.invalid';
  perform pg_temp.como(v_c);
  v_ok := false;
  begin perform public.ei_create_challenge(v_org, 'Outro desafio depois de sair da lista.');
  exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: pessoa removida da lista criou desafio'; end if;
  if public.ei_ai_begin(v_ch2) ->> 'status' <> 'no_access' then raise exception 'FALHOU: pessoa removida usa a IA'; end if;
  v_resultados := array_append(v_resultados, 'Quem sai da lista não cria desafios nem usa a IA');

  execute 'reset role';
  insert into ei_resultado values ('OK: ' || array_length(v_resultados, 1) || ' verificações passaram: ' || array_to_string(v_resultados, ' | '));
end $$;

select mensagem from ei_resultado;
rollback;
