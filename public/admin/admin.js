// Estrutura compartilhada da área restrita: cabeçalho com menu sanduíche, login por link e utilitários.
// Cada página carrega o supabase-js (UMD) antes deste arquivo, tem um <main id="app" class="hidden">
// e chama Admin.init({ page, onReady }).
(function () {
  const ADMIN_EMAIL = "contato@danimoscatelli.com.br";
  const ADMIN_NAME = "Dani Moscatelli";
  const sb = supabase.createClient("https://lipfvnerohkaajegqvwr.supabase.co", "sb_publishable_vOvysMZ0LE2qpKIzLlcM6A_tckkDIej");

  const ICONS = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 0 1 5.5 5.8"/>',
    logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 16l-4-4 4-4M6 12h10"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

  const PAGES = [
    { id: "inicio", href: "/admin/", label: "Início", icon: "home" },
    { id: "contatos", href: "/admin/contatos/", label: "Contato", icon: "mail" },
    { id: "parceiros", href: "/admin/parceiros/", label: "Parceiros", icon: "users" },
  ];

  const $ = (id) => document.getElementById(id);

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  const initials = (name) => (name || "?").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "?";
  const fmtDate = (iso) => new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  const fmtDay = (iso) => {
    const d = new Date(iso), now = new Date();
    const diff = Math.floor((new Date(now.toDateString()) - new Date(d.toDateString())) / 864e5);
    if (diff === 0) return "Hoje, " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    if (diff === 1) return "Ontem";
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  // Linha clicável com iniciais, título, data e resumo.
  function rowLink(href, title, sub, date) {
    const a = el("a", "rowlink");
    a.href = href;
    a.append(el("span", "ini", initials(title)), el("span", "t", title || "Sem nome"), el("span", "d", fmtDay(date)), el("span", "s", sub || ""));
    return a;
  }

  function valueNode(v) {
    const dd = el("dd");
    if (v == null || v === "" || (Array.isArray(v) && !v.length)) { dd.textContent = "—"; dd.className = "muted"; return dd; }
    if (typeof v === "boolean") { dd.textContent = v ? "Sim" : "Não"; return dd; }
    const text = Array.isArray(v) ? v.join("\n") : String(v);
    if (/^(https?:\/\/|www\.|linkedin\.com)/i.test(text) && !text.includes(" ")) {
      const a = el("a", null, text);
      a.href = /^https?:\/\//i.test(text) ? text : "https://" + text;
      a.target = "_blank"; a.rel = "noopener noreferrer";
      dd.appendChild(a);
    } else dd.textContent = text;
    return dd;
  }

  // Todas as respostas de um registro, agrupadas por seção.
  function detail(r, secoes, metaText) {
    const card = el("div", "card");
    const head = el("div", "detail-head");
    const info = el("div");
    info.append(el("h2", null, r.nome || "Sem nome"), el("div", "meta", metaText));
    head.append(el("span", "ini", initials(r.nome)), info);
    card.appendChild(head);
    for (const sec of secoes) {
      if (secoes.length > 1) card.appendChild(el("div", "sec", sec.title));
      const dl = el("dl");
      for (const [k, label] of sec.fields) {
        const row = el("div", "row");
        row.append(el("dt", null, label), valueNode(r[k]));
        dl.appendChild(row);
      }
      card.appendChild(dl);
    }
    return card;
  }

  function buildShell(page) {
    const top = el("div", "topbar hidden");
    top.id = "topbar";
    top.innerHTML = `<div class="in"><a href="/admin/"><img src="/logo-dm.png" alt="Dani Moscatelli | Experience Design Studio"></a>
      <button type="button" class="burger" id="burger" aria-label="Abrir menu" aria-expanded="false" aria-controls="drawer">${icon("menu")}</button></div>`;
    const backdrop = el("div", "backdrop"); backdrop.id = "backdrop";
    const drawer = el("aside", "drawer"); drawer.id = "drawer";
    drawer.setAttribute("aria-label", "Menu");
    drawer.innerHTML = `<button type="button" class="close" id="drawer-close" aria-label="Fechar menu">${icon("close")}</button>
      <div class="who"><span class="avatar">${initials(ADMIN_NAME)}</span><div><div class="n">${ADMIN_NAME}</div><div class="e" id="who-email"></div></div></div>
      <nav>${PAGES.map((p) => `<a href="${p.href}"${p.id === page ? ' aria-current="page"' : ""}>${icon(p.icon)}${p.label}</a>`).join("")}</nav>
      <div class="foot"><button type="button" class="logout" id="logout">${icon("logout")}Sair</button></div>`;

    const wrap = el("div", "wrap"); wrap.id = "gate";
    wrap.innerHTML = `<section class="card login hidden" id="login">
        <img src="/logo-dm.png" alt="Dani Moscatelli | Experience Design Studio" style="height:44px;margin-bottom:20px">
        <span class="tag">Área restrita</span>
        <h1>Entrar</h1>
        <p class="muted">Digite o e-mail de administrador para receber um link de acesso.</p>
        <form id="login-form" novalidate>
          <label class="l" for="login-email">E-mail</label>
          <input type="email" id="login-email" autocomplete="email" required placeholder="seu@email.com">
          <button type="submit" class="btn-primary" id="login-btn">Enviar link de acesso</button>
          <p class="msg" id="login-msg" aria-live="polite"></p>
        </form>
      </section>
      <section class="card login hidden" id="denied">
        <span class="tag">Área restrita</span>
        <h1>Sem acesso</h1>
        <p class="muted">O e-mail <strong id="denied-email"></strong> não tem permissão para ver esta área.</p>
        <button type="button" class="btn-ghost" id="denied-logout">Sair</button>
      </section>`;

    document.body.prepend(top, wrap);
    document.body.append(backdrop, drawer);

    const setOpen = (open) => {
      drawer.classList.toggle("open", open);
      backdrop.classList.toggle("open", open);
      $("burger").setAttribute("aria-expanded", String(open));
      if (open) $("drawer-close").focus(); else $("burger").focus();
    };
    $("burger").addEventListener("click", () => setOpen(true));
    $("drawer-close").addEventListener("click", () => setOpen(false));
    backdrop.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("open")) setOpen(false); });
  }

  function init({ page, onReady }) {
    buildShell(page);
    const app = $("app");
    const show = (id) => {
      $("login").classList.toggle("hidden", id !== "login");
      $("denied").classList.toggle("hidden", id !== "denied");
      $("gate").classList.toggle("hidden", id === "app");
      $("topbar").classList.toggle("hidden", id !== "app");
      app.classList.toggle("hidden", id !== "app");
    };

    let current;
    async function render(session) {
      if (!session) return show("login");
      const email = (session.user.email || "").toLowerCase();
      if (email !== ADMIN_EMAIL) { $("denied-email").textContent = email; return show("denied"); }
      $("who-email").textContent = email;
      show("app");
      await onReady();
    }

    $("login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = $("login-email").value.trim().toLowerCase();
      const msg = $("login-msg");
      msg.className = "msg";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.className = "msg err"; msg.textContent = "Informe um e-mail válido."; return; }
      $("login-btn").disabled = true;
      const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + "/admin/" } });
      $("login-btn").disabled = false;
      if (error) {
        msg.className = "msg err";
        msg.textContent = /rate limit/i.test(error.message)
          ? "Muitos links pedidos em pouco tempo. Aguarde alguns minutos e tente de novo — o último link enviado continua válido."
          : "Não foi possível enviar o link: " + error.message;
        return;
      }
      msg.textContent = "Pronto! Abra o link enviado para " + email + " neste mesmo navegador.";
    });

    const logout = async () => { await sb.auth.signOut(); location.href = "/admin/"; };
    $("logout").addEventListener("click", logout);
    $("denied-logout").addEventListener("click", logout);

    sb.auth.onAuthStateChange((_event, session) => {
      const id = session?.user?.id ?? null;
      if (id === current) return;
      current = id;
      render(session);
    });
  }

  const CONTATO_SECOES = [{ title: "Contato", fields: [
    ["nome", "Nome completo"], ["email", "E-mail corporativo"], ["telefone", "Telefone / WhatsApp"],
    ["empresa", "Empresa"], ["cargo", "Cargo / Função"], ["tipo_negocio", "Meu negócio é..."],
    ["tipo_negocio_outro", "Outro (descrição)"], ["assunto", "Assunto"], ["mensagem", "Mensagem"],
    ["dias_preferidos", "Melhor dia da semana"], ["periodo", "Período de preferência"],
  ]}];

  window.Admin = { sb, el, init, rowLink, detail, fmtDate, fmtDay, initials, CONTATO_SECOES };
})();
