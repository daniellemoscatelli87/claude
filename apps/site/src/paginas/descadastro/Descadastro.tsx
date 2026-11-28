// "Deixar de receber comunicados" (public/comunicados/descadastro/index.html), em React com o DS (D-053, lote S7).
// Mesmos textos, o mesmo link do e-mail (?t=) e o mesmo pedido ao Supabase.
// Peças do DS: MolduraDeConta (logo com link para o início, título, texto), Alert, BotaoDeEnvio, EstadoFinal, Button.
import { useEffect, useState } from "react";
import { CircleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BotaoDeEnvio } from "@/components/ui/botao-de-envio";
import { Button } from "@/components/ui/button";
import { EstadoFinal } from "@/components/ui/estado-vazio";
import { MolduraDeConta } from "@/components/ui/moldura-de-conta";
import { Logo } from "@/components/ui/logo";
import { EMAIL_DE_CONTATO } from "@/compartilhado/marca";
import { Erro404 } from "../erro-404/Erro404";
import { lerToken, pedirDescadastro, tokenValido } from "./descadastro";

// "lendo": o código do link ainda não foi lido (o HTML gravado no build é o mesmo para todos); nada aparece até ler.
// "invalido": sem código ou com código fora do formato, a página mostra o conteúdo da 404 (decisão da dona do produto).
type Fase = "lendo" | "invalido" | "pronto" | "enviando" | "feito";
type Erro = { titulo: string; texto?: string } | null;

export function Descadastro() {
  const [fase, setFase] = useState<Fase>("lendo");
  const [erro, setErro] = useState<Erro>(null);
  const [token, setToken] = useState("");

  // O token só existe no navegador (o HTML é o mesmo para todos); até ler, o botão fica desligado.
  useEffect(() => {
    const t = lerToken(location.search);
    setToken(t);
    setFase(tokenValido(t) ? "pronto" : "invalido");
  }, []);

  async function confirmar() {
    setFase("enviando");
    setErro(null);
    try {
      await pedirDescadastro(token);
      setFase("feito");
    } catch (e) {
      setFase("pronto");
      setErro({ titulo: (e as Error).message });
    }
  }

  if (fase === "invalido") return <Erro404 />;
  if (fase === "lendo") return <main className="min-h-svh bg-background" aria-busy="true" />;
  const feito = fase === "feito";
  return (
    // Conteúdo centralizado, como a página original (decisão da dona do produto, 28/11/2026): logo, título, texto e o
    // botão em pílula no centro; o alerta continua com o texto alinhado à esquerda dentro da caixa.
    <MolduraDeConta
      className="text-center"
      logo={<Logo variante="horizontal" className="h-12" />}
      titulo="Deixar de receber comunicados"
      descricao={
        feito
          ? undefined
          : "Confirme para não receber mais os e-mails enviados para toda a Rede de Parceiros. Seu cadastro continua na rede e o Studio ainda pode falar com você sobre oportunidades de colaboração."
      }
    >
      {feito ? (
        <EstadoFinal
          className="py-4"
          titulo="Pronto!"
          descricao={
            <>
              Você não vai mais receber os comunicados em massa da Rede de Parceiros. Mudou de ideia? Escreva para{" "}
              <a href={`mailto:${EMAIL_DE_CONTATO}`} className="rounded-sm font-semibold text-primary-text underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {EMAIL_DE_CONTATO}
              </a>
              .
            </>
          }
          acoes={
            <Button asChild variant="outline" className="self-center rounded-full">
              <a href="/">Ir para o site</a>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          {erro && (
            <Alert variant="error" className="text-left">
              <CircleAlert aria-hidden />
              <AlertTitle>{erro.titulo}</AlertTitle>
              {erro.texto && <AlertDescription>{erro.texto}</AlertDescription>}
            </Alert>
          )}
          <BotaoDeEnvio
            className="self-center rounded-full"
            onClick={confirmar}
            estado={fase === "enviando" ? "enviando" : "parado"}
            textos={{ enviando: "Confirmando…" }}
          >
            Confirmar
          </BotaoDeEnvio>
        </div>
      )}
    </MolduraDeConta>
  );
}
