"use client";
// Entrar, separada da landing comercial (UX-17). Com sessão, volta para o início.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shell, Loading } from "@/components/Shell";
import { AuthForm } from "@/components/AuthForm";
import { useSession } from "@/components/session";

export default function Entrar() {
  const { loading, session } = useSession();
  const router = useRouter();
  useEffect(() => { if (session) router.replace("/"); }, [session, router]);
  if (loading || session) return <Shell><Loading /></Shell>;
  return <Shell medir><AuthForm /></Shell>;
}
