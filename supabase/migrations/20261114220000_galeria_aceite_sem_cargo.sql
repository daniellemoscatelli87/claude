-- O formulário de cadastro não pergunta mais o cargo da galeria (o Studio define o cargo exibido a partir do cadastro).
-- A autorização marcada no cadastro passa a valer sem o cargo; se algum envio antigo trouxer o cargo, ele é mantido.
create or replace function public.galeria_preparar_cadastro() returns trigger
language plpgsql security definer set search_path = '' as $$
declare li text := btrim(coalesce(new.linkedin, ''));
begin
  new.galeria_token := gen_random_uuid();
  new.galeria_oculto := false; new.galeria_foto_url := null; new.galeria_convite_em := null; new.galeria_linkedin := null;
  new.galeria_status := null; new.galeria_decidido_em := null;
  new.galeria_cargo := nullif(left(btrim(coalesce(new.galeria_cargo, '')), 60), '');
  if coalesce(new.galeria_aceite_cadastro, false) then
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
