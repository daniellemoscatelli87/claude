// Autorizar o perfil na Galeria de Profissionais (rede-parceiros/galeria/autorizar, link pessoal ?t= do e-mail), em React
// com o DS (D-053, lote S5b). O mesmo fluxo da página de HTML com a função `galeria-autorizacao`: "ver" ao abrir,
// "ia" quando as sugestões estão pendentes e "decidir" ao enviar, com os mesmos campos (a foto recortada em 600 × 600
// no aparelho, como data URL JPEG). A galeria em si continua oculta no site (decisão da Dani de 23/11/2026).
// Peças do DS: Logo, Selo, Heading, Skeleton, Alert, Campo (ajuda, Input prefixo "https://"), Select, RecorteDeFoto
// (UploadDropzone + recorte), Card, Avatar, Badge, Checkbox, Label, Dialog, BotaoDeEnvio, EstadoFinal (confete), Button.
import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, ImageUp, Info, Trash2 } from "lucide-react";
import { Linkedin } from "@/components/ui/icones-preservados";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BotaoDeEnvio, type EstadoDoEnvio } from "@/components/ui/botao-de-envio";
import { Button } from "@/components/ui/button";
import { Campo, MensagemDeErro } from "@/components/ui/campo";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EstadoFinal } from "@/components/ui/estado-vazio";
import { Heading } from "@/components/ui/heading";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { RecorteDeFoto } from "@/components/ui/recorte-de-foto";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Selo } from "@/components/ui/selo";
import { Skeleton } from "@/components/ui/skeleton";

export const API_GALERIA = "https://lipfvnerohkaajegqvwr.supabase.co/functions/v1/galeria-autorizacao";
const NIVEL: Record<string, string> = { "Menos de 1 ano": "Júnior", "Entre 1 e 2 anos": "Júnior", "Entre 3 e 5 anos": "Pleno", "Entre 6 e 10 anos": "Sênior", "Entre 11 e 15 anos": "Especialista", "Entre 16 e 20 anos": "Especialista", "Mais de 20 anos": "Especialista" };
export const nivelDe = (t: string) => NIVEL[String(t || "").replace(/\.\s*$/, "")] || "";
export const semScheme = (v: string) => String(v || "").replace(/\s+/g, "").replace(/^(?:https?:\/\/)+/i, "");
const iniciais = (n: string) => (n || "?").trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

type Dados = { nome?: string; cargo?: string; tempo?: string; tempos?: string[]; tags?: string[]; areas: string[]; segmentos: string[]; ia_pendente?: boolean; linkedin?: string; texto?: string; foto_url?: string; status?: string };

function post<T>(t: string, corpo: Record<string, unknown>): Promise<T> {
  return fetch(API_GALERIA, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ t, ...corpo }) })
    .then((r) => r.json().then((j) => { if (!r.ok) throw new Error(j.error || "Não foi possível concluir agora."); return j as T; }));
}
const comoDataUrl = (b: Blob) => new Promise<string>((ok, falha) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = falha; r.readAsDataURL(b); });

export function GaleriaAutorizar() {
  const [t, setT] = useState("");
  const [d, setD] = useState<Dados | null>(null);
  const [erroGeral, setErroGeral] = useState("");
  const [esp, setEsp] = useState("");
  const [espEditada, setEspEditada] = useState(false);
  const [tempo, setTempo] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [fotoAtual, setFotoAtual] = useState("");
  const [fotoNova, setFotoNova] = useState("");
  const [removerFoto, setRemoverFoto] = useState(false);
  const [trocando, setTrocando] = useState(false);
  const [aceite, setAceite] = useState(false);
  const [erroAceite, setErroAceite] = useState(false);
  const [erro, setErro] = useState("");
  const [envio, setEnvio] = useState<EstadoDoEnvio>("parado");
  const [enviado, setEnviado] = useState(false);
  const [termos, setTermos] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("t") || "";
    setT(token);
    post<Dados>(token, { acao: "ver" }).then((dd) => {
      setD(dd); setEsp(dd.cargo || ""); setTempo(dd.tempo || ""); setLinkedin(semScheme(String(dd.linkedin || "").replace(/^(?:https?:\/\/)+/i, "")));
      setTags(dd.tags && dd.tags.length ? dd.tags : dd.areas.concat(dd.segmentos)); setFotoAtual(dd.foto_url || "");
      // a página abre na hora; as sugestões da IA chegam depois, sem apagar o que a pessoa já digitou
      if (dd.ia_pendente) post<{ cargo?: string; tags?: string[] }>(token, { acao: "ia" }).then((ia) => {
        if (ia.cargo) setEspEditada((ed) => { if (!ed) setEsp(ia.cargo!); return ed; });
        if (ia.tags && ia.tags.length) setTags(ia.tags);
      }).catch(() => {});
    }).catch((e: Error) => setErroGeral(e.message));
  }, []);

  const autorizado = d?.status === "autorizado";
  const foto = fotoNova || (removerFoto ? "" : fotoAtual);
  const nivel = nivelDe(tempo);
  const unicas = tags.filter((a, i, l) => a && l.indexOf(a) === i);

  async function enviar() {
    setErro("");
    if (!autorizado && !aceite) { setErroAceite(true); setErro("Marque a autorização para enviar o seu perfil."); document.getElementById("aceite")?.focus(); return; }
    setEnvio("enviando");
    const li = semScheme(linkedin);
    try {
      await post(t, { acao: "decidir", decisao: "autorizado", especialidade: esp, tempo, linkedin: li ? "https://" + li : "", foto: fotoNova, remover_foto: removerFoto });
      setFotoNova(""); setRemoverFoto(false); setEnviado(true);
      window.scrollTo({ top: 0 });
    } catch (e) { setErro((e as Error).message); }
    finally { setEnvio("parado"); }
  }

  const linkTermos = (
    <Button type="button" variant="link" className="inline h-auto min-h-0 px-0 py-0 align-baseline text-body-sm max-sm:h-auto toque:h-auto pointer-coarse:h-auto" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTermos(true); }}>termos</Button>
  );

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-8 sm:px-6">
      <a href="/" aria-label="Ir para a página inicial" className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <Logo variante="horizontal" className="h-11" />
      </a>
      <div className="mt-8 flex flex-col items-start gap-3">
        <Selo>Galeria de profissionais</Selo>
        <Heading level={1}>{enviado ? "Perfil enviado com sucesso!" : "Seu perfil na galeria da rede"}</Heading>
        {!enviado && <p className="text-body text-muted-foreground">Veja como o seu perfil profissional vai aparecer no site e decida se autoriza a exibição.</p>}
      </div>

      {enviado ? (
        <EstadoFinal titulo="Obrigada!" nivel={2} comemorar className="mt-8 px-0">
          <div className="flex flex-col items-center gap-4 text-center">
            <img src="/rede-parceiros/galeria/dani-positivo-v3.webp" alt="Dani Moscatelli fazendo sinal de positivo com as duas mãos, ao lado de um selo de confirmado" width={1254} height={1254} loading="lazy" className="size-48 object-contain" />
            <p className="text-body text-muted-foreground">Obrigada por fazer parte da Galeria de Profissionais da Rede de Parceiros. Seu perfil vai compor a galeria do site.</p>
            <p className="text-body text-muted-foreground">Se quiser remover o seu perfil, é só enviar um e-mail para <a href="mailto:contato@danimoscatelli.com.br" className="font-semibold text-primary-text underline underline-offset-2">contato@danimoscatelli.com.br</a>.</p>
            <Button asChild><a href="https://www.danimoscatelli.com.br/rede-parceiros/">Ir para o site</a></Button>
          </div>
        </EstadoFinal>
      ) : erroGeral ? (
        <Alert variant="error" className="mt-8"><CircleAlert aria-hidden /><AlertDescription>{erroGeral}</AlertDescription></Alert>
      ) : !d ? (
        <div role="status" aria-busy="true" className="mt-8 flex flex-col gap-4">
          <span className="sr-only">Carregando…</span>
          <Skeleton className="h-5 w-40" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-40" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-10">
          {d.status && (
            <Alert variant={autorizado ? "success" : "info"}>
              {autorizado ? <CheckCircle2 aria-hidden /> : <Info aria-hidden />}
              <AlertDescription role="status">
                {autorizado ? "A exibição do seu perfil está autorizada. Para retirar a autorização, escreva para contato@danimoscatelli.com.br." : "Você não autorizou a exibição. Seu perfil não aparece na galeria. Se mudar de ideia, marque a autorização abaixo e envie o perfil."}
              </AlertDescription>
            </Alert>
          )}

          <section aria-labelledby="g-dados" className="flex flex-col gap-6">
            <Heading level={2} id="g-dados" size="card">Dados do seu perfil</Heading>
            <Campo id="especialidade" rotulo="Especialidade" ajuda="Sugerida a partir do seu cadastro. Se preferir, altere. Até 80 caracteres." maxLength={80} value={esp} onChange={(e) => { setEsp(e.target.value); setEspEditada(true); }} />
            <Campo id="tempo" rotulo="Senioridade" ajuda="Pelo tempo de atuação na sua principal especialidade, informado no cadastro. Se mudou, atualize: o seu cadastro também é atualizado.">
              {(p) => (
                <Select value={tempo || undefined} onValueChange={setTempo}>
                  <SelectTrigger {...p} className="w-full bg-card"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{(d.tempos || []).map((x) => <SelectItem key={x} value={x}>{x.replace(/\.\s*$/, "") + " · " + nivelDe(x)}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </Campo>
            <Campo id="linkedin" rotulo="Link do seu LinkedIn" ajuda="Informado no seu cadastro. Se precisar, altere." type="url" inputMode="url" autoCapitalize="off" spellCheck={false} autoComplete="url" maxLength={300} prefixo="https://" placeholder="www.linkedin.com/in/seu-perfil" value={linkedin} onChange={(e) => setLinkedin(semScheme(e.target.value))} />
            <div className="flex flex-col gap-3">
              <p className="text-body-sm font-semibold text-foreground">Sua foto</p>
              {foto && !trocando && <p className="text-body-sm text-muted-foreground">JPG, PNG ou WEBP, até 15 MB e com pelo menos 300 × 300 pixels. Depois de escolher, ajuste o enquadramento.</p>}
              {foto && !trocando ? (
                <div className="flex flex-wrap items-center gap-3">
                  <Avatar className="size-12"><AvatarImage src={foto} alt="" /><AvatarFallback>{iniciais(d.nome || "")}</AvatarFallback></Avatar>
                  <span className="min-w-0 flex-1 text-body-sm text-foreground">{fotoNova ? "Foto nova" : "Foto atual"}</span>
                  <Button type="button" variant="outline" onClick={() => setTrocando(true)}><ImageUp aria-hidden />Alterar foto</Button>
                  <Button type="button" variant="exclusao-contorno" onClick={() => { setFotoNova(""); setRemoverFoto(!!fotoAtual); setTrocando(false); }}><Trash2 aria-hidden />Excluir foto</Button>
                </div>
              ) : (
                <RecorteDeFoto
                  textos={{ dica: "Arraste a foto para enquadrar o rosto no círculo e use o zoom se precisar." }}
                  onRecortar={async (blob, url) => { URL.revokeObjectURL(url); setFotoNova(await comoDataUrl(blob)); setRemoverFoto(false); setTrocando(false); document.getElementById("previa")?.scrollIntoView({ block: "center" }); }}
                  onCancelar={() => setTrocando(false)}
                />
              )}
            </div>
          </section>

          <section aria-labelledby="g-previa" className="flex flex-col gap-3">
            <Heading level={2} id="g-previa" size="card">Prévia do seu perfil</Heading>
            <Card id="previa" aria-label="Prévia do perfil" className="max-w-sm">
              <CardContent className="flex flex-col gap-2 pt-6">
                <div className="relative w-fit">
                  <Avatar className="size-24"><AvatarImage src={foto || undefined} alt="" /><AvatarFallback className="text-h4">{iniciais(d.nome || "")}</AvatarFallback></Avatar>
                  {semScheme(linkedin) && <span aria-hidden className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground"><Linkedin className="size-4" /></span>}
                </div>
                <Heading level={3} size="card" className="mt-3">{d.nome}</Heading>
                <p className="text-body-sm text-foreground">{esp.trim() || d.cargo || ""}</p>
                {nivel && <p className="text-body-sm text-muted-foreground">{nivel}</p>}
                <ul aria-label="Áreas de atuação e segmentos" className="mt-2 flex flex-wrap gap-1.5">{unicas.map((a) => <li key={a}><Badge variant="outline">{a}</Badge></li>)}</ul>
              </CardContent>
            </Card>
            <p className="text-body-sm text-muted-foreground">É assim que o seu perfil vai aparecer no site <a href="https://www.danimoscatelli.com.br/rede-parceiros/" target="_blank" rel="noopener" className="font-semibold text-primary-text underline underline-offset-2">www.danimoscatelli.com.br/rede-parceiros</a></p>
          </section>

          <section aria-labelledby={autorizado ? undefined : "g-aut"} className="flex flex-col gap-4">
            {!autorizado && (
              <>
                <Heading level={2} id="g-aut" size="card">Autorização</Heading>
                <div className="flex items-start gap-3">
                  <Checkbox id="aceite" checked={aceite} aria-invalid={erroAceite || undefined} onCheckedChange={(v) => { setAceite(v === true); setErroAceite(false); setErro(""); }} className="mt-0.5" />
                  <Label htmlFor="aceite" className="block text-body-sm font-normal leading-relaxed text-foreground">Autorizo a exibição do meu perfil na Galeria de Profissionais, conforme os {linkTermos}.</Label>
                </div>
              </>
            )}
            <BotaoDeEnvio type="button" className="w-full sm:w-auto sm:self-start" estado={envio} textos={{ enviando: "Enviando…" }} onClick={enviar}>Enviar perfil</BotaoDeEnvio>
            <p className="text-body-sm text-muted-foreground">Ao enviar, você concorda com a exibição do seu perfil na Galeria de Profissionais do site, conforme os {linkTermos}.</p>
            {erro && <MensagemDeErro>{erro}</MensagemDeErro>}
          </section>

          <Dialog open={termos} onOpenChange={setTermos}>
            <DialogContent className="flex max-h-9/10 flex-col gap-0 p-0">
              <DialogHeader className="border-b px-6 py-4 pr-14 text-left">
                <DialogTitle>Termos da Galeria de Profissionais</DialogTitle>
                <DialogDescription className="sr-only">O que você autoriza ao enviar o perfil.</DialogDescription>
              </DialogHeader>
              <p className="min-h-0 flex-1 overflow-y-auto whitespace-pre-line px-6 py-6 text-body text-foreground">{d.texto}</p>
              <DialogFooter className="border-t px-6 py-4"><DialogClose asChild><Button variant="outline">Fechar</Button></DialogClose></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </main>
  );
}
