import { NEEDS } from '../data/needs'
import { METRICS_BY_ID } from '../data/metrics'
import { useProjectsStore } from '../store/useProjectsStore'
import type { Project } from '../types'
import CategoryBadge from './CategoryBadge'

export default function NeedPicker({ project }: { project: Project }) {
  const toggleNeed = useProjectsStore((s) => s.toggleNeed)
  const addMetricToProject = useProjectsStore((s) => s.addMetricToProject)
  const trackedIds = new Set(project.metrics.map((m) => m.metricId))

  return (
    <div className="space-y-3">
      {NEEDS.map((need) => {
        const selected = project.needIds.includes(need.id)
        return (
          <div
            key={need.id}
            className={`rounded-xl border p-4 ${selected ? 'border-brand-300 bg-brand-50/40' : 'border-slate-200 bg-white'}`}
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggleNeed(project.id, need.id)}
                className="mt-1 size-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <div>
                <p className="font-medium text-slate-900">{need.title}</p>
                <p className="mt-0.5 text-sm text-slate-500">{need.when}</p>
              </div>
            </label>

            {selected && (
              <div className="mt-3 space-y-2 border-t border-brand-100 pt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Métricas recomendadas</p>
                <div className="flex flex-wrap gap-2">
                  {need.metricIds.map((metricId) => {
                    const metric = METRICS_BY_ID[metricId]
                    if (!metric) return null
                    const tracked = trackedIds.has(metricId)
                    return (
                      <button
                        key={metricId}
                        type="button"
                        disabled={tracked}
                        onClick={() => addMetricToProject(project.id, metricId)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          tracked
                            ? 'cursor-default border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-brand-400 hover:text-brand-700'
                        }`}
                        title={metric.fullName}
                      >
                        {metric.name}
                        {tracked ? ' · acompanhando' : ' · adicionar'}
                      </button>
                    )
                  })}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[...new Set(need.metricIds.map((id) => METRICS_BY_ID[id]?.category).filter(Boolean))].map(
                    (category) => (
                      <CategoryBadge key={category} category={category!} />
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
