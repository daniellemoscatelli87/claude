"use client";
// Dados pessoais da pessoa responsável (D-025). Três usos:
//   cadastro: cria a conta (e-mail e senha) com os dados pessoais;
//   completar: conta antiga sem perfil informa os dados antes de seguir;
//   editar: "Meus dados" (o CPF aparece mascarado; deixar em branco mantém o atual).
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, MailCheck, UserRound } from "lucide-react";
import { FieldErrors, resendConfirmation, saveMyProfile, signUpWithProfile, type MyProfile } from "@/application/profile";
import { mensagemDeErro } from "@/application/errors";
import { UFS, formatarCpf, formatarTelefone } from "@/domain/profile/personal";
import { useSession } from "./session";

type Modo = "cadastro" | "completar" | "editar";

export function PersonalForm({ modo, perfil, email: emailConta }: { modo: Modo; perfil?: MyProfile | null; email?: string }) {
  const { reload } = useSession();
  const [v, setV] = useState({
    full_name: perfil?.full_name ?? "", cpf: "", birth_date: perfil?.birth_date ?? "", state: perfil?.state ?? "",
    city: perfil?.city ?? "", phone: perfil ? formatarTelefone(perfil.phone) : "", email: "", password: "",
  });
  const [verSenha, setVerSenha] = useState(false);
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [confirmar, setConfirmar] = useState<string | null>(null);
  // Ao editar um campo, o erro dele some (o envio confere tudo de novo).
  const atualiza = (k: keyof typeof v, valor: string) => {
    setV((a) => ({ ...a, [k]: valor }));
    if (campos[k]) setCampos(({ [k]: _, ...resto }) => resto);
  };
  const muda = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => atualiza(k, e.target.value);

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

  const erroDe = (k: string) => campos[k] ? <span className="campo-erro" id={`erro-${k}`}>{campos[k]}</span> : null;
  const aria = (k: string) => (campos[k] ? { "aria-invalid": true, "aria-describedby": `erro-${k}` } : {});

  return (
    <>
      {modo !== "editar" && (
        <>
          <p className="eyebrow"><UserRound size={18} aria-hidden="true" /> {modo === "cadastro" ? "Crie sua conta" : "Complete seu cadastro"}</p>
          <h1>Seus dados</h1>
          <p className="lead">{modo === "cadastro"
            ? "Comece pelos seus dados. Depois, você cadastra sua empresa ou negócio. O acesso à plataforma está disponível apenas para pessoas convidadas nesta fase."
            : "Antes de continuar, precisamos de alguns dados da pessoa responsável pela conta."}</p>
        </>
      )}
      <form className="card stack" onSubmit={enviar} noValidate>
        <label>Nome completo
          <input value={v.full_name} onChange={muda("full_name")} maxLength={120} autoComplete="name" required {...aria("full_name")} />
          {erroDe("full_name")}
        </label>
        <label>CPF
          <input value={v.cpf} onChange={(e) => atualiza("cpf", formatarCpf(e.target.value))} inputMode="numeric" autoComplete="off"
            placeholder={modo === "editar" && perfil ? perfil.cpf_masked : "000.000.000-00"} required={modo !== "editar"} {...aria("cpf")} />
          {modo === "editar" && <span className="hint">Deixe em branco para manter o CPF atual.</span>}
          {erroDe("cpf")}
        </label>
        <label>Data de nascimento
          <input type="date" value={v.birth_date} onChange={muda("birth_date")} autoComplete="bday" required {...aria("birth_date")} />
          {erroDe("birth_date")}
        </label>
        <div className="linha-2">
          <label>Estado
            <select value={v.state} onChange={muda("state")} required {...aria("state")}>
              <option value="">UF</option>
              {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            {erroDe("state")}
          </label>
          <label>Cidade
            <input value={v.city} onChange={muda("city")} maxLength={80} autoComplete="address-level2" required {...aria("city")} />
            {erroDe("city")}
          </label>
        </div>
        <label>Telefone ou WhatsApp
          <input value={v.phone} onChange={(e) => atualiza("phone", formatarTelefone(e.target.value))} inputMode="tel" autoComplete="tel"
            placeholder="(00) 00000-0000" required {...aria("phone")} />
          {erroDe("phone")}
        </label>
        {modo === "cadastro" ? (
          <>
            <label>E-mail
              <input type="email" value={v.email} onChange={muda("email")} autoComplete="email" required {...aria("email")} />
              {erroDe("email")}
            </label>
            <label>Senha
              <span className="senha">
                <input type={verSenha ? "text" : "password"} value={v.password} onChange={muda("password")} autoComplete="new-password" required minLength={8} {...aria("password")} />
                <button type="button" onClick={() => setVerSenha(!verSenha)} aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}>
                  {verSenha ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                </button>
              </span>
              <span className="hint">Use uma senha segura, com pelo menos 8 caracteres. Ela não será enviada por e-mail.</span>
              {erroDe("password")}
            </label>
          </>
        ) : emailConta ? (
          <label>E-mail
            <input type="email" value={emailConta} disabled readOnly />
            {modo === "completar" && <span className="hint">O e-mail da sua conta.</span>}
          </label>
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
      <h1 style={{ margin: 0 }}>Falta só confirmar seu e-mail.</h1>
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
