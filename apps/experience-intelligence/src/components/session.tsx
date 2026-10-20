"use client";
// Sessão e organização atual, compartilhadas pelas telas.
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/infrastructure/supabase";
import { currentOrganizationId, listMyOrganizations, setCurrentOrganizationId, type MyOrganization } from "@/application/organizations";
import { myProfile, type MyProfile } from "@/application/profile";

interface SessionState {
  loading: boolean;
  session: Session | null;
  organizations: MyOrganization[];
  current: MyOrganization | null;
  /** Perfil pessoal; null se a conta ainda não completou os dados pessoais. */
  profile: MyProfile | null;
  selectOrganization: (id: string) => void;
  reload: () => Promise<void>;
}

const Ctx = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [organizations, setOrganizations] = useState<MyOrganization[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [profile, setProfile] = useState<MyProfile | null>(null);

  const reload = useCallback(async () => {
    const { data } = await supabase().auth.getSession();
    setSession(data.session);
    if (!data.session) { setOrganizations([]); setProfile(null); setLoading(false); return; }
    const [orgs, perfil] = await Promise.all([listMyOrganizations().catch(() => []), myProfile().catch(() => null)]);
    setProfile(perfil);
    setOrganizations(orgs);
    const salvo = currentOrganizationId();
    setCurrentId(orgs.some((o) => o.id === salvo) ? salvo : orgs[0]?.id ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    const { data } = supabase().auth.onAuthStateChange((evento) => {
      if (evento === "SIGNED_IN" || evento === "SIGNED_OUT") reload();
    });
    return () => data.subscription.unsubscribe();
  }, [reload]);

  const selectOrganization = (id: string) => { setCurrentOrganizationId(id); setCurrentId(id); };
  const current = organizations.find((o) => o.id === currentId) ?? null;

  return <Ctx.Provider value={{ loading, session, organizations, current, profile, selectOrganization, reload }}>{children}</Ctx.Provider>;
}

export function useSession(): SessionState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSession fora do SessionProvider");
  return v;
}
