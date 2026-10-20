// Avatar do cabeçalho.

/** Iniciais para o avatar a partir do e-mail (a conta ainda não tem nome nem foto). */
export function iniciais(email: string | undefined): string {
  const nome = (email ?? "").split("@")[0].replace(/[^a-zA-ZÀ-ÿ]+/g, " ").trim();
  if (!nome) return "?";
  const partes = nome.split(" ");
  return (partes.length > 1 ? partes[0][0] + partes[1][0] : nome.slice(0, 2)).toUpperCase();
}
