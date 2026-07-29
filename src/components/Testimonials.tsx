import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { testimonials, testimonialsMeta } from '../data/testimonials';
import { useLanguage } from '../i18n/LanguageContext';
import { useUiStrings } from '../hooks/useUiStrings';
import { contact } from '../data/profile';

export function Testimonials() {
  const { lang } = useLanguage();
  const ui = useUiStrings();
  const meta = testimonialsMeta[lang];
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollBy(delta: number) {
    scrollerRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  }

  return (
    <section id="testimonials" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl animate-fade-up">
            <span className="section-eyebrow">{ui.testimonials.eyebrow}</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">{ui.testimonials.title}</h2>
            <p className="mt-3 text-sm text-graphite-300">{meta.totalNote}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={contact.linkedin} target="_blank" rel="noreferrer" className="outline-btn !px-4 !py-2 text-xs">
              {meta.cta}
            </a>
            <button
              onClick={() => scrollBy(-360)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white hover:bg-white/5"
              aria-label="Prev"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scrollBy(360)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white hover:bg-white/5"
              aria-label="Next"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div ref={scrollerRef} className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
          {testimonials.map((t) => (
            <figure key={t.name} className="glass-card w-[320px] shrink-0 snap-start p-6 sm:w-[380px]">
              <Quote size={22} className="text-blood-500/70" strokeWidth={1.5} />
              <blockquote className="mt-4 text-sm leading-relaxed text-graphite-100">"{t.quote[lang]}"</blockquote>
              <figcaption className="mt-5 border-t border-white/10 pt-4">
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-graphite-300">{t.role}</p>
                <p className="mt-1 text-[11px] text-graphite-400">
                  {t.relationship[lang]} · {t.date}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
