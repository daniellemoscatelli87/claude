-- A administradora pode listar e apagar fotos da galeria (usado ao excluir um cadastro a pedido do titular).
create policy "Admin lista fotos da galeria" on storage.objects for select to authenticated using (bucket_id = 'galeria' and (select public.is_admin()));
create policy "Admin apaga fotos da galeria" on storage.objects for delete to authenticated using (bucket_id = 'galeria' and (select public.is_admin()));
