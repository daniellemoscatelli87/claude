-- Pesquisas: identificação no início (nome, e-mail e WhatsApp) para garantir uma participação por pessoa.
-- Os dados ficam na própria resposta; excluir a resposta no painel libera o e-mail e o WhatsApp para responder de novo.
alter table public.pesquisa_respostas
  add column nome text check (nome is null or char_length(nome) between 1 and 120),
  add column email text check (email is null or char_length(email) <= 254),
  add column whatsapp text check (whatsapp is null or whatsapp ~ '^[0-9]{10,11}$'),
  add column identificacao_em timestamptz,
  add column identificacao_versao text,
  add column identificacao_texto text;

-- uma participação por e-mail e uma por WhatsApp em cada pesquisa (respostas antigas, sem identificação, ficam de fora)
create unique index pesquisa_respostas_email_unico on public.pesquisa_respostas (pesquisa, lower(email)) where email is not null;
create unique index pesquisa_respostas_whatsapp_unico on public.pesquisa_respostas (pesquisa, whatsapp) where whatsapp is not null;
