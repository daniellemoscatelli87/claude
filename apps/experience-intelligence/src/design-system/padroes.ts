// Padrões de campos compartilhados com o site do estúdio (formulário de contato em src/em-breve.ts e
// Rede de Parceiros em public/rede-parceiros/index.html). Mesmas regras, mesmos textos de erro.
// Início do design system do produto (src/design-system/): ver docs/design-system/COMPONENTES.md.

/** Mesma expressão do site para e-mail. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mesmos domínios sugeridos pelo site ao digitar o e-mail. */
export const DOMINIOS = ["gmail.com", "outlook.com", "hotmail.com", "icloud.com", "yahoo.com.br", "live.com", "uol.com.br", "terra.com.br"];

export function sugestoesEmail(valor: string): string[] {
  const v = valor.trim(), at = v.indexOf("@");
  const usuario = at < 0 ? v : v.slice(0, at), dom = at < 0 ? "" : v.slice(at + 1).toLowerCase();
  return usuario && !/\s/.test(usuario) ? DOMINIOS.filter((d) => d.startsWith(dom) && d !== dom).slice(0, 4).map((d) => `${usuario}@${d}`) : [];
}

/** Máscara de telefone do site: (41) 99999-9999 ou (41) 3333-4444. */
export function maskPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  const rest = d.slice(2);
  if (rest.length <= 4) return `(${d.slice(0, 2)}) ${rest}`;
  const split = d.length === 11 ? 5 : 4;
  return `(${d.slice(0, 2)}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}

/** Mesma lista de estados do formulário da Rede de Parceiros. */
export const ESTADOS: readonly (readonly [string, string])[] = [["AC", "Acre"], ["AL", "Alagoas"], ["AP", "Amapá"], ["AM", "Amazonas"], ["BA", "Bahia"], ["CE", "Ceará"], ["DF", "Distrito Federal"], ["ES", "Espírito Santo"], ["GO", "Goiás"], ["MA", "Maranhão"], ["MT", "Mato Grosso"], ["MS", "Mato Grosso do Sul"], ["MG", "Minas Gerais"], ["PA", "Pará"], ["PB", "Paraíba"], ["PR", "Paraná"], ["PE", "Pernambuco"], ["PI", "Piauí"], ["RJ", "Rio de Janeiro"], ["RN", "Rio Grande do Norte"], ["RS", "Rio Grande do Sul"], ["RO", "Rondônia"], ["RR", "Roraima"], ["SC", "Santa Catarina"], ["SP", "São Paulo"], ["SE", "Sergipe"], ["TO", "Tocantins"]];

/** Mensagens de erro iguais às da Rede de Parceiros. */
export const MSG = {
  email: "Informe um endereço de e-mail válido.",
  tel: "Informe o telefone com DDD.",
  ufCidade: "Selecione o estado e a cidade.",
} as const;

/** Requisitos mínimos da senha e medidor de força (fraca, média, forte). */
export const requisitosSenha = (s: string) => [
  { ok: s.length >= 8, texto: "Pelo menos 8 caracteres" },
  { ok: /[a-zA-Z]/.test(s) && /\d/.test(s), texto: "Letras e números" },
];
export function forcaSenha(s: string): { nivel: 0 | 1 | 2 | 3; rotulo: string } {
  if (!s) return { nivel: 0, rotulo: "" };
  if (!requisitosSenha(s).every((r) => r.ok)) return { nivel: 1, rotulo: "Fraca" };
  const extras = [s.length >= 12, /[a-z]/.test(s) && /[A-Z]/.test(s), /[^a-zA-Z0-9]/.test(s)].filter(Boolean).length;
  return extras >= 2 ? { nivel: 3, rotulo: "Forte" } : { nivel: 2, rotulo: "Média" };
}

/** Máscara de CNPJ: 00.000.000/0000-00 (novo; o site não tem campo de CNPJ). */
export function maskCnpj(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 14);
  return d.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
}

/** CNPJ válido pelos dígitos verificadores (a mesma regra é conferida no banco). */
export function cnpjValido(valor: string): boolean {
  const c = valor.replace(/\D/g, "");
  if (c.length !== 14 || /^(\d)\1{13}$/.test(c)) return false;
  const dv = (n: number) => {
    const pesos = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const r = pesos.reduce((s, p, i) => s + Number(c[i]) * p, 0) % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return dv(12) === Number(c[12]) && dv(13) === Number(c[13]);
}
