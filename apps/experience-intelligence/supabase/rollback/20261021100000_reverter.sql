-- Reversão da migração 20261021100000_perfil_pessoal.
-- ATENÇÃO: apaga os perfis pessoais (telefone, estado, cidade, registros de maioridade e de aceite). Só com autorização.
-- Antes, publicar uma versão do app que não envie "ei_signup" no cadastro.
drop trigger if exists ei_capturar_cadastro on auth.users;
drop function if exists public.ei_capturar_cadastro();
drop function if exists public.ei_save_my_profile(text, text, text, text, boolean, text);
drop function if exists public.ei_my_profile();
drop function if exists public.ei_validar_perfil(text, text, text, text);
drop table if exists public.ei_profiles;
