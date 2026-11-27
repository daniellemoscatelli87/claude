// Casca do painel: a casca aprovada (D-039, D-041), só com componentes do Design System Dani Moscatelli:
// - painel-shell: MenuLateralProvider, BarraSuperiorDoPainel (branca, na largura toda), MenuLateral (240/64 px, empurra
//   o conteúdo, "≡ MENU" no topo com TopoDoMenu), NavDoMenu, ItemDoMenu e GrupoDoMenu (contadores redondos do DS),
//   BotaoDeNotificacoes (contador redondo vermelho no sino) e GatilhoDaConta;
// - celular e tablet (abaixo de 1024 px): os mesmos itens num SidePanel side="left";
// - conta: DropdownMenu*; notificações: SidePanel* com LinhaDeLista e IconeComBase (painel-dados).
import * as React from "react";
import { useLocation } from "react-router-dom";
import { CalendarCheck, ClipboardList, House, LogOut, Mail, MailCheck, MailOpen, Menu, Rocket, Settings, Users, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LinhaDeLista } from "@/components/ui/linha-de-lista";
import { IconeComBase } from "@/components/ui/painel-dados";
import {
  BarraSuperiorDoPainel, BotaoDeNotificacoes, GatilhoDaConta, GrupoDoMenu, ItemDoMenu, MenuLateral, MenuLateralProvider, NavDoMenu, TopoDoMenu,
} from "@/components/ui/painel-shell";
import { Separator } from "@/components/ui/separator";
import { SidePanel, SidePanelBody, SidePanelContent, SidePanelHeader } from "@/components/ui/side-panel";
import { diaCurto } from "@/lib/formatar";
import { PAGINAS, type Pagina } from "@/rotas";
import type { Aviso, TipoDeAviso } from "@/dados/notificacoes";
import { LinkDaArea } from "./base";
import { useNotificacoes } from "./notificacoes";
import { useSessao } from "./sessao";

const ICONES: Record<string, LucideIcon> = { inicio: House, contato: Mail, reunioes: CalendarCheck, parceiros: Users, projetos: ClipboardList, lancamento: Rocket };
const ICONE_DO_AVISO: Record<TipoDeAviso, LucideIcon> = { contato: Mail, parceiro: Users, "email-aberto": MailOpen, "email-clicado": MailCheck, pesquisa: ClipboardList };

/** Menu recolhido: a mesma chave das páginas de HTML, para a escolha valer nas duas ("1" recolhido, "0" expandido). */
const CHAVE_MENU = "dm-admin-menu-recolhido";

const href = (p: Pagina) => "/admin/" + p.caminho;

/**
 * Contador de cada área do menu. O sino soma todos (contato + parceiros + e-mails abertos pelos parceiros + respostas
 * das pesquisas); os e-mails abertos ou clicados são de parceiros (abrem o perfil, aba E-mails), então entram no
 * contador de Parceiros. Assim, a soma dos contadores do menu é sempre o número do sino.
 */
function contagemDaArea(contador: string | undefined, n: Record<string, number>) {
  if (!contador) return 0;
  if (contador === "parceiros") return (n.parceiros || 0) + (n.emails || 0);
  return n[contador] || 0;
}
const ROTULO_DO_CONTADOR: Record<string, string> = { contatos: "não lidas", parceiros: "novidades", projetos: "respostas novas" };

/** Itens do menu (menu fixo e gaveta do celular): os mesmos da página de HTML, com os contadores de novidades. */
function ItensDoMenu({ ativo, aoNavegar }: { ativo: string | undefined; aoNavegar?: () => void }) {
  const { dados } = useNotificacoes();
  const n = dados.contadores as Record<string, number>;
  return (
    <NavDoMenu aria-label="Páginas da área restrita">
      <GrupoDoMenu>
        {PAGINAS.map((p) => {
          const Icone = ICONES[p.icone || ""] ?? House;
          const numero = contagemDaArea(p.contador, n);
          const rotulo = ROTULO_DO_CONTADOR[p.contador || ""] ?? "novidades";
          if (!p.sub) {
            return (
              <ItemDoMenu key={p.id} as={LinkDaArea} href={href(p)} icone={<Icone />} ativo={ativo === p.id} contador={numero} rotuloContador={rotulo} onClick={aoNavegar}>
                {p.rotulo}
              </ItemDoMenu>
            );
          }
          const dentro = ativo === p.id || p.sub.some((s) => s.id === ativo);
          return (
            <GrupoDoMenu key={p.id} expansivel padraoAberto={dentro} ativo={dentro} titulo={p.rotulo} icone={<Icone />} contador={numero} rotuloContador={rotulo}>
              {p.sub.map((s) => (
                <ItemDoMenu key={s.id + s.caminho} as={LinkDaArea} href={href(s)} ativo={ativo === s.id} onClick={aoNavegar}>
                  {s.rotulo}
                </ItemDoMenu>
              ))}
            </GrupoDoMenu>
          );
        })}
      </GrupoDoMenu>
    </NavDoMenu>
  );
}

function LinhaDoAviso({ aviso, nova, aoAbrir }: { aviso: Aviso; nova: boolean; aoAbrir: () => void }) {
  const Icone = ICONE_DO_AVISO[aviso.tipo];
  return (
    <li>
      <LinhaDeLista
        as="a"
        href={aviso.href}
        onClick={aoAbrir}
        // Mesma regra do DS em toda a área: base rosa + ícone vermelho = pede atenção (nova); base cinza = já vista.
        inicio={<IconeComBase tom={nova ? "marca" : "neutro"} redonda tamanho="sm"><Icone /></IconeComBase>}
        titulo={aviso.texto}
        descricao={[aviso.detalhe, diaCurto(aviso.quando)].filter(Boolean).join(" · ")}
        fim={nova ? <Badge variant="outline">Nova</Badge> : undefined}
        quebraAcoes={false}
      />
    </li>
  );
}

function PainelDeNotificacoes({ aberto, mudar }: { aberto: boolean; mudar: (v: boolean) => void }) {
  const { dados, carregando } = useNotificacoes();
  const sub = carregando ? "Carregando…" : dados.total ? (dados.total === 1 ? "1 item não lido" : `${dados.total} itens não lidos`) : "Tudo em dia";
  return (
    <SidePanel open={aberto} onOpenChange={mudar}>
      <SidePanelContent width="md" closeLabel="Fechar notificações">
        <SidePanelHeader title="Notificações" description={sub} />
        <SidePanelBody className="px-0 sm:px-0">
          {dados.novas.length > 0 ? (
            <section aria-label="Novas">
              <p className="px-4 pt-2 pb-2 text-body-sm font-semibold text-foreground">Novas</p>
              <ul>{dados.novas.map((a, i) => <LinhaDoAviso key={i} aviso={a} nova aoAbrir={() => mudar(false)} />)}</ul>
            </section>
          ) : (
            !carregando && <p className="p-4 text-body-sm text-muted-foreground">Nenhuma notificação nova. Mensagens, candidaturas, e-mails abertos pelos parceiros e respostas das pesquisas aparecem aqui.</p>
          )}
          {dados.vistas.length > 0 && (
            <section aria-label="Já visualizadas">
              <Separator className="my-2" />
              <p className="px-4 pt-2 pb-2 text-body-sm font-semibold text-foreground">Já visualizadas</p>
              <ul>{dados.vistas.map((a, i) => <LinhaDoAviso key={i} aviso={a} nova={false} aoAbrir={() => mudar(false)} />)}</ul>
            </section>
          )}
        </SidePanelBody>
      </SidePanelContent>
    </SidePanel>
  );
}

function MenuDaConta() {
  const { perfil, sair } = useSessao();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <GatilhoDaConta nome={perfil.nome} foto={perfil.foto} aria-label={`Perfil de ${perfil.nome}`} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>
          <span className="block">{perfil.nome}</span>
          <span className="block text-label font-normal text-muted-foreground">{perfil.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LinkDaArea href="/admin/configuracoes/">
            <Settings aria-hidden />
            Configurações
          </LinkDaArea>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void sair()}>
          <LogOut aria-hidden />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Página ativa no menu a partir do caminho do roteador. */
export function useAtivo(paginas = PAGINAS) {
  const { pathname } = useLocation();
  const c = pathname.replace(/^\/+/, "");
  for (const p of paginas) {
    for (const s of p.sub ?? []) if (s.caminho === c) return s.id;
    if (p.caminho === c) return p.id;
  }
  return undefined;
}

export function Casca({ children }: { children: React.ReactNode }) {
  const ativo = useAtivo();
  const { dados } = useNotificacoes();
  const [gaveta, setGaveta] = React.useState(false);
  const [avisosAbertos, setAvisosAbertos] = React.useState(false);

  // Cabeçalho fixo de 64 px: o foco do teclado e as âncoras nunca ficam escondidos atrás dele.
  React.useEffect(() => {
    const html = document.documentElement;
    const antes = html.style.scrollPaddingTop;
    html.style.scrollPaddingTop = "5rem";
    return () => { html.style.scrollPaddingTop = antes; };
  }, []);

  return (
    <MenuLateralProvider chave={CHAVE_MENU}>
      <div className="flex min-h-dvh flex-col bg-background">
        <BarraSuperiorDoPainel className="sticky top-0 z-30">
          <Button variant="ghost" size="icon" onClick={() => setGaveta(true)} aria-label="Abrir menu" aria-haspopup="dialog" aria-expanded={gaveta} className="size-11 lg:hidden">
            <Menu aria-hidden className="size-5" />
          </Button>
          <LinkDaArea href="/admin/" aria-label="Dani Moscatelli, ir para o Início" className="flex min-h-11 min-w-11 items-center justify-center gap-2.5 rounded-md px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <img src="/favicon-dm.png" alt="" width={32} height={32} className="size-8 shrink-0" />
            <span className="hidden whitespace-nowrap text-body font-semibold tracking-tight text-foreground min-[420px]:inline">Dani Moscatelli</span>
          </LinkDaArea>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <BotaoDeNotificacoes naoLidas={dados.total} aria-haspopup="dialog" onClick={() => setAvisosAbertos(true)} />
            <MenuDaConta />
          </div>
        </BarraSuperiorDoPainel>

        <div className="flex flex-1">
          {/* Coluna branca da altura da página toda; os itens ficam grudados logo abaixo do cabeçalho de 64 px. */}
          <MenuLateral aria-label="Menu lateral" grudarAbaixoDe={64} className="hidden lg:flex">
            <TopoDoMenu />
            <ItensDoMenu ativo={ativo} />
          </MenuLateral>
          <main className="min-w-0 flex-1">
            {/* O contêiner é a área do conteúdo, sem o respiro: as colunas dos cards seguem a largura real deles. */}
            <div className="mx-auto w-full max-w-(--content-wide) p-4 sm:p-6 lg:p-8">
              <div className="@container/conteudo">{children}</div>
            </div>
          </main>
        </div>

        <SidePanel open={gaveta} onOpenChange={setGaveta}>
          <SidePanelContent side="left" width="md" closeLabel="Fechar menu" className="sm:w-80 md:w-80">
            <SidePanelHeader title="Menu" />
            <SidePanelBody className="px-3 sm:px-3">
              <ItensDoMenu ativo={ativo} aoNavegar={() => setGaveta(false)} />
            </SidePanelBody>
          </SidePanelContent>
        </SidePanel>
        <PainelDeNotificacoes aberto={avisosAbertos} mudar={setAvisosAbertos} />
      </div>
    </MenuLateralProvider>
  );
}
