// Indicador do cadastro em etapas (D-025): 1) seus dados; 2) empresa ou negócio.
const NOMES = ["Seus dados", "Empresa ou negócio"] as const;

export function Etapas({ atual }: { atual: 1 | 2 }) {
  return (
    <nav className="etapas" aria-label={`Etapa ${atual} de ${NOMES.length} do cadastro`}>
      <p className="etapas-texto">Etapa {atual} de {NOMES.length} · {NOMES[atual - 1]}</p>
      <ol>
        {NOMES.map((n, i) => (
          <li key={n} className={i + 1 < atual ? "feita" : i + 1 === atual ? "atual" : ""} aria-current={i + 1 === atual ? "step" : undefined}>
            <span className="sr-only">{n}{i + 1 < atual ? " (concluída)" : ""}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
