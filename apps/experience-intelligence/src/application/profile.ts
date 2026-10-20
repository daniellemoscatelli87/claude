// Perfil pessoal (D-025). Os dados ficam em ei_profiles, lidos e gravados só por funções do banco.
// No cadastro, seguem junto com a criação da conta (chave ei_signup) e o banco os retira dos metadados.
import type { Session } from "@supabase/supabase-js";
import { PersonalEditSchema, SENHA_INVALIDA, SignupSchema, errosPorCampo, senhaValida } from "@/domain/profile/personal";
import { supabase } from "@/infrastructure/supabase";
import { AppError } from "./errors";

export interface MyProfile { full_name: string; cpf_masked: string; birth_date: string; state: string; city: string; phone: string }

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
  const { email, password, password_confirm: _confirmacao, ...pessoais } = parsed.data;
  const { data, error } = await supabase().auth.signUp({
    email, password,
    options: { emailRedirectTo: location.origin + "/", data: { ei_signup: pessoais } },
  });
  // Erros do banco no cadastro (ex.: CPF já usado) chegam como erro genérico; não revelamos qual dado existe.
  if (error) throw /database error/i.test(error.message) ? new AppError("Não foi possível concluir o cadastro. Confira seus dados ou tente entrar.") : error;
  return Boolean(data.session);
}

export async function resendConfirmation(email: string): Promise<void> {
  const { error } = await supabase().auth.resend({ type: "signup", email: email.trim().toLowerCase(), options: { emailRedirectTo: location.origin + "/" } });
  if (error) throw error;
}

export async function saveMyProfile(input: unknown): Promise<void> {
  const parsed = PersonalEditSchema.safeParse(input);
  if (!parsed.success) throw new FieldErrors(errosPorCampo(parsed.error.issues));
  const d = parsed.data;
  const { error } = await supabase().rpc("ei_save_my_profile", {
    p_name: d.full_name, p_cpf: d.cpf, p_birth: d.birth_date, p_state: d.state, p_city: d.city, p_phone: d.phone,
  });
  if (error) throw error;
  // O nome também fica no perfil da conta, para aparecer no cabeçalho.
  await supabase().auth.updateUser({ data: { full_name: d.full_name } });
}

export async function changeEmail(email: string): Promise<void> {
  const { error } = await supabase().auth.updateUser({ email: email.trim().toLowerCase() }, { emailRedirectTo: location.origin + "/" });
  if (error) throw error;
}

export async function changePassword(senha: string, confirmacao: string): Promise<void> {
  if (!senhaValida(senha)) throw new FieldErrors({ password: SENHA_INVALIDA });
  if (senha !== confirmacao) throw new FieldErrors({ password_confirm: "As senhas não são iguais." });
  const { error } = await supabase().auth.updateUser({ password: senha });
  if (error) throw error;
}
