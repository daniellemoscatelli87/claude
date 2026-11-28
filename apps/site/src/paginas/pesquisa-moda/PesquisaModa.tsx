// Pesquisa "Moda em Curitiba" (/pesquisa/moda-curitiba/), em React com o DS (D-053, lote S6). Mesmo questionário,
// ordem, condicionais, mensagens, rascunho, chamadas à função `pesquisa` (status, verificar, parcial e enviar), campo
// isca `site`, respostas 409 e 410 e medição (só a do aviso de cookies). As regras ficam em logica.ts; as peças do DS
// de cada parte estão em docs/engineering/SITE_REACT.md, seção 6f.
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, CircleAlert, Clock, Gift, Home, Lock, Share2, ShieldCheck, Sparkles, Star, UserCheck, Users } from "lucide-react";
import { abrirAvisoCookies } from "@/components/ui/aviso-cookies";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BarraDaEtapa } from "@/components/ui/cadastro-em-etapas";
import { CabecalhoDoSite } from "@/components/ui/cabecalho-do-site";
import { Campo, CampoDeTelefone, MensagemDeErro } from "@/components/ui/campo";
import { CampoCopiavel } from "@/components/ui/campo-copiavel";
import { CampoDeEmail } from "@/components/ui/campo-de-email";
import { Card, CardContent } from "@/components/ui/card";
import { CartaoDeEscolha, GrupoDeCartoesDeEscolha } from "@/components/ui/cartao-de-escolha";
import { Checkbox } from "@/components/ui/checkbox";
import { EstadoFinal } from "@/components/ui/estado-vazio";
import { Heading } from "@/components/ui/heading";
import { IconeWhatsApp } from "@/components/ui/botao-whatsapp";
import { Facebook, Linkedin } from "@/components/ui/icones-preservados";
import { IconeComBase } from "@/components/ui/painel-dados";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkPularConteudo } from "@/components/ui/links";
import { ListaDePilares } from "@/components/ui/lista-de-pilares";
import { Logo } from "@/components/ui/logo";
import { Progress } from "@/components/ui/progress";
import { Prosa } from "@/components/ui/prosa";
import { RodapeSite } from "@/components/ui/rodape-site";
import { Selo } from "@/components/ui/selo";
import { Textarea } from "@/components/ui/textarea";
import { AvisoDeCookiesComMedicao } from "@/compartilhado/PecasDoSite";
import { JanelaDaPolitica } from "@/compartilhado/TextoDaPolitica";
import {
  API, CHAVE_FIM, ETAPA_ID, ETAPA_NOV, ETAPA_PERFIL, ETAPA_RELATO, FALTA_MSG, LINK_PESQUISA, MSG_INDICAR, PERFIL, PERGUNTAS, RELATO_MAX, TEXTO_DO_ACEITE, TOTAL,
  anterior, apagarRascunho, corpoEnviar, corpoParcial, corpoStatus, corpoVerificar, errosDaEtapa, finalDoEnvio, guardar, identificado, ler, lerRascunho,
  nomeDaEtapa, novo, opcaoQueEncerra, perfilDaPergunta1, perfilDe, perfilAplica, progresso, proxima, rotulo, salvar, textoDoBotao,
  type ErrosDaEtapa, type Estado, type Final,
} from "./logica";
import { CampoDeLista, CampoDoPerfil, CorpoDaPergunta, Realce } from "./Perguntas";

const post = (corpo: string, keepalive = false) => fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: corpo, keepalive });
type Tela = "intro" | "form" | Final;

/** Link "Política de Privacidade" que abre a política na janela, já na seção da pesquisa. */
function LinkDaPolitica({ abrir, children = "Política de Privacidade" }: { abrir: () => void; children?: ReactNode }) {
  return (
    <a href="/privacidade/#pesquisa-moda" aria-haspopup="dialog" onClick={(e) => { if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); e.stopPropagation(); abrir(); }} className="rounded-sm font-semibold text-primary-text underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {children}
    </a>
  );
}

function Assinatura() {
  return (
    <div className="flex items-center gap-3 border-t pt-6">
      <Avatar className="size-14"><AvatarImage src="/dani-assinatura.webp" alt="Dani Moscatelli" /><AvatarFallback>DM</AvatarFallback></Avatar>
      <p className="text-body-sm leading-snug"><strong className="block text-foreground">Dani Moscatelli</strong><span className="text-muted-foreground">Experience Design Studio</span></p>
    </div>
  );
}

/** "Indique a pesquisa": o link para copiar e o compartilhar do aparelho; sem ele, os links das redes. */
function Indicar() {
  const [menu, setMenu] = useState(false);
  const url = encodeURIComponent(LINK_PESQUISA);
  const compartilhar = async () => {
    if (typeof navigator.share === "function") {
      try { await navigator.share({ title: "Vamos conversar sobre moda em Curitiba?", text: MSG_INDICAR, url: LINK_PESQUISA }); return; }
      catch (e) { if ((e as DOMException)?.name === "AbortError") return; }
    }
    setMenu((m) => !m);
  };
  const redes = [
    { rotulo: "WhatsApp", href: "https://wa.me/?text=" + encodeURIComponent(MSG_INDICAR + " " + LINK_PESQUISA), Icone: IconeWhatsApp },
    { rotulo: "Facebook", href: "https://www.facebook.com/sharer/sharer.php?u=" + url, Icone: Facebook },
    { rotulo: "LinkedIn", href: "https://www.linkedin.com/sharing/share-offsite/?url=" + url, Icone: Linkedin },
  ];
  return (
    <Card className="text-left">
      <CardContent className="flex flex-col gap-4 pt-6">
        <div>
          <Heading level={2} size="card">Indique a pesquisa</Heading>
          <p className="mt-1 text-body-sm text-muted-foreground">Conhece alguém que compra roupas, calçados ou acessórios em Curitiba ou na Região Metropolitana? Compartilhe o link.</p>
        </div>
        <CampoCopiavel valor={LINK_PESQUISA} rotulo="Link da pesquisa" />
        <Button type="button" className="self-start" aria-expanded={menu} aria-controls="pq-indicar-menu" onClick={compartilhar}><Share2 aria-hidden />Compartilhar</Button>
        <div id="pq-indicar-menu" hidden={!menu} className="flex flex-col gap-3">
          <ul className="flex flex-wrap gap-2">
            {redes.map(({ rotulo, href, Icone }) => (
              <li key={rotulo}>
                <Button asChild variant="outline">
                  <a href={href} target="_blank" rel="noopener" aria-label={`Compartilhar no ${rotulo} (abre em nova aba)`}><Icone aria-hidden />{rotulo}</a>
                </Button>
              </li>
            ))}
          </ul>
          <p className="text-body-sm text-muted-foreground">Para o Direct do Instagram, copie o link e cole na conversa.</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function PesquisaModa() {
  const [E, setE] = useState<Estado>(novo);
  const [tela, setTela] = useState<Tela>("intro");
  const [comContato, setComContato] = useState(false);
  const [animarFim, setAnimarFim] = useState(false);
  const [erros, setErros] = useState<ErrosDaEtapa | null>(null);
  const [falta, setFalta] = useState<{ msg: string; alvo: string } | null>(null);
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [voltando, setVoltando] = useState(false);
  const [politica, setPolitica] = useState(false);
  const [sair, setSair] = useState<string | null>(null);
  const Eref = useRef(E); Eref.current = E;
  const enviandoRef = useRef(false);
  const retomar = useRef(-1);
  const ultimoProgresso = useRef("");
  const isca = useRef<HTMLInputElement>(null);
  const focar = useRef(false);

  const site = () => isca.current?.value ?? "";
  const mudar = (f: (e: Estado) => Estado) => setE((atual) => { const n = f(atual); salvar(n); return n; });
  const mudarResposta = (id: string, v: unknown) => { mudar((e) => ({ ...e, r: { ...e.r, [id]: v } })); limparErros(); };
  const limparErros = () => { setErros(null); setFalta(null); };

  /** Progresso no servidor (situação "parcial"): a cada etapa depois da identificação e ao sair da página. */
  const progressoNoServidor = (e: Estado, saindo = false) => {
    if (enviandoRef.current || !identificado(e) || e.etapa < 0 || e.etapa === ETAPA_ID || ler(CHAVE_FIM)) return;
    const corpo = corpoParcial(e, site());
    if (corpo === ultimoProgresso.current) return;
    ultimoProgresso.current = corpo;
    post(corpo, saindo).catch(() => { ultimoProgresso.current = ""; });
  };

  const irPara = (i: number, volta = false, base?: Estado) => {
    const e0 = base ?? Eref.current;
    let e = { ...e0, etapa: i };
    if (i < TOTAL && PERGUNTAS[i].id === "q1") e = { ...e, r: { ...e.r, perfil: perfilDaPergunta1(e) } };
    salvar(e); setE(e); Eref.current = e;
    progressoNoServidor(e);
    setErroGeral(""); limparErros(); setVoltando(volta); setTela("form");
    focar.current = true;
  };

  // foco no título da etapa e volta ao topo a cada troca (leitores de tela anunciam a etapa)
  useEffect(() => {
    if (!focar.current) return;
    focar.current = false;
    window.scrollTo({ top: 0 });
    document.querySelector<HTMLElement>(`[data-etapa="${E.etapa}"] legend`)?.focus({ preventScroll: true });
  }, [E.etapa, tela]);

  const concluir = (tipo: Final, contato = false, animar = true) => {
    if (tipo === "obrigada" || tipo === "encerrada" || tipo === "semcompras") guardar(CHAVE_FIM, { tipo, comContato: contato, em: Date.now() });
    if (tipo !== "fora") apagarRascunho();
    setComContato(contato); setAnimarFim(animar); setTela(tipo);
    window.scrollTo({ top: 0 });
  };

  // ao abrir: participação já concluída, rascunho para continuar e a pesquisa fora do ar
  useEffect(() => {
    const fim = ler<{ tipo: "obrigada" | "encerrada" | "semcompras"; comContato: boolean }>(CHAVE_FIM);
    if (fim) { concluir(fim.tipo, fim.comContato, false); return; }
    const e: Estado = { ...novo(), ...lerRascunho() };
    setE(e); Eref.current = e;
    if (e.etapa >= 0) {
      if (identificado(e) || e.etapa === ETAPA_ID) irPara(e.etapa, false, e);
      else { retomar.current = e.etapa; irPara(ETAPA_ID, false, e); }
    }
    post(corpoStatus()).then((r) => r.json()).then((d) => { if (d && d.ativa === false) concluir("fora"); }).catch(() => { /* sem conexão: o envio avisa depois */ });
    const aoSair = () => progressoNoServidor(Eref.current, true);
    const aoEsconder = () => { if (document.visibilityState === "hidden") progressoNoServidor(Eref.current, true); };
    addEventListener("pagehide", aoSair);
    document.addEventListener("visibilitychange", aoEsconder);
    return () => { removeEventListener("pagehide", aoSair); document.removeEventListener("visibilitychange", aoEsconder); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const comecar = () => {
    const e = Eref.current;
    if (identificado(e) && e.etapa >= 0) irPara(e.etapa);
    else { retomar.current = e.etapa >= 0 && e.etapa !== ETAPA_ID ? e.etapa : -1; irPara(ETAPA_ID); }
  };
  const voltar = () => {
    if (enviandoRef.current) return;
    const e = Eref.current;
    if (e.etapa === ETAPA_ID) { const n = { ...e, etapa: -1 }; salvar(n); setE(n); limparErros(); setTela("intro"); window.scrollTo({ top: 0 }); setTimeout(() => document.getElementById("pq-comecar")?.focus(), 0); return; }
    if (e.etapa <= 0) { irPara(ETAPA_ID, true); return; }
    irPara(anterior(e, e.etapa), true);
  };

  const mostrarErros = (x: ErrosDaEtapa) => {
    setErros(x);
    const alvo = x.primeiro ? (["nome", "whats", "email", "ciente"].includes(x.primeiro) ? `pq-${x.primeiro}` : x.primeiro === "outro" ? `pq-${PERGUNTAS[E.etapa]?.id}-outro` : `pq-perfil-${x.primeiro}`) : x.faltando.length ? `[data-linha="${x.faltando[0]}"]` : `pq-erro-etapa`;
    setFalta({ msg: x.avisoProprio && x.geral ? x.geral : FALTA_MSG, alvo });
    requestAnimationFrame(() => {
      const el = alvo.startsWith("[") ? document.querySelector<HTMLElement>(alvo) : document.getElementById(alvo);
      el?.scrollIntoView({ block: "center" });
      if (E.etapa === ETAPA_ID && x.primeiro && x.primeiro !== "ciente") document.getElementById(`pq-${x.primeiro}`)?.focus({ preventScroll: true });
      if (x.primeiro === "outro") document.getElementById(alvo)?.focus({ preventScroll: true });
    });
  };
  const irAteFalta = () => {
    if (!falta) return;
    const el = falta.alvo.startsWith("[") ? document.querySelector<HTMLElement>(falta.alvo) : document.getElementById(falta.alvo);
    if (!el) return;
    el.scrollIntoView({ block: "center" });
    const sel = "input:not([type=hidden]), select, textarea, button";
    const lista = el.matches(sel) ? [el] : [...el.querySelectorAll<HTMLElement>(sel)];
    lista.find((x) => !!(x.offsetParent || x.getClientRects().length))?.focus({ preventScroll: true });
  };

  const enviar = async (final: boolean) => {
    if (enviandoRef.current) return;
    enviandoRef.current = true; setEnviando(true); setErroGeral("");
    const e = Eref.current;
    try {
      const res = await post(corpoEnviar(e, site(), final));
      const out = await res.json().catch(() => ({}));
      if (res.status === 410) { concluir("fora"); return; }
      if (res.status === 409 && out.ja_respondeu) { concluir("ja"); return; }
      if (!res.ok || !out.ok) throw new Error(out.error || "Não foi possível enviar agora.");
      concluir(finalDoEnvio(e), e.nov === "sim");
    } catch (x) {
      setErroGeral((x instanceof Error && x.message && !/fetch|network/i.test(x.message) ? x.message : "Não foi possível enviar. Confira sua conexão.") + " Suas respostas continuam aqui; toque no botão para tentar de novo.");
    } finally { enviandoRef.current = false; setEnviando(false); }
  };

  const conferirId = async () => {
    if (enviandoRef.current) return;
    enviandoRef.current = true; setEnviando(true);
    try {
      const res = await post(corpoVerificar(Eref.current));
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || "");
      if (out.ja_respondeu) { mostrarErros({ campos: {}, faltando: [], geral: "Este e-mail ou WhatsApp já participou da pesquisa. Cada pessoa participa uma vez. Obrigada!", avisoProprio: true }); return; }
      enviandoRef.current = false;
      const destino = retomar.current >= 0 && retomar.current !== ETAPA_ID ? retomar.current : 0; retomar.current = -1;
      irPara(destino);
    } catch (x) {
      mostrarErros({ campos: {}, faltando: [], avisoProprio: true, geral: x instanceof Error && x.message && !/fetch|network/i.test(x.message) ? x.message : "Não foi possível conferir agora. Confira sua conexão e tente de novo." });
    } finally { enviandoRef.current = false; setEnviando(false); }
  };

  const continuar = (ev: FormEvent) => {
    ev.preventDefault();
    if (enviandoRef.current) return;
    const e = Eref.current;
    const x = errosDaEtapa(e, e.etapa);
    if (x) { mostrarErros(x); return; }
    if (opcaoQueEncerra(e, PERGUNTAS[e.etapa])) return void enviar(false);
    if (e.etapa === ETAPA_NOV) return void enviar(true);
    if (e.etapa === ETAPA_ID) return void conferirId();
    irPara(proxima(e, e.etapa));
  };

  // "Home" e o logo no meio da pesquisa: pergunta antes de sair (as respostas ficam no aparelho)
  const aoClicarNoCabecalho = (ev: React.MouseEvent) => {
    const a = (ev.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (!a || tela !== "form" || ler(CHAVE_FIM) || ev.ctrlKey || ev.metaKey) return;
    ev.preventDefault(); salvar(Eref.current); setSair(a.href);
  };

  const pf = perfilDe(E);
  const etapa = E.etapa;
  const campoErro = (id: string) => erros?.campos[id];
  const legenda = (id: string, eyebrow: string, titulo: string, trechos?: string | string[], apoio?: ReactNode) => (
    <>
      <legend id={`${id}-legenda`} tabIndex={-1} className="mb-2 outline-none">
        <span className="sr-only">{eyebrow}: </span>
        <Heading level={1} size="section" className="text-balance"><Realce texto={titulo} trechos={trechos} /></Heading>
      </legend>
      {apoio && <p id={`${id}-apoio`} className="mb-6 text-body text-muted-foreground">{apoio}</p>}
    </>
  );
  const apoioDe = (texto?: string, negrito?: string) => {
    if (!texto) return undefined;
    const n = negrito ? texto.indexOf(negrito) : -1;
    return n >= 0 ? <>{texto.slice(0, n)}<strong className="text-foreground">{negrito}</strong>{texto.slice(n + negrito!.length)}</> : texto;
  };
  const erroDaEtapa = erros?.geral ? <MensagemDeErro id="pq-erro-etapa" className="mt-4">{erros.geral}</MensagemDeErro> : null;

  let corpo: ReactNode = null;
  if (tela === "form") {
    if (etapa >= 0 && etapa < TOTAL) {
      const p = PERGUNTAS[etapa];
      const id = "pq-" + p.id;
      corpo = (
        <fieldset key={id} id={id} data-etapa={etapa} aria-describedby={p.apoio ? `${id}-apoio` : undefined} aria-invalid={erros?.geral ? true : undefined} className="min-w-0">
          {legenda(id, `Pergunta ${rotulo(etapa)}`, p.texto, p.destaque, apoioDe(p.apoio, p.apoio_negrito))}
          <CorpoDaPergunta
            p={p}
            valor={E.r[p.id]}
            legenda={`${id}-legenda`}
            faltando={erros?.faltando ?? []}
            mudar={(v) => {
              if (p.id === "q1") { mudar((e) => { const n = { ...e, r: { ...e.r, q1: v } }; return { ...n, r: { ...n.r, perfil: perfilDaPergunta1(n) } }; }); limparErros(); }
              else mudarResposta(p.id, v);
            }}
            depoisDaOpcao={p.id === "q1" ? (op) => {
              const c = PERFIL.find((x) => x.inicio && ((op === "sim" && x.id === "bairro") || (op === "rmc" && x.id === "cidade")));
              if (!c || E.r.q1 !== op) return null;
              const opcoes = c.id === "cidade" ? c.opcoes.filter((o) => o.id !== "curitiba") : c.opcoes;
              return (
                <div className="col-span-full pl-4 motion-safe:animate-in motion-safe:fade-in-0">
                  <CampoDeLista c={c} opcoes={opcoes} valor={pf[c.id] ?? ""} erro={campoErro(c.id)} mudar={(v) => { mudar((e) => ({ ...e, r: { ...e.r, perfil: { ...perfilDe(e), [c.id]: v } } })); limparErros(); }} />
                </div>
              );
            } : undefined}
          />
          {erroDaEtapa}
        </fieldset>
      );
    } else if (etapa === ETAPA_ID) {
      corpo = (
        <fieldset key="pq-id" id="pq-id" data-etapa={etapa} aria-describedby="pq-id-apoio" className="min-w-0">
          {legenda("pq-id", "Antes de começar", "Conte quem é você", "quem é você", "Pedimos seus dados para garantir uma participação por pessoa e para entregar as suas vantagens no lançamento.")}
          <div className="flex flex-col gap-6">
            <Campo id="pq-nome" rotulo="Seu nome" obrigatorio autoComplete="name" maxLength={120} placeholder="Como podemos chamar você?" value={E.nome} erro={campoErro("nome")} onChange={(ev) => { const v = ev.target.value; mudar((e) => ({ ...e, nome: v })); limparErros(); }} />
            <CampoDeTelefone id="pq-whats" rotulo="WhatsApp com DDD" obrigatorio autoComplete="tel-national" valor={E.whats} erro={campoErro("whats")} onValorChange={(v) => { mudar((e) => ({ ...e, whats: v })); limparErros(); }} />
            <CampoDeEmail id="pq-email" rotulo="E-mail" opcional maxLength={254} spellCheck={false} placeholder="seuemail@exemplo.com" valor={E.email} erro={campoErro("email")} onValorChange={(v) => { mudar((e) => ({ ...e, email: v })); limparErros(); }} />
            <Card>
              <CardContent className="flex flex-col gap-4 pt-6">
                <div className="flex items-start gap-3">
                  <IconeComBase tom="marca"><ShieldCheck /></IconeComBase>
                  <p className="text-body-sm text-muted-foreground"><strong className="block text-foreground">Seus dados e sua privacidade</strong>Usamos seu nome, e-mail e WhatsApp apenas para esta pesquisa e para informar sobre o lançamento da solução. Suas respostas não serão divulgadas de forma identificável.</p>
                </div>
                <div className="flex flex-col gap-2 border-t pt-4">
                  <div className="flex items-start gap-3">
                    <Checkbox id="pq-ciente" checked={E.ciente} aria-invalid={campoErro("ciente") ? true : undefined} aria-describedby={campoErro("ciente") ? "pq-ciente-erro" : undefined} onCheckedChange={(v) => { mudar((e) => ({ ...e, ciente: v === true })); limparErros(); }} className="mt-0.5" />
                    <Label htmlFor="pq-ciente" obrigatorio className="block text-body-sm font-normal leading-relaxed text-foreground">
                      {TEXTO_DO_ACEITE.replace(/Política de Privacidade\.$/, "")}<LinkDaPolitica abrir={() => setPolitica(true)} />.
                    </Label>
                  </div>
                  {campoErro("ciente") && <MensagemDeErro id="pq-ciente-erro">{campoErro("ciente")}</MensagemDeErro>}
                </div>
              </CardContent>
            </Card>
          </div>
          {erroDaEtapa}
        </fieldset>
      );
    } else if (etapa === ETAPA_RELATO) {
      corpo = (
        <fieldset key="pq-relato" id="pq-relato" data-etapa={etapa} aria-describedby="pq-relato-apoio" className="min-w-0">
          {legenda("pq-relato", "Para finalizar · opcional", "Você já teve alguma experiência frustrante ao procurar ou comprar roupas e acessórios?", "experiência frustrante", "Pode ser relacionada à busca, ao atendimento, à disponibilidade das peças, à qualidade ou ao pós-venda.")}
          <Label htmlFor="pq-relato-txt" className="sr-only">Sua experiência (opcional)</Label>
          <Textarea id="pq-relato-txt" rows={6} contador maxLength={RELATO_MAX} aria-describedby="pq-relato-apoio" placeholder="Conte o que aconteceu e, se possível, o que poderia ter sido diferente…" value={E.relato} onChange={(ev) => { const v = ev.target.value; mudar((e) => ({ ...e, relato: v })); }} className="bg-card" />
        </fieldset>
      );
    } else if (etapa === ETAPA_PERFIL) {
      corpo = (
        <fieldset key="pq-perfil" id="pq-perfil" data-etapa={etapa} aria-describedby="pq-perfil-apoio" className="min-w-0">
          {legenda("pq-perfil", "Sobre você", "Para terminar, conte um pouco sobre você", "sobre você", "Usamos estas informações só para analisar os resultados em conjunto, sem identificar ninguém.")}
          <div className="flex flex-col gap-8">
            {PERFIL.filter((c) => !c.inicio && perfilAplica(E, c)).map((c) => (
              <CampoDoPerfil
                key={c.id}
                c={c}
                valor={pf[c.id] ?? ""}
                outro={pf[c.id + "_outro"] ?? ""}
                erro={campoErro(c.id)}
                mudar={(v) => { mudar((e) => { const n: Record<string, string> = { ...perfilDe(e), [c.id]: v }; const o = c.opcoes.find((x) => x.outro); if (!o || v !== o.id) delete n[c.id + "_outro"]; return { ...e, r: { ...e.r, perfil: n } }; }); limparErros(); }}
                mudarOutro={(v) => { mudar((e) => ({ ...e, r: { ...e.r, perfil: { ...perfilDe(e), [c.id + "_outro"]: v } } })); limparErros(); }}
              />
            ))}
          </div>
        </fieldset>
      );
    } else if (etapa === ETAPA_NOV) {
      corpo = (
        <fieldset key="pq-novidades" id="pq-novidades" data-etapa={etapa} aria-describedby="pq-novidades-perg" aria-invalid={erros?.geral ? true : undefined} className="min-w-0">
          {legenda("pq-novidades", "Última etapa", "Obrigado por participar", "Obrigado")}
          <Card className="mb-6">
            <CardContent className="flex items-start gap-3 pt-6">
              <IconeComBase tom="marca"><Gift /></IconeComBase>
              <div>
                <p className="text-body font-bold text-foreground"><Realce texto="Você terá vantagens exclusivas no lançamento!" trechos="vantagens exclusivas" /></p>
                <p className="mt-1 text-body-sm text-muted-foreground">Essa é a nossa forma de agradecer por sua contribuição na construção dessa nova solução.</p>
              </div>
            </CardContent>
          </Card>
          <p id="pq-novidades-perg" className="mb-4 text-body font-semibold text-foreground">Quer receber avisos sobre o lançamento e suas vantagens por e-mail e WhatsApp?</p>
          <GrupoDeCartoesDeEscolha aria-labelledby="pq-novidades-perg" name="novidades" value={E.nov} onValueChange={(v) => { mudar((e) => ({ ...e, nov: v as Estado["nov"] })); limparErros(); }}>
            <CartaoDeEscolha valor="sim" titulo="Sim, quero receber os avisos." descricao={<span id="pq-novidades-consent">Autorizo o uso dos meus contatos exclusivamente para essa finalidade, conforme a <LinkDaPolitica abrir={() => setPolitica(true)} />. Posso revogar meu consentimento a qualquer momento.</span>} />
            <CartaoDeEscolha valor="nao" titulo="Não, prefiro não receber." />
          </GrupoDeCartoesDeEscolha>
          {erroDaEtapa}
        </fieldset>
      );
    }
  }

  const pct = tela === "form" && etapa >= 0 ? progresso(etapa) : 0;
  const conteudoFinal = (titulo: ReactNode, textos: ReactNode, op: { tom?: "sucesso" | "info"; indicar?: boolean; mini?: ReactNode; comemorar?: boolean } = {}) => (
    <EstadoFinal tom={op.tom ?? "info"} titulo={titulo} comemorar={op.comemorar} className="mx-auto max-w-xl px-0">
      <div className="flex flex-col gap-6 text-left">
        <Prosa>{textos}</Prosa>
        {op.indicar !== false && <Indicar />}
        {op.mini}
        <Assinatura />
      </div>
    </EstadoFinal>
  );

  return (
    <div className="flex flex-col bg-background">
      <LinkPularConteudo href="#pq-conteudo" />
      <div onClickCapture={aoClicarNoCabecalho}>
        <CabecalhoDoSite
          itens={[]}
          posicao="sticky"
          logo={{ completo: <Logo variante="horizontal" className="h-11" />, simbolo: <Logo variante="simbolo" className="h-10" /> }}
          acao={{ rotulo: "Home", href: "/", icone: <Home aria-hidden /> }}
        />
      </div>

      <main id="pq-conteudo" tabIndex={-1} className="mx-auto w-full max-w-2xl px-4 pb-16 pt-8 outline-none sm:px-6">
        {tela === "intro" && (
          <section aria-labelledby="pq-intro-titulo" className="flex flex-col gap-8">
            <div className="flex flex-col items-start gap-4">
              <Selo>Pesquisa</Selo>
              <Heading level={1} id="pq-intro-titulo" size="hero" className="text-balance">Vamos conversar sobre <span className="text-primary-text">moda em Curitiba</span>?</Heading>
              <Prosa>
                <p>Queremos entender como é procurar e comprar <strong>roupas, calçados e acessórios</strong> em Curitiba e Região Metropolitana.</p>
                <p>Esta pesquisa faz parte de um projeto de inovação conduzido por Dani Moscatelli — Experience Design Studio. Suas respostas vão ajudar a identificar hábitos, preferências e desafios de quem consome moda em Curitiba e Região Metropolitana.</p>
              </Prosa>
            </div>
            <Card>
              <CardContent className="flex flex-col gap-4 pt-6">
                <div className="flex items-start gap-3">
                  <IconeComBase tom="marca"><Star /></IconeComBase>
                  <div>
                    <Heading level={2} size="card">Por que vale participar</Heading>
                    <p className="mt-1 text-body-sm text-muted-foreground">Ao final, você poderá escolher receber novidades do projeto e benefícios de lançamento.</p>
                  </div>
                </div>
                <ul className="flex flex-col gap-2 border-t pt-4 text-body-sm text-foreground">
                  <li className="flex items-center gap-2"><Sparkles aria-hidden className="size-4 text-primary-text" />Novidades em primeira mão</li>
                  <li className="flex items-center gap-2"><Gift aria-hidden className="size-4 text-primary-text" />Benefícios no lançamento</li>
                  <li className="flex items-center gap-2"><Users aria-hidden className="size-4 text-primary-text" />Ajude a construir a solução</li>
                </ul>
              </CardContent>
            </Card>
            <ListaDePilares
              rotulo="Sobre a pesquisa"
              pilares={[
                { icone: <Clock />, titulo: "Leva de 5 a 8 minutos", texto: "Pesquisa rápida para responder." },
                { icone: <UserCheck />, titulo: "Participação voluntária", texto: "Você pode sair quando quiser." },
                { icone: <Lock />, titulo: "Privacidade protegida", texto: "Seus dados são usados apenas nesta pesquisa." },
              ]}
            />
            <p className="text-body text-muted-foreground">Não existem respostas certas ou erradas. Queremos conhecer a sua experiência.</p>
            <Button id="pq-comecar" size="lg" className="w-full sm:w-auto sm:self-start" onClick={comecar}>Começar pesquisa<ArrowRight aria-hidden /></Button>
          </section>
        )}

        {tela === "form" && (
          <form noValidate onSubmit={continuar} className="@container/etapa flex flex-col">
            <div className="mb-8 flex flex-col gap-2">
              <p className="text-body-sm font-semibold text-foreground">Vamos conversar sobre <span className="text-primary-text">moda em Curitiba</span>?</p>
              <Progress value={pct} aria-label="Progresso da pesquisa" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} />
              <p aria-live="polite" className="text-body-sm text-muted-foreground">{nomeDaEtapa(etapa)}</p>
            </div>
            <div
              key={etapa}
              onInput={() => setFalta(null)}
              onChange={() => setFalta(null)}
              className={voltando ? "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-left-2" : "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-right-2"}
            >
              {corpo}
            </div>
            <div aria-hidden className="sr-only">
              <Label htmlFor="pq-site">Não preencha este campo</Label>
              <Input ref={isca} type="text" name="site" id="pq-site" tabIndex={-1} autoComplete="off" />
            </div>
            {erroGeral && (
              <Alert variant="error" className="mt-6">
                <CircleAlert aria-hidden />
                <AlertDescription>{erroGeral}</AlertDescription>
              </Alert>
            )}
            {/* A barra segue o conteúdo (sem ficar presa embaixo): a página rola inteira e nada fica atrás dela. */}
            <div className="mt-8 flex flex-col gap-3">
              {falta && (
                <Alert variant="error" role="alert">
                  <CircleAlert aria-hidden />
                  <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                    <span>{falta.msg}</span>
                    <Button type="button" variant="link" className="px-0" onClick={irAteFalta}>Ver</Button>
                  </AlertDescription>
                </Alert>
              )}
              <BarraDaEtapa
                onVoltar={voltar}
                carregando={enviando}
                textoCarregando={etapa === ETAPA_ID ? "Conferindo…" : "Enviando…"}
                rotuloContinuar={<>{textoDoBotao(E, false)}<ArrowRight aria-hidden /></>}
                className="static rounded-xl border"
              />
            </div>
          </form>
        )}

        {tela === "obrigada" && conteudoFinal(<>Pesquisa <span className="text-primary-text">enviada</span> com sucesso</>, <p>Sua experiência é muito importante para compreendermos melhor como as pessoas procuram e compram moda em Curitiba.</p>, {
          tom: "sucesso", comemorar: animarFim,
          mini: comContato ? <p className="text-body-sm text-muted-foreground">Para cancelar os avisos ou pedir a exclusão dos seus dados, escreva para <a href="mailto:contato@danimoscatelli.com.br" className="font-semibold text-primary-text underline underline-offset-2">contato@danimoscatelli.com.br</a>.</p> : undefined,
        })}
        {tela === "encerrada" && conteudoFinal("Obrigada pelo seu interesse!", <><p>Neste momento, a pesquisa é direcionada a pessoas que <strong>moram em Curitiba e Região Metropolitana</strong>.</p><p>Agradecemos por dedicar um pouquinho do seu tempo!</p></>)}
        {tela === "semcompras" && conteudoFinal("Obrigada pelo seu interesse!", <><p>Neste momento, nossa pesquisa é voltada a quem <strong>comprou roupas, calçados ou acessórios neste ano</strong>.</p><p>Agradecemos por dedicar um tempinho para participar!</p></>, { tom: "sucesso" })}
        {tela === "ja" && conteudoFinal(<>Você <span className="text-primary-text">já participou</span> desta pesquisa</>, <><p>Este e-mail ou WhatsApp já foi usado para responder. Cada pessoa participa uma vez.</p><p>Obrigada pela sua contribuição!</p></>)}
        {tela === "fora" && conteudoFinal("Esta pesquisa não está recebendo respostas", <p>O período de participação foi encerrado. Obrigada pelo interesse!</p>, { indicar: false })}
      </main>

      <RodapeSite
        variante="compacto"
        copyright="© 2026 Dani Moscatelli • Experience Design Studio"
        credito={null}
        onPreferenciasCookies={abrirAvisoCookies}
      />
      <AvisoDeCookiesComMedicao />

      <JanelaDaPolitica aberta={politica} onAbertaChange={setPolitica} ancora="pesquisa-moda" />
      <AlertDialog open={sair !== null} onOpenChange={(v) => { if (!v) setSair(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quer mesmo interromper a pesquisa?</AlertDialogTitle>
            <AlertDialogDescription>Suas respostas ficam guardadas neste aparelho. Quando voltar por este mesmo link, você continua de onde parou.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar respondendo</AlertDialogCancel>
            <AlertDialogAction onClick={() => { salvar(Eref.current); if (sair) location.href = sair; }}>Sair e voltar para o site</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
