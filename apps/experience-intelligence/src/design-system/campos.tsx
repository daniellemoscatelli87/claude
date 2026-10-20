"use client";
// Componentes de campo do design system, com os mesmos comportamentos dos formulários do site.
import { useEffect, useId, useRef, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { ESTADOS, forcaSenha, maskCnpj, maskPhone, requisitosSenha, sugestoesEmail } from "./padroes";

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
  return (
    <div className="uf-cidade-campo">
      <div className="uf-cidade">
        <label>Estado
          <select value={uf} onChange={(e) => onChange(e.target.value, "")} disabled={disabled} aria-invalid={d.invalid && !uf ? true : undefined} aria-describedby={d.describedBy}>
            <option value="">Selecione</option>
            {ESTADOS.map(([sigla, nome]) => <option key={sigla} value={sigla}>{nome}</option>)}
          </select>
        </label>
        <label>Cidade
          <select value={cidade} onChange={(e) => onChange(uf, e.target.value)} disabled={disabled || estado !== "ok"} aria-invalid={d.invalid && !cidade ? true : undefined} aria-describedby={d.describedBy}>
            <option value="">{opcaoVazia}</option>
            {cidade && !cidades?.includes(cidade) && <option value={cidade}>{cidade}</option>}
            {cidades?.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>
      {d.textos}
    </div>
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
