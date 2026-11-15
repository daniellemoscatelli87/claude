-- 1) Rótulo curto da especialidade para o card da galeria: quem escreveu um texto longo no campo 13
--    (principal_especializacao) aparece no card só com a parte de mais peso (o começo do texto, até 40 caracteres):
--    corta a descrição depois de ponto, dois-pontos, travessão ou espaço duplo; depois "com ...", "focado em ...";
--    depois o que está entre parênteses; depois o que vem após vírgula. O texto completo continua no cadastro.
-- 2) Nome: a inicial de cada palavra fica maiúscula (exceto de, da, do, das, dos, e, que ficam como foram escritas). Vale para os cadastros
--    novos (trigger) e corrige os já existentes.
create or replace function public.rotulo_especialidade(t text) returns text
language plpgsql immutable set search_path = '' as $$
declare s text; p text;
begin
  s := btrim(regexp_replace(coalesce(t, ''), '\.\s*$', ''));
  s := btrim(split_part(regexp_replace(s, '\s{2,}|\.\s|:\s|\s[-–—]\s', chr(1), 'g'), chr(1), 1));
  if char_length(s) <= 40 then return s; end if;
  p := btrim(split_part(regexp_replace(s, '\s+(com|focad[oa]s?|voltad[oa]s?|especializad[oa]s?)\s', chr(1), 'gi'), chr(1), 1));
  if p <> '' then s := p; end if;
  if char_length(s) <= 40 then return s; end if;
  p := btrim(regexp_replace(regexp_replace(s, '\s*\([^)]*\)', '', 'g'), '\s{2,}', ' ', 'g'));
  if p <> '' then s := p; end if;
  if char_length(s) <= 40 then return s; end if;
  p := btrim(split_part(regexp_replace(s, '[,;]\s', chr(1), 'g'), chr(1), 1));
  if p <> '' then s := p; end if;
  if char_length(s) <= 40 then return s; end if;
  return regexp_replace(left(s, 40), '\s+\S*$', '') || '…';
end;
$$;

create or replace function public.nome_proprio(t text) returns text
language plpgsql immutable set search_path = '' as $$
declare w text; i int := 0; r text[] := '{}';
begin
  if t is null then return null; end if;
  foreach w in array regexp_split_to_array(btrim(regexp_replace(t, '\s+', ' ', 'g')), ' ') loop
    i := i + 1;
    if i > 1 and lower(w) in ('de', 'da', 'do', 'das', 'dos', 'e') then r := r || w;
    else r := r || (upper(left(w, 1)) || substr(w, 2)); end if;
  end loop;
  return array_to_string(r, ' ');
end;
$$;

create or replace function public.cadastros_nome_proprio() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.nome := public.nome_proprio(new.nome);
  return new;
end;
$$;
drop trigger if exists cadastros_nome_proprio on public.cadastros;
create trigger cadastros_nome_proprio before insert or update of nome on public.cadastros
  for each row execute function public.cadastros_nome_proprio();
update public.cadastros set nome = public.nome_proprio(nome) where nome is distinct from public.nome_proprio(nome);

-- galeria pública: especialidade = a escrita pela pessoa na autorização ou o rótulo do campo 13
create or replace function public.galeria_publica()
returns table (nome text, cargo text, tempo text, areas text[], segmentos text[], linkedin text, foto_url text)
language sql stable security definer set search_path = '' as $$
  select c.nome,
    coalesce(nullif(btrim(c.galeria_cargo), ''), nullif(public.rotulo_especialidade(c.principal_especializacao), '')),
    case when (select a.texto_versao from public.galeria_autorizacoes a where a.cadastro_id = c.id and a.decisao = 'autorizado'
               order by a.created_at desc limit 1) >= 'galeria-v3' then nullif(regexp_replace(btrim(coalesce(c.tempo_especialidade, '')), '\.\s*$', ''), '') end,
    c.areas_experiencia, c.segmentos, c.galeria_linkedin, c.galeria_foto_url
  from public.cadastros c
  where c.galeria_status = 'autorizado' and not c.galeria_oculto
  order by c.galeria_decidido_em;
$$;
revoke all on function public.galeria_publica() from public;
grant execute on function public.galeria_publica() to anon, authenticated;

-- aceite no cadastro: registra o rótulo exibido no card
create or replace function public.galeria_registrar_aceite_cadastro() returns trigger
language plpgsql security definer set search_path = '' as $$
declare t record;
begin
  if new.galeria_status = 'autorizado' then
    select * into t from public.galeria_texto_termo();
    insert into public.galeria_autorizacoes (cadastro_id, decisao, texto_versao, texto, dados_exibidos, user_agent)
    values (new.id, 'autorizado', t.versao, t.texto,
      jsonb_build_object('nome', new.nome, 'especialidade', public.rotulo_especialidade(new.principal_especializacao),
        'tempo_carreira', regexp_replace(btrim(coalesce(new.tempo_especialidade, '')), '\.\s*$', ''),
        'areas', to_jsonb(new.areas_experiencia), 'segmentos', to_jsonb(new.segmentos), 'linkedin', coalesce(new.galeria_linkedin, ''),
        'foto_url', '', 'origem', 'formulário de cadastro'),
      'formulário de cadastro');
  end if;
  return new;
end;
$$;
