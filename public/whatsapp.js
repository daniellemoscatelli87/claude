// Botão flutuante do WhatsApp (o mesmo da página inicial), para as demais páginas do site.
// Basta incluir <script src="/whatsapp.js" defer></script>. O rodapé ganha espaço embaixo para o botão não cobrir links.
(function () {
  if (document.querySelector("[data-whatsapp-flutuante]")) return;
  var MENSAGEM = "Olá, Dani! Vim pelo site danimoscatelli.com.br e gostaria de conversar sobre um projeto.";
  var a = document.createElement("a");
  a.href = "https://wa.me/5541997485414?text=" + encodeURIComponent(MENSAGEM);
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("data-whatsapp-flutuante", "");
  a.setAttribute("aria-label", "Conversar com a Dani no WhatsApp");
  a.title = "Conversar no WhatsApp";
  a.className = "dm-whatsapp";
  a.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.5h-.01a9.5 9.5 0 0 1-4.84-1.33l-.35-.21-3.6.94.96-3.5-.23-.36a9.46 9.46 0 0 1-1.45-5.04c0-5.24 4.27-9.5 9.52-9.5a9.44 9.44 0 0 1 6.72 2.79 9.43 9.43 0 0 1 2.78 6.72c0 5.24-4.27 9.5-9.5 9.5zm8.09-17.59A11.36 11.36 0 0 0 12.05.56C5.75.56.62 5.68.62 11.98c0 2.01.53 3.98 1.53 5.71L.53 23.6l6.06-1.59a11.4 11.4 0 0 0 5.45 1.39h.01c6.3 0 11.43-5.13 11.43-11.43 0-3.05-1.19-5.92-3.35-8.08z"/></svg>';

  var css = document.createElement("style");
  css.textContent =
    ".dm-whatsapp{position:fixed;right:20px;bottom:20px;z-index:45;width:56px;height:56px;border-radius:9999px;background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;" +
    "box-shadow:0 4px 12px rgba(13,17,25,.08),0 12px 36px rgba(13,17,25,.06);transition:transform .2s ease;text-decoration:none}" +
    ".dm-whatsapp:hover{transform:scale(1.05)}" +
    ".dm-whatsapp:focus-visible{outline:none;box-shadow:0 0 0 4px rgba(212,77,77,.35)}" +
    "@media (min-width:640px){.dm-whatsapp{right:24px;bottom:24px}}" +
    "@media (prefers-reduced-motion:reduce){.dm-whatsapp{transition:none}.dm-whatsapp:hover{transform:none}}";
  document.head.appendChild(css);
  document.body.appendChild(a);

  // Espaço extra no rodapé (o último da página) para o botão não cobrir os links do fim da página.
  var rodapes = document.querySelectorAll("footer");
  var rodape = rodapes[rodapes.length - 1];
  if (rodape) {
    var atual = parseFloat(getComputedStyle(rodape).paddingBottom) || 0;
    rodape.style.paddingBottom = Math.max(atual, 96) + "px";
  }
})();
