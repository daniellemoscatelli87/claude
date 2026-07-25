import type { ReactNode } from 'react'
import type { MetricDef } from '../types'
import CategoryBadge from './CategoryBadge'

export default function MetricTipCard({ metric, action }: { metric: MetricDef; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">{metric.name}</h3>
            <CategoryBadge category={metric.category} />
          </div>
          <p className="text-sm text-slate-500">{metric.fullName}</p>
        </div>
        {action}
      </div>

      <p className="mt-3 text-sm text-slate-700">{metric.description}</p>

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Origem do dado</dt>
          <dd className="mt-0.5 text-sm text-slate-700">{metric.origin}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Precisa de pesquisa ativa?</dt>
          <dd className="mt-0.5 text-sm text-slate-700">
            {metric.requiresResearch ? 'Sim — designer precisa coletar' : 'Não — já é coletado automaticamente'}
          </dd>
        </div>
      </dl>

      <div className="mt-3 rounded-lg bg-slate-50 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Como obter esse dado</p>
        <p className="mt-1 text-sm text-slate-700">{metric.howToCollect}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Ferramentas</span>
          <p className="text-slate-700">{metric.tools.join(', ')}</p>
        </div>
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Quem envolver</span>
          <p className="text-slate-700">{metric.people.join(', ')}</p>
        </div>
      </div>
    </div>
  )
}
