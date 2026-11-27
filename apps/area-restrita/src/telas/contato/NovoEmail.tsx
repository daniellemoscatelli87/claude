// Novo e-mail no Contato: escrever para um ou vários endereços, com cópia (Cc), cópia oculta (Cco), anexos e a
// assinatura; vira uma conversa na aba Enviados. Os mesmos campos, regras e textos da janela de
// public/admin/contatos/index.html, com o Dialog do DS, CampoDeEmails (etiquetas), Campo, Textarea, Anexador,
// BotaoDeEnvio e, no fim, o EstadoFinal ("E-mail enviado").
import * as React from "react";
import { Send } from "lucide-react";
import { BotaoDeEnvio, type EstadoDoEnvio } from "@/components/ui/botao-de-envio";
import { Button } from "@/components/ui/button";
import { Campo, MensagemDeErro } from "@/components/ui/campo";
import { CampoDeEmails } from "@/components/ui/campo-de-emails";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EstadoFinal } from "@/components/ui/estado-vazio";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registrar } from "@/lib/supabase";
import { JANELA_GRANDE } from "../email";
import { Anexador } from "./Anexador";
import { qtdAnexos, subirAnexos } from "./anexos";
import { responderContato } from "./Leitura";

export const EMAIL_OK = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]{2,}$/;
export const MAX_ENDERECOS = 20; // Para + Cc + Cco

/** Erros do formulário com os textos da página de HTML (nada = tudo certo). */
export function errosDoNovoEmail(v: { para: string[]; cc: string[]; cco: string[]; assunto: string; texto: string }) {
  const ruim = (l: string[]) => l.find((e) => !EMAIL_OK.test(e));
  const e: Record<string, string> = {};
  if (!v.para.length) e.para = "Informe o e-mail de pelo menos um destinatário.";
  else if (ruim(v.para)) e.para = `Confira o e-mail ${ruim(v.para)}: ele parece incompleto.`;
  else if (v.para.length + v.cc.length + v.cco.length > MAX_ENDERECOS) e.para = `Envie para no máximo ${MAX_ENDERECOS} endereços, somando Para, Cc e Cco.`;
  if (ruim(v.cc)) e.cc = `Confira o e-mail ${ruim(v.cc)}: ele parece incompleto.`;
  if (ruim(v.cco)) e.cco = `Confira o e-mail ${ruim(v.cco)}: ele parece incompleto.`;
  if (!v.assunto.trim()) e.assunto = "Informe o assunto.";
  if (!v.texto.trim()) e.texto = "Escreva a mensagem.";
  return e;
}

function CampoDeEnderecos({ id, rotulo, valor, mudar, erro, extra, nota }: { id: string; rotulo: string; valor: string[]; mudar: (l: string[]) => void; erro?: string; extra?: React.ReactNode; nota?: string }) {
  const desc = [erro ? id + "-erro" : null, nota ? id + "-nota" : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={id} className="text-body-sm font-semibold">{rotulo}</Label>
        {extra}
      </div>
      <CampoDeEmails id={id} valor={valor} onValorChange={mudar} invalido={!!erro} aria-describedby={desc} />
      {nota && <p id={id + "-nota"} className="text-body-sm text-muted-foreground">{nota}</p>}
      {erro && <MensagemDeErro id={id + "-erro"}>{erro}</MensagemDeErro>}
    </div>
  );
}

export function NovoEmail({ aberto, mudar, aoEnviar, verConversa }: { aberto: boolean; mudar: (v: boolean) => void; aoEnviar: (contatoId: string) => void; verConversa: (contatoId: string) => void }) {
  const [id, setId] = React.useState(() => crypto.randomUUID()); // id da conversa e da pasta dos anexos
  const [para, setPara] = React.useState<string[]>([]);
  const [cc, setCc] = React.useState<string[]>([]);
  const [cco, setCco] = React.useState<string[]>([]);
  const [comCc, setComCc] = React.useState(false);
  const [comCco, setComCco] = React.useState(false);
  const [nome, setNome] = React.useState("");
  const [assunto, setAssunto] = React.useState("");
  const [texto, setTexto] = React.useState("");
  const [arquivos, setArquivos] = React.useState<File[]>([]);
  const [erros, setErros] = React.useState<Record<string, string>>({});
  const [envio, setEnvio] = React.useState<EstadoDoEnvio>("parado");
  const [rotulo, setRotulo] = React.useState<string | null>(null);
  const [falha, setFalha] = React.useState<string | null>(null);
  const [enviado, setEnviado] = React.useState<{ contatoId: string; texto: string } | null>(null);

  const limpar = () => {
    setId(crypto.randomUUID()); setPara([]); setCc([]); setCco([]); setComCc(false); setComCco(false); setNome(""); setAssunto(""); setTexto("");
    setArquivos([]); setErros({}); setEnvio("parado"); setFalha(null); setEnviado(null);
  };
  React.useEffect(() => { if (aberto) { limpar(); setTimeout(() => document.getElementById("ne-para")?.focus(), 60); } }, [aberto]);
  // Cc e Cco aparecem só quando pedidos; o foco vai para o campo novo logo que ele aparece.
  React.useEffect(() => { if (comCc) document.getElementById("ne-cc")?.focus(); }, [comCc]);
  React.useEffect(() => { if (comCco) document.getElementById("ne-cco")?.focus(); }, [comCco]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFalha(null);
    const er = errosDoNovoEmail({ para, cc, cco, assunto, texto });
    setErros(er);
    const primeiro = er.para ? "ne-para" : er.cc ? "ne-cc" : er.cco ? "ne-cco" : er.assunto ? "ne-assunto" : er.texto ? "ne-texto" : null;
    if (primeiro) return document.getElementById(primeiro)?.focus();
    setEnvio("enviando");
    const lista = await subirAnexos(arquivos, id, setRotulo);
    setRotulo(null);
    if (typeof lista === "string") { setEnvio("erro"); return setFalha(lista); }
    const res = await responderContato({ novo: { id, para, cc, cco, nome: nome.trim(), assunto: assunto.trim() }, mensagem: texto.trim(), anexos: lista });
    if (!res.data) { setEnvio("erro"); return setFalha("Não foi possível enviar o e-mail." + (res.erro ? " " + res.erro : " Tente novamente.")); }
    const total = para.length + cc.length + cco.length;
    await registrar("Enviou um e-mail para " + para.join(", ") + (cc.length ? " (Cc: " + cc.join(", ") + ")" : ""), qtdAnexos(lista));
    setEnvio("feito");
    const contatoId = String(res.data.contato_id || id);
    setEnviado({ contatoId, texto: (total === 1 ? "Enviado para " + para[0] : "Enviado para " + total + " endereços") + ". A conversa está na aba Enviados." });
    aoEnviar(contatoId);
  };

  return (
    <Dialog open={aberto} onOpenChange={(v) => envio !== "enviando" && mudar(v)}>
      <DialogContent className={JANELA_GRANDE}>
        {enviado ? (
          <>
            <DialogHeader className="sr-only"><DialogTitle>E-mail enviado</DialogTitle><DialogDescription>{enviado.texto}</DialogDescription></DialogHeader>
            <EstadoFinal
              tom="sucesso" titulo="E-mail enviado" descricao={enviado.texto} focarAoAparecer
              acoes={<><Button type="button" variant="outline" onClick={limpar}>Escrever outro</Button><Button type="button" onClick={() => verConversa(enviado.contatoId)}>Ver conversa</Button></>}
            />
          </>
        ) : (
          <form onSubmit={enviar} noValidate className="contents">
            <DialogHeader>
              <DialogTitle>Novo e-mail</DialogTitle>
              <DialogDescription>Enviado por contato@danimoscatelli.com.br. Sua assinatura é incluída automaticamente no final do e-mail.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-5">
              <CampoDeEnderecos
                id="ne-para" rotulo="Para" valor={para} mudar={(l) => { setPara(l); setErros((x) => ({ ...x, para: "" })); }} erro={erros.para}
                extra={(!comCc || !comCco) && (
                  <span className="flex gap-1">
                    {!comCc && <Button type="button" variant="ghost" size="sm" aria-label="Adicionar cópia (Cc)" onClick={() => setComCc(true)}>Cc</Button>}
                    {!comCco && <Button type="button" variant="ghost" size="sm" aria-label="Adicionar cópia oculta (Cco)" onClick={() => setComCco(true)}>Cco</Button>}
                  </span>
                )}
              />
              {comCc && <CampoDeEnderecos id="ne-cc" rotulo="Cc (cópia)" valor={cc} mudar={(l) => { setCc(l); setErros((x) => ({ ...x, cc: "" })); }} erro={erros.cc} />}
              {comCco && (
                <CampoDeEnderecos
                  id="ne-cco" rotulo="Cco (cópia oculta)" valor={cco} mudar={(l) => { setCco(l); setErros((x) => ({ ...x, cco: "" })); }} erro={erros.cco}
                  nota="Quem está em cópia oculta recebe este e-mail, mas não aparece para os outros e não recebe as próximas respostas da conversa."
                />
              )}
              <Campo id="ne-nome" rotulo="Nome da conversa (opcional)" placeholder="Como a conversa aparece na lista" value={nome} onChange={(e) => setNome(e.target.value)} />
              <Campo id="ne-assunto" rotulo="Assunto" value={assunto} erro={erros.assunto || null} onChange={(e) => { setAssunto(e.target.value); setErros((x) => ({ ...x, assunto: "" })); }} />
              <Campo id="ne-texto" rotulo="Mensagem" erro={erros.texto || null}>
                {(p) => <Textarea {...p} rows={7} placeholder="Escreva sua mensagem…" value={texto} onChange={(e) => { setTexto(e.target.value); setErros((x) => ({ ...x, texto: "" })); }} />}
              </Campo>
              <Anexador arquivos={arquivos} mudar={setArquivos} desabilitado={envio === "enviando"} />
              <div aria-live="polite">{falha && <MensagemDeErro>{falha}</MensagemDeErro>}</div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" disabled={envio === "enviando"} onClick={() => mudar(false)}>Cancelar</Button>
              <BotaoDeEnvio type="submit" estado={envio} onVoltar={() => setEnvio("parado")} icone={<Send aria-hidden />} textos={{ enviando: rotulo || "Enviando…" }}>Enviar e-mail</BotaoDeEnvio>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
