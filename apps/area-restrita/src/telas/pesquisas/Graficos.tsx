// Gráficos das Pesquisas: cada modelo (dados/pesquisas-resultados.ts) desenhado com um gráfico do DS, pelas regras de
// gráficos do DS (tokens --chart-*, um foco por gráfico, valores escritos fora da marca, legenda junto, tabela de dados).
// - rosca → GraficoDeRosca (quantidade de cada parte na lista);
// - barras → BarrasOrdenadas (percentual e quantidade escritos no fim); com 1º lugar e "entre os 3" → BarrasAgrupadas;
// - notas de 1 a 10 (pergunta 4) → número da nota geral + Pirulito com máximo 10 e a nota geral como referência;
// - fácil x difícil → BarrasEmpilhadas100 (Difícil, Médio, Fácil; legenda e percentuais do DS);
// - funil → Funil; dois grupos → GraficoDeHalteres; base própria por item → BarrasOrdenadas com "k de n".
import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BarrasAgrupadas, Pirulito } from "@/components/ui/graficos-catalogo";
import { BarrasEmpilhadas100, BarrasOrdenadas, Funil, GraficoDeHalteres, GraficoDeRosca, TabelaDeDados } from "@/components/ui/graficos-inteligencia";
import { fmt1, pct, semOutro, type Item } from "@/dados/pesquisas";
import type { Grafico, Tabela } from "@/dados/pesquisas-resultados";

/** "Ver números": a tabela do gráfico, recolhida (TabelaDeDados do DS dentro de um Collapsible). */
export function VerNumeros({ tabela, rotulo = "Ver números", legenda }: { tabela: Tabela; rotulo?: string; legenda: string }) {
  const [aberto, setAberto] = React.useState(false);
  return (
    <Collapsible open={aberto} onOpenChange={setAberto} className="grid gap-2" data-ver-numeros="">
      <CollapsibleTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="w-fit px-2"><ChevronDown aria-hidden className={aberto ? "rotate-180 transition-transform" : "transition-transform"} />{rotulo}</Button>
      </CollapsibleTrigger>
      <CollapsibleContent><TabelaDeDados dados={tabela} legenda={legenda} /></CollapsibleContent>
    </Collapsible>
  );
}

const ordenarItens = (itens: Item[], ordem: "valor" | "natural" | "fixa") =>
  ordem === "valor" ? [...itens].sort((a, b) => (a.fixo ? 1 : 0) - (b.fixo ? 1 : 0) || b.v - a.v) : itens;
const quantasPessoas = (v: number) => `${v} ${v === 1 ? "pessoa" : "pessoas"}`;

export function GraficoDaPesquisa({ g, rotulo }: { g: Grafico; rotulo: string }) {
  switch (g.tipo) {
    case "rosca": {
      const partes = g.itens.filter((i) => i.v).map((i) => ({ rotulo: semOutro(i.rotulo), valor: i.v, neutro: !!i.fixo }));
      if (!partes.length) return null;
      return <GraficoDeRosca rotulo={rotulo} partes={partes} centro={{ valor: g.centro, rotulo: g.rotCentro }} formatarQuantidade={quantasPessoas} tamanho={180} />;
    }
    case "barras": {
      const itens = ordenarItens(g.itens, g.ordem);
      const max = Math.max(0, ...itens.filter((i) => !i.fixo).map((i) => i.v));
      if (g.camada) {
        return <BarrasAgrupadas rotulo={rotulo} series={g.camada} maximo={100} formatar={(v) => v + "%"} grupos={itens.map((i) => ({ rotulo: semOutro(i.rotulo), valores: [pct(i.v, g.total), pct(i.v2 || 0, g.total)] }))} />;
      }
      // Valor escrito no fim de cada barra: percentual e quantidade ("42% · 5"); a mais escolhida em destaque.
      // As barras seguem a quantidade (mesma base para todas, então a proporção é a do percentual).
      return (
        <BarrasOrdenadas
          rotulo={rotulo} ordenar={false} posicao={false} destaques={g.ordem === "valor" && max > 0 ? 1 : 0}
          itens={itens.map((i) => ({ rotulo: semOutro(i.rotulo), valor: i.v }))}
          formatar={(v) => `${pct(v, g.total)}% · ${v}`}
        />
      );
    }
    case "notas":
      return (
        <div className="grid gap-4">
          <p className="flex flex-wrap items-baseline gap-x-3"><span className="text-h2 font-bold tabular-nums text-foreground">{fmt1(g.media)}</span><span className="text-body-sm text-muted-foreground">nota geral (média dos aspectos), de 1 a 10</span></p>
          <Pirulito
            rotulo={rotulo} ordenar={false} destaques={1} maximo={10} formatar={(v) => fmt1(v) + " de 10"}
            referencia={{ valor: g.media, rotulo: "Nota geral" }}
            itens={[...g.aspectos.filter((a) => a.destaque), ...g.aspectos.filter((a) => !a.destaque)].map((a) => ({ rotulo: a.rotulo, valor: Math.round(a.m * 10) / 10 }))}
          />
        </div>
      );
    case "facilDificil": {
      const so = g.linhas.filter((l) => !l.n);
      return (
        <div className="grid gap-3">
          <BarrasEmpilhadas100 rotulo={rotulo} categorias={[{ rotulo: "Difícil" }, { rotulo: "Médio" }, { rotulo: "Fácil", neutro: true }]} linhas={g.linhas.filter((l) => l.n).map((l) => ({ rotulo: l.rotulo + (l.na ? ` (${l.na} não se aplica)` : ""), valores: [l.dif, l.med, l.fac] }))} />
          {so.length > 0 && <p className="text-body-sm text-muted-foreground">Só “Não se aplica”: {so.map((l) => l.rotulo).join(", ")}.</p>}
        </div>
      );
    }
    case "funil":
      return <Funil rotulo={rotulo} etapas={g.etapas.map((e) => ({ rotulo: e.rotulo, valor: e.v }))} rotulos={{ seguiram: (p) => `${p} da etapa anterior` }} />;
    case "halteres": {
      const fmt = (v: number) => (g.decimal ? fmt1(v) : v + "%");
      return (
        <div className="grid gap-2">
          <GraficoDeHalteres rotulo={g.rotulo} series={[g.b.rot, g.a.rot]} maximo={g.max} formatar={fmt} itens={[{ rotulo: g.rotulo, a: g.b.v, b: g.a.v }]} />
          <p className="text-body-sm text-muted-foreground">{[g.a, g.b].map((x) => `${x.rot}: ${fmt(x.v)} (${x.k != null ? `${x.k} de ${x.n} pessoas` : `${x.n} pessoas`})`).join(" · ")}</p>
        </div>
      );
    }
    case "barrasPct":
      return <BarrasOrdenadas rotulo={rotulo} ordenar={false} posicao={false} destaques={g.destaques} itens={g.itens.map((i) => ({ rotulo: `${i.rotulo} (${i.k} de ${i.n})`, valor: pct(i.k, i.n) }))} formatar={(v) => v + "%"} />;
  }
}
