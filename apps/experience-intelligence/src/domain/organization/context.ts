// Contexto mínimo da organização e nome da pessoa (UX-3a, D-022). Campos opcionais, exceto o nome da
// organização: ajudam a IA a adaptar o plano de investigação. Nenhum dado fiscal. Textos das opções
// conforme o kit de UX (docs/product/ux-onboarding/02-COPY-COMPLETA-E-COMPONENTES.md, tela E).
import { z } from "zod";

export const SEGMENTOS = [
  "Saúde", "Educação", "Hospitalidade e turismo", "Varejo e comércio", "Serviços financeiros", "Tecnologia",
  "Indústria", "Serviços profissionais", "Setor público", "Terceiro setor",
] as const;
/** Valor do seletor de segmento que abre o campo livre. */
export const SEGMENTO_OUTRO = "Outro";
export const NAO_INFORMAR = "nao_informar";

export const TIPOS = {
  privada: "Privada", publica: "Pública", terceiro_setor: "Terceiro setor", outra: "Outra", nao_informar: "Prefiro não informar",
} as const;
export const PORTES = {
  "1_10": "1 a 10 pessoas", "11_50": "11 a 50", "51_200": "51 a 200", "201_mais": "Mais de 200", nao_informar: "Prefiro não informar",
} as const;
export const AREAS = {
  gestao: "Gestão ou liderança", atendimento_operacoes: "Atendimento ou operações", produto_tecnologia: "Produto ou tecnologia",
  pessoas_cultura: "Pessoas e cultura", qualidade_experiencia: "Qualidade ou experiência", outra: "Outro", nao_informar: "Prefiro não informar",
} as const;

type Chaves<T> = [keyof T & string, ...(keyof T & string)[]];
const opcional = <T extends Record<string, string>>(o: T) =>
  z.enum(Object.keys(o) as Chaves<T>).optional().or(z.literal("").transform(() => undefined));
const textoOpcional = (max: number) => z.string().trim().max(max).optional().transform((v) => (v ? v : undefined));

export const OrganizationSetupSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da organização para continuar.").max(120, "Use até 120 caracteres."),
  industry: textoOpcional(80),
  offering: textoOpcional(200),
  org_type: opcional(TIPOS),
  size_band: opcional(PORTES),
  job_area: opcional(AREAS),
});
export type OrganizationSetup = z.infer<typeof OrganizationSetupSchema>;

/** O contexto tem o mínimo que ajuda a IA: segmento ou o que a organização oferece. */
export const contextoIncompleto = (o: { industry: string | null; offering?: string | null }) => !o.industry && !o.offering;

export const DisplayNameSchema = z.string().trim().min(2, "Informe seu nome (pelo menos 2 letras).").max(80, "Use até 80 caracteres.");
