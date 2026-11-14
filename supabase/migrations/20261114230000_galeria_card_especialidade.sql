-- Card da galeria: foto, nome, especialidade, LinkedIn e tags (áreas e segmentos). Sem cidade.
-- Especialidade: o texto definido pelo Studio no painel (galeria_cargo) ou, sem ele, o campo 13 do cadastro
-- (principal_especializacao). A coluna continua chamada "cargo" no retorno para não quebrar a página publicada.
create or replace function public.galeria_publica()
returns table (nome text, cargo text, areas text[], segmentos text[], linkedin text, foto_url text)
language sql stable security definer set search_path = '' as $$
  select c.nome,
    coalesce(nullif(btrim(c.galeria_cargo), ''), nullif(regexp_replace(btrim(coalesce(c.principal_especializacao, '')), '\.\s*$', ''), '')),
    c.areas_experiencia, c.segmentos, c.galeria_linkedin, c.galeria_foto_url
  from public.cadastros c
  where c.galeria_status = 'autorizado' and not c.galeria_oculto
  order by c.galeria_decidido_em;
$$;
