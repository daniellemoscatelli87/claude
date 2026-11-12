// Protege páginas ainda não liberadas (Experience Intelligence 1, 2 e 3) com senha (HTTP Basic).
// A senha fica só no Cloudflare: projeto "danimoscatelli" → Settings → Variables and Secrets → SENHA_PAGINAS_PRIVADAS (tipo Secret).
// Sem a variável configurada, ninguém entra (falha fechada). Qualquer nome de usuário é aceito; vale a senha.

const NOME_DA_AREA = 'Area restrita - Dani Moscatelli';

function iguais(a, b) {
  const ta = new TextEncoder().encode(a);
  const tb = new TextEncoder().encode(b);
  let dif = ta.length ^ tb.length;
  const n = Math.max(ta.length, tb.length);
  for (let i = 0; i < n; i++) dif |= (ta[i] ?? 0) ^ (tb[i] ?? 0);
  return dif === 0;
}

function negar() {
  return new Response('Acesso restrito.', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${NOME_DA_AREA}", charset="UTF-8"`,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

export async function protegerComSenha(context) {
  const senha = context.env.SENHA_PAGINAS_PRIVADAS;
  if (!senha) return negar();
  const cabecalho = context.request.headers.get('Authorization') || '';
  if (!cabecalho.startsWith('Basic ')) return negar();
  let informada = '';
  try {
    const texto = new TextDecoder().decode(Uint8Array.from(atob(cabecalho.slice(6)), (c) => c.charCodeAt(0)));
    informada = texto.slice(texto.indexOf(':') + 1);
  } catch {
    return negar();
  }
  if (!iguais(informada, senha)) return negar();

  const resposta = await context.next();
  const nova = new Response(resposta.body, resposta);
  nova.headers.set('Cache-Control', 'private, no-store');
  nova.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return nova;
}
