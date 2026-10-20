// Casos de uso de organização (Corte 1).
import { OrganizationInputSchema, type Role } from "@/domain/challenge/schemas";
import { OrganizationSetupSchema } from "@/domain/organization/context";
import { supabase } from "@/infrastructure/supabase";
import { AppError } from "./errors";

export interface MyOrganization {
  id: string;
  name: string;
  industry: string | null;
  offering: string | null;
  org_type: string | null;
  size_band: string | null;
  role: Role;
  job_area: string | null;
}
type OrgRow = Pick<MyOrganization, "id" | "name" | "industry" | "offering" | "org_type" | "size_band">;

/** Organizações das quais a pessoa é membro (o banco devolve somente essas). */
export async function listMyOrganizations(): Promise<MyOrganization[]> {
  const { data: auth } = await supabase().auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase()
    .from("organization_members")
    .select("role, job_area, organizations ( id, name, industry, offering, org_type, size_band )")
    .eq("user_id", auth.user.id)
    .order("created_at");
  if (error) throw error;
  return (data ?? [])
    .map((m: { role: Role; job_area: string | null; organizations: unknown }) => {
      const o = (Array.isArray(m.organizations) ? m.organizations[0] : m.organizations) as OrgRow | null;
      return o ? { ...o, role: m.role, job_area: m.job_area } : null;
    })
    .filter((o): o is MyOrganization => o !== null);
}

/** A pessoa pode usar a plataforma na fase de testes (lista de convidadas ou master). */
export async function hasPlatformAccess(): Promise<boolean> {
  const { data, error } = await supabase().rpc("ei_has_access");
  if (error) throw error;
  return data === true;
}

/** Cria a organização já com o contexto mínimo (UX-3a). Quem cria passa a administrá-la. */
export async function setupOrganization(input: unknown): Promise<string> {
  const parsed = OrganizationSetupSchema.safeParse(input);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message);
  const d = parsed.data;
  const { data, error } = await supabase().rpc("ei_setup_organization", {
    p_name: d.name, p_industry: d.industry ?? null, p_offering: d.offering ?? null,
    p_org_type: d.org_type ?? null, p_size_band: d.size_band ?? null, p_job_area: d.job_area ?? null,
  });
  if (error) throw error;
  return data as string;
}

/** Atualiza o contexto da organização (só administração) e a área de quem está editando. */
export async function updateOrganizationContext(orgId: string, input: unknown, canEditOrg: boolean): Promise<void> {
  const parsed = OrganizationSetupSchema.safeParse(input);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message);
  const d = parsed.data;
  if (canEditOrg) {
    const { error } = await supabase().rpc("ei_update_organization_context", {
      p_org: orgId, p_name: d.name, p_industry: d.industry ?? null, p_offering: d.offering ?? null,
      p_org_type: d.org_type ?? null, p_size_band: d.size_band ?? null,
    });
    if (error) throw error;
  }
  const { error } = await supabase().rpc("ei_update_my_job_area", { p_org: orgId, p_job_area: d.job_area ?? null });
  if (error) throw error;
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
