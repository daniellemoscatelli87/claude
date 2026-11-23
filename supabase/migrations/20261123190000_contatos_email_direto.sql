-- Contatos: e-mails enviados direto para contato@danimoscatelli.com.br também aparecem no painel.
-- origem: "site" (formulário do site) ou "email" (e-mail direto, copiado da caixa da Hostinger pela função importar-emails).
alter table public.contatos
  add column origem text not null default 'site' check (origem in ('site', 'email')),
  add column email_ref text unique; -- referência do e-mail na caixa (imap:<uidvalidity>:<uid>): o mesmo e-mail não entra duas vezes

-- "melhores dias" só existe no formulário do site
alter table public.contatos drop constraint contatos_dias_preferidos_check;
alter table public.contatos add constraint contatos_dias_preferidos_check check (origem = 'email' or cardinality(dias_preferidos) > 0);

-- o aviso "Novo contato pelo site" vai para contato@; e-mail direto já está nessa caixa (e tem aviso próprio)
create or replace function public.notificar_novo_contato()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $function$
begin
  if new.origem = 'email' then return new; end if;
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

-- onde a leitura da caixa parou (só a função, com a chave de serviço, lê e grava)
create table public.caixa_email_estado (
  caixa text primary key,
  uidvalidity bigint,
  ultimo_uid bigint,
  notificar_para text,          -- endereço que recebe o aviso de e-mail novo (definido direto no banco)
  atualizado_em timestamptz not null default now(),
  ultimo_erro text
);
alter table public.caixa_email_estado enable row level security;
revoke all on public.caixa_email_estado from anon, authenticated;

-- lê a caixa a cada 5 minutos (a chave pública só permite chamar a função; ela usa a chave de serviço por dentro)
select cron.schedule('importar-emails', '*/5 * * * *', $cron$
  select net.http_post(
    url := 'https://lipfvnerohkaajegqvwr.supabase.co/functions/v1/importar-emails',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcGZ2bmVyb2hrYWFqZWdxdndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMTU0ODYsImV4cCI6MjEwNzU5MTQ4Nn0.V5pco43Hqo97FjvW73v2bjErb4QR-HEk2idv-tsMpbU'),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
$cron$);
