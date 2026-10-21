# Análise do arquivo `stitch_high_fidelity_product_landing_page.zip`

## O que foi efetivamente inspecionado
O ZIP contém exportações HTML de múltiplas iterações da Home do estúdio (`dani_moscatelli_landing_page_*`), variações da página do programa de parceiros e telas temporárias “em breve”, além de imagens/assets. Foram lidos os HTML de referências como:

- `dani_moscatelli_landing_page_com_escalas_padronizadas_e_leg_veis/code.html`
- `dani_moscatelli_landing_page_header_e_hero_ajustados/code.html`
- `dani_moscatelli_landing_page_com_se_o_de_artigos_em_bento_grid/code.html`
- `dani_moscatelli_landing_page_com_gr_ficos_animados_nos_cards_2/code.html`
- `dani_moscatelli_landing_page_com_orbiting_circles_animado/code.html`

**Cuidado:** o pacote apresenta estudos e versões sucessivas; não permite estabelecer qual variante é a versão canônica em produção. O Claude deve comparar com o código atual do site, não fazer substituição cega.

## Linguagem visual identificada
- **Tipografia:** Plus Jakarta Sans; headlines de peso alto, tracking levemente negativo, títulos concisos e corpos discretos.
- **Marca:** acento vermelho editorial; no arquivo `com_se_o_de_artigos_em_bento_grid` aparece `brand.500 = #D44D4D`, `brand.600 = #C83232`; outras variações usam tons próximos (não presumir que o hexadecimal é único/canônico).
- **Neutros:** `graphite.900 = #1E242B`, `graphite.700 = #3D4653`, `graphite.500 = #6B7684`, superfícies claras próximas a `#F1F4F8`, branco e bordas suaves.
- **Layout:** container central, bastante respiro, cantos arredondados, bordas finas e sombras discretas; alto contraste de títulos.
- **Vocabulário visual:** cards, diagramas de ecossistema e órbitas, gráficos animados, etapas, blocos comparativos, botões-pílula, bento grid para conteúdo editorial e ícones.
- **Movimento:** detalhes como curvas animadas, pulse, float no hero e órbitas; devem ser **linguagem de movimento**, não componentes a repetir em toda página.
- **Tom:** estratégico, humano, editorial, consultivo; evidências e resultados de negócio sem reduzir tudo a telas.

## A IA da Home já está ocupada com este trabalho
As variações estudadas contam a narrativa institucional com conteúdos como:

1. “Transformo objetivos de negócio em experiências de alto valor...” — posicionamento profissional da consultoria.
2. “A experiência deixou de ser um diferencial...” e “Quando a tecnologia se torna replicável...” — tese macro de mercado.
3. “A experiência começa a ser construída muito antes do primeiro contato...” — visão sistêmica.
4. “Onde você está nessa jornada?” — dores gerais dos clientes.
5. “Como transformamos desafios em experiências de valor.” — abordagem do estúdio.
6. Segmentos e mercados atendidos — escopo de atuação.
7. Depoimentos/recomendações, artigos e CTA de diagnóstico — prova social e conversão institucional.

**Consequência:** na página específica da DM | Experience Intelligence, NÃO criar outra sequência “mercado → dores → método do estúdio → setores → diferenciais genéricos → depoimentos → CTA”. Isso recria uma segunda Home.

## O que pode e deve ser herdado
- Tokens, grid, tipografia, tratamento de cor, densidade editorial e acessibilidade.
- Header/footer compartilhados, se a arquitetura do site permitir.
- Linguagem das ilustrações e animações (discrição, clareza, utilidade).
- Componentes base reutilizáveis: Button, Container, Heading, Badge, Accordion, Tabs etc., **somente se pertinentes ao conteúdo**.

## O que deve ser uma gramática própria da página de produto
- **Prévia de interface/produto** em vez de fotografia editorial institucional no hero.
- **Simulação de investigação** (desafios fictícios) em vez de card genérico de dores.
- **Relação desafio → atividade → evidência → hipótese → mudança** em vez de repetir a timeline do método da Home.
- **Artefatos exploráveis** (exemplos de plano, ficha, evidências, intervenção) em vez de listar entregáveis em seis cartões iguais.
- **Explicação operacional de plataforma + consultoria** em vez de replicar uma seção de serviços.
- **Pricing transparente** e FAQ do produto, e não FAQ institucional.

## Tese de arquitetura de informação
**Home = por que o estúdio existe e como atua.**  
**Produto = o que esta solução específica permite fazer, como funciona e como contratá-la.**  
**App = executar o desafio e receber a condução.**

As três camadas devem compartilhar identidade visual, **não a mesma narrativa**.
