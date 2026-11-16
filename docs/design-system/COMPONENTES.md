# Design system · componentes do produto

Início do design system da DM | Experience Intelligence (pedido da dona do produto, 21/10/2026): **sempre replicar os padrões de componentes que já existem no site do estúdio**, para manter a padronização. Código em `apps/experience-intelligence/src/design-system/`.

| Componente | Arquivo | Comportamento | Origem no site |
|---|---|---|---|
| `CampoEmail` | `campos.tsx` | Mesma validação de e-mail (`EMAIL_RE`) e sugestões de domínio ao digitar (gmail.com, outlook.com, hotmail.com, icloud.com, yahoo.com.br, live.com, uol.com.br, terra.com.br; até 4) | `src/em-breve.ts` (`sugerirEmail`) e `public/rede-parceiros/index.html` |
| `CampoTelefone` | `campos.tsx` | Máscara `(41) 99999-9999` ou `(41) 3333-4444`; mínimo de 10 dígitos; erro "Informe o telefone com DDD." | `maskPhone` no formulário de contato e na Rede de Parceiros |
| `CampoEstadoCidade` | `campos.tsx` | Estado por nome completo; a cidade só abre depois do estado, com a lista do IBGE de `/data/municipios/<UF>.json`; mensagens "Escolha o estado primeiro", "Carregando cidades…", "Selecione a cidade" e "Selecione o estado e a cidade."; em telas até 560 px, um campo embaixo do outro | Rede de Parceiros (`uf_cidade`). Os arquivos de cidades são copiados do site no build (`scripts/copiar-municipios.mjs`); a fonte continua sendo `public/data/municipios/` do site |
| `CampoSenhaNova` | `campos.tsx` | Mostrar e ocultar senha, medidor de força (Fraca, Média, Forte), requisitos (8 caracteres, letras e números) e campo "Confirmar senha" | Novo (o site não tinha); primeiro componente próprio do produto |
| `CampoSenha` | `campos.tsx` | Senha de entrada com mostrar e ocultar | Novo |
| `CampoTexto` | `campos.tsx` | Rótulo, ajuda e erro ligados ao campo (`aria-describedby`, `aria-invalid`) | Padrão de erro junto ao campo do kit de UX |
| `BarraProgresso` | `campos.tsx` | "Etapa X de N" e barra de progresso acessível (`role="progressbar"`) | Novo (cadastro em etapas, D-025) |
| `TituloEtapa` | `campos.tsx` | Título de cada etapa do cadastro com ícone vermelho (`--red`) sobre base quadrada rosa clara (`--red-tint`), 44 px, cantos arredondados (12 px). "Seus dados": `UserRound`; "Empresa ou negócio": `Building2` | Novo (mesmo estilo do ícone do card do primeiro desafio) |
| `Rodape` | `campos.tsx` | Igual ao rodapé do site: "© {ano} Dani Moscatelli • Experience Design Studio. Todos os direitos reservados." · "Curitiba - PR" · "Política de privacidade" (do site). Sem o link "Área restrita", que é da administração do site | `index.html` do site |
| `CampoCnpj` | `campos.tsx` | Máscara `00.000.000/0000-00` e validação dos dígitos (a mesma no banco) | Novo |
| `CampoConfirmacao` | `campos.tsx` | Caixa de marcação com texto (aceites e declarações), erro junto ao campo | Novo |
| `Janela` | `campos.tsx` | Conteúdo sobre a página, sem tirar a pessoa do formulário (`<dialog>` nativo; Esc, "×" ou toque fora fecham). Cabeçalho sem linha divisória: fundo graphite-50 (`#EDF0F5`) até 72% da altura e degradê até transparente (D-030) | Janela da política de privacidade da Rede de Parceiros (`.pol-dlg`); cabeçalho como o do cadastro da Rede de Parceiros e das gavetas de contato e de cadastro do site |
| Regras puras | `padroes.ts` | `EMAIL_RE`, `DOMINIOS`, `sugestoesEmail`, `maskPhone`, `ESTADOS`, `MSG`, `requisitosSenha`, `forcaSenha`, `maskCnpj`, `cnpjValido` (com testes em `tests/padroes.test.ts`) | Copiadas do site |

## Padrões do site registrados para uso futuro (ainda sem componente no produto)

| Padrão | Especificação | Origem no site |
|---|---|---|
| Accordion (perguntas frequentes) | Um item aberto por vez, todos fechados ao carregar. Card branco, borda `rgba(19,26,39,.09)`, raio 16 px, sem sombra, 12 px entre itens. Pergunta 17 px (16 px no celular), peso 600, `#131A27`, vermelha só no hover. Número `01`, `02`… 15 px, peso 600, `#D44D4D`. Seta 20 px, `#627288` fechada; vermelha e virada para cima aberta. Resposta 15 px, altura de linha 1,65, `#495669`, com divisor interno `#EDF0F5` alinhado ao texto. Padding 20 × 24 px (16 × 18 px no celular) (D-030) | Dúvidas frequentes da Rede de Parceiros (`.rx-acc-*`) e Guia de participação do Projeto Piloto (`#accordion-group`) |
| Cabeçalho de janela ou gaveta | Igual ao da `Janela` acima: fundo graphite-50 com degradê até transparente, sem linha divisória (D-030) | Cadastro da Rede de Parceiros (`.modal-topo`); gavetas de contato e de cadastro (`.gaveta-topo`) |

## Regras

1. Antes de criar um campo novo, procurar um padrão existente no site (`src/em-breve.ts`, `public/rede-parceiros/`, `public/admin/`). Se existir, replicar a regra e o texto de erro.
2. Componente novo, sem equivalente no site, entra aqui com a indicação "Novo".
3. Botões sem degradê; tipografia Plus Jakarta Sans; toque mínimo de 44 px; erro junto ao campo.
4. Descrição logo abaixo do título de uma seção: 14 px no celular (até 767 px), altura de linha 1,55, em todas as páginas (D-030).
5. Sombras: cards e itens em destaque usam a sombra do DS (`--shadow-ds-md`: `0 4px 12px rgba(13,17,25,.08), 0 12px 36px rgba(13,17,25,.06)`), nunca sombra vermelha; o destaque fica na borda. O brilho vermelho (`--shadow-btn-glow`) é só para botões (D-030).
