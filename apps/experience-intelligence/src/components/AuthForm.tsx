"use client";
// Entrar (tela C do kit de UX). O cadastro fica em /cadastro/ (D-025).
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/infrastructure/supabase";
import { mensagemDeErro } from "@/application/errors";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErro("Confira o endereço de e-mail informado.");
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
    <form className="card stack" onSubmit={enviar} noValidate>
      <h2>Que bom ter você por aqui.</h2>
      <p className="hint" style={{ margin: 0 }}>Entre para continuar os desafios da sua empresa ou negócio.</p>
      <label>E-mail
        <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>Senha
        <span className="senha">
          <input type={verSenha ? "text" : "password"} autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          <button type="button" onClick={() => setVerSenha(!verSenha)} aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}>
            {verSenha ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
          </button>
        </span>
      </label>
      {erro && <p className="msg err" role="alert">{erro}</p>}
      <button className="btn btn-primary btn-block" disabled={enviando}>{enviando ? "Aguarde…" : "Entrar"}</button>
      <p className="center" style={{ margin: 0 }}>Ainda não tem conta? <Link href="/cadastro/">Criar conta</Link></p>
      <p className="hint center" style={{ margin: 0 }}>Acesso por convite nesta fase.</p>
    </form>
  );
}
