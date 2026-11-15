-- Nome escrito todo em maiúsculas (ex.: "THAIS MARIA DE CARVALHO") passa a ter só a inicial de cada palavra
-- maiúscula ("Thais Maria de Carvalho"). Vale para os cadastros novos (trigger existente) e corrige os atuais.
create or replace function public.nome_proprio(t text) returns text
language plpgsql immutable set search_path = '' as $$
declare w text; i int := 0; r text[] := '{}';
begin
  if t is null then return null; end if;
  t := btrim(regexp_replace(t, '\s+', ' ', 'g'));
  if t = upper(t) and t <> lower(t) then t := lower(t); end if;
  foreach w in array regexp_split_to_array(t, ' ') loop
    i := i + 1;
    if i > 1 and lower(w) in ('de', 'da', 'do', 'das', 'dos', 'e') then r := r || w;
    else r := r || (upper(left(w, 1)) || substr(w, 2)); end if;
  end loop;
  return array_to_string(r, ' ');
end;
$$;
update public.cadastros set nome = public.nome_proprio(nome) where nome is distinct from public.nome_proprio(nome);
