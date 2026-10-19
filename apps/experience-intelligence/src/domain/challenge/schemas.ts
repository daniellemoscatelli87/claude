// Challenge Model (docs/product/CHALLENGE_METHODOLOGY.md, seção 4). Regras de validação do desafio,
// independentes de tela e de banco. O texto original (original_statement) nunca faz parte da estrutura
// editável: ele é gravado uma única vez e preservado.
import { z } from "zod";

export const PHASES = ["intake", "framing", "discovery", "sensemaking", "opportunities", "experiment", "measurement", "continuous"] as const;
export type Phase = (typeof PHASES)[number];

export const ROLES = ["org_admin", "manager", "contributor", "viewer", "studio_consultant"] as const;
export type Role = (typeof ROLES)[number];
/** Papéis que podem criar e editar desafios. */
export const WRITER_ROLES: readonly Role[] = ["org_admin", "manager", "contributor"];

const texto = (min: number, max: number) => z.string().trim().min(min).max(max);
const lista = (maxItens: number, maxTexto: number) =>
  z.array(z.string().trim().min(1).max(maxTexto)).max(maxItens).transform((itens) => [...new Set(itens)]);

export const OrganizationInputSchema = z.object({
  name: texto(2, 120),
  industry: z.string().trim().max(80).optional().transform((v) => (v ? v : undefined)),
});
export type OrganizationInput = z.infer<typeof OrganizationInputSchema>;

/** Descrição livre do desafio, como a pessoa escreveu. */
export const StatementSchema = texto(10, 4000);

export const ChallengeContextSchema = z.object({
  industry: z.string().trim().max(80).optional(),
  department: z.string().trim().max(120).optional(),
  channels: lista(8, 60).default([]),
  site: z.string().trim().max(200).optional(),
});
export type ChallengeContext = z.infer<typeof ChallengeContextSchema>;

/** Estrutura editável do desafio (proposta pela IA ou escrita pela pessoa). */
export const ChallengeStructureSchema = z
  .object({
    title: texto(3, 120),
    desired_outcome: z.string().trim().max(600).default(""),
    affected_people: lista(10, 120).default([]),
    context: ChallengeContextSchema.default({ channels: [] }),
    known_information: lista(15, 300).default([]),
    unknown_information: lista(15, 300).default([]),
  })
  .strict();
export type ChallengeStructure = z.infer<typeof ChallengeStructureSchema>;

export type StructureSource = "ai_accepted" | "ai_edited" | "manual";

/** Desafio como lido do banco. */
export interface Challenge {
  id: string;
  organization_id: string;
  owner_id: string;
  title: string | null;
  original_statement: string;
  current_problem_statement: string | null;
  desired_outcome: string | null;
  affected_people: string[];
  context_json: ChallengeContext;
  known_information: string[];
  unknown_information: string[];
  structure_status: "pending" | "confirmed";
  current_phase: Phase;
  status: "active" | "paused" | "completed" | "archived";
  risk_level: "low" | "moderate" | "high" | "critical" | null;
  created_at: string;
  updated_at: string;
}

/**
 * Monta a estrutura a ser gravada. Valida os campos e descarta qualquer tentativa de incluir o texto original
 * (ele não pode ser editado por este caminho).
 */
export function buildStructurePayload(input: unknown): ChallengeStructure {
  const semOriginal = input && typeof input === "object" ? { ...(input as Record<string, unknown>) } : input;
  if (semOriginal && typeof semOriginal === "object") delete (semOriginal as Record<string, unknown>).original_statement;
  return ChallengeStructureSchema.parse(semOriginal);
}

/** Origem da estrutura confirmada: sugestão da IA aceita, editada ou escrita do zero. */
export function structureSource(proposal: ChallengeStructure | null, confirmed: ChallengeStructure): StructureSource {
  if (!proposal) return "manual";
  return JSON.stringify(normalizar(proposal)) === JSON.stringify(normalizar(confirmed)) ? "ai_accepted" : "ai_edited";
}

function normalizar(s: ChallengeStructure) {
  const ordenar = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== "").sort(([a], [b]) => a.localeCompare(b)));
  return ordenar({ ...s, context: ordenar(s.context as Record<string, unknown>) });
}
