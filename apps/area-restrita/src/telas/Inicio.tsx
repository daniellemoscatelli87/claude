// Início: a mesma informação da página de HTML (public/admin/index.html), só com componentes do DS:
// Heading, Alert, GradeDeCards, Card (CardMidia, CardHeader, CardTitle, CardDescription, CardAction, CardContent,
// CardFooter), Badge, Button, LinhaDeLista, Avatar e Skeleton.
// Os cards de número usam o Card do DS enquanto o DS não tem o card de KPI como componente (o CardsDeKpi do DS é
// só demonstração, com sombra): ver docs/engineering/ADMIN_REACT.md, peças que faltam.
import * as React from "react";
import { CalendarCheck, CircleAlert, Mail, MailCheck, MailOpen, Rocket, Users, type LucideIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardMidia, CardTitle } from "@/components/ui/card";
import { GradeDeCards } from "@/components/ui/grade-de-cards";
import { Heading } from "@/components/ui/heading";
import { LinhaDeLista } from "@/components/ui/linha-de-lista";
import { Skeleton } from "@/components/ui/skeleton";
import { carregarInicio, linkDasMensagens, resumoDaLista, type DadosDaInicio } from "@/dados/inicio";
import { dataEHora, iniciais, ROTULO_DA_SITUACAO, saudacao, segmentos, situacaoDaMensagem, textoPendentes, type SituacaoDaMensagem } from "@/lib/formatar";
import { LinkDaArea } from "@/casca/base";
import { useNotificacoes } from "@/casca/notificacoes";
import { useSessao } from "@/casca/sessao";

const ICONE_DA_SITUACAO: Record<SituacaoDaMensagem, LucideIcon> = { "nao-lida": Mail, lida: MailOpen, respondida: MailCheck, reuniao: CalendarCheck };
const traco = (v: number | null) => (v == null ? "-" : String(v));
const naoVistas = (n: number, um: string, varios: string) => (n === 1 ? `1 ${um}` : `${n} ${varios}`);

type Kpi = { id: string; icone: LucideIcon; valor: number | null; rotulo: string; apoio?: string; href: string; acao: string; selo?: React.ReactNode };

function CartaoDeNumero({ kpi }: { kpi: Kpi }) {
  const Icone = kpi.icone;
  return (
    <Card data-kpi={kpi.id}>
      <CardMidia tipo="icone">
        <Icone aria-hidden />
      </CardMidia>
      <CardHeader>
        <CardDescription>{kpi.rotulo}</CardDescription>
        <CardTitle>
          <span aria-label={`${kpi.rotulo}: ${traco(kpi.valor)}`}>{traco(kpi.valor)}</span>
        </CardTitle>
        {kpi.apoio && <CardDescription>{kpi.apoio}</CardDescription>}
      </CardHeader>
      {kpi.selo && <CardContent>{kpi.selo}</CardContent>}
      <CardFooter>
        <Button variant="link" asChild className="px-0">
          <LinkDaArea href={kpi.href}>{kpi.acao}</LinkDaArea>
        </Button>
      </CardFooter>
    </Card>
  );
}

function Quando({ iso }: { iso: string }) {
  const { data, hora } = dataEHora(iso);
  return (
    <span className="text-right text-xs text-muted-foreground">
      <span className="block font-semibold text-foreground">{data}</span>
      {hora}
    </span>
  );
}

function Campos({ campos }: { campos: [string, string | null | undefined][] }) {
  return (
    <>
      {campos.map(([rotulo, valor]) => (
        <span key={rotulo} className="mt-0.5 block text-sm text-muted-foreground">
          {rotulo}: <span className="text-foreground">{valor || "-"}</span>
        </span>
      ))}
    </>
  );
}

function Lista({ titulo, id, resumo, selo, verTodos, vazio, children }: { titulo: string; id: string; resumo: string; selo?: React.ReactNode; verTodos: string; vazio: string; children: React.ReactNode[] }) {
  return (
    <section aria-labelledby={id}>
    <Card className="gap-4">
      <CardHeader>
        <Heading level={2} size="card" id={id}>{titulo}</Heading>
        <CardDescription>{resumo}</CardDescription>
        {selo && <CardAction>{selo}</CardAction>}
      </CardHeader>
      <CardContent className="px-0">
        {children.length ? <ul>{children}</ul> : <p className="px-6 text-sm text-muted-foreground">{vazio}</p>}
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="link" asChild>
          <LinkDaArea href={verTodos}>Ver todos</LinkDaArea>
        </Button>
      </CardFooter>
    </Card>
    </section>
  );
}

function Carregando() {
  return (
    <div aria-busy="true" aria-label="Carregando a Início" className="grid gap-4">
      <GradeDeCards colunas={{ base: 1, sm: 2, lg: 4 }} className="gap-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </GradeDeCards>
      {[0, 1].map((i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
    </div>
  );
}

export function Inicio() {
  const { perfil } = useSessao();
  const { dados: avisos } = useNotificacoes();
  const [dados, setDados] = React.useState<DadosDaInicio | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    document.title = "Início | Área restrita";
    carregarInicio().then(setDados, (e: Error) => setErro(e.message));
  }, []);

  const t = dados?.totais;
  const pend = t?.pendentes ?? null;
  const naoVistasParceiros = avisos.contadores.parceiros;
  const kpis: Kpi[] = [
    {
      id: "mensagens", icone: Mail, valor: t?.novas ?? null, rotulo: "Novas mensagens", apoio: "nos últimos 7 dias",
      href: linkDasMensagens(pend), acao: pend ? "Ver não respondidas" : "Ver mensagens",
      selo: pend == null ? undefined : <Badge variant={pend > 0 ? "outline" : "secondary"}>{textoPendentes(pend)}</Badge>,
    },
    { id: "reunioes", icone: CalendarCheck, valor: t?.reunioes ?? null, rotulo: "Reuniões agendadas", apoio: "a partir das mensagens", href: "/admin/reunioes/", acao: "Ver reuniões" },
    {
      id: "parceiros", icone: Users, valor: t?.parceiros7d ?? null, rotulo: "Novos parceiros", apoio: "nos últimos 7 dias", href: "/admin/parceiros/?aba=candidaturas", acao: "Ver candidaturas",
      selo: naoVistasParceiros > 0 ? <Badge variant="outline">{naoVistas(naoVistasParceiros, "não vista", "não vistas")}</Badge> : undefined,
    },
    { id: "lancamento", icone: Rocket, valor: t?.lancamento ?? null, rotulo: "Usuários aguardando lançamento", href: "/admin/lancamento/", acao: "Ver cadastros" },
  ];

  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <Heading level={1} size="page">{saudacao(perfil.nome)}</Heading>
        <p className="text-foreground">Veja as últimas mensagens de contato, candidaturas à Rede de Parceiros e cadastros para o lançamento.</p>
      </header>

      {erro && (
        <Alert variant="error">
          <CircleAlert aria-hidden />
          <AlertTitle>Não foi possível carregar os dados</AlertTitle>
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      {!dados && !erro && <Carregando />}

      {dados && (
        <div className="grid gap-6 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300">
          <section aria-label="Resumo">
            <GradeDeCards colunas={{ base: 1, sm: 2, lg: 4 }} className="gap-4">
              {kpis.map((k) => <CartaoDeNumero key={k.id} kpi={k} />)}
            </GradeDeCards>
          </section>

          <Lista
            titulo="Contato" id="h-contato" verTodos="/admin/contatos/" vazio="Nenhuma mensagem ainda."
            resumo={resumoDaLista(dados.contatos.total, "mensagem recebida", "mensagens recebidas")}
            selo={avisos.contadores.contatos > 0 ? <Badge variant="outline">{naoVistas(avisos.contadores.contatos, "não lida", "não lidas")}</Badge> : undefined}
          >
            {dados.contatos.linhas.map((r) => {
              const s = situacaoDaMensagem(r);
              const Icone = ICONE_DA_SITUACAO[s];
              return (
                <li key={r.id}>
                  <LinhaDeLista
                    as="a" href={"/admin/contatos/?id=" + r.id} data-situacao={s}
                    inicio={<Avatar className="size-9" title={ROTULO_DA_SITUACAO[s]}><AvatarFallback><Icone aria-hidden className="size-4" /><span className="sr-only">{ROTULO_DA_SITUACAO[s]}</span></AvatarFallback></Avatar>}
                    titulo={r.nome || "Sem nome"} fim={<Quando iso={r.created_at} />} quebraAcoes={false}
                  >
                    <Campos campos={[["Empresa", r.empresa], ["Cargo", r.cargo], ["Assunto", r.assunto]]} />
                  </LinhaDeLista>
                </li>
              );
            })}
          </Lista>

          <Lista
            titulo="Parceiros" id="h-parceiros" verTodos="/admin/parceiros/?aba=candidaturas" vazio="Nenhuma candidatura ainda."
            resumo={resumoDaLista(dados.candidaturas.total, "candidatura", "candidaturas")}
            selo={naoVistasParceiros > 0 ? <Badge variant="outline">{naoVistas(naoVistasParceiros, "não vista", "não vistas")}</Badge> : undefined}
          >
            {dados.candidaturas.linhas.map((r) => (
              <li key={r.id}>
                <LinhaDeLista
                  as="a" href={"/admin/parceiros/?id=" + r.id}
                  inicio={<Avatar className="size-9"><AvatarFallback>{iniciais(r.nome)}</AvatarFallback></Avatar>}
                  titulo={r.nome || "Sem nome"} fim={<Quando iso={r.created_at} />} quebraAcoes={false}
                >
                  <Campos campos={[["Empresa", r.empresa], ["Serviço", r.principal_especializacao], ["Segmento", segmentos(r.segmentos)]]} />
                </LinhaDeLista>
              </li>
            ))}
          </Lista>

          <Lista
            titulo="Lançamento" id="h-lancamento" verTodos="/admin/lancamento/" vazio="Ninguém se cadastrou para o lançamento ainda."
            resumo={resumoDaLista(dados.lancamento.total, "pessoa cadastrada", "pessoas cadastradas")}
          >
            {dados.lancamento.linhas.map((r) => {
              const { data, hora } = dataEHora(r.created_at);
              return (
                <li key={r.id}>
                  <LinhaDeLista
                    as="a" href="/admin/lancamento/" alinhar="centro"
                    inicio={<Avatar className="size-9"><AvatarFallback><Rocket aria-hidden className="size-4" /></AvatarFallback></Avatar>}
                    titulo={r.email} descricao={`${data}, ${hora}`}
                  />
                </li>
              );
            })}
          </Lista>
        </div>
      )}
    </div>
  );
}
