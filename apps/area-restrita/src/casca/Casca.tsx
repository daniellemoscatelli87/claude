// Casca do painel: menu lateral, cabeçalho com notificações e perfil, e o conteúdo no fundo cinza do DS.
// Montada só com componentes do Design System Dani Moscatelli:
// - menu lateral: Sidebar* (ui/sidebar), com Collapsible (ui/collapsible) nos grupos e SidebarMenuBadge nos contadores;
// - cabeçalho: SidebarTrigger, Button, Badge, DropdownMenu* e Avatar*;
// - notificações: SidePanel* (ui/side-panel) com LinhaDeLista (ui/linha-de-lista), Avatar e Badge.
// O DS ainda não tem a casca de painel como componente (a do site do DS e a das páginas de HTML são marcação própria):
// ver docs/engineering/ADMIN_REACT.md, peças que faltam.
import * as React from "react";
import { useLocation } from "react-router-dom";
import { Bell, CalendarCheck, ChevronDown, ChevronRight, ClipboardList, House, LogOut, Mail, MailCheck, MailOpen, Rocket, Settings, Users, type LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LinhaDeLista } from "@/components/ui/linha-de-lista";
import { Separator } from "@/components/ui/separator";
import { SidePanel, SidePanelBody, SidePanelContent, SidePanelHeader } from "@/components/ui/side-panel";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuBadge,
  SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/components/ui/utils";
import { diaCurto, iniciais } from "@/lib/formatar";
import { PAGINAS, type Pagina } from "@/rotas";
import type { Aviso, TipoDeAviso } from "@/dados/notificacoes";
import { LinkDaArea } from "./base";
import { useNotificacoes } from "./notificacoes";
import { useSessao } from "./sessao";

const ICONES: Record<string, LucideIcon> = { inicio: House, contato: Mail, reunioes: CalendarCheck, parceiros: Users, projetos: ClipboardList, lancamento: Rocket };
const ICONE_DO_AVISO: Record<TipoDeAviso, LucideIcon> = { contato: Mail, parceiro: Users, "email-aberto": MailOpen, "email-clicado": MailCheck, pesquisa: ClipboardList };

/** Menu recolhido: a mesma chave das páginas de HTML, para a escolha valer nas duas. */
const CHAVE_MENU = "dm-admin-menu-recolhido";
const lerRecolhido = () => { try { return localStorage.getItem(CHAVE_MENU) === "1"; } catch { return false; } };
const gravarRecolhido = (r: boolean) => { try { localStorage.setItem(CHAVE_MENU, r ? "1" : "0"); } catch { /* sem armazenamento: só nesta visita */ } };

const href = (p: Pagina) => "/admin/" + p.caminho;
const contagem = (n: number) => (n > 99 ? "99+" : String(n));

function ItemDoMenu({ pagina, ativo, numero }: { pagina: Pagina; ativo: string | undefined; numero: number }) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const Icone = ICONES[pagina.icone || ""] ?? House;
  const fechar = () => isMobile && setOpenMobile(false);
  // No celular a dica não aparece, mas ainda abriria uma camada que o primeiro Esc fecharia (o painel só no segundo).
  const dica = isMobile ? undefined : pagina.rotulo;
  const badge = numero > 0 && <SidebarMenuBadge aria-label={`${numero} não lidas`}>{contagem(numero)}</SidebarMenuBadge>;

  if (!pagina.sub) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={ativo === pagina.id} tooltip={dica}>
          <LinkDaArea href={href(pagina)} aria-current={ativo === pagina.id ? "page" : undefined} onClick={fechar}>
            <Icone aria-hidden />
            <span>{pagina.rotulo}</span>
          </LinkDaArea>
        </SidebarMenuButton>
        {badge}
      </SidebarMenuItem>
    );
  }
  const dentro = pagina.sub.some((s) => s.id === ativo) || ativo === pagina.id;
  // Recolhido (só ícones), o grupo leva direto ao primeiro subitem, como nas páginas de HTML.
  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={dentro} tooltip={dica}>
          <LinkDaArea href={href(pagina.sub[0])}>
            <Icone aria-hidden />
            <span>{pagina.rotulo}</span>
          </LinkDaArea>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }
  return (
    <Collapsible asChild defaultOpen={dentro} className="group/grupo">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          {/* o button base do DS é seminegrito; no menu, o grupo tem o mesmo peso dos links (peça que falta: ver ADMIN_REACT.md) */}
          <SidebarMenuButton isActive={dentro} tooltip={dica} className="font-normal data-[active=true]:font-medium">
            <Icone aria-hidden />
            <span>{pagina.rotulo}</span>
            <ChevronRight aria-hidden className={cn("ml-auto transition-transform group-data-[state=open]/grupo:rotate-90 motion-reduce:transition-none", numero > 0 && "mr-6")} />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        {badge}
        <CollapsibleContent>
          <SidebarMenuSub>
            {pagina.sub.map((s) => (
              <SidebarMenuSubItem key={s.id}>
                <SidebarMenuSubButton asChild isActive={ativo === s.id}>
                  <LinkDaArea href={href(s)} aria-current={ativo === s.id ? "page" : undefined} onClick={fechar}>
                    <span>{s.rotulo}</span>
                  </LinkDaArea>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function MenuLateral({ ativo }: { ativo: string | undefined }) {
  const { dados } = useNotificacoes();
  const n = dados.contadores as Record<string, number>;
  const { isMobile } = useSidebar();
  return (
    <Sidebar collapsible="icon" aria-label="Menu principal">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip={isMobile ? undefined : "Dani Moscatelli"}>
              <LinkDaArea href="/admin/" aria-label="Dani Moscatelli, ir para o Início">
                <img src="/favicon-dm.png" alt="" width={32} height={32} className="size-8 shrink-0" />
                <span className="font-bold">Dani Moscatelli</span>
              </LinkDaArea>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <nav aria-label="Páginas da área restrita">
              <SidebarMenu>
                {PAGINAS.map((p) => (
                  <ItemDoMenu key={p.id} pagina={p} ativo={ativo} numero={p.contador ? n[p.contador] || 0 : 0} />
                ))}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function LinhaDoAviso({ aviso, nova, aoAbrir }: { aviso: Aviso; nova: boolean; aoAbrir: () => void }) {
  const Icone = ICONE_DO_AVISO[aviso.tipo];
  return (
    <li>
      <LinhaDeLista
        as="a"
        // a linha inteira é o link (o DS aceita href em LinhaDeLista)
        href={aviso.href}
        onClick={aoAbrir}
        inicio={
          <Avatar className="size-9">
            <AvatarFallback>
              <Icone aria-hidden className="size-4" />
            </AvatarFallback>
          </Avatar>
        }
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
        <SidePanelBody>
          {dados.novas.length > 0 ? (
            <section aria-label="Novas">
              <p className="px-4 pt-4 pb-2 text-sm font-semibold text-muted-foreground">Novas</p>
              <ul>{dados.novas.map((a, i) => <LinhaDoAviso key={i} aviso={a} nova aoAbrir={() => mudar(false)} />)}</ul>
            </section>
          ) : (
            !carregando && <p className="p-4 text-sm text-muted-foreground">Nenhuma notificação nova. Mensagens, candidaturas, e-mails abertos pelos parceiros e respostas das pesquisas aparecem aqui.</p>
          )}
          {dados.vistas.length > 0 && (
            <section aria-label="Já visualizadas">
              <Separator />
              <p className="px-4 pt-4 pb-2 text-sm font-semibold text-muted-foreground">Já visualizadas</p>
              <ul>{dados.vistas.map((a, i) => <LinhaDoAviso key={i} aviso={a} nova={false} aoAbrir={() => mudar(false)} />)}</ul>
            </section>
          )}
        </SidePanelBody>
      </SidePanelContent>
    </SidePanel>
  );
}

function Cabecalho() {
  const { perfil, sair } = useSessao();
  const { dados } = useNotificacoes();
  const { state, isMobile } = useSidebar();
  const [avisosAbertos, setAvisosAbertos] = React.useState(false);
  const rotuloMenu = isMobile ? "Abrir menu" : state === "collapsed" ? "Expandir menu" : "Recolher menu";
  const rotuloSino = dados.total ? `Notificações, ${dados.total} ${dados.total === 1 ? "não lida" : "não lidas"}` : "Notificações";
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-card px-4">
      <SidebarTrigger aria-label={rotuloMenu} />
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label={rotuloSino} aria-haspopup="dialog" onClick={() => setAvisosAbertos(true)} className="relative">
          <Bell aria-hidden />
          {dados.total > 0 && (
            <Badge aria-hidden variant="secondary" className="absolute -top-1 -right-1 px-1">
              {contagem(dados.total)}
            </Badge>
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" aria-label={`Perfil de ${perfil.nome}`}>
              <Avatar className="size-8">
                <AvatarImage src={perfil.foto} alt="" />
                <AvatarFallback>{iniciais(perfil.nome)}</AvatarFallback>
              </Avatar>
              <span className="max-sm:sr-only">{perfil.nome}</span>
              <ChevronDown aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuLabel>
              <span className="block">{perfil.nome}</span>
              <span className="block text-xs font-normal text-muted-foreground">{perfil.email}</span>
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
      </div>
      <PainelDeNotificacoes aberto={avisosAbertos} mudar={setAvisosAbertos} />
    </header>
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
  const [aberto, setAberto] = React.useState(() => !lerRecolhido());
  return (
    <SidebarProvider
      open={aberto}
      onOpenChange={(v) => {
        setAberto(v);
        gravarRecolhido(!v);
      }}
    >
      <MenuLateral ativo={ativo} />
      <SidebarInset>
        <Cabecalho />
        <div className="mx-auto w-full max-w-(--content-wide) p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
