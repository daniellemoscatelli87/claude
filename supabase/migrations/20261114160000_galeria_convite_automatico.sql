-- Aplicar só quando a página /rede-parceiros/galeria/autorizar/ estiver publicada.
-- Convite automático: cada novo cadastro dispara a função galeria-convite (envio único por parceiro).
create or replace function public.galeria_convidar_novo()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform net.http_post(
    url := 'https://lipfvnerohkaajegqvwr.supabase.co/functions/v1/galeria-convite',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('acao', 'novo', 'id', new.id)
  );
  return new;
end;
$$;
drop trigger if exists cadastros_galeria_convite on public.cadastros;
create trigger cadastros_galeria_convite after insert on public.cadastros
  for each row execute function public.galeria_convidar_novo();
