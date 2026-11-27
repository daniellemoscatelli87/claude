// Dados da marca usados pelas páginas.
export const NOME_DO_ESTUDIO = "Dani Moscatelli | Experience Design Studio";
export const EMAIL_DE_CONTATO = "contato@danimoscatelli.com.br";
/**
 * O Logo do DS (d2aeb40) desenha os caminhos sem fill-rule="evenodd" (os SVGs oficiais do DS usam evenodd): os
 * miolos de letras como D, o e a saem preenchidos. Como fill-rule é herdado, o site passa evenodd pelo próprio
 * componente (prop do <svg>), sem editar o DS. Correção pedida ao DS: ver SITE_REACT.md, seção 5.
 */
export const LOGO_CORRIGIDO = { fillRule: "evenodd" } as const;
