// Login e utilitários compartilhados pelas páginas da área restrita.
// Requer o supabase-js (UMD) carregado antes e, na página, os elementos
// #login, #login-form, #login-email, #login-btn, #login-msg, #denied, #denied-email, #app e #logout.
(function () {
  const ADMIN_EMAIL = "contato@danimoscatelli.com.br";
  const sb = supabase.createClient("https://lipfvnerohkaajegqvwr.supabase.co", "sb_publishable_vOvysMZ0LE2qpKIzLlcM6A_tckkDIej");
  const $ = (id) => document.getElementById(id);
  const show = (id) => ["login", "denied", "app"].forEach((s) => $(s).classList.toggle("hidden", s !== id));

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
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

  // Lista expansível: cada item mostra todas as respostas agrupadas por seção.
  function renderList(rows, container, secoes, summaryText) {
    container.replaceChildren();
    if (!rows.length) { container.appendChild(el("div", "empty card", "Nenhum resultado.")); return; }
    for (const r of rows) {
      const d = el("details", "item");
      const s = el("summary");
      s.append(el("span", "t", r.nome || "Sem nome"), el("span", "d", fmtDate(r.created_at)), el("span", "s", summaryText(r)));
      const body = el("div", "body");
      for (const sec of secoes) {
        if (secoes.length > 1) body.appendChild(el("div", "sec", sec.title));
        const dl = el("dl");
        for (const [k, label] of sec.fields) {
          const row = el("div", "row");
          row.append(el("dt", null, label), valueNode(r[k]));
          dl.appendChild(row);
        }
        body.appendChild(dl);
      }
      d.append(s, body);
      container.appendChild(d);
    }
  }

  const fmtDate = (iso) => new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  // Chama onReady() uma vez por login de administradora.
  function initAdmin(onReady) {
    let current;
    async function render(session) {
      $("logout").classList.toggle("hidden", !session);
      if (!session) return show("login");
      const email = (session.user.email || "").toLowerCase();
      if (email !== ADMIN_EMAIL) { $("denied-email").textContent = email; return show("denied"); }
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
      if (error) { msg.className = "msg err"; msg.textContent = "Não foi possível enviar o link: " + error.message; return; }
      msg.textContent = "Pronto! Abra o link enviado para " + email + " neste mesmo navegador.";
    });

    $("logout").addEventListener("click", async () => { await sb.auth.signOut(); });

    sb.auth.onAuthStateChange((_event, session) => {
      const id = session?.user?.id ?? null;
      if (id === current) return;
      current = id;
      render(session);
    });
  }

  window.Admin = { sb, el, renderList, fmtDate, initAdmin };
})();
