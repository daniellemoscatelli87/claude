// Casos de uso do desafio (Corte 2). Toda escrita passa pelas funções do banco, que conferem o papel
// do membro e gravam versão e auditoria na mesma transação.
import {
  ChallengeStructureSchema, StatementSchema, buildStructurePayload,
  type Challenge, type ChallengeStructure, type StructureSource,
} from "@/domain/challenge/schemas";
import type { AnswerStatus, FramingQuestion, QuestionAnswer, UnknownRoute } from "@/domain/challenge/framing";
import { supabase } from "@/infrastructure/supabase";
import { AppError } from "./errors";

const CAMPOS = "id, organization_id, owner_id, title, original_statement, current_problem_statement, desired_outcome, affected_people, context_json, known_information, unknown_information, structure_status, current_phase, status, risk_level, created_at, updated_at";

export async function listChallenges(organizationId: string): Promise<Challenge[]> {
  const { data, error } = await supabase().from("challenges").select(CAMPOS).eq("organization_id", organizationId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Challenge[];
}

/** Devolve o desafio somente se a pessoa for membro da organização dele; caso contrário, null. */
export async function getChallenge(id: string): Promise<Challenge | null> {
  const { data, error } = await supabase().from("challenges").select(CAMPOS).eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Challenge) ?? null;
}

export async function createChallenge(organizationId: string, statement: string): Promise<string> {
  const parsed = StatementSchema.safeParse(statement);
  if (!parsed.success) throw new AppError("Conte um pouco mais: use de 10 a 4.000 caracteres.");
  // O texto é gravado exatamente como a pessoa escreveu (sem cortar espaços internos ou reescrever).
  const { data, error } = await supabase().rpc("ei_create_challenge", { p_org: organizationId, p_statement: statement });
  if (error) throw error;
  return data as string;
}

export interface Interpretation {
  proposal: ChallengeStructure;
  meta: { model: string; prompt_version: string };
}
export type InterpretationFailure = "ocupado" | "sem_chave" | "limite" | "desativado" | "sem_acesso" | "falha";
const FALHAS: readonly string[] = ["ocupado", "sem_chave", "limite", "desativado", "sem_acesso"];
/** Traduz o código devolvido pela função da IA; qualquer outro vira "falha". */
export function interpretationFailure(code: unknown): InterpretationFailure {
  return typeof code === "string" && FALHAS.includes(code) ? (code as InterpretationFailure) : "falha";
}
/** Falhas em que tentar de novo não adianta (e só gastaria uso da IA). */
export const canRetryInterpretation = (f: InterpretationFailure) => f === "ocupado" || f === "falha";

/** Pede à IA uma proposta de estrutura. Nada é gravado no desafio: é uma sugestão para revisar.
 *  Se a sugestão já foi feita para este desafio, o servidor devolve a guardada sem chamar a IA. */
export async function interpretChallenge(id: string): Promise<{ ok: true; value: Interpretation } | { ok: false; reason: InterpretationFailure }> {
  const { data, error } = await supabase().functions.invoke("ei-interpretar-desafio", { body: { challenge_id: id } });
  if (error) {
    let code: string = "falha";
    try { code = (await (error as { context?: Response }).context?.json())?.error || code; } catch { /* resposta sem corpo */ }
    return { ok: false, reason: interpretationFailure(code) };
  }
  const parsed = ChallengeStructureSchema.safeParse(data?.proposal);
  if (!parsed.success) return { ok: false, reason: "falha" };
  return { ok: true, value: { proposal: parsed.data, meta: data.meta } };
}

export async function confirmStructure(id: string, structure: unknown, source: StructureSource, aiMeta?: Interpretation["meta"], reason?: string) {
  const payload = buildStructurePayload(structure);
  const { error } = await supabase().rpc("ei_confirm_structure", {
    p_challenge: id, p_structure: payload, p_reason: reason ?? "", p_source: source, p_ai_meta: aiMeta ?? {},
  });
  if (error) throw error;
}

export async function listAnswers(challengeId: string): Promise<QuestionAnswer[]> {
  const { data, error } = await supabase()
    .from("investigation_questions").select("question_key, status, answer_summary, unknown_route").eq("challenge_id", challengeId);
  if (error) throw error;
  return (data ?? []) as QuestionAnswer[];
}

export async function answerQuestion(challengeId: string, q: FramingQuestion, status: AnswerStatus, answer?: string, route?: UnknownRoute) {
  if (status === "answered" && !answer?.trim()) throw new AppError("Escreva a resposta ou escolha \"Não sei\".");
  const { error } = await supabase().rpc("ei_answer_question", {
    p_challenge: challengeId, p_key: q.key, p_wording: q.wording, p_status: status,
    p_answer: status === "answered" ? answer!.trim() : null, p_route: status === "answered" ? null : route ?? "pending",
  });
  if (error) throw error;
}
