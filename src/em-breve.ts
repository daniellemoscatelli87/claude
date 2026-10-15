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
    contactForm.classList.add('hidden');
    submitBar.classList.add('hidden');
    $('drawer-header').classList.add('hidden');
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
