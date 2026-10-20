// Dados pessoais da pessoa responsável (D-025 revisto por D-026 e P-007). As mesmas regras são conferidas no
// banco (ei_validar_perfil); aqui servem para mostrar o erro junto do campo antes de enviar.
// Sem CPF e sem data de nascimento: a conta é identificada pelo e-mail confirmado; a maioridade é declarada.
// Estado e cidade são obrigatórios (análise do perfil de clientes, informada no aviso de privacidade).
import { z } from "zod";
import { EMAIL_RE, ESTADOS, MSG, maskPhone, requisitosSenha } from "@/design-system/padroes";
import { AVISO_VERSAO } from "@/domain/privacy/aviso";

export const UFS = ESTADOS.map(([uf]) => uf);

export const soDigitos = (v: string) => v.replace(/\D/g, "");

/** Telefone com a mesma máscara do site. */
export const formatarTelefone = maskPhone;

const nomeCompleto = z.string().trim().min(3, "Informe seu nome completo.").max(120, "Use até 120 caracteres.")
  .refine((v) => /\s/.test(v), "Informe seu nome completo.");

export const PersonalDataSchema = z.object({
  full_name: nomeCompleto,
  state: z.string().refine((v) => UFS.includes(v), MSG.ufCidade),
  city: z.string().trim().min(2, MSG.ufCidade).max(80, "Use até 80 caracteres."),
  phone: z.string().transform(soDigitos).refine((v) => v.length === 10 || v.length === 11, MSG.tel),
});
export type PersonalData = z.infer<typeof PersonalDataSchema>;

/** Declaração de maioridade e aceite do aviso, exigidos ao criar o perfil. */
const Aceites = z.object({
  adult_declared: z.boolean().refine((v) => v, "Confirme que você tem 18 anos ou mais."),
  privacy_accepted: z.boolean().refine((v) => v, "Aceite o aviso de privacidade para continuar."),
});

export const SENHA_INVALIDA = "A senha não atende aos requisitos de segurança. Confira as orientações do campo.";
export const senhaValida = (s: string) => requisitosSenha(s).every((r) => r.ok);

export const SignupSchema = PersonalDataSchema.extend(Aceites.shape).extend({
  email: z.string().trim().toLowerCase().regex(EMAIL_RE, MSG.email),
  password: z.string().refine(senhaValida, SENHA_INVALIDA),
  password_confirm: z.string(),
}).refine((d) => d.password === d.password_confirm, { path: ["password_confirm"], message: "As senhas não são iguais." });

/** Conta antiga sem perfil: dados pessoais + aceites. */
export const CompleteProfileSchema = PersonalDataSchema.extend(Aceites.shape);

/** Dados que vão junto com a criação da conta (o banco grava e retira dos metadados). */
export function dadosDoCadastro(d: PersonalData & { adult_declared: boolean }) {
  return { full_name: d.full_name, state: d.state, city: d.city, phone: d.phone, adult_declared: d.adult_declared, privacy_notice_version: AVISO_VERSAO };
}

/** Primeiro erro de cada campo, para mostrar junto dele. */
export function errosPorCampo(issues: readonly { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const r: Record<string, string> = {};
  for (const i of issues) { const k = String(i.path[0]); if (!r[k]) r[k] = i.message; }
  return r;
}
