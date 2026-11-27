// "Notificar lançamento" da página inicial (src/em-breve.ts): a mesma validação, a mesma tabela e o mesmo evento.
import { EMAIL_RE, inserir } from "@/compartilhado/site/supabase";

export const TEXTOS_DO_AVISO = {
  invalido: "Informe um e-mail válido.",
  falha: "Não foi possível enviar. Tente novamente.",
  parado: "Notificar lançamento",
  enviando: "Enviando…",
  feito: "Obrigado! Até breve!",
} as const;

/** Erro do e-mail antes de enviar (null = pode enviar). */
export function validarEmailDoAviso(email: string) {
  return EMAIL_RE.test(email.trim()) ? null : TEXTOS_DO_AVISO.invalido;
}

/** Grava o e-mail em notificacoes_lancamento (só inserção, como na página de HTML). */
export function gravarAvisoDeLancamento(email: string, buscar: typeof fetch = fetch) {
  return inserir("notificacoes_lancamento", { email: email.trim() }, { buscar });
}

/** Tempo que o "Obrigado! Até breve!" fica no botão antes de voltar ao estado inicial (o mesmo do HTML). */
export const TEMPO_DO_OBRIGADO = 4000;
