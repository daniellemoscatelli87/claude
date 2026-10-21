# Design system · componentes do produto

Início do design system da DM | Experience Intelligence (pedido da dona do produto, 21/10/2026): **sempre replicar os padrões de componentes que já existem no site do estúdio**, para manter a padronização. Código em `apps/experience-intelligence/src/design-system/`.

| Componente | Arquivo | Comportamento | Origem no site |
|---|---|---|---|
| `CampoEmail` | `campos.tsx` | Mesma validação de e-mail (`EMAIL_RE`) e sugestões de domínio ao digitar (gmail.com, outlook.com, hotmail.com, icloud.com, yahoo.com.br, live.com, uol.com.br, terra.com.br; até 4) | `src/em-breve.ts` (`sugerirEmail`) e `public/rede-parceiros/index.html` |
| `CampoTelefone` | `campos.tsx` | Máscara `(41) 99999-9999` ou `(41) 3333-4444`; mínimo de 10 dígitos; erro "Informe o telefone com DDD." | `maskPhone` no formulário de contato e na Rede de Parceiros |
| `CampoEstadoCidade` | `campos.tsx` | Estado por nome completo; a cidade só abre depois do estado, com a lista do IBGE de `/data/municipios/<UF>.json`; mensagens "Escolha o estado primeiro", "Carregando cidades…", "Selecione a cidade" e "Selecione o estado e a cidade."; em telas até 560 px, um campo embaixo do outro. A cidade usa `CampoBusca` (busca digitando); o estado segue como lista | Rede de Parceiros (`uf_cidade`). Os arquivos de cidades são copiados do site no build (`scripts/copiar-municipios.mjs`); a fonte continua sendo `public/data/municipios/` do site |
| `CampoBusca` | `campos.tsx` | Lista com busca digitando: filtra sem diferenciar acentos e maiúsculas (`buscaNormalizada` em `padroes.ts`), setas, Enter e Esc no teclado, "Nenhum resultado. Confira a grafia."; só aceita valores da lista e, ao sair sem escolher, volta para a opção anterior. Acessível como `combobox` | Novo (pedido da dona do produto) |
| `CampoSenhaNova` | `campos.tsx` | Mostrar e ocultar senha, medidor de força (Fraca, Média, Forte), requisitos (8 caracteres, letras e números) e campo "Confirmar senha" | Novo (o site não tinha); primeiro componente próprio do produto |
| `CampoSenha` | `campos.tsx` | Senha de entrada com mostrar e ocultar | Novo |
| `CampoTexto` | `campos.tsx` | Rótulo, ajuda e erro ligados ao campo (`aria-describedby`, `aria-invalid`) | Padrão de erro junto ao campo do kit de UX |
| `BarraProgresso` | `campos.tsx` | "Etapa X de N" e barra de progresso acessível (`role="progressbar"`) | Novo (cadastro em etapas, D-025) |
| `TituloEtapa` | `campos.tsx` | Título de cada etapa do cadastro com ícone vermelho (`--red`) sobre base quadrada rosa clara (`--red-tint`), 44 px, cantos arredondados (12 px). "Seus dados": `UserRound`; "Empresa ou negócio": `Building2` | Novo (mesmo estilo do ícone do card do primeiro desafio) |
| `Rodape` | `campos.tsx` | Igual ao rodapé do site: "© {ano} Dani Moscatelli • Experience Design Studio. Todos os direitos reservados." · "Curitiba - PR" · "Política de privacidade" (do site). Sem o link "Área restrita", que é da administração do site | `index.html` do site |
| `CampoCnpj` | `campos.tsx` | Máscara `00.000.000/0000-00` e validação dos dígitos (a mesma no banco) | Novo |
| `CampoConfirmacao` | `campos.tsx` | Caixa de marcação com texto (aceites e declarações), erro junto ao campo | Novo |
| `Janela` | `campos.tsx` | Conteúdo sobre a página, sem tirar a pessoa do formulário (`<dialog>` nativo; Esc, "×" ou toque fora fecham) | Janela da política de privacidade da Rede de Parceiros (`.pol-dlg`) |
| Regras puras | `padroes.ts` | `EMAIL_RE`, `DOMINIOS`, `sugestoesEmail`, `maskPhone`, `ESTADOS`, `MSG`, `requisitosSenha`, `forcaSenha`, `maskCnpj`, `cnpjValido` (com testes em `tests/padroes.test.ts`) | Copiadas do site |

## Regras

1. Antes de criar um campo novo, procurar um padrão existente no site (`src/em-breve.ts`, `public/rede-parceiros/`, `public/admin/`). Se existir, replicar a regra e o texto de erro.
2. Componente novo, sem equivalente no site, entra aqui com a indicação "Novo".
3. Botões sem degradê; tipografia Plus Jakarta Sans; toque mínimo de 44 px; erro junto ao campo.
