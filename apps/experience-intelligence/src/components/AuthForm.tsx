"use client";
// Entrar (tela C do kit de UX). O cadastro fica em /cadastro/ (D-025).
import { useState } from "react";
import Link from "next/link";
import { CampoEmail, CampoSenha } from "@/design-system/campos";
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
    <form id="entrar" className="card stack" onSubmit={enviar} noValidate>
      <h2>Que bom ter você por aqui.</h2>
      <p className="hint" style={{ margin: 0 }}>Entre para continuar os desafios da sua empresa ou negócio.</p>
      <CampoEmail label="E-mail" value={email} onChange={setEmail} required />
      <CampoSenha value={senha} onChange={setSenha} />
      {erro && <p className="msg err" role="alert">{erro}</p>}
      <button className="btn btn-primary btn-block" disabled={enviando}>{enviando ? "Aguarde…" : "Entrar"}</button>
      <p className="center" style={{ margin: 0 }}>Ainda não tem conta? <Link href="/cadastro/">Criar conta</Link></p>
    </form>
  );
}
