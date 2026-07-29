import { clients } from '../data/clients';
import { useUiStrings } from '../hooks/useUiStrings';

export function Clients() {
  const ui = useUiStrings();

  return (
    <section id="clients" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl animate-fade-up">
          <span className="section-eyebrow">{ui.clients.eyebrow}</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">{ui.clients.title}</h2>
          <p className="mt-3 text-xs text-graphite-400">{ui.clients.note}</p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {clients.map((c) => (
            <span
              key={c}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium tracking-tight text-graphite-100 transition-colors hover:border-white/25 hover:text-white"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
