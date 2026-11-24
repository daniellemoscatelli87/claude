-- Pesquisas: respostas incompletas guardadas no servidor (situação "parcial").
-- A pesquisa salva o progresso a cada pergunta respondida (depois da identificação); se a pessoa terminar,
-- a mesma linha (mesmo envio_id) vira a participação final. "parou_em" diz em qual etapa ela estava.
alter table public.pesquisa_respostas drop constraint pesquisa_respostas_situacao_check;
alter table public.pesquisa_respostas add constraint pesquisa_respostas_situacao_check
  check (situacao in ('completa', 'fora_de_curitiba', 'sem_compras', 'parcial'));
alter table public.pesquisa_respostas
  add column parou_em text check (parou_em is null or char_length(parou_em) <= 40),
  add column atualizado_em timestamptz;
