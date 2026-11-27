// "Deixar de receber comunicados" (public/comunicados/descadastro/index.html), em React com o DS (D-053, lote S7).
// Mesmos textos, o mesmo link do e-mail (?t=) e o mesmo pedido ao Supabase.
// Peças do DS: Card (com o divisor e a ação no canto inferior direito), Heading, Button, Alert.
// FALTA no DS: Logo; uma moldura de página de mensagem única (MolduraDeConta, ver SITE_REACT.md).
import { useEffect, useState } from "react";
import { CircleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { EMAIL_DE_CONTATO, LOGO, NOME_DO_ESTUDIO } from "@/compartilhado/marca";
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

  useEffect(() => {
    // Leva o foco ao "Pronto!" para quem usa leitor de tela ouvir o resultado.
    if (fase === "feito") document.getElementById("descadastro-feito")?.focus();
  }, [fase]);

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

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-6">
      <div className="flex w-full max-w-120 flex-col gap-8">
        <a href="/" aria-label="Ir para a página inicial" className="mx-auto rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <img src={LOGO} alt={NOME_DO_ESTUDIO} className="block h-14 w-auto" />
        </a>

        {fase === "feito" ? (
          <Card>
            <CardHeader>
              <Heading level={1} size="section" id="descadastro-feito" tabIndex={-1} className="outline-none">
                Pronto!
              </Heading>
              <CardDescription role="status" className="text-base leading-relaxed text-foreground">
                Você não vai mais receber os comunicados em massa da Rede de Parceiros. Mudou de ideia? Escreva para{" "}
                <a href={`mailto:${EMAIL_DE_CONTATO}`} className="rounded-sm font-semibold text-primary-text underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {EMAIL_DE_CONTATO}
                </a>
                .
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-end border-t">
              <Button asChild variant="outline" size="lg">
                <a href="/">Ir para o site</a>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <Heading level={1} size="section">
                Deixar de receber comunicados
              </Heading>
              <CardDescription className="text-base leading-relaxed text-foreground">
                Confirme para não receber mais os e-mails enviados para toda a Rede de Parceiros. Seu cadastro continua na rede e o Studio ainda pode falar com você sobre oportunidades de colaboração.
              </CardDescription>
            </CardHeader>
            {erro && (
              <CardContent>
                <Alert variant="error">
                  <CircleAlert aria-hidden />
                  <AlertTitle>{erro.titulo}</AlertTitle>
                  {erro.texto && <AlertDescription>{erro.texto}</AlertDescription>}
                </Alert>
              </CardContent>
            )}
            <CardFooter className="justify-end border-t">
              <Button size="lg" onClick={confirmar} disabled={fase !== "pronto"} aria-busy={fase === "enviando"}>
                {fase === "enviando" ? "Confirmando…" : "Confirmar"}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </main>
  );
}
