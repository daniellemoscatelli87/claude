"use client";
// Criar conta e entrar (C1-01).
import { useState } from "react";
import { supabase } from "@/infrastructure/supabase";
import { mensagemDeErro } from "@/application/errors";

export function AuthForm() {
  const [modo, setModo] = useState<"entrar" | "criar">("criar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setAviso("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErro("Informe um e-mail válido.");
    if (senha.length < 8) return setErro("A senha precisa ter pelo menos 8 caracteres.");
    setEnviando(true);
    try {
      if (modo === "criar") {
        const { data, error } = await supabase().auth.signUp({ email: email.trim(), password: senha, options: { emailRedirectTo: location.origin + "/" } });
        if (error) throw error;
        if (!data.session) setAviso("Conta criada. Enviamos um link de confirmação para " + email.trim() + ". Abra o link e depois entre aqui.");
      } else {
        const { error } = await supabase().auth.signInWithPassword({ email: email.trim(), password: senha });
        if (error) throw error;
      }
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="card stack" onSubmit={enviar} noValidate>
      <h2>{modo === "criar" ? "Crie sua conta" : "Entre na sua conta"}</h2>
      <label>E-mail
        <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>Senha
        <input type="password" autoComplete={modo === "criar" ? "new-password" : "current-password"} value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={8} />
        {modo === "criar" && <span className="hint">Pelo menos 8 caracteres.</span>}
      </label>
      {erro && <p className="msg err" role="alert">{erro}</p>}
      {aviso && <p className="msg ok" role="status">{aviso}</p>}
      <button className="btn btn-primary btn-block" disabled={enviando}>{enviando ? "Aguarde…" : modo === "criar" ? "Criar conta" : "Entrar"}</button>
      <p className="center" style={{ margin: 0 }}>
        {modo === "criar" ? "Já tem conta? " : "Ainda não tem conta? "}
        <button type="button" className="btn-link" onClick={() => { setModo(modo === "criar" ? "entrar" : "criar"); setErro(""); setAviso(""); }}>
          {modo === "criar" ? "Entrar" : "Criar conta"}
        </button>
      </p>
    </form>
  );
}
