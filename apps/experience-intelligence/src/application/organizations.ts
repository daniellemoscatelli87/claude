// Casos de uso de organização (Corte 1).
import { OrganizationInputSchema, type Role } from "@/domain/challenge/schemas";
import { supabase } from "@/infrastructure/supabase";
import { AppError } from "./errors";

export interface MyOrganization {
  id: string;
  name: string;
  industry: string | null;
  role: Role;
}

/** Organizações das quais a pessoa é membro (o banco devolve somente essas). */
export async function listMyOrganizations(): Promise<MyOrganization[]> {
  const { data: auth } = await supabase().auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase()
    .from("organization_members")
    .select("role, organizations ( id, name, industry )")
    .eq("user_id", auth.user.id)
    .order("created_at");
  if (error) throw error;
  return (data ?? [])
    .map((m: { role: Role; organizations: unknown }) => {
      const o = (Array.isArray(m.organizations) ? m.organizations[0] : m.organizations) as { id: string; name: string; industry: string | null } | null;
      return o ? { ...o, role: m.role } : null;
    })
    .filter((o): o is MyOrganization => o !== null);
}

export async function createOrganization(input: unknown): Promise<string> {
  const parsed = OrganizationInputSchema.safeParse(input);
  if (!parsed.success) throw new AppError("Informe o nome da organização (de 2 a 120 caracteres).");
  const { data, error } = await supabase().rpc("ei_create_organization", { p_name: parsed.data.name, p_industry: parsed.data.industry ?? null });
  if (error) throw error;
  return data as string;
}

const CHAVE_ATUAL = "dm-ei-organizacao";
export function currentOrganizationId(): string | null {
  try { return localStorage.getItem(CHAVE_ATUAL); } catch { return null; }
}
export function setCurrentOrganizationId(id: string) {
  try { localStorage.setItem(CHAVE_ATUAL, id); } catch { /* navegador sem armazenamento: segue sem lembrar */ }
}
