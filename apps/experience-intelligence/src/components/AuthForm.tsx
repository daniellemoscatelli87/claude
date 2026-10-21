"use client";
// Entrar (/entrar/, textos da landing comercial v1). O cadastro fica em /cadastro/ (D-025), para quem foi convidada.
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
      setErro(/incorretos/.test(m) ? "Não foi possível entrar. Confira seus dados ou tente recuperar sua senha."
        : /Confirme seu e-mail/.test(m) ? "Nesta fase, a plataforma está disponível apenas para pessoas convidadas. Se você recebeu um convite, confirme seu e-mail antes de tentar novamente." : m);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <h1>Continue de onde sua organização parou.</h1>
      <p className="lead">Acesse seus desafios, suas atividades e os próximos passos da sua jornada de melhoria.</p>
      <form className="card stack" onSubmit={enviar} noValidate>
        <CampoEmail label="E-mail" value={email} onChange={setEmail} required />
        <CampoSenha value={senha} onChange={setSenha} />
        {erro && <p className="msg err" role="alert">{erro}</p>}
        <button className="btn btn-primary btn-block" disabled={enviando}>{enviando ? "Aguarde…" : "Entrar"}</button>
        <p className="center" style={{ margin: 0 }}><Link href="/recuperar-senha/">Esqueci minha senha</Link></p>
        <p className="center hint" style={{ margin: 0 }}>Recebeu um convite? <Link href="/cadastro/">Criar conta</Link></p>
      </form>
      <p className="center"><Link href="/">Conhecer a plataforma</Link></p>
    </>
  );
}
