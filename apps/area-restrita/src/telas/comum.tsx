// Peças comuns às telas da área restrita, todas compostas com componentes do Design System Dani Moscatelli:
// - Mensagem: Alert do DS (erro ou sucesso), anunciado para leitores de tela;
// - Vazio: frase de estado vazio (o DS ainda não tem EstadoVazio: ver ADMIN_REACT.md, peças que faltam);
// - PreviaDoEmail: o e-mail como a pessoa vai receber, numa moldura com a borda do DS;
// - PerguntaDeConfirmacao: AlertDialog do DS (com a palavra de confirmação para ações definitivas), no lugar do
//   Admin.confirmDialog das páginas de HTML.
import * as React from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sb } from "@/lib/supabase";

export type Aviso = { tom: "erro" | "sucesso"; texto: string } | null;

/** Aviso de erro ou sucesso logo abaixo do que foi feito; a região é lida pelos leitores de tela quando muda. */
export function Mensagem({ aviso, className }: { aviso: Aviso; className?: string }) {
  return (
    <div aria-live="polite" className={className}>
      {aviso && (
        <Alert variant={aviso.tom === "erro" ? "error" : "success"}>
          {aviso.tom === "erro" ? <CircleAlert aria-hidden /> : <CircleCheck aria-hidden />}
          <AlertDescription>{aviso.texto}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export function Vazio({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={"text-sm text-muted-foreground " + (className || "")}>{children}</p>;
}

/** "27/11/2026, 14:05" (as mesmas datas das páginas de HTML). */
export function dataHora(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR") + ", " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Chama uma função do Supabase; o erro vem como texto, como nas páginas de HTML. */
export async function chamarFuncao<T extends object = Record<string, unknown>>(nome: string, body: object): Promise<T & { error?: string }> {
  const { data, error } = await sb.functions.invoke(nome, { body });
  if (!error) return (data || {}) as T;
  let m = "Não foi possível falar com o servidor. Tente novamente.";
  try {
    m = (await (error as { context?: Response }).context?.json())?.error || m;
  } catch {
    /* resposta sem JSON: fica a mensagem padrão */
  }
  return { error: m } as T & { error?: string };
}

/** O e-mail gerado pela função, como o destinatário recebe. */
export function PreviaDoEmail({ html, titulo }: { html: string; titulo: string }) {
  return <iframe title={titulo} srcDoc={html} className="block h-128 w-full rounded-md border border-border bg-muted" />;
}

export type Confirmacao = {
  titulo: string;
  mensagem: string;
  ok: string;
  /** Exclusão: botão vermelho do DS. */
  destrutiva?: boolean;
  /** Palavra que a pessoa precisa digitar para liberar o botão (ações definitivas). */
  palavra?: string;
};

/** Pergunta antes de uma ação importante. `pedir` abre e devolve true se a pessoa confirmar. */
export function usePerguntaDeConfirmacao() {
  const [pergunta, setPergunta] = React.useState<(Confirmacao & { responder: (v: boolean) => void }) | null>(null);
  const [digitado, setDigitado] = React.useState("");
  const pedir = React.useCallback((c: Confirmacao) => new Promise<boolean>((responder) => { setDigitado(""); setPergunta({ ...c, responder }); }), []);
  const fechar = (v: boolean) => { pergunta?.responder(v); setPergunta(null); };
  const liberado = !pergunta?.palavra || digitado.trim().toUpperCase() === pergunta.palavra;
  const elemento = (
    <AlertDialog open={!!pergunta} onOpenChange={(aberto) => { if (!aberto) fechar(false); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{pergunta?.titulo}</AlertDialogTitle>
          <AlertDialogDescription>{pergunta?.mensagem}</AlertDialogDescription>
        </AlertDialogHeader>
        {pergunta?.palavra && (
          <div className="grid gap-2">
            <Label htmlFor="confirmar-palavra">Para confirmar, digite {pergunta.palavra}</Label>
            <Input id="confirmar-palavra" autoComplete="off" value={digitado} onChange={(e) => setDigitado(e.target.value)} />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={!liberado}
            className={pergunta?.destrutiva ? buttonVariants({ variant: "destructive" }) : undefined}
            onClick={(e) => { if (!liberado) { e.preventDefault(); return; } fechar(true); }}
          >
            {pergunta?.ok}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
  return { pedir, elemento };
}
