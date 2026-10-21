// Perfil pessoal (D-025). Os dados ficam em ei_profiles, lidos e gravados só por funções do banco.
// No cadastro, seguem junto com a criação da conta (chave ei_signup) e o banco os retira dos metadados.
import type { Session } from "@supabase/supabase-js";
import { CompleteProfileSchema, PersonalDataSchema, SENHA_INVALIDA, SignupSchema, dadosDoCadastro, errosPorCampo, senhaValida } from "@/domain/profile/personal";
import { AVISO_VERSAO } from "@/domain/privacy/aviso";
import { supabase } from "@/infrastructure/supabase";
import { AppError } from "./errors";

export interface MyProfile { full_name: string; state: string; city: string; phone: string; privacy_notice_version: string; privacy_accepted_at: string }

export class FieldErrors extends AppError {
  constructor(public campos: Record<string, string>) { super(Object.values(campos)[0] ?? "Confira os dados informados."); }
}

export function displayName(session: Session | null, profile?: MyProfile | null): string | null {
  if (profile?.full_name) return profile.full_name;
  const n = session?.user?.user_metadata?.full_name;
  return typeof n === "string" && n.trim().length >= 2 ? n.trim() : null;
}

export async function myProfile(): Promise<MyProfile | null> {
  const { data, error } = await supabase().rpc("ei_my_profile");
  if (error) throw error;
  return (data as MyProfile | null) ?? null;
}

/** Cria a conta com os dados pessoais. Devolve true se já entrou (sem confirmação de e-mail pendente). */
export async function signUpWithProfile(input: unknown): Promise<boolean> {
  const parsed = SignupSchema.safeParse(input);
  if (!parsed.success) throw new FieldErrors(errosPorCampo(parsed.error.issues));
  const { email, password } = parsed.data;
  const { data, error } = await supabase().auth.signUp({
    email, password,
    options: { emailRedirectTo: location.origin + "/", data: { ei_signup: dadosDoCadastro(parsed.data) } },
  });
  // Erros do banco no cadastro chegam como erro genérico do serviço de login.
  if (error) throw /database error/i.test(error.message) ? new AppError("Não foi possível concluir o cadastro. Confira seus dados ou tente entrar.") : error;
  return Boolean(data.session);
}

export async function resendConfirmation(email: string): Promise<void> {
  const { error } = await supabase().auth.resend({ type: "signup", email: email.trim().toLowerCase(), options: { emailRedirectTo: location.origin + "/" } });
  if (error) throw error;
}

/** Salva o perfil. Ao criar (conta antiga sem perfil), exige maioridade declarada e aceite do aviso. */
export async function saveMyProfile(input: unknown, criando: boolean): Promise<void> {
  const parsed = (criando ? CompleteProfileSchema : PersonalDataSchema).safeParse(input);
  if (!parsed.success) throw new FieldErrors(errosPorCampo(parsed.error.issues));
  const d = parsed.data;
  const { error } = await supabase().rpc("ei_save_my_profile", {
    p_name: d.full_name, p_state: d.state, p_city: d.city, p_phone: d.phone,
    p_adult_declared: criando ? true : null, p_privacy_version: criando ? AVISO_VERSAO : null,
  });
  if (error) throw error;
  // O nome também fica no perfil da conta, para aparecer no cabeçalho.
  await supabase().auth.updateUser({ data: { full_name: d.full_name } });
}

export async function changeEmail(email: string): Promise<void> {
  const { error } = await supabase().auth.updateUser({ email: email.trim().toLowerCase() }, { emailRedirectTo: location.origin + "/" });
  if (error) throw error;
}

/** Envia o link de nova senha. A resposta na tela é sempre a mesma, exista ou não conta com o e-mail. */
export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase().auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${location.origin}/redefinir-senha/` });
  if (error && /rate limit|seconds/i.test(error.message)) throw error;
}

export async function changePassword(senha: string, confirmacao: string): Promise<void> {
  if (!senhaValida(senha)) throw new FieldErrors({ password: SENHA_INVALIDA });
  if (senha !== confirmacao) throw new FieldErrors({ password_confirm: "As senhas não são iguais." });
  const { error } = await supabase().auth.updateUser({ password: senha });
  if (error) throw error;
}
