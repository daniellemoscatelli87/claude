// Textos e datas da área restrita: as mesmas regras das páginas de HTML (public/admin/admin.js e index.html).

export const iniciais = (nome?: string | null) =>
  (nome || "?").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "?";

export const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

/** "Hoje, 14:05", "Ontem" ou "12 de nov." (lista de notificações). */
export function diaCurto(iso: string, agora = new Date()): string {
  const d = new Date(iso);
  const dias = Math.floor((new Date(agora.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 864e5);
  if (dias === 0) return "Hoje, " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (dias === 1) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

/** Data e hora completas: { data: "27/11/2026", hora: "14:05" }. */
export function dataEHora(iso: string) {
  const d = new Date(iso);
  return { data: d.toLocaleDateString("pt-BR"), hora: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
}

/** "Bom dia", "Boa tarde" ou "Boa noite", com o primeiro nome. */
export function saudacao(nome: string, hora = new Date().getHours()) {
  const parte = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  return `${parte}, ${nome.trim().split(/\s+/)[0] || nome}!`;
}

/**
 * Situação de uma mensagem de contato: não lida, lida, respondida ou com reunião agendada.
 * Uma resposta nova do contato volta a mensagem para "não lida" (visualizado_em limpo no banco).
 */
export type SituacaoDaMensagem = "nao-lida" | "lida" | "respondida" | "reuniao";
export function situacaoDaMensagem(r: { visualizado_em?: string | null; respondido_em?: string | null; reuniao_em?: string | null }): SituacaoDaMensagem {
  if (!r.visualizado_em) return "nao-lida";
  if (r.reuniao_em) return "reuniao";
  if (r.respondido_em) return "respondida";
  return "lida";
}
export const ROTULO_DA_SITUACAO: Record<SituacaoDaMensagem, string> = {
  "nao-lida": "Não lida",
  lida: "Lida",
  respondida: "Respondida",
  reuniao: "Reunião agendada",
};

/** Segmentos de uma candidatura: os dois primeiros e "+N" (sem ponto final). */
export function segmentos(lista?: string[] | null) {
  const l = (lista || []).map((v) => String(v ?? "").replace(/\.$/, ""));
  return l.length > 2 ? l.slice(0, 2).join(", ") + " +" + (l.length - 2) : l.join(", ");
}

/** "1 não respondida", "3 não respondidas" ou "Todas respondidas". */
export function textoPendentes(n: number) {
  return n === 0 ? "Todas respondidas" : n === 1 ? "1 não respondida" : `${n} não respondidas`;
}
