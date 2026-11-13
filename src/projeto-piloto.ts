import './projeto-piloto.css';
import './compartilhado/menu';

/* Mesmo projeto Supabase e mesma chave publicável já usados no formulário de contato da página inicial.
   A tabela parceiro_piloto só aceita inserção pelo site (RLS); a leitura é restrita ao admin. */
const SUPABASE_URL = 'https://lipfvnerohkaajegqvwr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vOvysMZ0LE2qpKIzLlcM6A_tckkDIej';
const TABELA = 'parceiro_piloto';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEMPO_LIMITE_MS = 15000;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

/* ---------- Accordion do Guia (um aberto por vez) ---------- */
const itens = Array.from(document.querySelectorAll<HTMLElement>('.accordion-item'));
function definirAberto(item: HTMLElement, aberto: boolean) {
  const botao = item.querySelector<HTMLButtonElement>('.accordion-trigger')!;
  const painel = item.querySelector<HTMLElement>('.accordion-content')!;
  item.classList.toggle('active', aberto);
  botao.setAttribute('aria-expanded', String(aberto));
  painel.toggleAttribute('inert', !aberto);
}
itens.forEach((item) => {
  item.querySelector('.accordion-trigger')!.addEventListener('click', () => {
    const abrir = !item.classList.contains('active');
    itens.forEach((outro) => definirAberto(outro, outro === item ? abrir : false));
  });
});
if (itens[0]) definirAberto(itens[0], true);

/* ---------- Formulário ---------- */
const form = $<HTMLFormElement>('form-piloto');
const botao = $<HTMLButtonElement>('form-enviar');
const botaoTexto = $('form-enviar-texto');
const erroGeral = $('form-erro-geral');
const sucesso = $('form-sucesso');
const iconeEnviando = botao.querySelector<SVGElement>('[data-estado="enviando"]')!;
const iconeParado = botao.querySelector<SVGElement>('[data-estado="parado"]')!;

/* Identificador do envio: o mesmo valor é reaproveitado se a pessoa reenviar após uma falha de rede,
   e a coluna é única no banco, então o cadastro nunca é gravado duas vezes. */
let envioId = crypto.randomUUID();
let enviando = false;

type Campo = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
const campo = (id: string) => $<Campo>(id);

function mostrarErro(id: string, msg: string) {
  const el = campo(id);
  const p = $(`${id}-erro`);
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  p.textContent = msg;
  p.classList.toggle('hidden', !msg);
}

function validar(): string[] {
  const erros: string[] = [];
  const checar = (id: string, msg: string, ok: boolean) => {
    mostrarErro(id, ok ? '' : msg);
    if (!ok) erros.push(id);
  };
  const v = (id: string) => campo(id).value.trim();
  checar('nome', 'Informe o nome do responsável.', v('nome').length >= 2);
  checar('email', 'Informe um e-mail válido.', EMAIL_RE.test(v('email')));
  const digitos = v('telefone').replace(/\D/g, '');
  checar('telefone', 'Informe um telefone com DDD.', digitos.length >= 10 && digitos.length <= 13);
  checar('empresa', 'Informe o nome da empresa.', v('empresa').length >= 1);
  checar('segmento', 'Selecione o segmento de atuação.', v('segmento') !== '');
  checar('cidade', 'Informe a cidade e o estado.', v('cidade').length >= 2);
  checar('desafio', 'Use no máximo 2.000 caracteres.', v('desafio').length <= 2000);
  checar('consentimento', 'Para continuar, aceite a Política de Privacidade.', $<HTMLInputElement>('consentimento').checked);
  return erros;
}

function estadoEnviando(sim: boolean) {
  enviando = sim;
  botao.disabled = sim;
  botao.setAttribute('aria-busy', String(sim));
  botaoTexto.textContent = sim ? 'Enviando cadastro…' : 'Cadastrar minha empresa';
  iconeEnviando.classList.toggle('hidden', !sim);
  iconeParado.classList.toggle('hidden', sim);
}

function mostrarErroGeral(msg: string) {
  erroGeral.textContent = msg;
  erroGeral.classList.toggle('hidden', !msg);
}

async function enviar(linha: Record<string, unknown>) {
  const controle = new AbortController();
  const timer = window.setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABELA}`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(linha),
      signal: controle.signal,
    });
    // 409: este mesmo envio já tinha sido gravado (reenvio após falha de rede).
    if (res.ok || res.status === 409) return;
    throw new Error(`HTTP ${res.status}`);
  } finally {
    window.clearTimeout(timer);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (enviando) return;
  mostrarErroGeral('');

  const erros = validar();
  if (erros.length) {
    mostrarErroGeral(erros.length === 1 ? 'Corrija o campo destacado para continuar.' : `Corrija os ${erros.length} campos destacados para continuar.`);
    campo(erros[0]).focus();
    return;
  }

  const v = (id: string) => campo(id).value.trim();
  const linha = {
    envio_id: envioId,
    nome: v('nome'),
    email: v('email'),
    telefone: v('telefone'),
    empresa: v('empresa'),
    segmento: v('segmento'),
    cidade_estado: v('cidade'),
    desafio: v('desafio') || null,
    frente: v('frente') || null,
    consentimento: true,
  };

  estadoEnviando(true);
  try {
    await enviar(linha);
    (window as any).dmEvento?.('cadastro_projeto_piloto');
    form.reset();
    envioId = crypto.randomUUID();
    form.classList.add('hidden');
    sucesso.classList.remove('hidden');
    sucesso.focus();
  } catch {
    mostrarErroGeral('Não foi possível enviar o cadastro agora. Verifique sua conexão e tente novamente. Seus dados continuam preenchidos.');
    botao.focus();
  } finally {
    estadoEnviando(false);
  }
});

/* Limpa o erro do campo assim que a pessoa corrige */
form.addEventListener('input', (e) => {
  const alvo = e.target as Campo;
  if (alvo.id && alvo.getAttribute('aria-invalid') === 'true') mostrarErro(alvo.id, '');
});
form.addEventListener('change', (e) => {
  const alvo = e.target as Campo;
  if (alvo.id && alvo.getAttribute('aria-invalid') === 'true') mostrarErro(alvo.id, '');
});

/* ---------- Animações ao rolar (Motion do design system) ----------
   Cada bloco entra quando chega na tela. Ao rolar para cima, o que volta a ficar abaixo da tela
   é recolhido e anima de novo na próxima descida (mesmo comportamento da página do Experience Intelligence 3). */
(() => {
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduzir || !('IntersectionObserver' in window)) return;
  document.body.classList.add('anima-pronto');
  const alvos = document.querySelectorAll<HTMLElement>('.rv, .rv-cabecalho, .rv-grupo, .cf-etapa');
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      const el = e.target as HTMLElement;
      if (e.isIntersecting) el.classList.add('visivel');
      else if (e.boundingClientRect.top > window.innerHeight) el.classList.remove('visivel');
    });
  }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
  alvos.forEach((el) => obs.observe(el));
  // Pulos grandes de rolagem (ex.: "Voltar ao início") não disparam o observador para o que estava acima da tela.
  let agendado = false;
  const recolher = () => {
    agendado = false;
    alvos.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (el.classList.contains('visivel') && r.top > window.innerHeight) el.classList.remove('visivel');
      // Rolagem rápida pode pular um bloco sem disparar o observador: o que já ficou acima da tela aparece.
      else if (!el.classList.contains('visivel') && r.bottom < 0) el.classList.add('visivel');
    });
  };
  window.addEventListener('scroll', () => { if (!agendado) { agendado = true; requestAnimationFrame(recolher); } }, { passive: true });
})();

/* ---------- Linha do tempo: etapa atual, etapas feitas e linha preenchida conforme a rolagem ---------- */
(() => {
  const lista = document.querySelector<HTMLElement>('.cf-etapas');
  const linha = document.querySelector<HTMLElement>('.cf-linha');
  if (!lista || !linha) return;
  const etapas = Array.from(lista.querySelectorAll<HTMLElement>('.cf-etapa'));
  const trilho = linha.parentElement!;
  let agendado = false;
  // O trilho começa no centro do primeiro ícone e termina no centro do último.
  const ajustarTrilho = () => {
    const pai = trilho.offsetParent as HTMLElement | null;
    const nums = etapas.map((e) => e.querySelector<HTMLElement>('.cf-num')!);
    if (!pai || !nums.length) return;
    const base = pai.getBoundingClientRect().top;
    const centro = (n: HTMLElement) => { const r = n.getBoundingClientRect(); return r.top + r.height / 2 - base; };
    const ini = centro(nums[0]), fim = centro(nums[nums.length - 1]);
    trilho.style.top = `${ini}px`;
    trilho.style.bottom = 'auto';
    trilho.style.height = `${Math.max(0, fim - ini)}px`;
  };
  const atualizar = () => {
    agendado = false;
    ajustarTrilho();
    const limite = window.innerHeight * 0.6;
    let atual = -1;
    etapas.forEach((e, i) => {
      const r = e.querySelector('.cf-num')!.getBoundingClientRect();
      if (r.top + r.height / 2 < limite) atual = i;
    });
    etapas.forEach((e, i) => {
      e.classList.toggle('feita', i < atual);
      e.classList.toggle('atual', i === atual);
    });
    const t = trilho.getBoundingClientRect();
    const progresso = Math.min(1, Math.max(0, (limite - t.top) / t.height));
    linha.style.setProperty('--progresso', progresso.toFixed(3));
  };
  const pedir = () => { if (!agendado) { agendado = true; requestAnimationFrame(atualizar); } };
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  atualizar();
})();



/* ---------- Escopo: luz que segue o cursor e ordem da cascata ---------- */
(() => {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.card-frente'));
  cards.forEach((card, i) => {
    card.style.setProperty('--i', String(i));
    card.querySelectorAll<HTMLElement>('.tag-frente').forEach((t, j) => t.style.setProperty('--t', String(j)));
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
})();

/* ---------- Botão flutuante "Cadastrar minha empresa" ---------- */
(() => {
  const btn = document.getElementById('cta-flutuante');
  const hero = document.getElementById('hero');
  const form = document.getElementById('inscricao');
  if (!btn || !hero || !form || !('IntersectionObserver' in window)) return;
  let heroVisivel = true, formVisivel = false;
  const atualizar = () => {
    const mostrar = !heroVisivel && !formVisivel;
    btn.classList.toggle('visivel', mostrar);
    btn.setAttribute('aria-hidden', String(!mostrar));
    btn.tabIndex = mostrar ? 0 : -1;
  };
  new IntersectionObserver(([e]) => { heroVisivel = e.isIntersecting; atualizar(); }, { threshold: 0.15 }).observe(hero);
  new IntersectionObserver(([e]) => { formVisivel = e.isIntersecting; atualizar(); }, { threshold: 0.1 }).observe(form);
})();

// Botão "subir": aparece quando o rodapé entra na tela e leva de volta ao topo.
(() => {
  const btn = document.getElementById('botao-subir');
  const rodape = document.querySelector('footer');
  if (!btn || !rodape || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([e]) => {
    const mostrar = e.isIntersecting;
    btn.classList.toggle('visivel', mostrar);
    btn.setAttribute('aria-hidden', String(!mostrar));
    btn.tabIndex = mostrar ? 0 : -1;
  }, { threshold: 0.1 }).observe(rodape);
  btn.addEventListener('click', () => {
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: suave ? 'smooth' : 'auto' });
  });
})();

// Celular: os blocos "Para sua empresa" e "Para o Studio" viram accordion; o primeiro começa aberto.
(() => {
  const lados = Array.from(document.querySelectorAll<HTMLElement>('#sobre-o-programa .lado-troca'));
  if (!lados.length) return;
  const mq = window.matchMedia('(max-width: 767px)');
  const cabecas = lados.map((lado, i) => {
    const cab = lado.firstElementChild as HTMLElement;
    lado.id ||= `lado-sobre-${i + 1}`;
    const seta = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    seta.setAttribute('viewBox', '0 0 24 24'); seta.setAttribute('fill', 'none'); seta.setAttribute('stroke', 'currentColor');
    seta.setAttribute('stroke-width', '2'); seta.setAttribute('stroke-linecap', 'round'); seta.setAttribute('stroke-linejoin', 'round');
    seta.setAttribute('aria-hidden', 'true'); seta.classList.add('lado-seta');
    seta.innerHTML = '<path d="m6 9 6 6 6-6"/>';
    cab.appendChild(seta);
    const alternar = () => {
      if (!mq.matches) return;
      const fechado = lado.classList.toggle('fechado');
      cab.setAttribute('aria-expanded', String(!fechado));
    };
    cab.addEventListener('click', alternar);
    cab.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alternar(); } });
    return cab;
  });
  const aplicar = () => {
    lados.forEach((lado, i) => {
      const cab = cabecas[i];
      if (mq.matches) {
        lado.classList.add('lado-acordeao');
        lado.classList.toggle('fechado', i !== 0);
        cab.setAttribute('role', 'button'); cab.tabIndex = 0;
        cab.setAttribute('aria-controls', lado.id);
        cab.setAttribute('aria-expanded', String(i === 0));
      } else {
        lado.classList.remove('lado-acordeao', 'fechado');
        cab.removeAttribute('role'); cab.removeAttribute('tabindex');
        cab.removeAttribute('aria-controls'); cab.removeAttribute('aria-expanded');
      }
    });
  };
  aplicar();
  mq.addEventListener('change', aplicar);
})();
