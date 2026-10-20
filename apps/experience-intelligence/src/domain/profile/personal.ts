// Dados pessoais da pessoa responsável (D-025). As mesmas regras são conferidas no banco
// (ei_validar_perfil); aqui servem para mostrar o erro junto do campo antes de enviar.
// CPF e data de nascimento: contrato e termos de uso, evitar contas duplicadas e confirmar maioridade.
import { z } from "zod";

export const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"] as const;

export const soDigitos = (v: string) => v.replace(/\D/g, "");

export function cpfValido(valor: string): boolean {
  const c = soDigitos(valor);
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  const dv = (n: number) => {
    let s = 0;
    for (let i = 0; i < n; i++) s += Number(c[i]) * (n + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(9) === Number(c[9]) && dv(10) === Number(c[10]);
}

/** Maior de 18 anos na data de hoje (data no formato AAAA-MM-DD). */
export function maiorDeIdade(data: string, hoje = new Date()): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  if (!m) return false;
  const [a, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (a < 1900) return false;
  const limite = new Date(hoje.getFullYear() - 18, hoje.getMonth(), hoje.getDate());
  return new Date(a, mes - 1, d) <= limite;
}

export const formatarCpf = (v: string) => soDigitos(v).slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
export const formatarTelefone = (v: string) => {
  const t = soDigitos(v).slice(0, 11);
  if (t.length <= 2) return t;
  const meio = t.length > 10 ? 7 : 6;
  return `(${t.slice(0, 2)}) ${t.slice(2, meio)}${t.length > meio ? "-" + t.slice(meio) : ""}`;
};

const nomeCompleto = z.string().trim().min(3, "Informe seu nome completo.").max(120, "Use até 120 caracteres.")
  .refine((v) => /\s/.test(v), "Informe seu nome completo.");

export const PersonalDataSchema = z.object({
  full_name: nomeCompleto,
  cpf: z.string().transform(soDigitos).refine(cpfValido, "Confira o CPF informado."),
  birth_date: z.string().refine((v) => maiorDeIdade(v), "O cadastro é para pessoas maiores de 18 anos."),
  state: z.enum(UFS, { message: "Selecione seu estado." }),
  city: z.string().trim().min(2, "Informe sua cidade.").max(80, "Use até 80 caracteres."),
  phone: z.string().transform(soDigitos).refine((v) => v.length === 10 || v.length === 11, "Confira o telefone com DDD."),
});
export type PersonalData = z.infer<typeof PersonalDataSchema>;

export const SignupSchema = PersonalDataSchema.extend({
  email: z.string().trim().toLowerCase().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Confira o endereço de e-mail informado."),
  password: z.string().min(8, "A senha não atende aos requisitos de segurança. Use pelo menos 8 caracteres."),
});

/** Na edição, o CPF pode ficar em branco para manter o atual. */
export const PersonalEditSchema = PersonalDataSchema.extend({
  cpf: z.string().transform(soDigitos).refine((v) => v === "" || cpfValido(v), "Confira o CPF informado."),
});

/** Primeiro erro de cada campo, para mostrar junto dele. */
export function errosPorCampo(issues: readonly { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const r: Record<string, string> = {};
  for (const i of issues) { const k = String(i.path[0]); if (!r[k]) r[k] = i.message; }
  return r;
}
