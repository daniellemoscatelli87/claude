// Onde a sessão fica guardada: a mesma regra e as mesmas chaves das páginas de HTML (public/admin/admin.js),
// para a sessão valer nas duas enquanto o corte é feito página a página.
// "Permanecer conectado" marcado: localStorage (renovada até clicar em Sair). Desmarcado: sessionStorage (termina ao fechar).
export const CHAVE_SESSAO = "dm-admin-auth";
export const CHAVE_LEMBRAR = "dm-admin-remember";

type Armazem = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const seguro = <T,>(fn: () => T, reserva: T): T => {
  try {
    return fn();
  } catch {
    return reserva;
  }
};

export function criarArmazenamento(local: Armazem, sessao: Armazem) {
  const lembrar = () => seguro(() => local.getItem(CHAVE_LEMBRAR) !== "0", true);
  return {
    lembrar,
    definirLembrar: (sim: boolean) => seguro(() => local.setItem(CHAVE_LEMBRAR, sim ? "1" : "0"), undefined),
    getItem: (k: string) => seguro(() => local.getItem(k) ?? sessao.getItem(k), null),
    setItem: (k: string, v: string) =>
      seguro(() => {
        const [fica, sai] = lembrar() ? [local, sessao] : [sessao, local];
        fica.setItem(k, v);
        sai.removeItem(k);
      }, undefined),
    removeItem: (k: string) =>
      seguro(() => {
        local.removeItem(k);
        sessao.removeItem(k);
      }, undefined),
  };
}
