-- Reversão da migração 20261021100000_perfil_pessoal.
-- ATENÇÃO: apaga os perfis pessoais (CPF, nascimento, endereço, telefone). Só com autorização.
-- Antes, publicar uma versão do app que não envie "ei_signup" no cadastro.
drop trigger if exists ei_capturar_cadastro on auth.users;
drop function if exists public.ei_capturar_cadastro();
drop function if exists public.ei_save_my_profile(text, text, date, text, text, text);
drop function if exists public.ei_my_profile();
drop function if exists public.ei_validar_perfil(text, text, date, text, text, text);
drop function if exists public.ei_cpf_valido(text);
drop table if exists public.ei_profiles;
