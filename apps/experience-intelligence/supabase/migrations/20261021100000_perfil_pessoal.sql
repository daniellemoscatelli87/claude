-- DM | Experience Intelligence · perfil pessoal da pessoa responsável (D-025, revisto por D-026 e P-007).
-- Cadastro em etapas: 1) dados pessoais (nome completo, estado, cidade, telefone, e-mail, senha, declaração de
-- maioridade e aceite do aviso de privacidade); 2) empresa ou negócio; 3) área logada.
-- Sem CPF e sem data de nascimento (P-007): a conta é identificada pelo id interno e pelo e-mail confirmado;
-- a maioridade é declarada. Estado e cidade são obrigatórios (decisão da dona do produto: análise do perfil de
-- clientes), e essa finalidade consta do aviso de privacidade.
--
-- Como o e-mail precisa ser confirmado antes do primeiro login, os dados do cadastro chegam junto com a criação
-- da conta (metadados do Supabase Auth, chave "ei_signup"). Um gatilho valida, grava em ei_profiles e REMOVE os
-- dados pessoais dos metadados antes de a conta ser salva, para não irem para o token de acesso (só o nome fica).
-- O gatilho só age quando a chave "ei_signup" existe: contas do site e a área restrita não são afetadas.
-- Reversão: supabase/rollback/20261021100000_reverter.sql.

create table public.ei_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade deferrable initially deferred,
  full_name text not null check (char_length(btrim(full_name)) between 3 and 120),
  state text not null check (state in ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO')),
  city text not null check (char_length(btrim(city)) between 2 and 80),
  phone text not null check (phone ~ '^[0-9]{10,11}$'),
  -- Declaração de maioridade e aceite do aviso de privacidade: quando e qual versão do texto.
  adult_declared_at timestamptz not null,
  privacy_notice_version text not null check (char_length(privacy_notice_version) between 1 and 40),
  privacy_accepted_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.ei_profiles enable row level security;
revoke all on public.ei_profiles from anon, authenticated;

-- Validação comum ao cadastro e à edição. Mensagens iguais às dos formulários do site.
create or replace function public.ei_validar_perfil(p_name text, p_state text, p_city text, p_phone text)
returns void language plpgsql stable set search_path = '' as $$
begin
  if char_length(btrim(coalesce(p_name, ''))) < 3 or btrim(p_name) !~ '\s' then
    raise exception 'Informe seu nome completo.' using errcode = 'check_violation';
  end if;
  if p_state is null or char_length(btrim(coalesce(p_city, ''))) < 2 then
    raise exception 'Selecione o estado e a cidade.' using errcode = 'check_violation';
  end if;
  if coalesce(p_phone, '') !~ '^[0-9]{10,11}$' then raise exception 'Informe o telefone com DDD.' using errcode = 'check_violation'; end if;
end $$;

-- Gatilho na criação da conta: grava o perfil e limpa os metadados.
create or replace function public.ei_capturar_cadastro()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v jsonb := new.raw_user_meta_data -> 'ei_signup';
begin
  if v is null then return new; end if;
  perform public.ei_validar_perfil(v ->> 'full_name', v ->> 'state', v ->> 'city', v ->> 'phone');
  if coalesce((v ->> 'adult_declared')::boolean, false) is not true then
    raise exception 'O cadastro é para pessoas maiores de 18 anos.' using errcode = 'check_violation';
  end if;
  if char_length(coalesce(v ->> 'privacy_notice_version', '')) = 0 then
    raise exception 'Aceite o aviso de privacidade para continuar.' using errcode = 'check_violation';
  end if;
  insert into public.ei_profiles (user_id, full_name, state, city, phone, adult_declared_at, privacy_notice_version, privacy_accepted_at)
    values (new.id, btrim(v ->> 'full_name'), v ->> 'state', btrim(v ->> 'city'), v ->> 'phone', now(), left(v ->> 'privacy_notice_version', 40), now());
  -- Só o nome fica nos metadados (aparece no perfil); telefone, estado e cidade saem.
  new.raw_user_meta_data := (new.raw_user_meta_data - 'ei_signup') || jsonb_build_object('full_name', btrim(v ->> 'full_name'));
  return new;
end $$;
create trigger ei_capturar_cadastro before insert on auth.users
  for each row execute function public.ei_capturar_cadastro();

-- A própria pessoa lê o próprio perfil.
create or replace function public.ei_my_profile()
returns jsonb language sql stable security definer set search_path = '' as $$
  select case when p.user_id is null then null else jsonb_build_object(
    'full_name', p.full_name, 'state', p.state, 'city', p.city, 'phone', p.phone,
    'privacy_notice_version', p.privacy_notice_version, 'privacy_accepted_at', p.privacy_accepted_at) end
  from (select 1) x left join public.ei_profiles p on p.user_id = (select auth.uid())
$$;

-- Cria (contas antigas, sem perfil: exige maioridade e aceite) ou atualiza o perfil (aceite já registrado).
create or replace function public.ei_save_my_profile(
  p_name text, p_state text, p_city text, p_phone text, p_adult_declared boolean default null, p_privacy_version text default null
) returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_existe boolean;
begin
  if v_user is null then raise exception 'Entre na sua conta para continuar.' using errcode = '42501'; end if;
  perform public.ei_validar_perfil(p_name, p_state, p_city, p_phone);
  select true into v_existe from public.ei_profiles where user_id = v_user;
  if coalesce(v_existe, false) then
    update public.ei_profiles set full_name = btrim(p_name), state = p_state, city = btrim(p_city), phone = p_phone, updated_at = now()
      where user_id = v_user;
  else
    if p_adult_declared is not true then raise exception 'O cadastro é para pessoas maiores de 18 anos.' using errcode = 'check_violation'; end if;
    if char_length(coalesce(p_privacy_version, '')) = 0 then raise exception 'Aceite o aviso de privacidade para continuar.' using errcode = 'check_violation'; end if;
    insert into public.ei_profiles (user_id, full_name, state, city, phone, adult_declared_at, privacy_notice_version, privacy_accepted_at)
      values (v_user, btrim(p_name), p_state, btrim(p_city), p_phone, now(), left(p_privacy_version, 40), now());
  end if;
end $$;

revoke execute on function public.ei_validar_perfil(text, text, text, text), public.ei_capturar_cadastro(),
  public.ei_my_profile(), public.ei_save_my_profile(text, text, text, text, boolean, text) from public, anon;
revoke execute on function public.ei_validar_perfil(text, text, text, text), public.ei_capturar_cadastro() from authenticated;
grant execute on function public.ei_my_profile(), public.ei_save_my_profile(text, text, text, text, boolean, text) to authenticated;
-- O serviço de autenticação do Supabase executa o gatilho; ele precisa usar a função de validação.
grant execute on function public.ei_validar_perfil(text, text, text, text), public.ei_capturar_cadastro() to supabase_auth_admin;
