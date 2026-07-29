import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Award } from 'lucide-react';
import { flagshipCases } from '../data/cases';
import { useLanguage } from '../i18n/LanguageContext';
import { useUiStrings } from '../hooks/useUiStrings';
import { CaseArtifactTile } from '../components/CaseArtifactIcon';
import { Nav } from '../components/Nav';
import { Footer } from '../components/Footer';

export function CaseDetailPage() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const ui = useUiStrings();
  const caseStudy = flagshipCases.find((c) => c.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!caseStudy) return <Navigate to="/" replace />;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl px-6 pb-32 pt-32">
        <Link to="/#cases" className="inline-flex items-center gap-2 text-xs font-medium text-graphite-300 hover:text-white">
          <ArrowLeft size={14} /> {ui.cases.back}
        </Link>

        <div className="mt-6 animate-fade-up">
          <div className="flex flex-wrap items-center gap-3 text-xs text-graphite-300">
            <span className="font-semibold text-white">{caseStudy.client}</span>
            <span>·</span>
            <span>{caseStudy.period[lang]}</span>
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            {caseStudy.title[lang]}
          </h1>

          <div className="mt-5 flex flex-wrap gap-2">
            {caseStudy.disciplines.map((d) => (
              <span key={d} className="tag-chip">
                {d}
              </span>
            ))}
            {caseStudy.sectors.map((s) => (
              <span key={s} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-graphite-300">
                {s}
              </span>
            ))}
          </div>

          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-blood-400">{ui.cases.context}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-graphite-100">{caseStudy.context[lang]}</p>
          </section>

          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-blood-400">{ui.cases.approach}</h2>
            <ul className="mt-3 space-y-2.5">
              {caseStudy.approach[lang].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed text-graphite-100">
                  <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-white">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-blood-400">{ui.cases.results}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {caseStudy.results.map((r, i) => (
                <div key={i} className="glass-card p-4 text-sm leading-relaxed text-graphite-100">
                  {r[lang]}
                </div>
              ))}
            </div>
          </section>

          {caseStudy.recognition && (
            <section className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-blood-400">{ui.cases.recognition}</h2>
              <div className="mt-3 flex items-start gap-3 rounded-xl border border-blood-600/30 bg-blood-600/5 p-4">
                <Award size={18} className="mt-0.5 shrink-0 text-blood-400" strokeWidth={1.6} />
                <p className="text-sm leading-relaxed text-graphite-100">{caseStudy.recognition[lang]}</p>
              </div>
            </section>
          )}

          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-blood-400">{ui.cases.artifacts}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {caseStudy.artifacts.map((a, i) => (
                <CaseArtifactTile key={i} kind={a.kind} label={a.label[lang]} pendingLabel={ui.cases.artifactPending} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
