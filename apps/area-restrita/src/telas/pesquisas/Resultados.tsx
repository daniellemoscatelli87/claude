// Aba Resultado: "Quem chegou até onde" (Funil do DS) e um card por pergunta, agrupado por tema. Cada card: número,
// pergunta, quantas responderam, "Resumo" (Alert informativo do DS), o gráfico (Graficos.tsx), as notas e "Ver números".
// No celular, o gráfico e os números ficam recolhidos (Collapsible) e abrem pelo botão do card; do tablet em diante,
// sempre à vista. Cards lado a lado com a mesma altura (GradeDeCards); os largos ocupam a linha inteira.
import * as React from "react";
import { ChevronDown, ClipboardList, Lightbulb } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { GradeDeCards } from "@/components/ui/grade-de-cards";
import { TabelaDeDados } from "@/components/ui/graficos-inteligencia";
import { CardComCabecalho } from "@/components/ui/painel-dados";
import { useIsMobile } from "@/components/ui/use-mobile";
import { plural, type DadosDoPainel } from "@/dados/pesquisas";
import { resultados, type CardDeResultado, type Leitura } from "@/dados/pesquisas-resultados";
import { GraficoDaPesquisa, VerNumeros } from "./Graficos";

export const LeituraEmTexto = ({ l }: { l: Leitura }) => <>{l.map((x, i) => (typeof x === "string" ? x : <strong key={i}>{x.b}</strong>))}</>;

export function CardDaPergunta({ c, imprimir }: { c: CardDeResultado; imprimir?: boolean }) {
  const celular = useIsMobile();
  const [aberto, setAberto] = React.useState(false);
  const mostrar = imprimir || !celular || aberto;
  const idDoTitulo = "q-" + c.id;
  const corpo = (
    <div className="grid gap-4">
      <GraficoDaPesquisa g={c.grafico} rotulo={c.titulo} />
      {(c.notas.length > 0 || c.outros.length > 0 || c.tabela) && (
        <div className="grid gap-3 border-t border-border pt-3">
          {c.notas.map((t) => <p key={t} className="text-body-sm text-muted-foreground">{t}</p>)}
          {c.outros.length > 0 && (
            <div className="grid gap-1">
              <p className="text-body-sm font-semibold text-foreground">O que escreveram em “outro”</p>
              <ul className="grid list-disc gap-1 pl-5 text-body-sm text-foreground">{c.outros.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
          )}
          {c.tabela && (imprimir ? <TabelaDeDados dados={c.tabela} legenda={"Números: " + c.titulo} /> : <VerNumeros tabela={c.tabela} legenda={"Números: " + c.titulo} />)}
        </div>
      )}
    </div>
  );
  return (
    <Card className="gap-4" aria-labelledby={idDoTitulo} data-q={c.id}>
      <CardHeader className="flex flex-row items-start gap-3">
        <Badge variant="outline" className="mt-0.5 shrink-0 tabular-nums">{c.num}</Badge>
        <div className="grid min-w-0 flex-1 gap-1">
          <h3 id={idDoTitulo} className="text-body font-semibold text-foreground">{c.titulo}</h3>
          <p className="text-body-sm text-muted-foreground">{[plural(c.base, "resposta", "respostas"), ...c.meta].join(" · ")}</p>
        </div>
        {celular && !imprimir && c.base > 0 && (
          <Button type="button" variant="ghost" size="icon" aria-expanded={aberto} aria-controls={"q-corpo-" + c.id} aria-label={(aberto ? "Esconder gráfico e números: " : "Mostrar gráfico e números: ") + c.titulo} onClick={() => setAberto((v) => !v)}>
            <ChevronDown aria-hidden className={aberto ? "rotate-180 transition-transform" : "transition-transform"} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="grid gap-4">
        {!c.base ? (
          <EstadoVazio variante="lista" tamanho="sm" icone={<ClipboardList />} titulo="Ainda sem respostas aqui" descricao="O gráfico aparece com a primeira resposta a esta pergunta." />
        ) : (
          <>
            {c.leitura && (
              <Alert variant="info">
                <Lightbulb aria-hidden />
                <AlertTitle>Resumo</AlertTitle>
                <AlertDescription><p><LeituraEmTexto l={c.leitura} /></p></AlertDescription>
              </Alert>
            )}
            {mostrar && <div id={"q-corpo-" + c.id} className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300">{corpo}</div>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
/** Cards de um tema: os normais lado a lado (mesma altura); um card largo ocupa a linha inteira, na ordem das perguntas. */
export function GradeDePerguntas({ cards, imprimir }: { cards: CardDeResultado[]; imprimir?: boolean }) {
  const blocos: CardDeResultado[][] = [];
  cards.forEach((c) => { const ult = blocos[blocos.length - 1]; if (c.largo || !ult || ult[0].largo) blocos.push([c]); else ult.push(c); });
  return (
    <div className="grid gap-4">
      {blocos.map((b) => (b[0].largo ? <CardDaPergunta key={b[0].id} c={b[0]} imprimir={imprimir} /> : (
        <GradeDeCards key={b[0].id} colunas={{ base: 1, lg: 2 }} layout={imprimir ? "lista" : "auto"}>{b.map((c) => <CardDaPergunta key={c.id} c={c} imprimir={imprimir} />)}</GradeDeCards>
      )))}
    </div>
  );
}

export function Resultados({ d, imprimir }: { d: DadosDoPainel; imprimir?: boolean }) {
  const m = React.useMemo(() => resultados(d), [d]);
  if (m.vazio) {
    return <Card><CardContent className="pt-6"><EstadoVazio icone={<ClipboardList />} titulo="Ainda não há respostas" descricao="Compartilhe o link. Cada participação aparece aqui na hora, e o sino avisa quando chegar uma nova." /></CardContent></Card>;
  }
  return (
    <div className="grid gap-8 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300">
      <CardComCabecalho icone={<ClipboardList />} titulo="Quem chegou até onde" descricao="Da entrada na pesquisa até o pedido de avisos sobre o lançamento.">
        <div className="grid gap-4">
          <GraficoDaPesquisa g={{ tipo: "funil", etapas: m.funil.etapas }} rotulo="Quem chegou até onde" />
          <p className="text-body-sm text-muted-foreground">{m.funil.nota}</p>
        </div>
      </CardComCabecalho>
      {m.temas.map((t, i) => (
        <section key={t.nome || "soltos-" + i} aria-labelledby={t.nome ? "tema-" + i : undefined} className="grid gap-4">
          {t.nome && (
            <div className="grid gap-1">
              <h2 id={"tema-" + i} className="text-h4 font-bold text-foreground">{t.nome}</h2>
              <p className="text-body-sm text-muted-foreground">{t.sub}</p>
            </div>
          )}
          <GradeDePerguntas cards={t.cards} imprimir={imprimir} />
        </section>
      ))}
      <p className="text-body-sm text-muted-foreground">{m.notaFinal}</p>
    </div>
  );
}
