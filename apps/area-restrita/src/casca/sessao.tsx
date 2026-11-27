// Sessão da administradora: mesma conta, mesmo armazenamento e mesma regra de acesso das páginas de HTML.
// O acesso vem do papel "admin" no app_metadata (definido só no servidor), não do e-mail.
import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { registrar, sb } from "@/lib/supabase";

export const NOME_PADRAO = "Dani Moscatelli";
export const FOTO_PADRAO = "/admin/avatar-dani.webp";

export type Perfil = { nome: string; foto: string; email: string };
export function perfilDe(u: User | null | undefined): Perfil {
  const meta = (u?.user_metadata || {}) as { nome?: string; avatar_url?: string };
  return { nome: (meta.nome || "").trim() || NOME_PADRAO, foto: meta.avatar_url || FOTO_PADRAO, email: (u?.email || "").toLowerCase() };
}

export type Etapa = "carregando" | "entrar" | "esqueci" | "nova-senha" | "sem-acesso" | "dentro";
export const ehAdmin = (s: Session | null | undefined) => (s?.user?.app_metadata as { role?: string } | undefined)?.role === "admin";

type Contexto = {
  etapa: Etapa;
  perfil: Perfil;
  irPara: (e: Etapa) => void;
  sair: () => Promise<void>;
  /** Depois de salvar a nova senha: tira o "type=recovery" do endereço e entra. */
  concluirNovaSenha: () => Promise<void>;
};
const SessaoContext = React.createContext<Contexto | null>(null);

export function useSessao() {
  const c = React.useContext(SessaoContext);
  if (!c) throw new Error("useSessao fora do ProvedorDeSessao");
  return c;
}

export function ProvedorDeSessao({ children }: { children: React.ReactNode }) {
  const [etapa, setEtapa] = React.useState<Etapa>("carregando");
  const [usuario, setUsuario] = React.useState<User | null>(null);
  const recuperando = React.useRef(typeof location !== "undefined" && /type=recovery/.test(location.hash));
  const atual = React.useRef<string | null | undefined>(undefined);

  const avaliar = React.useCallback(async (sessao: Session | null) => {
    if (!sessao) return setEtapa("entrar");
    if (recuperando.current) return setEtapa("nova-senha");
    // Uma sessão antiga, de antes do papel existir, é renovada uma vez para trazê-lo.
    if (!ehAdmin(sessao)) {
      const { data } = await sb.auth.refreshSession();
      if (data.session) sessao = data.session;
    }
    setUsuario(sessao.user);
    setEtapa(ehAdmin(sessao) ? "dentro" : "sem-acesso");
  }, []);

  React.useEffect(() => {
    const { data } = sb.auth.onAuthStateChange((evento, sessao) => {
      if (evento === "PASSWORD_RECOVERY") {
        recuperando.current = true;
        atual.current = sessao?.user?.id ?? null;
        void avaliar(sessao);
        return;
      }
      if (evento === "USER_UPDATED" && sessao) setUsuario(sessao.user);
      const id = sessao?.user?.id ?? null;
      if (id === atual.current) return;
      atual.current = id;
      void avaliar(sessao);
    });
    return () => data.subscription.unsubscribe();
  }, [avaliar]);

  const valor = React.useMemo<Contexto>(
    () => ({
      etapa,
      perfil: perfilDe(usuario),
      irPara: setEtapa,
      sair: async () => {
        await registrar("Saiu da área restrita");
        await sb.auth.signOut();
        location.href = "/admin/";
      },
      concluirNovaSenha: async () => {
        recuperando.current = false;
        history.replaceState(null, "", location.pathname + location.search);
        const { data } = await sb.auth.getSession();
        await avaliar(data.session);
      },
    }),
    [etapa, usuario, avaliar],
  );
  return <SessaoContext.Provider value={valor}>{children}</SessaoContext.Provider>;
}
