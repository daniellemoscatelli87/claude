import { AUTONOMY_CHECKLIST, DAILY_CHECKLIST, DATA_SOURCES, FAQ_ITEMS, HANDOFF_ROLES } from '../data/guide'
import { useChecklist } from '../lib/useChecklist'

function Checklist({ storageKey, items }: { storageKey: string; items: string[] }) {
  const { checked, toggle } = useChecklist(storageKey, items.length)
  const done = checked.filter(Boolean).length

  return (
    <div>
      <p className="text-xs text-slate-400">
        {done}/{items.length} concluído(s)
      </p>
      <ul className="mt-2 space-y-2">
        {items.map((item, i) => (
          <li key={item}>
            <label className="flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => toggle(i)}
                className="mt-0.5 size-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className={checked[i] ? 'text-slate-400 line-through' : 'text-slate-700'}>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function GuidePage() {
  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Guia Rápido: como obter e coletar dados</h1>
        <p className="mt-1 text-sm text-slate-500">
          Onde os dados vivem, quem acionar em cada situação e quando é preciso pesquisar em vez de apenas consultar.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">De onde vêm os dados</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DATA_SOURCES.map((source) => (
            <div key={source.title} className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">{source.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{source.description}</p>
              <p className="mt-2 text-xs text-slate-500">{source.tools.join(', ')}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">FAQ do designer</h2>
        <div className="mt-3 space-y-3">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question} className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-medium text-slate-900">{item.question}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Quando acionar Dados ou Tecnologia (tagamento)</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {HANDOFF_ROLES.map((role) => (
            <div key={role.role} className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-medium text-slate-900">{role.role}</h3>
              <p className="mt-1 text-sm text-slate-600">{role.when}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Checklist de autonomia em dados</h2>
          <div className="mt-3">
            <Checklist storageKey="autonomia" items={AUTONOMY_CHECKLIST} />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Checklist diário do designer</h2>
          <div className="mt-3">
            <Checklist storageKey="diario" items={DAILY_CHECKLIST} />
          </div>
        </div>
      </section>
    </div>
  )
}
