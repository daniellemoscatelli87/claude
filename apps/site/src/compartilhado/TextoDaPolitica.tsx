// Texto da Política de Privacidade, usado pela página /privacidade/ e pelas janelas da política (cadastro de parceiro e
// pesquisa), para o texto ser um só. Peças do DS: Prosa, Dialog (+ Header, Title, Description, Footer, Close) e Button.
import { abrirAvisoCookies } from "@/components/ui/aviso-cookies";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Prosa } from "@/components/ui/prosa";
import { EmailDoEstudio } from "@/compartilhado/EmailDoEstudio";

export const ATUALIZACAO_DA_POLITICA = "Última atualização: 25 de novembro de 2026";

function PreferenciasDeCookies() {
  return (
    <a
      href="#cookies"
      onClick={(e) => {
        e.preventDefault();
        abrirAvisoCookies();
      }}
    >
      Preferências de cookies
    </a>
  );
}

export function TextoDaPolitica({ className }: { className?: string }) {
  return (
          <Prosa className={className}>
          <p>
            Esta política explica como Dani Moscatelli | Experience Design Studio, inscrita no CNPJ 53.271.648/0001-69, com sede em Curitiba/PR, trata os dados pessoais coletados no site danimoscatelli.com.br, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD).
          </p>

          <h2>1. Quais dados coletamos</h2>
            <ul>
              <li><strong>Formulário de contato:</strong> nome, e-mail, telefone/WhatsApp, empresa, cargo, tipo de negócio, assunto, mensagem e preferência de dia e período para conversa.</li>
              <li><strong>E-mails enviados para <EmailDoEstudio />:</strong> nome e endereço de quem enviou, assunto e texto da mensagem, guardados na nossa área restrita para organizar o atendimento junto com as mensagens do formulário. Os anexos ficam só na caixa de e-mail.</li>
              <li><strong>Aviso de lançamento:</strong> e-mail informado para receber novidades do site.</li>
              <li><strong>Cadastro na Rede de Parceiros:</strong> dados de identificação e contato (nome, empresa, e-mail, telefone, cidade e estado, LinkedIn e portfólio) e informações profissionais (áreas de atuação, especialidade, experiência, formação, idiomas, disponibilidade e formatos de colaboração), além do registro do seu consentimento.</li>
              <li><strong>Cadastro no Programa Projeto Piloto:</strong> nome do responsável, e-mail, telefone/WhatsApp, nome da empresa, segmento, cidade e estado e, se você informar, a descrição do desafio e a frente de atuação de interesse.</li>
              <li><strong>Trocas de e-mail e reuniões:</strong> mensagens trocadas conosco a partir do contato e, quando agendada, a reunião (data, horário e link de videochamada).</li>
              <li><strong>Pesquisa sobre compra de moda em Curitiba:</strong> respostas às perguntas da pesquisa, o relato livre (se você escrever) e a sua identificação: nome, e-mail e WhatsApp, pedidos no início para garantir uma participação por pessoa. Detalhes na seção 8.</li>
              <li><strong>E-mails da Rede de Parceiros:</strong> nos e-mails que enviamos aos integrantes da Rede de Parceiros (convites e comunicados), registramos se a mensagem foi entregue, aberta e se os links foram acessados, com data e horário, para acompanhar os comunicados. Esse registro fica associado ao seu cadastro na rede.</li>
            </ul>
            <p>
              <strong>Medição de acessos:</strong> se você aceitar no aviso de cookies, o Google Analytics registra, de forma agregada, informações de navegação (páginas visitadas, tempo na página, cliques, tipo de dispositivo e navegador, região aproximada e de onde você chegou ao site). O Google Analytics 4 não armazena o endereço IP completo. O site não usa cookies de publicidade.
            </p>
          

          <h2>2. Para que usamos os dados</h2>
            <ul>
              <li>Responder contatos, enviar propostas e agendar reuniões.</li>
              <li>Avisar sobre o lançamento do novo site.</li>
              <li>Organizar a Rede de Parceiros, analisar competências e entrar em contato sobre oportunidades de colaboração.</li>
              <li>Avaliar a participação da empresa no Programa Projeto Piloto e entrar em contato quando houver uma oportunidade de projeto compatível.</li>
              <li>Analisar, em conjunto, os resultados da pesquisa sobre compra de moda em Curitiba, garantir uma participação por pessoa, entregar os benefícios de lançamento a quem participou e enviar novidades do projeto a quem pediu.</li>
              <li>Entender como o site é usado, para melhorá-lo (só com o seu consentimento).</li>
            </ul>
          

          <h2>3. Base legal</h2>
            <p>O tratamento é feito com base no seu consentimento e, no caso de contatos comerciais, no atendimento à sua solicitação e em procedimentos preliminares a um possível contrato.</p>
          

          <h2>4. Compartilhamento</h2>
            <p>Não vendemos nem divulgamos seus dados. Eles são tratados apenas por fornecedores que viabilizam o funcionamento do site:</p>
            <ul>
              <li>Supabase (banco de dados);</li>
              <li>Cloudflare (hospedagem);</li>
              <li>Resend (envio de e-mails);</li>
              <li>Hostinger (caixa de e-mail <EmailDoEstudio />);</li>
              <li>Google (agenda, link do Google Meet, análise de perfis da Rede de Parceiros por inteligência artificial, em que não são enviados nome, e-mail, telefone, empresa nem links, organização por temas dos relatos da pesquisa da seção 8, também por inteligência artificial e sem dados de identificação, e medição de acessos pelo Google Analytics, apenas com o seu consentimento).</li>
            </ul>
          

          <h2>5. Armazenamento e segurança</h2>
            <p>Os dados ficam em ambiente protegido, com acesso restrito à administração do estúdio, e são mantidos enquanto forem necessários para as finalidades acima ou até que você peça a exclusão, observados os prazos legais.</p>
          

          <h2 id="cookies" className="scroll-mt-8">6. Cookies</h2>
            <p>
              O site só usa cookies de medição do Google Analytics (<code>_ga</code> e <code>_ga_FTVGXQRJQ6</code>), guardados por até 2 anos, e apenas se você tocar em "Aceitar" no aviso de cookies. Se você recusar, nenhum cookie de medição é criado. Sua escolha fica guardada neste navegador e pode ser revista a qualquer momento em <PreferenciasDeCookies />.
            </p>
          

          <h2>7. Seus direitos</h2>
            <p>
              Você pode pedir a qualquer momento acesso, correção, exclusão dos seus dados ou revogação do consentimento pelo e-mail <EmailDoEstudio link />.
            </p>
          

          <h2 id="pesquisa-moda" className="scroll-mt-8">8. Pesquisa sobre compra de moda em Curitiba</h2>
            <p>A pesquisa sobre hábitos e experiências de compra de roupas e acessórios em Curitiba faz parte de um projeto de inovação do Dani Moscatelli — Experience Design Studio. A participação é voluntária e pode ser interrompida a qualquer momento.</p>
            <ul>
              <li><strong>Identificação:</strong> para participar, você informa nome, WhatsApp e, se quiser, e-mail, e confirma que leu e concorda com o uso desses dados. Usamos a identificação para garantir uma participação por pessoa e para entregar os benefícios de lançamento a quem participou. Guardamos também a data, o horário e a versão do texto que você confirmou.</li>
              <li><strong>Respostas da pesquisa:</strong> guardamos as respostas, incluindo gênero e faixa etária (com a opção "Prefiro não informar"), e, se você escrever, o relato da pergunta aberta, exatamente como foi enviado. As respostas ficam ligadas à sua identificação, com acesso restrito à equipe do estúdio. Os resultados são analisados em conjunto e divulgados sem identificar quem respondeu. Os relatos podem ser organizados por temas com ajuda de inteligência artificial do Google (Gemini): enviamos só o texto dos relatos, sem nome, e-mail ou WhatsApp, e trocamos por "[contato]" e-mails e telefones escritos no relato. Na versão gratuita desse serviço, o Google pode usar o conteúdo enviado para melhorar os produtos dele.</li>
              <li><strong>Avisos do lançamento (opcional):</strong> se, no fim da pesquisa, você escolher receber os avisos, usamos seu e-mail e WhatsApp para enviar novidades do projeto e avisar sobre os benefícios de lançamento de quem participou. Guardamos a data, o horário e a versão do texto dessa autorização. Esses dados não são usados para publicidade de outros produtos ou serviços, nem vendidos ou compartilhados com terceiros.</li>
              <li><strong>Base legal e prazo:</strong> o uso dos dados depende da sua concordância e da sua autorização. Eles ficam guardados enquanto forem necessários para a pesquisa e para os avisos do lançamento, ou até você pedir a exclusão.</li>
              <li><strong>Cancelar ou excluir:</strong> para deixar de receber os avisos ou pedir a exclusão dos seus dados e respostas, escreva para <EmailDoEstudio link />.</li>
            </ul>
          

          <h2>9. Alterações</h2>
            <p>Esta política pode ser atualizada. A versão vigente estará sempre nesta página.</p>
          </Prosa>
  );
}

/**
 * A política numa janela, sem tirar a pessoa do formulário (como as páginas de HTML faziam). `ancora` rola até uma
 * seção ao abrir (por exemplo, "pesquisa-moda").
 */
export function JanelaDaPolitica({ aberta, onAbertaChange, ancora }: { aberta: boolean; onAbertaChange: (v: boolean) => void; ancora?: string }) {
  return (
    <Dialog open={aberta} onOpenChange={onAbertaChange}>
      <DialogContent
        className="flex max-h-9/10 flex-col gap-0 p-0 sm:max-w-2xl"
        // O foco vai para a janela (e não para o primeiro link do texto, que rolaria o texto); com `ancora`, o texto
        // abre já na seção pedida.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          const janela = e.currentTarget as HTMLElement | null;
          if (ancora) janela?.querySelector(`#${ancora}`)?.scrollIntoView({ block: "start" });
          janela?.focus({ preventScroll: true });
        }}
      >
        <DialogHeader className="border-b px-6 py-4 pr-14 text-left">
          <DialogTitle>Política de Privacidade</DialogTitle>
          <DialogDescription>{ATUALIZACAO_DA_POLITICA}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <TextoDaPolitica />
        </div>
        <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button variant="outline">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
