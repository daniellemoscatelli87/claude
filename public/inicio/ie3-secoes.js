// Seções levadas da página IE-3 para a home: entrada ao rolar (igual à IE-3) e carrossel de depoimentos.
(function () {
  var raiz = document.getElementById('ie3-home');
  if (!raiz || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  raiz.classList.add('ie3-revelar');
  var secoes = Array.prototype.slice.call(raiz.querySelectorAll('section'));
  var obsSec = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) e.target.classList.add('ei3-visivel');
      else if (e.boundingClientRect.top > 0) e.target.classList.remove('ei3-visivel');
    });
  }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
  secoes.forEach(function (s) { obsSec.observe(s); });
  var mapa = {
    depoimentos: ':scope > div > :not(.flex-wrap):not(.mb-10), .flex-wrap > span, #testimonials-track',
    artigos: ':scope > div > :not(.relative), article',
    'empresas-atendidas': ':scope > div > :not(style)'
  };
  var todos = [];
  Object.keys(mapa).forEach(function (id) {
    var sec = document.getElementById(id);
    if (!sec) return;
    Array.prototype.forEach.call(sec.querySelectorAll(mapa[id]), function (el) { if (todos.indexOf(el) < 0) todos.push(el); });
    if (id === 'depoimentos') { var c = document.getElementById('carousel-prev-btn'); if (c) todos.push(c.parentElement); }
  });
  todos.forEach(function (el) { el.classList.add('ei3-a'); });
  var obs = new IntersectionObserver(function (es) {
    var entrando = es.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
    entrando.sort(function (a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; });
    entrando.forEach(function (el, k) { el.style.setProperty('--d', Math.min(k * 0.08, 0.8) + 's'); el.classList.add('ei3-in'); });
    es.forEach(function (e) {
      if (e.isIntersecting) return;
      if (e.boundingClientRect.top > 0) e.target.classList.remove('ei3-in');
      else { e.target.style.setProperty('--d', '0s'); e.target.classList.add('ei3-in'); }
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  todos.forEach(function (el) { obs.observe(el); });
  var agendado = false;
  function acima() { agendado = false; todos.forEach(function (el) {
    if (!el.classList.contains('ei3-in') && el.getBoundingClientRect().bottom < 0) { el.style.setProperty('--d', '0s'); el.classList.add('ei3-in'); }
  }); }
  window.addEventListener('scroll', function () { if (!agendado) { agendado = true; requestAnimationFrame(acima); } }, { passive: true });
})();
// Depoimentos: setas avançam um card; os pontos mostram a posição (um ponto por grupo visível)
(function () {
  var trilha = document.getElementById('testimonials-track'), pontos = document.getElementById('carousel-dots');
  if (!trilha || !pontos) return;
  var cards = trilha.querySelectorAll('.testimonial-card');
  function passo() { return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : trilha.clientWidth; }
  window.ei3Depo = function (d) {
    var max = trilha.scrollWidth - trilha.clientWidth;
    var alvo = trilha.scrollLeft + d * passo();
    if (alvo > max + 4) alvo = 0; else if (alvo < -4) alvo = max;
    trilha.scrollTo({ left: alvo, behavior: 'smooth' });
  };
  function desenhar() {
    var porTela = Math.max(1, Math.round(trilha.clientWidth / passo()));
    var n = Math.max(1, cards.length - porTela + 1), atual = Math.round(trilha.scrollLeft / passo());
    // Em telas menores, muitos pontos não cabem: mostra a posição em número
    if (window.innerWidth < 1024) { pontos.className = 'px-3 text-xs font-semibold text-graphite-500 tabular-nums'; pontos.textContent = (Math.min(atual, n - 1) + 1) + ' de ' + n; return; }
    if (pontos.className.indexOf('gap-1.5') < 0) { pontos.className = 'flex items-center gap-1.5 px-2'; pontos.innerHTML = ''; }
    if (pontos.children.length !== n) { pontos.innerHTML = ''; for (var i = 0; i < n; i++) pontos.appendChild(document.createElement('span')); }
    for (var k = 0; k < n; k++) pontos.children[k].className = k === Math.min(atual, n - 1) ? 'w-2.5 h-2.5 rounded-full bg-brand-500 transition-all' : 'w-2 h-2 rounded-full bg-graphite-300 transition-all';
  }
  trilha.addEventListener('scroll', function () { requestAnimationFrame(desenhar); }, { passive: true });
  window.addEventListener('resize', desenhar);
  desenhar();
})();
