// Estrutura compartilhada da área restrita: cabeçalho com menu sanduíche, login por link e utilitários.
// Cada página carrega o supabase-js (UMD) antes deste arquivo, tem um <main id="app" class="hidden">
// e chama Admin.init({ page, onReady }).
(function () {
  const ADMIN_EMAIL = "contato@danimoscatelli.com.br";
  const ADMIN_NAME = "Dani Moscatelli";
  // "Permanecer conectado" marcado: a sessão fica no localStorage e é renovada automaticamente
  // até clicar em "Sair". Desmarcado: fica no sessionStorage e termina ao fechar o navegador.
  const REMEMBER_KEY = "dm-admin-remember";
  const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };
  const remember = () => safe(() => localStorage.getItem(REMEMBER_KEY) !== "0", true);
  const setRemember = (on) => safe(() => localStorage.setItem(REMEMBER_KEY, on ? "1" : "0"));
  const storage = {
    getItem: (k) => safe(() => localStorage.getItem(k) ?? sessionStorage.getItem(k), null),
    setItem: (k, v) => safe(() => {
      const [keep, drop] = remember() ? [localStorage, sessionStorage] : [sessionStorage, localStorage];
      keep.setItem(k, v); drop.removeItem(k);
    }),
    removeItem: (k) => safe(() => { localStorage.removeItem(k); sessionStorage.removeItem(k); }),
  };
  // Chegou pelo link de "definir senha": mostra o formulário de nova senha em vez da área logada.
  let recovering = /type=recovery/.test(location.hash);
  const sb = supabase.createClient("https://lipfvnerohkaajegqvwr.supabase.co", "sb_publishable_vOvysMZ0LE2qpKIzLlcM6A_tckkDIej", {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "dm-admin-auth", storage },
  });

  const ICONS = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    mailOpen: '<path d="M3 10.5 12 4l9 6.5V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="m3 10.5 9 6 9-6"/>',
    mailCheck: '<path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8"/><path d="m3 7 9 6 9-6"/><path d="m16 19 2 2 4-4"/>',
    meeting: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M9 15l2 2 4-4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 0 1 5.5 5.8"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

  const PAGES = [
    { id: "inicio", href: "/admin/", label: "Início", icon: "home" },
    { id: "contatos", href: "/admin/contatos/", label: "Contato", icon: "mail" },
    { id: "reunioes", href: "/admin/reunioes/", label: "Reuniões", icon: "meeting" },
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
  // Mensagem de contato: envelope fechado (não lida), aberto em cinza (lida), envelope com check em verde
  // (respondida) ou calendário com check em azul (virou reunião agendada).
  // Não aberta vem primeiro: uma resposta nova do contato volta a mensagem para "não lida".
  const mailState = (r) => (!r.visualizado_em ? "" : r.reuniao_em ? "reuniao" : r.respondido_em ? "respondida" : "lida");
  const MAIL_ICONS = { "": ["mail", "Não lida"], lida: ["mailOpen", "Lida"], respondida: ["mailCheck", "Respondida"], reuniao: ["meeting", "Reunião agendada"] };
  function mailIcon(state) {
    const [name, label] = MAIL_ICONS[state || ""];
    const s = el("span", "ini mail");
    s.innerHTML = icon(name);
    s.setAttribute("aria-label", label);
    s.title = label;
    return s;
  }

  function rowLink(href, title, sub, date, seen, mail) {
    const a = el("a", "rowlink" + (seen ? " seen" : "") + (seen === "respondida" ? " answered" : "") + (seen === "reuniao" ? " meeting" : ""));
    a.href = href;
    a.append(mail ? mailIcon(seen) : el("span", "ini", initials(title)), el("span", "t", title || "Sem nome"), el("span", "d", fmtDay(date)), el("span", "s", sub || ""));
    return a;
  }

  // Ao abrir um registro pela primeira vez, guarda quando foi visto (a lista passa a mostrá-lo em cinza).
  async function markSeen(table, r) {
    if (!r || r.visualizado_em) return;
    const { error } = await sb.from(table).update({ visualizado_em: new Date().toISOString() }).eq("id", r.id);
    if (error) console.error(error);
  }

  // Link que abre o Google Agenda com a reunião preenchida e o contato como convidado (duração de 1 hora).
  const gcalDate = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  function googleCalendarLink(r) {
    const start = new Date(r.reuniao_em), end = new Date(start.getTime() + 60 * 6e4);
    const details = ["Reunião agendada a partir de mensagem de contato do site.", r.assunto && "Assunto: " + r.assunto, r.empresa && "Empresa: " + r.empresa, r.cargo && "Cargo: " + r.cargo, r.telefone && "Telefone: " + r.telefone, r.mensagem && "\nMensagem:\n" + r.mensagem].filter(Boolean).join("\n");
    const q = new URLSearchParams({ action: "TEMPLATE", text: "Reunião com " + (r.nome || "contato") + (r.empresa ? " (" + r.empresa + ")" : ""), dates: gcalDate(start) + "/" + gcalDate(end), details });
    if (r.email) q.set("add", r.email);
    return "https://calendar.google.com/calendar/render?" + q.toString();
  }

  function valueNode(v) {
    const dd = el("dd");
    if (v == null || v === "" || (Array.isArray(v) && !v.length)) { dd.textContent = "-"; dd.className = "muted"; return dd; }
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
    top.innerHTML = `<div class="in"><a href="/admin/"><img src="/favicon-dm.png" alt="Dani Moscatelli | Experience Design Studio"></a>
      <div class="top-actions">
        <button type="button" class="burger" id="bell" aria-label="Notificações" aria-expanded="false" aria-controls="notif-drawer">${icon("bell")}<span class="burger-dot hidden" id="bell-dot"></span></button>
        <button type="button" class="burger" id="burger" aria-label="Abrir menu" aria-expanded="false" aria-controls="drawer">${icon("menu")}</button>
      </div></div>`;
    const backdrop = el("div", "backdrop"); backdrop.id = "backdrop";
    const drawer = el("aside", "drawer"); drawer.id = "drawer";
    drawer.setAttribute("aria-label", "Menu");
    drawer.innerHTML = `<button type="button" class="close" id="drawer-close" aria-label="Fechar menu">${icon("close")}</button>
      <div class="who"><span class="avatar">${initials(ADMIN_NAME)}</span><div><div class="n">${ADMIN_NAME}</div><div class="e" id="who-email"></div></div></div>
      <nav>${PAGES.map((p) => `<a href="${p.href}"${p.id === page ? ' aria-current="page"' : ""}>${icon(p.icon)}${p.label}<span class="nav-count hidden" data-count="${p.id}"></span></a>`).join("")}</nav>
      <div class="foot"><button type="button" class="logout" id="logout">${icon("logout")}Sair</button></div>`;

    const wrap = el("div", "wrap"); wrap.id = "gate";
    wrap.innerHTML = `<section class="card login hidden" id="login">
        <img src="/logo-dm.png" alt="Dani Moscatelli | Experience Design Studio" style="display:block;height:44px;margin-bottom:20px">
        <span class="tag">Área restrita</span>
        <h1>Entrar</h1>
        <p class="muted">Use o e-mail e a senha de administrador.</p>
        <form id="login-form" novalidate>
          <label class="l" for="login-email">E-mail</label>
          <input type="email" id="login-email" autocomplete="username" required placeholder="seu@email.com">
          <label class="l" for="login-pass">Senha</label>
          <input type="password" id="login-pass" autocomplete="current-password" required>
          <label class="check"><input type="checkbox" id="login-remember" checked> Permanecer conectado</label>
          <button type="submit" class="btn-primary" id="login-btn">Entrar</button>
          <p class="msg" id="login-msg" aria-live="polite"></p>
          <button type="button" class="link" id="forgot-open">Esqueci minha senha ou ainda não tenho senha</button>
        </form>
      </section>
      <section class="card login hidden" id="forgot">
        <img src="/logo-dm.png" alt="Dani Moscatelli | Experience Design Studio" style="display:block;height:44px;margin-bottom:20px">
        <span class="tag">Área restrita</span>
        <h1>Definir senha</h1>
        <p class="muted">Enviaremos um link para o e-mail de administrador. Ao abrir o link, você cria uma nova senha.</p>
        <form id="forgot-form" novalidate>
          <label class="l" for="forgot-email">E-mail</label>
          <input type="email" id="forgot-email" autocomplete="username" required placeholder="seu@email.com">
          <button type="submit" class="btn-primary" id="forgot-btn">Enviar link</button>
          <p class="msg" id="forgot-msg" aria-live="polite"></p>
          <button type="button" class="link" id="forgot-back">Voltar para o login</button>
        </form>
      </section>
      <section class="card login hidden" id="newpass">
        <img src="/logo-dm.png" alt="Dani Moscatelli | Experience Design Studio" style="display:block;height:44px;margin-bottom:20px">
        <span class="tag">Área restrita</span>
        <h1>Nova senha</h1>
        <p class="muted">Crie uma senha com pelo menos 8 caracteres.</p>
        <form id="newpass-form" novalidate>
          <label class="l" for="newpass-1">Nova senha</label>
          <input type="password" id="newpass-1" autocomplete="new-password" required minlength="8">
          <label class="l" for="newpass-2">Confirme a nova senha</label>
          <input type="password" id="newpass-2" autocomplete="new-password" required minlength="8">
          <label class="check"><input type="checkbox" id="newpass-remember" checked> Permanecer conectado</label>
          <button type="submit" class="btn-primary" id="newpass-btn">Salvar senha e entrar</button>
          <p class="msg" id="newpass-msg" aria-live="polite"></p>
        </form>
      </section>
      <section class="card login hidden" id="denied">
        <span class="tag">Área restrita</span>
        <h1>Sem acesso</h1>
        <p class="muted">O e-mail <strong id="denied-email"></strong> não tem permissão para ver esta área.</p>
        <button type="button" class="btn-ghost" id="denied-logout">Sair</button>
      </section>`;

    document.body.prepend(top, wrap);
    // Barra lateral de notificações: abre pelo sino, com a lista inteira rolando dentro dela.
    const notifDrawer = el("aside", "drawer notif-drawer"); notifDrawer.id = "notif-drawer";
    notifDrawer.setAttribute("aria-label", "Notificações");
    notifDrawer.innerHTML = `<button type="button" class="close" id="notif-close" aria-label="Fechar notificações">${icon("close")}</button>
      <div class="notif-top"><h2>Notificações</h2><div class="muted" id="notif-sub">Carregando…</div></div>
      <div class="notif-scroll" id="notif-list"></div>`;
    document.body.append(backdrop, drawer, notifDrawer);

    let openPanel = null;
    // Trava a rolagem da página atrás do painel (no iPhone, overflow: hidden sozinho não basta).
    let lockedY = 0;
    const lockScroll = (on) => {
      const b = document.body;
      if (on && !b.classList.contains("scroll-lock")) { lockedY = window.scrollY; b.style.top = -lockedY + "px"; b.classList.add("scroll-lock"); }
      else if (!on && b.classList.contains("scroll-lock")) { b.classList.remove("scroll-lock"); b.style.top = ""; window.scrollTo(0, lockedY); }
    };
    const setOpen = (panel, trigger, closeBtn) => (open) => {
      panel.classList.toggle("open", open);
      backdrop.classList.toggle("open", open);
      lockScroll(open);
      trigger.setAttribute("aria-expanded", String(open));
      openPanel = open ? { panel, close: () => setOpen(panel, trigger, closeBtn)(false) } : null;
      if (open) closeBtn.focus(); else trigger.focus();
    };
    const menu = setOpen(drawer, $("burger"), $("drawer-close"));
    const notif = setOpen(notifDrawer, $("bell"), $("notif-close"));
    $("burger").addEventListener("click", () => menu(true));
    $("drawer-close").addEventListener("click", () => menu(false));
    $("bell").addEventListener("click", () => notif(true));
    $("notif-close").addEventListener("click", () => notif(false));
    backdrop.addEventListener("click", () => openPanel?.close());
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && openPanel) openPanel.close(); });
  }

  function init({ page, onReady }) {
    buildShell(page);
    const app = $("app");
    const show = (id) => {
      for (const s of ["login", "forgot", "newpass", "denied"]) $(s).classList.toggle("hidden", id !== s);
      $("gate").classList.toggle("hidden", id === "app");
      $("topbar").classList.toggle("hidden", id !== "app");
      app.classList.toggle("hidden", id !== "app");
    };

    let current;
    async function render(session) {
      if (!session) return show("login");
      if (recovering) return show("newpass");
      const email = (session.user.email || "").toLowerCase();
      if (email !== ADMIN_EMAIL) { $("denied-email").textContent = email; return show("denied"); }
      $("who-email").textContent = email;
      show("app");
      loadNotifications();
      await onReady();
    }

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const setMsg = (id, text, err) => { const m = $(id); m.className = "msg" + (err ? " err" : ""); m.textContent = text; };
    const authError = (error) => /rate limit/i.test(error.message)
      ? "Muitos e-mails pedidos em pouco tempo. Aguarde alguns minutos e tente de novo."
      : /invalid login credentials/i.test(error.message)
        ? "E-mail ou senha incorretos."
        : "Não foi possível concluir: " + error.message;

    $("login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = $("login-email").value.trim().toLowerCase();
      const password = $("login-pass").value;
      if (!EMAIL_RE.test(email) || !password) return setMsg("login-msg", "Informe o e-mail e a senha.", true);
      setMsg("login-msg", "");
      setRemember($("login-remember").checked);
      $("login-btn").disabled = true;
      const { error } = await sb.auth.signInWithPassword({ email, password });
      $("login-btn").disabled = false;
      if (error) setMsg("login-msg", authError(error), true);
    });

    $("forgot-open").addEventListener("click", () => { $("forgot-email").value = $("login-email").value; setMsg("forgot-msg", ""); show("forgot"); });
    $("forgot-back").addEventListener("click", () => show("login"));
    $("forgot-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = $("forgot-email").value.trim().toLowerCase();
      if (!EMAIL_RE.test(email)) return setMsg("forgot-msg", "Informe um e-mail válido.", true);
      $("forgot-btn").disabled = true;
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + "/admin/" });
      $("forgot-btn").disabled = false;
      if (error) return setMsg("forgot-msg", authError(error), true);
      setMsg("forgot-msg", "Pronto! Abra o link enviado para " + email + " neste mesmo navegador.");
    });

    $("newpass-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const p1 = $("newpass-1").value, p2 = $("newpass-2").value;
      if (p1.length < 8) return setMsg("newpass-msg", "A senha precisa ter pelo menos 8 caracteres.", true);
      if (p1 !== p2) return setMsg("newpass-msg", "As senhas não são iguais.", true);
      $("newpass-btn").disabled = true;
      const { error } = await sb.auth.updateUser({ password: p1 });
      $("newpass-btn").disabled = false;
      if (error) return setMsg("newpass-msg", authError(error), true);
      // Regrava a sessão no armazenamento escolhido em "Permanecer conectado".
      setRemember($("newpass-remember").checked);
      const { data } = await sb.auth.getSession();
      if (data.session) storage.setItem("dm-admin-auth", JSON.stringify(data.session));
      recovering = false;
      history.replaceState(null, "", location.pathname + location.search);
      render(data.session);
    });

    const logout = async () => { await sb.auth.signOut(); location.href = "/admin/"; };
    $("logout").addEventListener("click", logout);
    $("denied-logout").addEventListener("click", logout);

    sb.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") { recovering = true; current = session?.user?.id ?? null; return render(session); }
      const id = session?.user?.id ?? null;
      if (id === current) return;
      current = id;
      render(session);
    });
  }

  // Notificações: mensagens de contato não abertas (novas ou com resposta nova do contato)
  // e candidaturas ainda não vistas. Aparecem no menu e são usadas pela Início.
  let notifPromise = null;
  function loadNotifications() {
    notifPromise = (async () => {
      const desde = new Date(Date.now() - 30 * 864e5).toISOString();
      const [c, p, cv, pv] = await Promise.all([
        sb.from("contatos").select("id, nome, assunto, created_at", { count: "exact" }).is("visualizado_em", null).order("created_at", { ascending: false }).limit(200),
        sb.from("cadastros").select("id, nome, principal_especializacao, created_at", { count: "exact" }).is("visualizado_em", null).order("created_at", { ascending: false }).limit(200),
        // Já vistas nos últimos 30 dias, para aparecerem abaixo das novas.
        sb.from("contatos").select("id, nome, assunto, created_at").not("visualizado_em", "is", null).gte("created_at", desde).order("created_at", { ascending: false }).limit(30),
        sb.from("cadastros").select("id, nome, principal_especializacao, created_at").not("visualizado_em", "is", null).gte("created_at", desde).order("created_at", { ascending: false }).limit(30),
      ]);
      const contatos = c.data || [], parceiros = p.data || [];
      const ids = contatos.map((x) => x.id);
      const respostas = new Map();
      if (ids.length) {
        const { data } = await sb.from("mensagens_recebidas").select("contato_id, created_at").in("contato_id", ids).order("created_at", { ascending: false });
        (data || []).forEach((m) => { if (!respostas.has(m.contato_id)) respostas.set(m.contato_id, m.created_at); });
      }
      const n = { contatos: c.count || 0, parceiros: p.count || 0 };
      const items = [
        ...contatos.map((x) => ({ href: "/admin/contatos/?id=" + x.id, at: respostas.get(x.id) || x.created_at, text: (respostas.has(x.id) ? "Nova resposta de " : "Nova mensagem de ") + (x.nome || "contato"), sub: x.assunto, icon: "mail" })),
        ...parceiros.map((x) => ({ href: "/admin/parceiros/?id=" + x.id, at: x.created_at, text: "Nova candidatura de " + (x.nome || "parceiro"), sub: x.principal_especializacao, icon: "users" })),
      ].sort((a, b) => new Date(b.at) - new Date(a.at));
      const vistas = [
        ...(cv.data || []).map((x) => ({ href: "/admin/contatos/?id=" + x.id, at: x.created_at, text: "Mensagem de " + (x.nome || "contato"), sub: x.assunto, icon: "mail" })),
        ...(pv.data || []).map((x) => ({ href: "/admin/parceiros/?id=" + x.id, at: x.created_at, text: "Candidatura de " + (x.nome || "parceiro"), sub: x.principal_especializacao, icon: "users" })),
      ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 30);

      const total = n.contatos + n.parceiros;
      const dot = $("bell-dot");
      dot.textContent = total > 99 ? "99+" : String(total);
      dot.classList.toggle("hidden", !total);
      $("bell").setAttribute("aria-label", total ? "Notificações, " + total + (total === 1 ? " não lida" : " não lidas") : "Notificações");
      $("notif-sub").textContent = total ? (total === 1 ? "1 item não lido" : total + " itens não lidos") : "Tudo em dia";
      for (const [id, v] of Object.entries(n)) {
        const s = document.querySelector(`[data-count="${id}"]`);
        if (s) { s.textContent = String(v); s.classList.toggle("hidden", !v); }
      }
      const list = $("notif-list"); list.replaceChildren();
      const item = (it, nova) => {
        const a = el("a", "notif-item" + (nova ? " new" : " seen")); a.href = it.href;
        const ic = el("span", "ni"); ic.innerHTML = icon(it.icon);
        const t = el("span", "nt"); t.append(el("b", null, it.text));
        if (it.sub) t.append(el("span", "ns", it.sub));
        t.append(el("small", null, fmtDay(it.at)));
        a.append(ic, t);
        if (nova) { const d = el("span", "nd"); d.setAttribute("aria-label", "Não lida"); a.appendChild(d); }
        return a;
      };
      if (items.length) { list.appendChild(el("div", "notif-sec", "Novas")); items.forEach((it) => list.appendChild(item(it, true))); }
      else list.appendChild(el("div", "empty", "Nenhuma notificação nova. Mensagens e candidaturas ainda não abertas aparecem aqui."));
      if (vistas.length) { list.appendChild(el("div", "notif-sec", "Já visualizadas")); vistas.forEach((it) => list.appendChild(item(it, false))); }
      return n;
    })().catch(() => ({ contatos: 0, parceiros: 0 }));
    return notifPromise;
  }
  const notifications = () => notifPromise || loadNotifications();

  const CONTATO_SECOES = [{ title: "Contato", fields: [
    ["nome", "Nome completo"], ["email", "E-mail corporativo"], ["telefone", "Telefone / WhatsApp"],
    ["empresa", "Empresa"], ["cargo", "Cargo / Função"], ["tipo_negocio", "Meu negócio é..."],
    ["tipo_negocio_outro", "Outro (descrição)"], ["assunto", "Assunto"], ["mensagem", "Mensagem"],
    ["dias_preferidos", "Melhor dia da semana"], ["periodo", "Período de preferência"],
  ]}];

  // Confirmação em janela (modal) antes de ações que não podem ser desfeitas.
  function confirmDialog({ title, message, ok = "Excluir", danger = true }) {
    return new Promise((resolve) => {
      const dlg = document.createElement("dialog"); dlg.className = "confirm-dlg";
      dlg.setAttribute("aria-labelledby", "cd-title");
      dlg.innerHTML = `<h2 id="cd-title"></h2><p class="muted"></p><div class="cd-acts"><button type="button" class="btn-ghost" data-v="0">Cancelar</button><button type="button" class="${danger ? "btn-danger-solid" : "btn-ok"}" data-v="1"></button></div>`;
      dlg.querySelector("h2").textContent = title; dlg.querySelector("p").textContent = message; dlg.querySelector('[data-v="1"]').textContent = ok;
      const done = (v) => { dlg.close(); dlg.remove(); resolve(v); };
      dlg.addEventListener("click", (e) => { const b = e.target.closest("button[data-v]"); if (b) done(b.dataset.v === "1"); else if (e.target === dlg) done(false); });
      dlg.addEventListener("cancel", (e) => { e.preventDefault(); done(false); });
      document.body.appendChild(dlg); dlg.showModal(); dlg.querySelector('[data-v="0"]').focus();
    });
  }

  window.Admin = { sb, el, init, icon, notifications, googleCalendarLink, rowLink, mailIcon, mailState, markSeen, detail, fmtDate, fmtDay, initials, CONTATO_SECOES, confirmDialog };
})();
