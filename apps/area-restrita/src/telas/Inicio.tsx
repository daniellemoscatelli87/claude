// Início: a mesma informação da página de HTML (public/admin/index.html), organizada por prioridade e só com
// componentes do Design System Dani Moscatelli:
// - CabecalhoDaPagina (painel-cabecalho), "Opção A": saudação e uma linha curta, fora dos cards, no fundo cinza;
// - AlertaComAcao tom "aviso" (âmbar): o que fazer agora (responder mensagens, ver candidaturas), com a ação direta;
//   ou tom "sucesso", "Tudo em dia";
// - CardIndicador compacto (painel-dados) numa GradeDeCards: rótulo, número e uma linha de contexto, o card inteiro é
//   o link; 4 lado a lado a partir de um conteúdo de 44rem, 2 × 2 antes disso (no celular, só rótulo e número);
// - CardComCabecalho + LinkVerTudo + DivisorSuave: Contato, Parceiros e Lançamento, um por linha (regra da
//   GradeDeCards: com conteúdos de alturas muito diferentes, um card por linha, sem área vazia);
// - BarraDeComposicao: situação das últimas mensagens (título, barra e legenda com ponto, quantidade e percentual);
// - LinhaDeLista + IconeComBase + ChipDeEstado: cada linha com o estado em texto, na coluna do fim;
// - Skeleton no carregamento e Alert no erro.
import * as React from "react";
import { CalendarCheck, CircleAlert, Mail, MailCheck, MailOpen, Rocket, Users, type LucideIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertaComAcao, BotaoDoAlerta, LinkDoAlerta } from "@/components/ui/alerta-com-acao";
import { BarraDeComposicao } from "@/components/ui/barra-de-composicao";
import { ChipDeEstado, type TomDoChip } from "@/components/ui/chip-de-estado";
import { GradeDeCards } from "@/components/ui/grade-de-cards";
import { LinhaDeLista } from "@/components/ui/linha-de-lista";
import { CabecalhoDaPagina } from "@/components/ui/painel-cabecalho";
import { CardComCabecalho, CardIndicador, DivisorSuave, IconeComBase, LinkVerTudo } from "@/components/ui/painel-dados";
import { Skeleton } from "@/components/ui/skeleton";
import { carregarInicio, linkDasMensagens, type Contato, type DadosDaInicio } from "@/dados/inicio";
import { diaCurto, plural, segmentos, situacaoDaMensagem, type SituacaoDaMensagem } from "@/lib/formatar";
import { LinkDaArea } from "@/casca/base";
import { useNotificacoes } from "@/casca/notificacoes";
import { useSessao } from "@/casca/sessao";
import { Vazio } from "./comum";

/** Quantas linhas cada lista mostra na Início (o resto fica em "Ver todas"). */
const LINHAS_NA_INICIO = 5;

/**
 * Estado de cada mensagem: o mesmo sinal em toda a tela. Pendentes (não lida, sem resposta) no tom da marca e nos tons
 * 1 e 2 do gráfico; resolvidas (respondida, reunião marcada) no tom neutro e nos tons de contexto do gráfico.
 */
const ESTADO_DA_MENSAGEM: Record<SituacaoDaMensagem, { rotulo: string; icone: LucideIcon; tom: TomDoChip & ("marca" | "neutro"); tomDoGrafico: number }> = {
  "nao-lida": { rotulo: "Não lida", icone: Mail, tom: "marca", tomDoGrafico: 1 },
  lida: { rotulo: "Lida, sem resposta", icone: MailOpen, tom: "marca", tomDoGrafico: 2 },
  respondida: { rotulo: "Respondida", icone: MailCheck, tom: "neutro", tomDoGrafico: 6 },
  reuniao: { rotulo: "Reunião marcada", icone: CalendarCheck, tom: "neutro", tomDoGrafico: 5 },
};
const ORDEM_DAS_SITUACOES: SituacaoDaMensagem[] = ["nao-lida", "lida", "respondida", "reuniao"];

/** Números: 2 × 2 até um conteúdo de 44rem; 4 lado a lado a partir dele (cada card com ~168 px ou mais). */
const GRADE_DOS_NUMEROS = "gap-4 @min-[44rem]/conteudo:grid-cols-4";

const juntar = (...partes: (string | null | undefined)[]) => partes.map((p) => (p || "").trim()).filter(Boolean).join(" · ");

/** Linha de apoio do card em partes que nunca se partem ao meio ("6 sem resposta" fica inteiro na quebra de linha). */
function EmPartes({ partes }: { partes: (string | null | undefined)[] }) {
  const p = partes.filter(Boolean) as string[];
  return <>{p.map((x, i) => <React.Fragment key={x}>{i > 0 && " · "}<span className="whitespace-nowrap">{x}</span></React.Fragment>)}</>;
}

/** "Bom dia, **Dani**!": o nome em destaque no título (Heading do DS). */
function tituloDaSaudacao(nome: string, hora = new Date().getHours()) {
  const parte = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  return `${parte}, **${nome.trim().split(/\s+/)[0] || nome}**!`;
}

/** Dias desde a mensagem mais antiga sem resposta, só quando todas as sem resposta estão entre as carregadas. */
function diasDaMaisAntiga(linhas: Contato[], pendentes: number, agora = Date.now()) {
  const sem = linhas.filter((r) => !r.respondido_em);
  if (!sem.length || sem.length !== pendentes) return null;
  const mais = Math.min(...sem.map((r) => new Date(r.created_at).getTime()));
  return Math.floor((agora - mais) / 864e5);
}

function Prioridade({ dados }: { dados: DadosDaInicio }) {
  const { dados: avisos, carregando } = useNotificacoes();
  const pend = dados.totais.pendentes;
  const naoVistas = avisos.contadores.parceiros;
  if (pend == null || carregando) return null;
  if (pend === 0 && naoVistas === 0) {
    return (
      <AlertaComAcao tom="sucesso" titulo="Tudo em dia">
        Nenhuma mensagem esperando resposta e nenhuma candidatura por ver.
      </AlertaComAcao>
    );
  }
  const dias = pend > 0 ? diasDaMaisAntiga(dados.contatos.linhas, pend) : null;
  const oQueFazer =
    pend > 0 && naoVistas > 0 ? "Responda as mensagens que esperam retorno e veja as candidaturas novas."
    : pend > 0 ? "Responda as mensagens que esperam retorno."
    : "Veja as candidaturas novas da Rede de Parceiros.";
  const espera = dias == null ? "" : dias === 0 ? " A mais antiga chegou hoje." : dias === 1 ? " A mais antiga espera desde ontem." : ` A mais antiga espera há ${dias} dias.`;
  const candidaturas = <LinkDaArea href="/admin/parceiros/?aba=candidaturas">Ver candidaturas</LinkDaArea>;
  return (
    <AlertaComAcao
      tom="aviso"
      titulo="Precisa da sua atenção"
      data-prioridade=""
      acoes={
        pend > 0 ? (
          <>
            <BotaoDoAlerta asChild>
              <LinkDaArea href={linkDasMensagens(pend)}>Responder mensagens</LinkDaArea>
            </BotaoDoAlerta>
            {naoVistas > 0 && <LinkDoAlerta asChild>{candidaturas}</LinkDoAlerta>}
          </>
        ) : (
          <BotaoDoAlerta asChild>{candidaturas}</BotaoDoAlerta>
        )
      }
    >
      {oQueFazer + espera}
    </AlertaComAcao>
  );
}

/** Data e estado na coluna do fim: no computador, um embaixo do outro; no celular, lado a lado, embaixo do texto. */
function FimDaLinha({ iso, estado }: { iso: string; estado?: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
      {estado}
      <span className="whitespace-nowrap text-body-sm tabular-nums text-muted-foreground">{diaCurto(iso)}</span>
    </span>
  );
}


/** Situação das últimas mensagens (só as carregadas), para ver de relance como está a resposta. */
function SituacaoDasMensagens({ linhas }: { linhas: Contato[] }) {
  // Com poucas mensagens, a barra não diz mais que a própria lista.
  if (linhas.length < LINHAS_NA_INICIO) return null;
  const partes = ORDEM_DAS_SITUACOES.map((s) => ({
    rotulo: ESTADO_DA_MENSAGEM[s].rotulo,
    valor: linhas.filter((r) => situacaoDaMensagem(r) === s).length,
    tom: ESTADO_DA_MENSAGEM[s].tomDoGrafico,
  }));
  return (
    <div className="px-5 sm:px-6">
      <BarraDeComposicao titulo={`Situação das ${plural(linhas.length, "última mensagem", "últimas mensagens")}`} partes={partes} />
      <DivisorSuave className="mt-5 mb-2" />
    </div>
  );
}

function Carregando() {
  return (
    <div aria-busy="true" aria-label="Carregando a Início" className="grid gap-6">
      <Skeleton className="h-28 rounded-lg" />
      <GradeDeCards colunas={{ base: 2 }} className={GRADE_DOS_NUMEROS}>
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </GradeDeCards>
      <Skeleton className="h-80 rounded-xl" />
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
  const avisadas = dados && t?.lancamento != null ? dados.lancamento.total - t.lancamento : null;
  const naoVistas = avisos.contadores.parceiros;

  return (
    <div className="grid gap-6">
      <CabecalhoDaPagina titulo={tituloDaSaudacao(perfil.nome)} descricao="O que chegou pelo site." />

      {erro && (
        <Alert variant="error">
          <CircleAlert aria-hidden />
          <AlertTitle>Não foi possível carregar os dados</AlertTitle>
          <AlertDescription>{erro} Recarregue a página para tentar de novo.</AlertDescription>
        </Alert>
      )}

      {!dados && !erro && <Carregando />}

      {dados && t && (
        <div className="grid gap-6 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
          <Prioridade dados={dados} />

          <section aria-label="Resumo">
            <GradeDeCards colunas={{ base: 2 }} className={GRADE_DOS_NUMEROS}>
              <CardIndicador data-kpi="mensagens" compacto soNumeroNoCelular as={LinkDaArea} href="/admin/contatos/" icone={<Mail />} valor={t.novas} rotulo="Mensagens" apoio="nos últimos 7 dias" />
              <CardIndicador data-kpi="reunioes" compacto soNumeroNoCelular as={LinkDaArea} href="/admin/reunioes/" icone={<CalendarCheck />} valor={t.reunioes} rotulo="Reuniões" apoio="marcadas pelo site" />
              <CardIndicador data-kpi="parceiros" compacto soNumeroNoCelular as={LinkDaArea} href="/admin/parceiros/?aba=candidaturas" icone={<Users />} valor={t.parceiros7d} rotulo="Candidaturas" apoio="nos últimos 7 dias" />
              <CardIndicador
                data-kpi="lancamento" compacto soNumeroNoCelular as={LinkDaArea} href="/admin/lancamento/" icone={<Rocket />} valor={t.lancamento} rotulo="Lançamento"
                total={avisadas ? dados.lancamento.total : undefined} apoio="aguardando o aviso"
              />
            </GradeDeCards>
          </section>

          <CardComCabecalho
            idDoTitulo="h-contato" icone={<Mail />} titulo="Contato" sangria
            descricao={<EmPartes partes={[
              plural(dados.contatos.total, "mensagem recebida", "mensagens recebidas"),
              // "sem resposta" (respondido_em vazio) inclui as não lidas; "não lidas" é o mesmo número do contador do menu
              t.pendentes ? `${t.pendentes} sem resposta` : null,
              avisos.contadores.contatos ? plural(avisos.contadores.contatos, "não lida", "não lidas") : null,
            ]} />}
            acao={dados.contatos.total > 0 && <LinkVerTudo as={LinkDaArea} href="/admin/contatos/" rotulo="Ver todas as mensagens">Ver todas</LinkVerTudo>}
          >
            <SituacaoDasMensagens linhas={dados.contatos.linhas} />
            {dados.contatos.linhas.length ? (
              <ul>
                {dados.contatos.linhas.slice(0, LINHAS_NA_INICIO).map((r) => {
                  const s = situacaoDaMensagem(r);
                  const e = ESTADO_DA_MENSAGEM[s];
                  const Icone = e.icone;
                  return (
                    <li key={r.id}>
                      <LinhaDeLista
                        as="a" href={"/admin/contatos/?id=" + r.id} data-situacao={s} className="px-5 sm:px-6"
                        inicio={<IconeComBase tom={e.tom} redonda><Icone /></IconeComBase>}
                        titulo={r.nome || "Sem nome"}
                        descricao={juntar(r.empresa, r.cargo) || undefined}
                        fim={<FimDaLinha iso={r.created_at} estado={<ChipDeEstado tom={e.tom}>{e.rotulo}</ChipDeEstado>} />}
                      >
                        {r.assunto && <span className="mt-0.5 line-clamp-2 block text-body-sm text-foreground">{r.assunto}</span>}
                      </LinhaDeLista>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Vazio className="px-5 sm:px-6">Nenhuma mensagem ainda. As mensagens do formulário de contato do site aparecem aqui.</Vazio>
            )}
          </CardComCabecalho>

          <CardComCabecalho
            idDoTitulo="h-parceiros" icone={<Users />} titulo="Parceiros" sangria
            descricao={<EmPartes partes={[
              plural(dados.candidaturas.total, "candidatura", "candidaturas"),
              naoVistas ? plural(naoVistas, "não vista", "não vistas") : null,
              // o contador de Parceiros no menu soma as candidaturas não vistas e os e-mails abertos pelos parceiros
              avisos.contadores.emails ? plural(avisos.contadores.emails, "e-mail aberto", "e-mails abertos") : null,
            ]} />}
            acao={dados.candidaturas.total > 0 && <LinkVerTudo as={LinkDaArea} href="/admin/parceiros/?aba=candidaturas" rotulo="Ver todas as candidaturas">Ver todas</LinkVerTudo>}
          >
            {dados.candidaturas.linhas.length ? (
              <ul>
                {dados.candidaturas.linhas.slice(0, LINHAS_NA_INICIO).map((r) => {
                  const nova = !r.visualizado_em;
                  return (
                    <li key={r.id}>
                      <LinhaDeLista
                        as="a" href={"/admin/parceiros/?id=" + r.id} className="px-5 sm:px-6"
                        inicio={<IconeComBase tom={nova ? "marca" : "neutro"} redonda><Users /></IconeComBase>}
                        titulo={r.nome || "Sem nome"}
                        descricao={juntar(r.empresa, r.principal_especializacao) || undefined}
                        fim={<FimDaLinha iso={r.created_at} estado={<ChipDeEstado tom={nova ? "marca" : "neutro"}>{nova ? "Não vista" : "Vista"}</ChipDeEstado>} />}
                      >
                        {segmentos(r.segmentos) && <span className="mt-0.5 block text-body-sm text-foreground">{segmentos(r.segmentos)}</span>}
                      </LinhaDeLista>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Vazio className="px-5 sm:px-6">Nenhuma candidatura ainda. Quem se candidatar à Rede de Parceiros aparece aqui.</Vazio>
            )}
          </CardComCabecalho>

          <CardComCabecalho
            idDoTitulo="h-lancamento" icone={<Rocket />} titulo="Lançamento" sangria
            descricao={<EmPartes partes={[plural(dados.lancamento.total, "pessoa cadastrada", "pessoas cadastradas"), t.lancamento ? `${t.lancamento} aguardando o aviso` : null]} />}
            acao={dados.lancamento.total > 0 && <LinkVerTudo as={LinkDaArea} href="/admin/lancamento/" rotulo="Ver todos os cadastros do lançamento">Ver todos</LinkVerTudo>}
          >
            {dados.lancamento.linhas.length ? (
              <ul>
                {dados.lancamento.linhas.slice(0, LINHAS_NA_INICIO).map((r) => (
                  <li key={r.id}>
                    <LinhaDeLista
                      as="a" href="/admin/lancamento/" alinhar="centro" className="px-5 sm:px-6"
                      inicio={<IconeComBase tom="neutro" redonda><Rocket /></IconeComBase>}
                      titulo={r.email}
                      descricao={diaCurto(r.created_at)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio className="px-5 sm:px-6">Ninguém se cadastrou ainda. Quem pedir aviso do lançamento no site aparece aqui.</Vazio>
            )}
          </CardComCabecalho>
        </div>
      )}
    </div>
  );
}
