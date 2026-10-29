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
// Texto e cards: "Slide Up" (y 44 → 0, 0.7s, --ease-snappy), um depois do outro; itens das listas aparecem em seguida.
(function () {
  var secao = document.getElementById('plataforma');
  if (!secao) return;
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduzir || !('IntersectionObserver' in window)) return;
  secao.classList.add('anim-pronto');
  var obs = new IntersectionObserver(function (entradas) {
    if (!entradas.some(function (e) { return e.isIntersecting; })) return;
    obs.disconnect();
    secao.classList.add('visivel');
  }, { threshold: 0, rootMargin: '0px 0px -25% 0px' });
  obs.observe(secao.querySelector('.plat-fluxo') || secao);
})();

// Seção "Como funciona": cada parte anima quando chega na tela (Motion do design system).
(function () {
  var secao = document.getElementById('como-funciona');
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

// Seção "Nossa inteligência" (computador): linhas tracejadas do centro até cada área, recalculadas quando a tela muda.
// As linhas ficam atrás dos cards e os pontos ficam por cima deles.
(function () {
  var roda = document.querySelector('.rag-roda');
  var svg = roda && roda.querySelector('.rag-linhas');
  var pontos = roda && roda.querySelector('.rag-pontos');
  var centro = roda && roda.querySelector('.rag-centro');
  if (!svg || !pontos || !centro) return;
  var NS = 'http://www.w3.org/2000/svg';
  function desenhar() {
    svg.textContent = '';
    pontos.textContent = '';
    if (getComputedStyle(svg).display === 'none') return;
    var base = roda.getBoundingClientRect();
    var c = centro.getBoundingClientRect();
    var cx = c.left + c.width / 2 - base.left, cy = c.top + c.height / 2 - base.top;
    var raio = c.width / 2 + 45;
    roda.querySelectorAll('.rag-area').forEach(function (area, i) {
      var r = area.getBoundingClientRect();
      var ico = area.querySelector('.rag-ico').getBoundingClientRect();
      var ey = ico.top + ico.height / 2 - base.top;
      var esquerda = r.left + r.width / 2 - base.left < cx;
      var ex = esquerda ? r.right - base.left + 16 : ico.left - base.left - 16;
      // Ponto no anel do núcleo, na direção da área
      var ang = Math.atan2(ey - cy, ex - cx);
      var sx = cx + Math.cos(ang) * raio, sy = cy + Math.sin(ang) * raio;
      var mx = sx + (ex - sx) * 0.45;
      var l = document.createElementNS(NS, 'path');
      l.setAttribute('d', 'M' + sx + ',' + sy + ' Q' + mx + ',' + ey + ' ' + (sx + (ex - sx) * 0.7) + ',' + ey + ' L' + ex + ',' + ey);
      l.style.transformOrigin = cx + 'px ' + cy + 'px';
      l.style.setProperty('--i', i);
      var p = document.createElementNS(NS, 'circle');
      p.setAttribute('cx', sx); p.setAttribute('cy', sy); p.setAttribute('r', 4.5);
      p.style.setProperty('--i', i);
      svg.appendChild(l); pontos.appendChild(p);
    });
  }
  desenhar();
  window.addEventListener('resize', desenhar);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(desenhar);
})();

// Seção "Nossa inteligência": animações ao entrar na tela (Motion do design system).
(function () {
  var secao = document.getElementById('inteligencia');
  if (!secao) return;
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduzir || !('IntersectionObserver' in window)) return;
  secao.classList.add('anim-pronto');
  secao.querySelectorAll('.rag-area').forEach(function (el, i) { el.style.setProperty('--i', i); });
  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('visivel');
      if (e.target.classList.contains('rag-centro')) {
        secao.querySelectorAll('.rag-linhas, .rag-pontos').forEach(function (l) { l.classList.add('visivel'); });
        // No computador, os cards entram juntos depois das linhas (a ordem é dada pelos atrasos no CSS).
        if (getComputedStyle(secao.querySelector('.rag-linhas')).display !== 'none') secao.querySelectorAll('.rag-area').forEach(function (a) { a.classList.add('visivel'); obs.unobserve(a); });
      }
      obs.unobserve(e.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
  secao.querySelectorAll('.rag-intro, .rag-centro, .rag-area').forEach(function (el) { obs.observe(el); });
})();


// Seção "Para quem": a combinação de público e contexto escolhidos define o exemplo.
(function () {
  var cards = document.querySelector('.apl-cards');
  if (!cards) return;
  var casos = Array.prototype.slice.call(cards.querySelectorAll('.apl-caso'));
  var botoes = Array.prototype.slice.call(cards.querySelectorAll('.apl-op'));
  var escolha = { publico: cards.getAttribute('data-publico'), contexto: cards.getAttribute('data-contexto') };
  function mostrar() {
    cards.setAttribute('data-publico', escolha.publico);
    cards.setAttribute('data-contexto', escolha.contexto);
    casos.forEach(function (c) { c.hidden = !(c.getAttribute('data-publico') === escolha.publico && c.getAttribute('data-contexto') === escolha.contexto); });
    botoes.forEach(function (b) { b.setAttribute('aria-pressed', escolha[b.getAttribute('data-grupo')] === b.getAttribute('data-valor') ? 'true' : 'false'); });
  }
  botoes.forEach(function (b) {
    b.addEventListener('click', function () { escolha[b.getAttribute('data-grupo')] = b.getAttribute('data-valor'); mostrar(); });
  });

  mostrar();
})();

// Seção "Aplicações": animações ao entrar na tela.
(function () {
  var secao = document.getElementById('aplicacoes');
  if (!secao) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  secao.classList.add('anim-pronto');
  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('visivel');
      obs.unobserve(e.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
  secao.querySelectorAll('.apl-intro, .apl-cards').forEach(function (el) { obs.observe(el); });
})();

// Seção "O que é a plataforma": carrossel dos três cards. O card do centro fica maior e à frente;
// navega pelas setas, pelos pontos, clicando num card dos lados ou deslizando o dedo no celular.
(function () {
  var fluxo = document.querySelector('.plat-fluxo');
  if (!fluxo) return;
  var cards = Array.prototype.slice.call(fluxo.querySelectorAll('.plat-col'));
  var pontos = Array.prototype.slice.call(document.querySelectorAll('.plat-ponto'));
  // A história começa no Desafio (etapa 1).
  var centro = 0;
  var navs = Array.prototype.slice.call(document.querySelectorAll('.plat-nav'));
  // Ordem da história: o que já passou fica à esquerda e o que vem depois à direita.
  function mostrar(i) {
    var n = cards.length;
    centro = ((i % n) + n) % n;
    cards.forEach(function (c, k) {
      // Três cards sempre visíveis: o anterior à esquerda e o próximo à direita (em ciclo).
      var pos = k === centro ? 'centro' : k === (centro + n - 1) % n ? 'esq' : 'dir';
      c.setAttribute('data-pos', pos);
    });
    pontos.forEach(function (p, k) {
      if (k === centro) p.setAttribute('aria-current', 'step'); else p.removeAttribute('aria-current');
      p.classList.toggle('feita', k < centro);
    });
    navs.forEach(function (b) {
      var d = Number(b.getAttribute('data-dir'));
      b.disabled = false;
      if (d > 0) b.setAttribute('aria-label', centro === n - 1 ? 'Voltar ao início' : 'Próxima etapa');
    });
  }
  navs.forEach(function (b) {
    b.addEventListener('click', function () {
      var d = Number(b.getAttribute('data-dir'));
      // Depois da última etapa, avançar volta ao começo da história.
      var n = cards.length;
      mostrar((centro + d + n) % n);
    });
  });
  pontos.forEach(function (p) { p.addEventListener('click', function () { mostrar(Number(p.getAttribute('data-ir'))); }); });
  cards.forEach(function (c, k) { c.addEventListener('click', function () { if (k !== centro) mostrar(k); }); });
  var inicioX = null;
  fluxo.addEventListener('touchstart', function (e) { inicioX = e.touches[0].clientX; }, { passive: true });
  fluxo.addEventListener('touchend', function (e) {
    if (inicioX === null) return;
    var dx = e.changedTouches[0].clientX - inicioX;
    if (Math.abs(dx) > 40) mostrar(centro + (dx < 0 ? 1 : -1));
    inicioX = null;
  });
  mostrar(centro);
})();

// Seção "Como funciona": "Step Indicator" do design system na linha do tempo. A etapa que passa do meio da tela
// vira a atual; as anteriores ficam marcadas como feitas, e a linha entre elas é preenchida.
(function () {
  var lista = document.querySelector('.cf-etapas');
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
