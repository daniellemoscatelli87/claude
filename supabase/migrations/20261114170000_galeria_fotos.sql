-- Fotos da Galeria de profissionais, enviadas pelo próprio parceiro na página de autorização.
-- Bucket público (as fotos aparecem no site), mas os arquivos têm nome aleatório e só são divulgados pela
-- função galeria_publica quando o parceiro autorizou. O envio é feito só pela função galeria-autorizacao
-- (chave de serviço): não há política de escrita para anônimos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('galeria', 'galeria', true, 2097152, array['image/jpeg'])
on conflict (id) do nothing;
