# Instruções para Claude Code — Página de produto DM | Experience Intelligence

## Objetivo
Criar uma **página pública específica de produto**, acessada através do menu e da seção “Soluções” da Home de Dani Moscatelli | Experience Design Studio. Compartilhar a identidade visual da marca, **sem duplicar a arquitetura de informação e os componentes na mesma sequência da Home**.

## O problema a corrigir
A implementação anterior interpretou a Home como template. Isso gerou repetição de discurso institucional e de estruturas gráficas. A Home apresenta o estúdio; a página de produto deve **demonstrar** o SaaS e apoiar decisão de interesse/contratação.

## Obrigatório ANTES de programar
1. Inspecione o código atual do site e localize Home, seção “Soluções”, menu, header, footer, design tokens e componentes-base.
2. Trate o ZIP `stitch_high_fidelity_product_landing_page.zip` como **referência exploratória**; ele contém muitas iterações, não uma única fonte canônica.
3. Compare a Home com a proposta em `02-CONCEITO-ARQUITETURA-E-COPY.md`. Faça mapa `já dito na Home → não repetir no produto`.
4. Proponha estrutura de rotas: uma página interna do site para o produto, login/auth no app separado. Nunca crie outro site institucional ou use `/` do app como cópia da Home.
5. Apresente um plano de componentes com justificativa por trabalho cognitivo, não por semelhança com a Home.
6. Liste possíveis conflitos com a landing anterior, apontando o que substituir, adaptar e preservar. Não sobrescrever decisões D-020 a D-023 nem alterar o Discovery.

## Direção aprovada para análise
- **Copy de referência:** `02-CONCEITO-ARQUITETURA-E-COPY.md`, com dez seções, em vez da landing genérica de catorze seções.
- **Experiência nuclear:** simulador fictício + instrumento guiado, workspace de artefatos e mapa da experiência à operação.
- **Produto autônomo + consultoria:** dois caminhos complementares e não obrigatórios.
- **Área de pricing:** reservar com condições “em definição”, sem preços criados.
- **Acesso atual:** somente convidados, com CTA de interesse funcional e login separado.
- **Não duplicar** dados de mercado, manifesto institucional, lista completa de segmentos, depoimentos e metodologia da Home.

## Limites de implementação
- Não alterar banco de dados, Supabase, IAM, funções do Gemini, configurações do RAG, rotas de login da aplicação nem políticas de privacidade.
- Não consumir IA na landing de marketing: cenários 100% simulados, estáticos e identificados.
- Sem novas bibliotecas pagas, integrações de formulário ou captura de dados sem aprovação.
- Não publicar nem realizar merge sem autorização.

## Entregáveis que você deve apresentar para aprovação
1. Matriz de **Home vs. página de produto**, com sobreposições evitadas.
2. Wireframe textual para **desktop e mobile**, mostrando a lógica e hierarquia (não apenas lista de componentes).
3. Tabela de seções com conteúdo, componente, interação, CTA e resultado desejado.
4. Lista de componentes **reutilizados** e **novos**, com razão para cada escolha.
5. Definição de rotas, destinos reais dos CTAs, fontes de conteúdo, aviso de estágio do produto e planos em definição.
6. Critérios de aceite/testes visuais, acessibilidade e desempenho.

## Testes de aceite depois de autorizada a implementação
- Visitante vindo de “Soluções” entende em segundos **o que o produto faz**.
- Simulador altera efetivamente investigação conforme o desafio; sem chamar IA.
- Componentes não copiam a mesma ordenação/forma de apresentação da Home.
- Artefatos são exemplos concretos, com hipótese e evidência diferenciadas.
- Existe seção de plataforma vs consultoria e pricing honesto.
- CTAs têm destino real; auth é separada; nenhum cadastro ou coleta fictícios.
- Funciona em touch, teclado, mobile; sem scroll horizontal involuntário; movimentos reduzidos respeitados.
- Home, app e o site atual permanecem funcionalmente inalterados salvo links aprovados.

## Procedimento de comunicação
A proprietária está trabalhando pelo celular. Apresente cada decisão de modo objetivo, sem exigir edições manuais de código. Primeiro entregue a proposta visual e o diagnóstico de conflito; **aguarde aprovação antes de programar ou publicar**.
