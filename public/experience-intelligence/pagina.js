// Menu do celular e tablet: barra lateral sobre o conteúdo.
(function () {
  var botao = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu-lateral');
  var fundo = document.querySelector('.lateral-fundo');
  if (!botao || !menu || !fundo) return;
  function fechar(devolverFoco) {
    menu.hidden = true; fundo.hidden = true;
    document.body.classList.remove('lateral-aberta');
    botao.setAttribute('aria-expanded', 'false');
    if (devolverFoco) botao.focus();
  }
  function abrir() {
    menu.hidden = false; fundo.hidden = false;
    document.body.classList.add('lateral-aberta');
    botao.setAttribute('aria-expanded', 'true');
    menu.querySelector('.menu-fechar').focus();
  }
  botao.addEventListener('click', abrir);
  document.querySelectorAll('[data-fechar-menu]').forEach(function (el) { el.addEventListener('click', function () { fechar(true); }); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a, [data-open-contact]')) fechar(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) fechar(true); });
  window.matchMedia('(min-width: 1200px)').addEventListener('change', function (m) { if (m.matches) fechar(false); });
})();

// Cabeçalho ganha fundo ao rolar (igual à página inicial).
(function () {
  var h = document.getElementById('site-header');
  if (!h) return;
  function f() { h.classList.toggle('is-scrolled', window.scrollY > 8); }
  f();
  window.addEventListener('scroll', f, { passive: true });
})();

// Avise-me: modal que grava o e-mail na lista de lançamento (tabela notificacoes_lancamento, a mesma da página inicial).
(function () {
  var SUPABASE_URL = 'https://lipfvnerohkaajegqvwr.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_vOvysMZ0LE2qpKIzLlcM6A_tckkDIej';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var modal = document.getElementById('modal-avise');
  var form = document.getElementById('avise-form');
  if (!modal || !form || typeof modal.showModal !== 'function') return;
  var email = document.getElementById('avise-email');
  var btn = document.getElementById('avise-btn');
  var msg = document.getElementById('avise-msg');
  var ok = document.getElementById('avise-ok');
  var msgPadrao = msg.textContent;
  var origem = null;

  function erro(texto) {
    msg.textContent = texto;
    msg.classList.add('erro');
    email.setAttribute('aria-invalid', 'true');
  }
  function limpar() {
    msg.textContent = msgPadrao;
    msg.classList.remove('erro');
    email.removeAttribute('aria-invalid');
  }
  function abrir(e) {
    origem = e.currentTarget;
    form.reset(); limpar();
    form.classList.remove('enviado'); ok.hidden = true;
    btn.disabled = false; btn.textContent = 'Enviar';
    modal.showModal();
    email.focus();
  }
  document.querySelectorAll('[data-avise]').forEach(function (b) { b.addEventListener('click', abrir); });
  modal.addEventListener('click', function (e) {
    if (e.target === modal || e.target.closest('[data-fechar]')) modal.close();
  });
  modal.addEventListener('close', function () { if (origem) origem.focus(); });
  email.addEventListener('input', function () { if (msg.classList.contains('erro')) limpar(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valor = email.value.trim();
    if (!EMAIL_RE.test(valor)) { erro('Informe um e-mail válido.'); email.focus(); return; }
    btn.disabled = true; btn.textContent = 'Enviando…';
    fetch(SUPABASE_URL + '/rest/v1/notificacoes_lancamento', {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ email: valor })
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      form.classList.add('enviado'); ok.hidden = false;
      window.dmEvento && window.dmEvento('cadastro_lancamento', { origem: 'pagina_produto' });
      ok.querySelector('button').focus();
    }).catch(function () {
      btn.disabled = false; btn.textContent = 'Enviar';
      erro('Não foi possível enviar. Tente novamente.');
    });
  });
})();

// Celular: no gráfico da jornada, os nomes das etapas e das linhas aparecem ao tocar.
(function () {
  var cartao = document.querySelector('.jornada');
  if (!cartao) return;
  var dica = cartao.querySelector('.dica');
  var celular = window.matchMedia('(max-width: 639px)');
  var atual = null;
  function esconder() { dica.hidden = true; atual = null; }
  function mostrar(alvo, texto, x, y) {
    if (atual === alvo) { esconder(); return; }
    var c = cartao.getBoundingClientRect();
    dica.textContent = texto;
    dica.hidden = false;
    var meia = dica.offsetWidth / 2;
    dica.style.left = Math.min(Math.max(x - c.left, meia + 4), c.width - meia - 4) + 'px';
    dica.style.top = (y - c.top) + 'px';
    atual = alvo;
  }
  cartao.addEventListener('click', function (e) {
    if (!celular.matches) return;
    var etapa = e.target.closest('.etapas li');
    if (etapa) {
      var r = etapa.querySelector('.etapa-ico').getBoundingClientRect();
      mostrar(etapa, etapa.querySelector('.etapa-nome').textContent, r.left + r.width / 2, r.top);
      return;
    }
    var linha = e.target.closest('.toque');
    if (linha) { mostrar(linha, linha.getAttribute('data-nome'), e.clientX, e.clientY); return; }
    esconder();
  });
  document.addEventListener('click', function (e) { if (!cartao.contains(e.target)) esconder(); });
  celular.addEventListener('change', esconder);
})();

// Celular: menu do painel abre e fecha pelo botão flutuante vermelho.
(function () {
  var janela = document.querySelector('.janela');
  var botao = janela && janela.querySelector('.painel-fab');
  if (!botao) return;
  botao.addEventListener('click', function (e) { e.stopPropagation(); janela.classList.toggle('menu-aberto'); });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.lateral')) janela.classList.remove('menu-aberto');
  });
  window.matchMedia('(max-width: 639px)').addEventListener('change', function () { janela.classList.remove('menu-aberto'); });
})();

// Seção "O que é a plataforma": animações ao entrar na tela (Motion do design system).
// - texto e cards: "Slide Up" (y 44 → 0, 0.7s, --ease-snappy), um depois do outro;
// - lista de "Nossa inteligência": "Animated List" — cada item entra no topo e empurra os outros para baixo
//   (y -32 → 0 e escala 0.93 → 1, com mola); inserimos de baixo para cima para a ordem final ser a da página.
(function () {
  var secao = document.getElementById('plataforma');
  if (!secao) return;
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduzir || !('IntersectionObserver' in window)) return;
  var lista = secao.querySelector('.plat-itens');
  var itens = lista ? Array.prototype.slice.call(lista.children) : [];
  secao.classList.add('anim-pronto');
  // Reserva a altura da lista para o card não mudar de tamanho enquanto os itens entram.
  function reservar() { if (lista) { lista.style.minHeight = ''; lista.style.minHeight = lista.offsetHeight + 'px'; } }
  reservar();
  itens.forEach(function (li) { li.remove(); });

  function inserir(li) {
    var antes = Array.prototype.map.call(lista.children, function (el) { return [el, el.getBoundingClientRect().top]; });
    lista.insertBefore(li, lista.firstChild);
    antes.forEach(function (par) {
      var dy = par[1] - par[0].getBoundingClientRect().top;
      par[0].style.transition = 'none';
      par[0].style.transform = 'translateY(' + dy + 'px)';
    });
    li.style.transition = 'none';
    li.style.opacity = '0';
    li.style.transform = 'translateY(-32px) scale(.93)';
    lista.offsetHeight; // aplica o estado inicial antes de animar
    var mola = 'transform .5s cubic-bezier(.22,1.25,.36,1), opacity .35s ease-out';
    antes.forEach(function (par) { par[0].style.transition = mola; par[0].style.transform = ''; });
    li.style.transition = mola;
    li.style.opacity = '';
    li.style.transform = '';
  }

  var obs = new IntersectionObserver(function (entradas) {
    if (!entradas.some(function (e) { return e.isIntersecting; })) return;
    obs.disconnect();
    secao.classList.add('visivel');
    itens.slice().reverse().forEach(function (li, i) { setTimeout(function () { inserir(li); }, 650 + i * 420); });
  }, { threshold: 0, rootMargin: '0px 0px -25% 0px' });
  obs.observe(secao.querySelector('.plat-fluxo') || secao);
})();
