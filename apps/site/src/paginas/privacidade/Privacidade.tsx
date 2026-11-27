// Política de Privacidade (public/privacidade/index.html), em React com o DS (D-053, lote S7). Texto idêntico.
// Peças do DS: Selo, Heading, Button (link), RodapeSite (compacto), AvisoCookies e BotaoWhatsApp (PecasDoSite).
// FALTA no DS: Prosa (texto longo: parágrafos, listas e links no meio do texto) e Logo. Enquanto a Prosa não existir,
// o texto usa só classes de layout e tokens, nesta página; por isso ela fica em prévia (SITE_REACT.md).
import type { ReactNode } from "react";
import { abrirAvisoCookies } from "@/components/ui/aviso-cookies";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { RodapeSite } from "@/components/ui/rodape-site";
import { Selo } from "@/components/ui/selo";
import { PecasDoSite } from "@/compartilhado/PecasDoSite";
import { EMAIL_DE_CONTATO, LOGO } from "@/compartilhado/marca";

const LINK = "rounded-sm font-semibold text-primary-text underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** O e-mail do estúdio fora da ofuscação de e-mails do Cloudflare (marcas email_off, como na página de HTML). */
function EmailDoEstudio({ link = false }: { link?: boolean }) {
  const conteudo = link ? `<a class="${LINK}" href="mailto:${EMAIL_DE_CONTATO}">${EMAIL_DE_CONTATO}</a>` : EMAIL_DE_CONTATO;
  return <span dangerouslySetInnerHTML={{ __html: `<!--email_off-->${conteudo}<!--/email_off-->` }} />;
}

function Topico({ id, titulo, children }: { id?: string; titulo: string; children: ReactNode }) {
  return (
    <section className="mt-10 flex flex-col gap-3">
      <Heading level={2} size="card" id={id} className="scroll-mt-8">
        {titulo}
      </Heading>
      {children}
    </section>
  );
}

const P = "text-base leading-relaxed text-foreground";
function Lista({ children }: { children: ReactNode }) {
  return <ul className={`${P} flex list-disc flex-col gap-1.5 pl-6 marker:text-muted-foreground`}>{children}</ul>;
}

function PreferenciasDeCookies() {
  return (
    <a
      href="#cookies"
      className={LINK}
      onClick={(e) => {
        e.preventDefault();
        abrirAvisoCookies();
      }}
    >
      Preferências de cookies
    </a>
  );
}

export function Privacidade() {
  return (
    <div className="flex min-h-dvh flex-col bg-card">
      <header>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-6 lg:px-10">
          <a href="/" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <img src={LOGO} alt="Dani Moscatelli - Experience Design Studio" className="block h-12 w-auto" />
          </a>
          <Button asChild variant="link" size="lg" className="px-0 has-[>svg]:px-0">
            <a href="/">Voltar ao site</a>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <article className="mx-auto max-w-190 px-6 pb-16 pt-6">
          <Selo tone="primary">LGPD</Selo>
          <Heading level={1} className="mt-4">
            Política de Privacidade
          </Heading>
          <p className="mt-3 text-sm text-muted-foreground">Última atualização: 25 de novembro de 2026</p>

          <p className={`${P} mt-8`}>
            Esta política explica como Dani Moscatelli | Experience Design Studio, inscrita no CNPJ 53.271.648/0001-69, com sede em Curitiba/PR, trata os dados pessoais coletados no site danimoscatelli.com.br, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD).
          </p>

          <Topico titulo="1. Quais dados coletamos">
            <Lista>
              <li><strong>Formulário de contato:</strong> nome, e-mail, telefone/WhatsApp, empresa, cargo, tipo de negócio, assunto, mensagem e preferência de dia e período para conversa.</li>
              <li><strong>E-mails enviados para <EmailDoEstudio />:</strong> nome e endereço de quem enviou, assunto e texto da mensagem, guardados na nossa área restrita para organizar o atendimento junto com as mensagens do formulário. Os anexos ficam só na caixa de e-mail.</li>
              <li><strong>Aviso de lançamento:</strong> e-mail informado para receber novidades do site.</li>
              <li><strong>Cadastro na Rede de Parceiros:</strong> dados de identificação e contato (nome, empresa, e-mail, telefone, cidade e estado, LinkedIn e portfólio) e informações profissionais (áreas de atuação, especialidade, experiência, formação, idiomas, disponibilidade e formatos de colaboração), além do registro do seu consentimento.</li>
              <li><strong>Cadastro no Programa Projeto Piloto:</strong> nome do responsável, e-mail, telefone/WhatsApp, nome da empresa, segmento, cidade e estado e, se você informar, a descrição do desafio e a frente de atuação de interesse.</li>
              <li><strong>Trocas de e-mail e reuniões:</strong> mensagens trocadas conosco a partir do contato e, quando agendada, a reunião (data, horário e link de videochamada).</li>
              <li><strong>Pesquisa sobre compra de moda em Curitiba:</strong> respostas às perguntas da pesquisa, o relato livre (se você escrever) e a sua identificação: nome, e-mail e WhatsApp, pedidos no início para garantir uma participação por pessoa. Detalhes na seção 8.</li>
              <li><strong>E-mails da Rede de Parceiros:</strong> nos e-mails que enviamos aos integrantes da Rede de Parceiros (convites e comunicados), registramos se a mensagem foi entregue, aberta e se os links foram acessados, com data e horário, para acompanhar os comunicados. Esse registro fica associado ao seu cadastro na rede.</li>
            </Lista>
            <p className={P}>
              <strong>Medição de acessos:</strong> se você aceitar no aviso de cookies, o Google Analytics registra, de forma agregada, informações de navegação (páginas visitadas, tempo na página, cliques, tipo de dispositivo e navegador, região aproximada e de onde você chegou ao site). O Google Analytics 4 não armazena o endereço IP completo. O site não usa cookies de publicidade.
            </p>
          </Topico>

          <Topico titulo="2. Para que usamos os dados">
            <Lista>
              <li>Responder contatos, enviar propostas e agendar reuniões.</li>
              <li>Avisar sobre o lançamento do novo site.</li>
              <li>Organizar a Rede de Parceiros, analisar competências e entrar em contato sobre oportunidades de colaboração.</li>
              <li>Avaliar a participação da empresa no Programa Projeto Piloto e entrar em contato quando houver uma oportunidade de projeto compatível.</li>
              <li>Analisar, em conjunto, os resultados da pesquisa sobre compra de moda em Curitiba, garantir uma participação por pessoa, entregar os benefícios de lançamento a quem participou e enviar novidades do projeto a quem pediu.</li>
              <li>Entender como o site é usado, para melhorá-lo (só com o seu consentimento).</li>
            </Lista>
          </Topico>

          <Topico titulo="3. Base legal">
            <p className={P}>O tratamento é feito com base no seu consentimento e, no caso de contatos comerciais, no atendimento à sua solicitação e em procedimentos preliminares a um possível contrato.</p>
          </Topico>

          <Topico titulo="4. Compartilhamento">
            <p className={P}>Não vendemos nem divulgamos seus dados. Eles são tratados apenas por fornecedores que viabilizam o funcionamento do site:</p>
            <Lista>
              <li>Supabase (banco de dados);</li>
              <li>Cloudflare (hospedagem);</li>
              <li>Resend (envio de e-mails);</li>
              <li>Hostinger (caixa de e-mail <EmailDoEstudio />);</li>
              <li>Google (agenda, link do Google Meet, análise de perfis da Rede de Parceiros por inteligência artificial, em que não são enviados nome, e-mail, telefone, empresa nem links, organização por temas dos relatos da pesquisa da seção 8, também por inteligência artificial e sem dados de identificação, e medição de acessos pelo Google Analytics, apenas com o seu consentimento).</li>
            </Lista>
          </Topico>

          <Topico titulo="5. Armazenamento e segurança">
            <p className={P}>Os dados ficam em ambiente protegido, com acesso restrito à administração do estúdio, e são mantidos enquanto forem necessários para as finalidades acima ou até que você peça a exclusão, observados os prazos legais.</p>
          </Topico>

          <Topico id="cookies" titulo="6. Cookies">
            <p className={P}>
              O site só usa cookies de medição do Google Analytics (<code className="font-mono text-sm">_ga</code> e <code className="font-mono text-sm">_ga_FTVGXQRJQ6</code>), guardados por até 2 anos, e apenas se você tocar em "Aceitar" no aviso de cookies. Se você recusar, nenhum cookie de medição é criado. Sua escolha fica guardada neste navegador e pode ser revista a qualquer momento em <PreferenciasDeCookies />.
            </p>
          </Topico>

          <Topico titulo="7. Seus direitos">
            <p className={P}>
              Você pode pedir a qualquer momento acesso, correção, exclusão dos seus dados ou revogação do consentimento pelo e-mail <EmailDoEstudio link />.
            </p>
          </Topico>

          <Topico id="pesquisa-moda" titulo="8. Pesquisa sobre compra de moda em Curitiba">
            <p className={P}>A pesquisa sobre hábitos e experiências de compra de roupas e acessórios em Curitiba faz parte de um projeto de inovação do Dani Moscatelli — Experience Design Studio. A participação é voluntária e pode ser interrompida a qualquer momento.</p>
            <Lista>
              <li><strong>Identificação:</strong> para participar, você informa nome, WhatsApp e, se quiser, e-mail, e confirma que leu e concorda com o uso desses dados. Usamos a identificação para garantir uma participação por pessoa e para entregar os benefícios de lançamento a quem participou. Guardamos também a data, o horário e a versão do texto que você confirmou.</li>
              <li><strong>Respostas da pesquisa:</strong> guardamos as respostas, incluindo gênero e faixa etária (com a opção "Prefiro não informar"), e, se você escrever, o relato da pergunta aberta, exatamente como foi enviado. As respostas ficam ligadas à sua identificação, com acesso restrito à equipe do estúdio. Os resultados são analisados em conjunto e divulgados sem identificar quem respondeu. Os relatos podem ser organizados por temas com ajuda de inteligência artificial do Google (Gemini): enviamos só o texto dos relatos, sem nome, e-mail ou WhatsApp, e trocamos por "[contato]" e-mails e telefones escritos no relato. Na versão gratuita desse serviço, o Google pode usar o conteúdo enviado para melhorar os produtos dele.</li>
              <li><strong>Avisos do lançamento (opcional):</strong> se, no fim da pesquisa, você escolher receber os avisos, usamos seu e-mail e WhatsApp para enviar novidades do projeto e avisar sobre os benefícios de lançamento de quem participou. Guardamos a data, o horário e a versão do texto dessa autorização. Esses dados não são usados para publicidade de outros produtos ou serviços, nem vendidos ou compartilhados com terceiros.</li>
              <li><strong>Base legal e prazo:</strong> o uso dos dados depende da sua concordância e da sua autorização. Eles ficam guardados enquanto forem necessários para a pesquisa e para os avisos do lançamento, ou até você pedir a exclusão.</li>
              <li><strong>Cancelar ou excluir:</strong> para deixar de receber os avisos ou pedir a exclusão dos seus dados e respostas, escreva para <EmailDoEstudio link />.</li>
            </Lista>
          </Topico>

          <Topico titulo="9. Alterações">
            <p className={P}>Esta política pode ser atualizada. A versão vigente estará sempre nesta página.</p>
          </Topico>
        </article>
      </main>

      <RodapeSite
        variante="compacto"
        copyright="© 2026 Dani Moscatelli • Experience Design Studio. Todos os direitos reservados."
        credito={null}
        onPreferenciasCookies={abrirAvisoCookies}
        espacoFlutuante
      />
      <PecasDoSite />
    </div>
  );
}
