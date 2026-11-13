// Componentes compartilhados das páginas do site (início, Projeto Piloto e Rede de Parceiros):
// cabeçalho (logo que vira ícone ao rolar, menu sanduíche), gaveta de contato e o aviso "Tem um desafio ou uma ideia?".
// O HTML vem de src/compartilhado/partes.ts, inserido na hora do build (vite.config.ts);
// o CSS (src/compartilhado/menu.css) é importado pelo CSS de cada página.

const SUPABASE_URL = 'https://lipfvnerohkaajegqvwr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vOvysMZ0LE2qpKIzLlcM6A_tckkDIej';
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function insert(table: string, row: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(await res.text());
}

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

/* ---------- Cabeçalho: ganha fundo ao rolar; a altura fica em --altura-cabecalho ---------- */
(() => {
  const h = document.getElementById('site-header');
  if (!h) return;
  // Esconde ao rolar para baixo e volta ao rolar para cima (fica sempre visível no topo
  // e enquanto o menu do celular estiver aberto).
  let ultimoY = window.scrollY;
  // Ao usar um link de âncora (ex.: "Saiba mais"), o cabeçalho fica visível para a seção parar logo abaixo dele.
  let ancoraAte = 0;
  document.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest('a[href^="#"]');
    if (link) { ancoraAte = Date.now() + 1500; h.classList.remove('is-hidden'); }
  });
  let agendado = false;
  const f = () => {
    agendado = false;
    const y = window.scrollY;
    h.classList.toggle('is-scrolled', y > 8);
    const menuAberto = document.getElementById('menu-botao')?.getAttribute('aria-expanded') === 'true';
    const delta = y - ultimoY;
    if (y < h.offsetHeight || menuAberto || Date.now() < ancoraAte) h.classList.remove('is-hidden');
    else if (delta > 6) h.classList.add('is-hidden');
    else if (delta < -6) h.classList.remove('is-hidden');
    if (Math.abs(delta) > 6) ultimoY = y;
  };
  f();
  window.addEventListener('scroll', () => { if (!agendado) { agendado = true; requestAnimationFrame(f); } }, { passive: true });
  // Navegar pelo teclado até o cabeçalho sempre o mostra.
  h.addEventListener('focusin', () => h.classList.remove('is-hidden'));
  const medir = () => document.documentElement.style.setProperty('--altura-cabecalho', `${h.offsetHeight}px`);
  medir();
  window.addEventListener('resize', medir);
  if ('ResizeObserver' in window) new ResizeObserver(medir).observe(h);
})();

/* ---------- Aviso "Tem um desafio ou uma ideia?" (só na página inicial) ---------- */
(() => {
  const c = document.getElementById('cta-contato');
  if (!c) return;
  let fechado = false;
  try { fechado = sessionStorage.getItem('cta-contato-fechado') === '1'; } catch { /* sem armazenamento */ }
  const esconder = () => { c.classList.add('is-oculto'); try { sessionStorage.setItem('cta-contato-fechado', '1'); } catch { /* sem armazenamento */ } };
  if (fechado) c.classList.add('is-oculto');
  document.getElementById('cta-contato-fechar')?.addEventListener('click', esconder);
  document.querySelectorAll('[data-open-contact]').forEach((b) => b.addEventListener('click', esconder));
})();

/* ---------- Gaveta de contato ---------- */
const backdrop = $('drawer-backdrop');
const drawer = $('contact-drawer');
const contactForm = $<HTMLFormElement>('contact-form');
const success = $('contact-success');
const submitBar = $('drawer-submit-bar');
const submitBtn = $<HTMLButtonElement>('btn-submit-contact');
const submitLabel = $('btn-submit-label');
const contactError = $('contact-error');
let lastFocus: HTMLElement | null = null;

function openDrawer() {
  (window as any).dmEvento?.('contato_aberto');
  lastFocus = document.activeElement as HTMLElement | null;
  drawer.classList.remove('invisible');
  requestAnimationFrame(() => {
    backdrop.classList.remove('pointer-events-none', 'opacity-0');
    drawer.classList.remove('translate-x-full');
  });
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    if (success.classList.contains('hidden')) contactForm.querySelector<HTMLInputElement>('input')?.focus();
  }, 300);
}

function closeDrawer() {
  drawer.classList.add('translate-x-full');
  backdrop.classList.add('opacity-0');
  setTimeout(() => {
    backdrop.classList.add('pointer-events-none');
    drawer.classList.add('invisible');
    document.body.style.overflow = '';
    // Se o botão de origem sumiu (Contato dentro do menu sanduíche), o foco volta para o botão do menu.
    (lastFocus && lastFocus.offsetParent ? lastFocus : document.getElementById('menu-botao'))?.focus();
  }, 300);
}

document.querySelectorAll('[data-open-contact]').forEach((b) => b.addEventListener('click', openDrawer));
$('btn-close-drawer').addEventListener('click', closeDrawer);
$('btn-success-close').addEventListener('click', closeDrawer);
backdrop.addEventListener('click', closeDrawer);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !drawer.classList.contains('translate-x-full')) closeDrawer();
});

/* Acordeão "Meu negócio é..." */
const accBody = $('accordion-business-body');
const accIcon = $('accordion-business-icon');
const accToggle = $<HTMLButtonElement>('btn-toggle-business');
function setAccordion(open: boolean) {
  accBody.classList.toggle('hidden', !open);
  accIcon.style.transform = open ? 'rotate(180deg)' : 'rotate(0deg)';
  accToggle.setAttribute('aria-expanded', String(open));
}
accToggle.addEventListener('click', () => setAccordion(accBody.classList.contains('hidden')));
const outroInput = $<HTMLInputElement>('input-outro-descricao');
outroInput.addEventListener('focus', () => {
  $<HTMLInputElement>('radio-business-outro').checked = true;
});

/* Máscara de telefone: (41) 99999-9999 ou (41) 3333-4444 */
const phoneInput = contactForm.querySelector<HTMLInputElement>('input[name="telefone"]')!;
function maskPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  const ddd = `(${d.slice(0, 2)}) `;
  const rest = d.slice(2);
  if (rest.length <= 4) return ddd + rest;
  const split = d.length === 11 ? 5 : 4;
  return ddd + rest.slice(0, split) + '-' + rest.slice(split);
}
phoneInput.addEventListener('input', () => {
  phoneInput.value = maskPhone(phoneInput.value);
});
const phoneDigits = () => phoneInput.value.replace(/\D/g, '').length;

/* Validação e envio */
const scroller = drawer.querySelector<HTMLElement>('.overflow-y-auto')!;

// Leva o primeiro campo com erro para a área visível da gaveta, se ele estiver fora dela.
function revealFirstInvalid() {
  const first = contactForm.querySelector<HTMLElement>('.invalid, .box-invalid');
  if (!first) return;
  const box = scroller.getBoundingClientRect();
  const r = first.getBoundingClientRect();
  if (r.top < box.top || r.bottom > box.bottom) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const focusable = first.matches('input, select, textarea') ? first : first.querySelector<HTMLElement>('input, button');
  focusable?.focus({ preventScroll: true });
}

function validate(): boolean {
  let ok = true;
  contactForm.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('.field').forEach((f) => {
    const v = f.value.trim();
    const bad = (f.required && !v) || (f.type === 'email' && !!v && !EMAIL_RE.test(v)) || (f === phoneInput && !!v && phoneDigits() < 10);
    f.classList.toggle('invalid', bad);
    if (bad) ok = false;
  });
  const hasBusiness = !!contactForm.querySelector('input[name="tipo_negocio"]:checked');
  $('accordion-business').classList.toggle('box-invalid', !hasBusiness);
  if (!hasBusiness) { ok = false; setAccordion(true); }
  const hasDay = !!contactForm.querySelector('input[name="dias"]:checked');
  $('days-box').classList.toggle('box-invalid', !hasDay);
  if (!hasDay) ok = false;
  return ok;
}

contactForm.addEventListener('input', () => {
  if (!contactError.classList.contains('hidden')) validate();
});
contactForm.addEventListener('change', () => {
  if (!contactError.classList.contains('hidden')) validate();
});

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validate()) {
    contactError.textContent = 'Preencha os campos obrigatórios (*) e confira o e-mail e o telefone.';
    contactError.classList.remove('hidden');
    revealFirstInvalid();
    return;
  }
  contactError.classList.add('hidden');
  const fd = new FormData(contactForm);
  const text = (k: string) => String(fd.get(k) ?? '').trim();
  const tipo = text('tipo_negocio');
  const row = {
    nome: text('nome'),
    email: text('email'),
    telefone: text('telefone'),
    empresa: text('empresa'),
    cargo: text('cargo'),
    tipo_negocio: tipo,
    tipo_negocio_outro: tipo === 'Outro' ? text('tipo_negocio_outro') || null : null,
    assunto: text('assunto'),
    mensagem: text('mensagem'),
    dias_preferidos: fd.getAll('dias').map(String),
    periodo: text('periodo'),
  };
  submitBtn.disabled = true;
  submitLabel.textContent = 'Enviando…';
  try {
    await insert('contatos', row);
    contactForm.reset();
    try { localStorage.removeItem('dm-contato-rascunho'); } catch { /* sem armazenamento */ }
    contactForm.classList.add('hidden');
    submitBar.classList.add('hidden');
    $('drawer-header').classList.add('hidden');
    (window as any).dmEvento?.('contato_enviado');
    success.classList.remove('hidden');
    success.classList.add('flex');
  } catch (err) {
    console.error(err);
    contactError.textContent = 'Não foi possível enviar sua mensagem. Verifique sua conexão e tente novamente.';
    contactError.classList.remove('hidden');
  } finally {
    submitBtn.disabled = false;
    submitLabel.textContent = 'Solicitar reunião';
  }
});

/* ---------- Sugestão de domínio nos campos de e-mail ---------- */
const DOMINIOS = ['gmail.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'yahoo.com.br', 'live.com', 'uol.com.br', 'terra.com.br'];
export function sugerirEmail(inp: HTMLInputElement, flutuante: boolean) {
  const box = document.createElement('div');
  box.className = flutuante
    ? 'hidden absolute left-0 right-0 top-full mt-2 z-20 flex flex-wrap gap-1.5 p-2 bg-white rounded-xl shadow-lg border border-slate-100'
    : 'hidden flex flex-wrap gap-1.5 mt-2';
  box.setAttribute('aria-label', 'Sugestões de e-mail');
  inp.after(box);
  const atualizar = () => {
    const v = inp.value.trim(), at = v.indexOf('@');
    const usuario = at < 0 ? v : v.slice(0, at), dom = at < 0 ? '' : v.slice(at + 1).toLowerCase();
    const opcoes = usuario && !/\s/.test(usuario) ? DOMINIOS.filter((d) => d.startsWith(dom) && d !== dom).slice(0, 4) : [];
    box.replaceChildren(...opcoes.map((d) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 hover:border-brand-red hover:text-brand-red cursor-pointer';
      b.textContent = usuario + '@' + d;
      b.addEventListener('mousedown', (e) => e.preventDefault());
      b.addEventListener('click', () => {
        inp.value = usuario + '@' + d;
        box.classList.add('hidden');
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      });
      return b;
    }));
    box.classList.toggle('hidden', !opcoes.length || document.activeElement !== inp);
  };
  inp.addEventListener('input', atualizar);
  inp.addEventListener('focus', atualizar);
  inp.addEventListener('blur', () => setTimeout(() => box.classList.add('hidden'), 150));
}

sugerirEmail(contactForm.querySelector<HTMLInputElement>('input[name="email"]')!, false);

/* ---------- Rascunho do formulário de contato (fica só neste navegador) ---------- */
const RASCUNHO = 'dm-contato-rascunho';
function salvarRascunho() {
  const r: Record<string, string | string[]> = {};
  contactForm.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input[name], select[name], textarea[name]').forEach((el) => {
    if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
      const atual = (r[el.name] as string[]) || [];
      r[el.name] = el.checked ? [...atual, el.value] : atual;
    } else r[el.name] = el.value;
  });
  try { localStorage.setItem(RASCUNHO, JSON.stringify(r)); } catch { /* sem armazenamento */ }
}
function restaurarRascunho() {
  let r: Record<string, string | string[]> | null = null;
  try { r = JSON.parse(localStorage.getItem(RASCUNHO) || 'null'); } catch { r = null; }
  if (!r) return;
  contactForm.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input[name], select[name], textarea[name]').forEach((el) => {
    const v = r![el.name];
    if (v == null) return;
    if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) el.checked = Array.isArray(v) && v.includes(el.value);
    else el.value = String(v);
  });
  if (contactForm.querySelector<HTMLInputElement>('input[name="tipo_negocio"]:checked')) setAccordion(true);
}
restaurarRascunho();
contactForm.addEventListener('input', salvarRascunho);
contactForm.addEventListener('change', salvarRascunho);

/* ---------- Menu sanduíche (celular) ---------- */
(() => {
  const botao = document.getElementById('menu-botao') as HTMLButtonElement | null;
  const painel = document.getElementById('menu-mobile');
  if (!botao || !painel) return;
  // Painel em "bottom sheet": sobe de baixo para cima ao abrir e desce ao fechar.
  // Vai para o <body> para ficar fixo na tela (o cabeçalho tem blur, que prenderia o position: fixed).
  const fundo = document.getElementById('menu-fundo');
  document.body.appendChild(painel);
  if (fundo) document.body.appendChild(fundo);
  const definir = (aberto: boolean) => {
    painel.classList.toggle('aberto', aberto);
    fundo?.classList.toggle('aberto', aberto);
    document.documentElement.classList.toggle('menu-aberto', aberto);
    botao.setAttribute('aria-expanded', String(aberto));
    botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  };
  document.getElementById('menu-fechar')?.addEventListener('click', () => { definir(false); botao.focus(); });
  fundo?.addEventListener('click', () => definir(false));
  const aberto = () => botao.getAttribute('aria-expanded') === 'true';
  botao.addEventListener('click', () => {
    const abrir = !aberto();
    definir(abrir);
    if (abrir) setTimeout(() => painel.querySelector<HTMLElement>('a')?.focus({ preventScroll: true }), 50);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && aberto()) { definir(false); botao.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (aberto() && !painel.contains(e.target as Node) && !botao.contains(e.target as Node)) definir(false);
  });
  window.matchMedia('(min-width: 768px)').addEventListener('change', (m) => { if (m.matches) definir(false); });
  // Contato dentro do menu: fecha o menu antes de abrir a gaveta.
  painel.querySelectorAll('[data-open-contact]').forEach((b) => b.addEventListener('click', () => definir(false)));
})();
