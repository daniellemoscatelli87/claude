"use client";
// Componentes de campo do design system, com os mesmos comportamentos dos formulários do site.
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Eye, EyeOff, X } from "lucide-react";
import { ESTADOS, buscaNormalizada, forcaSenha, maskCnpj, maskPhone, requisitosSenha, sugestoesEmail } from "./padroes";

type Base = { label: string; erro?: string; hint?: string; disabled?: boolean };

/** Mensagem de erro e ajuda ligadas ao campo (aria-describedby). */
function useDescricao(erro?: string, hint?: string) {
  const id = useId();
  const ids = [hint && `${id}-ajuda`, erro && `${id}-erro`].filter(Boolean).join(" ") || undefined;
  const textos = (
    <>
      {hint && <span className="hint" id={`${id}-ajuda`}>{hint}</span>}
      {erro && <span className="campo-erro" id={`${id}-erro`}>{erro}</span>}
    </>
  );
  return { describedBy: ids, invalid: erro ? true : undefined, textos };
}

export function CampoTexto({ label, erro, hint, disabled, value, onChange, ...input }: Base & { value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const d = useDescricao(erro, hint);
  return (
    <label>{label}
      <input {...input} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} aria-invalid={d.invalid} aria-describedby={d.describedBy} />
      {d.textos}
    </label>
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

/** Caixa de confirmação com texto (pode conter link). */
export function CampoConfirmacao({ checked, onChange, children, erro }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode; erro?: string }) {
  const d = useDescricao(erro);
  return (
    <div className="confirmacao">
      <label className="confirmacao-linha">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={d.invalid} aria-describedby={d.describedBy} />
        <span>{children}</span>
      </label>
      {d.textos}
    </div>
  );
}

/** Janela sobre a página, como a política de privacidade da Rede de Parceiros (<dialog> nativo, Esc fecha). */
export function Janela({ titulo, aberta, onFechar, children }: { titulo: string; aberta: boolean; onFechar: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberta && !d.open) d.showModal();
    if (!aberta && d.open) d.close();
  }, [aberta]);
  return (
    <dialog ref={ref} className="janela" aria-labelledby={idTitulo} onClose={onFechar} onClick={(e) => { if (e.target === ref.current) onFechar(); }}>
      <div className="janela-topo">
        <h2 id={idTitulo}>{titulo}</h2>
        <button type="button" onClick={onFechar} aria-label="Fechar"><X size={22} aria-hidden="true" /></button>
      </div>
      <div className="janela-corpo">{children}</div>
    </dialog>
  );
}

/** E-mail com sugestões de domínio, como no site. */
export function CampoEmail({ label, erro, hint, disabled, value, onChange, autoComplete = "email", required }: Base & { value: string; onChange: (v: string) => void; autoComplete?: string; required?: boolean }) {
  const d = useDescricao(erro, hint);
  const [foco, setFoco] = useState(false);
  const opcoes = foco ? sugestoesEmail(value) : [];
  return (
    <label>{label}
      <input type="email" inputMode="email" autoComplete={autoComplete} value={value} required={required} disabled={disabled}
        onChange={(e) => onChange(e.target.value)} onFocus={() => setFoco(true)} onBlur={() => setTimeout(() => setFoco(false), 150)}
        aria-invalid={d.invalid} aria-describedby={d.describedBy} />
      {opcoes.length > 0 && (
        <span className="sugestoes" aria-label="Sugestões de e-mail">
          {opcoes.map((o) => (
            <button key={o} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange(o); setFoco(false); }}>{o}</button>
          ))}
        </span>
      )}
      {d.textos}
    </label>
  );
}

/** Estado e cidade: lista de cidades do IBGE carregada de /data/municipios/<UF>.json, como na Rede de Parceiros. */
export function CampoEstadoCidade({ uf, cidade, onChange, erro, disabled }: { uf: string; cidade: string; onChange: (uf: string, cidade: string) => void; erro?: string; disabled?: boolean }) {
  const d = useDescricao(erro);
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
  const invalido = (vazio: boolean) => (d.invalid && vazio ? true : undefined);
  return (
    <div className="uf-cidade-campo">
      <div className="uf-cidade">
        <CampoBusca label="Estado" vazio="Selecione" opcoes={ESTADOS.map(([sigla, nome]) => ({ valor: sigla, rotulo: nome }))}
          valor={uf} onEscolher={(v) => onChange(v, "")} disabled={disabled} invalido={invalido(!uf)} describedBy={d.describedBy} />
        <CampoBusca label="Cidade" vazio={opcaoVazia} opcoes={(cidades ?? (cidade ? [cidade] : [])).map((c) => ({ valor: c, rotulo: c }))}
          valor={cidade} onEscolher={(v) => onChange(uf, v)} disabled={disabled || estado !== "ok"} invalido={invalido(!cidade)} describedBy={d.describedBy} />
      </div>
      {d.textos}
    </div>
  );
}

type Opcao = { valor: string; rotulo: string };

/** Lista com busca: a pessoa digita para filtrar (sem diferenciar acentos) e escolhe uma opção da lista.
 *  Só aceita valores da lista; ao sair do campo sem escolher, volta para a opção anterior. */
export function CampoBusca({ label, vazio, opcoes, valor, onEscolher, disabled, invalido, describedBy }: {
  label: string; vazio: string; opcoes: Opcao[]; valor: string; onEscolher: (v: string) => void;
  disabled?: boolean; invalido?: boolean; describedBy?: string;
}) {
  const id = useId();
  const lista = useRef<HTMLUListElement>(null);
  const atual = opcoes.find((o) => o.valor === valor);
  const [texto, setTexto] = useState<string | null>(null); // null: mostra a opção escolhida
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const filtro = buscaNormalizada(texto ?? "");
  const filtradas = filtro ? opcoes.filter((o) => buscaNormalizada(o.rotulo).includes(filtro)) : opcoes;

  useEffect(() => { lista.current?.children[ativo]?.scrollIntoView({ block: "nearest" }); }, [ativo, aberto]);

  function escolher(o: Opcao) { onEscolher(o.valor); setTexto(null); setAberto(false); }
  function sair() {
    if (texto !== null) {
      const exata = opcoes.find((o) => buscaNormalizada(o.rotulo) === filtro);
      if (exata) onEscolher(exata.valor); else if (!filtro) onEscolher("");
    }
    setTexto(null); setAberto(false);
  }
  function teclas(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); if (!aberto) setAberto(true); else setAtivo((i) => Math.min(i + 1, filtradas.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setAtivo((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && aberto) { e.preventDefault(); if (filtradas[ativo]) escolher(filtradas[ativo]); }
    else if (e.key === "Escape" && aberto) { e.preventDefault(); setTexto(null); setAberto(false); }
  }

  return (
    <label className="busca">{label}
      <span className="busca-caixa">
        <input role="combobox" aria-autocomplete="list" aria-expanded={aberto} aria-controls={`${id}-lista`}
          aria-activedescendant={aberto && filtradas[ativo] ? `${id}-${ativo}` : undefined}
          value={texto ?? atual?.rotulo ?? ""} placeholder={vazio} disabled={disabled} autoComplete="off"
          aria-invalid={invalido} aria-describedby={describedBy}
          onChange={(e) => { setTexto(e.target.value); setAtivo(0); setAberto(true); }}
          onFocus={(e) => { e.target.select(); setAtivo(Math.max(0, opcoes.findIndex((o) => o.valor === valor))); setAberto(true); }}
          onClick={() => setAberto(true)} onBlur={sair} onKeyDown={teclas} />
        <ChevronDown className="busca-seta" size={18} aria-hidden="true" />
      </span>
      {aberto && !disabled && (
        <ul ref={lista} id={`${id}-lista`} role="listbox" aria-label={label} className="busca-lista">
          {filtradas.length === 0 && <li className="busca-nada" role="presentation">Nenhum resultado. Confira a grafia.</li>}
          {filtradas.map((o, i) => (
            <li key={o.valor} id={`${id}-${i}`} role="option" aria-selected={o.valor === valor}
              className={i === ativo ? "ativo" : undefined}
              onMouseDown={(e) => e.preventDefault()} onMouseEnter={() => setAtivo(i)} onClick={() => escolher(o)}>{o.rotulo}</li>
          ))}
        </ul>
      )}
    </label>
  );
}

function OlhoSenha({ visivel, alternar }: { visivel: boolean; alternar: () => void }) {
  return (
    <button type="button" onClick={alternar} aria-label={visivel ? "Ocultar senha" : "Mostrar senha"} aria-pressed={visivel}>
      {visivel ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
    </button>
  );
}

/** Senha com visualização, medidor de força, requisitos e confirmação. */
export function CampoSenhaNova({ senha, confirmacao, onSenha, onConfirmacao, erroSenha, erroConfirmacao, rotulo = "Senha" }: {
  senha: string; confirmacao: string; onSenha: (v: string) => void; onConfirmacao: (v: string) => void;
  erroSenha?: string; erroConfirmacao?: string; rotulo?: string;
}) {
  const [ver, setVer] = useState(false);
  const [verConf, setVerConf] = useState(false);
  const forca = forcaSenha(senha);
  const s = useDescricao(erroSenha);
  const c = useDescricao(erroConfirmacao);
  const idForca = useId();
  return (
    <>
      <label>{rotulo}
        <span className="senha">
          <input type={ver ? "text" : "password"} value={senha} onChange={(e) => onSenha(e.target.value)} autoComplete="new-password" required
            aria-invalid={s.invalid} aria-describedby={[idForca, s.describedBy].filter(Boolean).join(" ")} />
          <OlhoSenha visivel={ver} alternar={() => setVer(!ver)} />
        </span>
        <span className="forca" id={idForca} aria-live="polite">
          <span className={`forca-barra n${forca.nivel}`} aria-hidden="true"><i /><i /><i /></span>
          <span className="forca-texto">{forca.rotulo ? `Força da senha: ${forca.rotulo}` : "Use uma senha segura. Ela não será enviada por e-mail."}</span>
        </span>
        <span className="requisitos">
          {requisitosSenha(senha).map((r) => <span key={r.texto} className={r.ok ? "ok" : ""}>{r.ok ? "✓" : "•"} {r.texto}</span>)}
        </span>
        {s.textos}
      </label>
      <label>Confirmar senha
        <span className="senha">
          <input type={verConf ? "text" : "password"} value={confirmacao} onChange={(e) => onConfirmacao(e.target.value)} autoComplete="new-password" required
            aria-invalid={c.invalid} aria-describedby={c.describedBy} />
          <OlhoSenha visivel={verConf} alternar={() => setVerConf(!verConf)} />
        </span>
        {c.textos}
      </label>
    </>
  );
}

/** Senha de entrada (sem medidor), com visualização. */
export function CampoSenha({ value, onChange, erro, label = "Senha" }: { value: string; onChange: (v: string) => void; erro?: string; label?: string }) {
  const [ver, setVer] = useState(false);
  const d = useDescricao(erro);
  return (
    <label>{label}
      <span className="senha">
        <input type={ver ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete="current-password" required aria-invalid={d.invalid} aria-describedby={d.describedBy} />
        <OlhoSenha visivel={ver} alternar={() => setVer(!ver)} />
      </span>
      {d.textos}
    </label>
  );
}

/** Barra de progresso do cadastro: "Etapa X de N". */
/** Título de etapa do cadastro com ícone vermelho sobre base quadrada rosa clara de cantos arredondados. */
export function TituloEtapa({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <div className="etapa-cabecalho">
      <span className="etapa-icone" aria-hidden="true">{icone}</span>
      <h2 className="etapa-titulo">{children}</h2>
    </div>
  );
}

export function BarraProgresso({ atual, total }: { atual: number; total: number }) {
  return (
    <div className="progresso">
      <p className="progresso-texto">Etapa {atual} de {total}</p>
      <div className="progresso-barra" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={atual} aria-label={`Etapa ${atual} de ${total}`}>
        <span style={{ width: `${(atual / total) * 100}%` }} />
      </div>
    </div>
  );
}

/** Rodapé igual ao do site do estúdio. */
export function Rodape() {
  return (
    <footer className="rodape">
      <div className="wrap">
        <p>© {new Date().getFullYear()} Dani Moscatelli • Experience Design Studio. Todos os direitos reservados.</p>
        <p className="rodape-links">
          <span>Curitiba - PR</span>
          <span aria-hidden="true">•</span>
          <a href="https://danimoscatelli.com.br/privacidade/" target="_blank" rel="noopener">Política de privacidade</a>
        </p>
      </div>
    </footer>
  );
}
