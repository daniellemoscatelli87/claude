// Escolha de anexos de um e-mail: Button "Anexar arquivo" + Input de arquivo do DS (escondido) e UploadList, com os
// limites da página de HTML. O UploadDropzone do DS não entra aqui porque, hoje, tem duas falhas de acessibilidade
// (campo de arquivo sem nome e um botão dentro de outro); registradas para o DS em ADMIN_REACT.md §7.2.
import * as React from "react";
import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MensagemDeErro } from "@/components/ui/campo";
import { Input } from "@/components/ui/input";
import { UploadList, type UploadFile } from "@/components/ui/upload";
import { juntarArquivos, MAX_ANEXOS, MAX_MB } from "./anexos";

export function Anexador({ arquivos, mudar, desabilitado }: { arquivos: File[]; mudar: (l: File[]) => void; desabilitado?: boolean }) {
  const id = React.useId();
  const [aviso, setAviso] = React.useState<string | null>(null);
  const itens: UploadFile[] = React.useMemo(
    () => arquivos.map((f, i) => ({ id: i + "-" + f.name, file: f, name: f.name, size: f.size, type: f.type || "application/octet-stream", status: "pendente" as const, url: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined })),
    [arquivos],
  );
  return (
    <div className="grid gap-3" data-anexador="">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" disabled={desabilitado} onClick={() => document.getElementById(id)?.click()}>
          <Paperclip aria-hidden />Anexar arquivo
        </Button>
        <span className="text-body-sm text-muted-foreground">Até {MAX_ANEXOS} arquivos e {MAX_MB} MB no total por e-mail.</span>
        <Input
          id={id} type="file" multiple className="hidden" tabIndex={-1} aria-label="Anexar arquivo"
          onChange={(e) => { const r = juntarArquivos(arquivos, Array.from(e.target.files || [])); e.target.value = ""; setAviso(r.aviso); mudar(r.lista); }}
        />
      </div>
      <UploadList items={itens} onRemove={(rid) => { setAviso(null); mudar(arquivos.filter((_, i) => itens[i].id !== rid)); }} />
      <div aria-live="polite">{aviso && <MensagemDeErro>{aviso}</MensagemDeErro>}</div>
    </div>
  );
}
