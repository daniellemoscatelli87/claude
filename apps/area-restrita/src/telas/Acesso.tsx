// Entrar, definir senha, nova senha e sem acesso: os mesmos fluxos das páginas de HTML, montados só com
// componentes do Design System Dani Moscatelli (Card, Heading, Selo, Label, Input, PasswordInput, PasswordConfirm,
// Checkbox, Button, Alert). O DS ainda não tem o template de autenticação importável (AuthTemplate é só
// demonstração): ver docs/engineering/ADMIN_REACT.md, peças que faltam.
import * as React from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordConfirm, PasswordInput, type PasswordRule } from "@/components/ui/password-field";
import { Selo } from "@/components/ui/selo";
import { armazenamento, registrar, sb } from "@/lib/supabase";
import { CHAVE_SESSAO } from "@/lib/armazenamento";
import { useSessao } from "@/casca/sessao";
import { Mensagem, type Aviso } from "./comum";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEXTOS_SENHA = { mostrar: "Mostrar senha", ocultar: "Ocultar senha" };
/** A regra de hoje para a senha da administradora: 8 caracteres ou mais. */
export const REGRAS_DA_SENHA: PasswordRule[] = [{ id: "tamanho", label: "8 caracteres ou mais", test: (v) => v.length >= 8 }];

export function mensagemDeErro(m: string) {
  if (/rate limit/i.test(m)) return "Muitos e-mails pedidos em pouco tempo. Aguarde alguns minutos e tente de novo.";
  if (/invalid login credentials/i.test(m)) return "E-mail ou senha incorretos.";
  return "Não foi possível concluir: " + m;
}

function Moldura({ titulo, descricao, children }: { titulo: string; descricao: React.ReactNode; children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="gap-3">
          <a href="/" aria-label="Ir para a página inicial" className="mx-auto mb-4 block w-fit">
            <img src="/logo-dm.png" alt="Dani Moscatelli | Experience Design Studio" className="block h-16 w-auto" />
          </a>
          <Selo size="sm" tone="primary" className="w-fit">Área restrita</Selo>
          <Heading level={1} size="section">{titulo}</Heading>
          <CardDescription>{descricao}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}

function Enviar({ ocupado, rotulo, rotuloOcupado }: { ocupado: boolean; rotulo: string; rotuloOcupado: string }) {
  return (
    <Button type="submit" className="w-full" disabled={ocupado} aria-busy={ocupado}>
      {ocupado && <LoaderCircle className="motion-safe:animate-spin" aria-hidden />}
      {ocupado ? rotuloOcupado : rotulo}
    </Button>
  );
}

function Lembrar({ id, marcado, mudar }: { id: string; marcado: boolean; mudar: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={marcado} onCheckedChange={(v) => mudar(v === true)} />
      <Label htmlFor={id}>Permanecer conectado</Label>
    </div>
  );
}

export function Entrar({ emailInicial, aoEsquecer }: { emailInicial: string; aoEsquecer: (email: string) => void }) {
  const [email, setEmail] = React.useState(emailInicial);
  const [senha, setSenha] = React.useState("");
  const [lembrar, setLembrar] = React.useState(true);
  const [ocupado, setOcupado] = React.useState(false);
  const [aviso, setAviso] = React.useState<Aviso>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!EMAIL.test(em) || !senha) return setAviso({ tom: "erro", texto: "Informe o e-mail e a senha." });
    setAviso(null);
    armazenamento.definirLembrar(lembrar);
    setOcupado(true);
    const { error } = await sb.auth.signInWithPassword({ email: em, password: senha });
    setOcupado(false);
    if (error) setAviso({ tom: "erro", texto: mensagemDeErro(error.message) });
    else void registrar("Entrou na área restrita");
  }

  return (
    <Moldura titulo="Entrar" descricao="Use o e-mail e a senha de administrador.">
      <form onSubmit={enviar} noValidate className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="entrar-email">E-mail</Label>
          <Input id="entrar-email" type="email" autoComplete="username" required placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <PasswordInput id="entrar-senha" label="Senha" autoComplete="current-password" required value={senha} onValueChange={setSenha} textos={TEXTOS_SENHA} />
        <Lembrar id="entrar-lembrar" marcado={lembrar} mudar={setLembrar} />
        <Enviar ocupado={ocupado} rotulo="Entrar" rotuloOcupado="Entrando…" />
        <Mensagem aviso={aviso} />
        <Button type="button" variant="link" className="h-auto whitespace-normal" onClick={() => aoEsquecer(email)}>
          Esqueci minha senha ou ainda não tenho senha
        </Button>
      </form>
    </Moldura>
  );
}

export function DefinirSenha({ emailInicial, aoVoltar }: { emailInicial: string; aoVoltar: () => void }) {
  const [email, setEmail] = React.useState(emailInicial);
  const [ocupado, setOcupado] = React.useState(false);
  const [aviso, setAviso] = React.useState<Aviso>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!EMAIL.test(em)) return setAviso({ tom: "erro", texto: "Informe um e-mail válido." });
    setOcupado(true);
    const { error } = await sb.auth.resetPasswordForEmail(em, { redirectTo: location.origin + "/admin/" });
    setOcupado(false);
    if (error) return setAviso({ tom: "erro", texto: mensagemDeErro(error.message) });
    setAviso({ tom: "sucesso", texto: "Pronto! Se este e-mail tiver acesso, enviamos um link para redefinir a senha. Abra o link neste mesmo navegador." });
  }

  return (
    <Moldura titulo="Definir senha" descricao="Enviaremos um link para o e-mail de administrador. Ao abrir o link, você cria uma nova senha.">
      <form onSubmit={enviar} noValidate className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="definir-email">E-mail</Label>
          <Input id="definir-email" type="email" autoComplete="username" required placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Enviar ocupado={ocupado} rotulo="Enviar link" rotuloOcupado="Enviando…" />
        <Mensagem aviso={aviso} />
        <Button type="button" variant="link" onClick={aoVoltar}>
          Voltar para o login
        </Button>
      </form>
    </Moldura>
  );
}

export function NovaSenha() {
  const { concluirNovaSenha } = useSessao();
  const [senha, setSenha] = React.useState("");
  const [confirmacao, setConfirmacao] = React.useState("");
  const [lembrar, setLembrar] = React.useState(true);
  const [ocupado, setOcupado] = React.useState(false);
  const [aviso, setAviso] = React.useState<Aviso>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 8) return setAviso({ tom: "erro", texto: "A senha precisa ter pelo menos 8 caracteres." });
    if (senha !== confirmacao) return setAviso({ tom: "erro", texto: "As senhas não são iguais." });
    setOcupado(true);
    const { error } = await sb.auth.updateUser({ password: senha });
    setOcupado(false);
    if (error) return setAviso({ tom: "erro", texto: mensagemDeErro(error.message) });
    // Regrava a sessão no armazenamento escolhido em "Permanecer conectado".
    armazenamento.definirLembrar(lembrar);
    const { data } = await sb.auth.getSession();
    if (data.session) armazenamento.setItem(CHAVE_SESSAO, JSON.stringify(data.session));
    await concluirNovaSenha();
  }

  return (
    <Moldura titulo="Nova senha" descricao="Crie uma senha com pelo menos 8 caracteres.">
      <form onSubmit={enviar} noValidate className="grid gap-4">
        <PasswordConfirm senha={senha} confirmacao={confirmacao} onSenhaChange={setSenha} onConfirmacaoChange={setConfirmacao} regras={REGRAS_DA_SENHA} textos={{ senha: "Nova senha", confirmar: "Confirme a nova senha" }} />
        <Lembrar id="nova-lembrar" marcado={lembrar} mudar={setLembrar} />
        <Enviar ocupado={ocupado} rotulo="Salvar senha e entrar" rotuloOcupado="Salvando…" />
        <Mensagem aviso={aviso} />
      </form>
    </Moldura>
  );
}

export function SemAcesso() {
  const { perfil, sair } = useSessao();
  return (
    <Moldura titulo="Sem acesso" descricao={<>O e-mail <strong>{perfil.email}</strong> não tem permissão para ver esta área.</>}>
      <Button type="button" variant="outline" onClick={() => void sair()}>
        Sair
      </Button>
    </Moldura>
  );
}
