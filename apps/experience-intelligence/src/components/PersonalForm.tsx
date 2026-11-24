"use client";
// Dados pessoais da pessoa responsável (D-025). Três usos:
//   cadastro: cria a conta (e-mail e senha) com os dados pessoais;
//   completar: conta antiga sem perfil informa os dados antes de seguir;
//   editar: "Meus dados".
// Sem CPF e sem data de nascimento (P-007): maioridade declarada e aceite do aviso de privacidade, com versão.
// Campos do design system (src/design-system), com os mesmos padrões dos formulários do site.
import { useState } from "react";
import Link from "next/link";
import { MailCheck, UserRound } from "lucide-react";
import { FieldErrors, resendConfirmation, saveMyProfile, signUpWithProfile, type MyProfile } from "@/application/profile";
import { mensagemDeErro } from "@/application/errors";
import { formatarTelefone } from "@/domain/profile/personal";
import { AVISO_TITULO } from "@/domain/privacy/aviso";
import { Ajuda, BotaoLink, CampoConfirmacao, CampoEmail, CampoEstadoCidade, CampoSenhaNova, CampoTelefone, CampoTexto, Janela, TituloEtapa } from "@/design-system/campos";
import { classeLink } from "@/design-system/classes";
import { Button } from "@/components/ui/button";
import { Selo } from "@/components/ui/selo";
import { Cartao, Lead, Mensagem, TituloCard } from "./Shell";
import { AvisoPrivacidade } from "./AvisoPrivacidade";
import { useSession } from "./session";

type Modo = "cadastro" | "completar" | "editar";

export function PersonalForm({ modo, perfil, email: emailConta }: { modo: Modo; perfil?: MyProfile | null; email?: string }) {
  const { reload } = useSession();
  const [v, setV] = useState({
    full_name: perfil?.full_name ?? "", state: perfil?.state ?? "",
    city: perfil?.city ?? "", phone: perfil ? formatarTelefone(perfil.phone) : "", email: "", password: "", password_confirm: "",
  });
  const [aceites, setAceites] = useState({ adult_declared: false, privacy_accepted: false });
  const [avisoAberto, setAvisoAberto] = useState(false);
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
        const entrou = await signUpWithProfile({ ...v, ...aceites });
        if (!entrou) setConfirmar(v.email.trim().toLowerCase());
      } else {
        await saveMyProfile({ ...v, ...aceites }, modo === "completar");
        await reload();
        if (modo === "editar") setOk("Seus dados foram salvos.");
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
          <TituloEtapa icone={<UserRound size={22} />}>Seus dados</TituloEtapa>
          <Lead>{modo === "cadastro"
            ? "Comece pelos seus dados. Depois, você cadastra sua empresa ou negócio. O acesso à plataforma está disponível apenas para pessoas convidadas nesta fase."
            : "Antes de continuar, precisamos de alguns dados da pessoa responsável pela conta."}</Lead>
        </>
      )}
      <Cartao>
      <form className="flex flex-col gap-4" onSubmit={enviar} noValidate>
        <CampoTexto label="Nome completo" value={v.full_name} onChange={atualiza("full_name")} maxLength={120} autoComplete="name" required erro={campos.full_name} />
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
        {modo !== "editar" ? (
          <>
            <CampoConfirmacao checked={aceites.adult_declared} erro={campos.adult_declared}
              onChange={(c) => { setAceites((a) => ({ ...a, adult_declared: c })); limpa("adult_declared"); }}>
              Declaro que tenho 18 anos ou mais.
            </CampoConfirmacao>
            <CampoConfirmacao checked={aceites.privacy_accepted} erro={campos.privacy_accepted}
              onChange={(c) => { setAceites((a) => ({ ...a, privacy_accepted: c })); limpa("privacy_accepted"); }}>
              Li e aceito o <BotaoLink onClick={() => setAvisoAberto(true)}>aviso de privacidade</BotaoLink>.
            </CampoConfirmacao>
            <Ajuda>
              Usamos estado e cidade para entender o perfil dos clientes, de forma agrupada. Não pedimos CPF nem data de nascimento.{" "}
              <BotaoLink onClick={() => setAvisoAberto(true)}>Como usamos seus dados</BotaoLink>
            </Ajuda>
          </>
        ) : perfil ? (
          <Ajuda>
            Você aceitou o <BotaoLink onClick={() => setAvisoAberto(true)}>aviso de privacidade</BotaoLink> (versão {perfil.privacy_notice_version}) em {new Date(perfil.privacy_accepted_at).toLocaleDateString("pt-BR")}.
          </Ajuda>
        ) : null}
        {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
        {ok && <Mensagem tipo="ok">{ok}</Mensagem>}
        <Button type="submit" className="w-full" disabled={enviando}>
          {enviando ? "Salvando…" : modo === "cadastro" ? "Criar conta" : modo === "completar" ? "Continuar" : "Salvar meus dados"}
        </Button>
        {modo === "cadastro" && <p className="m-0 text-center text-[0.9375rem]">Já tem uma conta? <Link href="/" className={classeLink}>Entrar</Link></p>}
      </form>
      </Cartao>
      <Janela titulo={AVISO_TITULO} aberta={avisoAberto} onFechar={() => setAvisoAberto(false)}>
        <AvisoPrivacidade />
      </Janela>
    </>
  );
}

function ConfirmarEmail({ email }: { email: string }) {
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  return (
    <Cartao className="items-stretch">
      <Selo icon={<MailCheck />} tone="primary">Confirme seu e-mail</Selo>
      <TituloCard>Falta só confirmar seu e-mail.</TituloCard>
      <Lead>Enviamos um link de confirmação para <b>{email}</b>. Confirme seu endereço para continuar. Depois, entre com seu e-mail e senha para cadastrar sua empresa ou negócio.</Lead>
      {msg && <Mensagem tipo="ok">{msg}</Mensagem>}
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      <Button type="button" variant="outline" className="w-full" onClick={async () => {
        setMsg(""); setErro("");
        try { await resendConfirmation(email); setMsg("Enviamos o link de novo."); } catch (e) { setErro(/rate|seconds/i.test(String((e as Error).message)) ? "Aguarde alguns minutos antes de solicitar outro e-mail." : mensagemDeErro(e)); }
      }}>Reenviar e-mail de confirmação</Button>
      <Button asChild className="w-full"><Link href="/">Ir para a tela de entrada</Link></Button>
    </Cartao>
  );
}
