-- Reversão da migração 20261021090000_contexto_organizacao.
-- ATENÇÃO: apaga o contexto informado pelas empresas (o que oferece, tipo, porte, CNPJ, área). Só com autorização.
-- Antes, publicar uma versão do app que não chame ei_setup_organization (usar ei_create_organization).
drop function if exists public.ei_update_my_job_area(uuid, text);
drop function if exists public.ei_update_organization_context(uuid, text, text, text, text, text, text);
drop function if exists public.ei_setup_organization(text, text, text, text, text, text, text);
drop function if exists public.ei_cnpj_normalizado(text);
drop function if exists public.ei_cnpj_valido(text);
alter table public.organization_members drop column if exists job_area;
alter table public.organizations drop column if exists context_updated_at, drop column if exists cnpj, drop column if exists size_band,
  drop column if exists org_type, drop column if exists offering;
