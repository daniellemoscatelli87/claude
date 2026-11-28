// Pesquisas (A8): a mesma informação, as mesmas consultas, funções e textos de public/admin/pesquisas/index.html, só com
// componentes do Design System Dani Moscatelli:
// - lista: LinhaDeLista + IconeComBase (tom marca: a linha é clicável) e, na coluna do fim, ChipDeEstado da situação
//   ("No ar" com a bolinha piscando, aoVivo; "Fora do ar" neutro, sem bolinha) e "N novas"; o card corta o hover nos
//   cantos arredondados (overflow-hidden);
// - painel (?p=): CabecalhoDaPagina com "Exportar relatório" (DropdownMenu: PDF e Excel) e "Apagar pesquisa"; card do
//   link com ChipDeEstado (no ar, com a bolinha piscando / fora do ar), CampoCopiavel, Abrir, QR Code (Dialog), Compartilhar e Tirar do ar;
// - abas Resultado, Inteligência e Dados (Tabs; pesquisas/Resultados.tsx, Inteligencia.tsx e Dados.tsx).
// As respostas novas deixam de aparecer no sino só quando a aba Dados é aberta.
import * as React from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, CircleAlert, ClipboardList, Clock, ExternalLink, FileDown, LoaderCircle, Pause, Play, QrCode, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CampoCopiavel } from "@/components/ui/campo-copiavel";
import { Card, CardContent } from "@/components/ui/card";
import { ChipDeEstado } from "@/components/ui/chip-de-estado";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { LinhaDeLista } from "@/components/ui/linha-de-lista";
import { CabecalhoDaPagina } from "@/components/ui/painel-cabecalho";
import { IconeComBase } from "@/components/ui/painel-dados";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinkDaArea } from "@/casca/base";
import { useNotificacoes } from "@/casca/notificacoes";
import { registrar, sb } from "@/lib/supabase";
import {
  baixarPlanilha, carregarLista, carregarPainel, carregarQr, dadosRespostas, fmtDate, nomeArquivo, plural, relatosDe, resumoLinhas, separar, todasR, urlDaPesquisa,
  type DadosDoPainel,
} from "@/dados/pesquisas";
import { linhasDoRelatorio } from "@/dados/pesquisas-relatorio";
import { usePerguntaDeConfirmacao } from "./comum";
import { Dados, type AbaDosDados } from "./pesquisas/Dados";
import { Inteligencia } from "./pesquisas/Inteligencia";
import { Resultados } from "./pesquisas/Resultados";

export function Pesquisas() {
  const slug = new URLSearchParams(useLocation().search).get("p");
  return slug ? <Painel key={slug} slug={slug} /> : <Lista />;
}

function Lista() {
  const [r, setR] = React.useState<Awaited<ReturnType<typeof carregarLista>> | null>(null);
  React.useEffect(() => { document.title = "Pesquisas | Área restrita"; void carregarLista().then(setR); }, []);
  return (
    <div className="grid gap-6">
      <CabecalhoDaPagina titulo="Pesquisas" descricao="Pesquisas do Studio: acompanhe as respostas, compartilhe o link e tire do ar quando quiser." />
      {!r ? <Skeleton aria-busy="true" aria-label="Carregando as pesquisas" className="h-40 rounded-xl" />
        : "erro" in r ? <Alert variant="error" role="alert"><CircleAlert aria-hidden /><AlertTitle>Não foi possível carregar</AlertTitle><AlertDescription>{r.erro}</AlertDescription></Alert>
        : !r.pesquisas.length ? <Card><CardContent className="pt-6"><EstadoVazio icone={<ClipboardList />} titulo="Nenhuma pesquisa ainda" descricao="Quando houver uma pesquisa, ela aparece aqui." /></CardContent></Card>
        : (
          <Card className="overflow-hidden py-0">
            <ul aria-label="Pesquisas" className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300">
              {r.pesquisas.map((p) => (
                <LinhaDeLista
                  key={p.slug} as="li" interativa className="relative border-b border-border px-6 last:border-b-0" alinhar="centro"
                  inicio={<IconeComBase tom="marca"><ClipboardList /></IconeComBase>}
                  titulo={<LinkDaArea href={"/admin/pesquisas/?p=" + encodeURIComponent(p.slug)} className="font-semibold text-foreground outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-ring">{p.titulo}</LinkDaArea>}
                  descricao={"criada em " + new Date(p.criada_em).toLocaleDateString("pt-BR")}
                  fim={
                    <>
                      <ChipDeEstado tom={p.ativa ? "sucesso" : "neutro"} aoVivo={p.ativa}>{p.ativa ? "No ar" : "Fora do ar"}</ChipDeEstado>
                      {r.contagem[p.slug] ? <ChipDeEstado tom="marca">{plural(r.contagem[p.slug], "nova", "novas")}</ChipDeEstado> : null}
                    </>
                  }
                />
              ))}
            </ul>
          </Card>
        )}
    </div>
  );
}

type Aba = "resultados" | "inteligencia" | "respostas";

function Painel({ slug }: { slug: string }) {
  const navegar = useNavigate();
  const { recarregar } = useNotificacoes();
  const { pedir, elemento } = usePerguntaDeConfirmacao();
  const [d, setD] = React.useState<DadosDoPainel | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [aba, setAba] = React.useState<Aba>("resultados");
  const [abaDosDados, setAbaDosDados] = React.useState<AbaDosDados>("respostas");
  const [versao, setVersao] = React.useState(0);
  const [qr, setQr] = React.useState(false);
  const [ocupado, setOcupado] = React.useState<"" | "alternar" | "apagar" | "excel">("");
  const [excelOk, setExcelOk] = React.useState(false);
  const [imprimindo, setImprimindo] = React.useState(false);

  React.useEffect(() => {
    void carregarPainel(slug).then((r) => {
      if ("erro" in r) return setErro(r.erro);
      setD(r); document.title = r.P.titulo + " | Área restrita";
    });
  }, [slug]);

  // as respostas novas deixam de aparecer como notificação só quando a aba Dados é aberta
  const marcarVistas = React.useCallback(async (dd: DadosDoPainel) => {
    const novas = dd.R.filter((x) => !x.visualizado_em);
    if (!novas.length) return;
    const agora = new Date().toISOString();
    setD((v) => v && { ...v, R: v.R.map((x) => (x.visualizado_em ? x : { ...x, visualizado_em: agora })) });
    const ids = novas.map((x) => x.id);
    for (let k = 0; k < ids.length; k += 200) await sb.from("pesquisa_respostas").update({ visualizado_em: agora }).in("id", ids.slice(k, k + 200));
    recarregar();
  }, [recarregar]);
  const mudarAba = (a: Aba) => { setAba(a); if (a === "respostas" && d) void marcarVistas(d); };

  if (erro) return (
    <div className="grid gap-6">
      <Voltar />
      <Alert variant="error" role="alert"><CircleAlert aria-hidden /><AlertTitle>Não foi possível carregar</AlertTitle><AlertDescription>{erro}</AlertDescription></Alert>
    </div>
  );
  if (!d) return <div className="grid gap-6"><Voltar /><Skeleton aria-busy="true" aria-label="Carregando a pesquisa" className="h-96 rounded-xl" /></div>;

  const { P } = d;
  const url = urlDaPesquisa(P.slug);
  const alternar = async () => {
    const ligar = !P.ativa;
    const ok = await pedir(ligar
      ? { titulo: "Colocar a pesquisa no ar?", mensagem: "O link volta a aceitar respostas na hora.", ok: "Colocar no ar" }
      : { titulo: "Tirar a pesquisa do ar?", mensagem: "Quem abrir o link verá que a pesquisa não está recebendo respostas. As respostas já recebidas continuam aqui, e você pode colocar no ar de novo quando quiser.", ok: "Tirar do ar", destrutiva: true });
    if (!ok) return;
    setOcupado("alternar");
    const { error } = await sb.from("pesquisas").update({ ativa: ligar, atualizado_em: new Date().toISOString() }).eq("slug", P.slug);
    setOcupado("");
    if (error) return toast.error("Não foi possível alterar: " + error.message);
    setD({ ...d, P: { ...P, ativa: ligar } });
    void registrar(ligar ? "Colocou a pesquisa no ar" : "Tirou a pesquisa do ar", P.titulo);
    toast.success(ligar ? "Pesquisa no ar" : "Pesquisa fora do ar");
  };
  const apagarPesquisa = async () => {
    if (P.ativa) return toast.info("Não é possível apagar uma pesquisa no ar. Primeiro toque em “Tirar do ar”.");
    const total = d.R.length + d.RP.length;
    const ok = await pedir({
      titulo: "Apagar a pesquisa inteira?", ok: "Apagar pesquisa", destrutiva: true, palavra: "APAGAR",
      mensagem: `A pesquisa “${P.titulo}” sai da área restrita e o link deixa de aceitar respostas. ` +
        (total ? `${plural(total, "participação", "participações")}, os relatos e ${plural(d.I.length, "contato de interessado", "contatos de interessados")} também serão apagados. ` : "") +
        "Não dá para desfazer. Se quiser guardar os dados, exporte o relatório e as respostas antes.",
    });
    if (!ok) return;
    setOcupado("apagar");
    const { error } = await sb.from("pesquisas").delete().eq("slug", P.slug);
    if (error) { setOcupado(""); return toast.error("Não foi possível apagar: " + error.message); }
    void registrar("Apagou a pesquisa", P.titulo);
    toast.success("Pesquisa apagada");
    recarregar();
    navegar({ search: "" });
  };
  // Exclui respostas; junto vai o interesse em receber os avisos (o contato fica ligado à resposta pelo envio_id).
  const excluir = async (ids: string[], todas: boolean, depois: AbaDosDados) => {
    const q = sb.from("pesquisa_respostas").delete();
    const { error } = await (todas ? q.eq("pesquisa", P.slug) : q.in("id", ids));
    if (error) { toast.error("Não foi possível excluir: " + error.message); return false; }
    const envios = todas ? [] : todasR(d).filter((x) => ids.includes(x.id)).map((x) => x.envio_id).filter((e): e is string => !!e);
    let novo: DadosDoPainel = todas ? { ...d, R: [], RP: [] } : { ...d, ...separar(todasR(d).filter((x) => !ids.includes(x.id))) };
    let falhaI: string | null = null;
    if (todas || envios.some((e) => d.I.some((y) => y.envio_id === e))) {
      const qi = sb.from("pesquisa_interessados").delete();
      const { error: eI } = await (todas ? qi.eq("pesquisa", P.slug) : qi.in("envio_id", envios));
      if (eI) falhaI = eI.message; else novo = { ...novo, I: todas ? [] : d.I.filter((y) => !envios.includes(y.envio_id || "")) };
    }
    void registrar(todas ? "Apagou todas as respostas e os interessados da pesquisa" : "Excluiu uma resposta da pesquisa", P.titulo);
    if (falhaI) { toast.error((todas ? "As respostas foram apagadas" : "A resposta foi excluída") + ", mas não foi possível apagar o contato em Interessados: " + falhaI); setAbaDosDados("interessados"); }
    else { toast.success(todas ? "Respostas e interessados apagados" : "Resposta excluída"); setAbaDosDados(depois); }
    setD(novo); setVersao((v) => v + 1); recarregar();
    return !falhaI;
  };
  const exportarExcel = async () => {
    setOcupado("excel");
    try {
      await baixarPlanilha(nomeArquivo(P.slug, "relatorio"), [
        { nome: "Resumo", linhas: resumoLinhas(d), larguras: [28, 40] },
        { nome: "Resultados", linhas: linhasDoRelatorio(d, "resultados"), larguras: [60, ...Array(8).fill(14)] },
        { nome: "Inteligência", linhas: linhasDoRelatorio(d, "inteligencia"), larguras: [60, ...Array(8).fill(14)] },
      ]);
      void registrar("Exportou o relatório da pesquisa em Excel", P.titulo);
      setExcelOk(true); setTimeout(() => setExcelOk(false), 2200);
    } catch (e) {
      console.error("exportar Excel", e);
      toast.error("Não foi possível gerar a planilha. Confira a conexão e tente de novo.");
    }
    setOcupado("");
  };
  // Exportar respostas (menu Ações da aba Dados): planilha com Respostas, Relatos e Interessados
  const exportarRespostas = async () => {
    try {
      const resp = dadosRespostas(d);
      await baixarPlanilha(nomeArquivo(P.slug, "respostas"), [
        { nome: "Respostas", linhas: resp, larguras: resp[0].map((_, k) => (k < 3 ? 14 : 36)) },
        { nome: "Relatos", linhas: [["Data", "Relato"], ...relatosDe(d.R).map((x) => [fmtDate(x.created_at), x.relato || ""])], larguras: [18, 100] },
        { nome: "Interessados", linhas: [["Nome", "E-mail", "WhatsApp", "Autorizou em", "Versão da autorização"], ...d.I.map((x) => [x.nome || "", x.email || "", x.whatsapp || "", fmtDate(x.consentimento_em), x.consentimento_versao])], larguras: [28, 32, 16, 18, 34] },
      ]);
      void registrar("Exportou as respostas da pesquisa em Excel", P.titulo);
    } catch (e) {
      console.error("exportar Excel", e);
      toast.error("Não foi possível gerar a planilha. Confira a conexão e tente de novo.");
      throw e;
    }
  };
  const compartilhar = async () => {
    // abre o compartilhamento do aparelho (WhatsApp, e-mail…); onde não houver, copia o link
    if (navigator.share) { try { await navigator.share({ title: P.titulo, url }); } catch { /* cancelado */ } return; }
    try { await navigator.clipboard.writeText(url); } catch { /* sem área de transferência */ }
    toast.success("Link copiado. Cole onde quiser compartilhar.");
  };

  return (
    <div className="grid gap-6">
      <Voltar />
      <CabecalhoDaPagina
        titulo={P.titulo}
        descricao="Projeto do Dani Moscatelli Studio. Resultados analisados em conjunto; os nomes aparecem só na aba Dados."
        acoes={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" disabled={ocupado === "excel"}>
                  {ocupado === "excel" ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : excelOk ? <Check aria-hidden /> : <FileDown aria-hidden />}
                  {ocupado === "excel" ? "Gerando planilha…" : excelOk ? "Planilha baixada" : "Exportar relatório"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setImprimindo(true)}><FileDown aria-hidden />PDF</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void exportarExcel()}><FileDown aria-hidden />Excel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button type="button" variant="exclusao-contorno" aria-disabled={P.ativa || undefined} title={P.ativa ? "Para apagar, primeiro tire a pesquisa do ar." : undefined} disabled={ocupado === "apagar"} onClick={() => void apagarPesquisa()}>
              <Trash2 aria-hidden />Apagar pesquisa
            </Button>
          </>
        }
      />
      <Card className="gap-4" data-cartao-do-link="">
        <CardContent className="grid gap-4 pt-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <ChipDeEstado tom={P.ativa ? "sucesso" : "neutro"} aoVivo={P.ativa}>{P.ativa ? "No ar" : "Fora do ar"}</ChipDeEstado>
            <p className="flex items-center gap-1.5 text-body-sm text-muted-foreground"><Clock aria-hidden className="size-4" />{d.R[0] ? "Última resposta em " + fmtDate(d.R[0].created_at) : "Ainda sem respostas"}</p>
          </div>
          <CampoCopiavel valor={url} rotulo="Link da pesquisa" onCopiar={() => toast.success("Link copiado")} />
          <Separator />
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline"><a href={url} target="_blank" rel="noopener" aria-label="Abrir a pesquisa numa nova aba"><ExternalLink aria-hidden />Abrir</a></Button>
            <Button type="button" variant="outline" aria-haspopup="dialog" aria-label="Mostrar o QR Code da pesquisa" onClick={() => setQr(true)}><QrCode aria-hidden />QR Code</Button>
            <Button type="button" variant="outline" aria-label="Compartilhar a pesquisa" onClick={() => void compartilhar()}><Share2 aria-hidden />Compartilhar</Button>
            <Button type="button" variant={P.ativa ? "exclusao-contorno" : "default"} className="sm:ml-auto" disabled={ocupado === "alternar"} onClick={() => void alternar()}>
              {ocupado === "alternar" ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : P.ativa ? <Pause aria-hidden /> : <Play aria-hidden />}{P.ativa ? "Tirar do ar" : "Colocar no ar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={aba} onValueChange={(v) => mudarAba(v as Aba)} className="grid gap-6">
        <TabsList aria-label="Seções da pesquisa">
          <TabsTrigger value="resultados">Resultado</TabsTrigger>
          <TabsTrigger value="inteligencia">Inteligência</TabsTrigger>
          <TabsTrigger value="respostas">Dados</TabsTrigger>
        </TabsList>
        <TabsContent value="resultados"><Resultados d={d} /></TabsContent>
        <TabsContent value="inteligencia"><Inteligencia d={d} /></TabsContent>
        <TabsContent value="respostas"><Dados key={versao} d={d} abaInicial={abaDosDados} excluir={excluir} pedir={pedir} exportarRespostas={exportarRespostas} /></TabsContent>
      </Tabs>
      <JanelaDoQr aberta={qr} mudar={setQr} url={url} />
      {imprimindo && <Impressao d={d} fim={() => setImprimindo(false)} />}
      {elemento}
    </div>
  );
}

const Voltar = () => (
  <Button asChild variant="link" className="w-fit px-0"><LinkDaArea href="/admin/pesquisas/"><ArrowLeft aria-hidden />Pesquisas</LinkDaArea></Button>
);

function JanelaDoQr({ aberta, mudar, url }: { aberta: boolean; mudar: (v: boolean) => void; url: string }) {
  const [svg, setSvg] = React.useState<string | null>(null);
  const [falhou, setFalhou] = React.useState(false);
  React.useEffect(() => {
    if (!aberta || svg) return;
    setFalhou(false);
    carregarQr().then((qrcode) => { const q = qrcode(0, "M"); q.addData(url); q.make(); setSvg(q.createSvgTag({ cellSize: 8, margin: 0, scalable: true })); }).catch(() => setFalhou(true));
  }, [aberta, svg, url]);
  return (
    <Dialog open={aberta} onOpenChange={mudar}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code da pesquisa</DialogTitle>
          <DialogDescription>Aponte a câmera do celular para o código para abrir a pesquisa.</DialogDescription>
        </DialogHeader>
        <div role="img" aria-label="QR Code que abre a pesquisa" className="mx-auto grid aspect-square w-full max-w-64 place-items-center rounded-lg border border-border bg-card p-4 text-foreground">
          {svg ? <span className="block size-full [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} />
            : falhou ? <p className="text-center text-body-sm text-muted-foreground">Não foi possível gerar o QR Code. Confira sua conexão e tente de novo.</p>
            : <Skeleton className="size-full rounded-md" aria-label="Gerando o QR Code…" />}
        </div>
        <p className="text-center text-body-sm text-muted-foreground [overflow-wrap:anywhere]">{url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</p>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Relatório em PDF: Resultado e Inteligência numa página só, com tudo aberto, e a janela de impressão ("Salvar como
 * PDF"). Os gráficos do DS entram ao aparecer na tela; por isso o relatório é montado numa camada invisível que rola
 * do começo ao fim antes da impressão.
 */
function Impressao({ d, fim }: { d: DadosDoPainel; fim: () => void }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const fimRef = React.useRef(fim);
  fimRef.current = fim;
  React.useEffect(() => {
    const raiz = document.getElementById("root");
    raiz?.classList.add("print:hidden");
    const id = toast.loading("Preparando o relatório…");
    let vivo = true;
    const terminar = () => { raiz?.classList.remove("print:hidden"); removeEventListener("afterprint", terminar); if (vivo) fimRef.current(); };
    void (async () => {
      const el = ref.current!;
      await new Promise((r) => setTimeout(r, 300));
      for (let y = 0; y < el.scrollHeight; y += el.clientHeight * 0.8) { el.scrollTop = y; await new Promise((r) => setTimeout(r, 40)); }
      await new Promise((r) => setTimeout(r, 700));
      el.scrollTop = 0;
      toast.dismiss(id);
      void registrar("Exportou o relatório da pesquisa em PDF", d.P.titulo);
      addEventListener("afterprint", terminar);
      window.print();
    })();
    return () => { vivo = false; toast.dismiss(id); raiz?.classList.remove("print:hidden"); removeEventListener("afterprint", terminar); };
  }, [d]);
  return createPortal(
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-y-auto bg-background opacity-0 print:pointer-events-auto print:static print:overflow-visible print:opacity-100" data-impressao="">
      <div className="mx-auto grid max-w-5xl gap-8 p-8">
        <header className="grid gap-1"><h1 className="text-h2 font-bold text-foreground">{d.P.titulo}</h1><p className="text-body-sm text-muted-foreground">Relatório · gerado em {fmtDate(new Date().toISOString())}</p></header>
        <section className="grid gap-6"><h2 className="text-h3 font-bold text-foreground">Resultados</h2><Resultados d={d} imprimir /></section>
        <section className="grid gap-6"><h2 className="text-h3 font-bold text-foreground">Inteligência</h2><Inteligencia d={d} imprimir /></section>
      </div>
    </div>,
    document.body,
  );
}

