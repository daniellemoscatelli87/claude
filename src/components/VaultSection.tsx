import { useState, type FormEvent } from 'react';
import { Lock, ShieldCheck, Unlock } from 'lucide-react';
import { vaultCases } from '../data/cases';
import { useLanguage } from '../i18n/LanguageContext';
import { useUiStrings } from '../hooks/useUiStrings';
import { useVaultAccess } from '../hooks/useVaultAccess';
import { contact } from '../data/profile';

export function VaultSection() {
  const { lang } = useLanguage();
  const ui = useUiStrings();
  const { unlocked, unlock } = useVaultAccess();
  const [agreed, setAgreed] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get('name');
    const email = form.get('email');
    const company = form.get('company');
    const reason = form.get('reason');
    const subject = encodeURIComponent('NDA — Solicitação de acesso ao Cofre de Inovação');
    const body = encodeURIComponent(
      `Nome: ${name}\nE-mail: ${email}\nEmpresa/função: ${company}\nMotivo: ${reason}\n\n(Envio automático gerado pelo formulário de acesso ao Cofre de Inovação do site.)`,
    );
    window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
    unlock();
  }

  return (
    <div id="vault" className="mt-20 scroll-mt-28">
      <div className="glass-card overflow-hidden border-blood-700/30">
        <div className="flex flex-col gap-8 p-8 sm:p-10 lg:flex-row lg:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blood-600/40 bg-blood-600/10 text-blood-400">
            {unlocked ? <Unlock size={24} strokeWidth={1.6} /> : <Lock size={24} strokeWidth={1.6} />}
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white sm:text-2xl">{ui.cases.vaultTitle}</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-graphite-200">{ui.cases.vaultSubtitle}</p>

            {!unlocked ? (
              <>
                <div className="mt-6 flex flex-wrap gap-2">
                  {vaultCases.map((v) => (
                    <span key={v.slug} className="tag-chip border-blood-600/30 bg-blood-600/5">
                      <Lock size={11} /> {v.title[lang]}
                    </span>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
                  <input
                    required
                    name="name"
                    placeholder={ui.cases.vaultFormName}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-graphite-400 outline-none focus:border-blood-500/60"
                  />
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder={ui.cases.vaultFormEmail}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-graphite-400 outline-none focus:border-blood-500/60"
                  />
                  <input
                    name="company"
                    placeholder={ui.cases.vaultFormCompany}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-graphite-400 outline-none focus:border-blood-500/60 sm:col-span-2"
                  />
                  <textarea
                    name="reason"
                    rows={2}
                    placeholder={ui.cases.vaultFormReason}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-graphite-400 outline-none focus:border-blood-500/60 sm:col-span-2"
                  />
                  <label className="flex items-start gap-2.5 text-xs text-graphite-300 sm:col-span-2">
                    <input
                      required
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-blood-600"
                    />
                    {ui.cases.vaultFormAgree}
                  </label>
                  <button type="submit" disabled={!agreed} className="solid-btn justify-self-start disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-2">
                    <Lock size={14} /> {ui.cases.vaultFormSubmit}
                  </button>
                  <p className="flex items-start gap-2 text-[11px] leading-relaxed text-graphite-400 sm:col-span-2">
                    <ShieldCheck size={13} className="mt-0.5 shrink-0" /> {ui.cases.vaultFormNote}
                  </p>
                </form>
              </>
            ) : (
              <div className="mt-6">
                <p className="mb-4 inline-flex items-center gap-2 text-xs text-blood-300">
                  <Unlock size={13} /> {ui.cases.vaultUnlockedNote}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {vaultCases.map((v) => (
                    <div key={v.slug} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                      <p className="text-[11px] uppercase tracking-wide text-graphite-400">{v.period[lang]}</p>
                      <h4 className="mt-1 text-base font-semibold text-white">{v.title[lang]}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-graphite-200">{v.full[lang]}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {v.disciplines.map((d) => (
                          <span key={d} className="tag-chip">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
