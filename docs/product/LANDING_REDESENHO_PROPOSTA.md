# Landing comercial: proposta de redesenho (aguarda aprovação)

**Data:** 21/10/2026 · **Origem:** avaliação da dona do produto: "muito densa de informação, não está bonita, fluida, e não fez bom uso da diversidade de componentes para variar as sensações". · **Status:** proposta aprovada para protótipo; protótipo em `/prototipo-landing/` (não publicado, sem link), com o topo, o simulador de sintomas, a linha do tempo e a pasta de entregáveis. A copy aprovada, as cores do app, a fonte Plus Jakarta Sans e as regras (botões sem degradê, mobile primeiro, acessibilidade) continuam valendo.

## 1. Diagnóstico da versão atual

- **Tudo é card.** Quase toda seção quebra o conteúdo em caixas brancas iguais, com o mesmo arredondamento e a mesma borda. O olho não descansa e nada se destaca.
- **Mesmo ritmo em todas as seções:** etiqueta, título, parágrafo e uma grade. As 13 seções parecem uma só, repetida.
- **Texto todo visível de uma vez.** A copy é rica (é a força do produto), mas aparece inteira, no mesmo peso, sem camadas.
- **Rótulos em caixa alta em todo lugar** (etiquetas, "O que investigar" etc.), o que deixa a página mais pesada.
- **Pouco espaço em branco** entre blocos e linhas longas no computador.

## 2. Conceito: a linha de visibilidade

O produto diz: "O problema aparece na experiência. A causa pode estar em qualquer parte do serviço." No Service Design, isso tem uma imagem própria: a **linha de visibilidade**, que separa o que as pessoas vivem (acima) da operação que produz essa experiência (abaixo).

Proposta: transformar essa linha no **único elemento marcante** da página.

- No topo, um diagrama simples: um sinal percebido acima da linha (ex.: "Espera") e, abaixo dela, as camadas que podem explicá-lo (processos, equipes, sistemas, ambientes). Ao tocar em cada etapa do ciclo, as ligações mudam.
- A mesma linha volta, discreta, como divisor entre partes da página e no simulador de sintomas (sinal acima, investigação abaixo).
- Todo o resto fica calmo e disciplinado, para a linha ser lembrada.

## 3. Sistema visual

| Papel | Cor (já existe no app) |
|---|---|
| Tinta (títulos, faixas escuras) | `#0f172a` |
| Papel (fundo principal) | `#ffffff` |
| Névoa (faixas de respiro) | `#f7f7f9` |
| Rubor (destaques suaves, linha de visibilidade) | `#fdeeee` |
| Sinal (botões, links, números) | `#b83a3a` |
| Acento (só formas grandes: a linha, pontos do diagrama) | `#d44d4d` |

- **Tipografia:** só Plus Jakarta Sans, com contraste forte de tamanho e peso: títulos grandes (até 56 px no computador, 34 px no celular), corpo em 17 a 18 px, rótulos em letra normal (sem caixa alta). Linhas de no máximo 60 a 65 caracteres.
- **Alinhamento:** à esquerda, editorial. Só o fechamento fica centralizado.
- **Espaço:** seções com o dobro do respiro atual; menos itens visíveis por vez.
- **Movimento:** um único momento orquestrado, o desenho da linha no topo ao abrir a página, desligado para quem pede movimento reduzido. O resto só reage ao toque.

## 4. Cada seção com uma sensação diferente

| Seção | Hoje | Proposta | Sensação |
|---|---|---|---|
| 01 Topo | Texto + caixa com abas | Título grande à esquerda; à direita (embaixo no celular), o diagrama da linha de visibilidade com o ciclo. Texto de apoio menor | Clareza e assinatura |
| 02 Dados | 3 cards | Três números grandes soltos sobre a página, com o contexto ao lado e a fonte embaixo, sem caixas | Impacto |
| 02 Sintomas | Abas + 4 blocos de texto | **Simulador na linha de visibilidade:** o sinal escolhido fica acima da linha; abaixo, "O que investigar", "Como descobrir" e "Onde transformar" abrem como camadas, uma por toque; a pergunta orientadora fecha em destaque | Descoberta |
| 03 Categoria | Círculos + 3 cards | Três camadas empilhadas (Pessoas, Serviços e operação, Resultados) como faixas horizontais ligadas pela linha, sem cards | Estrutura |
| 04 Como funciona | Abas + painel | **Linha do tempo vertical**: no computador, a etapa ativa fica fixa à esquerda enquanto o texto passa; no celular, uma etapa por vez com o número grande; "O que você faz" e "O que a plataforma organiza" lado a lado | Progresso |
| 05 Demonstração | Faixa escura com abas | Faixa escura em tela cheia como um "caderno de caso": o desafio em citação grande; o percurso em 4 marcos ligados | Imersão |
| 06 Entregáveis | Grade de 6 cards + painel | **Trilha horizontal de documentos** que se sobrepõem levemente (como uma pasta de caso); o escolhido sobe e abre ao lado; no celular, lista com o detalhe abrindo logo abaixo do item | Tangibilidade |
| 07 Aplicações | Dois grupos de chips + resultado | Painel de duas colunas tipo "monte seu cenário": escolhas à esquerda, cenário à direita, com mais respiro | Personalização |
| 08 Diferenciais | 6 cards | Lista em duas colunas com ícone grande e linhas finas, sem caixas; o exemplo abre embaixo do item | Leveza |
| 09 Plataforma + consultoria | 2 cards | Duas metades de tela cheia (clara e escura) | Contraste |
| 10 Responsabilidade | Faixa escura com 3 cards | Três frases curtas e grandes, sem caixas | Confiança |
| 11 Planos | 3 cards | 3 colunas finas com linhas divisórias, preço em destaque tipográfico | Sobriedade |
| 12 FAQ | Acordeão em caixas | Acordeão só com linhas divisórias | Simplicidade |
| 13 Fechamento | Faixa escura | Título bem grande centralizado, a linha de visibilidade fechando a página | Convite |

## 5. Como reduzir a densidade sem cortar a copy

- **Camadas:** o essencial aparece primeiro (título e uma frase); os textos longos ficam a um toque ("Ler mais" ou abrir a camada). Todo o texto aprovado continua na página.
- **Menos rótulos:** os títulos das partes ("Sinal percebido" etc.) ficam como texto normal pequeno, sem caixa alta.
- **Uma coisa por vez** nos componentes interativos (simulador, linha do tempo, trilha).

## 6. Proposta de execução

1. Protótipo das três peças que a dona do produto destacou (simulador de sintomas, linha do tempo "Como funciona" e trilha de entregáveis), mais o topo, numa rota de teste não publicada, com capturas no celular e no computador.
2. Com o protótipo aprovado, aplicar o mesmo sistema às demais seções.
3. Repetir os testes (acessibilidade, teclado, contraste, 320 a 1280 px) antes de pedir autorização para publicar.

## 7. Protótipo (21/10/2026)

- Rota de teste `src/app/prototipo-landing/page.tsx`, componentes em `src/components/prototipo/` (`Prototipo.tsx`, `prototipo.css`). A landing atual não foi alterada.
- Rótulos do diagrama do topo tirados da seção 03 da especificação ("o que as pessoas vivenciam"; "processos, equipes, decisões, ambientes e tecnologias") e o termo "linha de visibilidade". O texto de apoio do topo fica a um toque ("Como a plataforma faz isso").
- Verificado no navegador a 375 e 1280 px: sem rolagem lateral e sem erros; simulador desce as 3 camadas e mostra a pergunta orientadora; linha do tempo abre a etapa no lugar (celular) ou ao lado (computador); pasta abre o documento no lugar (celular) ou abaixo da fileira (computador).
