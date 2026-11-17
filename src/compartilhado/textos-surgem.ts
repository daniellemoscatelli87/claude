/* ---------- Textos que surgem (Home e Seja Parceiro) ----------
   Quando o cabeçalho de uma seção chega na tela: o eyebrow aparece, o título surge palavra por palavra (saindo de um
   desfoque e subindo um pouco) e, por último, a descrição. Os cards indicados entram um de cada vez.
   Acontece uma vez por bloco. Sem animação para quem pede "reduzir movimento". */
import './textos-surgem.css';

const PASSO = 0.045; // segundos entre uma palavra e a próxima

function quebrarPalavras(titulo: HTMLElement) {
  let k = 0;
  const textos: Text[] = [];
  const andar = document.createTreeWalker(titulo, NodeFilter.SHOW_TEXT);
  while (andar.nextNode()) textos.push(andar.currentNode as Text);
  textos.forEach((t) => {
    const partes = (t.textContent ?? '').split(/(\s+)/);
    if (partes.every((p) => !p.trim())) return;
    const frag = document.createDocumentFragment();
    partes.forEach((p) => {
      if (!p) return;
      if (!p.trim()) { frag.appendChild(document.createTextNode(p)); return; }
      const s = document.createElement('span');
      s.className = 'tx-palavra';
      s.style.setProperty('--tx-k', String(k++));
      s.textContent = p;
      frag.appendChild(s);
    });
    t.replaceWith(frag);
  });
  return k;
}

export function textosSurgem(opcoes: { titulos: string; cards?: string[]; blocos?: string[] }) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const blocos: HTMLElement[] = [];
  document.querySelectorAll<HTMLElement>(opcoes.titulos).forEach((titulo) => {
    const n = quebrarPalavras(titulo);
    titulo.classList.add('tx-titulo');
    // eyebrow: o elemento logo antes do título; descrição: o parágrafo logo depois
    const antes = titulo.previousElementSibling as HTMLElement | null;
    if (antes && !/^H\d$/.test(antes.tagName)) antes.classList.add('tx-selo');
    // descrição: os parágrafos logo depois do título, um depois do outro
    let depois = titulo.nextElementSibling as HTMLElement | null; let j = 0;
    // (ou um bloco só de texto logo depois do título, como na Home)
    if (depois && depois.tagName === 'DIV' && !depois.querySelector('h1, h2, h3, form, img, button, a')) {
      depois.classList.add('tx-desc');
      depois.style.setProperty('--tx-atraso', `${(0.2 + n * PASSO).toFixed(2)}s`);
      depois = depois.nextElementSibling as HTMLElement | null; j++;
    }
    while (depois && depois.tagName === 'P') {
      depois.classList.add('tx-desc');
      depois.style.setProperty('--tx-atraso', `${(0.2 + n * PASSO + j * 0.15).toFixed(2)}s`);
      depois = depois.nextElementSibling as HTMLElement | null; j++;
    }
    blocos.push(titulo);
  });
  (opcoes.cards ?? []).forEach((sel) => {
    const grupos = new Map<Element, HTMLElement[]>();
    document.querySelectorAll<HTMLElement>(sel).forEach((c) => {
      const pai = c.parentElement!;
      if (!grupos.has(pai)) grupos.set(pai, []);
      grupos.get(pai)!.push(c);
    });
    grupos.forEach((cards) => cards.forEach((c, i) => {
      c.classList.add('tx-card'); c.style.setProperty('--tx-i', String(i)); blocos.push(c);
      // terminada a entrada, a animação sai de cena para não travar o movimento do hover
      c.addEventListener('animationend', (ev) => { if (ev.target === c && ev.animationName === 'tx-card-entra') c.classList.add('tx-fim'); });
    }));
  });
  // demais blocos (botões, formulários, componentes): surgem do mesmo jeito, um depois do outro dentro do mesmo grupo
  const jaAnimado = (el: Element) => el.matches('.tx-selo, .tx-titulo, .tx-desc, .tx-card, .tx-bloco') || !!el.querySelector('.tx-titulo, .tx-card');
  const porPai = new Map<Element, number>();
  (opcoes.blocos ?? []).forEach((sel) => document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
    if (jaAnimado(el) || !el.parentElement) return;
    const i = porPai.get(el.parentElement) ?? 0;
    porPai.set(el.parentElement, i + 1);
    el.classList.add('tx-bloco'); el.style.setProperty('--tx-i', String(i)); blocos.push(el);
    el.addEventListener('animationend', (ev) => { if (ev.target === el && ev.animationName === 'tx-card-entra') el.classList.add('tx-fim'); });
  }));
  document.documentElement.classList.add('tx-pronto');
  const obs = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target as HTMLElement;
    el.classList.add('tx-visto');
    if (el.classList.contains('tx-titulo')) {
      el.previousElementSibling?.classList.add('tx-visto');
      let d = el.nextElementSibling;
      while (d && d.classList.contains('tx-desc')) { d.classList.add('tx-visto'); d = d.nextElementSibling; }
    }
    obs.unobserve(el);
  }), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  blocos.forEach((b) => obs.observe(b));
}
