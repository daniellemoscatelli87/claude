-- E-mails que não recebem o convite automático da galeria ao se cadastrar (ex.: testes da administradora).
-- Os e-mails são inseridos direto no banco (não ficam no código). Só a função de envio lê, com a chave de serviço.
create table if not exists public.galeria_convite_excecoes (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);
alter table public.galeria_convite_excecoes enable row level security;
