// Página inicial (index.html), em React com o DS (D-053, lote S3). Mesmos textos, endereço, cabeça, formulário
// "Notificar lançamento" e eventos de medição. Peças do DS em cada seção: ver docs/engineering/SITE_REACT.md, seção 6c.
import { useEffect, useState, type FormEvent } from "react";
import { BadgeCheck, Bell, Star, Users } from "lucide-react";
import { AvisoProjeto } from "@/components/ui/aviso-projeto";
import { Badge } from "@/components/ui/badge";
import { BotaoDeEnvio, type EstadoDoEnvio } from "@/components/ui/botao-de-envio";
import { Button } from "@/components/ui/button";
import { linkWhatsApp } from "@/components/ui/botao-whatsapp";
import { CampoDeEmail } from "@/components/ui/campo-de-email";
import { Card, CardContent, CardFooter, CardMidia } from "@/components/ui/card";
import { CardDeArtigo } from "@/components/ui/card-de-artigo";
import { CardDeDepoimento } from "@/components/ui/card-de-depoimento";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { FaixaDeLogos } from "@/components/ui/faixa-de-logos";
import { GradeDeCards } from "@/components/ui/grade-de-cards";
import { Heading } from "@/components/ui/heading";
import { Instagram, Linkedin } from "@/components/ui/icones-preservados";
import { LinkSaibaMais } from "@/components/ui/link-saiba-mais";
import { LuzesDifusas } from "@/components/ui/luzes-difusas";
import { Selo } from "@/components/ui/selo";
import { SurgirAoRolar } from "@/components/ui/surgir-ao-rolar";
import { CabecalhoDeSecao } from "@/compartilhado/site/CabecalhoDeSecao";
import { CascaDoSite } from "@/compartilhado/site/CascaDoSite";
import { registrarEvento } from "@/compartilhado/site/navegacao";
import { ARTIGOS, DEPOIMENTOS, LOGOS } from "./conteudo";
import { TEMPO_DO_OBRIGADO, TEXTOS_DO_AVISO, gravarAvisoDeLancamento, validarEmailDoAviso } from "./notificar";

const REDES = [
  { href: "https://www.linkedin.com/in/danimoscatelli/", rotulo: "Perfil Profissional", rede: "linkedin_perfil", Icone: Linkedin },
  { href: "https://www.linkedin.com/company/danimoscatellistudio/", rotulo: "Página da Empresa", rede: "linkedin_empresa", Icone: Linkedin },
  { href: "https://www.instagram.com/danimoscatellistudio", rotulo: "Instagram", rede: "instagram", Icone: Instagram },
];

/** Trechos entre ** em negrito (os destaques dos depoimentos, como na página de HTML). */
function comNegrito(texto: string) {
  return texto.split("**").map((t, i) => (i % 2 ? <strong key={i}>{t}</strong> : t));
}

function AvisoDeLancamento() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoDoEnvio>("parado");

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (estado !== "parado") return;
    const invalido = validarEmailDoAviso(email);
    setErro(invalido);
    if (invalido) {
      document.getElementById("notify-email")?.focus();
      return;
    }
    setEstado("enviando");
    try {
      await gravarAvisoDeLancamento(email);
      setEmail("");
      setEstado("feito");
      registrarEvento("cadastro_lancamento", { origem: "pagina_inicial" });
    } catch (falha) {
      console.error(falha);
      setEstado("parado");
      setErro(TEXTOS_DO_AVISO.falha);
    }
  };

  return (
    <form id="notify-form" noValidate onSubmit={enviar} className="flex w-full max-w-xl flex-col gap-4">
      <CampoDeEmail
        id="notify-email"
        name="email"
        rotulo="Seu e-mail corporativo"
        placeholder="nome@empresa.com.br"
        autoComplete="email"
        valor={email}
        onValorChange={(v) => {
          setEmail(v);
          if (erro) setErro(null);
        }}
        erro={erro}
        disabled={estado !== "parado"}
        classeDoBloco="w-full"
      />
      <BotaoDeEnvio
        type="submit"
        size="lg"
        estado={estado}
        icone={<Bell aria-hidden />}
        textos={{ enviando: TEXTOS_DO_AVISO.enviando, feito: TEXTOS_DO_AVISO.feito }}
        voltarApos={TEMPO_DO_OBRIGADO}
        onVoltar={() => setEstado("parado")}
        className="w-full sm:w-auto sm:self-start"
      >
        {TEXTOS_DO_AVISO.parado}
      </BotaoDeEnvio>
    </form>
  );
}

function Depoimentos() {
  const [api, setApi] = useState<CarouselApi>();
  const [atual, setAtual] = useState(1);
  useEffect(() => {
    if (!api) return;
    const mudar = () => setAtual(api.selectedScrollSnap() + 1);
    mudar();
    api.on("select", mudar);
    api.on("reInit", mudar);
    return () => {
      api.off("select", mudar);
      api.off("reInit", mudar);
    };
  }, [api]);
  const total = api ? api.scrollSnapList().length : DEPOIMENTOS.length;

  return (
    <Carousel setApi={setApi} opts={{ align: "start" }} aria-label="Depoimentos" className="flex flex-col gap-6">
      <CarouselContent className="items-stretch">
        {DEPOIMENTOS.map((d) => (
          <CarouselItem key={d.nome} className="sm:basis-1/2 lg:basis-1/3">
            <CardDeDepoimento nome={d.nome} cargo={d.cargo} foto={d.foto}>
              {comNegrito(d.texto)}
            </CardDeDepoimento>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex items-center justify-center gap-4">
        <CarouselPrevious aria-label="Depoimentos anteriores" className="static size-11 translate-y-0" />
        <p className="min-w-16 text-center text-body-sm tabular-nums text-muted-foreground" aria-live="polite">
          {atual} de {total}
        </p>
        <CarouselNext aria-label="Próximos depoimentos" className="static size-11 translate-y-0" />
      </div>
    </Carousel>
  );
}

export function Inicio() {
  // O AvisoProjeto do DS (d2aeb40) traz um <style> com aspas, que o servidor grava escapadas: a hidratação falha.
  // Como o aviso só aparece 0,6 s depois de a página abrir, ele entra só no navegador (lacuna do DS: SITE_REACT.md, seção 9).
  const [noNavegador, setNoNavegador] = useState(false);
  useEffect(() => setNoNavegador(true), []);
  return (
    <CascaDoSite
      atual="inicio"
      posicaoDoCabecalho="fixed"
      rodape="claro"
      flutuantes={
        noNavegador && (
        <AvisoProjeto
          titulo="Tem um projeto?"
          texto="Vamos conversar sobre ele."
          rotuloAcao="Tem um projeto? Conversar com a Dani no WhatsApp"
          rotuloFechar="Fechar aviso"
          href={linkWhatsApp("5541997485414", "Olá, Dani! Vim pelo site danimoscatelli.com.br e gostaria de conversar sobre um projeto.")}
          onAcao={() => registrarEvento("clique_aviso_whatsapp")}
        />
        )
      }
    >
      <main id="conteudo" className="bg-card">
        {/* Hero */}
        <section aria-labelledby="ih-titulo" className="relative overflow-hidden bg-background px-4 pb-8 pt-28 sm:px-6 lg:px-8 lg:pt-32">
          <LuzesDifusas variante="hero" dissolver />
          <div className="relative z-[1] mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-x-14 lg:gap-y-8">
            <SurgirAoRolar escalonar className="flex flex-col items-start gap-6 lg:col-start-1 lg:row-start-1">
              <Selo className="lg:hidden">Meaningful Experiences</Selo>
              <Selo className="hidden lg:inline-flex">Em breve</Selo>
              <Heading level={1} id="ih-titulo" size="hero" className="text-balance">
                Para que a experiência **prometida** seja a experiência **entregue**.
              </Heading>
              <div className="flex max-w-xl flex-col gap-3 text-body leading-relaxed text-muted-foreground sm:text-body-lg">
                <p className="hidden lg:block">Nem sempre o problema está onde aparece. Reclamações, clientes que não voltam ou serviços que não funcionam como deveriam podem revelar falhas que vão além do atendimento.</p>
                <p className="lg:hidden">Para isso o studio investiga a experiência do cliente e os bastidores do negócio para identificar falhas e desenvolver soluções que melhorem serviços, processos e resultados.</p>
                <p className="hidden lg:block">Investigo a experiência do cliente e os bastidores do negócio para identificar as causas desses problemas e desenvolver soluções que melhorem serviços, processos e resultados.</p>
              </div>
            </SurgirAoRolar>

            <div className="relative flex justify-center lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:items-center">
              <picture>
                <source media="(max-width: 1023px)" srcSet="/dani-post-its-mobile.webp" type="image/webp" width={941} height={1672} />
                <img
                  src="/dani-post-its.webp"
                  width={1341}
                  height={1173}
                  {...{ fetchpriority: "high" }}
                  alt="Dani Moscatelli - Metodologia & Visão Sistêmica de Design de Experiência"
                  className="h-auto max-h-112 w-full object-contain lg:max-h-150"
                />
              </picture>
            </div>

            <SurgirAoRolar escalonar className="flex flex-col items-start gap-6 lg:col-start-1 lg:row-start-2">
              <Selo className="lg:hidden">Em breve</Selo>
              <p className="max-w-xl text-body font-semibold leading-relaxed text-foreground sm:text-body-lg">
                Enquanto o novo site do estúdio ganha forma, sigo atendendo projetos de experiência digital, física e híbrida. Deixe seu e-mail para acompanhar o lançamento ou vamos conversar sobre os desafios do seu negócio.
              </p>
              <AvisoDeLancamento />
            </SurgirAoRolar>

            <div className="flex flex-col items-start gap-3 lg:col-start-2 lg:row-start-3 lg:items-center">
              <p className="text-body font-semibold text-foreground sm:text-body-lg">Me siga nas redes sociais:</p>
              <ul className="flex flex-wrap gap-2 lg:justify-center">
                {REDES.map(({ href, rotulo, rede, Icone }) => (
                  <li key={rede}>
                    <Button asChild variant="outline" size="lg">
                      <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => registrarEvento("clique_rede_social", { rede })}>
                        <Icone aria-hidden />
                        {rotulo}
                        <span className="sr-only"> (abre em nova aba)</span>
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="relative z-[1] mt-10 flex justify-center">
            <LinkSaibaMais href="#depoimentos" />
          </div>
        </section>

        {/* Prova social e reconhecimento */}
        <section id="depoimentos" aria-labelledby="depoimentos-titulo" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-10">
            <CabecalhoDeSecao id="depoimentos-titulo" selo="Prova Social & Reconhecimento" titulo="Depoimentos reais de quem **construiu e transformou comigo**">
              <p className="text-body leading-relaxed text-muted-foreground sm:text-body-lg">
                Recomendações e avaliações registradas publicamente no LinkedIn por líderes, pares e clientes ao longo de mais de 15 anos de trajetória em Design e Inovação.
              </p>
              <ul className="flex flex-wrap justify-center gap-2">
                <li><Badge variant="outline" className="px-3 py-1.5 text-body-sm"><Star aria-hidden className="text-primary-text" />35 recomendações</Badge></li>
                <li><Badge variant="outline" className="px-3 py-1.5 text-body-sm"><Star aria-hidden className="text-primary-text" />Excelência e compromisso</Badge></li>
                <li><Badge variant="outline" className="px-3 py-1.5 text-body-sm"><Users aria-hidden className="text-primary-text" />Líderes, clientes & pares</Badge></li>
              </ul>
            </CabecalhoDeSecao>

            <Depoimentos />

            <Card orientacao="horizontal" className="mx-auto w-full max-w-5xl">
              <CardMidia tipo="icone"><BadgeCheck aria-hidden /></CardMidia>
              <div className="flex min-w-0 flex-1 flex-col">
                <CardContent className="flex flex-col gap-2 pt-6">
                  <Heading level={3} size="card">Veja todas as 35 recomendações na íntegra</Heading>
                  <p className="text-body-sm leading-relaxed text-muted-foreground">
                    Todas as avaliações acima são verificáveis e foram registradas por profissionais e clientes diretamente no perfil da Dani Moscatelli no LinkedIn.
                  </p>
                </CardContent>
                <CardFooter className="justify-end border-t pt-4">
                  <Button asChild size="lg" className="h-auto min-h-11 w-full whitespace-normal py-2 text-center sm:w-auto">
                    <a href="https://www.linkedin.com/in/danimoscatelli/" target="_blank" rel="noopener noreferrer">
                      <Linkedin aria-hidden />
                      Acessar Recomendações no LinkedIn
                      <span className="sr-only"> (abre em nova aba)</span>
                    </a>
                  </Button>
                </CardFooter>
              </div>
            </Card>
          </div>
        </section>

        {/* Insights e artigos */}
        <section id="artigos" aria-labelledby="artigos-titulo" className="px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-col gap-10">
            <CabecalhoDeSecao id="artigos-titulo" selo="INSIGHTS & ARTIGOS" titulo="Pensamentos e visões sobre **experiência e estratégia**">
              <p className="text-body leading-relaxed text-muted-foreground sm:text-body-lg">
                Reflexões sobre design centrado no humano, arquitetura de ecossistemas e a transformação de produtos em relações duradouras.
              </p>
            </CabecalhoDeSecao>
            <SurgirAoRolar escalonar className="flex flex-col gap-6">
              {ARTIGOS.slice(0, 1).map((a) => (
                <CardDeArtigo key={a.titulo} {...a} />
              ))}
              <GradeDeCards colunas={{ base: 1, md: 2 }}>
                {ARTIGOS.slice(1).map((a) => (
                  <CardDeArtigo key={a.titulo} {...a} formato="horizontal" />
                ))}
              </GradeDeCards>
            </SurgirAoRolar>
          </div>
        </section>

        {/* Empresas atendidas */}
        <section id="empresas-atendidas" aria-labelledby="empresas-titulo" className="border-t px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-10">
            <CabecalhoDeSecao id="empresas-titulo" selo="Clientes atendidos" titulo="Empresas Atendidas">
              <p className="text-body leading-relaxed text-muted-foreground sm:text-body-lg">
                Projetos, diagnósticos e ecossistemas construídos em parceria com grandes marcas e lideranças de mercado para gerar impacto sustentável.
              </p>
            </CabecalhoDeSecao>
            {/* Os logos originais têm cores e partes brancas (somem no fundo claro): como na página de HTML, viram silhuetas
                cinza. Lacuna do DS: a FaixaDeLogos ainda não tem um tom "silhueta" (SITE_REACT.md, seção 9). */}
            <FaixaDeLogos rotulo="Empresas atendidas" logos={LOGOS} colorirAoPassar={false} className="[&_img]:opacity-45 [&_img]:brightness-0" />
          </div>
        </section>
      </main>
    </CascaDoSite>
  );
}
