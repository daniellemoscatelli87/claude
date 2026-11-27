// Medição de acessos com consentimento (LGPD), a mesma regra de public/analytics.js, sem desenhar nada:
// o aviso é o AvisoCookies do DS (mesma chave "dm-cookies" no navegador). Nada do Google carrega antes de "Aceitar".
export const GA_ID = "G-FTVGXQRJQ6";

type Janela = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; dmEvento?: (nome: string, params?: object) => void };

let carregada = false;

/** A medição foi ligada nesta página (a pessoa aceitou agora ou já tinha aceitado). */
export const medicaoLigada = () => carregada;

export function ligarMedicao(w: Janela = window as Janela, d: Document = document) {
  if (carregada) return;
  carregada = true;
  w.dataLayer = w.dataLayer || [];
  // O gtag do Google precisa receber o objeto arguments (não um array).
  w.gtag = function gtag() {
    w.dataLayer!.push(arguments);
  };
  w.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  w.gtag("js", new Date());
  w.gtag("config", GA_ID);
  const s = d.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  d.head.appendChild(s);
}

/** Ao recusar depois de ter aceitado, apaga os cookies do Google Analytics deste domínio (como o analytics.js). */
export function apagarCookiesDeMedicao(d: Document = document, host: string = location.hostname) {
  for (const c of d.cookie.split(";")) {
    const nome = c.split("=")[0].trim();
    if (!/^_ga/.test(nome)) continue;
    for (const dominio of ["", "." + host.replace(/^www\./, ""), host]) {
      d.cookie = nome + "=; Max-Age=0; path=/" + (dominio ? "; domain=" + dominio : "");
    }
  }
}

/** Eventos das ações importantes do site (window.dmEvento): só registra com a medição ligada; nunca dados pessoais. */
export function instalarEventos(w: Janela = window as Janela) {
  w.dmEvento = (nome, params) => {
    if (carregada && w.gtag) w.gtag("event", nome, params || {});
  };
}

/** Só para os testes. */
export function _reiniciarMedicao() {
  carregada = false;
}
