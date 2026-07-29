import { GraduationCap, Languages as LanguagesIcon } from 'lucide-react';
import { about, education, languages } from '../data/profile';
import { useT } from '../i18n/LanguageContext';

export function About() {
  const t = useT(about);
  const edu = useT(education);
  const langs = useT(languages);

  return (
    <section id="about" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <div className="animate-fade-up">
            <span className="section-eyebrow">{t.eyebrow}</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">{t.title}</h2>
            <div className="mt-6 space-y-4">
              {t.paragraphs.map((p, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-graphite-100">
                  {p}
                </p>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {t.highlights.map((h) => (
                <div key={h.label} className="glass-card p-4 text-center">
                  <p className="text-2xl font-bold text-blood-400">{h.value}</p>
                  <p className="mt-1 text-[11px] leading-tight text-graphite-200">{h.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-fade-up flex flex-col gap-6" style={{ animationDelay: '120ms' }}>
            <div className="glass-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <GraduationCap size={18} strokeWidth={1.75} className="text-blood-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                  {t.eyebrow === 'Sobre' ? 'Formação acadêmica' : 'Education'}
                </h3>
              </div>
              <ul className="space-y-4">
                {edu.map((e) => (
                  <li key={e.degree} className="border-l-2 border-white/10 pl-4">
                    <p className="text-sm font-medium text-white">{e.degree}</p>
                    <p className="text-xs text-graphite-300">
                      {e.school} · {e.period}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <LanguagesIcon size={18} strokeWidth={1.75} className="text-blood-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                  {t.eyebrow === 'Sobre' ? 'Idiomas' : 'Languages'}
                </h3>
              </div>
              <ul className="space-y-3">
                {langs.map((l) => (
                  <li key={l.name} className="flex items-center justify-between text-sm">
                    <span className="text-white">{l.name}</span>
                    <span className="text-xs text-graphite-300">{l.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
