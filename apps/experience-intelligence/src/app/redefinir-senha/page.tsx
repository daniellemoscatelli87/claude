"use client";
// Nova senha, aberta pelo link do e-mail. O Supabase lê o link e cria a sessão de recuperação; sem ela, o link
// expirou ou já foi usado. Sem medição de acessos aqui (o endereço do link leva um token).
import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell, Loading } from "@/components/Shell";
import { useSession } from "@/components/session";
import { CampoSenhaNova } from "@/design-system/campos";
import { changePassword, FieldErrors } from "@/application/profile";
import { mensagemDeErro } from "@/application/errors";

export default function RedefinirSenha() {
  const { loading, session } = useSession();
  const [esperou, setEsperou] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // O link chega com o token no endereço; dá um instante para o Supabase concluir a leitura.
  useEffect(() => { const t = setTimeout(() => setEsperou(true), 1500); return () => clearTimeout(t); }, []);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setCampos({}); setEnviando(true);
    try {
      await changePassword(senha, confirmacao);
      setOk(true);
    } catch (err) {
      if (err instanceof FieldErrors) setCampos(err.campos);
      else setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  if (loading || (!session && !esperou)) return <Shell><Loading /></Shell>;

  if (!session) {
    return (
      <Shell>
        <h1>Criar nova senha</h1>
        <div className="card stack">
          <p className="msg err" role="alert">O link expirou ou já foi usado. Peça um novo link para criar sua senha.</p>
          <Link href="/recuperar-senha/" className="btn btn-primary btn-block">Pedir novo link</Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1>Criar nova senha</h1>
      {ok ? (
        <div className="card stack">
          <p className="msg ok" role="status">Sua senha foi alterada.</p>
          <Link href="/" className="btn btn-primary btn-block">Ir para a plataforma</Link>
        </div>
      ) : (
        <form className="card stack" onSubmit={enviar} noValidate>
          <CampoSenhaNova rotulo="Nova senha" senha={senha} confirmacao={confirmacao}
            onSenha={(v) => { setSenha(v); setCampos(({ password: _, ...r }) => r); }}
            onConfirmacao={(v) => { setConfirmacao(v); setCampos(({ password_confirm: _, ...r }) => r); }}
            erroSenha={campos.password} erroConfirmacao={campos.password_confirm} />
          {erro && <p className="msg err" role="alert">{erro}</p>}
          <button className="btn btn-primary btn-block" disabled={enviando}>{enviando ? "Salvando…" : "Salvar nova senha"}</button>
        </form>
      )}
    </Shell>
  );
}
