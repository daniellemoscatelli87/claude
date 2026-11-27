// Painel de escrever um e-mail em massa (Lançamento e Comunicados): os mesmos campos, regras e textos das janelas das
// páginas de HTML, montados com o SidePanel do DS (cabeçalho fixo, corpo rolável e barra de ação fixa), Label, Input,
// Textarea, Button e Alert. O painel lateral substitui a janela central: o DS ainda tem o "Close" em inglês no Dialog
// (D-047), e o SidePanel já fecha com "Fechar".
import * as React from "react";
import { Eye, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidePanel, SidePanelActions, SidePanelBody, SidePanelContent, SidePanelHeader } from "@/components/ui/side-panel";
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

export function PainelDeEmail({ aberto, mudar, titulo, descricao, valores, aoMudar, exemplos, dica, rotuloEnviar, iconeEnviar, previa, enviar }: Props) {
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
    <SidePanel open={aberto} onOpenChange={(v) => !enviando && mudar(v)}>
      <SidePanelContent width="lg" closeLabel="Fechar">
        <SidePanelHeader title={titulo} description={descricao} />
        <SidePanelBody>
          <div className="grid gap-5 py-2">
            <div className="grid gap-2">
              <Label htmlFor="email-assunto">Assunto do e-mail</Label>
              <Input id="email-assunto" maxLength={200} placeholder={exemplos.assunto} value={valores.assunto} onChange={mudarCampo("assunto")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email-titulo">Título da mensagem</Label>
              <Input id="email-titulo" maxLength={200} placeholder={exemplos.titulo} value={valores.titulo} onChange={mudarCampo("titulo")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email-mensagem">Mensagem</Label>
              <Textarea id="email-mensagem" maxLength={10000} rows={8} placeholder={exemplos.mensagem} value={valores.mensagem} onChange={mudarCampo("mensagem")} aria-describedby="email-dica" />
              <p id="email-dica" className="text-sm text-muted-foreground">{dica}</p>
            </div>
            {html && (
              <div ref={fimDaPrevia} className="grid gap-2 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300">
                <p className="text-sm font-semibold text-foreground">Pré-visualização</p>
                <PreviaDoEmail html={html} titulo="Pré-visualização do e-mail" />
              </div>
            )}
            <Mensagem aviso={aviso} />
          </div>
        </SidePanelBody>
        <SidePanelActions>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={verPrevia} disabled={gerando || enviando}>
              {gerando ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : <Eye aria-hidden />}
              {gerando ? "Gerando…" : "Pré-visualizar e-mail"}
            </Button>
            <Button type="button" onClick={mandar} disabled={enviando || gerando}>
              {enviando ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : iconeEnviar}
              {enviando ? "Enviando…" : rotuloEnviar}
            </Button>
          </div>
        </SidePanelActions>
      </SidePanelContent>
    </SidePanel>
  );
}
