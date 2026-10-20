// Perguntas de enquadramento (fase framing, seção 6.2 da metodologia): pessoas afetadas, local/contexto,
// sinal inicial, resultado desejado e escopo provisório. Regra determinística e transparente: a IA não
// escolhe a próxima pergunta nem autoriza avanço de fase. Linguagem da interface sem termos de metodologia.
import type { Challenge } from "./schemas";

export type UnknownRoute = "find" | "produce" | "ask" | "pending";

export interface UnknownOption {
  route: UnknownRoute;
  label: string;
  instruction: string;
}

export interface FramingQuestion {
  key: "pessoas_afetadas" | "local" | "sinal_inicial" | "resultado_desejado" | "escopo";
  wording: string;
  help: string;
  placeholder: string;
  /** Rotas para quando a pessoa responde "não sei" (seção 9 da metodologia). */
  unknown: UnknownOption[];
  /** A estrutura confirmada já responde a esta pergunta? */
  coveredBy?: (c: Challenge) => boolean;
}

export type AnswerStatus = "answered" | "unknown" | "pending";

export interface QuestionAnswer {
  question_key: string;
  status: AnswerStatus;
  answer_summary: string | null;
  unknown_route: UnknownRoute | null;
}

const LABELS: Record<UnknownRoute, string> = {
  find: "Encontrar a informação",
  produce: "Descobrir na prática",
  ask: "Pedir ajuda a alguém",
  pending: "Deixar para depois",
};
const DEPOIS = "Seguimos com o que você já sabe e voltamos a esta pergunta depois, sem tirar conclusões sobre ela.";
const rotas = (find: string, produce: string, ask: string): UnknownOption[] => [
  { route: "find", label: LABELS.find, instruction: find },
  { route: "produce", label: LABELS.produce, instruction: produce },
  { route: "ask", label: LABELS.ask, instruction: ask },
  { route: "pending", label: LABELS.pending, instruction: DEPOIS },
];

export const FRAMING_QUESTIONS: readonly FramingQuestion[] = [
  {
    key: "pessoas_afetadas",
    wording: "Quem vive essa situação?",
    help: "Pense em quem é atendido e em quem atende: clientes, pacientes, acompanhantes, equipe, parceiros.",
    placeholder: "Ex.: pessoas que chegam para a primeira consulta e a equipe da recepção",
    coveredBy: (c) => c.affected_people.length > 0,
    unknown: rotas(
      "Veja quem aparece nas reclamações, registros de atendimento ou pedidos que motivaram este desafio.",
      "Durante um período normal de trabalho, anote quais tipos de pessoa passam por essa situação, sem registrar nomes ou dados pessoais.",
      "Pergunte a quem trabalha diretamente nesse atendimento quem costuma ser mais afetado.",
    ),
  },
  {
    key: "local",
    wording: "Onde isso acontece?",
    help: "Pode ser uma unidade, um setor, um canal (presencial, telefone, site) ou uma etapa do atendimento.",
    placeholder: "Ex.: recepção da unidade Centro, principalmente pela manhã",
    coveredBy: (c) => Boolean(c.context_json?.site),
    unknown: rotas(
      "Procure em registros de atendimento, ocorrências ou reclamações onde cada caso aconteceu.",
      "Passe pelos locais e canais envolvidos e anote onde a situação aparece mais, sem registrar dados pessoais.",
      "Pergunte às pessoas que atendem em cada local ou canal onde isso acontece com mais frequência.",
    ),
  },
  {
    key: "sinal_inicial",
    wording: "O que fez você perceber essa situação?",
    help: "Reclamações, conversas, números, algo que você viu acontecer. Conte de onde veio a informação.",
    placeholder: "Ex.: três reclamações no último mês e comentários da equipe",
    unknown: rotas(
      "Reúna o que já existe: reclamações, avaliações, mensagens, planilhas ou relatórios de atendimento.",
      "Durante alguns dias, anote cada vez que a situação acontecer, com data e local, sem dados pessoais.",
      "Pergunte a quem trouxe o assunto o que essa pessoa viu ou ouviu.",
    ),
  },
  {
    key: "resultado_desejado",
    wording: "Se isso melhorar, o que muda para as pessoas?",
    help: "Descreva a diferença que as pessoas sentiriam, não a solução que você imagina.",
    placeholder: "Ex.: as pessoas entendem quanto vão esperar e passam esse tempo com mais tranquilidade",
    coveredBy: (c) => Boolean(c.desired_outcome),
    unknown: rotas(
      "Veja se há metas, compromissos ou indicadores já definidos para esse atendimento.",
      "Escreva com suas palavras como seria um dia em que essa situação estivesse resolvida para as pessoas.",
      "Pergunte à liderança e a quem atende o que consideraria uma melhora real.",
    ),
  },
  {
    key: "escopo",
    wording: "Onde a situação começa e onde termina?",
    help: "Isso ajuda a não abraçar tudo de uma vez.",
    placeholder: "Ex.: da chegada da pessoa até ser chamada para o atendimento",
    unknown: rotas(
      "Veja se existe algum fluxo, procedimento ou roteiro de atendimento escrito.",
      "Acompanhe uma vez o caminho completo de uma pessoa nessa situação e anote onde começa e onde termina.",
      "Pergunte a quem conhece o processo de ponta a ponta onde a situação começa e onde termina.",
    ),
  },
];

/**
 * Próxima pergunta de enquadramento. Pula as que a estrutura confirmada já responde e as que já tiveram
 * resposta, "não sei" com rota escolhida ou adiamento. Devolve null quando o enquadramento inicial terminou.
 */
export function nextFramingQuestion(challenge: Challenge, answers: readonly QuestionAnswer[]): FramingQuestion | null {
  if (challenge.structure_status !== "confirmed") return null;
  const respondidas = new Set(answers.map((a) => a.question_key));
  return FRAMING_QUESTIONS.find((q) => !respondidas.has(q.key) && !q.coveredBy?.(challenge)) ?? null;
}

/** Progresso do enquadramento inicial, para mostrar à pessoa quanto falta. */
export function framingProgress(challenge: Challenge, answers: readonly QuestionAnswer[]) {
  const total = FRAMING_QUESTIONS.length;
  const feitas = FRAMING_QUESTIONS.filter((q) => answers.some((a) => a.question_key === q.key) || q.coveredBy?.(challenge)).length;
  return { done: feitas, total };
}

/** Perguntas que ficaram sem resposta ("não sei" ou adiadas): continuam visíveis como pendências. */
export function openItems(answers: readonly QuestionAnswer[]): { question: FramingQuestion; answer: QuestionAnswer }[] {
  return answers
    .filter((a) => a.status !== "answered")
    .map((a) => ({ question: FRAMING_QUESTIONS.find((q) => q.key === a.question_key), answer: a }))
    .filter((x): x is { question: FramingQuestion; answer: QuestionAnswer } => Boolean(x.question));
}

export function findQuestion(key: string): FramingQuestion | undefined {
  return FRAMING_QUESTIONS.find((q) => q.key === key);
}
