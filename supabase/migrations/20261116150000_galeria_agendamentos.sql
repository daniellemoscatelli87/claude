-- Agendamento do envio da autorização da galeria (área restrita > Parceiros > Autorização da galeria).
-- A administradora escolhe os destinatários (todos que ainda não decidiram ou pessoas escolhidas), data e hora;
-- pode alterar ou excluir enquanto o envio não aconteceu. Um relógio do banco (pg_cron) confere a cada minuto
-- se há envio vencido e, só nesse caso, chama a função galeria-convite, que envia e grava o resultado.

create extension if not exists pg_cron with schema pg_catalog;

create table if not exists public.galeria_agendamentos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  criado_por uuid default auth.uid(),
  agendado_para timestamptz not null,
  -- todos: quem ainda não decidiu na hora do envio; selecionados: só os escolhidos (quem decidiu antes fica de fora)
  modo text not null check (modo in ('todos', 'selecionados')),
  destinatarios uuid[] not null default '{}',
  situacao text not null default 'agendado' check (situacao in ('agendado', 'enviando', 'enviado', 'falhou')),
  executado_em timestamptz,
  enviados integer not null default 0,
  falhas integer not null default 0,
  ignorados integer not null default 0,
  erro text,
  constraint galeria_agendamentos_escolhidos check (modo = 'todos' or cardinality(destinatarios) > 0)
);
create index if not exists galeria_agendamentos_fila_idx on public.galeria_agendamentos (agendado_para) where situacao = 'agendado';
alter table public.galeria_agendamentos enable row level security;
create policy "Admin lê agendamentos da galeria" on public.galeria_agendamentos for select to authenticated using ((select is_admin()));
-- criar, alterar e excluir só enquanto está agendado (o que já foi enviado fica como histórico)
create policy "Admin agenda envio da galeria" on public.galeria_agendamentos for insert to authenticated
  with check ((select is_admin()) and situacao = 'agendado' and executado_em is null and enviados = 0 and falhas = 0);
create policy "Admin altera envio agendado" on public.galeria_agendamentos for update to authenticated
  using ((select is_admin()) and situacao = 'agendado') with check ((select is_admin()) and situacao = 'agendado');
create policy "Admin exclui envio agendado" on public.galeria_agendamentos for delete to authenticated
  using ((select is_admin()) and situacao = 'agendado');
revoke update on public.galeria_agendamentos from authenticated;
grant update (agendado_para, modo, destinatarios, atualizado_em) on public.galeria_agendamentos to authenticated;

-- Chave interna que só o banco e a função conhecem: o relógio manda a chave e a função confere lendo a mesma tabela
-- (sem segredo fora do banco). Ninguém de fora lê esta tabela.
create table if not exists public.agendador_chave (
  id integer primary key default 1 check (id = 1),
  chave uuid not null default gen_random_uuid()
);
alter table public.agendador_chave enable row level security;
revoke all on public.agendador_chave from anon, authenticated;
insert into public.agendador_chave (id) values (1) on conflict (id) do nothing;

-- Chamado pelo relógio: só chama a função quando existe envio vencido.
create or replace function public.disparar_agendamentos_galeria()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.galeria_agendamentos where situacao = 'agendado' and agendado_para <= now()) then
    perform net.http_post(
      url := 'https://lipfvnerohkaajegqvwr.supabase.co/functions/v1/galeria-convite',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object('acao', 'agendados', 'chave', (select chave from public.agendador_chave where id = 1)),
      timeout_milliseconds := 60000
    );
  end if;
end;
$$;
revoke all on function public.disparar_agendamentos_galeria() from public, anon, authenticated;

select cron.schedule('galeria-agendamentos', '* * * * *', 'select public.disparar_agendamentos_galeria()');
