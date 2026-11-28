// Escolha de anexos de um e-mail: UploadDropzone do DS (arrastar e soltar ou escolher; acessível desde o DS 0685afb)
// e UploadList, com os limites da página de HTML (juntarArquivos: quantidade e tamanho total).
import * as React from "react";
import { Paperclip } from "lucide-react";
import { MensagemDeErro } from "@/components/ui/campo";
import { UploadDropzone, UploadList, type UploadFile } from "@/components/ui/upload";
import { juntarArquivos, MAX_ANEXOS, MAX_MB } from "./anexos";

export function Anexador({ arquivos, mudar, desabilitado }: { arquivos: File[]; mudar: (l: File[]) => void; desabilitado?: boolean }) {
  const [aviso, setAviso] = React.useState<string | null>(null);
  const itens: UploadFile[] = React.useMemo(
    () => arquivos.map((f, i) => ({ id: i + "-" + f.name, file: f, name: f.name, size: f.size, type: f.type || "application/octet-stream", status: "pendente" as const, url: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined })),
    [arquivos],
  );
  return (
    <div className="grid gap-3" data-anexador="">
      <UploadDropzone
        size="compact" multiple disabled={desabilitado} icon={<Paperclip />}
        title="Anexar arquivo" description={`Arraste para cá ou escolha. Até ${MAX_ANEXOS} arquivos e ${MAX_MB} MB no total por e-mail.`}
        onFiles={(novos) => { const r = juntarArquivos(arquivos, novos); setAviso(r.aviso); mudar(r.lista); }}
        onError={setAviso}
      />
      <UploadList items={itens} onRemove={(rid) => { setAviso(null); mudar(arquivos.filter((_, i) => itens[i].id !== rid)); }} />
      <div aria-live="polite">{aviso && <MensagemDeErro>{aviso}</MensagemDeErro>}</div>
    </div>
  );
}
