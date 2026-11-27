// Gaveta do cadastro do Programa Projeto Piloto (#cadastro-gaveta de projeto-piloto/index.html), com o DS.
// Mesmos campos, textos, tabela (parceiro_piloto), identificador de envio (sem gravar duas vezes) e eventos.
// Peças do DS: SidePanel, Campo, CampoDeEmail, CampoDeTelefone, Select, Textarea, Checkbox, Label, MensagemDeErro,
// Alert, BotaoDeEnvio, EstadoFinal, Button.
import { useEffect, useRef, useState } from "react";
import { ChevronRight, CircleAlert } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { BotaoDeEnvio, type EstadoDoEnvio } from "@/components/ui/botao-de-envio";
import { Button } from "@/components/ui/button";
import { Campo, CampoDeTelefone, MensagemDeErro } from "@/components/ui/campo";
import { CampoDeEmail } from "@/components/ui/campo-de-email";
import { Checkbox } from "@/components/ui/checkbox";
import { EstadoFinal } from "@/components/ui/estado-vazio";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidePanel, SidePanelActions, SidePanelBody, SidePanelContent, SidePanelHeader } from "@/components/ui/side-panel";
import { Textarea } from "@/components/ui/textarea";
import { registrarEvento } from "@/compartilhado/site/navegacao";
import { inserir } from "@/compartilhado/site/supabase";
import { CADASTRO_VAZIO, FALHA_DE_ENVIO, TABELA, TEMPO_LIMITE_MS, linhaDoCadastro, mensagemGeral, validarCadastro, type DadosDoCadastro, type ErrosDoCadastro } from "./cadastro";
import { FRENTES_DO_CADASTRO, SEGMENTOS } from "./conteudo";

const novoId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));

export function GavetaDeCadastro({ aberta, aoMudar }: { aberta: boolean; aoMudar: (aberta: boolean) => void }) {
  const [dados, setDados] = useState<DadosDoCadastro>(CADASTRO_VAZIO);
  const [erros, setErros] = useState<ErrosDoCadastro>({});
  const [geral, setGeral] = useState("");
  const [envio, setEnvio] = useState<EstadoDoEnvio>("parado");
  const [feito, setFeito] = useState(false);
  // O mesmo identificador é reaproveitado se a pessoa reenviar depois de uma falha: o cadastro nunca é gravado duas vezes.
  const envioId = useRef<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (aberta) registrarEvento("cadastro_piloto_aberto");
  }, [aberta]);

  const mudar = <K extends keyof DadosDoCadastro>(k: K, v: DadosDoCadastro[K]) => {
    setDados((d) => ({ ...d, [k]: v }));
    if (erros[k]) setErros((e) => ({ ...e, [k]: undefined }));
  };

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (envio === "enviando") return;
    const lista = validarCadastro(dados);
    setErros(lista);
    const chaves = Object.keys(lista);
    if (chaves.length) {
      setGeral(mensagemGeral(chaves.length));
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setGeral("");
    if (!envioId.current) envioId.current = novoId();
    setEnvio("enviando");
    try {
      await inserir(TABELA, linhaDoCadastro(dados, envioId.current), { aceitarRepetido: true, tempoLimite: TEMPO_LIMITE_MS });
      registrarEvento("cadastro_projeto_piloto");
      setDados(CADASTRO_VAZIO);
      envioId.current = "";
      setFeito(true);
    } catch {
      setGeral(FALHA_DE_ENVIO);
    } finally {
      setEnvio("parado");
    }
  }

  return (
    <SidePanel
      open={aberta}
      onOpenChange={(a) => {
        aoMudar(a);
        if (!a && feito) setTimeout(() => setFeito(false), 300);
      }}
    >
      <SidePanelContent closeLabel="Fechar cadastro">
        <SidePanelHeader eyebrow="Projeto Piloto" title="Cadastre sua empresa" description="Cadastre sua empresa para participar da seleção de futuros projetos-piloto." />
        <SidePanelBody>
          {feito ? (
            <EstadoFinal
              nivel={3}
              titulo="Cadastro recebido"
              descricao="Obrigado pelo interesse no Programa Projeto Piloto. Se houver aderência entre o desafio da sua empresa e um projeto, o Studio entrará em contato. Não há prazo definido para esse contato."
              acoes={<Button variant="outline" size="lg" onClick={() => aoMudar(false)}>Fechar</Button>}
            />
          ) : (
            <form id="form-piloto" ref={formRef} noValidate onSubmit={enviar} className="flex flex-col gap-6 py-2">
              <p className="text-body-sm text-muted-foreground">Campos com <span aria-hidden className="text-primary-text">*</span><span className="sr-only">asterisco</span> são obrigatórios.</p>
              <Campo rotulo="Nome do responsável" obrigatorio autoComplete="name" placeholder="Seu nome completo" value={dados.nome} onChange={(e) => mudar("nome", e.target.value)} erro={erros.nome} />
              <CampoDeEmail rotulo="E-mail corporativo" obrigatorio placeholder="seu.email@empresa.com.br" valor={dados.email} onValorChange={(v) => mudar("email", v)} erro={erros.email} />
              <CampoDeTelefone rotulo="WhatsApp / Telefone" obrigatorio placeholder="(11) 99999-9999" valor={dados.telefone} onValorChange={(v) => mudar("telefone", v)} erro={erros.telefone} />
              <Campo rotulo="Nome da empresa / negócio" obrigatorio autoComplete="organization" placeholder="Nome fantasia ou razão social" value={dados.empresa} onChange={(e) => mudar("empresa", e.target.value)} erro={erros.empresa} />
              <Campo rotulo="Segmento de atuação" obrigatorio erro={erros.segmento}>
                {(p) => (
                  <Select value={dados.segmento} onValueChange={(v) => mudar("segmento", v)}>
                    <SelectTrigger {...p} className="bg-card"><SelectValue placeholder="Selecione um segmento" /></SelectTrigger>
                    <SelectContent>{SEGMENTOS.map((s) => <SelectItem key={s.valor} value={s.valor}>{s.rotulo}</SelectItem>)}</SelectContent>
                  </Select>
                )}
              </Campo>
              <Campo rotulo="Cidade / Estado" obrigatorio autoComplete="address-level2" placeholder="Ex.: Curitiba / PR" value={dados.cidade} onChange={(e) => mudar("cidade", e.target.value)} erro={erros.cidade} />
              <Campo rotulo="Qual experiência ou serviço você gostaria de melhorar?" erro={erros.desafio}>
                {(p) => <Textarea {...p} rows={4} placeholder="Conte brevemente qual é o principal desafio da sua empresa." value={dados.desafio} onChange={(e) => mudar("desafio", e.target.value)} className="bg-card" />}
              </Campo>
              <Campo rotulo="Qual frente de atuação mais se aproxima do seu desafio? (opcional)">
                {(p) => (
                  <Select value={dados.frente} onValueChange={(v) => mudar("frente", v)}>
                    <SelectTrigger {...p} className="bg-card"><SelectValue placeholder="Selecione uma opção" /></SelectTrigger>
                    <SelectContent>{FRENTES_DO_CADASTRO.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                )}
              </Campo>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="piloto-consentimento"
                    checked={dados.consentimento}
                    onCheckedChange={(c) => mudar("consentimento", c === true)}
                    aria-invalid={erros.consentimento ? true : undefined}
                    aria-describedby={erros.consentimento ? "piloto-consentimento-erro" : undefined}
                    className="mt-0.5"
                  />
                  <Label htmlFor="piloto-consentimento" className="block text-body-sm font-normal leading-relaxed text-foreground">
                    Li a{" "}
                    <a href="/privacidade/" target="_blank" rel="noopener" className="rounded-sm font-semibold text-primary-text underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      Política de Privacidade<span className="sr-only"> (abre em nova aba)</span>
                    </a>{" "}
                    e concordo com o uso dos dados informados para avaliação no Programa Projeto Piloto. Estou ciente de que o cadastro é uma manifestação de interesse e não garante seleção. <span aria-hidden className="text-primary-text">*</span>
                  </Label>
                </div>
                {erros.consentimento && <MensagemDeErro id="piloto-consentimento-erro">{erros.consentimento}</MensagemDeErro>}
              </div>
              {geral && (
                <Alert variant="error">
                  <CircleAlert aria-hidden />
                  <AlertTitle>{geral}</AlertTitle>
                </Alert>
              )}
              <p className="text-body-sm text-muted-foreground">Seus dados serão usados apenas para avaliar a participação e entrar em contato.</p>
            </form>
          )}
        </SidePanelBody>
        {!feito && (
          <SidePanelActions>
            <BotaoDeEnvio type="submit" form="form-piloto" size="lg" className="w-full" estado={envio} textos={{ enviando: "Enviando cadastro…" }}>
              Enviar cadastro
              <ChevronRight aria-hidden />
            </BotaoDeEnvio>
          </SidePanelActions>
        )}
      </SidePanelContent>
    </SidePanel>
  );
}
