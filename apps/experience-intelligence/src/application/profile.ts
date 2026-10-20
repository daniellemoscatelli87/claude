// Nome da pessoa (D-022: obrigatório, editável). Guardado no perfil da própria conta (user_metadata),
// que só a própria pessoa altera; não dá acesso a nada.
import type { Session } from "@supabase/supabase-js";
import { DisplayNameSchema } from "@/domain/organization/context";
import { supabase } from "@/infrastructure/supabase";
import { AppError } from "./errors";

export function displayName(session: Session | null): string | null {
  const n = session?.user?.user_metadata?.full_name;
  return typeof n === "string" && n.trim().length >= 2 ? n.trim() : null;
}

export async function saveDisplayName(nome: string): Promise<void> {
  const parsed = DisplayNameSchema.safeParse(nome);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message);
  const { error } = await supabase().auth.updateUser({ data: { full_name: parsed.data } });
  if (error) throw error;
}
