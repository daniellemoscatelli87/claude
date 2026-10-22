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

// Celular: menu do painel abre e fecha pelo botão sanduíche do topo da janela.
(function () {
  var janela = document.querySelector('.janela');
  var botao = janela && janela.querySelector('.painel-menu');
  if (!botao) return;
  botao.addEventListener('click', function (e) { e.stopPropagation(); janela.classList.toggle('menu-aberto'); });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.lateral')) janela.classList.remove('menu-aberto');
  });
  window.matchMedia('(max-width: 639px)').addEventListener('change', function () { janela.classList.remove('menu-aberto'); });
})();
