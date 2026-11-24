"use client";
// Campos das telas, com os mesmos comportamentos dos formulários do site (máscaras, sugestões de e-mail, mensagens).
// A parte visual vem do Design System Dani Moscatelli (componentes copiados em src/components/ui/, sincronizados
// pela rotina do site; nunca editados aqui). Este arquivo só compõe esses componentes com a lógica de padroes.ts.
import { useEffect, useId, useState, type ReactNode } from "react";
import { AlertCircle, Check, ChevronDown, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-field";
import { Progress } from "@/components/ui/progress";
import { SidePanel, SidePanelBody, SidePanelContent, SidePanelHeader } from "@/components/ui/side-panel";
import { cn } from "@/components/ui/utils";
import { classeLink } from "./classes";
import { ESTADOS, forcaSenha, maskCnpj, maskPhone, requisitosSenha, sugestoesEmail } from "./padroes";

type Base = { label: string; erro?: string; hint?: string; disabled?: boolean };

const TEXTOS_SENHA = { mostrar: "Mostrar senha", ocultar: "Ocultar senha" };

/** Texto de ajuda do campo (padrão do DS: 13 px, cor de apoio). */
export function Ajuda({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return <p id={id} className={cn("m-0 text-[0.8125rem] leading-snug text-muted-foreground", className)}>{children}</p>;
}

/** Mensagem de erro e ajuda ligadas ao campo (aria-describedby). Erro em --error-text, como na página Formulários do DS, com ícone: a cor nunca é o único sinal. */
function useDescricao(erro?: string, hint?: string) {
  const id = useId();
  const ids = [hint && `${id}-ajuda`, erro && `${id}-erro`].filter(Boolean).join(" ") || undefined;
  const textos = (
    <>
      {hint && <Ajuda id={`${id}-ajuda`}>{hint}</Ajuda>}
      {erro && (
        <p id={`${id}-erro`} className="m-0 inline-flex items-start gap-1.5 text-[0.8125rem] font-medium leading-snug text-error-text">
          <AlertCircle className="mt-px size-4 shrink-0" aria-hidden />{erro}
        </p>
      )}
    </>
  );
  return { id: `${id}-campo`, describedBy: ids, invalid: erro ? true : undefined, textos };
}

/** Rótulo + controle + ajuda/erro, empilhados como no DS (gap de 6 px). */
function Campo({ id, label, children, textos }: { id: string; label: ReactNode; children: ReactNode; textos?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="leading-snug">{label}</Label>
      {children}
      {textos}
    </div>
  );
}

export function CampoTexto({ label, erro, hint, disabled, value, onChange, ...input }: Base & { value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const d = useDescricao(erro, hint);
  return (
    <Campo id={d.id} label={label} textos={d.textos}>
      <Input {...input} id={d.id} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} aria-invalid={d.invalid} aria-describedby={d.describedBy} />
    </Campo>
  );
}

/** Seleção com rótulo, ajuda e erro. */
export function CampoSelecao({ label, erro, hint, value, onChange, disabled, children, id: idExterno }: Base & { value: string; onChange: (v: string) => void; children: ReactNode; id?: string }) {
  const d = useDescricao(erro, hint);
  const id = idExterno ?? d.id;
  return (
    <Campo id={id} label={label} textos={d.textos}>
      <SelecaoNativa id={id} value={value} onChange={onChange} disabled={disabled} invalid={d.invalid} describedBy={d.describedBy}>{children}</SelecaoNativa>
    </Campo>
  );
}

/**
 * Seleção nativa no padrão "Select" da página Formulários do DS (select do navegador com a seta do DS).
 * Usada no lugar do ui/select (Radix) para manter a opção vazia ("Selecione") e o seletor nativo do celular.
 */
export function SelecaoNativa({ id, value, onChange, disabled, invalid, describedBy, children }: { id?: string; value: string; onChange: (v: string) => void; disabled?: boolean; invalid?: boolean; describedBy?: string; children: ReactNode }) {
  return (
    <div className="relative">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} aria-invalid={invalid} aria-describedby={describedBy}
        className="w-full cursor-pointer appearance-none rounded-md border border-border bg-card h-10 px-3 py-0 pr-9 text-[0.9375rem] text-foreground outline-none transition-all duration-150 hover:border-[var(--border-strong)] focus:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive"
        style={{ boxShadow: "var(--shadow-xs)" }}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
    </div>
  );
}

/** Telefone com a máscara do site: (41) 99999-9999. */
export function CampoTelefone(p: Base & { value: string; onChange: (v: string) => void; required?: boolean }) {
  return <CampoTexto {...p} type="tel" inputMode="tel" autoComplete="tel" placeholder="(00) 00000-0000" value={p.value} onChange={(v) => p.onChange(maskPhone(v))} />;
}

/** CNPJ com máscara 00.000.000/0000-00 (novo). */
export function CampoCnpj(p: Base & { value: string; onChange: (v: string) => void }) {
  return <CampoTexto {...p} inputMode="numeric" autoComplete="off" placeholder="00.000.000/0000-00" value={p.value} onChange={(v) => p.onChange(maskCnpj(v))} />;
}

/** Caixa de confirmação com texto (pode conter link). Checkbox do DS. */
export function CampoConfirmacao({ checked, onChange, children, erro }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode; erro?: string }) {
  const d = useDescricao(erro);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-2.5">
        <Checkbox id={d.id} checked={checked} onCheckedChange={(c) => onChange(c === true)} className="mt-0.5" aria-invalid={d.invalid} aria-describedby={d.describedBy} />
        <label htmlFor={d.id} className="cursor-pointer text-[0.9375rem] leading-snug font-normal text-foreground">{children}</label>
      </div>
      {d.textos}
    </div>
  );
}

/** Link em linha no texto: variante "link" do botão do DS, sem altura nem espaçamento de botão. */
export function BotaoLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={classeLink}>{children}</button>;
}

/** Janela sobre a página para textos longos (aviso de privacidade): painel lateral do DS (Esc fecha, foco preso). */
export function Janela({ titulo, aberta, onFechar, children }: { titulo: string; aberta: boolean; onFechar: () => void; children: React.ReactNode }) {
  return (
    <SidePanel open={aberta} onOpenChange={(o) => { if (!o) onFechar(); }}>
      <SidePanelContent width="lg">
        <SidePanelHeader title={titulo} />
        <SidePanelBody className="pb-8">{children}</SidePanelBody>
      </SidePanelContent>
    </SidePanel>
  );
}

/** E-mail com sugestões de domínio, como no site. */
export function CampoEmail({ label, erro, hint, disabled, value, onChange, autoComplete = "email", required }: Base & { value: string; onChange: (v: string) => void; autoComplete?: string; required?: boolean }) {
  const d = useDescricao(erro, hint);
  const [foco, setFoco] = useState(false);
  const opcoes = foco ? sugestoesEmail(value) : [];
  return (
    <Campo id={d.id} label={label} textos={d.textos}>
      <Input id={d.id} type="email" inputMode="email" autoComplete={autoComplete} value={value} required={required} disabled={disabled}
        onChange={(e) => onChange(e.target.value)} onFocus={() => setFoco(true)} onBlur={() => setTimeout(() => setFoco(false), 150)}
        aria-invalid={d.invalid} aria-describedby={d.describedBy} />
      {opcoes.length > 0 && (
        <span className="flex flex-wrap gap-1.5" aria-label="Sugestões de e-mail">
          {opcoes.map((o) => (
            <Button key={o} type="button" variant="outline" size="sm" className="rounded-full font-medium" onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange(o); setFoco(false); }}>{o}</Button>
          ))}
        </span>
      )}
    </Campo>
  );
}

/** Estado e cidade: lista de cidades do IBGE carregada de /data/municipios/<UF>.json, como na Rede de Parceiros. */
export function CampoEstadoCidade({ uf, cidade, onChange, erro, disabled }: { uf: string; cidade: string; onChange: (uf: string, cidade: string) => void; erro?: string; disabled?: boolean }) {
  const d = useDescricao(erro);
  const idUf = useId(), idCidade = useId();
  const [cidades, setCidades] = useState<string[] | null>(null);
  const [estado, setEstado] = useState<"vazio" | "carregando" | "ok" | "falha">(uf ? "carregando" : "vazio");
  useEffect(() => {
    if (!uf) { setCidades(null); setEstado("vazio"); return; }
    let vivo = true;
    setEstado("carregando");
    fetch(`/data/municipios/${uf}.json`).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then((lista: string[]) => { if (vivo) { setCidades(lista); setEstado("ok"); } })
      .catch(() => { if (vivo) setEstado("falha"); });
    return () => { vivo = false; };
  }, [uf]);
  const opcaoVazia = estado === "vazio" ? "Escolha o estado primeiro" : estado === "carregando" ? "Carregando cidades…" : estado === "falha" ? "Não foi possível carregar as cidades. Tente de novo." : "Selecione a cidade";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Campo id={idUf} label="Estado">
          <SelecaoNativa id={idUf} value={uf} onChange={(v) => onChange(v, "")} disabled={disabled} invalid={d.invalid && !uf ? true : undefined} describedBy={d.describedBy}>
            <option value="">Selecione</option>
            {ESTADOS.map(([sigla, nome]) => <option key={sigla} value={sigla}>{nome}</option>)}
          </SelecaoNativa>
        </Campo>
        <Campo id={idCidade} label="Cidade">
          <SelecaoNativa id={idCidade} value={cidade} onChange={(v) => onChange(uf, v)} disabled={disabled || estado !== "ok"} invalid={d.invalid && !cidade ? true : undefined} describedBy={d.describedBy}>
            <option value="">{opcaoVazia}</option>
            {cidade && !cidades?.includes(cidade) && <option value={cidade}>{cidade}</option>}
            {cidades?.map((c) => <option key={c} value={c}>{c}</option>)}
          </SelecaoNativa>
        </Campo>
      </div>
      {d.textos}
    </div>
  );
}

/** Senha com visualização (campo de senha do DS), medidor de força, requisitos e confirmação. */
export function CampoSenhaNova({ senha, confirmacao, onSenha, onConfirmacao, erroSenha, erroConfirmacao, rotulo = "Senha" }: {
  senha: string; confirmacao: string; onSenha: (v: string) => void; onConfirmacao: (v: string) => void;
  erroSenha?: string; erroConfirmacao?: string; rotulo?: string;
}) {
  const forca = forcaSenha(senha);
  const s = useDescricao(erroSenha);
  const c = useDescricao(erroConfirmacao);
  const idForca = useId();
  return (
    <>
      <div className="flex flex-col gap-2">
        <PasswordInput label={rotulo} value={senha} onValueChange={onSenha} textos={TEXTOS_SENHA} autoComplete="new-password" required
          invalido={Boolean(erroSenha)} describedBy={[idForca, s.describedBy].filter(Boolean).join(" ")} />
        {/* Medidor de força com as barras do campo de senha do DS (lógica e textos de padroes.ts) */}
        <div className="flex gap-1.5" aria-hidden>
          {[1, 2, 3].map((n) => (
            <span key={n} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-300", n <= forca.nivel ? "bg-primary" : "bg-[var(--graphite-200)] dark:bg-[var(--graphite-700)]")} />
          ))}
        </div>
        <p id={idForca} className="m-0 text-[0.8125rem] text-muted-foreground" aria-live="polite">
          {forca.rotulo ? `Força da senha: ${forca.rotulo}` : "Use uma senha segura. Ela não será enviada por e-mail."}
        </p>
        <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1.5 p-0">
          {requisitosSenha(senha).map((r) => (
            <li key={r.texto} className={cn("flex items-center gap-2 text-[0.8125rem] transition-colors duration-200", r.ok ? "text-foreground" : "text-muted-foreground")}>
              {r.ok ? (
                <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-3" strokeWidth={3} aria-hidden /></span>
              ) : (
                <Circle className="size-4 shrink-0 text-muted-foreground/60" aria-hidden />
              )}
              <span>{r.texto}</span>
              <span className="sr-only">, {r.ok ? "atendido" : "não atendido"}</span>
            </li>
          ))}
        </ul>
        {s.textos}
      </div>
      <div className="flex flex-col gap-1.5">
        <PasswordInput label="Confirmar senha" value={confirmacao} onValueChange={onConfirmacao} textos={TEXTOS_SENHA} autoComplete="new-password" required
          invalido={Boolean(erroConfirmacao)} describedBy={c.describedBy} />
        {c.textos}
      </div>
    </>
  );
}

/** Senha de entrada (sem medidor), com visualização: campo de senha do DS. */
export function CampoSenha({ value, onChange, erro, label = "Senha" }: { value: string; onChange: (v: string) => void; erro?: string; label?: string }) {
  const d = useDescricao(erro);
  return (
    <div className="flex flex-col gap-1.5">
      <PasswordInput label={label} value={value} onValueChange={onChange} textos={TEXTOS_SENHA} autoComplete="current-password" required
        invalido={Boolean(erro)} describedBy={d.describedBy} />
      {d.textos}
    </div>
  );
}

/** Título de etapa do cadastro com ícone vermelho sobre base quadrada rosa clara de cantos arredondados (tokens do DS). */
export function TituloEtapa({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-3">
      <span className="inline-grid size-11 flex-none place-items-center rounded-md bg-primary-muted text-primary-text [&>svg]:size-[22px]" aria-hidden="true">{icone}</span>
      <h2 className="m-0 text-[1.25rem] leading-snug font-bold tracking-[-0.015em] text-foreground">{children}</h2>
    </div>
  );
}

/** Barra de progresso do cadastro: "Etapa X de N" (Progress do DS). */
export function BarraProgresso({ atual, total }: { atual: number; total: number }) {
  return (
    <div className="mb-5">
      <p className="m-0 mb-1.5 text-[0.8125rem] font-semibold text-muted-foreground">Etapa {atual} de {total}</p>
      <Progress value={(atual / total) * 100} aria-label={`Etapa ${atual} de ${total}`} getValueLabel={() => `Etapa ${atual} de ${total}`} />
    </div>
  );
}

/** Rodapé igual ao do site do estúdio (conteúdo do app; tokens do DS). */
export function Rodape() {
  return (
    <footer className="mt-auto border-t border-border py-6">
      <div className="ds-container-reading flex flex-col items-center gap-2.5 text-center text-xs leading-relaxed text-muted-foreground">
        <p className="m-0">© {new Date().getFullYear()} Dani Moscatelli • Experience Design Studio. Todos os direitos reservados.</p>
        <p className="m-0 flex flex-wrap justify-center gap-x-3.5 gap-y-1.5">
          <span>Curitiba - PR</span>
          <span aria-hidden="true">•</span>
          <a href="https://danimoscatelli.com.br/privacidade/" target="_blank" rel="noopener" className="rounded-sm text-muted-foreground transition-colors hover:text-primary-text focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none">Política de privacidade</a>
        </p>
      </div>
    </footer>
  );
}
