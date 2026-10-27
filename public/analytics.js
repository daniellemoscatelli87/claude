// Medição de acessos com consentimento (LGPD).
// Nada do Google é carregado antes de "Aceitar". A escolha fica guardada neste navegador e pode ser revista
// por qualquer elemento com [data-preferencias-cookies] (rodapé e Política de Privacidade).
(function () {
  var GA_ID = "G-FTVGXQRJQ6";
  var CHAVE = "dm-cookies"; // "aceito" | "recusado"

  function ler() { try { return localStorage.getItem(CHAVE); } catch (e) { return null; } }
  function gravar(v) { try { localStorage.setItem(CHAVE, v); } catch (e) { /* sem armazenamento */ } }

  var carregado = false;
  function ligarMedicao() {
    if (carregado) return;
    carregado = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
  }

  // Ao recusar depois de ter aceitado, apaga os cookies do Google Analytics deste domínio.
  function apagarCookies() {
    document.cookie.split(";").forEach(function (c) {
      var nome = c.split("=")[0].trim();
      if (!/^_ga/.test(nome)) return;
      ["", "." + location.hostname.replace(/^www\./, ""), location.hostname].forEach(function (d) {
        document.cookie = nome + "=; Max-Age=0; path=/" + (d ? "; domain=" + d : "");
      });
    });
  }

  var aviso = null;
  function estilo() {
    if (document.getElementById("dm-cookies-estilo")) return;
    var css = document.createElement("style");
    css.id = "dm-cookies-estilo";
    css.textContent =
      ".dm-cookies{position:fixed;z-index:60;left:16px;right:16px;bottom:16px;max-width:720px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px;" +
      "padding:16px 18px;border-radius:16px;background:#fff;color:#0f172a;border:1px solid rgba(19,26,39,.09);box-shadow:0 8px 24px rgba(13,17,25,.09),0 24px 64px rgba(13,17,25,.07);" +
      "font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:14px;line-height:1.5}" +
      ".dm-cookies p{margin:0;flex:1 1 320px}" +
      ".dm-cookies a{color:#b82828;font-weight:600;text-underline-offset:3px}" +
      ".dm-cookies-acoes{display:flex;gap:8px;flex:0 0 auto;margin-left:auto}" +
      ".dm-cookies button{min-height:44px;padding:0 20px;border-radius:999px;font:inherit;font-weight:600;cursor:pointer}" +
      ".dm-cookies .recusar{background:#fff;color:#0f172a;border:1px solid rgba(19,26,39,.16)}" +
      ".dm-cookies .recusar:hover{background:#e8edf3}" +
      ".dm-cookies .aceitar{background:#d44d4d;color:#fff;border:1px solid #d44d4d}" +
      ".dm-cookies .aceitar:hover{background:#c13e3e;border-color:#c13e3e}" +
      ".dm-cookies button:focus-visible{outline:3px solid rgba(212,77,77,.35);outline-offset:2px}" +
      "@media (max-width:479px){.dm-cookies-acoes{width:100%}.dm-cookies button{flex:1}}";
    document.head.appendChild(css);
  }
  function mostrarAviso() {
    if (aviso) return;
    estilo();
    aviso = document.createElement("div");
    aviso.className = "dm-cookies";
    aviso.setAttribute("role", "region");
    aviso.setAttribute("aria-label", "Aviso de cookies");
    aviso.innerHTML =
      '<p>Usamos cookies do Google Analytics para entender, de forma agregada, como as pessoas usam o site e melhorar a sua experiência. A medição só começa se você aceitar. <a href="/privacidade/#cookies">Política de Privacidade</a></p>' +
      '<div class="dm-cookies-acoes"><button type="button" class="recusar">Recusar</button><button type="button" class="aceitar">Aceitar</button></div>';
    aviso.querySelector(".recusar").addEventListener("click", function () { escolher("recusado"); });
    aviso.querySelector(".aceitar").addEventListener("click", function () { escolher("aceito"); });
    document.body.appendChild(aviso);
  }
  function escolher(v) {
    var antes = ler();
    gravar(v);
    if (aviso) { aviso.remove(); aviso = null; }
    if (v === "aceito") ligarMedicao();
    else if (antes === "aceito") { apagarCookies(); location.reload(); }
  }

  function iniciar() {
    var v = ler();
    if (v === "aceito") ligarMedicao();
    else if (v !== "recusado") mostrarAviso();
    document.querySelectorAll("[data-preferencias-cookies]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); mostrarAviso(); });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
