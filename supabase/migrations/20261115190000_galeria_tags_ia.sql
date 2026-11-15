-- Tags do card da galeria sugeridas por IA: a IA escolhe e resume (sem inventar competências) as áreas e segmentos
-- marcados no cadastro, até caber em 2 linhas. A sugestão fica em galeria_tags_ia (galeria_tags_ia_de guarda a origem,
-- para refazer se o cadastro mudar). Ao enviar o perfil, as tags da prévia aprovada ficam em galeria_tags.
-- O card público usa galeria_tags; sem elas, as áreas e segmentos do cadastro (como antes).
alter table public.cadastros add column if not exists galeria_tags_ia text[];
alter table public.cadastros add column if not exists galeria_tags_ia_de text;
alter table public.cadastros add column if not exists galeria_tags text[];

drop function if exists public.galeria_publica();
create function public.galeria_publica()
returns table (nome text, cargo text, tempo text, areas text[], segmentos text[], tags text[], linkedin text, foto_url text)
language sql stable security definer set search_path = '' as $$
  select c.nome,
    coalesce(nullif(btrim(c.galeria_cargo), ''), nullif(public.rotulo_especialidade(c.principal_especializacao), '')),
    case when (select a.texto_versao from public.galeria_autorizacoes a where a.cadastro_id = c.id and a.decisao = 'autorizado'
               order by a.created_at desc limit 1) >= 'galeria-v3' then nullif(regexp_replace(btrim(coalesce(c.tempo_especialidade, '')), '\.\s*$', ''), '') end,
    c.areas_experiencia, c.segmentos, c.galeria_tags, c.galeria_linkedin, c.galeria_foto_url
  from public.cadastros c
  where c.galeria_status = 'autorizado' and not c.galeria_oculto
  order by c.galeria_decidido_em;
$$;
revoke all on function public.galeria_publica() from public;
grant execute on function public.galeria_publica() to anon, authenticated;
