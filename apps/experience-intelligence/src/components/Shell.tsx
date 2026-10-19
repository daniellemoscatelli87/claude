"use client";
// Moldura das telas logadas: marca, organização atual (com troca) e sair.
import Link from "next/link";
import { supabase } from "@/infrastructure/supabase";
import { useSession } from "./session";
import { isMaster } from "@/application/master";

export function Shell({ children }: { children: React.ReactNode }) {
  const { session, organizations, current, selectOrganization } = useSession();
  return (
    <>
      <header className="top">
        <div className="wrap">
          <Link href="/" className="brand">DM | <span>Experience Intelligence</span></Link>
          {session && (
            <div className="top-actions">
              {isMaster(session) && <Link href="/master/" className="tag" style={{ textDecoration: "none" }}>Área master</Link>}
              {organizations.length > 1 && current && (
                <label className="sr-only" htmlFor="org-select">Organização</label>
              )}
              {organizations.length > 1 && current ? (
                <select id="org-select" value={current.id} onChange={(e) => { selectOrganization(e.target.value); location.href = "/"; }} style={{ width: "auto", fontSize: 14, padding: "8px 10px" }}>
                  {organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              ) : current ? <span className="tag gray">{current.name}</span> : null}
              <button type="button" className="btn btn-ghost" style={{ minHeight: 38, padding: "8px 14px", fontSize: 14 }}
                onClick={async () => { await supabase().auth.signOut(); location.href = "/"; }}>Sair</button>
            </div>
          )}
        </div>
      </header>
      <main><div className="wrap">{children}</div></main>
    </>
  );
}

export function Loading() {
  return <p className="lead center" role="status">Carregando…</p>;
}
