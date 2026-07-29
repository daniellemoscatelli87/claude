import { ArrowDown, MapPin, Sparkles } from 'lucide-react';
import { hero, sectors, sectorsEn } from '../data/profile';
import { useT, useLanguage } from '../i18n/LanguageContext';
import { useUiStrings } from '../hooks/useUiStrings';

export function Hero() {
  const t = useT(hero);
  const { lang } = useLanguage();
  const ui = useUiStrings();
  const sectorList = lang === 'pt' ? sectors : sectorsEn;

  return (
    <section id="hero" className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-blood-700/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-20%] left-[-10%] h-[30rem] w-[30rem] rounded-full bg-graphite-500/30 blur-[110px]"
      />

      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="animate-fade-up">
          <span className="section-eyebrow">{t.eyebrow}</span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t.headline}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-graphite-100 sm:text-lg">{t.subheadline}</p>

          <div className="mt-6 flex items-center gap-2 text-sm text-graphite-200">
            <MapPin size={16} strokeWidth={1.75} className="text-blood-400" />
            {t.location}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#journey" className="solid-btn">
              {t.ctaPrimary}
            </a>
            <a href="#cases" className="outline-btn">
              {t.ctaSecondary}
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {sectorList.map((s) => (
              <span key={s} className="tag-chip">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* XP-style level badge — subtle gamification of "20 years" */}
        <div className="animate-fade-up glass-card flex flex-col items-center gap-4 p-8 text-center" style={{ animationDelay: '150ms' }}>
          <div className="relative flex h-32 w-32 items-center justify-center">
            <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="url(#heroGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={2 * Math.PI * 52 * 0.08}
                className="animate-glow"
              />
              <defs>
                <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#8B1E24" />
                  <stop offset="100%" stopColor="#de6a68" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col items-center">
              <Sparkles size={16} className="mb-1 text-blood-400" strokeWidth={1.75} />
              <span className="text-4xl font-bold text-white">20</span>
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-graphite-200">{t.statLabel}</p>
          <div className="h-px w-full bg-white/10" />
          <div className="grid w-full grid-cols-3 gap-3 text-left">
            <div>
              <p className="text-lg font-bold text-white">9+</p>
              <p className="text-[11px] text-graphite-300">{lang === 'pt' ? 'setores' : 'sectors'}</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">40+</p>
              <p className="text-[11px] text-graphite-300">{lang === 'pt' ? 'certificações' : 'certifications'}</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">3</p>
              <p className="text-[11px] text-graphite-300">{lang === 'pt' ? 'prêmios' : 'awards'}</p>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-graphite-300 transition-colors hover:text-white"
      >
        <span className="text-[11px] uppercase tracking-[0.2em]">{ui.hero.scrollHint}</span>
        <ArrowDown size={16} className="animate-bounce" strokeWidth={1.5} />
      </a>
    </section>
  );
}
