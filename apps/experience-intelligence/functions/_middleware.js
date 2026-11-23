// Acesso só com senha (decisão da dona do produto, 23/11/2026, na mudança do Netlify para o Cloudflare): enquanto o app
// está em testes, todo o DM | Experience Intelligence (app.danimoscatelli.com.br) pede usuário e senha antes de qualquer
// página ou arquivo. Depois vem o login por convite do próprio app.
// Roda no Cloudflare Pages (Functions), antes do conteúdo: sem a senha certa, nada do site é enviado.
//
// Configuração no painel do Cloudflare (Workers & Pages › dm-experience-intelligence › Settings › Variables and Secrets):
//   SITE_SENHA   (tipo Secret) senha de acesso. Sem ela, o site fica fechado para todos.
//   SITE_USUARIO (opcional)    nome de usuário; se não existir, vale "dani".
// Para abrir o site ao público no lançamento, basta apagar este arquivo.

const REINO = "DM Experience Intelligence (acesso restrito)";

/** Compara dois textos sem revelar, pelo tempo de resposta, quantos caracteres batem. */
function iguais(a, b) {
  const ta = new TextEncoder().encode(a);
  const tb = new TextEncoder().encode(b);
  let diferenca = ta.length ^ tb.length;
  for (let i = 0; i < Math.max(ta.length, tb.length); i++) diferenca |= (ta[i] ?? 0) ^ (tb[i] ?? 0);
  return diferenca === 0;
}

/** Lê "Authorization: Basic base64(usuario:senha)". */
function credenciais(request) {
  const cabecalho = request.headers.get("Authorization") || "";
  const [tipo, valor] = cabecalho.split(" ");
  if (!tipo || tipo.toLowerCase() !== "basic" || !valor) return null;
  try {
    const bytes = Uint8Array.from(atob(valor), (c) => c.charCodeAt(0));
    const texto = new TextDecoder().decode(bytes);
    const i = texto.indexOf(":");
    if (i < 0) return null;
    return { usuario: texto.slice(0, i), senha: texto.slice(i + 1) };
  } catch {
    return null;
  }
}

function negar(mensagem, pedirSenha = true) {
  const cabecalhos = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
  };
  if (pedirSenha) cabecalhos["WWW-Authenticate"] = `Basic realm="${REINO}", charset="UTF-8"`;
  return new Response(mensagem, { status: pedirSenha ? 401 : 503, headers: cabecalhos });
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const senha = env.SITE_SENHA;
  // Sem senha configurada, o site fica fechado (nunca aberto por engano).
  if (!senha) return negar("Acesso restrito: a senha do site ainda não foi configurada.", false);
  const usuario = env.SITE_USUARIO || "dani";
  const c = credenciais(request);
  if (!c || !(iguais(c.usuario, usuario) & iguais(c.senha, senha))) {
    return negar("Acesso restrito. Informe o usuário e a senha para entrar.");
  }
  const resposta = await next();
  // Páginas protegidas não ficam guardadas em caches compartilhados nem são indexadas.
  const protegida = new Response(resposta.body, resposta);
  protegida.headers.set("Cache-Control", "private, no-store");
  protegida.headers.set("X-Robots-Tag", "noindex, nofollow");
  return protegida;
}
