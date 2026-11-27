// Aba Inteligência: "Achados" (assuntos em Accordion; em cada um, DescobertaVisual do DS com tema, conclusão,
// contexto, gráfico, "Por que importa", selo "Hipótese" e "Ver dados") e "Oportunidades" (CardIndicador no topo e a
// Timeline do DS em ordem de impacto, cada uma ligada ao achado de origem por "Ver achado"). "Voz do cliente": os
// relatos por tema (palavras-chave ou IA, função relatos-ia), com BarrasOrdenadas do ranking e Citacao das falas.
import * as React from "react";
import { ArrowRight, BarChart3, Lightbulb, LoaderCircle, MessageSquareQuote, Search, Sparkles, Star, Target } from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Citacao } from "@/components/ui/citacao";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { GradeDeCards } from "@/components/ui/grade-de-cards";
import { BarrasOrdenadas, DescobertaVisual, TabelaDeDados } from "@/components/ui/graficos-inteligencia";
import { CardIndicador } from "@/components/ui/painel-dados";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timeline } from "@/components/ui/timeline";
import { registrar, sb } from "@/lib/supabase";
import { fmtDate, juntar, type DadosDoPainel, type Resposta } from "@/dados/pesquisas";
import {
  fala, inteligencia, MIN_SEG, relatosTxt, sinteseDosRelatos, temasDosRelatos, type Achado, type Oportunidade, type RelatosIA,
} from "@/dados/pesquisas-inteligencia";
import { GraficoDaPesquisa } from "./Graficos";

const reduzir = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function CardDoAchado({ a, imprimir, alvo }: { a: Achado; imprimir?: boolean; alvo?: boolean }) {
  return (
    <div id={a.id} tabIndex={-1} className={"scroll-mt-24 rounded-lg outline-none transition-shadow " + (alvo ? "ring-2 ring-ring ring-offset-2" : "")}>
      <DescobertaVisual tema={a.tema} conclusao={a.titulo} contexto={a.contexto} porQueImporta={a.significa} selo={a.hipotese ? "Hipótese" : undefined} dados={imprimir ? undefined : { colunas: a.dados.colunas, linhas: a.dados.linhas }}>
        <GraficoDaPesquisa g={a.vis} rotulo={a.titulo} />
        {imprimir && <div className="mt-4"><TabelaDeDados dados={{ colunas: a.dados.colunas, linhas: a.dados.linhas }} legenda={a.titulo} /></div>}
        {a.dados.nota && <p className="mt-3 text-caption text-muted-foreground">{a.dados.nota}</p>}
      </DescobertaVisual>
    </div>
  );
}

export function Inteligencia({ d, imprimir }: { d: DadosDoPainel; imprimir?: boolean }) {
  const m = React.useMemo(() => inteligencia(d), [d]);
  const [aba, setAba] = React.useState("achados");
  const [abertas, setAbertas] = React.useState<string[]>([]);
  const [alvo, setAlvo] = React.useState<string | null>(null);
  React.useEffect(() => { if (!m.pouco) setAbertas(imprimir ? m.secoes.map((s) => s.chave) : m.secoes.slice(0, 1).map((s) => s.chave)); }, [m, imprimir]);
  if (m.pouco) {
    return <Card><CardContent className="pt-6"><EstadoVazio icone={<Lightbulb />} titulo="Ainda há poucas respostas completas" descricao={`As descobertas aparecem a partir de ${MIN_SEG} respostas completas. Agora: ${m.n}.`} /></CardContent></Card>;
  }
  // leva da aba Oportunidades ao card do achado: troca de aba, abre o assunto e destaca o card
  const irParaAchado = (o: Oportunidade) => {
    setAba("achados");
    setAbertas((l) => (l.includes(o.grupo!) ? l : [...l, o.grupo!]));
    setTimeout(() => {
      const card = document.getElementById(o.id!);
      if (!card) return;
      card.scrollIntoView({ behavior: reduzir() ? "auto" : "smooth", block: "center" });
      card.focus({ preventScroll: true });
      setAlvo(o.id!);
      setTimeout(() => setAlvo(null), 1600);
    }, reduzir() ? 0 : 380);
  };
  const baseTxt = `Com base em ${m.n === 1 ? "1 resposta completa" : `${m.n} respostas completas`}.`;
  const achados = (
    <div className="grid gap-4">
      <p className="text-body-sm text-muted-foreground">O que as respostas mostram, organizado por assunto. {baseTxt}</p>
      <Accordion type="multiple" value={abertas} onValueChange={setAbertas} className="rounded-xl border border-border bg-card px-6">
        {m.secoes.map((s) => (
          <AccordionItem key={s.chave} value={s.chave} data-tema={s.chave}>
            <AccordionTrigger>
              <span className="grid flex-1 gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                <span className="grid gap-0.5"><span className="text-body font-semibold text-foreground">{s.nome}</span><span className="text-body-sm font-normal text-muted-foreground">{s.sub}</span></span>
                <Badge variant="outline" className="w-fit">{s.qt}</Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {s.chave === "voz" ? <VozDoCliente d={d} rel={m.relatos} /> : (
                <div className="grid gap-4">{s.achados.map((a) => <CardDoAchado key={a.id} a={a} imprimir={imprimir} alvo={alvo === a.id} />)}</div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {m.pendentes.length > 0 && <p className="text-body-sm text-muted-foreground">Ainda não há pessoas suficientes para comparar com segurança: {juntar(m.pendentes)}. Essas comparações aparecem quando cada grupo tiver pelo menos {MIN_SEG} pessoas.</p>}
    </div>
  );
  const ops = m.oportunidades;
  const oportunidades = (
    <div className="grid gap-6">
      <p className="text-body-sm text-muted-foreground">O que os achados sugerem para o produto Find Look, em recursos, fluxos e melhorias. São hipóteses a validar com as pessoas, não conclusões. A ordem é de impacto: da que atinge mais gente para a que atinge menos.</p>
      <GradeDeCards colunas={{ base: 1, sm: 3 }}>
        <CardIndicador compacto icone={<Target />} tom="marca" valor={ops.length} rotulo="Oportunidades" />
        <CardIndicador compacto icone={<Star />} valor={ops.filter((o) => o.parte >= 50).length} rotulo="Impacto alto" />
        <CardIndicador compacto icone={<Search />} valor={ops.filter((o) => o.cat === "busca").length} rotulo="Ligadas à busca" />
      </GradeDeCards>
      <Timeline
        alternar={false} animar={!imprimir} aria-label="Oportunidades em ordem de impacto"
        etapas={ops.map((o, k) => ({
          icone: <span className="text-body-sm font-bold tabular-nums">{k + 1}</span>,
          titulo: o.titulo,
          descricao: (
            <span className="grid gap-3 text-body-sm text-foreground">
              <span><strong>Dor observada: </strong>{o.dor}</span>
              <span className="grid gap-1"><span className="flex items-center gap-1.5 text-label font-semibold text-muted-foreground"><Lightbulb aria-hidden className="size-4" />Sugestão de recurso</span><span>{o.recurso}</span></span>
              <span className="grid gap-1"><span className="flex items-center gap-1.5 text-label font-semibold text-muted-foreground"><BarChart3 aria-hidden className="size-4" />Evidências</span><span className="grid gap-0.5">{o.evid.map((e) => <span key={e}>• {e}</span>)}</span></span>
              <span className="grid gap-1"><span className="flex items-center gap-1.5 text-label font-semibold text-muted-foreground"><Target aria-hidden className="size-4" />Impacto esperado</span><span>{o.esperado}</span></span>
              {o.id && !imprimir && (
                <Button type="button" variant="link" size="sm" className="w-fit px-0" aria-label={`Ver o achado: ${o.achado}`} onClick={() => irParaAchado(o)}>Ver achado<ArrowRight aria-hidden /></Button>
              )}
            </span>
          ),
        }))}
      />
    </div>
  );
  if (imprimir) return <div className="grid gap-8">{achados}<h3 className="text-h4 font-bold text-foreground">Oportunidades</h3>{oportunidades}</div>;
  return (
    <Tabs value={aba} onValueChange={setAba} className="grid gap-6 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300">
      <TabsList aria-label="Inteligência">
        <TabsTrigger value="achados">Achados</TabsTrigger>
        <TabsTrigger value="oportunidades">Oportunidades <Badge variant="outline">{ops.length}</Badge></TabsTrigger>
      </TabsList>
      <TabsContent value="achados" forceMount className="data-[state=inactive]:hidden">{achados}</TabsContent>
      <TabsContent value="oportunidades">{oportunidades}</TabsContent>
    </Tabs>
  );
}

// Relatos já organizados com IA ficam guardados por pesquisa (como na página de HTML).
const IA_GUARDADA = new Map<string, RelatosIA | null>();

/** Voz do cliente: a frustração mais comum, o ranking dos temas e as falas, sem nome nem contatos. */
function VozDoCliente({ d, rel }: { d: DadosDoPainel; rel: Resposta[] }) {
  const slug = d.P.slug;
  const [ia, setIa] = React.useState<RelatosIA | null>(IA_GUARDADA.get(slug) ?? null);
  const [organizando, setOrganizando] = React.useState(false);
  const [status, setStatus] = React.useState("");
  React.useEffect(() => {
    if (IA_GUARDADA.has(slug)) return;
    IA_GUARDADA.set(slug, null);
    // análise com IA já guardada: aparece sem gastar uma nova chamada
    void sb.functions.invoke("relatos-ia", { body: { pesquisa: slug, somente_cache: true } }).then(({ data }) => {
      if (data && !data.error && !data.vazio) { IA_GUARDADA.set(slug, data); setIa(data); }
    }).catch(() => {});
  }, [slug]);
  const valida = ia && Array.isArray(ia.temas) && ia.temas.length ? ia : null;
  const temas = temasDosRelatos(rel, valida);
  const { titulo, texto, semTema } = sinteseDosRelatos(rel, temas, valida);
  const n = rel.length;
  const organizar = async () => {
    setOrganizando(true); setStatus("A IA está lendo os relatos. Pode levar alguns segundos.");
    const { data, error } = await sb.functions.invoke("relatos-ia", { body: { pesquisa: slug } }).catch((e) => ({ data: null, error: e }));
    setOrganizando(false);
    if (error || !data || data.error) {
      return setStatus(data && data.error === "ocupado" ? "A IA está ocupada agora (plano gratuito). Tente de novo em alguns minutos." : "Não foi possível usar a IA agora. Os temas por palavras-chave continuam valendo.");
    }
    IA_GUARDADA.set(slug, data); setIa(data); setStatus("");
    void registrar("Organizou os relatos da pesquisa com IA", d.P.titulo);
    toast.success("Relatos organizados com IA");
  };
  const origem = `Com base em ${relatosTxt(n)}. ` + (valida ? `Temas organizados com IA (Google Gemini) em ${fmtDate(valida.gerado_em!)}${valida.desatualizada ? "; chegaram relatos novos desde então" : ""}. Só o texto dos relatos foi enviado, sem nome nem contatos.` : "Temas encontrados por palavras-chave, sem IA.");
  return (
    <article className="grid gap-5 rounded-lg border border-border bg-card p-5 sm:p-6" data-voz="">
      <div className="grid gap-2">
        <p className="flex items-center gap-1.5 text-label font-semibold text-muted-foreground"><MessageSquareQuote aria-hidden className="size-4" />Resumo dos relatos</p>
        <h3 className="text-body-lg font-bold text-foreground">{titulo}</h3>
        <p className="text-body-sm text-foreground">{texto}</p>
      </div>
      {temas.length > 0 && (
        <div className="grid gap-4">
          <h4 className="text-body font-semibold text-foreground">Ranking das dores nos relatos</h4>
          <BarrasOrdenadas rotulo="Ranking das dores nos relatos" destaques={1} ordenar={false} itens={temas.map((t) => ({ rotulo: t.nome, valor: t.itens.length }))} formatar={(v) => `${v} de ${relatosTxt(n)}`} />
          <Accordion type="multiple" defaultValue={[temas[0].nome]}>
            {temas.map((t, i) => (
              <AccordionItem key={t.nome} value={t.nome}>
                <AccordionTrigger><span className="flex flex-wrap items-baseline gap-x-3"><span><span className="sr-only">{i + 1}º lugar: </span>{t.nome}</span><span className="text-body-sm font-normal text-muted-foreground">{t.itens.length} de {relatosTxt(n)}</span></span></AccordionTrigger>
                <AccordionContent className="grid gap-3">
                  {t.resumo && <p className="text-body-sm text-foreground">{t.resumo}</p>}
                  <div className="grid gap-3 md:grid-cols-3">{t.itens.slice(0, 3).map((x) => <Citacao key={x.id}>{fala(x)}</Citacao>)}</div>
                  {t.itens.length > 3 && <p className="text-body-sm text-muted-foreground">E mais {relatosTxt(t.itens.length - 3)} na aba Dados › Relatos.</p>}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {semTema > 0 && <p className="text-body-sm text-muted-foreground">{semTema === 1 ? "1 relato não entrou" : `${semTema} relatos não entraram`} em nenhum tema; leia todos na aba Dados › Relatos.</p>}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-caption text-muted-foreground" aria-live="polite">{status || origem}</p>
        {!(valida && !valida.desatualizada) && (
          <Button type="button" variant="outline" disabled={organizando} onClick={() => void organizar()}>
            {organizando ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : <Sparkles aria-hidden />}
            {organizando ? "Organizando…" : valida ? "Atualizar com IA" : "Organizar os relatos com IA"}
          </Button>
        )}
      </div>
    </article>
  );
}
