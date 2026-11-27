// Regras do cadastro do Programa Projeto Piloto (as mesmas de src/projeto-piloto.ts): validação, mensagens e a linha
// gravada em "parceiro_piloto".
import { EMAIL_RE } from "@/compartilhado/site/supabase";

export type DadosDoCadastro = {
  nome: string; email: string; telefone: string; empresa: string; segmento: string; cidade: string; desafio: string; frente: string; consentimento: boolean;
};
export const CADASTRO_VAZIO: DadosDoCadastro = { nome: "", email: "", telefone: "", empresa: "", segmento: "", cidade: "", desafio: "", frente: "", consentimento: false };

export const TABELA = "parceiro_piloto";
export const TEMPO_LIMITE_MS = 15000;
export const LIMITE_DO_DESAFIO = 2000;
export const FALHA_DE_ENVIO = "Não foi possível enviar o cadastro agora. Verifique sua conexão e tente novamente. Seus dados continuam preenchidos.";

export type ErrosDoCadastro = Partial<Record<keyof DadosDoCadastro, string>>;

export function validarCadastro(d: DadosDoCadastro): ErrosDoCadastro {
  const e: ErrosDoCadastro = {};
  const t = (v: string) => v.trim();
  if (t(d.nome).length < 2) e.nome = "Informe o nome do responsável.";
  if (!EMAIL_RE.test(t(d.email))) e.email = "Informe um e-mail válido.";
  const dig = t(d.telefone).replace(/\D/g, "");
  if (dig.length < 10 || dig.length > 13) e.telefone = "Informe um telefone com DDD.";
  if (t(d.empresa).length < 1) e.empresa = "Informe o nome da empresa.";
  if (!d.segmento) e.segmento = "Selecione o segmento de atuação.";
  if (t(d.cidade).length < 2) e.cidade = "Informe a cidade e o estado.";
  if (t(d.desafio).length > LIMITE_DO_DESAFIO) e.desafio = "Use no máximo 2.000 caracteres.";
  if (!d.consentimento) e.consentimento = "Para continuar, aceite a Política de Privacidade.";
  return e;
}

export const mensagemGeral = (n: number) => (n === 1 ? "Corrija o campo destacado para continuar." : `Corrija os ${n} campos destacados para continuar.`);

export function linhaDoCadastro(d: DadosDoCadastro, envioId: string) {
  const t = (v: string) => v.trim();
  return {
    envio_id: envioId, nome: t(d.nome), email: t(d.email), telefone: t(d.telefone), empresa: t(d.empresa), segmento: d.segmento,
    cidade_estado: t(d.cidade), desafio: t(d.desafio) || null, frente: d.frente || null, consentimento: true,
  };
}
