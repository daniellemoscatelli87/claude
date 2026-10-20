-- Teste do perfil pessoal (D-025 revisto por D-026 e P-007: sem CPF e sem data de nascimento).
-- Transação desfeita no final: nada fica gravado.
begin;

create temp table ei_resultado (mensagem text) on commit drop;

create function pg_temp.como(p_user uuid) returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
end $$;

do $$
declare
  v_a constant uuid := '00000000-0000-4000-d000-00000000000a';
  v_b constant uuid := '00000000-0000-4000-d000-00000000000b';
  v_s constant uuid := '00000000-0000-4000-d000-00000000000c';
  v_meta jsonb; v_p jsonb; v_ok boolean; v_n int;
  v_resultados text[] := '{}';
  cadastro jsonb := '{"ei_signup":{"full_name":"Pessoa Teste Fictícia","state":"PR","city":"Curitiba","phone":"41999990000","adult_declared":true,"privacy_notice_version":"testes-2026-10-21"}}';
begin
  insert into auth.users (id, email, aud, role, raw_user_meta_data) values (v_a, 'teste-perfil-a@ei.invalid', 'authenticated', 'authenticated', cadastro);
  select raw_user_meta_data into v_meta from auth.users where id = v_a;
  select count(*) into v_n from public.ei_profiles where user_id = v_a and city = 'Curitiba' and privacy_notice_version = 'testes-2026-10-21'
    and adult_declared_at is not null and privacy_accepted_at is not null;
  if v_n <> 1 then raise exception 'FALHOU: perfil, maioridade ou aceite não gravados na criação da conta'; end if;
  if v_meta ? 'ei_signup' or v_meta::text like '%41999990000%' or v_meta::text like '%Curitiba%' or v_meta ->> 'full_name' <> 'Pessoa Teste Fictícia' then
    raise exception 'FALHOU: dados pessoais ficaram nos metadados da conta: %', v_meta;
  end if;
  v_resultados := array_append(v_resultados, 'Cadastro grava perfil, maioridade e aceite (com versão); só o nome fica nos metadados');

  v_ok := false;
  begin
    insert into auth.users (id, email, aud, role, raw_user_meta_data) values (v_b, 'teste-perfil-b@ei.invalid', 'authenticated', 'authenticated',
      jsonb_set(cadastro, '{ei_signup,adult_declared}', 'false'));
  exception when check_violation then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: aceitou cadastro sem declaração de maioridade'; end if;
  v_ok := false;
  begin
    insert into auth.users (id, email, aud, role, raw_user_meta_data) values (v_b, 'teste-perfil-b@ei.invalid', 'authenticated', 'authenticated',
      cadastro #- '{ei_signup,privacy_notice_version}');
  exception when check_violation then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: aceitou cadastro sem aceite do aviso'; end if;
  v_ok := false;
  begin
    insert into auth.users (id, email, aud, role, raw_user_meta_data) values (v_b, 'teste-perfil-b@ei.invalid', 'authenticated', 'authenticated',
      jsonb_set(cadastro, '{ei_signup,phone}', '"123"'));
  exception when check_violation then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: aceitou telefone inválido'; end if;
  v_resultados := array_append(v_resultados, 'Recusa cadastro sem maioridade, sem aceite do aviso ou com telefone inválido');

  insert into auth.users (id, email, aud, role, raw_user_meta_data) values (v_s, 'teste-site@ei.invalid', 'authenticated', 'authenticated', '{"qualquer":"coisa"}');
  select count(*) into v_n from public.ei_profiles where user_id = v_s;
  select raw_user_meta_data into v_meta from auth.users where id = v_s;
  if v_n <> 0 or v_meta <> '{"qualquer":"coisa"}'::jsonb then raise exception 'FALHOU: gatilho mexeu em conta sem cadastro do produto'; end if;
  v_resultados := array_append(v_resultados, 'Contas criadas fora do cadastro do produto (site) não são afetadas');

  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'ei_profiles' and column_name in ('cpf', 'birth_date')) then
    raise exception 'FALHOU: perfil ainda tem CPF ou data de nascimento';
  end if;
  v_resultados := array_append(v_resultados, 'Perfil sem CPF e sem data de nascimento');

  perform pg_temp.como(v_a);
  v_p := public.ei_my_profile();
  if v_p ->> 'full_name' <> 'Pessoa Teste Fictícia' or v_p ->> 'privacy_notice_version' <> 'testes-2026-10-21' then raise exception 'FALHOU: leitura do próprio perfil: %', v_p; end if;
  v_ok := false;
  begin perform 1 from public.ei_profiles; exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: leitura direta da tabela de perfis'; end if;
  v_resultados := array_append(v_resultados, 'A pessoa lê o próprio perfil; ninguém lê a tabela direto');

  perform public.ei_save_my_profile('Pessoa Teste Editada', 'SP', 'Campinas', '19988887777');
  execute 'reset role';
  select count(*) into v_n from public.ei_profiles where user_id = v_a and full_name = 'Pessoa Teste Editada' and city = 'Campinas' and privacy_notice_version = 'testes-2026-10-21';
  if v_n <> 1 then raise exception 'FALHOU: edição do perfil'; end if;
  v_resultados := array_append(v_resultados, 'Edição muda os dados e mantém o registro do aceite');

  perform pg_temp.como(v_s);
  if public.ei_my_profile() is not null then raise exception 'FALHOU: viu perfil de outra pessoa'; end if;
  v_ok := false;
  begin perform public.ei_save_my_profile('Outra Pessoa', 'PR', 'Curitiba', '41999990000'); exception when check_violation then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: conta antiga criou perfil sem maioridade e aceite'; end if;
  perform public.ei_save_my_profile('Outra Pessoa', 'PR', 'Curitiba', '41999990000', true, 'testes-2026-10-21');
  if public.ei_my_profile() ->> 'full_name' <> 'Outra Pessoa' then raise exception 'FALHOU: conta antiga não conseguiu completar o perfil'; end if;
  v_resultados := array_append(v_resultados, 'Outra conta não vê o perfil alheio; conta antiga completa o perfil só com maioridade e aceite');

  execute 'reset role';
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  execute 'set local role anon';
  v_ok := false;
  begin perform public.ei_my_profile(); exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: visitante sem login usou a função de perfil'; end if;
  v_resultados := array_append(v_resultados, 'Visitante sem login não acessa perfis');

  execute 'reset role';
  insert into ei_resultado values ('OK: ' || array_length(v_resultados, 1) || ' verificações passaram: ' || array_to_string(v_resultados, ' | '));
end $$;

select mensagem from ei_resultado;
rollback;
