"use client";
// Moldura das telas no padrão de painel do Design System Dani Moscatelli: cabeçalho branco na largura toda, com o
// perfil no cabeçalho; conteúdo sobre o fundo cinza claro; cards só com borda; título da página fora dos cards.
// Logado: ícone DM (o mesmo da Home do site), divisor e "Experience Intelligence" à esquerda; à direita, avatar com seta
// que abre o menu de perfil (menu suspenso do DS). Rodapé igual ao do site do estúdio, com copyright.
import { AlertCircle, Building2, CheckCircle2, ChevronDown, LogOut, ShieldUser, TriangleAlert, UserRound } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/infrastructure/supabase";
import { useSession } from "./session";
import { isMaster } from "@/application/master";
import { iniciais } from "./avatar";
import { displayName } from "@/application/profile";
import { Rodape } from "@/design-system/campos";
import { classeLink } from "@/design-system/classes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/components/ui/utils";

export function Shell({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  return (
    <>
      <header className="w-full border-b border-border bg-card">
        <div className="flex min-h-16 items-center justify-between gap-3 px-[var(--grid-margin)] py-2">
          {session ? (
            <>
              <Link href="/" className="inline-flex min-w-0 items-center gap-3 rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none" aria-label="Experience Intelligence, início">
                <img src="/logo-dm-icone.png" alt="" width={32} height={37} className="block h-[34px] w-auto" />
                <span className="min-h-7 w-px self-stretch bg-border" aria-hidden="true" />
                <span className="truncate font-extrabold tracking-[-0.01em] text-primary-text">Experience Intelligence</span>
              </Link>
              <MenuPerfil />
            </>
          ) : (
            <Link href="/" className="rounded-sm font-extrabold tracking-[-0.01em] text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none">
              DM | <span className="text-primary-text">Experience Intelligence</span>
            </Link>
          )}
        </div>
      </header>
      <main className="w-full flex-1 pt-7 pb-16">
        <div className="ds-container-reading flex flex-col gap-4">{children}</div>
      </main>
      <Rodape />
    </>
  );
}

function MenuPerfil() {
  const { session, organizations, current, profile, selectOrganization } = useSession();
  const email = session?.user.email;
  const nome = displayName(session, profile);
  const item = "min-h-10 cursor-pointer gap-2.5 px-3 font-semibold [&_svg]:size-[18px]";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="group inline-flex min-h-11 items-center gap-1 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none data-[state=open]:bg-accent">
        <Avatar className="size-9" aria-hidden="true">
          <AvatarFallback className="bg-primary-muted text-sm font-extrabold text-primary-text">{iniciais(nome ?? email)}</AvatarFallback>
        </Avatar>
        <ChevronDown className="size-4 transition-transform duration-150 group-data-[state=open]:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
        <span className="sr-only">Abrir opções de perfil</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-[264px] max-w-[calc(100vw-32px)]">
        <DropdownMenuLabel className="flex items-center gap-3 px-3 py-2.5 font-normal">
          <Avatar className="size-11" aria-hidden="true">
            <AvatarFallback className="bg-primary-muted text-base font-extrabold text-primary-text">{iniciais(nome ?? email)}</AvatarFallback>
          </Avatar>
          <span className="min-w-0">
            <span className="block font-extrabold [overflow-wrap:anywhere] text-foreground">{nome ?? email}</span>
            {current && <span className="block text-[0.8125rem] text-muted-foreground">{current.name}</span>}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className={item}><Link href="/perfil/"><UserRound aria-hidden="true" /> Meus dados</Link></DropdownMenuItem>
        {current && <DropdownMenuItem asChild className={item}><Link href="/organizacao/"><Building2 aria-hidden="true" /> Empresa ou negócio</Link></DropdownMenuItem>}
        {organizations.length > 1 && current && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="px-3 text-[0.8125rem] font-semibold text-muted-foreground">Empresa ou negócio</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={current.id} onValueChange={(id) => { selectOrganization(id); location.href = "/"; }}>
              {organizations.map((o) => <DropdownMenuRadioItem key={o.id} value={o.id} className="min-h-10 cursor-pointer">{o.name}</DropdownMenuRadioItem>)}
            </DropdownMenuRadioGroup>
          </>
        )}
        {session && isMaster(session) && <DropdownMenuItem asChild className={item}><Link href="/master/"><ShieldUser aria-hidden="true" /> Área master</Link></DropdownMenuItem>}
        <DropdownMenuSeparator />
        <DropdownMenuItem className={item} onSelect={async () => { await supabase().auth.signOut(); location.href = "/"; }}>
          <LogOut aria-hidden="true" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Título da página (fora dos cards). */
export function Titulo({ children, className }: { children: React.ReactNode; className?: string }) {
  return <Heading level={1} className={cn("m-0 text-[1.75rem] leading-tight sm:text-[2.125rem]", className)}>{children}</Heading>;
}

/** Título de seção dentro de um card. */
export function TituloCard({ children, id, className }: { children: React.ReactNode; id?: string; className?: string }) {
  return <Heading level={2} size="card" id={id} className={cn("m-0", className)}>{children}</Heading>;
}

/** Texto de apoio abaixo do título. */
export function Lead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("m-0 text-base leading-relaxed text-muted-foreground", className)}>{children}</p>;
}

/** Mensagens de erro, sucesso e aviso: Alerta do DS, com ícone (a cor nunca é o único sinal). */
export function Mensagem({ tipo, children, id }: { tipo: "erro" | "ok" | "aviso"; children: React.ReactNode; id?: string }) {
  const Icone = tipo === "erro" ? AlertCircle : tipo === "ok" ? CheckCircle2 : TriangleAlert;
  return (
    <Alert id={id} variant={tipo === "erro" ? "error" : tipo === "ok" ? "success" : "warning"} role={tipo === "erro" ? "alert" : tipo === "ok" ? "status" : "note"}>
      <Icone aria-hidden="true" />
      <AlertDescription className="text-[0.875rem] text-foreground">{children}</AlertDescription>
    </Alert>
  );
}

/** Link de volta ao topo das telas internas. */
export function Voltar({ href, children }: { href: string; children: React.ReactNode }) {
  return <p className="m-0"><Link href={href} className={classeLink}>{children}</Link></p>;
}

/** Card do DS sobre o fundo da página: só borda, sem sombra (padding de 20/24 px). */
export function Cartao({ className, ...props }: React.ComponentProps<typeof Card>) {
  return <Card className={cn("gap-4 p-5 sm:p-6", className)} {...props} />;
}

export function Loading() {
  return <p className="m-0 text-center text-base text-muted-foreground" role="status">Carregando…</p>;
}

/** Lista de itens clicáveis (cards do DS: parado só com borda; hover com borda mais forte e sombra média; foco visível). */
export function ListaDeLinks({ itens }: { itens: { id: string; href: string; titulo: string; detalhe: string }[] }) {
  return (
    <ul className="m-0 grid list-none gap-2.5 p-0">
      {itens.map((i) => (
        <li key={i.id}>
          <Link href={i.href} className="block rounded-xl border border-border bg-card px-4 py-3.5 text-card-foreground transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0">
            <b className="block font-bold [overflow-wrap:anywhere] text-foreground">{i.titulo}</b>
            <small className="text-[0.8125rem] text-muted-foreground">{i.detalhe}</small>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Texto original guardado como foi escrito (citação com a barra na cor primária). */
export function TextoOriginal({ children }: { children: React.ReactNode }) {
  return <p className="m-0 rounded-r-md border-l-4 border-primary bg-muted/40 px-3.5 py-3 whitespace-pre-wrap text-foreground">{children}</p>;
}

/** Lista de pares rótulo e valor (dl). */
export function Definicoes({ children }: { children: React.ReactNode }) {
  return <dl className="m-0 grid gap-3 [&_dd]:mt-0.5 [&_dd]:ml-0 [&_dd]:text-foreground [&_dt]:text-[0.8125rem] [&_dt]:font-bold [&_dt]:text-muted-foreground [&_ul]:mt-1 [&_ul]:list-disc [&_ul]:pl-5">{children}</dl>;
}

/** Selos de status no padrão Badges da página Rótulos do DS. */
const TONS = {
  primario: "bg-primary/10 text-primary-text border-primary/20",
  sucesso: "bg-success/10 text-success border-success/20",
  neutro: "bg-muted text-foreground border-border",
} as const;
export function Etiqueta({ tom = "primario", children, className }: { tom?: keyof typeof TONS; children: React.ReactNode; className?: string }) {
  return <Badge variant="outline" className={cn("rounded-sm px-2.5 text-[0.75rem] font-semibold", TONS[tom], className)}>{children}</Badge>;
}
