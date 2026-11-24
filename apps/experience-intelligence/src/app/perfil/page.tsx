"use client";
// Meus dados (D-025): editar dados pessoais, e-mail e senha.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell, Loading, Voltar, Titulo, Lead, Cartao, TituloCard, Mensagem } from "@/components/Shell";
import { PersonalForm } from "@/components/PersonalForm";
import { useSession } from "@/components/session";
import { changeEmail, changePassword } from "@/application/profile";
import { mensagemDeErro } from "@/application/errors";
import { FieldErrors } from "@/application/profile";
import { CampoEmail, CampoSenhaNova, CampoTexto } from "@/design-system/campos";
import { Button } from "@/components/ui/button";

export default function Perfil() {
  const { loading, session, profile } = useSession();
  const router = useRouter();
  useEffect(() => { if (!loading && !session) router.replace("/"); }, [loading, session, router]);
  if (loading || !session) return <Shell><Loading /></Shell>;
  return (
    <Shell>
      <Voltar href="/">← Seus desafios</Voltar>
      <Titulo>Meus dados</Titulo>
      <Lead>Seus dados pessoais aparecem só para você.</Lead>
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
    <Cartao>
      <TituloCard>Acesso</TituloCard>
      <form className="flex flex-col gap-4" onSubmit={agir(() => changeEmail(novoEmail), "Enviamos um link de confirmação para o novo e-mail. A troca vale depois que você confirmar.")} noValidate>
        <CampoTexto label="E-mail atual" type="email" value={email} onChange={() => {}} disabled readOnly />
        <CampoEmail label="Novo e-mail" value={novoEmail} onChange={setNovoEmail} />
        <Button type="submit" variant="outline" className="w-full" disabled={!novoEmail}>Alterar e-mail</Button>
      </form>
      <form className="flex flex-col gap-4 border-t border-border pt-4" onSubmit={agir(() => changePassword(senha, confirmacao), "Senha alterada.")} noValidate>
        <CampoSenhaNova rotulo="Nova senha" senha={senha} confirmacao={confirmacao} onSenha={setSenha} onConfirmacao={setConfirmacao}
          erroSenha={campos.password} erroConfirmacao={campos.password_confirm} />
        <Button type="submit" variant="outline" className="w-full" disabled={!senha}>Alterar senha</Button>
      </form>
      {msg.ok && <Mensagem tipo="ok">{msg.ok}</Mensagem>}
      {msg.err && <Mensagem tipo="erro">{msg.err}</Mensagem>}
    </Cartao>
  );
}
