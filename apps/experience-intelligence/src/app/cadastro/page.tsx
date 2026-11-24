"use client";
// Cadastro, etapa 1 de 2: dados pessoais, e-mail e senha (D-025). O botão "Cadastrar" do site virá depois.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shell, Loading, Titulo } from "@/components/Shell";
import { BarraProgresso } from "@/design-system/campos";
import { PersonalForm } from "@/components/PersonalForm";
import { useSession } from "@/components/session";

export default function Cadastro() {
  const { loading, session } = useSession();
  const router = useRouter();
  useEffect(() => { if (!loading && session) router.replace("/"); }, [loading, session, router]);
  if (loading || session) return <Shell><Loading /></Shell>;
  return (
    <Shell>
      <Titulo>Crie sua conta</Titulo>
      <BarraProgresso atual={1} total={2} />
      <PersonalForm modo="cadastro" />
    </Shell>
  );
}
