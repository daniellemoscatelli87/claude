import * as React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { baseDoRoteador } from "@/rotas";
import { BaseContext, LinkDaArea } from "@/casca/base";
import { Casca } from "@/casca/Casca";
import { ProvedorDeNotificacoes } from "@/casca/notificacoes";
import { ProvedorDeSessao, useSessao } from "@/casca/sessao";
import { DefinirSenha, Entrar, NovaSenha, SemAcesso } from "@/telas/Acesso";
import { Inicio } from "@/telas/Inicio";
import { Comunicados } from "@/telas/Comunicados";
import { Contatos } from "@/telas/Contatos";
import { Configuracoes } from "@/telas/Configuracoes";
import { Lancamento } from "@/telas/Lancamento";

function NaoEncontrada() {
  return (
    <Alert variant="info">
      <CircleAlert aria-hidden />
      <AlertTitle>Esta página ainda não está na versão nova</AlertTitle>
      <AlertDescription>
        <p>Use o menu para abrir a página na versão atual da área restrita.</p>
        <Button variant="link" asChild className="px-0">
          <LinkDaArea href="/admin/">Voltar ao Início</LinkDaArea>
        </Button>
      </AlertDescription>
    </Alert>
  );
}

/** Aviso deixado por uma página de HTML antes de trocar de página (Admin.toast com destino). */
function AvisoGuardado() {
  React.useEffect(() => {
    try {
      const t = sessionStorage.getItem("admin-toast");
      if (t) {
        sessionStorage.removeItem("admin-toast");
        toast.success(t);
      }
    } catch {
      /* sem armazenamento: sem aviso */
    }
  }, []);
  return null;
}

function Portao() {
  const { etapa, irPara } = useSessao();
  const [email, setEmail] = React.useState("");
  const base = baseDoRoteador(location.pathname);
  switch (etapa) {
    case "carregando":
      return (
        <div className="grid min-h-svh place-items-center p-4" aria-busy="true" aria-label="Carregando">
          <Skeleton className="h-96 w-full max-w-md rounded-xl" />
        </div>
      );
    case "entrar":
      return <Entrar emailInicial={email} aoEsquecer={(e) => { setEmail(e); irPara("esqueci"); }} />;
    case "esqueci":
      return <DefinirSenha emailInicial={email} aoVoltar={() => irPara("entrar")} />;
    case "nova-senha":
      return <NovaSenha />;
    case "sem-acesso":
      return <SemAcesso />;
    case "dentro":
      return (
        <BaseContext.Provider value={base}>
          <BrowserRouter basename={base}>
            <ProvedorDeNotificacoes>
              <Casca>
                <Routes>
                  <Route path="/" element={<Inicio />} />
                  <Route path="/lancamento/" element={<Lancamento />} />
                  <Route path="/configuracoes/" element={<Configuracoes />} />
                  <Route path="/comunicados/" element={<Comunicados />} />
                  <Route path="/contatos/" element={<Contatos />} />
                  <Route path="*" element={<NaoEncontrada />} />
                </Routes>
              </Casca>
            </ProvedorDeNotificacoes>
          </BrowserRouter>
        </BaseContext.Provider>
      );
  }
}

export function App() {
  return (
    <ProvedorDeSessao>
      <Portao />
      <AvisoGuardado />
      <Toaster position="bottom-center" />
    </ProvedorDeSessao>
  );
}
