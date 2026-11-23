"use client";
// Entrar (tela C do kit de UX). O cadastro fica em /cadastro/ (D-025).
import { useState } from "react";
import Link from "next/link";
import { Ajuda, CampoEmail, CampoSenha } from "@/design-system/campos";
import { classeLink } from "@/design-system/classes";
import { Button } from "@/components/ui/button";
import { Cartao, Mensagem, TituloCard } from "./Shell";
import { EMAIL_RE, MSG } from "@/design-system/padroes";
import { supabase } from "@/infrastructure/supabase";
import { mensagemDeErro } from "@/application/errors";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!EMAIL_RE.test(email.trim())) return setErro(MSG.email);
    if (!senha) return setErro("Informe sua senha.");
    setEnviando(true);
    try {
      const { error } = await supabase().auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });
      if (error) throw error;
    } catch (err) {
      const m = mensagemDeErro(err);
      setErro(/incorretos/.test(m) ? "Não conseguimos entrar com esses dados. Confira e tente novamente." : /Confirme seu e-mail/.test(m) ? "Confirme seu e-mail antes de continuar." : m);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Cartao>
      <form className="flex flex-col gap-4" onSubmit={enviar} noValidate>
        <div className="flex flex-col gap-1">
          <TituloCard>Que bom ter você por aqui.</TituloCard>
          <Ajuda>Entre para continuar os desafios da sua empresa ou negócio.</Ajuda>
        </div>
        <CampoEmail label="E-mail" value={email} onChange={setEmail} required />
        <CampoSenha value={senha} onChange={setSenha} />
        {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
        <Button type="submit" className="w-full" disabled={enviando}>{enviando ? "Aguarde…" : "Entrar"}</Button>
        <p className="m-0 text-center text-[0.9375rem]">Ainda não tem conta? <Link href="/cadastro/" className={classeLink}>Criar conta</Link></p>
        <Ajuda className="text-center">Acesso por convite nesta fase.</Ajuda>
      </form>
    </Cartao>
  );
}
