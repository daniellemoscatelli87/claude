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
8. Fase de testes com acesso por convite: só e-mails da lista de teste (confirmados) ou a master usam a plataforma.
9. A IA tem custo controlado: a sugestão fica guardada por desafio (recarregar a página não chama a IA de novo), há limites por desafio, por pessoa por dia e da plataforma por dia, e uma chave para desligar a IA.

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

- Migrações: pasta `supabase/migrations/`, aplicadas em ordem.
- Testes no banco: `supabase/tests/rls_isolation.sql` (isolamento), `master_access.sql` (acesso master) e `controlled_access_ai_limits.sql` (convite e limites da IA). Rodam dentro de uma transação desfeita no final (nada fica gravado) e terminam com "OK" ou com "FALHOU: motivo".
- Reversão: pasta `supabase/rollback/`, com um arquivo por migração e as versões anteriores da função da IA.
- A chave da IA (`GEMINI_API_KEY`) fica nos segredos das funções do Supabase, nunca no código.

### Fase de testes: convidar, remover e limites da IA

Feito no SQL Editor do Supabase (só quem administra o projeto):

```sql
-- convidar (e-mail em minúsculas; a pessoa precisa confirmar o e-mail da conta)
insert into public.ei_testers (email, note) values ('pessoa@empresa.com', 'teste piloto');
-- remover o convite
delete from public.ei_testers where email = 'pessoa@empresa.com';
-- a IA está desligada desde 20/10/2026 (D-017); religar só depois de revisar o tratamento de dados do Gemini
update public.ei_settings set ai_enabled = true where id;
-- desligar de novo
update public.ei_settings set ai_enabled = false where id;
-- ajustar limites (padrão: 3 por desafio, 20 por pessoa por dia, 100 na plataforma por dia)
update public.ei_settings set ai_per_challenge = 3, ai_per_user_day = 20, ai_global_day = 100 where id;
-- uso da IA nas últimas 24 horas
select status, count(*) from public.ai_usage where created_at > now() - interval '1 day' group by status;
```

## Publicar

O passo a passo de publicação (segundo site no Netlify e ajustes de login no Supabase) é feito com a dona do produto, um passo por vez, e fica registrado no [Implementation Log](../../docs/engineering/IMPLEMENTATION_LOG.md).
