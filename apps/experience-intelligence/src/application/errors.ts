// Mensagens de erro em linguagem simples.
export class AppError extends Error {}

export function mensagemDeErro(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : String(e ?? "");
  if (/invalid login credentials/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/email not confirmed/i.test(msg)) return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  if (/user already registered/i.test(msg)) return "Já existe uma conta com este e-mail. Use a opção Entrar.";
  if (/password should be at least/i.test(msg)) return "A senha precisa ter pelo menos 8 caracteres.";
  if (/rate limit/i.test(msg)) return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.";
  if (/failed to fetch|network/i.test(msg)) return "Sem conexão com o servidor. Verifique a internet e tente de novo.";
  if (e instanceof AppError) return msg;
  // Mensagens das funções do banco já vêm em português.
  if (/[áéíóúãõç]/i.test(msg) && msg.length < 200) return msg;
  return "Não foi possível concluir agora. Tente de novo.";
}
