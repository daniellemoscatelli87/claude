// Menu do cabeçalho no celular.
(function () {
  var botao = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (!botao || !nav) return;
  function fechar() {
    nav.classList.remove('aberto');
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-label', 'Abrir menu');
  }
  botao.addEventListener('click', function () {
    var abrir = !nav.classList.contains('aberto');
    nav.classList.toggle('aberto', abrir);
    botao.setAttribute('aria-expanded', String(abrir));
    botao.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) fechar(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('aberto')) { fechar(); botao.focus(); } });
})();

// Cabeçalho ganha fundo ao rolar (igual à página inicial).
(function () {
  var h = document.getElementById('site-header');
  if (!h) return;
  function f() { h.classList.toggle('is-scrolled', window.scrollY > 8); }
  f();
  window.addEventListener('scroll', f, { passive: true });
})();
