-- Controle manual da administradora: ocultar da galeria um perfil autorizado (sem mexer na autorização do parceiro).
-- Só é possível exibir quem autorizou; ocultar vale a qualquer momento.
alter table public.cadastros add column if not exists galeria_oculto boolean not null default false;

create or replace function public.galeria_publica()
returns table (nome text, cargo text, areas text[], segmentos text[], linkedin text, foto_url text)
language sql stable security definer set search_path = '' as $$
  select c.nome, c.galeria_cargo, c.areas_experiencia, c.segmentos, c.galeria_linkedin, c.galeria_foto_url
  from public.cadastros c
  where c.galeria_status = 'autorizado' and not c.galeria_oculto
  order by c.galeria_decidido_em;
$$;
