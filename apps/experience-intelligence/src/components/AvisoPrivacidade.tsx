// Conteúdo do aviso de privacidade da fase de testes (texto em src/domain/privacy/aviso.ts).
import { AVISO_SECOES, AVISO_VERSAO } from "@/domain/privacy/aviso";

export function AvisoPrivacidade() {
  return (
    <>
      {AVISO_SECOES.map((s) => (
        <section key={s.titulo}>
          <h3>{s.titulo}</h3>
          <ul>{s.itens.map((i) => <li key={i}>{i}</li>)}</ul>
        </section>
      ))}
      <p className="hint">Versão {AVISO_VERSAO}. Este aviso vale para a fase de testes; a política de privacidade definitiva será publicada antes do lançamento.</p>
    </>
  );
}
