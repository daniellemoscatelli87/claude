-- Um cadastro por e-mail na Rede de Parceiros.
-- 1) O banco recusa um segundo cadastro com o mesmo e-mail (sem diferenciar maiúsculas e espaços).
-- 2) O formulário pergunta, ao sair do campo de e-mail, se ele já está cadastrado. A função só responde
--    sim ou não, não devolve nenhum outro dado e só aceita texto com formato de e-mail.
create unique index if not exists cadastros_email_unico on public.cadastros (lower(btrim(email)));

create or replace function public.email_ja_cadastrado(p_email text)
returns boolean language sql stable security definer set search_path = '' as $$
  select case
    when p_email is null or length(p_email) > 254 or btrim(p_email) !~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' then false
    else exists (select 1 from public.cadastros c where lower(btrim(c.email)) = lower(btrim(p_email)))
  end;
$$;
revoke all on function public.email_ja_cadastrado(text) from public;
grant execute on function public.email_ja_cadastrado(text) to anon, authenticated;
