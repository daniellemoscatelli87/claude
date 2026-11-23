-- Contatos: e-mail novo escrito pela administradora na área restrita ("Novo e-mail"), para qualquer endereço.
-- Vira uma conversa na lista (origem "enviado"); as respostas da pessoa entram no histórico como nas demais.
alter table public.contatos drop constraint contatos_origem_check;
alter table public.contatos add constraint contatos_origem_check check (origem in ('site', 'email', 'enviado'));
alter table public.contatos drop constraint contatos_dias_preferidos_check;
alter table public.contatos add constraint contatos_dias_preferidos_check check (origem <> 'site' or cardinality(dias_preferidos) > 0);

-- o aviso "Novo contato pelo site" é só para o formulário do site
create or replace function public.notificar_novo_contato()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $function$
begin
  if new.origem <> 'site' then return new; end if;
  perform net.http_post(
    url := 'https://lipfvnerohkaajegqvwr.supabase.co/functions/v1/notificar-contato',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcGZ2bmVyb2hrYWFqZWdxdndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMTU0ODYsImV4cCI6MjEwNzU5MTQ4Nn0.V5pco43Hqo97FjvW73v2bjErb4QR-HEk2idv-tsMpbU'
    ),
    body := jsonb_build_object('id', new.id)
  );
  return new;
end;
$function$;

-- anexos dos e-mails (bucket privado, só a administradora): qualquer tipo de arquivo, até 20 MB cada
update storage.buckets set allowed_mime_types = null, file_size_limit = 20971520 where id = 'anexos';
