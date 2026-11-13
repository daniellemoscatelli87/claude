// Política de privacidade numa janela (modal), em qualquer página do site, sem sair da página.
// Basta incluir <script src="/privacidade-modal.js" defer></script>. Sem JavaScript, o link abre a página /privacidade/.
// O conteúdo vem da própria página /privacidade/ (bloco <article>), então há um único texto da política.
(function () {
  if (document.getElementById("polDlg") || document.getElementById("dm-politica")) return; // a página já tem a sua janela
  var css = document.createElement("style");
  css.textContent =
    "#dm-politica{position:fixed;inset:0;margin:auto;height:fit-content;width:min(720px,calc(100vw - 32px));max-height:min(85vh,860px);padding:0;border:1px solid rgba(19,26,39,.09);border-radius:20px;background:#fff;color:#131A27;" +
    "box-shadow:0 4px 12px rgba(13,17,25,.08),0 12px 36px rgba(13,17,25,.06);font-family:'Plus Jakarta Sans',system-ui,sans-serif;overflow:hidden}" +
    "#dm-politica[open]{display:flex;flex-direction:column}" +
    "#dm-politica::backdrop{background:rgba(13,17,25,.55);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}" +
    "#dm-politica .dm-pol-topo{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 24px;border-bottom:1px solid rgba(19,26,39,.09)}" +
    "#dm-politica .dm-pol-topo h2{margin:0;font-size:1.125rem;font-weight:600;letter-spacing:-.01em;color:#131A27}" +
    "#dm-politica .dm-pol-fechar{width:36px;height:36px;flex:none;border:0;border-radius:9999px;background:transparent;color:#495669;cursor:pointer;display:flex;align-items:center;justify-content:center}" +
    "#dm-politica .dm-pol-fechar:hover{background:#EDF0F5;color:#131A27}" +
    "#dm-politica .dm-pol-fechar:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(212,77,77,.45)}" +
    "#dm-politica .dm-pol-corpo{overflow-y:auto;padding:20px 24px 28px;font-size:.9375rem;line-height:1.65;color:#495669}" +
    "#dm-politica .dm-pol-corpo h1,#dm-politica .dm-pol-corpo .tag{display:none}" +
    "#dm-politica .dm-pol-corpo h2{margin:24px 0 8px;font-size:1rem;font-weight:600;color:#131A27}" +
    "#dm-politica .dm-pol-corpo p,#dm-politica .dm-pol-corpo ul{margin:0 0 12px}" +
    "#dm-politica .dm-pol-corpo ul{padding-left:20px;list-style:disc}#dm-politica .dm-pol-corpo li::marker{color:#B82828}" +
    "#dm-politica .dm-pol-corpo li{margin-bottom:6px}" +
    "#dm-politica .dm-pol-corpo strong{color:#131A27;font-weight:600}" +
    "#dm-politica .dm-pol-corpo a{color:#B82828;text-decoration:underline;text-underline-offset:2px}" +
    "#dm-politica .dm-pol-corpo .updated{font-size:.8125rem;color:#627288}" +
    "@media (max-width:639px){#dm-politica .dm-pol-topo{padding:16px 20px}#dm-politica .dm-pol-corpo{padding:16px 20px 24px}}";
  document.head.appendChild(css);

  var dlg = document.createElement("dialog");
  dlg.id = "dm-politica";
  dlg.setAttribute("aria-labelledby", "dm-politica-titulo");
  dlg.innerHTML =
    '<div class="dm-pol-topo"><h2 id="dm-politica-titulo">Política de Privacidade</h2>' +
    '<button type="button" class="dm-pol-fechar" aria-label="Fechar a política de privacidade">' +
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>' +
    '<div class="dm-pol-corpo" tabindex="0"><p>Carregando…</p></div>';
  document.body.appendChild(dlg);
  var corpo = dlg.querySelector(".dm-pol-corpo");
  var carregado = false;
  var origem = null;

  dlg.querySelector(".dm-pol-fechar").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("close", function () {
    document.documentElement.style.overflow = "";
    if (origem && origem.focus) origem.focus();
  });

  function carregar(ancora) {
    if (carregado) { rolar(ancora); return; }
    fetch("/privacidade/")
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (html) {
        var art = new DOMParser().parseFromString(html, "text/html").querySelector("article");
        if (!art) throw new Error("sem conteúdo");
        corpo.replaceChildren.apply(corpo, Array.prototype.map.call(art.childNodes, function (n) { return document.importNode(n, true); }));
        carregado = true;
        rolar(ancora);
      })
      .catch(function () {
        corpo.innerHTML = '<p>Não foi possível carregar a política agora. <a href="/privacidade/" target="_blank" rel="noopener">Abrir em outra aba</a>.</p>';
      });
  }
  function rolar(ancora) {
    var alvo = ancora && corpo.querySelector("#" + CSS.escape(ancora));
    corpo.scrollTop = alvo ? alvo.offsetTop - corpo.offsetTop - 8 : 0;
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="/privacidade"]');
    if (!a || dlg.contains(a) || e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    origem = a;
    var ancora = (a.getAttribute("href").split("#")[1] || "");
    document.documentElement.style.overflow = "hidden";
    dlg.showModal();
    carregar(ancora);
    if (window.dmEvento) window.dmEvento("abrir_politica_privacidade");
  });
})();
