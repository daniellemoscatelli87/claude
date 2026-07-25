import { useState } from 'react'
import type { MetricTrackStatus, ProjectMetric } from '../types'
import { STATUS_LABELS } from '../types'
import { METRICS_BY_ID } from '../data/metrics'
import { useProjectsStore } from '../store/useProjectsStore'
import CategoryBadge from './CategoryBadge'

const STATUS_STYLES: Record<MetricTrackStatus, string> = {
  nao_iniciado: 'bg-slate-100 text-slate-600',
  em_coleta: 'bg-blue-100 text-blue-700',
  meta_atingida: 'bg-emerald-100 text-emerald-700',
  abaixo_da_meta: 'bg-red-100 text-red-700',
}

export default function MetricTrackCard({ projectId, projectMetric }: { projectId: string; projectMetric: ProjectMetric }) {
  const metric = METRICS_BY_ID[projectMetric.metricId]
  const updateProjectMetric = useProjectsStore((s) => s.updateProjectMetric)
  const removeMetricFromProject = useProjectsStore((s) => s.removeMetricFromProject)
  const addMetricEntry = useProjectsStore((s) => s.addMetricEntry)
  const removeMetricEntry = useProjectsStore((s) => s.removeMetricEntry)

  const [showTip, setShowTip] = useState(false)
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [entryValue, setEntryValue] = useState('')
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [entrySource, setEntrySource] = useState('')
  const [entryNotes, setEntryNotes] = useState('')

  if (!metric) return null

  function handleAddEntry(e: React.FormEvent) {
    e.preventDefault()
    if (!entryValue.trim()) return
    addMetricEntry(projectId, metric.id, {
      date: entryDate,
      value: entryValue.trim(),
      source: entrySource.trim() || undefined,
      notes: entryNotes.trim() || undefined,
    })
    setEntryValue('')
    setEntrySource('')
    setEntryNotes('')
    setShowEntryForm(false)
  }

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
        <div className="flex items-center gap-2">
          <select
            value={projectMetric.status}
            onChange={(e) => updateProjectMetric(projectId, metric.id, { status: e.target.value as MetricTrackStatus })}
            className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[projectMetric.status]}`}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => removeMetricFromProject(projectId, metric.id)}
            className="text-xs text-slate-400 hover:text-red-600"
            title="Remover métrica do acompanhamento"
          >
            Remover
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Baseline (atual)</span>
          <input
            value={projectMetric.baseline}
            onChange={(e) => updateProjectMetric(projectId, metric.id, { baseline: e.target.value })}
            placeholder={`ex: 62% de sucesso`}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Target (meta)</span>
          <input
            value={projectMetric.target}
            onChange={(e) => updateProjectMetric(projectId, metric.id, { target: e.target.value })}
            placeholder={`ex: > 85% de sucesso`}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => setShowTip((v) => !v)}
        className="mt-3 text-xs font-medium text-brand-600 hover:underline"
      >
        {showTip ? 'Ocultar dicas de coleta' : 'Como obter esse dado?'}
      </button>
      {showTip && (
        <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <p>
            <span className="font-medium">Origem:</span> {metric.origin}
          </p>
          <p className="mt-1">{metric.howToCollect}</p>
          <p className="mt-1">
            <span className="font-medium">Ferramentas:</span> {metric.tools.join(', ')}
          </p>
          <p className="mt-1">
            <span className="font-medium">Quem envolver:</span> {metric.people.join(', ')}
          </p>
        </div>
      )}

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Histórico de coleta ({projectMetric.entries.length})
          </span>
          <button
            type="button"
            onClick={() => setShowEntryForm((v) => !v)}
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            {showEntryForm ? 'Cancelar' : '+ Registrar coleta'}
          </button>
        </div>

        {showEntryForm && (
          <form onSubmit={handleAddEntry} className="mt-2 space-y-2 rounded-lg border border-slate-200 p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <label className="block">
                <span className="text-xs text-slate-500">Data</span>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs text-slate-500">Valor coletado</span>
                <input
                  value={entryValue}
                  onChange={(e) => setEntryValue(e.target.value)}
                  placeholder={`ex: 78% de sucesso`}
                  className="mt-0.5 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  required
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs text-slate-500">Fonte / ferramenta usada</span>
              <input
                value={entrySource}
                onChange={(e) => setEntrySource(e.target.value)}
                placeholder={metric.tools[0]}
                className="mt-0.5 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Notas</span>
              <input
                value={entryNotes}
                onChange={(e) => setEntryNotes(e.target.value)}
                placeholder="Observações relevantes"
                className="mt-0.5 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
            <button type="submit" className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700">
              Salvar coleta
            </button>
          </form>
        )}

        {projectMetric.entries.length > 0 && (
          <ul className="mt-2 divide-y divide-slate-100">
            {projectMetric.entries.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-2 py-2 text-sm">
                <div>
                  <span className="font-medium text-slate-900">{entry.value}</span>
                  <span className="ml-2 text-slate-400">{entry.date}</span>
                  {entry.source && <span className="ml-2 text-slate-500">· {entry.source}</span>}
                  {entry.notes && <p className="text-xs text-slate-500">{entry.notes}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => removeMetricEntry(projectId, metric.id, entry.id)}
                  className="shrink-0 text-xs text-slate-400 hover:text-red-600"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
