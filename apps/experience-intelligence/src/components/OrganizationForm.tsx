"use client";
// Organização (UX-3a, tela E do kit de UX): nome obrigatório e contexto mínimo opcional, que ajuda a IA a
// adaptar o plano de investigação. Criação: quem cria passa a administrar. Edição: só a administração muda
// os dados da organização; cada pessoa muda a própria área.
import { useState } from "react";
import { Building2 } from "lucide-react";
import { setCurrentOrganizationId, setupOrganization, updateOrganizationContext, type MyOrganization } from "@/application/organizations";
import { mensagemDeErro } from "@/application/errors";
import { AREAS, PORTES, SEGMENTOS, SEGMENTO_OUTRO, TIPOS } from "@/domain/organization/context";
import { useSession } from "./session";
import { CampoCnpj } from "@/design-system/campos";
import { maskCnpj } from "@/design-system/padroes";

const NAO_INFORMAR_SEGMENTO = "Prefiro não informar";

function segmentoInicial(industry: string | null | undefined): { escolha: string; outro: string } {
  if (!industry) return { escolha: "", outro: "" };
  if ((SEGMENTOS as readonly string[]).includes(industry)) return { escolha: industry, outro: "" };
  return { escolha: SEGMENTO_OUTRO, outro: industry };
}

/** etapa: dentro do cadastro em etapas (título da tela e barra de progresso ficam na página). */
export function OrganizationForm({ org, onSaved, etapa = false }: { org?: MyOrganization; onSaved?: () => void; etapa?: boolean }) {
  const { reload } = useSession();
  const editando = Boolean(org);
  const podeEditarOrg = !org || org.role === "org_admin";
  const seg = segmentoInicial(org?.industry);
  const [nome, setNome] = useState(org?.name ?? "");
  const [segmento, setSegmento] = useState(seg.escolha);
  const [segmentoOutro, setSegmentoOutro] = useState(seg.outro);
  const [oferta, setOferta] = useState(org?.offering ?? "");
  const [area, setArea] = useState(org?.job_area ?? "");
  const [tipo, setTipo] = useState(org?.org_type ?? "");
  const [porte, setPorte] = useState(org?.size_band ?? "");
  const [cnpj, setCnpj] = useState(org?.cnpj ? maskCnpj(org.cnpj) : "");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setOk(""); setEnviando(true);
    const industry = segmento === SEGMENTO_OUTRO ? segmentoOutro : segmento === NAO_INFORMAR_SEGMENTO ? "" : segmento;
    const dados = { name: nome, industry, offering: oferta, org_type: tipo, size_band: porte, job_area: area, cnpj };
    try {
      if (org) {
        await updateOrganizationContext(org.id, dados, podeEditarOrg);
        setOk("Informações salvas.");
      } else {
        setCurrentOrganizationId(await setupOrganization(dados));
      }
      await reload();
      onSaved?.();
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      {etapa ? (
        <h2 className="etapa-titulo">Empresa ou negócio</h2>
      ) : (
        <>
          <p className="eyebrow"><Building2 size={18} aria-hidden="true" /> {editando ? "Sua empresa ou negócio" : "Preparando seu espaço de trabalho"}</p>
          <h1>{editando ? "Empresa ou negócio" : "Agora, conte sobre sua empresa ou negócio."}</h1>
        </>
      )}
      <p className="lead">Essas informações ajudam a adaptar as orientações ao seu contexto. Você pode completar os detalhes depois.</p>
      <form className="card stack" onSubmit={enviar} noValidate>
        <label>Qual é o nome da empresa ou negócio?
          <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} autoComplete="organization" required
            disabled={!podeEditarOrg} placeholder="Ex.: Clínica Horizonte, Escola Aurora, Loja Central" aria-describedby="org-nome-ajuda" />
          <span className="hint" id="org-nome-ajuda">Use o nome pelo qual as pessoas conhecem a empresa, o estabelecimento ou a instituição.</span>
        </label>

        <fieldset className="opcionais">
          <legend>Detalhes opcionais</legend>
          <label>Em que área atua?
            <select value={segmento} onChange={(e) => setSegmento(e.target.value)} disabled={!podeEditarOrg}>
              <option value="">Selecione um segmento (opcional)</option>
              {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
              <option value={SEGMENTO_OUTRO}>{SEGMENTO_OUTRO}</option>
              <option value={NAO_INFORMAR_SEGMENTO}>{NAO_INFORMAR_SEGMENTO}</option>
            </select>
          </label>
          {segmento === SEGMENTO_OUTRO && (
            <label>Qual?
              <input value={segmentoOutro} onChange={(e) => setSegmentoOutro(e.target.value)} maxLength={80} disabled={!podeEditarOrg} />
            </label>
          )}
          <label>O que a empresa ou negócio oferece?
            <input value={oferta} onChange={(e) => setOferta(e.target.value)} maxLength={200} disabled={!podeEditarOrg}
              placeholder="Ex.: atendimento médico, hospedagem, ensino, plataforma de serviços..." aria-describedby="org-oferta-ajuda" />
            <span className="hint" id="org-oferta-ajuda">Pode ser um serviço, um produto, uma operação ou uma combinação.</span>
          </label>
          <label>Qual é o seu papel nela?
            <select value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">Selecione (opcional)</option>
              {Object.entries(AREAS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label>Qual é o tipo?
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} disabled={!podeEditarOrg}>
              <option value="">Selecione (opcional)</option>
              {Object.entries(TIPOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label>Quantas pessoas trabalham nela, aproximadamente?
            <select value={porte} onChange={(e) => setPorte(e.target.value)} disabled={!podeEditarOrg}>
              <option value="">Selecione (opcional)</option>
              {Object.entries(PORTES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <CampoCnpj label="CNPJ" value={cnpj} onChange={setCnpj} disabled={!podeEditarOrg}
            hint="Opcional. Para empresas brasileiras: ajuda a evitar cadastros duplicados da mesma empresa." />
          {!podeEditarOrg && <p className="hint" style={{ margin: 0 }}>Só quem administra a empresa ou negócio altera esses dados. Você pode atualizar o seu papel.</p>}
        </fieldset>

        {erro && <p className="msg err" role="alert">{erro}</p>}
        {ok && <p className="msg ok" role="status">{ok}</p>}
        <button className="btn btn-primary btn-block" disabled={enviando}>{enviando ? "Salvando…" : editando ? "Salvar" : "Continuar"}</button>
      </form>
    </>
  );
}

