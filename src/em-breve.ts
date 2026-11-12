import './em-breve.css';
import { insert, sugerirEmail, EMAIL_RE } from './compartilhado/menu';

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

sugerirEmail(notifyEmail, true);
