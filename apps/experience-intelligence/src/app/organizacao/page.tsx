"use client";
// Informações da organização atual (UX-3a): contexto mínimo usado para adaptar as orientações.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shell, Loading, Voltar } from "@/components/Shell";
import { OrganizationForm } from "@/components/OrganizationForm";
import { useSession } from "@/components/session";

export default function Organizacao() {
  const { loading, session, current } = useSession();
  const router = useRouter();
  useEffect(() => { if (!loading && (!session || !current)) router.replace("/"); }, [loading, session, current, router]);
  if (loading || !current) return <Shell><Loading /></Shell>;
  return (
    <Shell>
      <Voltar href="/">← Seus desafios</Voltar>
      <OrganizationForm key={current.id} org={current} />
    </Shell>
  );
}
