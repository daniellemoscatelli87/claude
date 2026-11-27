// Anexos das respostas e dos e-mails novos: as mesmas regras de public/admin/contatos/index.html (até 10 arquivos e
// 20 MB no total por e-mail; pasta privada "anexos", com links temporários para ver).
import { sb } from "@/lib/supabase";

export const MAX_ANEXOS = 10;
export const MAX_MB = 20;
export type Anexo = { path: string; name: string; type: string; size: number };

export const nomeSeguro = (n: string) => n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.-]+/g, "-").slice(-80);
export const qtdAnexos = (l: unknown[]) => (l.length ? l.length + (l.length === 1 ? " arquivo anexado" : " arquivos anexados") : "");

/** Junta arquivos novos à lista, com os limites; devolve a lista e, se algum ficou de fora, o aviso. */
export function juntarArquivos(atuais: File[], novos: File[]): { lista: File[]; aviso: string | null } {
  const lista = [...atuais];
  let aviso: string | null = null;
  for (const f of novos) {
    if (lista.length >= MAX_ANEXOS) { aviso = "Máximo de " + MAX_ANEXOS + " arquivos por e-mail."; break; }
    const total = lista.reduce((t, x) => t + x.size, 0) + f.size;
    if (total > MAX_MB * 1048576) { aviso = "Os anexos passam de " + MAX_MB + " MB no total. " + f.name + " não foi incluído."; continue; }
    lista.push(f);
  }
  return { lista, aviso };
}

/** Envia os anexos ao armazenamento privado (pasta da conversa). Devolve a lista ou a mensagem de erro. */
export async function subirAnexos(arquivos: File[], pasta: string, progresso: (t: string) => void): Promise<Anexo[] | string> {
  const anexos: Anexo[] = [];
  for (const [i, f] of arquivos.entries()) {
    progresso("Enviando arquivo " + (i + 1) + " de " + arquivos.length + "…");
    const path = "respostas/" + pasta + "/" + Date.now() + "-" + i + "-" + nomeSeguro(f.name);
    const { error } = await sb.storage.from("anexos").upload(path, f, { contentType: f.type || "application/octet-stream", upsert: false });
    if (error) return "Não foi possível enviar o arquivo " + f.name + ". Tente novamente.";
    anexos.push({ path, name: f.name, type: f.type || "application/octet-stream", size: f.size });
  }
  return anexos;
}

/** Corpo de erro de uma função do Supabase (texto em `error`), ou vazio. */
export async function detalheDoErro(error: unknown) {
  try {
    return (await (error as { context?: Response })?.context?.json())?.error || "";
  } catch {
    return "";
  }
}
