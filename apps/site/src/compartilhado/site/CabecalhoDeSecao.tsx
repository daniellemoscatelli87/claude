// Cabeçalho das seções do site (Projeto Piloto, Início, Rede de Parceiros): selo, título (com **destaque**) e texto,
// centralizados, entrando ao rolar. Só peças do DS: SurgirAoRolar, Selo e Heading.
import type { ReactNode } from "react";
import { Heading } from "@/components/ui/heading";
import { Selo } from "@/components/ui/selo";
import { SurgirAoRolar } from "@/components/ui/surgir-ao-rolar";

export function CabecalhoDeSecao({ id, selo, titulo, children, escuro = false }: { id: string; selo: string; titulo: string; children?: ReactNode; escuro?: boolean }) {
  return (
    <SurgirAoRolar as="header" escalonar className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
      <Selo tone="primary">{selo}</Selo>
      <Heading level={2} id={id} size="section" className={escuro ? "text-white sm:text-h2" : "sm:text-h2"}>
        {titulo}
      </Heading>
      {children}
    </SurgirAoRolar>
  );
}
