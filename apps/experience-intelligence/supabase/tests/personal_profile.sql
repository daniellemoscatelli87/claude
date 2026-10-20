-- Teste do perfil pessoal (D-025). Transação desfeita no final: nada fica gravado.
-- CPFs usados são números de teste válidos pelos dígitos verificadores, sem pertencer a ninguém conhecido.
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
  cadastro jsonb := '{"ei_signup":{"full_name":"Pessoa Teste Fictícia","cpf":"52998224725","birth_date":"1990-05-10","state":"PR","city":"Curitiba","phone":"41999990000"}}';
begin
  if not public.ei_cpf_valido('52998224725') or public.ei_cpf_valido('52998224724') or public.ei_cpf_valido('11111111111') then
    raise exception 'FALHOU: validação de CPF';
  end if;
  v_resultados := array_append(v_resultados, 'CPF validado pelos dígitos verificadores');

  insert into auth.users (id, email, aud, role, raw_user_meta_data) values (v_a, 'teste-perfil-a@ei.invalid', 'authenticated', 'authenticated', cadastro);
  select raw_user_meta_data into v_meta from auth.users where id = v_a;
  select count(*) into v_n from public.ei_profiles where user_id = v_a and cpf = '52998224725' and city = 'Curitiba';
  if v_n <> 1 then raise exception 'FALHOU: perfil não gravado na criação da conta'; end if;
  if v_meta ? 'ei_signup' or v_meta::text like '%52998224725%' or v_meta ->> 'full_name' <> 'Pessoa Teste Fictícia' then
    raise exception 'FALHOU: dados pessoais ficaram nos metadados da conta: %', v_meta;
  end if;
  v_resultados := array_append(v_resultados, 'Cadastro grava o perfil e só o nome fica nos metadados (CPF fora do token)');

  v_ok := false;
  begin
    insert into auth.users (id, email, aud, role, raw_user_meta_data) values (v_b, 'teste-perfil-b@ei.invalid', 'authenticated', 'authenticated', cadastro);
  exception when check_violation or unique_violation then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: aceitou CPF repetido'; end if;
  v_ok := false;
  begin
    insert into auth.users (id, email, aud, role, raw_user_meta_data) values (v_b, 'teste-perfil-b@ei.invalid', 'authenticated', 'authenticated',
      jsonb_set(jsonb_set(cadastro, '{ei_signup,cpf}', '"16899535009"'), '{ei_signup,birth_date}', to_jsonb((current_date - 3000)::text)));
  exception when check_violation then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: aceitou menor de idade'; end if;
  v_resultados := array_append(v_resultados, 'Recusa CPF repetido e menor de 18 anos');

  insert into auth.users (id, email, aud, role, raw_user_meta_data) values (v_s, 'teste-site@ei.invalid', 'authenticated', 'authenticated', '{"qualquer":"coisa"}');
  select count(*) into v_n from public.ei_profiles where user_id = v_s;
  select raw_user_meta_data into v_meta from auth.users where id = v_s;
  if v_n <> 0 or v_meta <> '{"qualquer":"coisa"}'::jsonb then raise exception 'FALHOU: gatilho mexeu em conta sem cadastro do produto'; end if;
  v_resultados := array_append(v_resultados, 'Contas criadas fora do cadastro do produto (site) não são afetadas');

  perform pg_temp.como(v_a);
  v_p := public.ei_my_profile();
  if v_p ->> 'cpf_masked' <> '***.***.247-25' or v_p::text like '%52998224725%' then raise exception 'FALHOU: CPF não mascarado: %', v_p; end if;
  v_ok := false;
  begin perform 1 from public.ei_profiles; exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: leitura direta da tabela de perfis'; end if;
  v_resultados := array_append(v_resultados, 'A pessoa vê o próprio perfil com CPF mascarado; ninguém lê a tabela direto');

  perform public.ei_save_my_profile('Pessoa Teste Editada', '', date '1990-05-10', 'SP', 'Campinas', '19988887777');
  execute 'reset role';
  select count(*) into v_n from public.ei_profiles where user_id = v_a and full_name = 'Pessoa Teste Editada' and cpf = '52998224725' and city = 'Campinas';
  if v_n <> 1 then raise exception 'FALHOU: edição do perfil'; end if;
  v_resultados := array_append(v_resultados, 'Edição mantém o CPF quando ele não é informado de novo');

  perform pg_temp.como(v_s);
  if public.ei_my_profile() is not null then raise exception 'FALHOU: viu perfil de outra pessoa'; end if;
  v_ok := false;
  begin perform public.ei_save_my_profile('Outra Pessoa', '52998224725', date '1985-01-01', 'PR', 'Curitiba', '41999990000');
  exception when check_violation then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: outra conta usou CPF já cadastrado'; end if;
  perform public.ei_save_my_profile('Outra Pessoa', '16899535009', date '1985-01-01', 'PR', 'Curitiba', '41999990000');
  if public.ei_my_profile() ->> 'full_name' <> 'Outra Pessoa' then raise exception 'FALHOU: conta antiga não conseguiu completar o perfil'; end if;
  v_resultados := array_append(v_resultados, 'Outra conta não vê o perfil alheio nem reaproveita CPF; conta antiga completa o próprio perfil');

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
