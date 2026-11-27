// Reuniões e Google Agenda: as mesmas regras de public/admin/reunioes/index.html e de public/admin/contatos/index.html.
import { sb } from "@/lib/supabase";

export type Reuniao = {
  meet_link?: string | null; google_event_id?: string | null; formato?: "online" | "presencial" | null; endereco?: string | null;
  evento_link?: string | null; status?: string | null; inicio?: string | null; duracao_min?: number | null; titulo?: string | null;
  assunto?: string | null; descricao?: string | null; updated_at?: string | null;
};
export type ContatoComReuniao = {
  id: string; nome: string | null; email: string | null; telefone?: string | null; empresa: string | null; cargo?: string | null;
  assunto: string | null; mensagem?: string | null; reuniao_em: string; reunioes?: Reuniao | Reuniao[] | null;
};

export const reuniaoDe = (r: { reunioes?: Reuniao | Reuniao[] | null }): Reuniao | null => (Array.isArray(r.reunioes) ? r.reunioes[0] ?? null : r.reunioes ?? null);
export const mapaDe = (endereco: string) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(endereco);
export const hora = (d: Date) => d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
/** "quinta-feira, 04 de dezembro às 14:00" */
export const quandoDaReuniao = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }) + " às " + hora(d);
};

/** Link que abre o Google Agenda com a reunião preenchida e o contato como convidado (1 hora), como Admin.googleCalendarLink. */
export function linkDoGoogleAgenda(r: { reuniao_em: string; nome?: string | null; empresa?: string | null; assunto?: string | null; cargo?: string | null; telefone?: string | null; mensagem?: string | null; email?: string | null }) {
  const data = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const inicio = new Date(r.reuniao_em), fim = new Date(inicio.getTime() + 60 * 6e4);
  const detalhes = ["Reunião agendada a partir de mensagem de contato do site.", r.assunto && "Assunto: " + r.assunto, r.empresa && "Empresa: " + r.empresa, r.cargo && "Cargo: " + r.cargo, r.telefone && "Telefone: " + r.telefone, r.mensagem && "\nMensagem:\n" + r.mensagem].filter(Boolean).join("\n");
  const q = new URLSearchParams({ action: "TEMPLATE", text: "Reunião com " + (r.nome || "contato") + (r.empresa ? " (" + r.empresa + ")" : ""), dates: data(inicio) + "/" + data(fim), details: detalhes });
  if (r.email) q.set("add", r.email);
  return "https://calendar.google.com/calendar/render?" + q.toString();
}

/** Separa as próximas (em ordem) e as anteriores (da mais recente para a mais antiga). */
export function separarReunioes<T extends { reuniao_em: string }>(lista: T[], agora = new Date()) {
  const ordenadas = [...lista].sort((a, b) => a.reuniao_em.localeCompare(b.reuniao_em));
  return {
    proximas: ordenadas.filter((r) => new Date(r.reuniao_em) >= agora),
    anteriores: ordenadas.filter((r) => new Date(r.reuniao_em) < agora).reverse(),
  };
}

export const ERRO_AGENDA: Record<string, string> = {
  google_desconectado: "Sua conta Google não está conectada ou a conexão expirou. Conecte novamente.",
  sem_credenciais: "Falta configurar as credenciais do Google (GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET) no Supabase.",
  falha: "Não foi possível falar com o Google Agenda. Tente novamente.",
};
export const erroAgenda = (e: string) => ERRO_AGENDA[e] || e;

export type StatusDoGoogle = { conectado?: boolean; configurado?: boolean; error?: string };
/** Função google-agenda (status, conectar, salvar, excluir); o erro vem como código. */
export async function agenda<T extends object = Record<string, unknown>>(body: object): Promise<T & { error?: string }> {
  const { data, error } = await sb.functions.invoke("google-agenda", { body });
  if (!error) return (data || {}) as T;
  let m = "falha";
  try {
    m = (await (error as { context?: Response }).context?.json())?.error || m;
  } catch {
    /* sem JSON: falha genérica */
  }
  return { error: m } as T & { error?: string };
}
