// Início: a mesma informação da página de HTML (public/admin/index.html), organizada por prioridade e só com
// componentes do Design System Dani Moscatelli:
// - CabecalhoDaPagina (painel-cabecalho), "Opção A": saudação fora dos cards, no fundo cinza;
// - AlertaComAcao: o que pede ação agora (mensagens sem resposta, candidaturas não vistas) com a ação direta, ou
//   "Tudo em dia" quando não há nada pendente;
// - CardIndicador (painel-dados) numa GradeDeCards: os 4 números, cada card inteiro é o link para a página;
//   4 lado a lado só quando cada card tem ao menos 14rem (contêiner de 60rem), senão 2 × 2, e 1 no celular;
// - CardComCabecalho + LinhaDeLista + IconeComBase: as listas, compactas (nome, empresa · cargo, assunto, data);
// - BarrasEmpilhadas100 (graficos-inteligencia): situação das últimas mensagens (só com os dados já carregados);
// - Skeleton no carregamento e Alert no erro.
import * as React from "react";
import { CalendarCheck, CircleAlert, Mail, MailCheck, MailOpen, Rocket, Users, type LucideIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertaComAcao, BotaoDoAlerta, LinkDoAlerta } from "@/components/ui/alerta-com-acao";
import { BarrasEmpilhadas100 } from "@/components/ui/graficos-inteligencia";
import { GradeDeCards } from "@/components/ui/grade-de-cards";
import { LinhaDeLista } from "@/components/ui/linha-de-lista";
import { CabecalhoDaPagina } from "@/components/ui/painel-cabecalho";
import { CardComCabecalho, CardIndicador, DivisorSuave, IconeComBase, LinkVerTudo } from "@/components/ui/painel-dados";
import { Skeleton } from "@/components/ui/skeleton";
import { carregarInicio, linkDasMensagens, type Contato, type DadosDaInicio } from "@/dados/inicio";
import { diaCurto, plural, ROTULO_DA_SITUACAO, segmentos, situacaoDaMensagem, type SituacaoDaMensagem } from "@/lib/formatar";
import { LinkDaArea } from "@/casca/base";
import { useNotificacoes } from "@/casca/notificacoes";
import { useSessao } from "@/casca/sessao";

/** Quantas linhas cada lista mostra na Início (o resto fica em "Ver todas"). */
const LINHAS_NA_INICIO = 5;

const ICONE_DA_SITUACAO: Record<SituacaoDaMensagem, LucideIcon> = { "nao-lida": Mail, lida: MailOpen, respondida: MailCheck, reuniao: CalendarCheck };
const ORDEM_DAS_SITUACOES: SituacaoDaMensagem[] = ["nao-lida", "lida", "respondida", "reuniao"];

/** Grade dos números: 1 coluna no celular, 2 a partir de 28rem e 4 só com 66rem (cada card com ao menos ~15,75rem: o rótulo cabe numa linha). */
const GRADE_DOS_NUMEROS = "gap-4 @min-[28rem]/conteudo:grid-cols-2 @min-[66rem]/conteudo:grid-cols-4";

const juntar = (...partes: (string | null | undefined)[]) => partes.map((p) => (p || "").trim()).filter(Boolean).join(" · ");

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
        Nenhuma mensagem esperando resposta e nenhuma candidatura por ver. O que chegar de novo aparece aqui primeiro.
      </AlertaComAcao>
    );
  }
  const dias = pend > 0 ? diasDaMaisAntiga(dados.contatos.linhas, pend) : null;
  const frases = [
    pend > 0 && `${plural(pend, "mensagem espera", "mensagens esperam")} resposta${dias == null ? "" : dias === 0 ? ", a mais antiga de hoje" : dias === 1 ? ", a mais antiga de ontem" : `, a mais antiga de ${dias} dias atrás`}.`,
    naoVistas > 0 && `${plural(naoVistas, "candidatura à Rede de Parceiros ainda não foi vista", "candidaturas à Rede de Parceiros ainda não foram vistas")}.`,
  ].filter(Boolean);
  return (
    <AlertaComAcao
      tom="info"
      titulo="Precisa da sua atenção"
      data-prioridade=""
      acoes={
        <>
          {pend > 0 && (
            <BotaoDoAlerta asChild>
              <LinkDaArea href={linkDasMensagens(pend)}>Responder mensagens</LinkDaArea>
            </BotaoDoAlerta>
          )}
          {naoVistas > 0 &&
            (pend > 0 ? (
              <LinkDoAlerta asChild>
                <LinkDaArea href="/admin/parceiros/?aba=candidaturas">Ver candidaturas</LinkDaArea>
              </LinkDoAlerta>
            ) : (
              <BotaoDoAlerta asChild>
                <LinkDaArea href="/admin/parceiros/?aba=candidaturas">Ver candidaturas</LinkDaArea>
              </BotaoDoAlerta>
            ))}
        </>
      }
    >
      {frases.join(" ")}
    </AlertaComAcao>
  );
}

function Data({ iso }: { iso: string }) {
  return <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{diaCurto(iso)}</span>;
}

function Vazio({ children }: { children: React.ReactNode }) {
  return <p className="px-5 text-sm text-muted-foreground sm:px-6">{children}</p>;
}

/** Situação das últimas mensagens (só as carregadas), para ver de relance como está a resposta. */
function SituacaoDasMensagens({ linhas }: { linhas: Contato[] }) {
  // Com poucas mensagens, a barra não diz mais que a própria lista.
  if (linhas.length < LINHAS_NA_INICIO) return null;
  const contagem = ORDEM_DAS_SITUACOES.map((s) => linhas.filter((r) => situacaoDaMensagem(r) === s).length);
  const categorias = ORDEM_DAS_SITUACOES.map((s) => ({ rotulo: ROTULO_DA_SITUACAO[s] })).filter((_, i) => contagem[i]! > 0);
  const valores = contagem.filter((v) => v > 0);
  const rotulo = `Situação das ${plural(linhas.length, "última mensagem", "últimas mensagens")}`;
  return (
    <div className="px-5 pb-2 sm:px-6">
      <BarrasEmpilhadas100 rotulo={rotulo} categorias={categorias} linhas={[{ rotulo, valores }]} />
      <DivisorSuave className="mt-5" />
    </div>
  );
}

function Carregando() {
  return (
    <div aria-busy="true" aria-label="Carregando a Início" className="grid gap-6">
      <Skeleton className="h-28 rounded-lg" />
      <GradeDeCards className={GRADE_DOS_NUMEROS}>
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </GradeDeCards>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

export function Inicio() {
  const { perfil } = useSessao();
  const [dados, setDados] = React.useState<DadosDaInicio | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    document.title = "Início | Área restrita";
    carregarInicio().then(setDados, (e: Error) => setErro(e.message));
  }, []);

  const t = dados?.totais;
  const avisadas = dados && t?.lancamento != null ? dados.lancamento.total - t.lancamento : null;

  return (
    <div className="grid gap-6">
      <CabecalhoDaPagina
        titulo={tituloDaSaudacao(perfil.nome)}
        descricao="O que chegou pelo site: mensagens de contato, candidaturas à Rede de Parceiros e cadastros para o lançamento."
      />

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
            <GradeDeCards className={GRADE_DOS_NUMEROS}>
              <CardIndicador data-kpi="mensagens" as={LinkDaArea} href="/admin/contatos/" icone={<Mail />} valor={t.novas} rotulo="Mensagens na semana" />
              <CardIndicador data-kpi="reunioes" as={LinkDaArea} href="/admin/reunioes/" icone={<CalendarCheck />} valor={t.reunioes} rotulo="Reuniões marcadas" />
              <CardIndicador data-kpi="parceiros" as={LinkDaArea} href="/admin/parceiros/?aba=candidaturas" icone={<Users />} valor={t.parceiros7d} rotulo="Candidaturas na semana" />
              <CardIndicador
                data-kpi="lancamento" as={LinkDaArea} href="/admin/lancamento/" icone={<Rocket />} valor={t.lancamento} rotulo="Aguardando o lançamento"
                total={avisadas ? dados.lancamento.total : undefined}
                apoio={avisadas ? `${plural(avisadas, "pessoa já avisada", "pessoas já avisadas")}` : "Recebem o aviso quando o produto for lançado"}
              />
            </GradeDeCards>
          </section>

          <CardComCabecalho
            idDoTitulo="h-contato" icone={<Mail />} titulo="Contato" sangria
            descricao={plural(dados.contatos.total, "mensagem recebida", "mensagens recebidas")}
            acao={dados.contatos.total > 0 && <LinkVerTudo as={LinkDaArea} href="/admin/contatos/" rotulo="Ver todas as mensagens">Ver todas</LinkVerTudo>}
          >
            <SituacaoDasMensagens linhas={dados.contatos.linhas} />
            {dados.contatos.linhas.length ? (
              <ul>
                {dados.contatos.linhas.slice(0, LINHAS_NA_INICIO).map((r) => {
                  const s = situacaoDaMensagem(r);
                  const Icone = ICONE_DA_SITUACAO[s];
                  return (
                    <li key={r.id}>
                      <LinhaDeLista
                        as="a" href={"/admin/contatos/?id=" + r.id} data-situacao={s} className="px-5 sm:px-6"
                        inicio={<IconeComBase tom={s === "nao-lida" ? "marca" : "neutro"} redonda><Icone /></IconeComBase>}
                        titulo={<>{r.nome || "Sem nome"}<span className="sr-only">, {ROTULO_DA_SITUACAO[s]}</span></>}
                        descricao={juntar(r.empresa, r.cargo) || undefined}
                        fim={<Data iso={r.created_at} />}
                        quebraAcoes={false}
                      >
                        {r.assunto && <span className="mt-0.5 line-clamp-2 block text-sm text-foreground">{r.assunto}</span>}
                      </LinhaDeLista>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Vazio>Nenhuma mensagem ainda. As mensagens do formulário de contato do site aparecem aqui.</Vazio>
            )}
          </CardComCabecalho>

          <GradeDeCards className="gap-6 @min-[60rem]/conteudo:grid-cols-2">
            <CardComCabecalho
              idDoTitulo="h-parceiros" icone={<Users />} titulo="Parceiros" sangria
              descricao={plural(dados.candidaturas.total, "candidatura", "candidaturas")}
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
                          titulo={<>{r.nome || "Sem nome"}{nova && <span className="sr-only">, não vista</span>}</>}
                          descricao={juntar(r.empresa, r.principal_especializacao) || undefined}
                          fim={<Data iso={r.created_at} />}
                          quebraAcoes={false}
                        >
                          {segmentos(r.segmentos) && <span className="mt-0.5 block text-sm text-foreground">{segmentos(r.segmentos)}</span>}
                        </LinhaDeLista>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Vazio>Nenhuma candidatura ainda. Quem se candidatar à Rede de Parceiros aparece aqui.</Vazio>
              )}
            </CardComCabecalho>

            <CardComCabecalho
              idDoTitulo="h-lancamento" icone={<Rocket />} titulo="Lançamento" sangria
              descricao={plural(dados.lancamento.total, "pessoa cadastrada", "pessoas cadastradas")}
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
                <Vazio>Ninguém se cadastrou ainda. Quem pedir aviso do lançamento no site aparece aqui.</Vazio>
              )}
            </CardComCabecalho>
          </GradeDeCards>
        </div>
      )}
    </div>
  );
}
