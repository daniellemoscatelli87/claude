// Cenas da simulação "Da conexão à colaboração" (as telas de exemplo das etapas do match da página de HTML), feitas só
// com peças do DS: MockDeCampo (os campos de exemplo, digitados quando a cena aparece), LinhaDeDado, ChipDeEstado,
// Badge, Avatar, Conversa e Quadro. Tudo é ilustração (pessoas fictícias); não há campos nem botões de verdade.
import { CheckCircle2, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LinhaDeDado } from "@/components/ui/cadastro-em-etapas";
import { GradeDeCampos } from "@/components/ui/campo";
import { ChipDeEstado } from "@/components/ui/chip-de-estado";
import { BalaoDaConversa, Conversa } from "@/components/ui/conversa";
import { Quadro } from "@/components/ui/quadro";
import { MockDeCampo } from "@/components/ui/simulacao";
import { AVATAR, QUADRO, RANKING, TALENTOS, type Pessoa } from "./conteudo";

function Foto({ foto, iniciais, nome, tamanho = "size-8" }: { foto?: number; iniciais?: string; nome: string; tamanho?: string }) {
  return (
    <Avatar className={tamanho}>
      {foto ? <AvatarImage src={AVATAR(foto)} alt="" /> : null}
      <AvatarFallback>{iniciais ?? nome.split(" ").map((p) => p[0]).join("").slice(0, 2)}</AvatarFallback>
    </Avatar>
  );
}

/** Título de um bloco da cena, com uma linha de apoio opcional. */
function TituloDaCena({ titulo, apoio, depois }: { titulo: string; apoio?: string; depois?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-body-sm font-bold text-foreground">{titulo}</p>
        {apoio && <p className="text-label text-muted-foreground">{apoio}</p>}
      </div>
      {depois}
    </div>
  );
}

function ListaDeTalentos() {
  return (
    <div className="flex flex-col gap-3">
      <TituloDaCena titulo="Ecossistema de Talentos" depois={<Badge variant="outline">Novo projeto</Badge>} />
      <ul className="grid gap-2 @min-[28rem]/cena:grid-cols-2">
        {TALENTOS.map((p: Pessoa) => (
          <li key={p.nome} className="flex items-center gap-3 rounded-lg border bg-card p-2">
            <Foto foto={p.foto} iniciais={p.iniciais} nome={p.nome} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-label font-bold text-foreground">{p.nome}</span>
              <span className="block truncate text-label text-muted-foreground">{p.area} · {p.nivel}</span>
            </span>
            {p.nome === "Marina Alves" && <ChipDeEstado tom="marca">Novo</ChipDeEstado>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CenaCadastro() {
  return (
    <div className="@container/cena flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
        <TituloDaCena titulo="Quero ser parceiro" apoio="Cadastro na Rede de Parceiros" />
        <GradeDeCampos>
          <MockDeCampo rotulo="Nome completo" valor="Marina Alves" obrigatorio digitar />
          <MockDeCampo rotulo="E-mail" valor="marina@email.com" obrigatorio digitar atraso={900} />
          <MockDeCampo rotulo="Especialidade principal" valor="UX Research" obrigatorio digitar atraso={1900} largo />
          <MockDeCampo rotulo="Tempo de experiência" tipo="selecao" valor="Entre 6 e 10 anos" opcoes={["Entre 3 e 5 anos", "Entre 6 e 10 anos", "Mais de 10 anos"]} obrigatorio />
          <MockDeCampo rotulo="Senioridade" tipo="selecao" valor="Sênior" opcoes={["Pleno", "Sênior", "Especialista"]} obrigatorio />
          <MockDeCampo rotulo="Setores em que já atuou" tipo="opcoes" opcoes={["Saúde", "Educação", "Varejo", "Indústria"]} selecionadas={["Saúde", "Educação", "Varejo", "Indústria"]} obrigatorio largo />
        </GradeDeCampos>
        <ChipDeEstado tom="sucesso" icone={<CheckCircle2 />} className="self-end">Cadastro enviado</ChipDeEstado>
      </div>
      <ListaDeTalentos />
    </div>
  );
}

export function CenaOportunidades() {
  return (
    <div className="@container/cena flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
        <TituloDaCena titulo="Novo projeto" apoio="Descreva o desafio para encontrarmos os profissionais mais compatíveis." />
        <MockDeCampo rotulo="Briefing do projeto" tipo="area" valor="Um centro médico recebe muitas reclamações no atendimento. Queremos entender a jornada do paciente e propor melhorias no serviço." digitar />
        <div className="flex flex-col gap-1">
          <p className="text-label font-semibold text-muted-foreground">Especialidades desejadas</p>
          <p className="flex flex-wrap gap-1">{["Pesquisa com usuários", "Jornada do paciente", "Saúde"].map((e) => <Badge key={e} variant="outline">{e}</Badge>)}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-label font-semibold text-muted-foreground">Nível de senioridade</p>
          <p className="flex flex-wrap gap-1">{["Júnior", "Pleno", "Sênior", "Especialista"].map((e) => <Badge key={e} variant={e === "Sênior" ? "default" : "outline"}>{e}</Badge>)}</p>
        </div>
      </div>
      <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
        <Sparkles aria-hidden className="mt-0.5 size-4 shrink-0 text-primary-text" />
        <div className="min-w-0">
          <p className="text-body-sm font-bold text-foreground">Análise de competências por IA</p>
          <p className="text-label text-muted-foreground">Cruzando o briefing com as competências da rede…</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
        <TituloDaCena titulo="Novo desafio" apoio="Reduzir reclamações no atendimento de um centro médico" />
        <p className="text-label font-semibold text-muted-foreground">Perfil aderente</p>
        <div className="flex items-center gap-3">
          <Foto foto={5} nome="Marina Alves" tamanho="size-10" />
          <div className="min-w-0 flex-1">
            <p className="text-body-sm font-bold text-foreground">Marina Alves</p>
            <p className="text-label text-muted-foreground">UX Research · Sênior · 8 anos</p>
          </div>
          <ChipDeEstado tom="sucesso">94% compatível</ChipDeEstado>
        </div>
        <p className="text-label text-muted-foreground">Alta compatibilidade com o desafio.</p>
        <p className="text-label font-semibold text-muted-foreground">Critérios atendidos</p>
        <dl className="grid gap-x-6 @min-[28rem]/cena:grid-cols-2">
          <LinhaDeDado rotulo="Especialidade" valor="Pesquisa com usuários" />
          <LinhaDeDado rotulo="Especialidade" valor="Jornada do paciente" />
          <LinhaDeDado rotulo="Setor" valor="Saúde" />
          <LinhaDeDado rotulo="Senioridade" valor="Sênior" />
        </dl>
        <ul className="flex flex-wrap gap-2 border-t pt-3">
          {RANKING.slice(1).map((r) => (
            <li key={r.nome} className="flex items-center gap-2 text-label text-muted-foreground">
              <Foto foto={r.foto} nome={r.nome} tamanho="size-6" />
              {r.nome} · {r.pct}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function CenaConvite() {
  return (
    <div className="@container/cena flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
        <TituloDaCena titulo="Marina Alves" apoio="online" />
        <Conversa>
          <BalaoDaConversa autor="eu" nome="Dani Moscatelli">Olá, Marina! Temos um desafio em Saúde que combina com o seu perfil. Tem interesse?</BalaoDaConversa>
          <BalaoDaConversa autor="outro" nome="Marina Alves">Obrigada pelo convite! Infelizmente, não tenho disponibilidade no momento.</BalaoDaConversa>
          <BalaoDaConversa autor="eu" nome="Dani Moscatelli">Obrigado pela devolutiva, Marina! Fica para uma próxima oportunidade.</BalaoDaConversa>
        </Conversa>
      </div>
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
        <TituloDaCena titulo="Ranking de compatibilidade" apoio="Perfis ordenados pela aderência ao desafio" depois={<Badge variant="outline">Projeto · Jornada do Paciente</Badge>} />
        <ol className="flex flex-col divide-y">
          {RANKING.map((r) => (
            <li key={r.nome} className="flex flex-wrap items-center gap-3 py-2">
              <span className="w-6 text-label font-bold tabular-nums text-muted-foreground">{r.pos}</span>
              <Foto foto={r.foto} nome={r.nome} />
              <span className="min-w-0 flex-1">
                <span className="block text-label font-bold text-foreground">{r.nome} · {r.pct}</span>
                {r.nota && <span className="block text-label text-muted-foreground">{r.nota}</span>}
              </span>
              <ChipDeEstado tom={r.tom}>{r.estado}</ChipDeEstado>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
        <Foto foto={3} nome="Juliana Prado" tamanho="size-10" />
        <div className="min-w-0">
          <p className="text-body-sm font-bold text-foreground">Juliana Prado aceitou o convite</p>
          <p className="text-label text-muted-foreground">Tem disponibilidade imediata para iniciar no projeto.</p>
        </div>
      </div>
    </div>
  );
}

export function CenaColaboracao() {
  return (
    <div className="@container/cena flex flex-col gap-4">
      <TituloDaCena titulo="Colaborações em projetos" apoio="Exemplos ilustrativos" />
      <Quadro
        rotulo="Colaborações em projetos (exemplos ilustrativos)"
        colunas={QUADRO.map((c) => ({
          id: c.id,
          titulo: c.titulo,
          tom: c.tom,
          cartoes: c.pessoas.map((p) => ({
            id: p.nome,
            titulo: p.nome,
            descricao: p.cargo,
            etiqueta: <ChipDeEstado tom={c.tom === "sucesso" ? "sucesso" : c.tom === "info" ? "info" : "marca"}>{p.tag}</ChipDeEstado>,
            pessoa: <Foto foto={"foto" in p ? p.foto : undefined} iniciais={"iniciais" in p ? p.iniciais : undefined} nome={p.nome} />,
          })),
        }))}
      />
    </div>
  );
}
