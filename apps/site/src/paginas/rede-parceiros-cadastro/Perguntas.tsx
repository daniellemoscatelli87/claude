// Cada tipo de pergunta do cadastro na Rede de Parceiros, desenhado com os componentes do DS.
// Peças do DS: Campo, CampoDeEmail, CampoDeTelefone, CampoEstadoCidade, Textarea, Input, Select, Checkbox, Label,
// MensagemDeErro, GrupoDeCartoesDeEscolha + CartaoDeEscolha (escolha única), GrupoDeChipsFiltraveis (setores),
// Accordion (áreas e ferramentas por categoria, com a contagem num Badge), Collapsible ("O que estou autorizando"),
// Prosa (textos de apoio), Alert (link do grupo do WhatsApp), Button.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, MessageCircle, Plus, X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Campo, CampoDeTelefone, MensagemDeErro } from "@/components/ui/campo";
import { CampoDeEmail } from "@/components/ui/campo-de-email";
import { CampoEstadoCidade } from "@/components/ui/campo-estado-cidade";
import { CartaoDeEscolha, GrupoDeCartoesDeEscolha } from "@/components/ui/cartao-de-escolha";
import { Checkbox } from "@/components/ui/checkbox";
import { GrupoDeChipsFiltraveis } from "@/components/ui/chip-filtravel";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Prosa } from "@/components/ui/prosa";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmailDoEstudio } from "@/compartilhado/EmailDoEstudio";
import { JanelaDaPolitica } from "@/compartilhado/TextoDaPolitica";
import { WHATSAPP_GROUP, type Pergunta } from "./conteudo";
import { idiomasIncompletos, isOther, mostrarDepois, opcoesDe, semScheme, ufCidade, type Idioma, type Resposta, type Respostas } from "./cadastro";

/** id do primeiro controle de cada pergunta (o resumo de erros e o foco levam até ele). */
export const alvo = (q: Pergunta) => (["text", "email", "tel", "url", "paragraph"].includes(q.type) ? q.id : `${q.id}-alvo`);

type Props = {
  q: Pergunta;
  r: Respostas;
  erro?: string;
  mudar: (id: string, v: Resposta) => void;
  aoSairDoEmail?: () => void;
};

const rotuloDe = (q: Pergunta) => `${q.n}. ${q.label}`;
/* Legenda de grupo (Label asChild no <legend>): o Label com asChild não recebe o `obrigatorio` (ele envolveria o
   <legend> num bloco), então texto e asterisco vão num só bloco, como o `obrigatorio` do Label faz. */
const Rotulo = ({ q }: { q: Pergunta }) => (
  <span>
    {rotuloDe(q)}
    {q.required && <span aria-hidden className="text-primary-text"> *</span>}
  </span>
);
const semPonto = (o: string) => o.replace(/\.$/, "");
const textoDe = (r: Respostas, id: string) => (typeof r[id] === "string" ? (r[id] as string) : "");
const listaDe = <T,>(r: Respostas, id: string) => (Array.isArray(r[id]) ? (r[id] as T[]) : []);

/** Textos de apoio que no original eram HTML (lista de itens e parágrafos), com a Prosa do DS. */
function Apoio({ html, id }: { html: string; id?: string }) {
  const partes = html.split(/<ul>|<\/ul>/);
  const itens = (s: string) => [...s.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => m[1]);
  const paragrafos = (s: string) => [...s.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => m[1]);
  return (
    <Prosa tamanho="sm" id={id} className="text-muted-foreground">
      {partes.map((p, i) =>
        i % 2 === 1 ? (
          <ul key={i}>{itens(p).map((t) => <li key={t}>{t}</li>)}</ul>
        ) : paragrafos(p).length ? (
          paragrafos(p).map((t) => <p key={t}>{t}</p>)
        ) : p.trim() ? (
          <p key={i}>{p.trim()}</p>
        ) : null,
      )}
    </Prosa>
  );
}

/** Grupo de opções ou de linhas: legenda com o número e o texto da pergunta, ajuda e erro. */
function Grupo({ q, erro, children, antes }: { q: Pergunta; erro?: string; children: ReactNode; antes?: ReactNode }) {
  const ajudaId = q.help || q.helpHtml ? `${q.id}-ajuda` : undefined;
  return (
    <fieldset className="min-w-0 space-y-3" aria-describedby={[ajudaId, erro ? `${q.id}-erro` : undefined].filter(Boolean).join(" ") || undefined}>
      <Label asChild className="text-body-sm font-semibold leading-snug">
        <legend id={`${q.id}-legenda`}>
          <Rotulo q={q} />
        </legend>
      </Label>
      {q.help && <p id={ajudaId} className="text-body-sm text-muted-foreground">{q.help}</p>}
      {antes}
      {children}
      {erro && <MensagemDeErro id={`${q.id}-erro`}>{erro}</MensagemDeErro>}
    </fieldset>
  );
}

/** Campo "Qual? Escreva aqui" da opção "Outro" marcada. */
function CampoDoOutro({ q, r, mudar }: Props) {
  const marcada = opcoesDe(q).find((o) => isOther(o) && (q.type === "radio" ? textoDe(r, q.id) === o : listaDe<string>(r, q.id).includes(o)));
  const ref = useRef<HTMLInputElement>(null);
  const antes = useRef(!!marcada);
  useEffect(() => {
    if (marcada && !antes.current) ref.current?.focus();
    antes.current = !!marcada;
  }, [marcada]);
  if (!marcada) return null;
  return (
    <Input
      ref={ref}
      maxLength={200}
      placeholder="Qual? Escreva aqui"
      aria-label={`Descreva a opção ${semPonto(marcada)}`}
      value={textoDe(r, q.id + "__outro")}
      onChange={(e) => mudar(q.id + "__outro", e.target.value)}
      className="bg-card"
    />
  );
}

function Escolha({ q, r, erro, mudar }: Props) {
  const opcoes = q.options ?? [];
  const curtas = opcoes.every((o) => o.length <= 28);
  return (
    <Grupo q={q} erro={erro} antes={q.infoHtml && <Apoio html={q.infoHtml} />}>
      <GrupoDeCartoesDeEscolha
        aria-labelledby={`${q.id}-legenda`}
        name={q.id}
        colunas={curtas ? 2 : 1}
        value={textoDe(r, q.id)}
        onValueChange={(v) => mudar(q.id, v)}
      >
        {opcoes.map((o, i) => <CartaoDeEscolha key={o} valor={o} titulo={o} id={i === 0 ? alvo(q) : undefined} />)}
      </GrupoDeCartoesDeEscolha>
      <CampoDoOutro q={q} r={r} mudar={mudar} />
      {q.afterHtml && mostrarDepois(q, r) && (
        <Alert variant="info">
          <MessageCircle aria-hidden />
          <AlertTitle>Link de acesso ao grupo:</AlertTitle>
          <AlertDescription>
            <p>
              <a href={WHATSAPP_GROUP} target="_blank" rel="noopener" className="break-all rounded-sm font-semibold text-primary-text underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {WHATSAPP_GROUP}
              </a>
            </p>
            <p>Se tiver interesse, basta acessar o link acima. A participação no grupo não é necessária para concluir seu cadastro.</p>
          </AlertDescription>
        </Alert>
      )}
    </Grupo>
  );
}

/** "O que estou autorizando": os detalhes de cada autorização, recolhidos (ficam no HTML mesmo fechados). */
function Detalhes({ children }: { children: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  return (
    <Collapsible open={aberto} onOpenChange={setAberto} className="pl-8">
      <CollapsibleTrigger asChild>
        <Button type="button" variant="link" className="group px-0 text-body-sm has-[>svg]:px-0">
          O que estou autorizando
          <ChevronDown aria-hidden className="transition-transform duration-[var(--duration-fast)] group-data-[state=open]:rotate-180 motion-reduce:transition-none" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent forceMount hidden={!aberto}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function Caixas({ q, r, mudar, opcoes, primeira }: Props & { opcoes: string[]; primeira?: boolean }) {
  const marcadas = listaDe<string>(r, q.id);
  return (
    <div className="grid gap-4">
      {opcoes.map((o, i) => {
        const id = primeira && i === 0 ? alvo(q) : `${q.id}-${opcoesDe(q).indexOf(o)}`;
        return (
          <div key={o} className="min-w-0">
            <div className="flex items-start gap-3">
              <Checkbox
                id={id}
                checked={marcadas.includes(o)}
                onCheckedChange={(c) => mudar(q.id, c ? [...marcadas, o] : marcadas.filter((x) => x !== o))}
                className="mt-0.5"
              />
              <Label htmlFor={id} className="text-body font-normal leading-snug text-foreground">{o}</Label>
            </div>
            {q.optionInfo?.[o] && (
              <Detalhes>
                <Apoio html={q.optionInfo[o]} />
              </Detalhes>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** "Política de privacidade": abre a política numa janela, sem sair do formulário (como a página de HTML). Com Ctrl/⌘,
    Shift ou o botão do meio, o link abre a página da política numa aba nova. */
function LinkDaPolitica() {
  const [aberta, setAberta] = useState(false);
  return (
    <>
      <a
        href="/privacidade/"
        target="_blank"
        rel="noopener"
        aria-haspopup="dialog"
        onClick={(e) => {
          if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          setAberta(true);
        }}
      >
        Política de privacidade
      </a>
      <JanelaDaPolitica aberta={aberta} onAbertaChange={setAberta} />
    </>
  );
}

function Marcar({ q, r, erro, mudar }: Props) {
  const marcadas = listaDe<string>(r, q.id);
  let corpo: ReactNode;
  if (q.groups) {
    corpo = (
      <Accordion type="multiple" className="rounded-lg border border-border px-4">
        {q.groups.map((g, gi) => {
          const n = g.options.filter((o) => marcadas.includes(o)).length;
          return (
            <AccordionItem key={g.title} value={g.title}>
              <AccordionTrigger id={gi === 0 ? alvo(q) : undefined} className="min-h-11 items-center hover:no-underline">
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="min-w-0">{g.title}</span>
                  {n > 0 && <Badge variant="secondary">{n}<span className="sr-only">{n === 1 ? " marcada" : " marcadas"}</span></Badge>}
                </span>
              </AccordionTrigger>
              <AccordionContent manterNoHtml>
                <Caixas q={q} r={r} mudar={mudar} opcoes={g.options} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    );
  } else if ((q.options ?? []).every((o) => o.length <= 30)) {
    corpo = (
      <GrupoDeChipsFiltraveis
        rotulo={rotuloDe(q)}
        opcoes={(q.options ?? []).map((o) => ({ valor: o, rotulo: semPonto(o) }))}
        valor={marcadas}
        onValorChange={(v) => mudar(q.id, v)}
      />
    );
  } else corpo = <Caixas q={q} r={r} mudar={mudar} opcoes={q.options ?? []} primeira />;
  return (
    <Grupo q={q} erro={erro}>
      {corpo}
      <CampoDoOutro q={q} r={r} mudar={mudar} />
      {q.id === "autorizacoes" && (
        <Prosa tamanho="sm" className="text-muted-foreground">
          <p>
            Você pode pedir acesso, correção ou exclusão dos dados e retirar qualquer autorização a qualquer momento pelo e-mail <EmailDoEstudio link />, observadas as hipóteses legais de conservação. Leia a{" "}
            <LinkDaPolitica />{" "}
            completa.
          </p>
        </Prosa>
      )}
    </Grupo>
  );
}

/** Linhas que a pessoa acrescenta (atividades, formação, domínio) ou idiomas com o nível. */
function Linhas({ q, r, erro, mudar }: Props) {
  const idiomas = q.type === "idiomas";
  const linhas: (string | Idioma)[] = listaDe<string | Idioma>(r, q.id);
  const vistas = linhas.length ? linhas : [idiomas ? { idioma: "", nivel: "" } : ""];
  const caixa = useRef<HTMLDivElement>(null);
  const focar = useRef<number | null>(null);
  useEffect(() => {
    if (focar.current === null) return;
    caixa.current?.querySelectorAll<HTMLInputElement>("input")[focar.current]?.focus();
    focar.current = null;
  });
  const gravar = (v: (string | Idioma)[]) => mudar(q.id, v as Resposta);
  const trocar = (i: number, v: string | Idioma) => gravar(vistas.map((x, j) => (j === i ? v : x)));
  const vazia = (x: string | Idioma) => !(typeof x === "string" ? x : x.idioma).trim();
  const acrescentar = () => {
    const i = vistas.findIndex(vazia);
    if (i >= 0) { focar.current = i; gravar([...vistas]); return; }
    focar.current = vistas.length;
    gravar([...vistas, idiomas ? { idioma: "", nivel: "" } : ""]);
  };
  const tirar = (i: number) => {
    focar.current = Math.max(0, (vistas.length > 1 ? vistas.length - 2 : 0));
    gravar(vistas.length > 1 ? vistas.filter((_, j) => j !== i) : [idiomas ? { idioma: "", nivel: "" } : ""]);
  };
  const incompletas = idiomas ? idiomasIncompletos(q, { [q.id]: vistas as Idioma[] }) : [];
  return (
    <Grupo q={q} erro={erro} antes={q.helpHtml && <Apoio html={q.helpHtml} />}>
      <div ref={caixa} className="grid gap-3">
        {vistas.map((x, i) => (
          <div key={i} className="flex min-w-0 items-start gap-2">
            {idiomas ? (
              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                <Input
                  id={i === 0 ? alvo(q) : undefined}
                  maxLength={60}
                  placeholder="Ex.: Inglês"
                  aria-label={`Idioma ${i + 1}`}
                  aria-invalid={incompletas.includes(i) ? true : undefined}
                  value={(x as Idioma).idioma}
                  onChange={(e) => trocar(i, { ...(x as Idioma), idioma: e.target.value })}
                  className="bg-card"
                />
                <Select value={(x as Idioma).nivel} onValueChange={(v) => trocar(i, { ...(x as Idioma), nivel: v })}>
                  <SelectTrigger aria-label={`Nível de fluência do idioma ${i + 1}`} aria-invalid={incompletas.includes(i) ? true : undefined} className="w-full bg-card">
                    <SelectValue placeholder="Nível" />
                  </SelectTrigger>
                  <SelectContent>{(q.levels ?? []).map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ) : (
              <Input
                id={i === 0 ? alvo(q) : undefined}
                maxLength={200}
                placeholder={q.placeholder}
                aria-label={`Item ${i + 1}`}
                value={x as string}
                onChange={(e) => trocar(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if ((x as string).trim()) acrescentar();
                  }
                }}
                className="min-w-0 flex-1 bg-card"
              />
            )}
            <Button type="button" variant="ghost" size="icon" aria-label={idiomas ? "Remover idioma" : "Remover item"} onClick={() => tirar(i)}>
              <X aria-hidden />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" onClick={acrescentar}>
        <Plus aria-hidden /> {idiomas ? "Adicionar idioma" : "Adicionar item"}
      </Button>
    </Grupo>
  );
}

const CARREGAR_CIDADES = async (uf: string): Promise<string[]> => {
  const resposta = await fetch(`/data/municipios/${uf}.json`);
  if (!resposta.ok) throw new Error(String(resposta.status));
  return resposta.json();
};

export function PerguntaDoCadastro(props: Props) {
  const { q, r, erro, mudar, aoSairDoEmail } = props;
  const comum = { rotulo: rotuloDe(q), obrigatorio: q.required, erro, ajuda: q.help };
  switch (q.type) {
    case "radio":
      return <Escolha {...props} />;
    case "checkbox":
      return <Marcar {...props} />;
    case "list":
    case "idiomas":
      return <Linhas {...props} />;
    case "uf_cidade": {
      const v = ufCidade(r, q.id);
      return (
        <Grupo q={q} erro={erro}>
          <CampoEstadoCidade
            uf={v.uf}
            cidade={v.cidade}
            onChange={(uf, cidade) => mudar(q.id, { uf, cidade })}
            carregarCidades={CARREGAR_CIDADES}
            obrigatorio
            textos={{ falha: "Não foi possível carregar as cidades. Tente de novo." }}
          />
          <span id={alvo(q)} tabIndex={-1} className="sr-only">{rotuloDe(q)}</span>
        </Grupo>
      );
    }
    case "email":
      return <CampoDeEmail {...comum} id={q.id} name={q.id} valor={textoDe(r, q.id)} onValorChange={(v) => mudar(q.id, v)} onBlur={aoSairDoEmail} />;
    case "tel":
      return <CampoDeTelefone {...comum} id={q.id} name={q.id} valor={textoDe(r, q.id)} onValorChange={(v) => mudar(q.id, v)} />;
    case "paragraph":
      return (
        <Campo {...comum} id={q.id} depois={q.helpHtml && <Apoio html={q.helpHtml} id={`${q.id}-apoio`} />}>
          {(p) => (
            <Textarea
              {...p}
              aria-describedby={[p["aria-describedby"], q.helpHtml ? `${q.id}-apoio` : undefined].filter(Boolean).join(" ") || undefined}
              name={q.id}
              rows={4}
              value={textoDe(r, q.id)}
              onChange={(e) => mudar(q.id, e.target.value)}
              className="bg-card"
            />
          )}
        </Campo>
      );
    case "url":
      return (
        <Campo
          {...comum}
          id={q.id}
          name={q.id}
          type="url"
          inputMode="url"
          autoCapitalize="off"
          spellCheck={false}
          autoComplete="url"
          // "https://" fixo na caixa (Input prefixo do DS), como na página de HTML: sai do que a pessoa digita ou cola e
          // volta no valor gravado (withScheme).
          prefixo="https://"
          placeholder={(q.placeholder || "").replace(/^https?:\/\//i, "") || undefined}
          value={textoDe(r, q.id)}
          onChange={(e) => mudar(q.id, semScheme(e.target.value))}
        />
      );
    default:
      return (
        <Campo
          {...comum}
          id={q.id}
          name={q.id}
          autoComplete={q.id === "nome" ? "name" : "off"}
          maxLength={q.maxlength}
          placeholder={q.placeholder}
          value={textoDe(r, q.id)}
          onChange={(e) => mudar(q.id, e.target.value)}
        />
      );
  }
}
