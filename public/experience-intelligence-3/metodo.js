// Seção Método: comportamento da seção "Como funciona" da página do produto.
// Seção "Como funciona": cada parte anima quando chega na tela (Motion do design system).
(function () {
  var secao = document.getElementById('metodo');
  if (!secao) return;
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduzir || !('IntersectionObserver' in window)) return;
  secao.classList.add('anim-pronto');
  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('visivel');
      obs.unobserve(e.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
  secao.querySelectorAll('.plat-texto, .cf-identificar, .cf-nota').forEach(function (el) { obs.observe(el); });
})();

// Seção "Como funciona": "Step Indicator" do design system na linha do tempo. A etapa que passa do meio da tela
// vira a atual; as anteriores ficam marcadas como feitas, e a linha entre elas é preenchida.
(function () {
  var lista = document.querySelector('#metodo .cf-etapas');
  if (!lista) return;
  var etapas = Array.prototype.slice.call(lista.querySelectorAll('.cf-etapa'));
  lista.classList.add('cf-passo-a-passo');
  var agendado = false;
  function atualizar() {
    agendado = false;
    var limite = window.innerHeight * 0.6;
    var atual = -1;
    etapas.forEach(function (e, i) {
      var r = e.querySelector('.cf-num').getBoundingClientRect();
      if (r.top + r.height / 2 < limite) atual = i;
    });
    etapas.forEach(function (e, i) {
      e.classList.toggle('feita', i < atual);
      e.classList.toggle('atual', i === atual);
      // O card de cada etapa entra junto com a bolinha (uma vez só).
      if (i <= atual) e.classList.add('visivel');
    });
  }
  function pedir() { if (!agendado) { agendado = true; requestAnimationFrame(atualizar); } }
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  atualizar();
})();
