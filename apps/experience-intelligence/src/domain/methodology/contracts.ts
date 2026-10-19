// Contratos do Methodology Engine (seção 5 da metodologia), preparados para o Corte 3.
// Somente tipos: nada do motor de condução está implementado neste incremento.
import type { Phase } from "../challenge/schemas";

export type ActionType =
  | "ask_question"
  | "guided_activity"
  | "request_evidence"
  | "summarize"
  | "review_hypothesis"
  | "propose_experiment"
  | "measure"
  | "escalate";

/** Próxima melhor ação calculada por regras explícitas; a IA apenas adapta a linguagem dentro deste formato. */
export interface NextBestAction {
  action_type: ActionType;
  goal: string;
  user_facing_title: string;
  user_facing_instruction: string;
  steps: string[];
  expected_fields: string[];
  method_protocol_id: string;
  /** Motivo interno da escolha; aparece em auditoria e modo especialista, não na interface padrão. */
  why_now_internal: string;
  safety_notes: string[];
  completion_rule: string;
  blocking: boolean;
  allow_skip_with_reason: boolean;
}

/** Protocolo metodológico versionado (seção 7). */
export interface MethodProtocol {
  id: string;
  version: string;
  purpose: string;
  applies_when: string;
  avoid_when: string;
  required_permissions: string[];
  inputs: string[];
  outputs: string[];
  user_steps: string[];
  quality_checks: string[];
  failure_recovery: string;
  source_ids: string[];
}

/** Classificação epistêmica de toda informação registrada (seção 4.3). */
export type EvidenceKind =
  | "stakeholder_claim"
  | "participant_report"
  | "direct_observation"
  | "operational_record"
  | "measurement"
  | "inference"
  | "validated_learning";

/** Entrada mínima que o motor receberá no Corte 3. */
export interface EngineInput {
  challenge_id: string;
  organization_id: string;
  phase: Phase;
}
