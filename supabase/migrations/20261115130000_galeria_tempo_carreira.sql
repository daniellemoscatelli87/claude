-- Galeria: o card passa a mostrar a senioridade (Júnior, Pleno, Sênior, Especialista), calculada pelo tempo
-- de carreira (campo 23 do cadastro). Termo novo (galeria-v3-2026-11-15) inclui a senioridade. Quem autorizou
-- numa versão anterior só aparece com a senioridade depois de aceitar o termo novo (ao enviar o perfil pela página de autorização).
create or replace function public.galeria_texto_termo() returns table (versao text, texto text)
language sql immutable set search_path = '' as $$
  select 'galeria-v3-2026-11-15'::text,
    ('Autorizo a Dani Moscatelli | Experience Design Studio a exibir, na Galeria de profissionais do site danimoscatelli.com.br, ' ||
     'o meu nome, especialidade, senioridade, áreas de atuação, segmentos, link do LinkedIn e foto, conforme a prévia apresentada. ' ||
     'E-mail, telefone e cidade não serão exibidos. Posso solicitar a exclusão do meu perfil da galeria a qualquer momento pelo e-mail ' ||
     'contato@danimoscatelli.com.br, e também a troca ou a exclusão da foto por esse e-mail.')::text;
$$;
revoke all on function public.galeria_texto_termo() from public, anon, authenticated;

-- aceite no cadastro: registra também o tempo de carreira entre os dados exibidos
create or replace function public.galeria_registrar_aceite_cadastro() returns trigger
language plpgsql security definer set search_path = '' as $$
declare t record;
begin
  if new.galeria_status = 'autorizado' then
    select * into t from public.galeria_texto_termo();
    insert into public.galeria_autorizacoes (cadastro_id, decisao, texto_versao, texto, dados_exibidos, user_agent)
    values (new.id, 'autorizado', t.versao, t.texto,
      jsonb_build_object('nome', new.nome, 'especialidade', regexp_replace(btrim(coalesce(new.principal_especializacao, '')), '\.\s*$', ''),
        'tempo_carreira', regexp_replace(btrim(coalesce(new.tempo_especialidade, '')), '\.\s*$', ''),
        'areas', to_jsonb(new.areas_experiencia), 'segmentos', to_jsonb(new.segmentos), 'linkedin', coalesce(new.galeria_linkedin, ''),
        'foto_url', '', 'origem', 'formulário de cadastro'),
      'formulário de cadastro');
  end if;
  return new;
end;
$$;

-- galeria pública: o tempo de carreira só aparece para quem aceitou o termo v3 (última decisão registrada)
drop function if exists public.galeria_publica();
create function public.galeria_publica()
returns table (nome text, cargo text, tempo text, areas text[], segmentos text[], linkedin text, foto_url text)
language sql stable security definer set search_path = '' as $$
  select c.nome,
    coalesce(nullif(btrim(c.galeria_cargo), ''), nullif(regexp_replace(btrim(coalesce(c.principal_especializacao, '')), '\.\s*$', ''), '')),
    case when (select a.texto_versao from public.galeria_autorizacoes a where a.cadastro_id = c.id and a.decisao = 'autorizado'
               order by a.created_at desc limit 1) >= 'galeria-v3' then nullif(regexp_replace(btrim(coalesce(c.tempo_especialidade, '')), '\.\s*$', ''), '') end,
    c.areas_experiencia, c.segmentos, c.galeria_linkedin, c.galeria_foto_url
  from public.cadastros c
  where c.galeria_status = 'autorizado' and not c.galeria_oculto
  order by c.galeria_decidido_em;
$$;
revoke all on function public.galeria_publica() from public;
grant execute on function public.galeria_publica() to anon, authenticated;
