// Conteúdo do aviso de privacidade da fase de testes (texto em src/domain/privacy/aviso.ts).
import { AVISO_SECOES, AVISO_VERSAO } from "@/domain/privacy/aviso";

export function AvisoPrivacidade() {
  return (
    <>
      {AVISO_SECOES.map((s) => (
        <section key={s.titulo} className="mt-5 first:mt-0">
          <h3 className="mt-0 mb-1.5 text-base leading-snug font-bold tracking-normal text-foreground">{s.titulo}</h3>
          <ul className="m-0 list-disc space-y-1 pl-5 text-[0.9375rem] leading-relaxed text-foreground/85">{s.itens.map((i) => <li key={i}>{i}</li>)}</ul>
        </section>
      ))}
      <p className="mt-5 mb-0 text-[0.8125rem] text-muted-foreground">Versão {AVISO_VERSAO}. Este aviso vale para a fase de testes; a política de privacidade definitiva será publicada antes do lançamento.</p>
    </>
  );
}
