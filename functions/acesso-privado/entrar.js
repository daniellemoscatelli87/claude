// Recebe e-mail e senha da tela de login das páginas protegidas, autentica no Supabase Auth
// e, se a conta for de administrador, grava o token num cookie HttpOnly e volta para a página.
import { SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, COOKIE, validarTokenAdmin, paginaDeLogin, destinoSeguro } from '../_lib/area-privada.js';

export async function onRequestPost({ request }) {
  let dados;
  try {
    dados = await request.formData();
  } catch {
    return paginaDeLogin('/experience-intelligence/', 'Não foi possível ler o formulário. Tente novamente.', 400);
  }
  const destino = destinoSeguro(String(dados.get('destino') || ''));
  const email = String(dados.get('email') || '').trim();
  const senha = String(dados.get('senha') || '');
  if (!email || !senha) return paginaDeLogin(destino, 'Informe e-mail e senha.', 400);

  let res;
  try {
    res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: SUPABASE_CHAVE_PUBLICA, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: senha }),
    });
  } catch {
    return paginaDeLogin(destino, 'Não foi possível conectar agora. Tente novamente em instantes.', 503);
  }
  if (res.status === 429) return paginaDeLogin(destino, 'Muitas tentativas. Aguarde alguns minutos e tente de novo.', 429);
  if (!res.ok) return paginaDeLogin(destino, 'E-mail ou senha incorretos.', 401);

  const sessao = await res.json();
  const conteudo = await validarTokenAdmin(sessao.access_token);
  if (!conteudo) return paginaDeLogin(destino, 'Esta conta não tem acesso a esta página.', 403);

  const validade = Math.max(60, conteudo.exp - Math.floor(Date.now() / 1000));
  return new Response(null, {
    status: 303,
    headers: {
      Location: destino,
      'Set-Cookie': `${COOKIE}=${sessao.access_token}; Path=/; Max-Age=${validade}; HttpOnly; Secure; SameSite=Lax`,
      'Cache-Control': 'no-store',
    },
  });
}

export function onRequestGet() {
  return Response.redirect('https://www.danimoscatelli.com.br/experience-intelligence/', 302);
}
