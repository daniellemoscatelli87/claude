// Medição de acessos com Google Analytics 4, só nas páginas públicas e só depois do consentimento (LGPD).
// Sem o ID de medição (NEXT_PUBLIC_GA_ID), nada é carregado e o aviso de cookies não aparece.
// Nunca envia dados pessoais: o endereço vai sem parâmetros nem fragmento (o link de nova senha leva um token).

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
const CHAVE = "dm-ei-cookies";
export type Escolha = "aceito" | "recusado";

type Gtag = (...args: unknown[]) => void;
declare global { interface Window { dataLayer?: unknown[]; gtag?: Gtag } }

export function escolhaSalva(): Escolha | null {
  try {
    const v = localStorage.getItem(CHAVE);
    return v === "aceito" || v === "recusado" ? v : null;
  } catch { return null; }
}

export function salvarEscolha(e: Escolha) {
  try { localStorage.setItem(CHAVE, e); } catch { /* sem armazenamento: vale só nesta visita */ }
}

function endereco() {
  return location.origin + location.pathname;
}

let carregado = false;

export const ABRIR_COOKIES = "dm-ei-cookies-abrir";
/** Reabre o aviso de cookies (link "Preferências de cookies"). */
export function abrirPreferenciasCookies() {
  window.dispatchEvent(new Event(ABRIR_COOKIES));
}

/** Carrega o GA4 (só chamar com consentimento) e registra a página atual. */
export function iniciarMedicao() {
  if (!GA_ID || typeof window === "undefined") return;
  if (!carregado) {
    carregado = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer!.push(arguments); }; // eslint-disable-line prefer-rest-params
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(s);
  }
  window.gtag?.("event", "page_view", { page_location: endereco(), page_title: document.title });
}

/** Evento agregado (ex.: hero_cta_click). Não faz nada sem consentimento. */
export function medir(evento: string, params: Record<string, string> = {}) {
  if (!carregado || escolhaSalva() !== "aceito") return;
  window.gtag?.("event", evento, { ...params, page_location: endereco() });
}
