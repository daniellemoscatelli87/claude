# Landing comercial v1: plano de implementação (aguarda aprovação)

**Data:** 21/10/2026 · **Especificação:** [`landing-comercial/01-COPY-FINAL-E-ARQUITETURA-DA-LANDING.md`](landing-comercial/01-COPY-FINAL-E-ARQUITETURA-DA-LANDING.md) e [`02-INSTRUCOES-CLAUDE-CODE.md`](landing-comercial/02-INSTRUCOES-CLAUDE-CODE.md), enviadas pela dona do produto e guardadas sem alteração. · **Status:** implementado e testado em 21/10/2026, não publicado (seção 9). Decisões na seção 8.

Substitui a landing de D-030 (não publicada): copy, dados de mercado e componentes passam a ser os da especificação v1.

## 1. Rotas

| Rota | O que muda | O que não muda |
|---|---|---|
| `/` sem login | Landing comercial (14 blocos da especificação) | `/` com login (área de trabalho) |
| `/entrar/` | Textos da especificação: título, subtítulo, mensagens, "Solicitar acesso antecipado", "Conhecer a plataforma" | Lógica de login, convite, confirmação de e-mail |
| `/cadastro/` | Nada. Deixa de aparecer na landing; fica acessível a quem recebeu convite (ver decisão B) | Todo o cadastro |
| Demais rotas, banco, funções, IA | Nada | Tudo |

## 2. Componentes (pasta `src/components/landing/`)

| Bloco | Componente | Comportamento |
|---|---|---|
| Header | `LandingHeader` | Fixo no topo, discreto; âncoras Como funciona, Aplicações, Diferenciais, Planos, FAQ; "Entrar" (secundário) e "Solicitar acesso" (primário). Celular: botão de menu que abre painel com botões grandes; fecha com Esc, toque fora ou ao navegar. Rolagem suave só quando o sistema não pede movimento reduzido |
| 01 Hero | `CicloTransformacao` | 5 nós (Desafio, Descoberta, Evidências, Melhorias, Evolução) como botões; o selecionado troca a frase do painel. Celular: faixa horizontal rolável por toque, texto abaixo. Sem animação automática |
| 02 Dados | `DadosMercado` + `ExploradorSintomas` | 3 cards (número, contexto, fonte com link, "Sobre a pesquisa" que abre ao toque). Abaixo, 4 sintomas (Espera, Abandono, Retrabalho, Baixa adesão) como botões que mostram dimensões a investigar (**conteúdo pendente, decisão C**) |
| 03 Categoria | `CamadasValor` | 3 pilares em cards com um diagrama simples Pessoas / Serviços e operação / Resultados; foco ou toque realça a relação. Celular: cards empilhados |
| 04 Como funciona | `JornadaStepper` | 5 etapas clicáveis e navegáveis por teclado; painel com o texto da etapa. Celular: "Etapa 1 de 5" com Anterior e Próxima. Etiqueta "Visão do funcionamento planejado" nas etapas 2 a 5 |
| 05 Demonstração | `DemoDesafios` | 3 abas reais (`tablist`, setas do teclado): Saúde, Produto digital, Colaboradores e operação, com o conteúdo da especificação e um mini fluxo Desafio → Atividade orientada → Evidência → Oportunidade. Sem IA e sem formulário |
| 06 Entregáveis | `TrilhaEntregaveis` | 6 cards conectados em trilha, com o texto da especificação (detalhes por caso fictício: decisão C) |
| 07 Aplicações | `FiltroAplicacoes` | Dois grupos de chips com seleção independente; mostra os exemplos da especificação ligados à combinação escolhida; sem exemplo, a mensagem de estado vazio da especificação |
| 08 Diferenciais | `CardsDiferenciais` | 6 cards (3×2 no computador, 1 coluna no celular) com ícone e estado de foco |
| 09 Plataforma + consultoria | `PlataformaConsultoria` | 2 cards lado a lado (empilhados no celular), identidade própria, ícones Laptop e Handshake, faixa abaixo |
| 10 Confiança | `FaixaConfianca` | 3 pontos com ícone + link para o aviso de privacidade real do app (`/aviso-de-privacidade/`) |
| 11 Planos | `CardsPlanos` | 3 cards com selos "proposta em estudo", "A definir" / "Sob consulta", nota da especificação; sem lista de recursos |
| 12 FAQ | `PerguntasFrequentes` | 10 perguntas, uma aberta por vez, botões com `aria-expanded`, ícone Plus/Minus, link direto por âncora, todas fechadas no início; abaixo, "Ainda tem dúvidas? Falar com o estúdio" |
| 13 CTA final | `CtaFinal` | Faixa escura com a linha de 5 nós; botões empilhados no celular |
| 14 Rodapé | `RodapeLanding` | Marca, assinatura, frase, navegação, "Política de privacidade", link para o site do estúdio, "Voltar ao topo" e a linha de copyright atual |

Sem dependências novas: React, CSS do projeto e lucide-react (todos os ícones da especificação existem na versão instalada). Sem chamadas de rede na landing, sem IA, sem formulário.

## 3. Situação real × afirmações da copy

Hoje existem: conta com convite, cadastro da empresa, registro do desafio e interpretação inicial pela IA (só testes). O plano de investigação pela IA é o próximo incremento; evidências, hipóteses, melhorias, acompanhamento, colaboração e planos ainda não existem.

Marcações propostas (aviso honesto sem encher cada card):
- **Como funciona:** etapa 1 sem etiqueta; etapas 2 a 5 com "Visão do funcionamento planejado" (texto da especificação).
- **Demonstração:** "Exemplos ilustrativos. As atividades reais dependem do desafio, do contexto e das evidências disponíveis." (da especificação) + selo "Em desenvolvimento".
- **Entregáveis:** selo geral "Em desenvolvimento" no título da seção; "Desafio estruturado" é o único hoje disponível em testes.
- **Planos:** selos da especificação ("proposta em estudo", "Planos em definição • Acesso antecipado por convite").
- **Confiança:** os 3 pontos descrevem como o processo foi concebido; nenhuma afirmação técnica (sem "LGPD 100%", criptografia etc.).

## 4. Captação de interesse e política de privacidade

- **Não existe** captação de leads no app nem lista de espera. O site tem um formulário de contato (gaveta da página inicial, sem endereço próprio) e o e-mail público `contato@danimoscatelli.com.br`.
- **Política de privacidade:** existe a do site (`danimoscatelli.com.br/privacidade/`) e o aviso de privacidade do app para a fase de testes (`/aviso-de-privacidade/`). **Termos de uso não existem**: o link fica fora do rodapé.

## 5. Decisões necessárias (uma por vez)

- **A. Destino dos botões de interesse** ("Solicitar acesso antecipado", "Tenho interesse", "Conversar sobre minha necessidade", "Conversar sobre consultoria", "Falar com o estúdio"). Proposta: abrir o e-mail do estúdio (`mailto:contato@danimoscatelli.com.br`) com assunto já preenchido para cada botão (ex.: "Acesso antecipado", "Consultoria", "Planos: Essential"). É um destino real, sem custo, sem guardar dados no app. Alternativas: formulário próprio (exige banco e texto de privacidade, fora do escopo) ou página inicial do site.
- **B. /entrar/.** "Esqueci minha senha" não existe hoje e exige mexer na autenticação: proposta de deixar fora agora (registrar no backlog). Manter um link discreto "Recebeu um convite? Criar conta" para as pessoas convidadas chegarem ao cadastro.
- **C. Conteúdos que a especificação pede mas não traz:** (1) as dimensões a investigar de cada sintoma (Espera, Abandono, Retrabalho, Baixa adesão); (2) o caso fictício dos entregáveis; (3) o exemplo de uma linha de cada diferencial; (4) "o que a plataforma organiza" em cada etapa do stepper; (5) quais combinações de filtros mostram cada um dos 4 exemplos. Proposta: eu escrevo um rascunho curto de cada um para sua aprovação antes de programar, ou esses itens ficam sem o detalhe.

## 6. Ajustes previstos, sem mudar o sentido

- **Travessões:** a especificação usa "—" em frases (hero, dados, seção 7, diferenciais, seção 10). Regra do site: sem "—". Troca por vírgula, dois-pontos ou ponto, mantendo as palavras.
- **Cores:** usar os tokens já existentes (`--dark` #0f172a, vermelhos do projeto). Os valores #131A27/#0D1119 citados não estão no projeto nem no site; a especificação pede para reaproveitar tokens.
- **SEO:** o app está com `noindex` durante os testes. Proposta: título, descrição e Open Graph agora; JSON-LD, sitemap e canonical só quando a página for divulgada.
- **Analytics:** não existe ferramenta de medição. Proposta: não medir agora (não há custo nem ferramenta autorizada); registrar os 6 eventos no backlog.
- **"Pixels are not the journey.":** opcional; proposta de não usar nesta versão.
- **Dados de mercado:** Qualtrics (34%, 12/11/2025, 20.001 consumidores em 14 países, incluindo o Brasil) conferido na página original. PwC 2025 (70% dos executivos; 29% dos consumidores) conferido na página da PwC dos Estados Unidos, que repete os números; a página da PwC Brasil indicada recusou o acesso automático: conferir no celular antes de publicar.

## 7. Arquivos, riscos, custo e testes

- **Arquivos:** novos em `src/components/landing/`; alterados `src/app/page.tsx` (sem login), `src/app/entrar/page.tsx`, `src/components/AuthForm.tsx` (só textos), `src/components/Shell.tsx` (cabeçalho público), `src/app/globals.css`, `src/app/layout.tsx` (Open Graph). Removido `src/components/Landing.tsx` (D-030).
- **Riscos:** página longa no celular (mitigado com menu de âncoras e "Voltar ao topo"); excesso de promessa (mitigado pelas marcações da seção 3).
- **Custo:** zero. Nenhum serviço novo.
- **Testes:** tipos, lint, testes automáticos, build estático e navegador a 320, 375, 430 e 1280 px: teclado nas abas, stepper, FAQ e menu; Esc fecha o menu; sem rolagem lateral; sem "—"; todos os links com destino real; movimento reduzido respeitado; leitura com JavaScript desligado.

## 8. Decisões da dona do produto (21/10/2026)

- **Cores:** usar exatamente as cores que o app já tem.
- **Botões de interesse (decisão A):** esses fluxos não serão feitos agora. Ficam fora: "Solicitar acesso antecipado" (header, hero, /entrar/), "Tenho interesse" e "Conversar sobre minha necessidade" (planos), "Conversar sobre consultoria" (seção 9 e CTA final) e "Falar com o estúdio" (FAQ). Ficam: no header "Entrar"; no hero "Ver como funciona" (primário) e a nota "Acesso por convite durante a fase de testes."; na seção 9 "Conhecer a plataforma"; no CTA final a microcopy de convite e o botão "Entrar". Os planos ficam sem botão.
- **Esqueci minha senha:** incluir. Proposta:
  - `/entrar/` ganha o link "Esqueci minha senha" → `/recuperar-senha/` (e-mail; resposta sempre igual, "Se houver uma conta com este e-mail, enviaremos um link para criar uma nova senha.", para não revelar quem tem conta);
  - o link do e-mail abre `/redefinir-senha/`, com o campo de nova senha do design system (força, requisitos, confirmação), usando a troca de senha que já existe;
  - recurso gratuito do Supabase Auth; o endereço de retorno `https://app.danimoscatelli.com.br/**` já está liberado (C2-12);
  - atenção: o e-mail de redefinição usa o mesmo modelo e o mesmo envio do Supabase que o site usa; conferir o texto do modelo "Reset password" e o limite de envios por hora do projeto antes de liberar.
- **Medição de acessos:** Google Analytics 4, na landing do app e também na página inicial do site do estúdio. Implicações (LGPD):
  - o GA4 usa cookies: carregar só depois do consentimento, com aviso de cookies (aceitar ou recusar, com a mesma facilidade) no app e no site;
  - a Política de Privacidade do site hoje diz "O site não usa cookies de publicidade nem ferramentas de rastreamento de visitantes": precisa ser atualizada antes de ligar a medição; o aviso de privacidade do app também;
  - no app, medir só as páginas públicas (landing, entrar, cadastro), nunca a área logada, sem identificar a pessoa;
  - eventos: `hero_cta_click`, `demo_tab_change`, `faq_expand`, `login_click` (os de planos e consultoria saem junto com os botões);
  - a dona do produto cria a propriedade no GA4 e informa o ID de medição (`G-...`, não é segredo); sem custo.

## 9. Complemento dos cinco conteúdos e implementação (21/10/2026)

- Complemento recebido e guardado sem alteração em [`landing-comercial/complemento/`](landing-comercial/complemento/): sintomas (Espera, Abandono, Retrabalho, Baixa adesão), "o que a plataforma organiza" no stepper, caso fictício Clínica Aurora nos entregáveis, exemplos de uma linha dos diferenciais e as 4 combinações exatas dos filtros com os estados vazios.
- Implementado: `src/components/Landing.tsx`, `src/components/landing/` (`conteudo.ts`, `Cabecalho.tsx`, `Interativos.tsx`), `/entrar/` com os textos da especificação, `/recuperar-senha/` e `/redefinir-senha/`, `AvisoCookies` + `src/infrastructure/analytics.ts` (GA4 só com consentimento, só em páginas públicas, sem parâmetros nem fragmento no endereço). O GA4 fica inativo até existir `NEXT_PUBLIC_GA_ID` no Netlify.
- Ajustes: "—" trocado por vírgula em 7 frases; no celular, ao escolher um entregável, a página leva até o painel de detalhe; sem JavaScript a landing aparece inteira (perguntas e abas abertas).
- Pendências antes de publicar: textos do aviso de cookies e do aviso de privacidade do app sobre o GA4; conferir no Supabase o modelo do e-mail "Reset password" e o limite de envios; a pergunta 10 do FAQ diz "Você pode solicitar interesse em acesso antecipado", mas esse canal não existe nesta fase.
- Site do estúdio (GA4 na página inicial e atualização da Política de Privacidade): ainda não alterado; próximo passo, com aprovação dos textos.
