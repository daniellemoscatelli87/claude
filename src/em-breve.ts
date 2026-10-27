import './em-breve.css';

const SUPABASE_URL = 'https://lipfvnerohkaajegqvwr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vOvysMZ0LE2qpKIzLlcM6A_tckkDIej';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function insert(table: string, row: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(await res.text());
}

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

/* ---------- Notificar lançamento ---------- */
const notifyForm = $<HTMLFormElement>('notify-form');
const notifyEmail = $<HTMLInputElement>('notify-email');
const notifyBtn = $<HTMLButtonElement>('notify-btn');
const notifyLabel = $('notify-btn-label');
const notifyMsg = $('notify-msg');
const notifyDefaultMsg = notifyMsg.textContent;

notifyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = notifyEmail.value.trim();
  if (!EMAIL_RE.test(email)) {
    notifyMsg.textContent = 'Informe um e-mail válido.';
    notifyMsg.classList.add('text-brand-red');
    notifyEmail.focus();
    return;
  }
  setNotifyState('sending');
  try {
    await insert('notificacoes_lancamento', { email });
    notifyForm.reset();
    setNotifyState('success');
    (window as any).dmEvento?.('cadastro_lancamento', { origem: 'pagina_inicial' });
    setTimeout(() => setNotifyState('idle'), NOTIFY_SUCCESS_MS);
  } catch (err) {
    console.error(err);
    setNotifyState('idle');
    notifyMsg.textContent = 'Não foi possível enviar. Tente novamente.';
    notifyMsg.classList.add('text-brand-red');
  }
});

const NOTIFY_SUCCESS_MS = 4000;
const NOTIFY_LABELS = { idle: 'Notificar lançamento', sending: 'Enviando…', success: 'Obrigado! Até breve!' };

function setNotifyState(state: keyof typeof NOTIFY_LABELS) {
  notifyBtn.dataset.state = state;
  notifyBtn.disabled = state !== 'idle';
  notifyEmail.disabled = state !== 'idle';
  notifyLabel.textContent = NOTIFY_LABELS[state];
}
notifyEmail.addEventListener('input', () => {
  if (notifyMsg.classList.contains('text-brand-red')) {
    notifyMsg.textContent = notifyDefaultMsg;
    notifyMsg.classList.remove('text-brand-red');
  }
});

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
    lastFocus?.focus();
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
function sugerirEmail(inp: HTMLInputElement, flutuante: boolean) {
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
sugerirEmail(notifyEmail, true);
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
