-- A administradora pode apagar uma pesquisa inteira (botão "Apagar pesquisa" do painel, só com a pesquisa fora do ar).
-- As respostas, os interessados e o agrupamento dos relatos com IA saem junto (chaves estrangeiras com on delete cascade).
-- A regra de só apagar fora do ar também vale no banco: a política só aceita pesquisa com ativa = false.
create policy "Admin apaga pesquisa fora do ar" on public.pesquisas for delete to authenticated using (public.is_admin() and ativa = false);
grant delete on public.pesquisas to authenticated;
