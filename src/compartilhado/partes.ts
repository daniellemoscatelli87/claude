// HTML compartilhado do cabeçalho e da gaveta de contato. É inserido no build (plugin em vite.config.ts)
// nos comentários <!-- @cabecalho:inicio|projeto|parceiros --> e <!-- @gaveta --> de cada página.
// Classes Tailwind daqui são lidas pelo CSS das páginas via src/compartilhado/menu.css (@source).

type Pagina = 'inicio' | 'projeto' | 'parceiros';

const ITENS: { id: Pagina; href: string; texto: string; evento: string }[] = [
  { id: 'inicio', href: '/', texto: 'Home', evento: 'clique_home' },
  { id: 'projeto', href: '/projeto-piloto/', texto: 'Projeto Piloto', evento: 'clique_projeto_piloto' },
  { id: 'parceiros', href: '/rede-parceiros/', texto: 'Seja Parceiro', evento: 'clique_quero_ser_parceiro' },
];

const evento = (nome: string) => `onclick="window.dmEvento &amp;&amp; window.dmEvento('${nome}')"`;
const atual = (id: Pagina, pagina: Pagina) => (id === pagina ? ' aria-current="page"' : '');

const AVISO = `
    <!-- Chamada para ação apontando para o botão Contato -->
    <div id="cta-contato" class="cta-contato absolute -right-[52px] md:right-0 top-full mt-4 z-20 w-max max-w-[calc(100vw-2rem)]">
      <span aria-hidden="true" class="absolute -top-[7px] right-[89px] sm:right-[97px] md:right-[45px] w-3.5 h-3.5 rotate-45 rounded-[3px] bg-white border-l border-t border-ds-border"></span>
      <div class="relative rounded-2xl bg-white text-ds-fg border border-ds-border shadow-ds-xl">
        <button type="button" data-open-contact class="flex w-full items-center gap-3 text-left py-3.5 pl-4 pr-11 rounded-2xl cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ds-ring">
          <span aria-hidden="true" class="shrink-0 w-10 h-10 rounded-full bg-ds-primary-muted text-ds-primary flex items-center justify-center">
            <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
          </span>
          <span id="cta-contato-texto" class="block">
            <span class="block text-sm sm:text-[15px] font-bold leading-snug text-ds-fg">Tem um desafio ou uma ideia?</span>
            <span class="mt-0.5 block text-[13px] sm:text-sm leading-relaxed text-ds-muted-fg">Vamos conversar sobre seu projeto.</span>
          </span>
        </button>
        <button type="button" id="cta-contato-fechar" aria-label="Fechar aviso" class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full text-ds-muted-fg hover:text-ds-fg hover:bg-ds-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-ring cursor-pointer">
          <svg aria-hidden="true" viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>`;

export function cabecalhoHtml(pagina: Pagina): string {
  const links = ITENS.map((i) => `<a href="${i.href}"${atual(i.id, pagina)} ${evento(i.evento)} class="text-sm font-semibold text-ds-fg no-underline underline-offset-[6px] decoration-2 whitespace-nowrap transition-colors hover:text-brand-red aria-[current=page]:text-brand-red aria-[current=page]:underline">${i.texto}</a>`).join('\n    ');
  const linksMobile = ITENS.map((i) => `<a href="${i.href}"${atual(i.id, pagina)} ${evento(i.evento)} class="flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] font-semibold text-ds-fg hover:bg-ds-muted aria-[current=page]:bg-ds-primary-muted aria-[current=page]:text-ds-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ds-ring">${i.texto}<svg aria-hidden="true" viewBox="0 0 24 24" class="w-4 h-4 text-ds-primary" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></a>`).join('\n  ');
  return `<!-- Cabeçalho (componente compartilhado: src/compartilhado/partes.ts) -->
<div id="site-header" class="site-header sticky top-0 z-30 w-full font-sans text-ds-fg">
<header class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 md:py-4 flex items-center justify-between gap-3 sm:gap-4">
  <a href="/" class="flex items-center shrink-0 h-10 sm:h-12" aria-label="Dani Moscatelli Experience Design Studio: página inicial">
    <img alt="" class="logo-icone h-10 sm:h-11 w-auto object-contain sm:hidden" src="/favicon-dm.png">
    <img alt="" class="logo-completo hidden sm:block sm:h-12 w-auto object-contain" src="/logo-dm.png">
  </a>
  <div class="flex items-center gap-3 sm:gap-4 md:gap-6">
  <nav aria-label="Principal" class="hidden md:flex items-center gap-5 lg:gap-6">
    ${links}
  </nav>
  <div class="relative hidden md:block">
  <button type="button" data-open-contact${pagina === 'inicio' ? ' aria-describedby="cta-contato-texto"' : ''} class="btn-contato inline-flex items-center justify-center px-4 sm:px-6 py-2.5 rounded-full border text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer">Contato</button>${pagina === 'inicio' ? AVISO : ''}
  </div>
  <button type="button" id="menu-botao" aria-expanded="false" aria-controls="menu-mobile" aria-label="Abrir menu" class="md:hidden -mr-1 w-11 h-11 flex items-center justify-center rounded-full text-ds-fg hover:bg-ds-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ds-ring">
    <svg aria-hidden="true" viewBox="0 0 24 24" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path data-menu="aberto" d="M4 7h16M4 12h16M4 17h16"/><path data-menu="fechado" class="hidden" d="M18 6 6 18M6 6l12 12"/></svg>
  </button>
  </div>
</header>
<nav id="menu-mobile" aria-label="Menu" class="hidden md:hidden absolute left-4 right-4 top-full z-40 rounded-2xl bg-white border border-ds-border shadow-ds-xl p-2">
  ${linksMobile}
  <button type="button" data-open-contact class="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#B82828] hover:bg-[#8C1B1B] text-white text-[15px] font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ds-ring"><svg aria-hidden="true" viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>Contato</button>
</nav>
</div>`;
}

export const GAVETA_HTML = `<!-- Gaveta de contato -->
<div id="drawer-backdrop" aria-hidden="true" class="fixed inset-0 bg-ds-fg/40 backdrop-blur-sm z-40 transition-opacity duration-300 ease-in-out opacity-0 pointer-events-none"></div>
<aside id="contact-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" class="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[500px] md:w-[540px] max-w-full bg-white text-ds-fg shadow-ds-xl transition-transform duration-300 ease-in-out flex flex-col justify-between overflow-hidden sm:rounded-l-3xl translate-x-full invisible">
  <div id="drawer-header" class="px-6 sm:px-8 pt-5 pb-3.5 border-b border-ds-border flex items-start justify-between relative bg-white z-10">
    <div>
      <div class="inline-flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-ds-primary bg-ds-primary-muted rounded-full px-3 py-0.5 mb-1"><span aria-hidden="true" class="w-1.5 h-1.5 rounded-full bg-ds-primary"></span> Contato &amp; Parcerias</div>
      <h2 id="drawer-title" class="text-[1.5rem] sm:text-[1.875rem] font-extrabold text-ds-fg tracking-[-0.025em] leading-tight">Inicie uma conversa</h2>
      <p class="text-[0.75rem] sm:text-[0.875rem] text-ds-muted-fg mt-1 leading-snug pr-6">Preencha os dados abaixo que em breve entrarei em contato para agendar uma conversa e apresentar uma proposta para o seu desafio.</p>
    </div>
    <button type="button" id="btn-close-drawer" aria-label="Fechar formulário de contato" class="flex-shrink-0 -mr-2 -mt-1 w-9 h-9 flex items-center justify-center rounded-full text-ds-muted-fg hover:text-ds-fg hover:bg-ds-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ds-ring cursor-pointer">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
  </div>

  <div class="flex-1 overflow-y-auto px-6 sm:px-8 py-4 space-y-3 custom-scroll">
    <form id="contact-form" novalidate class="gap-2.5 flex flex-col">
      <input class="field" name="nome" placeholder="Nome completo *" aria-label="Nome completo" required type="text" autocomplete="name">
      <input class="field" name="email" placeholder="E-mail corporativo *" aria-label="E-mail corporativo" required type="email" autocomplete="email">
      <input class="field" name="telefone" placeholder="Telefone / WhatsApp *" aria-label="Telefone / WhatsApp" required type="tel" autocomplete="tel">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <input class="field" name="empresa" placeholder="Nome da Empresa *" aria-label="Nome da Empresa" required type="text" autocomplete="organization">
        <input class="field" name="cargo" placeholder="Cargo / Função *" aria-label="Cargo / Função" required type="text" autocomplete="organization-title">
      </div>

      <div id="accordion-business" class="rounded-[12px] border border-ds-border bg-ds-muted/40 transition-all overflow-hidden">
        <button type="button" id="btn-toggle-business" aria-expanded="false" aria-controls="accordion-business-body" class="w-full p-3 flex items-center justify-between text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ds-ring transition-colors hover:bg-ds-accent/60 select-none">
          <span class="biz-label text-ds-fg font-medium">Meu negócio é... *</span>
          <svg id="accordion-business-icon" class="w-4 h-4 text-ds-muted-fg transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"></path></svg>
        </button>
        <div id="accordion-business-body" class="px-3 pb-3 pt-2 space-y-1.5 border-t border-ds-border hidden">
          <label class="flex items-start gap-2.5 p-2 rounded-[10px] bg-white/70 border border-ds-border hover:bg-white transition-all cursor-pointer">
            <input class="mt-0.5 w-4 h-4 cursor-pointer flex-shrink-0 accent-ds-primary" name="tipo_negocio" type="radio" value="Um produto/serviço digital">
            <div class="flex-1"><span class="block font-medium text-ds-fg leading-snug text-[0.8125rem]">Um produto/serviço digital</span><span class="block text-ds-muted-fg mt-0.5 leading-snug text-[0.6875rem]">(SaaS, E-commerce, Marketplace, APP, Sistema, Software, etc.)</span></div>
          </label>
          <label class="flex items-start gap-2.5 p-2 rounded-[10px] bg-white/70 border border-ds-border hover:bg-white transition-all cursor-pointer">
            <input class="mt-0.5 w-4 h-4 cursor-pointer flex-shrink-0 accent-ds-primary" name="tipo_negocio" type="radio" value="Um Negócio Físico">
            <div class="flex-1"><span class="block font-medium text-ds-fg leading-snug text-[0.8125rem]">Um Negócio Físico</span><span class="block text-ds-muted-fg mt-0.5 leading-snug text-[0.6875rem]">(Clínicas, Salões, Petshops, Hotéis, Restaurantes, Cafés e Bares, etc.)</span></div>
          </label>
          <label class="flex items-start gap-2.5 p-2 rounded-[10px] bg-white/70 border border-ds-border hover:bg-white transition-all cursor-pointer">
            <input class="mt-0.5 w-4 h-4 cursor-pointer flex-shrink-0 accent-ds-primary" name="tipo_negocio" type="radio" value="Um Negócio Físico e Digital">
            <div class="flex-1"><span class="block font-medium text-ds-fg leading-snug text-[0.8125rem]">Um Negócio Físico e Digital</span></div>
          </label>
          <div class="flex items-center gap-2 p-2 rounded-[10px] bg-white/70 border border-ds-border hover:bg-white transition-all">
            <label class="flex items-center gap-2.5 cursor-pointer flex-shrink-0">
              <input id="radio-business-outro" class="w-4 h-4 cursor-pointer flex-shrink-0 accent-ds-primary" name="tipo_negocio" type="radio" value="Outro">
              <span class="font-medium text-ds-fg leading-snug text-[0.8125rem]">Outro:</span>
            </label>
            <input id="input-outro-descricao" name="tipo_negocio_outro" type="text" aria-label="Outro tipo de negócio" placeholder="Qual? Descreva brevemente..." class="flex-1 min-w-0 px-2.5 py-1 bg-white rounded-[8px] border border-ds-border text-ds-fg placeholder:text-ds-muted-fg focus:outline-none focus:border-ds-primary focus:ring-2 focus:ring-ds-ring transition-all text-[0.8125rem]">
          </div>
        </div>
      </div>

      <div class="relative">
        <select class="field" name="assunto" aria-label="Assunto" required>
          <option disabled selected value="">Assunto *</option>
          <option>Diagnóstico ou orçamento de projeto</option>
          <option>Palestra, aula ou conteúdo</option>
          <option>Parceria ou colaboração</option>
          <option>Imprensa ou divulgação</option>
          <!-- Oculta enquanto o Programa Projeto Piloto não estiver ativo: <option>Inscrição para o Programa Projeto Piloto</option> -->
          <option>Outro</option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ds-muted-fg"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"></path></svg></div>
      </div>

      <textarea class="field resize-none h-[90px]" name="mensagem" rows="3" required aria-label="Conte um pouco sobre seu desafio" placeholder="Conte um pouco sobre seu desafio (Quais objetivos, dores ou ideias você gostaria de trabalhar conosco?) *"></textarea>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div id="days-box" class="flex flex-col justify-center px-3 py-2 rounded-[12px] border border-ds-border bg-ds-muted/40">
          <div class="mb-1 flex items-center justify-between">
            <span class="font-semibold text-ds-fg text-[0.75rem]">Melhor dia da semana *</span>
            <span class="text-[0.625rem] text-ds-muted-fg">múltiplos</span>
          </div>
          <div class="flex items-center justify-between gap-1">
            <label class="flex-1 text-center"><input type="checkbox" name="dias" value="Seg" class="sr-only peer"><span class="block py-1 font-semibold rounded-[8px] text-ds-muted-fg text-[0.75rem] hover:bg-ds-accent peer-checked:bg-ds-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-ds-ring transition-colors cursor-pointer select-none">Seg</span></label>
            <label class="flex-1 text-center"><input type="checkbox" name="dias" value="Ter" class="sr-only peer"><span class="block py-1 font-semibold rounded-[8px] text-ds-muted-fg text-[0.75rem] hover:bg-ds-accent peer-checked:bg-ds-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-ds-ring transition-colors cursor-pointer select-none">Ter</span></label>
            <label class="flex-1 text-center"><input type="checkbox" name="dias" value="Qua" class="sr-only peer"><span class="block py-1 font-semibold rounded-[8px] text-ds-muted-fg text-[0.75rem] hover:bg-ds-accent peer-checked:bg-ds-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-ds-ring transition-colors cursor-pointer select-none">Qua</span></label>
            <label class="flex-1 text-center"><input type="checkbox" name="dias" value="Qui" class="sr-only peer"><span class="block py-1 font-semibold rounded-[8px] text-ds-muted-fg text-[0.75rem] hover:bg-ds-accent peer-checked:bg-ds-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-ds-ring transition-colors cursor-pointer select-none">Qui</span></label>
            <label class="flex-1 text-center"><input type="checkbox" name="dias" value="Sex" class="sr-only peer"><span class="block py-1 font-semibold rounded-[8px] text-ds-muted-fg text-[0.75rem] hover:bg-ds-accent peer-checked:bg-ds-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-ds-ring transition-colors cursor-pointer select-none">Sex</span></label>
          </div>
        </div>
        <div class="relative h-full flex items-center">
          <select class="field h-full" name="periodo" aria-label="Período de preferência" required>
            <option disabled selected value="">Período (preferência) *</option>
            <option>Manhã</option>
            <option>Tarde</option>
            <option>Flexível</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-ds-muted-fg"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"></path></svg></div>
        </div>
      </div>
      <p id="contact-error" role="alert" class="hidden text-[0.75rem] text-ds-error"></p>
    </form>

    <div id="contact-success" class="hidden py-8 px-4 flex-col items-center text-center space-y-4">
      <div class="w-14 h-14 rounded-full bg-ds-primary-muted flex items-center justify-center text-ds-primary"><svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"></path></svg></div>
      <div>
        <h3 class="text-[1.25rem] font-bold text-ds-fg">Mensagem enviada com sucesso!</h3>
        <p class="text-[0.875rem] text-ds-muted-fg mt-2 max-w-xs mx-auto">Entraremos em contato em breve para agendarmos a nossa conversa.</p>
      </div>
      <button type="button" id="btn-success-close" class="mt-4 px-6 py-2.5 rounded-full bg-ds-muted hover:bg-ds-accent text-ds-fg text-[0.75rem] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ds-ring cursor-pointer">Fechar</button>
    </div>
  </div>

  <div id="drawer-submit-bar" class="px-6 sm:px-8 py-3 bg-white border-t border-ds-border flex-shrink-0 z-10">
    <button type="submit" form="contact-form" id="btn-submit-contact" class="w-full min-h-[44px] py-3 px-6 rounded-full bg-ds-primary text-white text-[0.875rem] font-semibold tracking-wide shadow-ds-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-ds-ring flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait">
      <span id="btn-submit-label">Solicitar reunião</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
    </button>
  </div>
  <div class="px-6 sm:px-8 py-2.5 bg-ds-muted/60 border-t border-ds-border text-[0.6875rem] text-ds-muted-fg flex items-center justify-between gap-3">
    <span class="inline-flex items-center gap-1.5"><svg class="w-3 h-3" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Ambiente seguro.</span>
    <span class="font-medium text-ds-fg">Dani Moscatelli Studio</span>
  </div>
</aside>
`;

// Rodapé padrão (mesma estrutura em todas as páginas), em versão clara ou escura conforme o estilo de cada página.
// Inserido no build no comentário <!-- @rodape:claro|escuro -->, dentro do <footer> de cada página.
const LINKS_RODAPE: { href: string; texto: string }[] = [
  { href: '/', texto: 'Home' },
  { href: '/projeto-piloto/', texto: 'Projeto Piloto' },
  { href: '/rede-parceiros/', texto: 'Seja Parceiro' },
  { href: '/privacidade/', texto: 'Política de privacidade' },
];

export function rodapeHtml(variante: 'claro' | 'escuro'): string {
  const logo = variante === 'escuro' ? '/logo-dm-fundo-escuro.svg' : '/logo-dm.png';
  const links = LINKS_RODAPE.map((l) => `<a href="${l.href}">${l.texto}</a>`).join('\n        ');
  return `<!-- Rodapé (componente compartilhado: src/compartilhado/partes.ts) -->
  <div class="rodape rodape-${variante}">
    <div class="rodape-topo">
      <a class="rodape-logo" href="/"><img alt="Dani Moscatelli Experience Design Studio: página inicial" src="${logo}"></a>
      <nav aria-label="Rodapé" class="rodape-links">
        ${links}
        <button type="button" data-preferencias-cookies>Preferências de cookies</button>
        <a href="/admin/">Área restrita</a>
      </nav>
    </div>
    <div class="rodape-base">
      <p>© 2026 Dani Moscatelli Experience Design Studio. Todos os direitos reservados. <span aria-hidden="true">•</span> Curitiba - PR</p>
      <p>Desenvolvido a partir de <a class="rodape-ds" href="/designsystem/" target="_blank" rel="noopener">Dani Moscatelli - Design System<span class="sr-only"> (abre em nova aba)</span></a></p>
    </div>
  </div>`;
}
