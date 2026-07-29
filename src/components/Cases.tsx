import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import { flagshipCases, archiveCases } from '../data/cases';
import { useLanguage } from '../i18n/LanguageContext';
import { useUiStrings } from '../hooks/useUiStrings';
import { VaultSection } from './VaultSection';

export function Cases() {
  const { lang } = useLanguage();
  const ui = useUiStrings();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const visibleArchive = archiveOpen ? archiveCases : archiveCases.slice(0, 6);

  return (
    <section id="cases" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl animate-fade-up">
          <span className="section-eyebrow">{ui.cases.eyebrow}</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">{ui.cases.title}</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-graphite-100">{ui.cases.subtitle}</p>
        </div>

        {/* Flagship cases */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {flagshipCases.map((c, i) => (
            <Link
              key={c.slug}
              to={`/cases/${c.slug}`}
              className="glass-card group animate-fade-up flex flex-col justify-between p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blood-600/40"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-graphite-300">{c.client}</p>
                    <p className="text-[11px] text-graphite-400">{c.period[lang]}</p>
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-graphite-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blood-400"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-snug text-white">{c.title[lang]}</h3>
                <p className="mt-3 text-sm leading-relaxed text-graphite-200">{c.summary[lang]}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {c.disciplines.map((d) => (
                  <span key={d} className="tag-chip">
                    {d}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {/* Archive */}
        <div className="mt-20">
          <h3 className="text-xl font-semibold text-white">{ui.cases.archiveTitle}</h3>
          <p className="mt-2 text-sm text-graphite-300">{ui.cases.archiveSubtitle}</p>

          <div className="glass-card mt-6 overflow-hidden">
            <div className="hidden grid-cols-[1.4fr_0.7fr_1.5fr_1.4fr] gap-4 border-b border-white/10 bg-white/[0.03] px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-graphite-300 sm:grid">
              <span>{lang === 'pt' ? 'Cliente' : 'Client'}</span>
              <span>{lang === 'pt' ? 'Período' : 'Period'}</span>
              <span>{lang === 'pt' ? 'Entrega de valor' : 'Value delivered'}</span>
              <span>{lang === 'pt' ? 'Palavras-chave' : 'Keywords'}</span>
            </div>
            <ul className="divide-y divide-white/5">
              {visibleArchive.map((c) => (
                <li
                  key={c.slug}
                  className="grid grid-cols-1 gap-2 px-5 py-4 text-sm sm:grid-cols-[1.4fr_0.7fr_1.5fr_1.4fr] sm:items-center sm:gap-4"
                >
                  <span className="font-medium text-white">{c.client}</span>
                  <span className="text-xs text-graphite-300">{c.period[lang]}</span>
                  <span className="text-graphite-200">{c.oneLiner[lang]}</span>
                  <span className="flex flex-wrap gap-1.5">
                    {c.keywords.map((k) => (
                      <span key={k} className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] text-graphite-100">
                        {k}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {archiveCases.length > 6 && (
            <button
              onClick={() => setArchiveOpen((o) => !o)}
              className="outline-btn mt-6 !px-5 !py-2.5 text-xs"
            >
              {archiveOpen ? (lang === 'pt' ? 'Mostrar menos' : 'Show less') : lang === 'pt' ? `Ver todos (${archiveCases.length})` : `View all (${archiveCases.length})`}
              {archiveOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>

        <VaultSection />
      </div>
    </section>
  );
}
