// Janela de escrever um e-mail em massa (Lançamento e Comunicados): os mesmos campos, regras e textos das janelas das
// páginas de HTML, com o Dialog do DS (que agora fecha com "Fechar" em português), Campo, Input, Textarea e Button.
import * as React from "react";
import { Eye, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Campo } from "@/components/ui/campo";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Mensagem, PreviaDoEmail, type Aviso } from "./comum";

export type CamposDoEmail = { assunto: string; titulo: string; mensagem: string };

type Props = {
  aberto: boolean;
  mudar: (v: boolean) => void;
  titulo: string;
  /** "O e-mail vai para N pessoas…" */
  descricao: string;
  valores: CamposDoEmail;
  aoMudar: (v: CamposDoEmail) => void;
  exemplos: CamposDoEmail;
  dica: string;
  rotuloEnviar: string;
  iconeEnviar: React.ReactNode;
  /** Gera o HTML do e-mail (ação "preview" da função). */
  previa: (v: CamposDoEmail) => Promise<{ html?: string; error?: string }>;
  /** Envia (depois da confirmação, feita por quem chama). Devolve um erro para mostrar, ou nada. */
  enviar: (v: CamposDoEmail) => Promise<string | void>;
};

/** Classes da janela grande do DS: mais larga que o padrão e com rolagem por dentro quando a tela é baixa. */
export const JANELA_GRANDE = "max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl";

export function JanelaDeEmail({ aberto, mudar, titulo, descricao, valores, aoMudar, exemplos, dica, rotuloEnviar, iconeEnviar, previa, enviar }: Props) {
  const [aviso, setAviso] = React.useState<Aviso>(null);
  const [html, setHtml] = React.useState<string | null>(null);
  const [gerando, setGerando] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);
  const fimDaPrevia = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { if (aberto) { setAviso(null); setHtml(null); } }, [aberto]);

  const mudarCampo = (k: keyof CamposDoEmail) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    aoMudar({ ...valores, [k]: e.target.value });
    setHtml(null);
    setAviso(null);
  };
  const conferir = (): CamposDoEmail | null => {
    const v = { assunto: valores.assunto.trim(), titulo: valores.titulo.trim(), mensagem: valores.mensagem.trim() };
    const falta = !v.assunto ? "assunto" : !v.titulo ? "titulo" : !v.mensagem ? "mensagem" : null;
    if (falta) {
      setAviso({ tom: "erro", texto: "Preencha o assunto, o título e a mensagem." });
      // o Input e o Textarea do DS não repassam ref (React 18): o foco vai pelo id
      document.getElementById("email-" + falta)?.focus();
      return null;
    }
    setAviso(null);
    return v;
  };
  const verPrevia = async () => {
    const v = conferir();
    if (!v) return;
    setGerando(true);
    const r = await previa(v);
    setGerando(false);
    if (r.error || !r.html) return setAviso({ tom: "erro", texto: r.error || "Não foi possível gerar a pré-visualização." });
    setHtml(r.html);
    requestAnimationFrame(() => fimDaPrevia.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" }));
  };
  const mandar = async () => {
    const v = conferir();
    if (!v) return;
    setEnviando(true);
    const erro = await enviar(v);
    setEnviando(false);
    if (erro) setAviso({ tom: "erro", texto: erro });
  };

  return (
    <Dialog open={aberto} onOpenChange={(v) => !enviando && mudar(v)}>
      <DialogContent className={JANELA_GRANDE}>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-5">
          <Campo id="email-assunto" rotulo="Assunto do e-mail" maxLength={200} placeholder={exemplos.assunto} value={valores.assunto} onChange={mudarCampo("assunto")} />
          <Campo id="email-titulo" rotulo="Título da mensagem" maxLength={200} placeholder={exemplos.titulo} value={valores.titulo} onChange={mudarCampo("titulo")} />
          <Campo id="email-mensagem" rotulo="Mensagem" ajuda={dica}>
            {(p) => <Textarea {...p} maxLength={10000} rows={8} placeholder={exemplos.mensagem} value={valores.mensagem} onChange={mudarCampo("mensagem")} />}
          </Campo>
          {html && (
            <div ref={fimDaPrevia} className="grid gap-2 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300">
              <p className="text-body-sm font-semibold text-foreground">Pré-visualização</p>
              <PreviaDoEmail html={html} titulo="Pré-visualização do e-mail" />
            </div>
          )}
          <Mensagem aviso={aviso} className="empty:hidden" />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={verPrevia} disabled={gerando || enviando}>
            {gerando ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : <Eye aria-hidden />}
            {gerando ? "Gerando…" : "Pré-visualizar e-mail"}
          </Button>
          <Button type="button" onClick={mandar} disabled={enviando || gerando}>
            {enviando ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : iconeEnviar}
            {enviando ? "Enviando…" : rotuloEnviar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
