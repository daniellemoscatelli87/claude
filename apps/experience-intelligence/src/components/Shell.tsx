"use client";
// Moldura das telas: cabeçalho, conteúdo e rodapé. Logado: ícone DM (o mesmo da Home do site), divisor e
// "Experience Intelligence" à esquerda; à direita, avatar e nome com seta que abre a barra lateral de perfil.
// Rodapé com a assinatura "by Dani Moscatelli Studio" (D-022).
import { useEffect, useRef, useState } from "react";
import { Building2, LogOut, Pencil, ShieldUser } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/infrastructure/supabase";
import { useSession } from "./session";
import { isMaster } from "@/application/master";
import { iniciais } from "./avatar";
import { displayName } from "@/application/profile";
import { NameForm } from "./NameForm";

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
      <footer className="rodape"><div className="wrap"><p>by Dani Moscatelli Studio</p></div></footer>
    </>
  );
}

function MenuPerfil() {
  const { session, organizations, current, selectOrganization } = useSession();
  const [aberto, setAberto] = useState(false);
  const [editandoNome, setEditandoNome] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);
  const painel = useRef<HTMLDivElement>(null);
  const email = session?.user.email;
  const nome = displayName(session);

  useEffect(() => {
    if (!aberto) return;
    painel.current?.focus();
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") fechar(); };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [aberto]);

  function fechar() { setAberto(false); setEditandoNome(false); botao.current?.focus(); }

  return (
    <>
      <button ref={botao} type="button" className="perfil-botao" aria-haspopup="dialog" aria-expanded={aberto}
        aria-controls="perfil-painel" onClick={() => setAberto(true)}>
        <span className="avatar" aria-hidden="true">{iniciais(nome ?? email)}</span>
        <svg className="seta" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className="sr-only">Abrir opções de perfil</span>
      </button>
      {aberto && (
        <>
          <div className="perfil-fundo" onClick={fechar} aria-hidden="true" />
          <div ref={painel} id="perfil-painel" className="perfil-painel" role="dialog" aria-modal="true" aria-labelledby="perfil-titulo" tabIndex={-1}>
            <div className="perfil-topo">
              <span className="avatar grande" aria-hidden="true">{iniciais(nome ?? email)}</span>
              <div>
                <h2 id="perfil-titulo" className="sr-only">Perfil</h2>
                <p className="perfil-nome">{nome ?? email}</p>
                {current && <p className="hint" style={{ margin: 0 }}>{current.name}</p>}
              </div>
              <button type="button" className="perfil-fechar" onClick={fechar}><span aria-hidden="true">×</span><span className="sr-only">Fechar</span></button>
            </div>
            <nav className="perfil-opcoes" aria-label="Opções de perfil">
              {editandoNome ? (
                <NameForm inicial={nome ?? ""} compacto onSaved={() => setEditandoNome(false)} />
              ) : (
                <button type="button" className="opcao" onClick={() => setEditandoNome(true)}><Pencil size={18} aria-hidden="true" /> Editar nome</button>
              )}
              {current && <Link href="/organizacao/" className="opcao" onClick={() => setAberto(false)}><Building2 size={18} aria-hidden="true" /> Informações da organização</Link>}
              {organizations.length > 1 && current && (
                <label>Organização
                  <select value={current.id} onChange={(e) => { selectOrganization(e.target.value); location.href = "/"; }}>
                    {organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </label>
              )}
              {session && isMaster(session) && <Link href="/master/" className="opcao" onClick={() => setAberto(false)}><ShieldUser size={18} aria-hidden="true" /> Área master</Link>}
              <button type="button" className="btn btn-ghost btn-block"
                onClick={async () => { await supabase().auth.signOut(); location.href = "/"; }}><LogOut size={18} aria-hidden="true" /> Sair</button>
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
