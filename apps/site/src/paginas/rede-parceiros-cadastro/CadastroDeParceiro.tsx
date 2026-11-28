// Cadastro na Rede de Parceiros (/rede-parceiros/cadastro/), com o DS. Aberto na gaveta da Rede de Parceiros (dentro
// de um iframe) ou direto pelo endereço. As mesmas 40 perguntas em 9 etapas, as mesmas regras e mensagens, a mesma
// tabela ("cadastros"), a consulta de e-mail já cadastrado (email_ja_cadastrado), as cidades de /data/municipios, o
// rascunho no navegador, as três telas finais, o evento "cadastro_parceiro" e o aviso "dm-fechar-cadastro" à página
// de fora (Esc e "Fechar" nas telas finais).
// Peças do DS: MolduraDoCadastro (com o Stepper), EtapaDoCadastro (título com foco, aviso de obrigatórios, erro geral e
// ResumoDeErros), BarraDaEtapa (Voltar e Próxima/Enviar, com "Enviando…"), EstadoFinal, Alert, Button, Avatar, Prosa,
// Logo, AvisoCookies e as peças de cada pergunta (Perguntas.tsx).
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, RotateCcw, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BarraDaEtapa, EtapaDoCadastro, MolduraDoCadastro } from "@/components/ui/cadastro-em-etapas";
import { EstadoFinal } from "@/components/ui/estado-vazio";
import { Heading } from "@/components/ui/heading";
import { Prosa } from "@/components/ui/prosa";
import { PecasDoSite } from "@/compartilhado/PecasDoSite";
import { instalarEventos, ligarMedicao } from "@/compartilhado/medicao";
import { lerEscolhaCookies } from "@/components/ui/aviso-cookies";
import { registrarEvento } from "@/compartilhado/site/navegacao";
import { SUPABASE_CHAVE, SUPABASE_URL } from "@/compartilhado/site/supabase";
import { PJ_NO, SECTIONS, SUPABASE_TABELA } from "./conteudo";
import {
  EMAIL_DUP_MSG, EMAIL_RE, FALHA_DE_ENVIO, PERGUNTAS, RASCUNHO, TOTAL_DE_ETAPAS, errosDaEtapa, gravarRascunho, lerRascunho, payload, primeiroNome, visible,
  type Resposta, type Respostas,
} from "./cadastro";
import { PerguntaDoCadastro, alvo } from "./Perguntas";

type Final = "sucesso" | "pj" | "consentimento";
const ETAPAS = SECTIONS.map((s) => ({ titulo: s.title }));
const OBRIGATORIOS = "Campos marcados com * são obrigatórios.";
const naJanela = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};
/** Pede à página de fora para fechar a gaveta; aberto direto, volta para a página anterior do site. */
function fechar() {
  if (naJanela()) {
    try { window.parent.postMessage("dm-fechar-cadastro", "*"); } catch { /* sem a página de fora */ }
    return;
  }
  try {
    if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) return history.back();
  } catch { /* endereço anterior inválido */ }
  location.href = "/rede-parceiros/";
}

function Assinatura({ foto = false, lema = false }: { foto?: boolean; lema?: boolean }) {
  return (
    <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
      {foto && (
        <Avatar className="size-16">
          <AvatarImage src="/dani-assinatura.webp" alt="Dani Moscatelli" />
          <AvatarFallback>DM</AvatarFallback>
        </Avatar>
      )}
      <div className="text-body-sm leading-relaxed">
        <p className="font-bold text-foreground">Dani Moscatelli</p>
        <p className="text-muted-foreground">Experience Design Studio</p>
        {lema && <p className="font-semibold text-primary-text">Meaningful Experiences.</p>}
      </div>
    </div>
  );
}

export function CadastroDeParceiro() {
  const [etapa, setEtapa] = useState(1);
  const [r, setR] = useState<Respostas>({});
  const [erros, setErros] = useState<Record<string, string>>({});
  const [geral, setGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [final, setFinal] = useState<Final | null>(null);
  const [nome, setNome] = useState("");
  const [recuperado, setRecuperado] = useState(false);
  const [direto, setDireto] = useState(false);
  const emailCadastrado = useRef("");
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const trocouDeEtapa = useRef(false);
  const restaurou = useRef(false);

  // Medição: na gaveta, o aviso de cookies é o da página de fora (a escolha vale nas duas); aberto direto, o do DS.
  useEffect(() => {
    const janela = naJanela();
    setDireto(!janela);
    if (janela) {
      instalarEventos();
      if (lerEscolhaCookies() === "aceito") ligarMedicao();
    }
  }, []);

  // Rascunho: as respostas ficam salvas neste navegador e voltam se a pessoa sair e voltar ao formulário.
  useEffect(() => {
    let d = null;
    try { d = lerRascunho(localStorage.getItem(RASCUNHO)); } catch { /* sem armazenamento */ }
    if (d) {
      setR(d.r);
      setEtapa(d.etapa);
      setRecuperado(true);
    }
    restaurou.current = true;
  }, []);
  useEffect(() => {
    if (!restaurou.current || final) return;
    try { localStorage.setItem(RASCUNHO, gravarRascunho(etapa, r)); } catch { /* sem armazenamento */ }
  }, [etapa, r, final]);
  const limparRascunho = () => { try { localStorage.removeItem(RASCUNHO); } catch { /* sem armazenamento */ } };

  // Esc fecha a gaveta (como o X), menos quando uma lista do Select está aberta (o Esc fecha só a lista).
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector("[data-radix-popper-content-wrapper]")) return;
      fechar();
    };
    window.addEventListener("keydown", aoTeclar, true);
    return () => window.removeEventListener("keydown", aoTeclar, true);
  }, []);

  // A cada etapa, volta ao topo e o título recebe o foco (leitores de tela anunciam a etapa).
  useEffect(() => {
    if (!trocouDeEtapa.current) return;
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    tituloRef.current?.focus({ preventScroll: true });
  }, [etapa]);

  const mudar = useCallback((id: string, v: Resposta) => {
    setR((atual) => ({ ...atual, [id]: v }));
    const base = id.replace(/__outro$/, "");
    setErros((e) => (e[base] ? { ...e, [base]: "" } : e));
  }, []);

  // Com erro na tela, a pergunta é conferida de novo a cada mudança (o erro some quando a resposta fica certa).
  useEffect(() => {
    setErros((e) => {
      const ativos = Object.keys(e).filter((k) => e[k]);
      if (!ativos.length) return e;
      const novos = errosDaEtapa(etapa, r, emailCadastrado.current);
      return Object.fromEntries(ativos.map((k) => [k, novos[k] ?? ""]));
    });
  }, [r, etapa]);

  // E-mail já cadastrado: ao sair do campo, pergunta ao banco (só sim ou não) e avisa na hora.
  const verificarEmail = useCallback(async () => {
    const v = String(r.email ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(v)) return;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/email_ja_cadastrado`, {
        method: "POST",
        headers: { apikey: SUPABASE_CHAVE, "Content-Type": "application/json" },
        body: JSON.stringify({ p_email: v }),
      });
      if (!res.ok) return;
      const existe = (await res.json()) === true;
      emailCadastrado.current = existe ? v : emailCadastrado.current === v ? "" : emailCadastrado.current;
      setErros((e) => ({ ...e, email: existe ? EMAIL_DUP_MSG : e.email === EMAIL_DUP_MSG ? "" : e.email }));
    } catch { /* sem conexão: confere de novo no envio */ }
  }, [r.email]);

  const irPara = (n: number) => {
    trocouDeEtapa.current = true;
    setErros({});
    setGeral("");
    setEtapa(n);
  };
  const terminar = (f: Final) => {
    limparRascunho();
    setFinal(f);
    window.scrollTo({ top: 0 });
  };

  async function enviar() {
    setEnviando(true);
    setGeral("");
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABELA}`, {
        method: "POST",
        headers: { apikey: SUPABASE_CHAVE, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify(payload(r)),
      });
      if (res.status === 409) {
        emailCadastrado.current = String(r.email ?? "").trim().toLowerCase();
        setGeral(EMAIL_DUP_MSG);
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      setNome(primeiroNome(r));
      terminar("sucesso");
      registrarEvento("cadastro_parceiro");
    } catch (err) {
      console.error(err);
      setGeral(FALHA_DE_ENVIO);
    } finally {
      setEnviando(false);
    }
  }

  function continuar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    const lista = errosDaEtapa(etapa, r, emailCadastrado.current);
    setErros(lista);
    const primeira = PERGUNTAS.find((q) => lista[q.id]);
    if (primeira) {
      requestAnimationFrame(() => {
        const el = document.getElementById(alvo(primeira));
        el?.focus({ preventScroll: true });
        el?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      });
      return;
    }
    if (etapa === 2 && r.atuacao_pj === PJ_NO) return terminar("pj");
    if (etapa === TOTAL_DE_ETAPAS) return void enviar();
    irPara(etapa + 1);
  }

  const secao = SECTIONS[etapa - 1];
  const resumo = secao.questions
    .filter((q) => erros[q.id])
    .map((q) => ({ id: alvo(q), rotulo: `${q.n}. ${q.label}`, mensagem: erros[q.id] }));
  const botaoFechar = <Button variant="outline" size="lg" onClick={fechar}>Fechar</Button>;

  return (
    <>
      <main id="conteudo" className={direto ? "min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-10" : "min-h-screen bg-card"}>
        <div className={direto ? "mx-auto max-w-3xl" : ""}>
          <div className={direto ? "mb-6 flex items-start justify-between gap-4" : "sr-only"}>
            <Heading level={1} size="card">
              Cadastro na <span className="text-primary-text">Rede de Parceiros</span>
            </Heading>
            {direto && (
              <Button variant="ghost" size="icon" aria-label="Fechar cadastro" onClick={fechar}>
                <X aria-hidden />
              </Button>
            )}
          </div>

          {final === "sucesso" && (
            <EstadoFinal titulo={nome ? `Boas-vindas, ${nome}!` : "Boas-vindas!"} acoes={!direto && botaoFechar} className="px-4">
              <Prosa>
                <p>É um prazer receber você na rede de parceiros da <strong>Dani Moscatelli | Experience Design Studio</strong>!</p>
                <p>Acreditamos no valor de conectar talentos, conhecimentos e diferentes perspectivas para criar novas oportunidades.</p>
                <p>Agora, você faz parte do nosso ecossistema e poderá colaborar em projetos do Studio, além de trocar experiências, compartilhar conhecimentos e desenvolver novas parcerias.</p>
                <p>A participação não estabelece vínculo contratual. Eventuais colaborações serão acordadas conforme cada projeto.</p>
                <p><strong>Que esta seja a primeira de muitas conexões de valor!</strong></p>
              </Prosa>
              <Assinatura foto lema />
            </EstadoFinal>
          )}
          {final === "pj" && (
            <EstadoFinal tom="info" titulo="Agradecemos pelo seu interesse!" acoes={!direto && botaoFechar} className="px-4">
              <Prosa>
                <p>A Rede de Parceiros | Dani Moscatelli Experience Design Studio é uma iniciativa voltada à conexão com profissionais independentes que tenham interesse em colaborar em projetos futuros na modalidade de prestação de serviços (PJ).</p>
                <p>Como esse modelo não corresponde ao seu interesse profissional neste momento, não será possível prosseguir com o cadastro.</p>
                <p>Agradecemos seu tempo e esperamos que possamos nos conectar em outras oportunidades!</p>
              </Prosa>
              <Assinatura />
            </EstadoFinal>
          )}
          {final === "consentimento" && (
            <EstadoFinal tom="info" titulo="Sua privacidade é importante para nós!" acoes={!direto && botaoFechar} className="px-4">
              <Prosa>
                <p>Para integrar a Rede de Parceiros | Dani Moscatelli Experience Design Studio, precisamos da sua autorização para armazenar e utilizar as informações profissionais fornecidas, exclusivamente para as finalidades apresentadas neste formulário.</p>
                <p>Respeitamos sua decisão de não conceder essa autorização. Por esse motivo, não poderemos incluir seu perfil em nossa base de parceiros.</p>
                <p>Agradecemos seu interesse e sua disponibilidade!</p>
              </Prosa>
              <Assinatura />
            </EstadoFinal>
          )}

          {!final && (
            <MolduraDoCadastro
              etapas={ETAPAS}
              atual={etapa - 1}
              onIrPara={(i) => irPara(i + 1)}
              rotulo="Etapas do cadastro"
              className={direto ? "" : "rounded-none border-0"}
            >
              <EtapaDoCadastro
                titulo={secao.title}
                tituloRef={tituloRef}
                obrigatorios={OBRIGATORIOS}
                erro={geral || undefined}
                resumoDeErros={resumo}
                onSubmit={continuar}
                barra={
                  <BarraDaEtapa
                    onVoltar={etapa > 1 ? () => irPara(etapa - 1) : undefined}
                    carregando={enviando}
                    textoCarregando="Enviando…"
                    rotuloContinuar={
                      etapa === TOTAL_DE_ETAPAS ? (
                        <>Enviar cadastro <ArrowRight aria-hidden /></>
                      ) : (
                        <>Próxima <ArrowRight aria-hidden /></>
                      )
                    }
                    className={direto ? "" : "rounded-none"}
                  />
                }
              >
                {recuperado && (
                  <Alert variant="info" className="mb-8">
                    <RotateCcw aria-hidden />
                    <AlertDescription>
                      <p>Recuperamos o seu preenchimento. Continue de onde parou.</p>
                      <Button
                        type="button"
                        variant="link"
                        size="lg"
                        className="h-auto px-0 py-2"
                        onClick={() => {
                          limparRascunho();
                          location.reload();
                        }}
                      >
                        Começar do zero
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-8">
                  {secao.questions.map((q) => (
                    <div key={q.id} data-q={q.id} hidden={!visible(q, r)}>
                      <PerguntaDoCadastro q={q} r={r} erro={erros[q.id] || undefined} mudar={mudar} aoSairDoEmail={q.id === "email" ? verificarEmail : undefined} />
                    </div>
                  ))}
                </div>
              </EtapaDoCadastro>
            </MolduraDoCadastro>
          )}
        </div>
      </main>
      {direto && <PecasDoSite whatsapp={false} />}
    </>
  );
}
