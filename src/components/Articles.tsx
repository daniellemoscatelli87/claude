import { ArrowUpRight, Newspaper } from 'lucide-react';
import { articles } from '../data/articles';
import { useLanguage } from '../i18n/LanguageContext';
import { useUiStrings } from '../hooks/useUiStrings';

export function Articles() {
  const { lang } = useLanguage();
  const ui = useUiStrings();

  return (
    <section id="articles" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl animate-fade-up">
          <span className="section-eyebrow">{ui.articles.eyebrow}</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">{ui.articles.title}</h2>
        </div>

        {articles.length === 0 ? (
          <div className="glass-card mt-10 flex flex-col items-center gap-3 p-14 text-center">
            <Newspaper size={26} className="text-graphite-400" strokeWidth={1.5} />
            <p className="text-sm text-graphite-300">{ui.articles.empty}</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <a
                key={a.url}
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="glass-card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-blood-600/40"
              >
                {a.cover && <img src={a.cover} alt="" className="h-40 w-full object-cover" />}
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs text-graphite-400">{a.date}</p>
                  <h3 className="mt-2 text-base font-semibold text-white">{a.title[lang]}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-graphite-200">{a.excerpt[lang]}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-blood-400">
                    {lang === 'pt' ? 'Ler matéria' : 'Read article'}
                    <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
