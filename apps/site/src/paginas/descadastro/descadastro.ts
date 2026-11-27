// Regras da página "Deixar de receber comunicados" (as mesmas de public/comunicados/descadastro/index.html).
// O token do link do e-mail identifica o cadastro; nenhuma informação pessoal aparece na página.
export const ENDERECO = "https://lipfvnerohkaajegqvwr.supabase.co/functions/v1/descadastro-comunicados";
export const ERRO_GENERICO = "Não foi possível concluir agora. Tente novamente.";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function lerToken(busca: string): string {
  return new URLSearchParams(busca).get("t") || "";
}

export const tokenValido = (t: string) => UUID.test(t);

/** Pede o descadastro. Resolve se deu certo; rejeita com a mensagem para mostrar à pessoa. */
export async function pedirDescadastro(t: string, buscar: typeof fetch = fetch): Promise<void> {
  let resposta: Response;
  let corpo: { error?: string } | null = null;
  try {
    resposta = await buscar(ENDERECO, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ t }) });
    corpo = await resposta.json();
  } catch {
    throw new Error(ERRO_GENERICO);
  }
  if (!resposta.ok) throw new Error((corpo && corpo.error) || ERRO_GENERICO);
}
