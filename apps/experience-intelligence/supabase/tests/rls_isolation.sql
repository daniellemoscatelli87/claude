-- Teste de isolamento entre organizações (C1-03, C1-05, AC-07) e integridade do texto original (C2-02).
-- Roda no banco real dentro de uma transação desfeita no final (ROLLBACK): nada fica gravado.
-- Simula três pessoas: A (dona da organização A), B (dona da organização B) e a administradora do site
-- (papel "admin" no app_metadata, sem ser membro de nenhuma organização do produto).
-- Qualquer falha interrompe o teste com "FALHOU: ...". Sucesso termina com "OK: ...".

begin;

insert into auth.users (id, email, aud, role, raw_app_meta_data)
values
  ('00000000-0000-4000-a000-00000000000a', 'teste-a@ei.invalid', 'authenticated', 'authenticated', '{}'),
  ('00000000-0000-4000-a000-00000000000b', 'teste-b@ei.invalid', 'authenticated', 'authenticated', '{}'),
  ('00000000-0000-4000-a000-0000000000ad', 'teste-admin@ei.invalid', 'authenticated', 'authenticated', '{"role":"admin"}');

create temp table ei_resultado (mensagem text) on commit drop;

do $$
declare
  v_a constant uuid := '00000000-0000-4000-a000-00000000000a';
  v_b constant uuid := '00000000-0000-4000-a000-00000000000b';
  v_adm constant uuid := '00000000-0000-4000-a000-0000000000ad';
  v_org_a uuid; v_org_b uuid; v_ch_a uuid; v_n int; v_ok boolean;
  v_resultados text[] := '{}';

begin
  -- ---- Pessoa A cria organização e desafio ----
  perform set_config('request.jwt.claims', json_build_object('sub', v_a, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_org_a := public.ei_create_organization('Organização A (teste)', 'saude');
  v_ch_a := public.ei_create_challenge(v_org_a, 'Muitas pessoas reclamam da espera na recepção.');
  select count(*) into v_n from public.challenges where id = v_ch_a;
  if v_n <> 1 then raise exception 'FALHOU: A não vê o próprio desafio'; end if;
  select count(*) into v_n from public.challenge_versions where challenge_id = v_ch_a;
  if v_n <> 1 then raise exception 'FALHOU: criação do desafio não gerou versão'; end if;
  select count(*) into v_n from public.audit_events where entity_id = v_ch_a and event_type = 'challenge.created';
  if v_n <> 1 then raise exception 'FALHOU: criação do desafio não gerou auditoria'; end if;
  v_resultados := array_append(v_resultados, 'A cria organização e desafio, com versão e auditoria');

  -- A confirma a estrutura: o texto original continua o mesmo.
  perform public.ei_confirm_structure(v_ch_a,
    '{"title":"Espera na recepção","affected_people":["pessoas atendidas"],"context":{"site":"unidade a confirmar"},"known_information":["há relatos de demora"],"unknown_information":["quanto tempo as pessoas esperam"],"original_statement":"TEXTO ADULTERADO"}'::jsonb,
    'Teste', 'ai_edited');
  select count(*) into v_n from public.challenges
    where id = v_ch_a and original_statement = 'Muitas pessoas reclamam da espera na recepção.' and structure_status = 'confirmed' and current_phase = 'framing';
  if v_n <> 1 then raise exception 'FALHOU: confirmar a estrutura alterou o texto original ou não avançou a fase'; end if;
  v_resultados := array_append(v_resultados, 'Confirmar a estrutura preserva o texto original e avança para framing');

  -- A não consegue escrever direto nas tabelas.
  v_ok := false;
  begin
    update public.challenges set original_statement = 'outro texto' where id = v_ch_a;
  exception when insufficient_privilege then v_ok := true;
  end;
  if not v_ok then raise exception 'FALHOU: A conseguiu alterar o desafio direto na tabela'; end if;
  v_resultados := array_append(v_resultados, 'Nenhuma pessoa escreve direto na tabela de desafios');

  -- ---- Pessoa B ----
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', v_b, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  v_org_b := public.ei_create_organization('Organização B (teste)', null);

  select count(*) into v_n from public.challenges where id = v_ch_a;
  if v_n <> 0 then raise exception 'FALHOU: B leu o desafio de A'; end if;
  select count(*) into v_n from public.organizations where id = v_org_a;
  if v_n <> 0 then raise exception 'FALHOU: B leu a organização de A'; end if;
  select count(*) into v_n from public.challenge_versions where challenge_id = v_ch_a;
  if v_n <> 0 then raise exception 'FALHOU: B leu as versões do desafio de A'; end if;
  select count(*) into v_n from public.audit_events where organization_id = v_org_a;
  if v_n <> 0 then raise exception 'FALHOU: B leu a auditoria de A'; end if;
  select count(*) into v_n from public.organization_members where organization_id = v_org_a;
  if v_n <> 0 then raise exception 'FALHOU: B leu os membros de A'; end if;
  v_resultados := array_append(v_resultados, 'B não lê organização, membros, desafio, versões nem auditoria de A');

  v_ok := false;
  begin perform public.ei_confirm_structure(v_ch_a, '{"title":"Invasão"}'::jsonb, 'x', 'manual');
  exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: B editou a estrutura do desafio de A'; end if;

  v_ok := false;
  begin perform public.ei_answer_question(v_ch_a, 'local', 'Onde?', 'answered', 'invasão');
  exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: B respondeu pergunta no desafio de A'; end if;

  v_ok := false;
  begin perform public.ei_create_challenge(v_org_a, 'Desafio criado por quem não é membro.');
  exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: B criou desafio na organização de A'; end if;
  v_resultados := array_append(v_resultados, 'B não edita, não responde e não cria desafios na organização de A');

  -- ---- Administradora do site (papel admin), sem ser membro ----
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', v_adm, 'role', 'authenticated', 'app_metadata', json_build_object('role', 'admin'))::text, true);
  execute 'set local role authenticated';
  select count(*) into v_n from public.challenges;
  if v_n <> 0 then raise exception 'FALHOU: a administradora do site leu desafios de clientes'; end if;
  select count(*) into v_n from public.organizations;
  if v_n <> 0 then raise exception 'FALHOU: a administradora do site leu organizações de clientes'; end if;
  v_resultados := array_append(v_resultados, 'A administradora do site não lê dados das organizações (acesso do estúdio não é global)');

  -- ---- Visitante sem login ----
  execute 'reset role';
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  execute 'set local role anon';
  v_ok := false;
  begin select count(*) into v_n from public.challenges;
  exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: visitante sem login consultou desafios'; end if;
  v_ok := false;
  begin perform public.ei_create_organization('Sem login', null);
  exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: visitante sem login criou organização'; end if;
  v_resultados := array_append(v_resultados, 'Visitante sem login não lê nem cria nada');

  -- ---- Gatilho do texto original (mesmo com privilégio total) ----
  execute 'reset role';
  v_ok := false;
  begin update public.challenges set original_statement = 'alterado pelo banco' where id = v_ch_a;
  exception when check_violation then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: o texto original foi alterado com acesso total ao banco'; end if;
  v_resultados := array_append(v_resultados, 'O texto original não muda nem com acesso total ao banco');

  insert into ei_resultado values ('OK: ' || array_length(v_resultados, 1) || ' verificações passaram: ' || array_to_string(v_resultados, ' | '));
end $$;

select mensagem from ei_resultado;

rollback;
