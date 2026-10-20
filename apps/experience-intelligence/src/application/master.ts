// Acesso da usuária master (D-011): vê todos os clientes. Cada chamada fica registrada no banco
// (auditoria do cliente e registro da plataforma); não existe leitura direta sem registro.
import type { Session } from "@supabase/supabase-js";
import type { Challenge } from "@/domain/challenge/schemas";
import type { QuestionAnswer } from "@/domain/challenge/framing";
import { supabase } from "@/infrastructure/supabase";

export const isMaster = (s: Session | null) => s?.user?.app_metadata?.ei_master === true;

export interface MasterOrganization { id: string; name: string; industry: string | null; created_at: string; members: number; challenges: number }
export interface MasterChallengeRow { id: string; title: string | null; original_statement: string; current_phase: string; structure_status: string; created_at: string; updated_at: string }

export async function masterOrganizations(): Promise<MasterOrganization[]> {
  const { data, error } = await supabase().rpc("ei_master_organizations");
  if (error) throw error;
  return (data ?? []) as MasterOrganization[];
}

export async function masterChallenges(organizationId: string): Promise<MasterChallengeRow[]> {
  const { data, error } = await supabase().rpc("ei_master_challenges", { p_org: organizationId });
  if (error) throw error;
  return (data ?? []) as MasterChallengeRow[];
}

export async function masterChallenge(id: string): Promise<{ organization_name: string; challenge: Challenge; answers: QuestionAnswer[] } | null> {
  const { data, error } = await supabase().rpc("ei_master_challenge", { p_challenge: id });
  if (error) throw error;
  return data ?? null;
}
