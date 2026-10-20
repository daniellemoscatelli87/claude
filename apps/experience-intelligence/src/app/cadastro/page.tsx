"use client";
// Cadastro, etapa 1 de 2: dados pessoais, e-mail e senha (D-025). O botão "Cadastrar" do site virá depois.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shell, Loading } from "@/components/Shell";
import { Etapas } from "@/components/Etapas";
import { PersonalForm } from "@/components/PersonalForm";
import { useSession } from "@/components/session";

export default function Cadastro() {
  const { loading, session } = useSession();
  const router = useRouter();
  useEffect(() => { if (!loading && session) router.replace("/"); }, [loading, session, router]);
  if (loading || session) return <Shell><Loading /></Shell>;
  return (
    <Shell>
      <Etapas atual={1} />
      <PersonalForm modo="cadastro" />
    </Shell>
  );
}
