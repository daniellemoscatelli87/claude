"use client";
// Cabeçalho fixo da landing: âncoras das seções e "Entrar". No celular, menu que fecha com Esc, toque fora ou ao navegar.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ANCORAS } from "./conteudo";
import { medir } from "@/infrastructure/analytics";

export function CabecalhoLanding() {
  const [aberto, setAberto] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);
  const painel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    painel.current?.querySelector("a")?.focus();
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") { setAberto(false); botao.current?.focus(); } };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [aberto]);

  const entrar = <Link href="/entrar/" className="btn btn-ghost btn-pequeno" onClick={() => medir("login_click", { local: "cabecalho" })}>Entrar</Link>;

  return (
    <header className="lp-topo">
      <div className="lp-wrap lp-topo-linha">
        <a href="#inicio" className="brand">DM | <span>Experience Intelligence</span></a>
        <nav className="lp-nav" aria-label="Seções">
          {ANCORAS.map((a) => <a key={a.id} href={`#${a.id}`}>{a.rotulo}</a>)}
        </nav>
        <div className="lp-topo-acoes">
          {entrar}
          <button ref={botao} type="button" className="lp-menu-botao" aria-expanded={aberto} aria-controls="lp-menu" onClick={() => setAberto((a) => !a)}>
            {aberto ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            <span className="sr-only">{aberto ? "Fechar menu" : "Abrir menu"}</span>
          </button>
        </div>
      </div>
      {aberto && (
        <>
          <div className="lp-menu-fundo" onClick={() => setAberto(false)} aria-hidden="true" />
          <div ref={painel} id="lp-menu" className="lp-menu">
            <nav aria-label="Seções">
              {ANCORAS.map((a) => <a key={a.id} href={`#${a.id}`} onClick={() => setAberto(false)}>{a.rotulo}</a>)}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
