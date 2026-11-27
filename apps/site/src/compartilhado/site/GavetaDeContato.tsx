// Gaveta de contato do site (src/compartilhado/partes.ts e menu.ts), com as peças do DS. Mesmos textos, mesma tabela
// ("contatos"), mesmo rascunho no navegador e os mesmos eventos de medição.
// Peças do DS: SidePanel (cabeçalho, corpo, barra de ação, rodapé), Campo, GradeDeCampos, CampoDeEmail,
// CampoDeTelefone, GrupoDeCartoesDeEscolha + CartaoDeEscolha, Select, Textarea, Checkbox, Label, Alert, BotaoDeEnvio,
// EstadoFinal, Button.
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CircleAlert, Lock } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { BotaoDeEnvio, type EstadoDoEnvio } from "@/components/ui/botao-de-envio";
import { Button } from "@/components/ui/button";
import { Campo, CampoDeTelefone, GradeDeCampos, MensagemDeErro } from "@/components/ui/campo";
import { CampoDeEmail } from "@/components/ui/campo-de-email";
import { CartaoDeEscolha, GrupoDeCartoesDeEscolha } from "@/components/ui/cartao-de-escolha";
import { Checkbox } from "@/components/ui/checkbox";
import { EstadoFinal } from "@/components/ui/estado-vazio";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidePanel, SidePanelActions, SidePanelBody, SidePanelContent, SidePanelFooter, SidePanelHeader } from "@/components/ui/side-panel";
import { Textarea } from "@/components/ui/textarea";
import {
  ASSUNTOS, CHAVE_RASCUNHO, CONTATO_VAZIO, DIAS, MENSAGEM_DE_ERRO, MENSAGEM_DE_FALHA, PERIODOS, TIPOS_DE_NEGOCIO,
  errosDoContato, lerRascunho, linhaDoContato, type DadosDoContato,
} from "./contato";
import { registrarEvento } from "./navegacao";
import { inserir } from "./supabase";

const ERROS_DOS_CAMPOS: Partial<Record<keyof DadosDoContato, string>> = {
  nome: "Informe o seu nome.",
  email: "Informe um e-mail válido.",
  telefone: "Informe um telefone com DDD.",
  empresa: "Informe o nome da empresa.",
  cargo: "Informe o seu cargo ou função.",
  tipo_negocio: "Escolha o tipo do seu negócio.",
  assunto: "Escolha o assunto.",
  mensagem: "Conte um pouco sobre o seu desafio.",
  dias: "Escolha pelo menos um dia.",
  periodo: "Escolha o período.",
};

export function GavetaDeContato({ aberta, aoMudar }: { aberta: boolean; aoMudar: (aberta: boolean) => void }) {
  const [dados, setDados] = useState<DadosDoContato>(CONTATO_VAZIO);
  const [erros, setErros] = useState<(keyof DadosDoContato)[]>([]);
  const [tentou, setTentou] = useState(false);
  const [falha, setFalha] = useState("");
  const [envio, setEnvio] = useState<EstadoDoEnvio>("parado");
  const [enviado, setEnviado] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const restaurado = useRef(false);

  // Rascunho: volta ao abrir a página e é salvo a cada mudança (fica só neste navegador).
  useEffect(() => {
    try {
      const r = lerRascunho(localStorage.getItem(CHAVE_RASCUNHO));
      if (r) setDados(r);
    } catch { /* sem armazenamento */ }
    restaurado.current = true;
  }, []);
  useEffect(() => {
    if (!restaurado.current || enviado) return;
    try { localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(dados)); } catch { /* sem armazenamento */ }
  }, [dados, enviado]);

  useEffect(() => {
    if (aberta) registrarEvento("contato_aberto");
  }, [aberta]);

  const mudar = <K extends keyof DadosDoContato>(k: K, v: DadosDoContato[K]) => {
    const novo = { ...dados, [k]: v };
    setDados(novo);
    if (tentou) setErros(errosDoContato(novo));
  };
  const erro = (k: keyof DadosDoContato) => (erros.includes(k) ? ERROS_DOS_CAMPOS[k] : undefined);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    const lista = errosDoContato(dados);
    setErros(lista);
    if (lista.length) {
      setFalha(MENSAGEM_DE_ERRO);
      // leva o foco ao primeiro campo com problema
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalido] input, [data-invalido] button')?.focus());
      return;
    }
    setFalha("");
    setEnvio("enviando");
    try {
      await inserir("contatos", linhaDoContato(dados));
      try { localStorage.removeItem(CHAVE_RASCUNHO); } catch { /* sem armazenamento */ }
      registrarEvento("contato_enviado");
      setDados(CONTATO_VAZIO);
      setTentou(false);
      setEnviado(true);
      setEnvio("parado");
    } catch {
      setFalha(MENSAGEM_DE_FALHA);
      setEnvio("parado");
    }
  }

  return (
    <SidePanel
      open={aberta}
      onOpenChange={(a) => {
        aoMudar(a);
        if (!a && enviado) setTimeout(() => setEnviado(false), 300);
      }}
    >
      <SidePanelContent closeLabel="Fechar formulário de contato">
        {enviado ? (
          <>
            <SidePanelHeader title="Mensagem enviada com sucesso!" className="sr-only" />
            <SidePanelBody className="flex items-center">
              <EstadoFinal
                nivel={3}
                titulo="Mensagem enviada com sucesso!"
                descricao="Entraremos em contato em breve para agendarmos a nossa conversa."
                acoes={<Button variant="outline" size="lg" onClick={() => aoMudar(false)}>Fechar</Button>}
              />
            </SidePanelBody>
          </>
        ) : (
          <>
            <SidePanelHeader
              eyebrow="Contato & Parcerias"
              title="Inicie uma conversa"
              description="Preencha os dados abaixo que em breve entrarei em contato para agendar uma conversa e apresentar uma proposta para o seu desafio."
            />
            <SidePanelBody>
              <form id="form-contato" ref={formRef} noValidate onSubmit={enviar} className="flex flex-col gap-6 py-2">
                <Campo rotulo="Nome completo" obrigatorio autoComplete="name" value={dados.nome} onChange={(e) => mudar("nome", e.target.value)} erro={erro("nome")} />
                <CampoDeEmail rotulo="E-mail corporativo" obrigatorio valor={dados.email} onValorChange={(v) => mudar("email", v)} erro={erro("email")} />
                <CampoDeTelefone rotulo="Telefone / WhatsApp" obrigatorio valor={dados.telefone} onValorChange={(v) => mudar("telefone", v)} erro={erro("telefone")} />
                <GradeDeCampos>
                  <Campo rotulo="Nome da Empresa" obrigatorio autoComplete="organization" value={dados.empresa} onChange={(e) => mudar("empresa", e.target.value)} erro={erro("empresa")} />
                  <Campo rotulo="Cargo / Função" obrigatorio autoComplete="organization-title" value={dados.cargo} onChange={(e) => mudar("cargo", e.target.value)} erro={erro("cargo")} />
                </GradeDeCampos>

                <div className="space-y-2" data-invalido={erro("tipo_negocio") ? "" : undefined}>
                  <Label id="contato-negocio" className="text-body-sm font-semibold leading-snug">
                    Meu negócio é... <span aria-hidden className="-ml-1 text-primary-text">*</span>
                  </Label>
                  <GrupoDeCartoesDeEscolha
                    aria-labelledby="contato-negocio"
                    aria-describedby={erro("tipo_negocio") ? "contato-negocio-erro" : undefined}
                    required
                    value={dados.tipo_negocio}
                    onValueChange={(v) => mudar("tipo_negocio", v)}
                  >
                    {TIPOS_DE_NEGOCIO.map((t) => (
                      <CartaoDeEscolha key={t.valor} valor={t.valor} titulo={t.titulo} descricao={"descricao" in t ? t.descricao : undefined} />
                    ))}
                  </GrupoDeCartoesDeEscolha>
                  {dados.tipo_negocio === "Outro" && (
                    <Input
                      aria-label="Outro tipo de negócio"
                      placeholder="Qual? Descreva brevemente..."
                      value={dados.tipo_negocio_outro}
                      onChange={(e) => mudar("tipo_negocio_outro", e.target.value)}
                      className="bg-card"
                    />
                  )}
                  {erro("tipo_negocio") && <MensagemDeErro id="contato-negocio-erro">{erro("tipo_negocio")}</MensagemDeErro>}
                </div>

                <Campo rotulo="Assunto" obrigatorio erro={erro("assunto")}>
                  {(p) => (
                    <Select value={dados.assunto} onValueChange={(v) => mudar("assunto", v)}>
                      <SelectTrigger {...p} className="bg-card">
                        <SelectValue placeholder="Escolha o assunto" />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSUNTOS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </Campo>

                <Campo rotulo="Conte um pouco sobre seu desafio" obrigatorio erro={erro("mensagem")} ajuda="Quais objetivos, dores ou ideias você gostaria de trabalhar conosco?">
                  {(p) => <Textarea {...p} rows={3} value={dados.mensagem} onChange={(e) => mudar("mensagem", e.target.value)} className="bg-card" />}
                </Campo>

                <GradeDeCampos>
                  <fieldset className="min-w-0 space-y-2" data-invalido={erro("dias") ? "" : undefined} aria-describedby={erro("dias") ? "contato-dias-erro" : "contato-dias-ajuda"}>
                    <Label asChild className="text-body-sm font-semibold leading-snug">
                      <legend>Melhor dia da semana <span aria-hidden className="-ml-1 text-primary-text">*</span></legend>
                    </Label>
                    <div className="flex flex-wrap gap-x-5 gap-y-3 pt-1">
                      {DIAS.map((d) => (
                        <div key={d} className="flex items-center gap-2">
                          <Checkbox
                            id={`contato-dia-${d}`}
                            checked={dados.dias.includes(d)}
                            onCheckedChange={(c) => mudar("dias", c ? [...dados.dias, d] : dados.dias.filter((x) => x !== d))}
                          />
                          <Label htmlFor={`contato-dia-${d}`} className="text-body-sm">{d}</Label>
                        </div>
                      ))}
                    </div>
                    {erro("dias") ? <MensagemDeErro id="contato-dias-erro">{erro("dias")}</MensagemDeErro> : <p id="contato-dias-ajuda" className="text-body-sm text-muted-foreground">Pode escolher mais de um.</p>}
                  </fieldset>
                  <Campo rotulo="Período (preferência)" obrigatorio erro={erro("periodo")}>
                    {(p) => (
                      <Select value={dados.periodo} onValueChange={(v) => mudar("periodo", v)}>
                        <SelectTrigger {...p} className="bg-card">
                          <SelectValue placeholder="Escolha o período" />
                        </SelectTrigger>
                        <SelectContent>
                          {PERIODOS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </Campo>
                </GradeDeCampos>

                {falha && (
                  <Alert variant="error">
                    <CircleAlert aria-hidden />
                    <AlertTitle>{falha}</AlertTitle>
                  </Alert>
                )}
              </form>
            </SidePanelBody>
            <SidePanelActions>
              <BotaoDeEnvio type="submit" form="form-contato" size="lg" className="w-full" estado={envio} textos={{ enviando: "Enviando…" }}>
                Solicitar reunião
                <ArrowRight aria-hidden />
              </BotaoDeEnvio>
            </SidePanelActions>
            <SidePanelFooter>
              <span className="inline-flex items-center gap-1.5"><Lock aria-hidden className="size-3" /> Ambiente seguro.</span>
              <span className="font-medium text-foreground">Dani Moscatelli Studio</span>
            </SidePanelFooter>
          </>
        )}
      </SidePanelContent>
    </SidePanel>
  );
}
