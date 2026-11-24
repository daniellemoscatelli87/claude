-- Pesquisa: e-mail opcional na identificação (pessoas sem e-mail participam só com nome e WhatsApp).
-- pesquisa_respostas.email já aceita nulo; aqui o mesmo vale para a lista de interessados.
-- A verificação de formato continua valendo quando o e-mail é informado (CHECK com nulo passa).
alter table public.pesquisa_interessados alter column email drop not null;
