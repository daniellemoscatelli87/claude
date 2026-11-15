-- O painel (conta de administradora, pela política "Admin marca cadastros como vistos", que exige is_admin())
-- só podia alterar visualizado_em. O switch "Exibir" e o "Excluir perfil da galeria" alteram as colunas da galeria
-- e eram recusados ("permission denied for table cadastros"). Libera só essas colunas; a política continua exigindo admin.
grant update (galeria_oculto, galeria_status, galeria_decidido_em, galeria_cargo, galeria_tags, galeria_linkedin,
  galeria_foto_url, galeria_aceite_cadastro) on public.cadastros to authenticated;
