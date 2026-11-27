// Rede de Parceiros (rede-parceiros/index.html), em React com o DS (D-053, lote S4). Mesmos textos, endereço, cabeça,
// links e eventos. O cadastro continua sendo a página /rede-parceiros/cadastro/, aberta numa gaveta (como a janela
// da página de HTML) ou no endereço próprio (Ctrl/⌘ + clique, sem JavaScript). Peças do DS: SITE_REACT.md, seção 6d.
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, Code2, Palette, Search } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AvatarCircles } from "@/components/ui/avatar-circles";
import { Badge } from "@/components/ui/badge";
import { BotaoSubir } from "@/components/ui/botao-subir";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CartaoFlutuante } from "@/components/ui/cartao-flutuante";
import { GradeDeCards } from "@/components/ui/grade-de-cards";
import { Heading } from "@/components/ui/heading";
import { LinkSaibaMais } from "@/components/ui/link-saiba-mais";
import { ListaDePilares } from "@/components/ui/lista-de-pilares";
import { LuzesDifusas } from "@/components/ui/luzes-difusas";
import { PartnerCard } from "@/components/ui/partner-card";
import { PilulaDeAcao } from "@/components/ui/pilula-de-acao";
import { Prosa } from "@/components/ui/prosa";
import { Selo } from "@/components/ui/selo";
import { SidePanel, SidePanelBody, SidePanelContent, SidePanelHeader } from "@/components/ui/side-panel";
import { Simulacao } from "@/components/ui/simulacao";
import { SurgirAoRolar } from "@/components/ui/surgir-ao-rolar";
import { CabecalhoDeSecao } from "@/compartilhado/site/CabecalhoDeSecao";
import { CascaDoSite } from "@/compartilhado/site/CascaDoSite";
import { registrarEvento } from "@/compartilhado/site/navegacao";
import { CenaCadastro, CenaColaboracao, CenaConvite, CenaOportunidades } from "./Cenas";
import { AVATAR, CADASTRO, ESPECIALIDADES, IconeDaRede, PERGUNTAS, PILARES, SETORES } from "./conteudo";

// O AvatarCircles do DS sempre faz de cada foto um link: aqui, todos levam ao cadastro (a gaveta), com nome acessível.
const avatares = (ns: number[]) => ns.map((n) => ({ imageUrl: AVATAR(n), profileUrl: CADASTRO, name: "Quero ser parceiro" }));

export function RedeDeParceiros() {
  const [cadastro, setCadastro] = useState(false);
  const [pergunta, setPergunta] = useState("");
  const hero = useRef<HTMLElement>(null);
  const convite = useRef<HTMLDivElement>(null);
  const origem = useRef<HTMLElement | null>(null);
  // A Simulacao do DS (d2aeb40) desenha o botão Pausar conforme "menos movimento" já na primeira pintura: no servidor
  // não há essa preferência e a hidratação falha. O avanço automático só liga depois de a página abrir no navegador.
  const [noNavegador, setNoNavegador] = useState(false);
  useEffect(() => setNoNavegador(true), []);

  // Todo link para o cadastro abre a gaveta (Ctrl/⌘/Shift + clique e o botão do meio abrem a página, como antes).
  useEffect(() => {
    const aoClicar = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>(`a[href="${CADASTRO}"]`);
      if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      origem.current = a;
      setCadastro(true);
      registrarEvento("cadastro_parceiro_aberto");
    };
    // a página do cadastro pede para fechar a janela quando termina
    const aoReceber = (e: MessageEvent) => {
      if (e.origin === location.origin && e.data === "dm-fechar-cadastro") setCadastro(false);
    };
    document.addEventListener("click", aoClicar);
    window.addEventListener("message", aoReceber);
    return () => {
      document.removeEventListener("click", aoClicar);
      window.removeEventListener("message", aoReceber);
    };
  }, []);

  return (
    <CascaDoSite
      atual="parceiros"
      posicaoDoCabecalho="fixed"
      rodape="claro"
      flutuantes={
        <>
          <PilulaDeAcao rotulo="Quero ser parceiro" href={CADASTRO} mostrarApos={hero} esconderCom={[convite]} />
          <BotaoSubir />
          <SidePanel open={cadastro} onOpenChange={setCadastro}>
            <SidePanelContent closeLabel="Fechar cadastro" onCloseAutoFocus={(e) => { if (origem.current?.isConnected) { e.preventDefault(); origem.current.focus(); } }}>
              <SidePanelHeader eyebrow="Rede de Parceiros" title="Quero ser parceiro" />
              <SidePanelBody className="flex p-0">
                {cadastro && <iframe title="Formulário de cadastro na Rede de Parceiros" src={CADASTRO} className="min-h-0 w-full flex-1 border-0" />}
              </SidePanelBody>
            </SidePanelContent>
          </SidePanel>
        </>
      }
    >
      <main id="conteudo" className="bg-card">
        {/* Hero */}
        <section ref={hero} aria-labelledby="rp-titulo" className="relative overflow-hidden bg-background px-4 pb-8 pt-28 sm:px-6 lg:px-8 lg:pt-32">
          <LuzesDifusas variante="hero" dissolver />
          <div className="relative z-[1] mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
            <SurgirAoRolar escalonar className="flex flex-col items-start gap-6">
              <Selo>DM | Partners & Connections</Selo>
              <Heading level={1} id="rp-titulo" size="hero">
                <span className="block">Conectando competências.</span> <span className="block">Ampliando possibilidades.</span>{" "}
                <span className="block text-primary-text">Transformando negócios.</span>
              </Heading>
              <p className="max-w-xl text-body leading-relaxed text-muted-foreground sm:text-body-lg">
                Estamos formando uma rede multidisciplinar de profissionais independentes (PJ) para colaborar em projetos de Design, Experiência, Negócios, Tecnologia e Inovação.
              </p>
              <div className="flex items-center gap-3">
                <AvatarCircles avatarUrls={avatares([1, 2, 3])} size="lg" />
                <p className="text-body-sm font-medium text-foreground">Junte-se ao nosso ecossistema de parceiros!</p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Button asChild size="lg">
                  <a href={CADASTRO}>Quero ser parceiro<ArrowRight aria-hidden /></a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#quem">Como funciona<ArrowDown aria-hidden /></a>
                </Button>
              </div>
            </SurgirAoRolar>
            <div className="relative mx-auto w-full max-w-xl">
              <img src="/rede-parceiros/hero-parceiros-v3.webp" alt="" width={1111} height={1416} {...{ fetchpriority: "high" }} className="h-auto max-h-150 w-full object-contain" />
              <CartaoFlutuante decorativo={false} icone={<Palette />} titulo="Design & UX" estado="Protótipo em validação" tom="marca" className="absolute left-0 top-1/2" />
              <CartaoFlutuante decorativo={false} icone={<Search />} titulo="Pesquisa" estado="Entrevistas com usuários" tom="info" atraso={0.6} className="absolute bottom-6 left-1/4" />
              <CartaoFlutuante decorativo={false} icone={<Code2 />} titulo="Tecnologia" estado="Integração em andamento" tom="sucesso" atraso={1.2} className="absolute right-0 top-2/3" />
            </div>
          </div>
          <div className="relative z-[1] mt-10 flex justify-center">
            <LinkSaibaMais href="#rede" />
          </div>
        </section>

        {/* Sobre a rede */}
        <section id="rede" aria-labelledby="rede-titulo" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-12">
            <CabecalhoDeSecao id="rede-titulo" selo="Sobre a rede" titulo="Uma rede construída na **força das conexões**">
              <p className="text-body leading-relaxed text-muted-foreground sm:text-body-lg">Todos os dias surgem novos projetos no Studio, com desafios de naturezas muito diferentes. Em muitos deles, precisamos de profissionais que tragam a especialidade e a vivência certas para cada situação.</p>
              <p className="text-body leading-relaxed text-muted-foreground sm:text-body-lg">A Rede de Parceiros nasce dessa necessidade e de uma convicção: existe força no contato, no relacionamento e na indicação. É por meio dessas conexões que reunimos os talentos certos para cada desafio.</p>
            </CabecalhoDeSecao>
            <ListaDePilares rotulo="A força das conexões" ordenada pilares={PILARES} />
          </div>
        </section>

        {/* Quem buscamos */}
        <section id="quem" aria-labelledby="quem-titulo" className="scroll-mt-20 bg-background px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-12">
            <CabecalhoDeSecao id="quem-titulo" selo="Quem buscamos" titulo="Competências e vivência setorial que **somam ao ecossistema**">
              <p className="text-body leading-relaxed text-muted-foreground sm:text-body-lg">Uma rede de profissionais independentes que une diferentes especialidades ao conhecimento prático de quem vive cada setor. Juntos, formamos equipes multidisciplinares que entendem os desafios, as particularidades e as oportunidades de cada negócio.</p>
            </CabecalhoDeSecao>
            <SurgirAoRolar className="flex flex-col items-center gap-4 text-center">
              <p className="text-body font-bold text-foreground"><span className="text-primary-text">12 setores</span> · Expertises conectadas.</p>
              <ul aria-label="Especialidades" className="flex flex-wrap justify-center gap-2">
                {ESPECIALIDADES.map((e) => (
                  <li key={e}><Badge variant="outline" className="px-3 py-1.5 text-body-sm">{e}</Badge></li>
                ))}
              </ul>
            </SurgirAoRolar>
            <SurgirAoRolar as="ul" escalonar aria-label="Setores" className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {SETORES.map(({ nome, Icone }) => (
                <li key={nome}>
                  <Card className="h-full">
                    <CardContent className="flex h-full items-center gap-3 px-4 py-4">
                      <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-muted text-primary-text"><Icone className="size-5" /></span>
                      <span className="text-body-sm font-semibold text-foreground">{nome}</span>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </SurgirAoRolar>
          </div>
        </section>

        {/* Match de parceiros */}
        <section id="match" aria-labelledby="match-titulo" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-12">
            <CabecalhoDeSecao id="match-titulo" selo="Match de parceiros" titulo="Da conexão à **colaboração**">
              <p className="text-body leading-relaxed text-muted-foreground sm:text-body-lg">Conheça o processo que combina inteligência artificial e curadoria especializada para formar equipes alinhadas às necessidades de cada projeto.</p>
            </CabecalhoDeSecao>
            <Simulacao
              rotulo="Simulação do match de parceiros"
              autoAvancar={noNavegador}
              intro="Como sua participação acontece"
              topoDaTela={<span className="flex items-center gap-2"><IconeDaRede aria-hidden className="size-4 text-primary-text" />Rede de Parceiros</span>}
              topicos={[
                { id: "cadastro", titulo: "Faça parte da rede", descricao: "Cadastre sua trajetória, competências e áreas de atuação para apresentar seu perfil ao Studio.", cena: <CenaCadastro /> },
                { id: "oportunidades", titulo: "Identificação de oportunidades", descricao: "A IA apoia a análise de compatibilidade entre os desafios dos projetos e os perfis da rede, com curadoria do Studio.", cena: <CenaOportunidades /> },
                { id: "convite", titulo: "Convite e alinhamento", descricao: "Havendo uma oportunidade, conversamos sobre seu interesse, disponibilidade, escopo e condições de colaboração.", cena: <CenaConvite /> },
                { id: "colaboracao", titulo: "Colaboração em prática", descricao: "Com a parceria formalizada, você contribui com sua especialidade para desenvolver soluções e gerar resultados.", cena: <CenaColaboracao /> },
              ]}
            />
            <Card orientacao="horizontal" className="mx-auto w-full max-w-4xl">
              <div className="flex min-w-0 flex-1 flex-col">
                <CardContent className="flex flex-col gap-3 pt-6">
                  <AvatarCircles avatarUrls={avatares([2, 1, 3, 4])} size="lg" />
                  <Heading level={3} size="card">Sua expertise pode ser a próxima conexão</Heading>
                  <p className="text-body-sm leading-relaxed text-muted-foreground">Faça parte da Rede de Parceiros e receba convites para projetos alinhados ao seu perfil.</p>
                </CardContent>
                <CardFooter className="justify-end border-t pt-4">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <a href={CADASTRO}>Quero ser parceiro<ArrowRight aria-hidden /></a>
                  </Button>
                </CardFooter>
              </div>
            </Card>
          </div>
        </section>

        {/* Galeria de profissionais: oculta no site por decisão da Dani (23/11/2026), como na página de HTML */}
        <section id="galeria" aria-labelledby="galeria-titulo" hidden className="px-4 py-16 sm:px-6 lg:px-8">
          <CabecalhoDeSecao id="galeria-titulo" selo="Ecossistema de Talentos" titulo="Conheça quem já faz **parte da rede**">
            <p className="text-body leading-relaxed text-muted-foreground">Profissionais independentes que desejam aplicar sua expertise em desafios estratégicos do Dani Moscatelli — Experience Design Studio e de empresas parceiras.</p>
            <p className="text-body-sm text-muted-foreground">Perfis ilustrativos, com nomes e fotos fictícios.</p>
          </CabecalhoDeSecao>
        </section>

        {/* Dúvidas frequentes */}
        <section id="cadastro" aria-labelledby="cadastro-titulo" className="scroll-mt-20 bg-background px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto flex max-w-3xl flex-col gap-10">
            <CabecalhoDeSecao id="cadastro-titulo" selo="Dúvidas frequentes" titulo="O que saber **antes de ingressar**">
              <p className="text-body leading-relaxed text-muted-foreground sm:text-body-lg">Esclareça as principais dúvidas sobre cadastro, oportunidades, participação na rede e uso dos seus dados.</p>
            </CabecalhoDeSecao>
            <Accordion type="single" collapsible value={pergunta} onValueChange={setPergunta} className="rounded-xl border bg-card px-6">
              {PERGUNTAS.map((g) => (
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
        <section aria-label="Convite para a Rede de Parceiros" className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div ref={convite} className="mx-auto max-w-6xl">
            <PartnerCard
              orientation="horizontal"
              size="g"
              eyebrow="Um convite"
              title="Vamos construir **juntos**?"
              description={
                <>
                  São mais de 20 anos em Design e Service Design, conectando estratégia, pesquisa e tecnologia. Agora, quero reunir <strong>profissionais com competências complementares</strong> para colaborar em projetos, da pesquisa à implementação.
                  <span className="mt-4 block text-foreground"><strong className="block">Dani Moscatelli</strong>Experience Design Studio</span>
                </>
              }
              cta={{ label: "Quero ser parceiro", href: CADASTRO }}
              visual={<img src="/dani-assinatura.webp" alt="Dani Moscatelli" className="size-full rounded-full object-cover" />}
            />
          </div>
        </section>
      </main>
    </CascaDoSite>
  );
}

