// Programa Projeto Piloto (projeto-piloto/index.html), em React com o DS (D-053, lote S2). Mesmos textos, endereço,
// cabeça e formulário. Peças do DS em cada seção: ver docs/engineering/SITE_REACT.md, seção 6.
import { useEffect, useRef, useState } from "react";
import { Building2, Check, TrendingUp } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BotaoSubir } from "@/components/ui/botao-subir";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardMidia } from "@/components/ui/card";
import { CardDeFrente, GradeDeFrentes } from "@/components/ui/card-frente";
import { CurvaSecao } from "@/components/ui/curva-secao";
import { GradeDeCards } from "@/components/ui/grade-de-cards";
import { Heading } from "@/components/ui/heading";
import { LinkSaibaMais } from "@/components/ui/link-saiba-mais";
import { ListaDePilares } from "@/components/ui/lista-de-pilares";
import { LuzesDifusas } from "@/components/ui/luzes-difusas";
import { PartnerCard } from "@/components/ui/partner-card";
import { PilulaDeAcao } from "@/components/ui/pilula-de-acao";
import { Prosa } from "@/components/ui/prosa";
import { Selo } from "@/components/ui/selo";
import { SurgirAoRolar } from "@/components/ui/surgir-ao-rolar";
import { Timeline } from "@/components/ui/timeline";
import { CabecalhoDeSecao } from "@/compartilhado/site/CabecalhoDeSecao";
import { CascaDoSite } from "@/compartilhado/site/CascaDoSite";
import { ETAPAS, FRENTES, GUIA, LADOS, PILARES } from "./conteudo";
import { GavetaDeCadastro } from "./GavetaDeCadastro";

export function ProjetoPiloto() {
  const [cadastro, setCadastro] = useState(false);
  // Pergunta aberta do guia. As respostas ficam no HTML mesmo fechadas (buscadores leem, como na página de HTML).
  const [pergunta, setPergunta] = useState("");
  const hero = useRef<HTMLElement>(null);
  const convite = useRef<HTMLDivElement>(null);
  const ctaDoPrograma = useRef<HTMLDivElement>(null);
  const abrir = () => setCadastro(true);

  // Qualquer link para #inscricao abre o cadastro (como na página de HTML), e o endereço com #inscricao ou #cadastro
  // já abre a gaveta.
  useEffect(() => {
    const aoClicar = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href="#inscricao"], [data-abrir-cadastro]');
      if (!a) return;
      e.preventDefault();
      abrir();
    };
    document.addEventListener("click", aoClicar);
    if (location.hash === "#inscricao" || location.hash === "#cadastro") setTimeout(abrir, 400);
    return () => document.removeEventListener("click", aoClicar);
  }, []);

  return (
    <CascaDoSite
      atual="projeto"
      superficie="escura"
      posicaoDoCabecalho="fixed"
      rodape="escuro"
      flutuantes={
        <>
          <PilulaDeAcao rotulo="Cadastrar empresa" onClick={abrir} icone={<Building2 />} iconeAntes mostrarApos={hero} esconderCom={[convite, ctaDoPrograma]} />
          <BotaoSubir />
          <GavetaDeCadastro aberta={cadastro} aoMudar={setCadastro} />
        </>
      }
    >
      <main id="conteudo" className="bg-background">
        {/* Hero: a foto; o título e o texto do programa ficam para leitores de tela e buscadores, como na página de HTML */}
        <section id="hero" ref={hero} aria-labelledby="hero-titulo" className="relative flex min-h-svh items-end justify-center overflow-hidden bg-graphite-950 pb-10">
          <picture>
            <source media="(max-width: 639px)" srcSet="/projeto-piloto-hero-mobile-v2.webp" type="image/webp" width={941} height={1672} />
            <img
              src="/projeto-piloto-hero-v11.webp"
              width={1671}
              height={941}
              {...{ fetchpriority: "high" }}
              alt="Dani Moscatelli em reunião com clientes no escritório do Dani Moscatelli Experience Design Studio"
              className="absolute inset-0 size-full object-cover object-[35%_center] lg:object-[28%_center]"
            />
          </picture>
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-graphite-950" />
          <div className="sr-only">
            <p>PROGRAMA CONTÍNUO</p>
            <h1 id="hero-titulo">Programa Projeto Piloto</h1>
            <p>Uma nova perspectiva sobre os desafios de experiência do seu negócio.</p>
            <p>Empresas selecionadas recebem um <strong>diagnóstico especializado gratuito</strong>, com oportunidades de melhoria e recomendações estratégicas para experiências, serviços e operações.</p>
            <p>Em contrapartida, o Studio poderá documentar os aprendizados e resultados, mediante acordo.</p>
          </div>
          <LinkSaibaMais href="#sobre-o-programa" sobreEscuro className="relative z-10" />
        </section>

        {/* Sobre o programa */}
        <section id="sobre-o-programa" aria-labelledby="sobre-titulo" className="scroll-mt-20 bg-card px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-16">
            <CabecalhoDeSecao id="sobre-titulo" selo="Programa Projeto Piloto" titulo="Uma nova perspectiva para os desafios de experiência do **seu negócio.**">
              <p className="text-body-lg leading-relaxed text-muted-foreground">
                Empresas selecionadas recebem um diagnóstico especializado gratuito, com oportunidades de melhoria e recomendações estratégicas para experiências, serviços e operações.
              </p>
            </CabecalhoDeSecao>

            <ListaDePilares rotulo="Como funciona a parceria" ordenada pilares={PILARES} />

            <GradeDeCards colunas={{ base: 1, md: 2 }}>
              {LADOS.map((l) => (
                <Card key={l.rotulo}>
                  <CardContent className="flex flex-col gap-4 py-6">
                    <p className="text-caption font-bold uppercase tracking-[0.14em] text-primary-text">{l.rotulo}</p>
                    <Heading level={3} size="card">{l.titulo}</Heading>
                    <ul className="flex flex-col gap-3">
                      {l.itens.map((i) => (
                        <li key={i} className="flex items-start gap-3 text-body-sm text-foreground">
                          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-primary-text" />
                          <span>{i}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </GradeDeCards>

            <SurgirAoRolar className="grid gap-4 border-l-4 border-primary pl-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-center md:gap-10">
              <Heading level={3} size="card" className="sm:text-h3">Uma parceria com transparência.</Heading>
              <p className="text-body leading-relaxed text-muted-foreground">Em contrapartida ao diagnóstico gratuito, o Studio poderá documentar os aprendizados e resultados, mediante acordo.</p>
            </SurgirAoRolar>

            <div ref={ctaDoPrograma} className="flex justify-center">
              <Button asChild size="lg">
                <a href="#inscricao"><Building2 aria-hidden />Cadastrar empresa</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Onde podemos atuar (seção escura) */}
        <section id="atuacao" aria-labelledby="atuacao-titulo" className="relative overflow-hidden bg-graphite-950 px-4 pb-24 pt-24 sm:px-6 sm:pb-36 sm:pt-32 lg:px-8">
          <CurvaSecao posicao="topo" cor="var(--card)" />
          <div className="dark">
          <LuzesDifusas variante="esquerda" />
          <div className="relative z-[1] mx-auto flex max-w-7xl flex-col gap-12 text-foreground">
            <CabecalhoDeSecao id="atuacao-titulo" selo="Escopo de atuação" titulo="Onde podemos atuar" escuro>
              <p className="text-body-lg font-semibold text-primary-text">Diferentes desafios. Uma visão sistêmica da experiência.</p>
              <p className="text-body leading-relaxed text-muted-foreground">Investigamos a experiência de forma integrada, considerando pessoas, jornadas, serviços e operações para identificar oportunidades de melhoria e inovação.</p>
            </CabecalhoDeSecao>
            <div>
              <SurgirAoRolar as={GradeDeFrentes} escalonar>
                {FRENTES.map((f) => (
                  <CardDeFrente key={f.numero} tom="escuro" numero={f.numero} icone={f.icone} titulo={f.titulo} subtitulo={f.subtitulo} descricao={f.descricao} temas={f.temas} />
                ))}
              </SurgirAoRolar>
            </div>
            <p className="mx-auto max-w-3xl text-center text-body-sm leading-relaxed text-muted-foreground">
              As frentes de atuação representam possibilidades de investigação e desenvolvimento de projetos. No Programa Projeto Piloto, o escopo será delimitado conforme o desafio selecionado e as condições acordadas com cada empresa.
            </p>
          </div>
          </div>
          <CurvaSecao posicao="base" />
        </section>

        {/* Como funciona */}
        <section id="como-funciona" aria-labelledby="como-titulo" className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-col gap-14">
            <CabecalhoDeSecao id="como-titulo" selo="O Projeto" titulo="Como funciona o **Programa Projeto Piloto**">
              <p className="text-body-lg leading-relaxed text-muted-foreground">Cada projeto parte de um desafio real e segue um escopo previamente acordado, com investigação especializada e recomendações para orientar melhorias.</p>
            </CabecalhoDeSecao>
            <Timeline
              etapas={ETAPAS.map((e) => ({
                icone: e.icone,
                titulo: (
                  <>
                    <span className="sr-only">Etapa {e.numero}: </span>
                    {e.titulo}
                  </>
                ),
                descricao: (
                  <>
                    <span aria-hidden className="mb-1 block text-caption font-semibold text-primary-text">Etapa {e.numero}</span>
                    {e.texto}
                    <span className="mt-3 block border-t border-border pt-3 text-caption font-semibold text-primary-text">{e.nota}</span>
                  </>
                ),
              }))}
            />
            <Card orientacao="horizontal">
              <CardMidia tipo="icone"><TrendingUp aria-hidden /></CardMidia>
              <CardContent className="flex flex-col gap-3 py-6">
                <Selo size="sm">Projeto Piloto</Selo>
                <Heading level={3} size="card">E depois do **projeto-piloto**?</Heading>
                <p className="text-body-sm leading-relaxed text-muted-foreground">Com o diagnóstico concluído, sua empresa pode implementar as recomendações de forma independente ou avaliar a continuidade do trabalho com o Studio, por meio de uma contratação específica.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Guia de participação */}
        <section id="guia" aria-labelledby="guia-titulo" className="scroll-mt-20 px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
          <div className="mx-auto flex max-w-3xl flex-col gap-10">
            <CabecalhoDeSecao id="guia-titulo" selo="Guia de participação" titulo="O que sua empresa **precisa saber**">
              <p className="text-body-lg leading-relaxed text-muted-foreground">Conheça os critérios de seleção, as entregas e as condições de participação no Projeto Piloto.</p>
            </CabecalhoDeSecao>
            <Accordion type="single" collapsible value={pergunta} onValueChange={setPergunta} className="rounded-xl border bg-card px-6">
              {GUIA.map((g) => (
                <AccordionItem key={g.numero} value={g.numero}>
                  <AccordionTrigger>
                    <span className="flex min-w-0 flex-1 items-baseline gap-4">
                      <span className="text-body-sm font-semibold tabular-nums text-primary-text">{g.numero}</span>
                      <span>{g.pergunta}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent forceMount hidden={pergunta !== g.numero}>
                    <Prosa tamanho="sm" className="pl-0 sm:pl-9">{g.resposta}</Prosa>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Convite */}
        <section id="inscricao" aria-label="Cadastro no Programa Projeto Piloto" className="scroll-mt-20 px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
          <div ref={convite} className="mx-auto max-w-6xl">
            <PartnerCard
              orientation="horizontal"
              size="g"
              eyebrow="Programa Projeto Piloto"
              title="Sua empresa pode ser o **próximo projeto piloto**."
              description="Conte qual experiência você quer melhorar. Se o desafio tiver aderência ao programa, o Studio entra em contato para alinhar escopo, acessos e condições, sem custos de honorários profissionais."
              cta={{ label: "Cadastrar minha empresa", onClick: abrir }}
              secondary={{ label: "Tirar dúvidas no Guia", href: "#guia" }}
              visual={<Building2 aria-hidden />}
            />
          </div>
        </section>
      </main>
    </CascaDoSite>
  );
}
