// Lançamento: a mesma informação e o mesmo comportamento de public/admin/lancamento/index.html, só com componentes do
// Design System Dani Moscatelli:
// - CabecalhoDaPagina (Opção A) com as abas Novas e Notificadas (Tabs do DS, com o número em Badge);
// - Input de busca com Label só para leitores de tela;
// - CardComCabecalho: a lista da aba, com o botão "Disparar lançamento" na ação do cabeçalho (só na aba Novas);
// - LinhaDeLista + IconeComBase + ChipDeEstado ("Avisado em …", tom sucesso) em cada cadastro;
// - PainelDeEmail (SidePanel) para escrever, pré-visualizar e enviar; PerguntaDeConfirmação (AlertDialog) antes do envio;
// - Toaster (sonner) com o resultado; Alert no erro; Skeleton no carregamento.
import * as React from "react";
import { toast } from "sonner";
import { CircleAlert, Rocket } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChipDeEstado } from "@/components/ui/chip-de-estado";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinhaDeLista } from "@/components/ui/linha-de-lista";
import { CabecalhoDaPagina } from "@/components/ui/painel-cabecalho";
import { CardComCabecalho, IconeComBase } from "@/components/ui/painel-dados";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { registrar, sb } from "@/lib/supabase";
import { plural } from "@/lib/formatar";
import { chamarFuncao, dataHora, usePerguntaDeConfirmacao, Vazio } from "./comum";
import { PainelDeEmail, type CamposDoEmail } from "./email";

export type Cadastro = { id: string; created_at: string; email: string; avisado_em: string | null };
type Aba = "novas" | "avisadas";

/** Texto padrão do lançamento (pode ser editado no painel antes de enviar): o mesmo da página de HTML. */
export const TEXTO_PADRAO: CamposDoEmail = {
  assunto: "Lançamento do site Dani Moscatelli - Experience Design Studio",
  titulo: "Um novo espaço para transformar negócios por meio de experiências.",
  mensagem: [
    "Olá,",
    "É com entusiasmo que compartilho o lançamento do novo site da Dani Moscatelli | Experience Design Studio.",
    "Mais do que uma nova presença digital, este espaço representa um novo capítulo de uma trajetória de mais de 20 anos dedicada a conectar pessoas, estratégia, design e tecnologia.",
    "Um ambiente para compartilhar conhecimentos, apresentar soluções e explorar novas possibilidades de inovação, criando experiências de alto valor para negócios físicos e digitais.",
    "Convido você a conhecer esse novo capítulo e descobrir o que podemos construir juntos.",
  ].join("\n\n"),
};
const EXEMPLOS: CamposDoEmail = {
  assunto: "Ex.: Lançamento do site Dani Moscatelli - Experience Design Studio",
  titulo: "Ex.: O novo site do estúdio está no ar!",
  mensagem: "Escreva a mensagem do lançamento. Deixe uma linha em branco para separar os parágrafos.",
};

/** Linhas da aba, já com a busca aplicada, e o texto do estado vazio (as mesmas regras da página de HTML). */
export function linhasDaAba(todas: Cadastro[], aba: Aba, busca: string) {
  const daAba = todas.filter((r) => (aba === "novas") === !r.avisado_em);
  const q = busca.trim().toLowerCase();
  const linhas = q ? daAba.filter((r) => r.email.toLowerCase().includes(q)) : daAba;
  const vazio = q ? "Nenhum e-mail encontrado."
    : aba === "novas" ? (todas.length ? "Todas as pessoas já foram notificadas." : "Ninguém se cadastrou para o lançamento ainda.")
    : "Ninguém foi notificado ainda.";
  return { daAba, linhas, vazio };
}

export function resumoDoLancamento(todas: Cadastro[]) {
  const avisadas = todas.filter((r) => r.avisado_em).length;
  return plural(todas.length, "pessoa cadastrada", "pessoas cadastradas") + " para o aviso de lançamento" + (avisadas ? " · " + plural(avisadas, "já avisada", "já avisadas") : "");
}

function Linha({ r }: { r: Cadastro }) {
  return (
    <li>
      <LinhaDeLista
        as="a" href={"mailto:" + r.email} className="px-5 sm:px-6" data-avisado={r.avisado_em ? "" : undefined}
        inicio={<IconeComBase tom={r.avisado_em ? "neutro" : "marca"} redonda><Rocket /></IconeComBase>}
        titulo={<span className="[overflow-wrap:anywhere]">{r.email}</span>}
        descricao={"Cadastrado em " + dataHora(r.created_at)}
        fim={r.avisado_em ? <ChipDeEstado tom="sucesso">Avisado em {dataHora(r.avisado_em)}</ChipDeEstado> : undefined}
      />
    </li>
  );
}

export function Lancamento() {
  const [todas, setTodas] = React.useState<Cadastro[] | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [aba, setAba] = React.useState<Aba>("novas");
  const [busca, setBusca] = React.useState("");
  const [aberto, setAberto] = React.useState(false);
  const [email, setEmail] = React.useState<CamposDoEmail>(TEXTO_PADRAO);
  const { pedir, elemento: confirmacao } = usePerguntaDeConfirmacao();

  const carregar = React.useCallback(async () => {
    const { data, error } = await sb.from("notificacoes_lancamento").select("id, created_at, email, avisado_em").order("created_at", { ascending: false });
    if (error) return setErro("Não foi possível carregar a lista: " + error.message);
    setErro(null);
    setTodas((data || []) as Cadastro[]);
  }, []);
  React.useEffect(() => {
    document.title = "Lançamento | Área restrita";
    void carregar();
  }, [carregar]);

  const lista = todas || [];
  const pendentes = lista.filter((r) => !r.avisado_em).length;
  const avisadas = lista.length - pendentes;
  const { daAba, linhas, vazio } = linhasDaAba(lista, aba, busca);

  const enviar = async (v: CamposDoEmail) => {
    const ok = await pedir({ titulo: "Enviar o lançamento?", mensagem: `O e-mail “${v.assunto}” será enviado para ${plural(pendentes, "pessoa.", "pessoas.")} Essa ação não pode ser desfeita.`, ok: "Enviar em massa" });
    if (!ok) return;
    const r = await chamarFuncao<{ enviados: number; falhas: number }>("lancamento", { acao: "enviar", ...v });
    if (r.error) return r.error;
    await registrar("Disparou o e-mail de lançamento", plural(r.enviados, "enviado", "enviados") + (r.falhas ? ", " + plural(r.falhas, "não enviado", "não enviados") : "") + `. Assunto: "${v.assunto}"`);
    setAberto(false);
    await carregar();
    if (r.falhas) toast.warning(`${r.enviados} enviados e ${r.falhas} não enviados. Tente de novo para quem ficou sem o check.`);
    else toast.success(r.enviados === 1 ? "Lançamento enviado para 1 pessoa." : `Lançamento enviado para ${r.enviados} pessoas.`);
  };

  const abas = (
    <TabsList aria-label="Cadastros do lançamento">
      <TabsTrigger value="novas">Novas <Badge variant="outline" data-n="novas">{pendentes}</Badge></TabsTrigger>
      <TabsTrigger value="avisadas">Notificadas <Badge variant="outline" data-n="avisadas">{avisadas}</Badge></TabsTrigger>
    </TabsList>
  );

  return (
    <Tabs value={aba} onValueChange={(v) => setAba(v as Aba)} className="grid gap-6">
      <CabecalhoDaPagina titulo="Lançamento" descricao={todas ? resumoDoLancamento(lista) : undefined} abas={abas} />

      {erro && (
        <Alert variant="error">
          <CircleAlert aria-hidden />
          <AlertTitle>Não foi possível carregar</AlertTitle>
          <AlertDescription>{erro} Recarregue a página para tentar de novo.</AlertDescription>
        </Alert>
      )}

      <div className="grid max-w-md gap-2">
        <Label htmlFor="busca-lancamento" className="sr-only">Buscar e-mail</Label>
        {/* Campo simples do DS: o DS ainda não tem o campo de busca com ícone (FALTA NO DS: CampoDeBusca). */}
        <Input id="busca-lancamento" type="search" placeholder="Buscar e-mail" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {!todas && !erro ? (
        <Skeleton aria-busy="true" aria-label="Carregando a lista" className="h-80 rounded-xl" />
      ) : todas && (["novas", "avisadas"] as Aba[]).map((valor) => valor !== aba ? <TabsContent key={valor} value={valor} forceMount /> : (
        <TabsContent key={valor} value={valor} forceMount>
        <CardComCabecalho
          idDoTitulo="h-lista" sangria tom={aba === "novas" ? "marca" : "neutro"} icone={<Rocket />}
          titulo={aba === "novas" ? "Aguardando o aviso" : "Já notificadas"}
          descricao={aba === "novas" ? plural(daAba.length, "pessoa aguardando o aviso", "pessoas aguardando o aviso") : plural(daAba.length, "pessoa avisada", "pessoas avisadas")}
          acao={aba === "novas" && daAba.length > 0 && (
            <Button type="button" onClick={() => setAberto(true)} disabled={!pendentes}>
              <Rocket aria-hidden />
              Disparar lançamento
            </Button>
          )}
          className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300"
        >
          {linhas.length ? <ul aria-live="polite">{linhas.map((r) => <Linha key={r.id} r={r} />)}</ul> : <Vazio className="px-5 pb-2 sm:px-6">{vazio}</Vazio>}
        </CardComCabecalho>
        </TabsContent>
      ))}

      <PainelDeEmail
        aberto={aberto} mudar={setAberto} titulo="Disparar lançamento"
        descricao={"O e-mail vai para " + (pendentes === 1 ? "1 pessoa que ainda não foi avisada." : pendentes + " pessoas que ainda não foram avisadas.")}
        valores={email} aoMudar={setEmail} exemplos={EXEMPLOS}
        dica={"O e-mail já leva a logo, um botão “Conhecer o novo site” e a sua assinatura."}
        rotuloEnviar="Enviar em massa" iconeEnviar={<Rocket aria-hidden />}
        previa={(v) => chamarFuncao<{ html: string }>("lancamento", { acao: "preview", ...v })}
        enviar={enviar}
      />
      {confirmacao}
    </Tabs>
  );
}
