"use client";
// Dados pessoais da pessoa responsável (D-025). Três usos:
//   cadastro: cria a conta (e-mail e senha) com os dados pessoais;
//   completar: conta antiga sem perfil informa os dados antes de seguir;
//   editar: "Meus dados" (o CPF aparece mascarado; deixar em branco mantém o atual).
// Campos do design system (src/design-system), com os mesmos padrões dos formulários do site.
import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { FieldErrors, resendConfirmation, saveMyProfile, signUpWithProfile, type MyProfile } from "@/application/profile";
import { mensagemDeErro } from "@/application/errors";
import { formatarCpf, formatarTelefone } from "@/domain/profile/personal";
import { CampoEmail, CampoEstadoCidade, CampoSenhaNova, CampoTelefone, CampoTexto } from "@/design-system/campos";
import { useSession } from "./session";

type Modo = "cadastro" | "completar" | "editar";

export function PersonalForm({ modo, perfil, email: emailConta }: { modo: Modo; perfil?: MyProfile | null; email?: string }) {
  const { reload } = useSession();
  const [v, setV] = useState({
    full_name: perfil?.full_name ?? "", cpf: "", birth_date: perfil?.birth_date ?? "", state: perfil?.state ?? "",
    city: perfil?.city ?? "", phone: perfil ? formatarTelefone(perfil.phone) : "", email: "", password: "", password_confirm: "",
  });
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [confirmar, setConfirmar] = useState<string | null>(null);

  // Ao editar um campo, o erro dele some (o envio confere tudo de novo).
  const limpa = (...ks: string[]) => setCampos((c) => Object.fromEntries(Object.entries(c).filter(([k]) => !ks.includes(k))));
  const atualiza = (k: keyof typeof v) => (valor: string) => { setV((a) => ({ ...a, [k]: valor })); limpa(k); };

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setOk(""); setCampos({}); setEnviando(true);
    try {
      if (modo === "cadastro") {
        const entrou = await signUpWithProfile(v);
        if (!entrou) setConfirmar(v.email.trim().toLowerCase());
      } else {
        await saveMyProfile(v);
        await reload();
        if (modo === "editar") { setOk("Seus dados foram salvos."); setV({ ...v, cpf: "" }); }
      }
    } catch (err) {
      if (err instanceof FieldErrors) setCampos(err.campos);
      else setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  if (confirmar) return <ConfirmarEmail email={confirmar} />;

  return (
    <>
      {modo !== "editar" && (
        <>
          <h2 className="etapa-titulo">Seus dados</h2>
          <p className="lead">{modo === "cadastro"
            ? "Comece pelos seus dados. Depois, você cadastra sua empresa ou negócio. O acesso à plataforma está disponível apenas para pessoas convidadas nesta fase."
            : "Antes de continuar, precisamos de alguns dados da pessoa responsável pela conta."}</p>
        </>
      )}
      <form className="card stack" onSubmit={enviar} noValidate>
        <CampoTexto label="Nome completo" value={v.full_name} onChange={atualiza("full_name")} maxLength={120} autoComplete="name" required erro={campos.full_name} />
        <CampoTexto label="CPF" value={v.cpf} onChange={(x) => atualiza("cpf")(formatarCpf(x))} inputMode="numeric" autoComplete="off"
          placeholder={modo === "editar" && perfil ? perfil.cpf_masked : "000.000.000-00"} required={modo !== "editar"}
          hint={modo === "editar" ? "Deixe em branco para manter o CPF atual." : undefined} erro={campos.cpf} />
        <CampoTexto label="Data de nascimento" type="date" value={v.birth_date} onChange={atualiza("birth_date")} autoComplete="bday" required erro={campos.birth_date} />
        <CampoEstadoCidade uf={v.state} cidade={v.city} erro={campos.state || campos.city}
          onChange={(uf, cidade) => { setV((a) => ({ ...a, state: uf, city: cidade })); limpa("state", "city"); }} />
        <CampoTelefone label="Telefone ou WhatsApp" value={v.phone} onChange={atualiza("phone")} required erro={campos.phone} />
        {modo === "cadastro" ? (
          <>
            <CampoEmail label="E-mail" value={v.email} onChange={atualiza("email")} required erro={campos.email} />
            <CampoSenhaNova senha={v.password} confirmacao={v.password_confirm} onSenha={atualiza("password")} onConfirmacao={atualiza("password_confirm")}
              erroSenha={campos.password} erroConfirmacao={campos.password_confirm} />
          </>
        ) : emailConta ? (
          <CampoTexto label="E-mail" type="email" value={emailConta} onChange={() => {}} disabled readOnly
            hint={modo === "completar" ? "O e-mail da sua conta." : undefined} />
        ) : null}
        <p className="hint" style={{ margin: 0 }}>Usamos o CPF e a data de nascimento para identificar a pessoa responsável pela conta, evitar cadastros duplicados e confirmar a maioridade. Eles não aparecem para outras pessoas.</p>
        {erro && <p className="msg err" role="alert">{erro}</p>}
        {ok && <p className="msg ok" role="status">{ok}</p>}
        <button className="btn btn-primary btn-block" disabled={enviando}>
          {enviando ? "Salvando…" : modo === "cadastro" ? "Criar conta" : modo === "completar" ? "Continuar" : "Salvar meus dados"}
        </button>
        {modo === "cadastro" && <p className="center" style={{ margin: 0 }}>Já tem uma conta? <Link href="/">Entrar</Link></p>}
      </form>
    </>
  );
}

function ConfirmarEmail({ email }: { email: string }) {
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  return (
    <div className="card stack">
      <p className="eyebrow"><MailCheck size={18} aria-hidden="true" /> Confirme seu e-mail</p>
      <h2 style={{ margin: 0 }}>Falta só confirmar seu e-mail.</h2>
      <p className="lead" style={{ margin: 0 }}>Enviamos um link de confirmação para <b>{email}</b>. Confirme seu endereço para continuar. Depois, entre com seu e-mail e senha para cadastrar sua empresa ou negócio.</p>
      {msg && <p className="msg ok" role="status">{msg}</p>}
      {erro && <p className="msg err" role="alert">{erro}</p>}
      <button type="button" className="btn btn-ghost btn-block" onClick={async () => {
        setMsg(""); setErro("");
        try { await resendConfirmation(email); setMsg("Enviamos o link de novo."); } catch (e) { setErro(/rate|seconds/i.test(String((e as Error).message)) ? "Aguarde alguns minutos antes de solicitar outro e-mail." : mensagemDeErro(e)); }
      }}>Reenviar e-mail de confirmação</button>
      <Link href="/" className="btn btn-primary btn-block">Ir para a tela de entrada</Link>
    </div>
  );
}
