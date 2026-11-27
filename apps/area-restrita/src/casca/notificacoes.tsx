import * as React from "react";
import { carregarNotificacoes, SEM_NOTIFICACOES, type Notificacoes } from "@/dados/notificacoes";

type Contexto = { dados: Notificacoes; carregando: boolean; recarregar: () => void };
const NotificacoesContext = React.createContext<Contexto>({ dados: SEM_NOTIFICACOES, carregando: true, recarregar: () => {} });
export const useNotificacoes = () => React.useContext(NotificacoesContext);

export function ProvedorDeNotificacoes({ children }: { children: React.ReactNode }) {
  const [dados, setDados] = React.useState(SEM_NOTIFICACOES);
  const [carregando, setCarregando] = React.useState(true);
  const recarregar = React.useCallback(() => {
    setCarregando(true);
    void carregarNotificacoes().then((n) => {
      setDados(n);
      setCarregando(false);
    });
  }, []);
  React.useEffect(recarregar, [recarregar]);
  const valor = React.useMemo(() => ({ dados, carregando, recarregar }), [dados, carregando, recarregar]);
  return <NotificacoesContext.Provider value={valor}>{children}</NotificacoesContext.Provider>;
}
