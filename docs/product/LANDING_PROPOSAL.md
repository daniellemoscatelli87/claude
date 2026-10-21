# Landing page pública do produto: proposta (aguarda aprovação)

**Data:** 21/10/2026 · **Origem:** pedido da dona do produto (landing de produto SaaS B2B separada do login) · **Status:** aprovada com ajustes em 21/10/2026 (D-030) e implementada (não publicada). Ajustes no fim do documento.

Base: o texto enviado pela dona do produto, com a copy de cada seção. A copy abaixo é a dela; só aponto, em **Ajustes**, onde ela conflita com regras já registradas (kit de UX, CLAUDE.md, decisões). Nada novo foi inventado: sem números, depoimentos, logotipos de clientes ou preços.

## 1. Separação das experiências

| Endereço | Hoje | Proposta |
|---|---|---|
| `app.danimoscatelli.com.br/` sem login | Proposta de valor curta + formulário de entrar | **Landing page** (seções abaixo), sem formulário |
| `/entrar/` | Não existe | **Entrar**: o formulário atual ("Que bom ter você por aqui."), "Ainda não tem conta? Criar conta" |
| `/cadastro/` | Cadastro em 2 etapas | Sem mudança |
| `/` com login | Área de trabalho | Sem mudança |

Cabeçalho da landing: marca à esquerda; à direita, "Entrar" (link) e "Criar conta" (botão). No celular, os dois cabem no cabeçalho, sem menu escondido.

Mapa dos botões:
- "Começar agora", "Criar minha conta" → `/cadastro/`;
- "Entrar na plataforma" → `/entrar/`;
- "Ver planos", "Quero conhecer os planos" → seção de planos (`#planos`);
- "Falar com especialista", "Quero conhecer a consultoria", "Quero conversar" → **a definir (pergunta 1)**.

## 2. Seções, copy e componente

| # | Seção | Componente | Copy |
|---|---|---|---|
| 1 | Hero | Tag, título, subtítulo, 2 botões, faixa de confiança, diagrama de 5 etapas (Desafio → Investigação → Evidências → Oportunidades → Transformação) em chips com ícones | Tag "Inteligência para transformar experiências". Título "Transforme desafios em melhorias reais para clientes, pacientes, usuários e colaboradores." Subtítulo "A DM \| Experience Intelligence ajuda sua organização a compreender experiências, investigar causas, identificar oportunidades e orientar melhorias em serviços, processos, operações e produtos digitais." Botões "Começar agora" e "Falar com especialista". Complemento: ver ajuste A1 |
| 2 | Problema de mercado | 6 cards de problema com ícone; área de dados (ver pergunta 2) | Título "Experiências ruins custam caro. E quase sempre o problema não está só no atendimento." Texto e os 6 cards como enviados |
| 3 | O que é | 4 cards de valor | Título "Uma plataforma para investigar, compreender e transformar experiências." Texto e os 4 blocos como enviados |
| 4 | Para quem é | Chips de segmentos (7), de públicos (6) e de tipos de desafio (9) | Como enviado |
| 5 | Como funciona | Linha de etapas numerada (vertical no celular, horizontal no computador) | Título "Como a plataforma funciona na prática", as 5 etapas e o destaque "A plataforma conduz a jornada sem exigir que o cliente saiba aplicar métodos de Service Design." (ver A1 e A3) |
| 6 | O que o cliente obtém | 8 cards curtos com ícone | Título "Ao final, sua organização não recebe apenas respostas. Recebe direção." Entregas e texto de apoio como enviados (ver A3) |
| 7 | Plataforma × consultoria | Tabela comparativa (no celular vira dois cartões, um embaixo do outro) | Título, as 5 linhas, texto de apoio e o botão "Quero conhecer a consultoria" como enviados |
| 8 | Diferenciais | 6 cards com ícone | Como enviado (ver A1) |
| 9 | Planos (`#planos`) | 3 cards: Essential, Professional, Transformation | Título "Planos para diferentes momentos de maturidade", descrições como enviadas, preço "Em definição", botão "Quero conversar" (ver pergunta 3) |
| 10 | Perguntas frequentes | Accordion (`<details>`, abre e fecha pelo teclado e com leitor de tela) | As 8 perguntas e respostas como enviadas |
| 11 | CTA final | Bloco de destaque | Título "Pronto para transformar desafios em experiências melhores?", texto e botões "Criar minha conta" e "Falar com especialista" |
| — | Rodapé | Rodapé do site (já existente) | Sem mudança |

Ícones (lucide-react, já instalado): Target, Compass, TrendingUp, Users, HeartHandshake, Briefcase, Activity, Layers, Sparkles, MessageSquare, ClipboardList, Route.

Diretrizes de interface (do pedido): sem parágrafos longos; cards, linha de etapas, tabela, accordion e botões em destaque; botões sem degradê; mesma identidade (cores, Plus Jakarta Sans, ícone sobre base rosa clara); mobile primeiro; teste a 320, 375 e 1024 px.

## 3. Ajustes que dependem da dona do produto

- **A1. "Service Design" na interface.** O kit de UX (seção 0) pede para evitar o termo na interface; a copy enviada usa no hero ("Sem precisar dominar Service Design, pesquisa ou metodologias de inovação."), na seção 5, no diferencial "Visão multidisciplinar" e no FAQ. Numa página comercial o termo pode ajudar a vender a metodologia. Proposta: manter na landing (comercial) e continuar evitando dentro da plataforma.
- **A2. Hero diz "investigar causas".** O kit pede promessa moderada (a plataforma não garante identificar a causa). "Investigar" não é garantir, então a frase é compatível; registro só para ciência.
- **A3. Recursos ainda não disponíveis.** Hoje existem: entrada do desafio e enquadramento inicial. O plano de investigação pela IA está aprovado e é o próximo incremento; evidências, oportunidades, transformação e resultados estão no roadmap. A visão pode aparecer na landing, mas a regra do produto pede para não apresentar como pronto o que não está. Proposta: uma faixa discreta "Plataforma em fase de testes, com acesso por convite. Novas etapas são liberadas por fases." perto do hero e dos planos.

## 4. Perguntas para aprovar

1. **"Falar com especialista":** para onde leva? Opções:
   - a) a página inicial do site do estúdio (não exige mudar o site);
   - b) abrir direto o formulário de contato do site (exige mudar o site, que não altero sem autorização);
   - c) um formulário de contato na própria landing, gravando na mesma tabela de contatos do site (já ajuda a P-009).
2. **Dados de mercado:** placeholders "[Dado validado]" aparecem para quem visita. Opções:
   - a) não mostrar a área de dados até haver números com fonte (recomendado);
   - b) mostrar a área com os placeholders.
3. **Planos:** confirmar nomes (Essential, Professional, Transformation) e "Em definição" no lugar do preço. Nomes e preços são decisão comercial; ficam registrados como hipótese.
4. **A1 e A3:** aprovar as propostas acima ou ajustar.

Depois da aprovação: implementar em um incremento, testar e mostrar as telas antes de publicar. A Tela A já feita (proposta de valor curta) será substituída pela landing.

## 5. Decisões da dona do produto (21/10/2026, D-030) e o que foi implementado

1. "Falar com especialista" não será desenvolvido agora: os botões "Falar com especialista", "Quero conhecer a consultoria" e "Quero conversar" ficaram fora. No hero, o segundo botão é "Ver planos" (leva a `#planos`); o CTA final tem só "Criar minha conta".
2. Dados de mercado: pesquisados e conferidos nas fontes originais em 21/10/2026, com a fonte em cada card (link):

| Card | Fonte original | Trecho conferido |
|---|---|---|
| 63% trocariam por um concorrente depois de uma única experiência ruim | [Zendesk, CX Trends 2025](https://www.zendesk.com/newsroom/articles/2025-cx-trends-report/) (cerca de 5.100 consumidores e 5.400 profissionais, 22 países, junho e julho de 2024) | "63% willing to switch to a competitor due to just one bad experience" |
| 49% na América Latina deixariam uma marca depois de uma única experiência ruim | [PwC, Experience is everything (Future of Customer Experience Survey 2017/18)](https://www.pwc.com/ng/en/assets/pdf/experience-is-everything.pdf) | "In Latin America, 49% say they'd walk away from a brand after one bad experience" |
| Até 16% a mais no preço por uma ótima experiência | Mesmo relatório da PwC | "up to a 16% price premium on products and services" |
| 23% mais lucratividade e 10% mais fidelização nas equipes mais engajadas | [Gallup, meta-análise do Q12, 10ª edição (2020)](https://www.gallup.com/workplace/236927/employee-engagement-meta-analysis.aspx) (456 estudos, 276 organizações, 2,7 milhões de profissionais; quartil superior × inferior) | "10% in customer loyalty/engagement", "23% in profitability" |
| 41% menos defeitos de qualidade nas equipes mais engajadas | Mesma meta-análise da Gallup | "41% in quality (defects)" |
| Mais de 10 milhões de reclamações no Consumidor.gov.br em 10 anos | [Senacon / Ministério da Justiça, Boletim Consumidor.gov.br 2024](https://www.gov.br/mj/pt-br/assuntos/seus-direitos/consumidor/defesadoconsumidor/Biblioteca/boletins-1/boletim-consumidor-gov-br-2024.pdf) | "A plataforma já registrou mais de 10 milhões de reclamações" |

   Ficaram de fora números que não foi possível conferir na fonte original (ex.: o "96% de clientes mais desleais após alto esforço", atribuído à Gartner).
3. Planos: Essential, Professional e Transformation, com "Em definição" (hipótese comercial, por enquanto).
4. A landing contextualiza o produto completo, mesmo com etapas ainda em desenvolvimento (a página não está divulgada); sem a faixa de "fase de testes". O termo "Service Design" foi mantido como na copy enviada.

Ajuste de escrita: o travessão do texto da seção 2 virou parênteses (regra do site: sem "—").
