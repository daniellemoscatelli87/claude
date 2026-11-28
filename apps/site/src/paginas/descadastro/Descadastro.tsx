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
import { lerToken, pedirDescadastro, tokenValido } from "./descadastro";

type Fase = "carregando" | "pronto" | "enviando" | "feito";
type Erro = { titulo: string; texto?: string } | null;

export function Descadastro() {
  const [fase, setFase] = useState<Fase>("carregando");
  const [erro, setErro] = useState<Erro>(null);
  const [token, setToken] = useState("");

  // O token só existe no navegador (o HTML é o mesmo para todos); até ler, o botão fica desligado.
  useEffect(() => {
    const t = lerToken(location.search);
    setToken(t);
    if (tokenValido(t)) setFase("pronto");
    else setErro({ titulo: "Este link não é válido.", texto: "Use o link que está no final do e-mail recebido." });
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

  const feito = fase === "feito";
  return (
    <MolduraDeConta
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
            <Button asChild variant="outline" size="lg">
              <a href="/">Ir para o site</a>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          {erro && (
            <Alert variant="error">
              <CircleAlert aria-hidden />
              <AlertTitle>{erro.titulo}</AlertTitle>
              {erro.texto && <AlertDescription>{erro.texto}</AlertDescription>}
            </Alert>
          )}
          <BotaoDeEnvio
            size="lg"
            className="w-full"
            onClick={confirmar}
            disabled={fase === "carregando"}
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
