-- DM | Experience Intelligence · perfil pessoal da pessoa responsável (D-025).
-- Cadastro em etapas: 1) dados pessoais (nome completo, CPF, data de nascimento, estado, cidade, telefone,
-- e-mail e senha); 2) empresa ou negócio; 3) área logada.
-- Finalidades do CPF e da data de nascimento (dona do produto, 20/10/2026): identificar quem aceita o contrato
-- e os termos de uso, evitar contas duplicadas e confirmar a maioridade. Nota fiscal: não, por enquanto.
--
-- Como o e-mail precisa ser confirmado antes do primeiro login, os dados do cadastro chegam junto com a criação
-- da conta (metadados do Supabase Auth, chave "ei_signup"). Um gatilho valida, grava em ei_profiles e REMOVE
-- os dados pessoais dos metadados antes de a conta ser salva, para o CPF nunca ir para o token de acesso.
-- O gatilho só age quando a chave "ei_signup" existe: cadastros do site e a área restrita não são afetados.
-- Reversão: supabase/rollback/20261021100000_reverter.sql.

create table public.ei_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade deferrable initially deferred,
  full_name text not null check (char_length(btrim(full_name)) between 3 and 120),
  cpf text not null unique check (cpf ~ '^[0-9]{11}$'),
  birth_date date not null,
  state text not null check (state in ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO')),
  city text not null check (char_length(btrim(city)) between 2 and 80),
  phone text not null check (phone ~ '^[0-9]{10,11}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.ei_profiles enable row level security;
revoke all on public.ei_profiles from anon, authenticated;

-- CPF válido pelos dígitos verificadores (sem consultar a Receita).
create or replace function public.ei_cpf_valido(p text)
returns boolean language plpgsql immutable set search_path = '' as $$
declare d int[]; s int; r int; i int;
begin
  if p is null or p !~ '^[0-9]{11}$' or p ~ '^(.)\1{10}$' then return false; end if;
  d := array(select substr(p, g, 1)::int from generate_series(1, 11) g);
  s := 0; for i in 1..9 loop s := s + d[i] * (11 - i); end loop;
  r := (s * 10) % 11; if r = 10 then r := 0; end if;
  if r <> d[10] then return false; end if;
  s := 0; for i in 1..10 loop s := s + d[i] * (12 - i); end loop;
  r := (s * 10) % 11; if r = 10 then r := 0; end if;
  return r = d[11];
end $$;

-- Validação comum ao cadastro e à edição. Mensagens em português, sem revelar se o CPF já existe.
create or replace function public.ei_validar_perfil(p_name text, p_cpf text, p_birth date, p_state text, p_city text, p_phone text)
returns void language plpgsql stable set search_path = '' as $$
begin
  if char_length(btrim(coalesce(p_name, ''))) < 3 or btrim(p_name) !~ '\s' then
    raise exception 'Informe seu nome completo.' using errcode = 'check_violation';
  end if;
  if not public.ei_cpf_valido(p_cpf) then raise exception 'Confira o CPF informado.' using errcode = 'check_violation'; end if;
  if p_birth is null or p_birth > (current_date - interval '18 years')::date or p_birth < date '1900-01-01' then
    raise exception 'O cadastro é para pessoas maiores de 18 anos.' using errcode = 'check_violation';
  end if;
  if p_state is null or char_length(btrim(coalesce(p_city, ''))) < 2 then
    raise exception 'Informe seu estado e sua cidade.' using errcode = 'check_violation';
  end if;
  if coalesce(p_phone, '') !~ '^[0-9]{10,11}$' then raise exception 'Confira o telefone com DDD.' using errcode = 'check_violation'; end if;
end $$;

-- Gatilho na criação da conta: grava o perfil e limpa os metadados.
create or replace function public.ei_capturar_cadastro()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v jsonb := new.raw_user_meta_data -> 'ei_signup';
begin
  if v is null then return new; end if;
  perform public.ei_validar_perfil(v ->> 'full_name', v ->> 'cpf', (v ->> 'birth_date')::date, v ->> 'state', v ->> 'city', v ->> 'phone');
  insert into public.ei_profiles (user_id, full_name, cpf, birth_date, state, city, phone)
    values (new.id, btrim(v ->> 'full_name'), v ->> 'cpf', (v ->> 'birth_date')::date, v ->> 'state', btrim(v ->> 'city'), v ->> 'phone');
  -- Só o nome fica nos metadados (aparece no perfil); CPF, nascimento, endereço e telefone saem.
  new.raw_user_meta_data := (new.raw_user_meta_data - 'ei_signup') || jsonb_build_object('full_name', btrim(v ->> 'full_name'));
  return new;
end $$;
create trigger ei_capturar_cadastro before insert on auth.users
  for each row execute function public.ei_capturar_cadastro();

-- A própria pessoa lê o perfil (CPF mascarado; o completo nunca volta para a tela).
create or replace function public.ei_my_profile()
returns jsonb language sql stable security definer set search_path = '' as $$
  select case when p.user_id is null then null else jsonb_build_object(
    'full_name', p.full_name, 'cpf_masked', '***.***.' || substr(p.cpf, 7, 3) || '-' || substr(p.cpf, 10, 2),
    'birth_date', p.birth_date, 'state', p.state, 'city', p.city, 'phone', p.phone) end
  from (select 1) x left join public.ei_profiles p on p.user_id = (select auth.uid())
$$;

-- Cria (contas antigas, sem perfil) ou atualiza o perfil. CPF vazio na edição = manter o atual.
create or replace function public.ei_save_my_profile(p_name text, p_cpf text, p_birth date, p_state text, p_city text, p_phone text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_cpf text;
begin
  if v_user is null then raise exception 'Entre na sua conta para continuar.' using errcode = '42501'; end if;
  select cpf into v_cpf from public.ei_profiles where user_id = v_user;
  v_cpf := coalesce(nullif(p_cpf, ''), v_cpf);
  perform public.ei_validar_perfil(p_name, v_cpf, p_birth, p_state, p_city, p_phone);
  begin
    insert into public.ei_profiles (user_id, full_name, cpf, birth_date, state, city, phone)
      values (v_user, btrim(p_name), v_cpf, p_birth, p_state, btrim(p_city), p_phone)
      on conflict (user_id) do update set full_name = excluded.full_name, cpf = excluded.cpf, birth_date = excluded.birth_date,
        state = excluded.state, city = excluded.city, phone = excluded.phone, updated_at = now();
  exception when unique_violation then
    raise exception 'Não foi possível salvar. Confira seus dados.' using errcode = 'check_violation';
  end;
end $$;

revoke execute on function public.ei_cpf_valido(text), public.ei_validar_perfil(text, text, date, text, text, text),
  public.ei_capturar_cadastro(), public.ei_my_profile(), public.ei_save_my_profile(text, text, date, text, text, text) from public, anon;
revoke execute on function public.ei_cpf_valido(text), public.ei_validar_perfil(text, text, date, text, text, text),
  public.ei_capturar_cadastro() from authenticated;
grant execute on function public.ei_my_profile(), public.ei_save_my_profile(text, text, date, text, text, text) to authenticated;
-- O serviço de autenticação do Supabase executa o gatilho; ele precisa usar as funções de validação.
grant execute on function public.ei_cpf_valido(text), public.ei_validar_perfil(text, text, date, text, text, text),
  public.ei_capturar_cadastro() to supabase_auth_admin;
