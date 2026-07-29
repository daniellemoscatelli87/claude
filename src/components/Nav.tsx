import { useEffect, useState } from 'react';
import { Menu, X, Languages } from 'lucide-react';
import { Logo } from './Logo';
import { useLanguage } from '../i18n/LanguageContext';
import { useUiStrings } from '../hooks/useUiStrings';

const SECTION_IDS = ['about', 'journey', 'cases', 'testimonials', 'articles', 'clients', 'contact'];

export function Nav() {
  const { lang, toggle } = useLanguage();
  const ui = useUiStrings();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('about');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const items = SECTION_IDS.map((id) => ({ id, label: (ui.nav as Record<string, string>)[id] ?? id }));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-white/10 bg-graphite-900/80 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <a href="#hero" aria-label="Home">
          <Logo />
        </a>

        {/* Journey progress trail — gamified scroll-spy nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Section navigation">
          {items.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`group relative flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                active === id ? 'text-white' : 'text-graphite-200 hover:text-white'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  active === id ? 'scale-125 bg-blood-500 shadow-[0_0_8px_2px_rgba(139,30,36,0.7)]' : 'bg-white/20 group-hover:bg-white/40'
                }`}
              />
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggle}
            className="outline-btn !px-3 !py-2 text-xs sm:!px-4"
            aria-label={ui.nav.langSwitch}
            title={ui.nav.langSwitch}
          >
            <Languages size={14} strokeWidth={1.75} />
            {lang === 'pt' ? 'PT' : 'EN'} <span className="text-graphite-300">/</span>{' '}
            <span className="text-graphite-400">{lang === 'pt' ? 'EN' : 'PT'}</span>
          </button>
          <a href="#contact" className="solid-btn hidden !px-5 !py-2 text-xs sm:inline-flex">
            {ui.nav.contact}
          </a>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-graphite-900/95 px-6 py-4 backdrop-blur-xl lg:hidden">
          <ul className="flex flex-col gap-1">
            {items.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm text-graphite-100 hover:bg-white/5 hover:text-white"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${active === id ? 'bg-blood-500' : 'bg-white/20'}`} />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
