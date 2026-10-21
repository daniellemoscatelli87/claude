"use client";
// Esqueci minha senha: envia o link de nova senha (Supabase Auth). A mensagem não revela se o e-mail tem conta.
import { useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { CampoEmail } from "@/design-system/campos";
import { EMAIL_RE, MSG } from "@/design-system/padroes";
import { requestPasswordReset } from "@/application/profile";
import { mensagemDeErro } from "@/application/errors";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!EMAIL_RE.test(email.trim())) return setErro(MSG.email);
    setEnviando(true);
    try {
      await requestPasswordReset(email);
      setEnviado(true);
    } catch (err) {
      const m = mensagemDeErro(err);
      setErro(/Muitas tentativas/.test(m) ? "Aguarde alguns minutos antes de solicitar outro e-mail." : m);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Shell medir>
      <h1>Esqueci minha senha</h1>
      <p className="lead">Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha.</p>
      {enviado ? (
        <div className="card stack">
          <p className="msg ok" role="status">Se houver uma conta com este e-mail, enviaremos um link para criar uma nova senha.</p>
          <p className="hint" style={{ margin: 0 }}>Confira também a caixa de spam. O link vale por tempo limitado.</p>
          <Link href="/entrar/" className="btn btn-primary btn-block">Voltar para entrar</Link>
        </div>
      ) : (
        <form className="card stack" onSubmit={enviar} noValidate>
          <CampoEmail label="E-mail" value={email} onChange={setEmail} required />
          {erro && <p className="msg err" role="alert">{erro}</p>}
          <button className="btn btn-primary btn-block" disabled={enviando}>{enviando ? "Enviando…" : "Enviar link"}</button>
          <p className="center" style={{ margin: 0 }}><Link href="/entrar/">Voltar para entrar</Link></p>
        </form>
      )}
    </Shell>
  );
}
