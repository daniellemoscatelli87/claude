// Carrossel de setores (mesmo componente da página Seja Parceiro; versão em JavaScript do src/rede-parceiros-inicio.ts)
/* ---------- "Onde buscamos": carrossel de setores (setas, pontos, arrastar e teclado) ---------- */
{
  const trilha = document.querySelector('.rx-setores-trilha');
  const pontos = document.querySelector('.rx-setores-pontos');
  const pos = document.querySelector('.rx-setores-pos');
  if (trilha && pontos && pos) {
    const slides = Array.from(trilha.querySelectorAll('.rx-setor-slide'));
    const nome = (s) => s.querySelector('h3')?.textContent || '';
    // posição de rolagem que deixa o card no centro da trilha
    const alvo = (sl) => sl.offsetLeft - trilha.offsetLeft - (trilha.clientWidth - sl.offsetWidth) / 2;
    const atual = () => {
      let melhor = 0;
      slides.forEach((sl, i) => { if (Math.abs(alvo(sl) - trilha.scrollLeft) < Math.abs(alvo(slides[melhor]) - trilha.scrollLeft)) melhor = i; });
      return melhor;
    };
    const ir = (i) => {
      const n = (i + slides.length) % slides.length;
      trilha.scrollTo({ left: alvo(slides[n]) });
    };
    slides.forEach((s, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', `Ir para ${nome(s)}`); b.tabIndex = -1;
      b.addEventListener('click', () => ir(i));
      pontos.appendChild(b);
    });
    const marcar = () => {
      const a = atual();
      Array.from(pontos.children).forEach((b, i) => b.setAttribute('aria-current', String(i === a)));
      pos.textContent = `${a + 1} de ${slides.length} · ${nome(slides[a])}`;
    };
    document.querySelectorAll('.rx-setores-seta').forEach((b) => b.addEventListener('click', () => ir(atual() + Number(b.dataset.dir))));
    trilha.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); ir(atual() + (e.key === 'ArrowRight' ? 1 : -1)); } });
    let pedido = 0;
    trilha.addEventListener('scroll', () => { cancelAnimationFrame(pedido); pedido = requestAnimationFrame(marcar); }, { passive: true });
    addEventListener('resize', marcar);
    marcar();
  }
}
