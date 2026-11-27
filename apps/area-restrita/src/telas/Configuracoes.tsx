// Configurações: a mesma informação, as mesmas regras e os mesmos textos de public/admin/configuracoes/index.html, só com
// componentes do Design System Dani Moscatelli:
// - CabecalhoDaPagina (Opção A);
// - CardComCabecalho para cada assunto (Dados pessoais, E-mail de acesso, Senha, Gestão de dados, Log da plataforma), com
//   DivisorSuave e o botão no canto inferior direito quando o card tem uma ação (regra dos cards com ação);
// - Avatar + Button (trocar foto) + Button link (voltar à foto padrão) + Input type="file" escondido;
// - Label + Input, PasswordInput e PasswordConfirm (8 caracteres ou mais, a mesma regra da nova senha);
// - LinhaDeLista + IconeComBase nas áreas de dados e no log; PerguntaDeConfirmacao (AlertDialog com a palavra APAGAR);
// - Alert (Mensagem) abaixo de cada ação; Toaster no fim da exclusão; Skeleton no carregamento.
import * as React from "react";
import { toast } from "sonner";
import {
  CalendarCheck, CircleAlert, Database, ImageUp, KeyRound, LoaderCircle, LogOut, Mail, Rocket, ScrollText, Settings, Trash2, UserRound, Users, X, type LucideIcon,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinhaDeLista } from "@/components/ui/linha-de-lista";
import { CabecalhoDaPagina } from "@/components/ui/painel-cabecalho";
import { CardComCabecalho, DivisorSuave, IconeComBase } from "@/components/ui/painel-dados";
import { PasswordConfirm, PasswordInput } from "@/components/ui/password-field";
import { Skeleton } from "@/components/ui/skeleton";
import { registrar, sb } from "@/lib/supabase";
import { iniciais, plural } from "@/lib/formatar";
import { FOTO_PADRAO, useSessao } from "@/casca/sessao";
import { REGRAS_DA_SENHA } from "./Acesso";
import { chamarFuncao, dataHora, Mensagem, usePerguntaDeConfirmacao, Vazio, type Aviso } from "./comum";

const TEXTOS_SENHA = { mostrar: "Mostrar senha", ocultar: "Ocultar senha" };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BUCKET = "/storage/v1/object/public/perfil/";

/** Erros do login traduzidos (os mesmos da página de HTML). */
export function erroAuth(m: string) {
  if (/rate limit/i.test(m)) return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.";
  if (/different from the old/i.test(m)) return "A nova senha precisa ser diferente da atual.";
  if (/already.*registered|already been registered/i.test(m)) return "Esse e-mail já está em uso.";
  return "Não foi possível concluir: " + m;
}

/** Caminho no bucket "perfil" de uma foto enviada (as fotos padrão ficam fora do bucket). */
export const caminhoFoto = (url?: string | null) => ((url || "").includes(BUCKET) ? decodeURIComponent(url!.split(BUCKET)[1].split("?")[0]) : null);

/** Ícone de cada linha do log: o mesmo critério da página de HTML; exclusões na base rosa. */
export function iconeDoLog(acao: string): { icone: LucideIcon; exclusao: boolean } {
  if (/^(Apagou|Excluiu|Cancelou|Descartou)/.test(acao)) return { icone: X, exclusao: true };
  if (/reuni|Meet|Google Agenda/i.test(acao)) return { icone: CalendarCheck, exclusao: false };
  if (/parceir/i.test(acao)) return { icone: Users, exclusao: false };
  if (/lançamento/i.test(acao)) return { icone: Rocket, exclusao: false };
  if (/mensagem|Respondeu/i.test(acao)) return { icone: Mail, exclusao: false };
  if (/^(Entrou|Saiu)/.test(acao)) return { icone: LogOut, exclusao: false };
  return { icone: Settings, exclusao: false };
}

/** Recorta no centro e reduz para 320 × 320 em WebP antes de enviar (como a página de HTML). */
function prepararFoto(file: File) {
  return new Promise<Blob>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const lado = Math.min(img.naturalWidth, img.naturalHeight);
      const c = document.createElement("canvas");
      c.width = c.height = 320;
      c.getContext("2d")!.drawImage(img, (img.naturalWidth - lado) / 2, (img.naturalHeight - lado) / 2, lado, lado, 0, 0, 320, 320);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? resolve(b) : reject()), "image/webp", 0.9);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(); };
    img.src = url;
  });
}

/** Barra de ação no fim do card: divisor suave e o botão no canto inferior direito. */
function AcaoDoCard({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DivisorSuave className="my-5" />
      <div className="flex flex-wrap items-center justify-end gap-2">{children}</div>
    </>
  );
}

function BotaoDeEnviar({ ocupado, rotulo, rotuloOcupado }: { ocupado: boolean; rotulo: string; rotuloOcupado: string }) {
  return (
    <Button type="submit" disabled={ocupado}>
      {ocupado && <LoaderCircle aria-hidden className="motion-safe:animate-spin" />}
      {ocupado ? rotuloOcupado : rotulo}
    </Button>
  );
}

/* ---------- Dados pessoais ---------- */
function DadosPessoais() {
  const { perfil } = useSessao();
  const [aviso, setAviso] = React.useState<Aviso>(null);
  const [avisoNome, setAvisoNome] = React.useState<Aviso>(null);
  const [nome, setNome] = React.useState(perfil.nome);
  const [enviandoFoto, setEnviandoFoto] = React.useState(false);
  const [salvando, setSalvando] = React.useState(false);
  React.useEffect(() => setNome(perfil.nome), [perfil.nome]);

  const trocarFoto = async (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return setAviso({ tom: "erro", texto: "Use uma imagem PNG, JPG ou WebP." });
    setEnviandoFoto(true);
    setAviso(null);
    let blob: Blob;
    try {
      blob = await prepararFoto(file);
    } catch {
      setEnviandoFoto(false);
      return setAviso({ tom: "erro", texto: "Não foi possível ler a imagem. Tente outra." });
    }
    const antiga = caminhoFoto(perfil.foto);
    const caminho = "avatar-" + Date.now() + ".webp";
    const { error: erroEnvio } = await sb.storage.from("perfil").upload(caminho, blob, { contentType: "image/webp", upsert: false });
    if (erroEnvio) { setEnviandoFoto(false); return setAviso({ tom: "erro", texto: "Não foi possível enviar a foto: " + erroEnvio.message }); }
    const url = sb.storage.from("perfil").getPublicUrl(caminho).data.publicUrl;
    const { error } = await sb.auth.updateUser({ data: { avatar_url: url } });
    setEnviandoFoto(false);
    if (error) { await sb.storage.from("perfil").remove([caminho]); return setAviso({ tom: "erro", texto: erroAuth(error.message) }); }
    if (antiga) await sb.storage.from("perfil").remove([antiga]);
    setAviso({ tom: "sucesso", texto: "Foto atualizada." });
    await registrar("Alterou a foto do perfil");
  };
  const voltarAoPadrao = async () => {
    const antiga = caminhoFoto(perfil.foto);
    const { error } = await sb.auth.updateUser({ data: { avatar_url: null } });
    if (error) return setAviso({ tom: "erro", texto: erroAuth(error.message) });
    if (antiga) await sb.storage.from("perfil").remove([antiga]);
    setAviso({ tom: "sucesso", texto: "A foto padrão voltou a ser usada." });
    await registrar("Voltou à foto padrão do perfil");
  };
  const salvarNome = async (e: React.FormEvent) => {
    e.preventDefault();
    const novo = nome.trim().replace(/\s+/g, " ");
    if (novo.length < 2) return setAvisoNome({ tom: "erro", texto: "Informe o nome." });
    const antes = perfil.nome;
    if (novo === antes) return setAvisoNome({ tom: "sucesso", texto: "Nenhuma alteração para salvar." });
    setSalvando(true);
    const { error } = await sb.auth.updateUser({ data: { nome: novo } });
    setSalvando(false);
    if (error) return setAvisoNome({ tom: "erro", texto: erroAuth(error.message) });
    setAvisoNome({ tom: "sucesso", texto: "Nome atualizado." });
    await registrar("Alterou o nome do perfil", antes + " para " + novo);
  };

  return (
    <CardComCabecalho idDoTitulo="h-perfil" icone={<UserRound />} titulo="Dados pessoais" descricao="Nome e foto aparecem no cabeçalho da área restrita.">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="size-20">
          <AvatarImage src={perfil.foto} alt={perfil.nome} className="object-cover" />
          <AvatarFallback>{iniciais(perfil.nome)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" disabled={enviandoFoto} onClick={() => document.getElementById("foto-arquivo")?.click()}>
            {enviandoFoto ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : <ImageUp aria-hidden />}
            {enviandoFoto ? "Enviando…" : "Trocar foto"}
          </Button>
          {perfil.foto !== FOTO_PADRAO && (
            <Button type="button" variant="link" className="px-2" onClick={() => void voltarAoPadrao()}>Voltar à foto padrão</Button>
          )}
          <Input id="foto-arquivo" type="file" accept="image/png,image/jpeg,image/webp" className="hidden" tabIndex={-1} aria-hidden
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; void trocarFoto(f); }} />
        </div>
      </div>
      <Mensagem aviso={aviso} className="mt-4 empty:hidden" />
      <form onSubmit={salvarNome} noValidate className="mt-6 grid gap-4">
        <div className="grid max-w-xl gap-2">
          <Label htmlFor="cfg-nome">Nome</Label>
          <Input id="cfg-nome" maxLength={80} autoComplete="name" value={nome} onChange={(e) => { setNome(e.target.value); setAvisoNome(null); }} />
          <Mensagem aviso={avisoNome} className="mt-2 empty:hidden" />
        </div>
        <AcaoDoCard><BotaoDeEnviar ocupado={salvando} rotulo="Salvar nome" rotuloOcupado="Salvando…" /></AcaoDoCard>
      </form>
    </CardComCabecalho>
  );
}

/** Confere a senha atual antes de trocar e-mail ou senha. */
async function senhaConfere(email: string, senha: string) {
  const { error } = await sb.auth.signInWithPassword({ email, password: senha });
  return !error;
}

function EmailDeAcesso() {
  const { perfil } = useSessao();
  const [novo, setNovo] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [aviso, setAviso] = React.useState<Aviso>(null);
  const [ocupado, setOcupado] = React.useState(false);
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = novo.trim().toLowerCase();
    if (!EMAIL.test(email)) return setAviso({ tom: "erro", texto: "Informe um e-mail válido." });
    if (email === perfil.email) return setAviso({ tom: "erro", texto: "Esse já é o seu e-mail de acesso." });
    if (!senha) return setAviso({ tom: "erro", texto: "Informe a sua senha atual." });
    setOcupado(true);
    setAviso(null);
    if (!(await senhaConfere(perfil.email, senha))) { setOcupado(false); return setAviso({ tom: "erro", texto: "Senha atual incorreta." }); }
    const { error } = await sb.auth.updateUser({ email }, { emailRedirectTo: location.origin + "/admin/configuracoes/" });
    setOcupado(false);
    if (error) return setAviso({ tom: "erro", texto: erroAuth(error.message) });
    setNovo("");
    setSenha("");
    setAviso({ tom: "sucesso", texto: `Enviamos um link de confirmação para ${email}. Se chegar um link também no e-mail atual, confirme os dois. Até lá, continue entrando com o e-mail atual.` });
    await registrar("Pediu a troca do e-mail de acesso", perfil.email + " para " + email);
  };
  return (
    <CardComCabecalho idDoTitulo="h-email" icone={<Mail />} titulo="E-mail de acesso" descricao="O e-mail que você usa para entrar na área restrita.">
      <form onSubmit={enviar} noValidate className="grid gap-4">
        <div className="grid max-w-xl gap-4">
          <div className="grid gap-2">
            <Label htmlFor="cfg-email-atual">E-mail atual</Label>
            <Input id="cfg-email-atual" type="email" value={perfil.email} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cfg-email-novo">Novo e-mail</Label>
            <Input id="cfg-email-novo" type="email" autoComplete="email" placeholder="seu@email.com" value={novo} onChange={(e) => { setNovo(e.target.value); setAviso(null); }} />
          </div>
          <PasswordInput id="cfg-email-senha" label="Senha atual" autoComplete="current-password" value={senha} onValueChange={(v) => { setSenha(v); setAviso(null); }} textos={TEXTOS_SENHA} describedBy="cfg-email-dica" />
          <p id="cfg-email-dica" className="text-body-sm text-muted-foreground">A troca só vale depois que você confirmar pelo link enviado por e-mail. Os avisos do site (novas mensagens e cadastros) continuam indo para contato@danimoscatelli.com.br.</p>
          <Mensagem aviso={aviso} className="empty:hidden" />
        </div>
        <div>
          <AcaoDoCard><BotaoDeEnviar ocupado={ocupado} rotulo="Alterar e-mail" rotuloOcupado="Alterando…" /></AcaoDoCard>
        </div>
      </form>
    </CardComCabecalho>
  );
}

function Senha() {
  const { perfil } = useSessao();
  const [atual, setAtual] = React.useState("");
  const [nova, setNova] = React.useState("");
  const [conf, setConf] = React.useState("");
  const [aviso, setAviso] = React.useState<Aviso>(null);
  const [ocupado, setOcupado] = React.useState(false);
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!atual) return setAviso({ tom: "erro", texto: "Informe a sua senha atual." });
    if (nova.length < 8) return setAviso({ tom: "erro", texto: "A nova senha precisa ter pelo menos 8 caracteres." });
    if (nova !== conf) return setAviso({ tom: "erro", texto: "As senhas novas não são iguais." });
    setOcupado(true);
    setAviso(null);
    if (!(await senhaConfere(perfil.email, atual))) { setOcupado(false); return setAviso({ tom: "erro", texto: "Senha atual incorreta." }); }
    const { error } = await sb.auth.updateUser({ password: nova });
    setOcupado(false);
    if (error) return setAviso({ tom: "erro", texto: erroAuth(error.message) });
    setAtual("");
    setNova("");
    setConf("");
    setAviso({ tom: "sucesso", texto: "Senha alterada." });
    await registrar("Alterou a senha de acesso");
  };
  return (
    <CardComCabecalho idDoTitulo="h-senha" icone={<KeyRound />} titulo="Senha" descricao="Pelo menos 8 caracteres.">
      <form onSubmit={enviar} noValidate className="grid gap-4">
        <div className="grid max-w-xl gap-4">
          {/* nome de usuário escondido, para o gerenciador de senhas associar a senha nova à conta certa */}
          <Input type="email" autoComplete="username" value={perfil.email} readOnly className="hidden" tabIndex={-1} aria-hidden />
          <PasswordInput id="cfg-senha-atual" label="Senha atual" autoComplete="current-password" value={atual} onValueChange={(v) => { setAtual(v); setAviso(null); }} textos={TEXTOS_SENHA} />
          <PasswordConfirm senha={nova} confirmacao={conf} onSenhaChange={(v) => { setNova(v); setAviso(null); }} onConfirmacaoChange={(v) => { setConf(v); setAviso(null); }} regras={REGRAS_DA_SENHA} textos={{ senha: "Nova senha", confirmar: "Repita a nova senha" }} />
          <Mensagem aviso={aviso} className="empty:hidden" />
        </div>
        {/* O PasswordConfirm reserva uma linha (20 px + 4) para "As senhas coincidem": o divisor sobe o mesmo tanto, para
            ficar à mesma distância do último campo que nos outros cards. */}
        <div className="-mt-6">
          <AcaoDoCard><BotaoDeEnviar ocupado={ocupado} rotulo="Alterar senha" rotuloOcupado="Alterando…" /></AcaoDoCard>
        </div>
      </form>
    </CardComCabecalho>
  );
}

/* ---------- Gestão de dados ---------- */
export type Contagem = { contatos: number; reunioes: number; parceiros: number; lancamento: number };
export const AREAS: { id: "contatos" | "parceiros" | "lancamento"; nome: string; icone: LucideIcon; desc: (c: Contagem) => string; vazia: (c: Contagem) => boolean; msg: string }[] = [
  {
    id: "contatos", nome: "Contatos", icone: Mail, desc: (c) => plural(c.contatos, "mensagem", "mensagens") + " e " + plural(c.reunioes, "reunião", "reuniões"), vazia: (c) => !c.contatos && !c.reunioes,
    msg: "Todas as mensagens de contato, respostas, e-mails recebidos, anexos e reuniões serão apagados definitivamente. As reuniões são removidas do Google Agenda sem avisar os convidados.",
  },
  {
    id: "parceiros", nome: "Parceiros", icone: Users, desc: (c) => plural(c.parceiros, "cadastro", "cadastros") + " na Rede de Parceiros", vazia: (c) => !c.parceiros,
    msg: "Todos os cadastros da Rede de Parceiros e as análises de IA serão apagados definitivamente.",
  },
  {
    id: "lancamento", nome: "Lançamento", icone: Rocket, desc: (c) => plural(c.lancamento, "e-mail cadastrado", "e-mails cadastrados") + " para o aviso de lançamento", vazia: (c) => !c.lancamento,
    msg: "Todos os e-mails cadastrados para o aviso de lançamento (avisados ou não) serão apagados definitivamente.",
  },
];

function GestaoDeDados({ aoApagar }: { aoApagar: () => void }) {
  const [contagem, setContagem] = React.useState<Contagem | null>(null);
  const [aviso, setAviso] = React.useState<Aviso>(null);
  const [apagando, setApagando] = React.useState<string | null>(null);
  const { pedir, elemento } = usePerguntaDeConfirmacao();
  const carregar = React.useCallback(async () => {
    const c = await chamarFuncao<Contagem>("admin-dados", { acao: "contagem" });
    if (c.error) return setAviso({ tom: "erro", texto: c.error });
    setContagem(c);
  }, []);
  React.useEffect(() => { void carregar(); }, [carregar]);

  const apagar = async (a: (typeof AREAS)[number]) => {
    const ok = await pedir({ titulo: "Apagar todos os dados de " + a.nome + "?", mensagem: a.msg + " Essa ação é definitiva e não pode ser desfeita. Deseja realmente continuar?", ok: "Apagar tudo", destrutiva: true, palavra: "APAGAR" });
    if (!ok) return;
    setApagando(a.id);
    setAviso(null);
    const r = await chamarFuncao<{ total?: number; avisoGoogle?: boolean }>("admin-dados", { acao: "apagar", area: a.id });
    setApagando(null);
    if (r.error) return setAviso({ tom: "erro", texto: r.error });
    toast.success("Dados de " + a.nome + " apagados" + (r.total ? " (" + plural(r.total, "registro", "registros") + ")." : "."));
    if (r.avisoGoogle) setAviso({ tom: "erro", texto: "Algumas reuniões não puderam ser removidas do Google Agenda. Confira a sua agenda." });
    await carregar();
    aoApagar();
  };

  return (
    <CardComCabecalho idDoTitulo="h-dados" icone={<Database />} titulo="Gestão de dados" descricao="Apaga definitivamente todos os registros de uma área, sem precisar entrar no banco de dados." sangria>
      {contagem ? (
        <ul>
          {AREAS.map((a) => {
            const Icone = a.icone;
            return (
              <li key={a.id}>
                <LinhaDeLista
                  className="px-5 sm:px-6" alinhar="centro" data-area={a.id}
                  inicio={<IconeComBase tom="neutro" redonda><Icone /></IconeComBase>}
                  titulo={a.nome} descricao={a.desc(contagem)}
                  fim={
                    // Exclusão em contorno do DS; o vermelho cheio fica na confirmação, que pede a palavra APAGAR.
                    <Button type="button" variant="exclusao-contorno" disabled={a.vazia(contagem) || apagando === a.id} onClick={() => void apagar(a)} aria-label={"Apagar todos os dados de " + a.nome}>
                      {apagando === a.id ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : <Trash2 aria-hidden />}
                      {apagando === a.id ? "Apagando…" : "Apagar tudo"}
                    </Button>
                  }
                />
              </li>
            );
          })}
        </ul>
      ) : !aviso && <Skeleton aria-busy="true" aria-label="Carregando as áreas" className="mx-5 h-40 rounded-lg sm:mx-6" />}
      <Mensagem aviso={aviso} className="px-5 pt-2 empty:hidden sm:px-6" />
      {elemento}
    </CardComCabecalho>
  );
}

/* ---------- Log da plataforma ---------- */
export const PAGINA_DO_LOG = 30;
type Registro = { id: string; created_at: string; acao: string; detalhe: string | null };

function LogDaPlataforma({ versao }: { versao: number }) {
  const [log, setLog] = React.useState<Registro[] | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [mais, setMais] = React.useState(false);
  const [carregando, setCarregando] = React.useState(false);
  const carregar = React.useCallback(async (de: number, antes: Registro[]) => {
    setCarregando(true);
    const { data, error } = await sb.from("admin_log").select("id, created_at, acao, detalhe").order("created_at", { ascending: false }).range(de, de + PAGINA_DO_LOG - 1);
    setCarregando(false);
    if (error) return setErro("Não foi possível carregar o log: " + error.message);
    setErro(null);
    setLog([...antes, ...((data || []) as Registro[])]);
    setMais((data || []).length >= PAGINA_DO_LOG);
  }, []);
  React.useEffect(() => { void carregar(0, []); }, [carregar, versao]);

  return (
    <CardComCabecalho idDoTitulo="h-log" icone={<ScrollText />} titulo="Log da plataforma" descricao="Ações feitas na área restrita, da mais recente para a mais antiga." tom="neutro" sangria>
      {erro && (
        <div className="px-5 sm:px-6">
          <Alert variant="error"><CircleAlert aria-hidden /><AlertDescription>{erro}</AlertDescription></Alert>
        </div>
      )}
      {!log && !erro && <Skeleton aria-busy="true" aria-label="Carregando o log" className="mx-5 h-60 rounded-lg sm:mx-6" />}
      {log && (log.length ? (
        <ul data-lista="log">
          {log.map((r) => {
            const { icone: Icone, exclusao } = iconeDoLog(r.acao);
            return (
              <li key={r.id}>
                <LinhaDeLista
                  className="px-5 sm:px-6" data-exclusao={exclusao ? "" : undefined}
                  inicio={<IconeComBase tom={exclusao ? "marca" : "neutro"} redonda tamanho="sm"><Icone /></IconeComBase>}
                  titulo={<span className="[overflow-wrap:anywhere]">{r.acao}</span>}
                  descricao={r.detalhe ? <span className="[overflow-wrap:anywhere]">{r.detalhe}</span> : undefined}
                >
                  <span className="mt-0.5 block text-body-sm text-muted-foreground tabular-nums">{dataHora(r.created_at)}</span>
                </LinhaDeLista>
              </li>
            );
          })}
        </ul>
      ) : <Vazio className="px-5 sm:px-6" icone={<ScrollText />}>Nenhuma ação registrada ainda.</Vazio>)}
      {mais && (
        <div className="flex justify-center px-5 pt-4 sm:px-6">
          <Button type="button" variant="outline" disabled={carregando} onClick={() => void carregar(log?.length || 0, log || [])}>
            {carregando && <LoaderCircle aria-hidden className="motion-safe:animate-spin" />}
            Carregar mais
          </Button>
        </div>
      )}
    </CardComCabecalho>
  );
}

export function Configuracoes() {
  const [versaoDoLog, setVersaoDoLog] = React.useState(0);
  React.useEffect(() => { document.title = "Configurações | Área restrita"; }, []);
  return (
    <div className="grid gap-6">
      <CabecalhoDaPagina titulo="Configurações" descricao="Seus dados, a gestão dos dados da plataforma e o log de ações." />
      <div className="grid gap-6 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300">
        <DadosPessoais />
        <EmailDeAcesso />
        <Senha />
        <GestaoDeDados aoApagar={() => setVersaoDoLog((v) => v + 1)} />
        <LogDaPlataforma versao={versaoDoLog} />
      </div>
    </div>
  );
}
