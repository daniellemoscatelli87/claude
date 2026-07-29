import { Link2 } from 'lucide-react';
import { timeline } from '../data/timeline';
import { useLanguage } from '../i18n/LanguageContext';
import { useUiStrings } from '../hooks/useUiStrings';

export function Journey() {
  const { lang } = useLanguage();
  const ui = useUiStrings();

  return (
    <section id="journey" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="max-w-2xl animate-fade-up">
          <span className="section-eyebrow">{ui.journey.eyebrow}</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">{ui.journey.title}</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-graphite-100">{ui.journey.subtitle}</p>
        </div>

        <ol className="relative mt-14 space-y-8 border-l border-white/10 pl-8 sm:pl-10">
          {timeline.map((entry, i) => (
            <li key={entry.id} className="animate-fade-up relative" style={{ animationDelay: `${i * 60}ms` }}>
              <span
                className={`absolute -left-[41px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full border sm:-left-[49px] ${
                  entry.parallel
                    ? 'border-graphite-300 bg-graphite-800'
                    : 'border-blood-500 bg-blood-600 shadow-[0_0_14px_2px_rgba(139,30,36,0.55)]'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>

              <div className="glass-card p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="tag-chip border-blood-600/40 bg-blood-600/10 text-blood-300">{entry.tag[lang]}</span>
                  {entry.parallel && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-graphite-300">
                      <Link2 size={12} /> {ui.journey.parallelNote}
                    </span>
                  )}
                </div>

                <h3 className="mt-3 text-lg font-semibold leading-snug text-white sm:text-xl">{entry.impactTitle[lang]}</h3>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-graphite-300">
                  <span className="font-medium text-graphite-100">{entry.role[lang]}</span>
                  <span>·</span>
                  <span>{entry.org}</span>
                  <span>·</span>
                  <span>{entry.period[lang]}</span>
                  <span className="text-graphite-400">({entry.duration[lang]})</span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-graphite-100">{entry.summary[lang]}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {entry.keywords.map((k) => (
                    <span key={k} className="tag-chip">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
