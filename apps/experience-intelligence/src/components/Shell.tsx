"use client";
// Moldura das telas: cabeçalho e conteúdo. Logado: ícone DM (o mesmo da Home do site), divisor e nome da
// plataforma à esquerda; à direita, avatar com seta que abre a barra lateral de perfil.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/infrastructure/supabase";
import { useSession } from "./session";
import { isMaster } from "@/application/master";
import { iniciais } from "./avatar";

export function Shell({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  return (
    <>
      <header className="top">
        <div className="wrap">
          {session ? (
            <>
              <Link href="/" className="brand-logado" aria-label="Experience Intelligence, início">
                <img src="/logo-dm-icone.png" alt="" width={32} height={37} />
                <span className="brand-divisor" aria-hidden="true" />
                <span className="brand-nome">Experience Intelligence</span>
              </Link>
              <MenuPerfil />
            </>
          ) : (
            <Link href="/" className="brand">DM | <span>Experience Intelligence</span></Link>
          )}
        </div>
      </header>
      <main><div className="wrap">{children}</div></main>
    </>
  );
}

function MenuPerfil() {
  const { session, organizations, current, selectOrganization } = useSession();
  const [aberto, setAberto] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);
  const painel = useRef<HTMLDivElement>(null);
  const email = session?.user.email;

  useEffect(() => {
    if (!aberto) return;
    painel.current?.focus();
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") fechar(); };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [aberto]);

  function fechar() { setAberto(false); botao.current?.focus(); }

  return (
    <>
      <button ref={botao} type="button" className="perfil-botao" aria-haspopup="dialog" aria-expanded={aberto}
        aria-controls="perfil-painel" onClick={() => setAberto(true)}>
        <span className="avatar" aria-hidden="true">{iniciais(email)}</span>
        <svg className="seta" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className="sr-only">Abrir opções de perfil</span>
      </button>
      {aberto && (
        <>
          <div className="perfil-fundo" onClick={fechar} aria-hidden="true" />
          <div ref={painel} id="perfil-painel" className="perfil-painel" role="dialog" aria-modal="true" aria-labelledby="perfil-titulo" tabIndex={-1}>
            <div className="perfil-topo">
              <span className="avatar grande" aria-hidden="true">{iniciais(email)}</span>
              <div>
                <h2 id="perfil-titulo" className="sr-only">Perfil</h2>
                <p className="perfil-email">{email}</p>
                {current && <p className="hint" style={{ margin: 0 }}>{current.name}</p>}
              </div>
              <button type="button" className="perfil-fechar" onClick={fechar}><span aria-hidden="true">×</span><span className="sr-only">Fechar</span></button>
            </div>
            <nav className="perfil-opcoes" aria-label="Opções de perfil">
              {organizations.length > 1 && current && (
                <label>Organização
                  <select value={current.id} onChange={(e) => { selectOrganization(e.target.value); location.href = "/"; }}>
                    {organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </label>
              )}
              {session && isMaster(session) && <Link href="/master/" onClick={() => setAberto(false)}>Área master</Link>}
              <button type="button" className="btn btn-ghost btn-block"
                onClick={async () => { await supabase().auth.signOut(); location.href = "/"; }}>Sair</button>
            </nav>
          </div>
        </>
      )}
    </>
  );
}

export function Loading() {
  return <p className="lead center" role="status">Carregando…</p>;
}
