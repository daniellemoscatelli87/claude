import { type FormEvent } from 'react';
import { Link2, Mail, Phone, Send } from 'lucide-react';
import { contact } from '../data/profile';
import { useUiStrings } from '../hooks/useUiStrings';
import { Logo } from './Logo';

export function Footer() {
  const ui = useUiStrings();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get('name');
    const email = form.get('email');
    const company = form.get('company');
    const subjectType = form.get('subject');
    const message = form.get('message');
    const subject = encodeURIComponent(`[Site] ${subjectType} — contato de ${name}`);
    const body = encodeURIComponent(
      `Nome: ${name}\nE-mail: ${email}\nEmpresa: ${company}\nTipo de contratação: ${subjectType}\n\nMensagem:\n${message}`,
    );
    window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
  }

  return (
    <footer id="contact" className="relative scroll-mt-24 border-t border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="animate-fade-up">
            <span className="section-eyebrow">{ui.footer.eyebrow}</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">{ui.footer.title}</h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-graphite-100">{ui.footer.subtitle}</p>

            <div className="mt-8 flex flex-col gap-3 text-sm">
              <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-graphite-100 hover:text-white">
                <Mail size={16} className="text-blood-400" strokeWidth={1.75} /> {contact.email}
              </a>
              <a href={`tel:${contact.phone.replace(/\D/g, '')}`} className="flex items-center gap-3 text-graphite-100 hover:text-white">
                <Phone size={16} className="text-blood-400" strokeWidth={1.75} /> {contact.phone}
              </a>
              <a href={contact.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-graphite-100 hover:text-white">
                <Link2 size={16} className="text-blood-400" strokeWidth={1.75} /> linkedin.com/in/danimoscatelli
              </a>
            </div>

            <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <a href="#hero">
                <Logo />
              </a>
              <p className="text-xs text-graphite-400">
                © {new Date().getFullYear()} Danielle Moscatelli. {ui.footer.rights}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="glass-card animate-fade-up grid gap-4 p-7 sm:p-8" style={{ animationDelay: '120ms' }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                name="name"
                placeholder={ui.footer.name}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-graphite-400 outline-none focus:border-blood-500/60"
              />
              <input
                required
                type="email"
                name="email"
                placeholder={ui.footer.email}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-graphite-400 outline-none focus:border-blood-500/60"
              />
            </div>
            <input
              name="company"
              placeholder={ui.footer.company}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-graphite-400 outline-none focus:border-blood-500/60"
            />
            <select
              required
              name="subject"
              defaultValue=""
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-blood-500/60"
            >
              <option value="" disabled className="bg-graphite-800">
                {ui.footer.subject}
              </option>
              {ui.footer.subjectOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-graphite-800">
                  {opt}
                </option>
              ))}
            </select>
            <textarea
              required
              rows={4}
              name="message"
              placeholder={ui.footer.message}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-graphite-400 outline-none focus:border-blood-500/60"
            />
            <button type="submit" className="solid-btn justify-self-start">
              <Send size={14} /> {ui.footer.submit}
            </button>
            <p className="text-[11px] text-graphite-400">{ui.footer.submitNote}</p>
          </form>
        </div>
      </div>
    </footer>
  );
}
