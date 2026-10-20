"use client";
// Meus dados (D-025): editar dados pessoais, e-mail e senha.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shell, Loading } from "@/components/Shell";
import { PersonalForm } from "@/components/PersonalForm";
import { useSession } from "@/components/session";
import { changeEmail, changePassword } from "@/application/profile";
import { mensagemDeErro } from "@/application/errors";
import { FieldErrors } from "@/application/profile";
import { CampoEmail, CampoSenhaNova } from "@/design-system/campos";

export default function Perfil() {
  const { loading, session, profile } = useSession();
  const router = useRouter();
  useEffect(() => { if (!loading && !session) router.replace("/"); }, [loading, session, router]);
  if (loading || !session) return <Shell><Loading /></Shell>;
  return (
    <Shell>
      <p style={{ margin: "0 0 12px" }}><Link href="/">← Seus desafios</Link></p>
      <h1>Meus dados</h1>
      <p className="lead">Seus dados pessoais aparecem só para você.</p>
      <PersonalForm key={profile?.full_name ?? "novo"} modo={profile ? "editar" : "completar"} perfil={profile} email={session.user.email} />
      <Acesso email={session.user.email ?? ""} />
    </Shell>
  );
}

function Acesso({ email }: { email: string }) {
  const [novoEmail, setNovoEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [msg, setMsg] = useState<{ ok?: string; err?: string }>({});
  const [campos, setCampos] = useState<Record<string, string>>({});
  const agir = (f: () => Promise<void>, ok: string) => async (e: React.FormEvent) => {
    e.preventDefault(); setMsg({}); setCampos({});
    try { await f(); setMsg({ ok }); setNovoEmail(""); setSenha(""); setConfirmacao(""); }
    catch (err) { if (err instanceof FieldErrors) setCampos(err.campos); else setMsg({ err: mensagemDeErro(err) }); }
  };
  return (
    <section className="card stack">
      <h2 style={{ margin: 0 }}>Acesso</h2>
      <form className="stack" onSubmit={agir(() => changeEmail(novoEmail), "Enviamos um link de confirmação para o novo e-mail. A troca vale depois que você confirmar.")} noValidate>
        <label>E-mail atual
          <input type="email" value={email} disabled readOnly />
        </label>
        <CampoEmail label="Novo e-mail" value={novoEmail} onChange={setNovoEmail} />
        <button className="btn btn-ghost btn-block" disabled={!novoEmail}>Alterar e-mail</button>
      </form>
      <form className="stack" onSubmit={agir(() => changePassword(senha, confirmacao), "Senha alterada.")} noValidate>
        <CampoSenhaNova rotulo="Nova senha" senha={senha} confirmacao={confirmacao} onSenha={setSenha} onConfirmacao={setConfirmacao}
          erroSenha={campos.password} erroConfirmacao={campos.password_confirm} />
        <button className="btn btn-ghost btn-block" disabled={!senha}>Alterar senha</button>
      </form>
      {msg.ok && <p className="msg ok" role="status">{msg.ok}</p>}
      {msg.err && <p className="msg err" role="alert">{msg.err}</p>}
    </section>
  );
}
