import { useMemo, useState } from 'react'
import { METRICS } from '../data/metrics'
import type { MetricCategory } from '../types'
import { CATEGORY_LABELS } from '../types'
import MetricTipCard from '../components/MetricTipCard'

const CATEGORIES = Object.keys(CATEGORY_LABELS) as MetricCategory[]

export default function CatalogPage() {
  const [filter, setFilter] = useState<MetricCategory | 'todas'>('todas')

  const metrics = useMemo(
    () => (filter === 'todas' ? METRICS : METRICS.filter((m) => m.category === filter)),
    [filter],
  )

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Catálogo de Métricas</h1>
      <p className="mt-1 text-sm text-slate-500">
        Consulte qualquer métrica de UX ou negócio: o que significa, de onde vem o dado e como coletá-lo.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter('todas')}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
            filter === 'todas' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-600 hover:border-brand-300'
          }`}
        >
          Todas
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setFilter(category)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
              filter === category ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-600 hover:border-brand-300'
            }`}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {metrics.map((metric) => (
          <MetricTipCard key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  )
}
