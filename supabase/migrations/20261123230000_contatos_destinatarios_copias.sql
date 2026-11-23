-- "Novo e-mail" para vários destinatários, com cópia (Cc) e cópia oculta (Cco).
-- contatos.email continua com o primeiro destinatário (lista, busca e importação da caixa usam esse campo);
-- a lista completa fica em destinatarios, e as cópias em copias e copias_ocultas.
alter table public.contatos
  add column destinatarios text[],
  add column copias text[],
  add column copias_ocultas text[];

-- histórico: para quem cada envio foi copiado ("para" continua com os destinatários, separados por vírgula)
alter table public.respostas
  add column copias text[],
  add column copias_ocultas text[];
