-- Autorização da Galeria de profissionais já no formulário de cadastro (pergunta opcional).
-- O formulário envia galeria_aceite_cadastro (true/false) e o cargo exibido (galeria_cargo).
-- O banco não confia em outros campos da galeria vindos do formulário: zera tudo e só marca "autorizado"
-- quando houve o aceite, registrando no histórico o texto exato do termo (mesma versão da página de autorização).
alter table public.cadastros add column if not exists galeria_aceite_cadastro boolean not null default false;

create or replace function public.galeria_texto_termo() returns table (versao text, texto text)
language sql immutable set search_path = '' as $$
  select 'galeria-v2-2026-11-14'::text,
    ('Autorizo a Dani Moscatelli | Experience Design Studio a exibir, na Galeria de profissionais do site danimoscatelli.com.br, ' ||
     'o meu nome, cargo, áreas de atuação, segmentos, link do LinkedIn e foto, conforme a prévia apresentada. ' ||
     'E-mail, telefone e cidade não serão exibidos. Posso retirar esta autorização a qualquer momento pelo mesmo link ou pelo e-mail ' ||
     'contato@danimoscatelli.com.br, e também solicitar a troca ou a exclusão da foto por esse e-mail.')::text;
$$;
revoke all on function public.galeria_texto_termo() from public, anon, authenticated;

create or replace function public.galeria_preparar_cadastro() returns trigger
language plpgsql security definer set search_path = '' as $$
declare li text := btrim(coalesce(new.linkedin, ''));
begin
  new.galeria_token := gen_random_uuid();
  new.galeria_oculto := false; new.galeria_foto_url := null; new.galeria_convite_em := null; new.galeria_linkedin := null;
  new.galeria_status := null; new.galeria_decidido_em := null;
  new.galeria_cargo := nullif(left(btrim(coalesce(new.galeria_cargo, '')), 60), '');
  if coalesce(new.galeria_aceite_cadastro, false) and new.galeria_cargo is not null then
    new.galeria_status := 'autorizado'; new.galeria_decidido_em := now();
    if li ~* '^(https?://)?(www\.)?([a-z]{2,3}\.)?linkedin\.com/' then
      new.galeria_linkedin := 'https://' || regexp_replace(li, '^https?://', '', 'i');
    end if;
  else
    new.galeria_aceite_cadastro := false; new.galeria_cargo := null;
  end if;
  return new;
end;
$$;
drop trigger if exists cadastros_galeria_preparar on public.cadastros;
create trigger cadastros_galeria_preparar before insert on public.cadastros
  for each row execute function public.galeria_preparar_cadastro();

create or replace function public.galeria_registrar_aceite_cadastro() returns trigger
language plpgsql security definer set search_path = '' as $$
declare t record;
begin
  if new.galeria_status = 'autorizado' then
    select * into t from public.galeria_texto_termo();
    insert into public.galeria_autorizacoes (cadastro_id, decisao, texto_versao, texto, dados_exibidos, user_agent)
    values (new.id, 'autorizado', t.versao, t.texto,
      jsonb_build_object('nome', new.nome, 'cargo', new.galeria_cargo, 'areas', to_jsonb(new.areas_experiencia),
        'segmentos', to_jsonb(new.segmentos), 'linkedin', coalesce(new.galeria_linkedin, ''), 'foto_url', '', 'origem', 'formulário de cadastro'),
      'formulário de cadastro');
  end if;
  return new;
end;
$$;
drop trigger if exists cadastros_galeria_aceite on public.cadastros;
create trigger cadastros_galeria_aceite after insert on public.cadastros
  for each row execute function public.galeria_registrar_aceite_cadastro();
