import { BarChart3, Compass, LayoutGrid, MessagesSquare, Rocket, Sparkles, UsersRound, Workflow, type LucideIcon } from 'lucide-react';
import { expertise } from '../data/expertise';
import { useLanguage } from '../i18n/LanguageContext';
import { useUiStrings } from '../hooks/useUiStrings';

const ICONS: Record<string, LucideIcon> = {
  compass: Compass,
  workflow: Workflow,
  'layout-grid': LayoutGrid,
  sparkles: Sparkles,
  'users-round': UsersRound,
  'bar-chart-3': BarChart3,
  'messages-square': MessagesSquare,
  rocket: Rocket,
};

const SIZE_CLASSES: Record<string, string> = {
  lg: 'sm:col-span-2',
  md: 'sm:col-span-2',
  sm: '',
};

export function Expertise() {
  const { lang } = useLanguage();
  const ui = useUiStrings();

  return (
    <div className="mt-20">
      <div className="max-w-2xl animate-fade-up">
        <span className="section-eyebrow">{ui.expertise.eyebrow}</span>
        <h3 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">{ui.expertise.title}</h3>
        <p className="mt-4 text-[15px] leading-relaxed text-graphite-100">{ui.expertise.subtitle}</p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-4">
        {expertise.map((item, i) => {
          const Icon = ICONS[item.icon];
          return (
            <div
              key={item.title.en}
              className={`glass-card group animate-fade-up flex flex-col justify-between overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blood-600/40 hover:bg-white/[0.06] ${SIZE_CLASSES[item.size]}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white transition-all duration-300 group-hover:border-blood-500/50 group-hover:text-blood-400 group-hover:shadow-[0_0_20px_-4px_rgba(139,30,36,0.6)]">
                  <Icon size={20} strokeWidth={1.6} />
                </div>
                <h4 className="text-base font-semibold text-white">{item.title[lang]}</h4>
                <p className="mt-2 text-sm leading-relaxed text-graphite-200">{item.description[lang]}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5 opacity-80 transition-opacity duration-300 group-hover:opacity-100">
                {item.keywords.map((k) => (
                  <span key={k} className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-medium text-graphite-100">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
