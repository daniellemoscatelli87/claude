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
import { Ajuda, CampoCnpj, CampoSelecao, CampoTexto, TituloEtapa } from "@/design-system/campos";
import { Button } from "@/components/ui/button";
import { Selo } from "@/components/ui/selo";
import { Cartao, Lead, Mensagem, Titulo } from "./Shell";
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
        <TituloEtapa icone={<Building2 size={22} />}>Empresa ou negócio</TituloEtapa>
      ) : (
        <>
          <Selo icon={<Building2 />} tone="primary">{editando ? "Sua empresa ou negócio" : "Preparando seu espaço de trabalho"}</Selo>
          <Titulo>{editando ? "Empresa ou negócio" : "Agora, conte sobre sua empresa ou negócio."}</Titulo>
        </>
      )}
      <Lead>Essas informações ajudam a adaptar as orientações ao seu contexto. Você pode completar os detalhes depois.</Lead>
      <Cartao>
      <form className="flex flex-col gap-4" onSubmit={enviar} noValidate>
        <CampoTexto label="Qual é o nome da empresa ou negócio?" value={nome} onChange={setNome} maxLength={120} autoComplete="organization" required
          disabled={!podeEditarOrg} placeholder="Ex.: Clínica Horizonte, Escola Aurora, Loja Central"
          hint="Use o nome pelo qual as pessoas conhecem a empresa, o estabelecimento ou a instituição." />

        <fieldset className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0">
          <legend className="mb-2.5 p-0 text-[0.8125rem] font-bold tracking-[0.06em] text-muted-foreground uppercase">Detalhes opcionais</legend>
          <CampoSelecao label="Em que área atua?" value={segmento} onChange={setSegmento} disabled={!podeEditarOrg}>
            <option value="">Selecione um segmento (opcional)</option>
            {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
            <option value={SEGMENTO_OUTRO}>{SEGMENTO_OUTRO}</option>
            <option value={NAO_INFORMAR_SEGMENTO}>{NAO_INFORMAR_SEGMENTO}</option>
          </CampoSelecao>
          {segmento === SEGMENTO_OUTRO && (
            <CampoTexto label="Qual?" value={segmentoOutro} onChange={setSegmentoOutro} maxLength={80} disabled={!podeEditarOrg} />
          )}
          <CampoTexto label="O que a empresa ou negócio oferece?" value={oferta} onChange={setOferta} maxLength={200} disabled={!podeEditarOrg}
            placeholder="Ex.: atendimento médico, hospedagem, ensino, plataforma de serviços..."
            hint="Pode ser um serviço, um produto, uma operação ou uma combinação." />
          <CampoSelecao label="Qual é o seu papel nela?" value={area} onChange={setArea}>
            <option value="">Selecione (opcional)</option>
            {Object.entries(AREAS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </CampoSelecao>
          <CampoSelecao label="Qual é o tipo?" value={tipo} onChange={setTipo} disabled={!podeEditarOrg}>
            <option value="">Selecione (opcional)</option>
            {Object.entries(TIPOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </CampoSelecao>
          <CampoSelecao label="Quantas pessoas trabalham nela, aproximadamente?" value={porte} onChange={setPorte} disabled={!podeEditarOrg}>
            <option value="">Selecione (opcional)</option>
            {Object.entries(PORTES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </CampoSelecao>
          <CampoCnpj label="CNPJ" value={cnpj} onChange={setCnpj} disabled={!podeEditarOrg}
            hint="Opcional. Para empresas brasileiras: ajuda a evitar cadastros duplicados da mesma empresa." />
          {!podeEditarOrg && <Ajuda>Só quem administra a empresa ou negócio altera esses dados. Você pode atualizar o seu papel.</Ajuda>}
        </fieldset>

        {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
        {ok && <Mensagem tipo="ok">{ok}</Mensagem>}
        <Button type="submit" className="w-full" disabled={enviando}>{enviando ? "Salvando…" : editando ? "Salvar" : "Continuar"}</Button>
      </form>
      </Cartao>
    </>
  );
}
