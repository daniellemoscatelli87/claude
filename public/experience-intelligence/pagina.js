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
    btn.disabled = false; btn.textContent = 'Avise-me';
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
      btn.disabled = false; btn.textContent = 'Avise-me';
      erro('Não foi possível enviar. Tente novamente.');
    });
  });
})();
