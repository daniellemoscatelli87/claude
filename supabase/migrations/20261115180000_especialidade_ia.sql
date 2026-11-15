-- Sugestão de especialidade por IA na página de autorização da galeria: um termo curto gerado a partir do
-- campo 13 (principal_especializacao). Fica guardado para não chamar a IA a cada visita; especialidade_ia_de
-- guarda o texto de origem, e a sugestão é refeita se o texto mudar.
alter table public.cadastros add column if not exists especialidade_ia text;
alter table public.cadastros add column if not exists especialidade_ia_de text;
