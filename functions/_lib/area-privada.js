// Páginas ainda não liberadas (Experience Intelligence 1, 2 e 3): só entra quem tem o login de administrador
// do site (mesmo e-mail e senha da área restrita /admin, conta do Supabase com app_metadata.role = "admin").
//
// Como funciona:
// - A tela de login envia e-mail e senha para /acesso-privado/entrar, que pede um token ao Supabase Auth.
// - O token fica num cookie HttpOnly (o JavaScript da página não consegue lê-lo) e vale até expirar (cerca de 1 hora).
// - A cada pedido, o token é conferido aqui mesmo: assinatura ES256 com as chaves públicas do Supabase (JWKS),
//   validade, emissor e papel de administrador. Nada de segredo guardado no Cloudflare.

export const SUPABASE_URL = 'https://lipfvnerohkaajegqvwr.supabase.co';
export const SUPABASE_CHAVE_PUBLICA = 'sb_publishable_vOvysMZ0LE2qpKIzLlcM6A_tckkDIej';
export const COOKIE = 'dm_area_privada';
const EMISSOR = `${SUPABASE_URL}/auth/v1`;

let jwksEmCache = null;
let jwksBuscadoEm = 0;

async function chavesPublicas(jwksOpcional) {
  if (jwksOpcional) return jwksOpcional;
  if (jwksEmCache && Date.now() - jwksBuscadoEm < 10 * 60 * 1000) return jwksEmCache;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`);
  if (!res.ok) throw new Error('jwks indisponível');
  jwksEmCache = await res.json();
  jwksBuscadoEm = Date.now();
  return jwksEmCache;
}

function base64urlParaBytes(s) {
  const b = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  return Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
}

// Retorna o conteúdo do token se ele for válido e de administrador; senão, null.
export async function validarTokenAdmin(token, jwksOpcional) {
  try {
    const partes = (token || '').split('.');
    if (partes.length !== 3) return null;
    const cabecalho = JSON.parse(new TextDecoder().decode(base64urlParaBytes(partes[0])));
    if (cabecalho.alg !== 'ES256') return null;
    const jwks = await chavesPublicas(jwksOpcional);
    const jwk = (jwks.keys || []).find((k) => k.kid === cabecalho.kid);
    if (!jwk) return null;
    const chave = await crypto.subtle.importKey('jwk', { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y, ext: true },
      { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, chave,
      base64urlParaBytes(partes[2]), new TextEncoder().encode(`${partes[0]}.${partes[1]}`));
    if (!ok) return null;
    const dados = JSON.parse(new TextDecoder().decode(base64urlParaBytes(partes[1])));
    const agora = Math.floor(Date.now() / 1000);
    if (typeof dados.exp !== 'number' || dados.exp <= agora) return null;
    if (dados.iss !== EMISSOR) return null;
    if (dados.aud !== 'authenticated' && !(Array.isArray(dados.aud) && dados.aud.includes('authenticated'))) return null;
    if (!dados.app_metadata || dados.app_metadata.role !== 'admin') return null;
    return dados;
  } catch {
    return null;
  }
}

export function lerCookie(request, nome) {
  const c = request.headers.get('Cookie') || '';
  for (const parte of c.split(';')) {
    const [k, ...v] = parte.trim().split('=');
    if (k === nome) return v.join('=');
  }
  return '';
}

const escapar = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Tela de login no padrão visual do site (tokens do design system).
export function paginaDeLogin(destino, mensagem = '', status = 401) {
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Acesso restrito | Dani Moscatelli Experience Design Studio</title>
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box} html,body{margin:0}
  body{font-family:"Plus Jakarta Sans",system-ui,sans-serif;background:#FAFAFA;color:#131A27;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px;-webkit-font-smoothing:antialiased}
  .cartao{width:100%;max-width:420px;background:#fff;border:1px solid rgba(19,26,39,.09);border-radius:24px;padding:32px;box-shadow:0 16px 48px rgba(13,17,25,.10),0 40px 96px rgba(13,17,25,.08)}
  img{height:44px;width:auto;display:block;margin-bottom:24px}
  .selo{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#D44D4D;background:rgba(212,77,77,.1);border-radius:999px;padding:4px 12px}
  .selo::before{content:"";width:6px;height:6px;border-radius:50%;background:#D44D4D}
  h1{font-size:24px;font-weight:800;letter-spacing:-.02em;margin:14px 0 6px}
  p{color:#627288;font-size:14px;line-height:1.6;margin:0 0 20px}
  label{display:block;font-size:13px;font-weight:600;margin:0 0 6px;color:#334155}
  input{width:100%;font:inherit;font-size:15px;padding:12px 14px;border:1px solid #CBD5E1;border-radius:12px;margin-bottom:16px;background:#fff;color:#131A27}
  input:focus{outline:none;border-color:#D44D4D;box-shadow:0 0 0 3px rgba(212,77,77,.35)}
  button{width:100%;font:inherit;font-weight:700;font-size:15px;color:#fff;background:#D44D4D;border:0;border-radius:999px;padding:13px 20px;cursor:pointer}
  button:hover{background:#B93636} button:focus-visible{outline:none;box-shadow:0 0 0 4px rgba(212,77,77,.35)}
  .erro{background:#FFF5F5;border:1px solid #FBCACA;color:#B93636;border-radius:12px;padding:10px 12px;font-size:13px;font-weight:500;margin:0 0 16px}
  .rodape{margin:20px 0 0;font-size:12px;text-align:center}
  .rodape a{color:#B93636}
</style>
</head>
<body>
<main class="cartao">
  <img src="/logo-dm.png" alt="Dani Moscatelli Experience Design Studio">
  <span class="selo">Acesso restrito</span>
  <h1>Página em preparação</h1>
  <p>Esta página ainda não está disponível ao público. Entre com o login de administrador do site.</p>
  ${mensagem ? `<p class="erro" role="alert">${escapar(mensagem)}</p>` : ''}
  <form method="post" action="/acesso-privado/entrar">
    <input type="hidden" name="destino" value="${escapar(destino)}">
    <label for="email">E-mail</label>
    <input id="email" name="email" type="email" autocomplete="username" required>
    <label for="senha">Senha</label>
    <input id="senha" name="senha" type="password" autocomplete="current-password" required>
    <button type="submit">Entrar</button>
  </form>
  <p class="rodape"><a href="/">Voltar para o site</a></p>
</main>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  });
}

// Middleware das pastas protegidas.
export async function protegerComLoginAdmin(context) {
  const token = lerCookie(context.request, COOKIE);
  const dados = await validarTokenAdmin(token);
  if (!dados) {
    const url = new URL(context.request.url);
    // Arquivos (CSS, JS, imagens) sem login: só 401, sem tela.
    const ehPagina = url.pathname.endsWith('/') || !/\.[a-z0-9]+$/i.test(url.pathname);
    if (!ehPagina) return new Response('Acesso restrito.', { status: 401, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
    return paginaDeLogin(url.pathname);
  }
  const resposta = await context.next();
  const nova = new Response(resposta.body, resposta);
  nova.headers.set('Cache-Control', 'private, no-store');
  nova.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return nova;
}

// Só aceita voltar para as pastas protegidas (evita redirecionar para fora do site).
export function destinoSeguro(destino) {
  return /^\/experience-intelligence(-2|-3)?(\/[A-Za-z0-9._\-\/]*)?$/.test(destino || '') ? destino : '/experience-intelligence/';
}
