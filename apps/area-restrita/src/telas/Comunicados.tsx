// Comunicados: a mesma informação, os mesmos filtros, as mesmas regras e os mesmos textos de
// public/admin/comunicados/index.html, só com componentes do Design System Dani Moscatelli:
// - CabecalhoDaPagina (Opção A);
// - filtros: Label + Input (busca) e Select (cargo / área de atuação, segmento);
// - CardComCabecalho "Parceiros": a seleção no subtítulo e "Escrever comunicado" na ação do cabeçalho; a primeira linha
//   seleciona todos da lista (Checkbox com o estado "alguns"); cada parceiro é uma LinhaDeLista (rótulo) com Checkbox e
//   Avatar, selecionada no rosa do meio; quem não recebe comunicados aparece desligado, com ChipDeEstado;
// - CardComCabecalho "Enviados": LinhaDeLista com "Ver e-mail" (Button) que abre o SidePanel com o e-mail enviado;
// - PainelDeEmail (SidePanel) para escrever; PerguntaDeConfirmacao (AlertDialog) antes de enviar; Toaster no fim.
import * as React from "react";
import { toast } from "sonner";
import { CircleAlert, Eye, Megaphone, Send, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChipDeEstado } from "@/components/ui/chip-de-estado";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinhaDeLista } from "@/components/ui/linha-de-lista";
import { CabecalhoDaPagina } from "@/components/ui/painel-cabecalho";
import { CardComCabecalho } from "@/components/ui/painel-dados";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidePanel, SidePanelBody, SidePanelContent, SidePanelHeader } from "@/components/ui/side-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { registrar, sb } from "@/lib/supabase";
import { iniciais } from "@/lib/formatar";
import { chamarFuncao, dataHora, Mensagem, PreviaDoEmail, usePerguntaDeConfirmacao, Vazio, type Aviso } from "./comum";
import { PainelDeEmail, type CamposDoEmail } from "./email";

export type Parceiro = {
  id: string; nome: string | null; email: string | null; principal_especializacao: string | null; areas_experiencia: string[] | null; segmentos: string[] | null;
  comunicados_descadastro_em: string | null;
};
export type Comunicado = { id: string; created_at: string; assunto: string; titulo: string; mensagem: string; destinatarios: string[] | null; enviados: number; falhas: number };
export type Filtros = { busca: string; area: string; segmento: string };

/** "1 parceiro" ou "3 parceiros" (o plural das páginas de HTML de comunicados). */
const plural = (n: number, um: string, varios: string) => (n === 1 ? "1 " + um : n + " " + varios);
export const limpa = (s?: string | null) => String(s || "").replace(/\.\s*$/, "").trim();
export const recebe = (r: Parceiro) => !r.comunicados_descadastro_em && !!r.email;
const TODOS = "__todos";

/** Parceiros que passam nos filtros (as mesmas regras da página de HTML). */
export function filtrar(lista: Parceiro[], f: Filtros) {
  const q = f.busca.trim().toLowerCase();
  return lista.filter((r) => (!f.area || (r.areas_experiencia || []).map(limpa).includes(f.area))
    && (!f.segmento || (r.segmentos || []).map(limpa).includes(f.segmento))
    && (!q || [r.nome, r.email, r.principal_especializacao].join(" ").toLowerCase().includes(q)));
}
/** Opções de um filtro: sem repetir, sem ponto final, em ordem alfabética. */
export const opcoes = (valores: (string | null)[]) => [...new Set(valores.map(limpa).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
/** "Ana, Bruno, Carla e mais 2" (Para:), com os nomes da lista de parceiros. */
export function paraTexto(ids: string[] | null, lista: Parceiro[], max: number) {
  const nomes = (ids || []).map((id) => { const r = lista.find((x) => x.id === id); return r ? r.nome || r.email || "Parceiro" : "Parceiro excluído"; });
  if (!nomes.length) return "Ninguém recebeu";
  return nomes.length > max ? nomes.slice(0, max).join(", ") + " e mais " + (nomes.length - max) : nomes.join(", ");
}

const EXEMPLOS: CamposDoEmail = {
  assunto: "Ex.: Novidades da Rede de Parceiros",
  titulo: "Ex.: Uma oportunidade para quem atua em Saúde",
  mensagem: "Escreva a mensagem. Deixe uma linha em branco para separar os parágrafos.",
};
const VAZIO: CamposDoEmail = { assunto: "", titulo: "", mensagem: "" };

function Filtro({ id, rotulo, todos, valores, valor, mudar }: { id: string; rotulo: string; todos: string; valores: string[]; valor: string; mudar: (v: string) => void }) {
  return (
    <div className="grid min-w-0 gap-2">
      <Label htmlFor={id}>{rotulo}</Label>
      <Select value={valor || TODOS} onValueChange={(v) => mudar(v === TODOS ? "" : v)}>
        <SelectTrigger id={id} className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>{todos}</SelectItem>
          {valores.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function VerEnviado({ c, lista, mudar }: { c: Comunicado | null; lista: Parceiro[]; mudar: (v: boolean) => void }) {
  const [html, setHtml] = React.useState<string | null>(null);
  const [aviso, setAviso] = React.useState<Aviso>(null);
  React.useEffect(() => {
    if (!c) return;
    setHtml(null);
    setAviso(null);
    // o mesmo modelo do envio, com o assunto, o título e a mensagem gravados no histórico
    chamarFuncao<{ html: string }>("comunicado-parceiros", { acao: "preview", assunto: c.assunto, titulo: c.titulo, mensagem: c.mensagem }).then((r) => {
      if (r.error) setAviso({ tom: "erro", texto: r.error });
      else setHtml(r.html);
    });
  }, [c]);
  const itens: [string, string][] = c ? [["Para", paraTexto(c.destinatarios, lista, 1000)], ["Enviado em", dataHora(c.created_at)], ["Assunto", c.assunto], ["Título", c.titulo], ...(c.falhas ? [["Não enviados", String(c.falhas)] as [string, string]] : [])] : [];
  return (
    <SidePanel open={!!c} onOpenChange={mudar}>
      <SidePanelContent width="lg" closeLabel="Fechar">
        <SidePanelHeader title="Comunicado enviado" description={c?.assunto} />
        <SidePanelBody>
          <dl className="grid gap-3 py-2 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-6">
            {itens.map(([r, v]) => (
              <React.Fragment key={r}>
                <dt className="text-sm font-semibold text-foreground">{r}</dt>
                <dd className="-mt-2 text-sm text-foreground [overflow-wrap:anywhere] sm:mt-0">{v}</dd>
              </React.Fragment>
            ))}
          </dl>
          <div className="mt-4 grid gap-4 pb-4">
            {html ? <PreviaDoEmail html={html} titulo="E-mail enviado" /> : !aviso && <Skeleton aria-busy="true" aria-label="Carregando o e-mail" className="h-128 rounded-md" />}
            <Mensagem aviso={aviso} className="empty:hidden" />
          </div>
        </SidePanelBody>
      </SidePanelContent>
    </SidePanel>
  );
}

export function Comunicados() {
  const [lista, setLista] = React.useState<Parceiro[] | null>(null);
  const [historico, setHistorico] = React.useState<Comunicado[] | null>(null);
  const [erroHistorico, setErroHistorico] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const [filtros, setFiltros] = React.useState<Filtros>({ busca: "", area: "", segmento: "" });
  const [sel, setSel] = React.useState<Set<string>>(new Set());
  const [aberto, setAberto] = React.useState(false);
  const [email, setEmail] = React.useState<CamposDoEmail>(VAZIO);
  const [vendo, setVendo] = React.useState<Comunicado | null>(null);
  const { pedir, elemento: confirmacao } = usePerguntaDeConfirmacao();

  const carregarHistorico = React.useCallback(async () => {
    const { data, error } = await sb.from("comunicados").select("id, created_at, assunto, titulo, mensagem, destinatarios, enviados, falhas").order("created_at", { ascending: false }).limit(30);
    setErroHistorico(!!error);
    setHistorico((data || []) as Comunicado[]);
  }, []);
  React.useEffect(() => {
    document.title = "Comunicados | Área restrita";
    (async () => {
      const { data, error } = await sb.from("cadastros")
        .select("id, nome, email, principal_especializacao, areas_experiencia, segmentos, comunicados_descadastro_em, galeria_status, galeria_convite_em, galeria_oculto")
        .order("nome", { ascending: true });
      if (error) setErro("Não foi possível carregar os parceiros: " + error.message);
      else setLista((data || []) as Parceiro[]);
      // os nomes dos destinatários vêm da lista de parceiros: carrega a lista antes do histórico
      await carregarHistorico();
    })();
  }, [carregarHistorico]);

  const todos = lista || [];
  const visiveis = filtrar(todos, filtros);
  const selecionaveis = visiveis.filter(recebe);
  const marcadosVisiveis = selecionaveis.filter((r) => sel.has(r.id)).length;
  const estadoTodos: boolean | "indeterminate" = selecionaveis.length > 0 && marcadosVisiveis === selecionaveis.length ? true : marcadosVisiveis > 0 ? "indeterminate" : false;
  const mudarFiltro = (k: keyof Filtros) => (v: string) => setFiltros((f) => ({ ...f, [k]: v }));
  const alternar = (id: string, marcado: boolean) => setSel((s) => { const n = new Set(s); if (marcado) n.add(id); else n.delete(id); return n; });
  const alternarTodos = (marcar: boolean) => setSel((s) => { const n = new Set(s); selecionaveis.forEach((r) => (marcar ? n.add(r.id) : n.delete(r.id))); return n; });
  const resumoDaSelecao = sel.size ? plural(sel.size, "parceiro selecionado", "parceiros selecionados") : "Nenhum parceiro selecionado";

  const enviar = async (v: CamposDoEmail) => {
    const n = sel.size;
    if (!n) return "Escolha pelo menos um parceiro.";
    const ok = await pedir({ titulo: "Enviar o comunicado?", mensagem: `O e-mail “${v.assunto}” será enviado para ${plural(n, "parceiro.", "parceiros.")} Essa ação não pode ser desfeita.`, ok: "Enviar" });
    if (!ok) return;
    const r = await chamarFuncao<{ enviados: number; falhas: number }>("comunicado-parceiros", { acao: "enviar", ...v, ids: [...sel], filtros: { busca: filtros.busca.trim(), area: filtros.area, segmento: filtros.segmento } });
    if (r.error) return r.error;
    await registrar("Enviou comunicado aos parceiros", plural(r.enviados, "enviado", "enviados") + (r.falhas ? ", " + plural(r.falhas, "não enviado", "não enviados") : "") + `. Assunto: "${v.assunto}"`);
    setAberto(false);
    setSel(new Set());
    setEmail(VAZIO);
    await carregarHistorico();
    if (r.falhas) toast.warning(`${r.enviados} enviados e ${r.falhas} não enviados.`);
    else toast.success("Comunicado enviado para " + plural(r.enviados, "parceiro.", "parceiros."));
  };

  return (
    <div className="grid gap-6">
      <CabecalhoDaPagina titulo="Comunicados" descricao="Envie um e-mail para toda a Rede de Parceiros ou só para quem você escolher. Cada parceiro recebe o seu, sem ver os outros endereços." />

      {erro && (
        <Alert variant="error">
          <CircleAlert aria-hidden />
          <AlertTitle>Não foi possível carregar</AlertTitle>
          <AlertDescription>{erro} Recarregue a página para tentar de novo.</AlertDescription>
        </Alert>
      )}

      <section aria-label="Filtros" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="cm-busca">Buscar</Label>
          <Input id="cm-busca" type="search" placeholder="Nome, e-mail ou especialização" value={filtros.busca} onChange={(e) => mudarFiltro("busca")(e.target.value)} />
        </div>
        <Filtro id="cm-area" rotulo="Cargo / área de atuação" todos="Todas" valores={opcoes(todos.flatMap((r) => r.areas_experiencia || []))} valor={filtros.area} mudar={mudarFiltro("area")} />
        <Filtro id="cm-segmento" rotulo="Segmento" todos="Todos" valores={opcoes(todos.flatMap((r) => r.segmentos || []))} valor={filtros.segmento} mudar={mudarFiltro("segmento")} />
      </section>

      {!lista && !erro ? (
        <Skeleton aria-busy="true" aria-label="Carregando os parceiros" className="h-96 rounded-xl" />
      ) : lista && (
        <CardComCabecalho
          idDoTitulo="h-parceiros" icone={<Users />} titulo="Parceiros" sangria
          descricao={<span aria-live="polite" data-selecao="">{resumoDaSelecao}</span>}
          acao={
            <Button type="button" disabled={!sel.size} onClick={() => setAberto(true)}>
              <Send aria-hidden />
              Escrever comunicado
            </Button>
          }
          className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300"
        >
          {visiveis.length ? (
            <ul>
              <li>
                <LinhaDeLista
                  as="label" htmlFor="cm-todos" className="px-5 sm:px-6" alinhar="centro" interativa={selecionaveis.length > 0}
                  inicio={<Checkbox id="cm-todos" checked={estadoTodos} disabled={!selecionaveis.length} onCheckedChange={(v) => alternarTodos(v === true)} />}
                  titulo="Selecionar todos da lista"
                  descricao={plural(selecionaveis.length, "parceiro recebe comunicados nesta lista", "parceiros recebem comunicados nesta lista")}
                />
              </li>
              {visiveis.map((r) => {
                const ok = recebe(r);
                const marcado = sel.has(r.id);
                const id = "cm-p-" + r.id;
                return (
                  <li key={r.id} data-parceiro={r.id}>
                    <LinhaDeLista
                      as="label" htmlFor={id} className="px-5 sm:px-6" interativa={ok} selecionada={marcado}
                      inicio={
                        <span className="flex items-center gap-3">
                          <Checkbox id={id} checked={marcado} disabled={!ok} onCheckedChange={(v) => alternar(r.id, v === true)} aria-label={"Incluir " + (r.nome || r.email)} />
                          <Avatar className="size-10"><AvatarFallback>{iniciais(r.nome || r.email)}</AvatarFallback></Avatar>
                        </span>
                      }
                      titulo={r.nome || r.email}
                      descricao={<span className="[overflow-wrap:anywhere]">{[limpa(r.principal_especializacao), r.email].filter(Boolean).join(" · ")}</span>}
                      fim={!ok ? <ChipDeEstado tom="neutro">{r.email ? "Não recebe comunicados" : "Sem e-mail"}</ChipDeEstado> : undefined}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <Vazio className="px-5 sm:px-6">{todos.length ? "Nenhum parceiro com esses filtros." : "Ainda não há parceiros cadastrados."}</Vazio>
          )}
        </CardComCabecalho>
      )}

      {historico && (
        <CardComCabecalho idDoTitulo="h-enviados" icone={<Megaphone />} titulo="Enviados" tom="neutro" sangria descricao={historico.length ? plural(historico.length, "comunicado", "comunicados") : undefined}>
          {historico.length ? (
            <ul>
              {historico.map((c) => (
                <li key={c.id} data-comunicado={c.id}>
                  <LinhaDeLista
                    className="px-5 sm:px-6"
                    titulo={<span className="[overflow-wrap:anywhere]">{c.assunto}</span>}
                    descricao={<span className="[overflow-wrap:anywhere]">Título: {c.titulo}</span>}
                    fim={
                      <Button type="button" variant="outline" onClick={() => setVendo(c)} aria-label={`Ver o e-mail “${c.assunto}”`}>
                        <Eye aria-hidden />
                        Ver e-mail
                      </Button>
                    }
                  >
                    <span className="mt-0.5 block text-sm text-foreground [overflow-wrap:anywhere]"><span className="font-semibold">Para: </span>{paraTexto(c.destinatarios, todos, 3)}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground tabular-nums">
                      {dataHora(c.created_at) + " · " + plural(c.enviados, "enviado", "enviados") + (c.falhas ? " · " + plural(c.falhas, "não enviado", "não enviados") : "")}
                    </span>
                  </LinhaDeLista>
                </li>
              ))}
            </ul>
          ) : (
            <Vazio className="px-5 sm:px-6">{erroHistorico ? "Não foi possível carregar o histórico." : "Nenhum comunicado enviado ainda."}</Vazio>
          )}
        </CardComCabecalho>
      )}

      <PainelDeEmail
        aberto={aberto} mudar={setAberto} titulo="Escrever comunicado"
        descricao={"Vai para " + plural(sel.size, "parceiro selecionado.", "parceiros selecionados.")}
        valores={email} aoMudar={setEmail} exemplos={EXEMPLOS}
        dica="O e-mail já leva a logo, a sua assinatura e, no rodapé, o link para o parceiro deixar de receber comunicados. As respostas chegam em contato@danimoscatelli.com.br."
        rotuloEnviar="Enviar" iconeEnviar={<Send aria-hidden />}
        previa={(v) => chamarFuncao<{ html: string }>("comunicado-parceiros", { acao: "preview", ...v })}
        enviar={enviar}
      />
      <VerEnviado c={vendo} lista={todos} mudar={(v) => { if (!v) setVendo(null); }} />
      {confirmacao}
    </div>
  );
}
