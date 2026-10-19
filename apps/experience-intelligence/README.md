# DM | Experience Intelligence (aplicação)

Plataforma em que uma organização conta o que quer melhorar e é guiada, passo a passo, a entender a situação. Este é o primeiro incremento (Cortes 1 e 2). A visão completa e as regras estão em [`../../docs/`](../../docs/README.md).

## O que já funciona neste incremento

1. Criar conta e entrar.
2. Criar a organização (quem cria passa a administrá-la).
3. Responder "O que você quer melhorar?". O texto fica guardado exatamente como foi escrito.
4. A IA sugere uma organização do desafio (nome, quem vive a situação, onde acontece, o que deveria melhorar, o que já se sabe e o que não se sabe). É só sugestão: você revisa, edita e confirma.
5. Perguntas de entendimento, uma por vez, com a opção "Não sei" e quatro caminhos práticos para seguir.
6. Tudo fica salvo e é retomado depois de atualizar a página ou entrar de novo.
7. Uma organização não vê nem altera nada de outra.

O que ainda não existe está no [Product Backlog](../../docs/product/PRODUCT_BACKLOG.md).

## Como está organizado

```text
src/
  app/              telas (início, novo desafio, desafio)
  components/       partes das telas (formulários, pergunta, revisão)
  domain/
    challenge/      regras do desafio e das perguntas, sem depender de tela ou banco
    methodology/    contratos do próximo módulo (somente tipos)
  application/      casos de uso (criar organização, criar desafio, confirmar, responder)
  infrastructure/   conexão com o Supabase
supabase/
  migrations/       mudanças no banco, versionadas
  tests/            teste de isolamento entre organizações no banco
  functions/        função da IA que sugere a organização do desafio
tests/              testes automatizados das regras
```

Pressupostos registrados no [Decision Log](../../docs/decisions/DECISION_LOG.md): mesmo projeto Supabase do site (D-006), IA desde o primeiro incremento (D-007) e site estático com escrita apenas por funções do banco (D-008).

## Rodar no computador (para quem programa)

Pré-requisito: Node.js 22.

```bash
cd apps/experience-intelligence
npm ci
npm run dev        # abre em http://localhost:3000
npm test           # testes das regras
npm run typecheck  # verificação de tipos
npm run lint       # verificação de estilo
npm run build      # gera o site estático na pasta out/
```

Não é preciso configurar nada para rodar: o endereço do Supabase e a chave publicável (pública por definição) já vêm no código. Para usar outro projeto, crie um arquivo `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Nunca coloque chaves secretas neste arquivo nem no código.

## Banco de dados

- Migração: `supabase/migrations/20261019120000_fundacao_e_desafio.sql`.
- Teste de isolamento: `supabase/tests/rls_isolation.sql`. Ele roda no banco dentro de uma transação desfeita no final (nada fica gravado) e termina com "OK" ou com "FALHOU: motivo".
- A chave da IA (`GEMINI_API_KEY`) fica nos segredos das funções do Supabase, nunca no código.

## Publicar

O passo a passo de publicação (segundo site no Netlify e ajustes de login no Supabase) é feito com a dona do produto, um passo por vez, e fica registrado no [Implementation Log](../../docs/engineering/IMPLEMENTATION_LOG.md).
