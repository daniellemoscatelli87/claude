-- Teste do contexto da organização (UX-3a). Transação desfeita no final: nada fica gravado.
-- A (convidada, administra a organização), B (convidada, outra organização), N (sem convite).
begin;

insert into auth.users (id, email, aud, role, raw_app_meta_data, email_confirmed_at)
values
  ('00000000-0000-4000-c000-00000000000a', 'teste-ctx-a@ei.invalid', 'authenticated', 'authenticated', '{}', now()),
  ('00000000-0000-4000-c000-00000000000b', 'teste-ctx-b@ei.invalid', 'authenticated', 'authenticated', '{}', now()),
  ('00000000-0000-4000-c000-00000000000e', 'teste-ctx-n@ei.invalid', 'authenticated', 'authenticated', '{}', now());
insert into public.ei_testers (email) values ('teste-ctx-a@ei.invalid'), ('teste-ctx-b@ei.invalid');

create temp table ei_resultado (mensagem text) on commit drop;

create function pg_temp.como(p_user uuid) returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
end $$;

do $$
declare
  v_a constant uuid := '00000000-0000-4000-c000-00000000000a';
  v_b constant uuid := '00000000-0000-4000-c000-00000000000b';
  v_n constant uuid := '00000000-0000-4000-c000-00000000000e';
  v_org uuid; v_row public.organizations; v_area text; v_n_int int; v_ok boolean; v_ev jsonb;
  v_resultados text[] := '{}';
begin
  perform pg_temp.como(v_n);
  v_ok := false;
  begin perform public.ei_setup_organization('Sem convite (teste)'); exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: pessoa sem convite criou organização com contexto'; end if;
  v_resultados := array_append(v_resultados, 'Sem convite não cria organização');

  perform pg_temp.como(v_a);
  v_org := public.ei_setup_organization('Clínica Fictícia (teste)', 'Saúde', 'atendimento ambulatorial', 'privada', '11_50', 'gestao');
  select * into v_row from public.organizations where id = v_org;
  select job_area into v_area from public.organization_members where organization_id = v_org and user_id = v_a;
  if v_row.offering <> 'atendimento ambulatorial' or v_row.org_type <> 'privada' or v_row.size_band <> '11_50' or v_area <> 'gestao' then
    raise exception 'FALHOU: contexto não gravado';
  end if;
  v_resultados := array_append(v_resultados, 'Convidada cria organização com contexto e área');

  v_ok := false;
  begin perform public.ei_setup_organization('Porte inválido (teste)', null, null, null, 'enorme'); exception when check_violation then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: aceitou porte fora da lista'; end if;
  v_ok := false;
  begin perform public.ei_setup_organization('Oferta longa (teste)', null, repeat('x', 201)); exception when check_violation then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: aceitou texto acima do limite'; end if;
  v_resultados := array_append(v_resultados, 'Valores fora da lista e textos longos são recusados');

  perform public.ei_update_organization_context(v_org, 'Clínica Fictícia (teste)', 'Saúde', 'consultas e exames', 'privada', '51_200');
  select metadata_json into v_ev from public.audit_events where organization_id = v_org and event_type = 'organization.context_updated';
  if v_ev -> 'fields' <> '["offering", "size_band"]'::jsonb then raise exception 'FALHOU: auditoria não registrou os campos alterados: %', v_ev; end if;
  if v_ev::text like '%consultas%' then raise exception 'FALHOU: auditoria guardou o valor'; end if;
  v_resultados := array_append(v_resultados, 'Administração atualiza o contexto; auditoria registra só quais campos mudaram');

  perform pg_temp.como(v_b);
  v_ok := false;
  begin perform public.ei_update_organization_context(v_org, 'Invadida'); exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: outra organização alterou o contexto'; end if;
  v_ok := false;
  begin perform public.ei_update_my_job_area(v_org, 'gestao'); exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: quem não é membro alterou a área'; end if;
  select count(*) into v_n_int from public.organizations where id = v_org;
  if v_n_int <> 0 then raise exception 'FALHOU: outra organização leu o contexto'; end if;
  v_ok := false;
  begin update public.organizations set offering = 'x' where id = v_org; exception when insufficient_privilege then v_ok := true; end;
  if not v_ok then raise exception 'FALHOU: escrita direta na tabela'; end if;
  v_resultados := array_append(v_resultados, 'Outra organização não lê nem altera o contexto; ninguém escreve direto');

  perform pg_temp.como(v_a);
  perform public.ei_update_my_job_area(v_org, 'qualidade_experiencia');
  select job_area into v_area from public.organization_members where organization_id = v_org and user_id = v_a;
  if v_area <> 'qualidade_experiencia' then raise exception 'FALHOU: área não atualizada'; end if;
  v_resultados := array_append(v_resultados, 'A pessoa atualiza a própria área');

  execute 'reset role';
  insert into ei_resultado values ('OK: ' || array_length(v_resultados, 1) || ' verificações passaram: ' || array_to_string(v_resultados, ' | '));
end $$;

select mensagem from ei_resultado;
rollback;
