import { useNavigate, useParams } from 'react-router-dom'
import { useProjectsStore } from '../store/useProjectsStore'
import NeedPicker from '../components/NeedPicker'
import MetricTrackCard from '../components/MetricTrackCard'
import type { PostLaunchDecision } from '../types'
import { DECISION_LABELS } from '../types'

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === projectId))
  const updateProject = useProjectsStore((s) => s.updateProject)
  const deleteProject = useProjectsStore((s) => s.deleteProject)
  const updatePostLaunch = useProjectsStore((s) => s.updatePostLaunch)

  if (!project) {
    return (
      <div>
        <p className="text-slate-600">Projeto não encontrado.</p>
        <button type="button" onClick={() => navigate('/')} className="mt-2 text-sm text-brand-600 hover:underline">
          Voltar para projetos
        </button>
      </div>
    )
  }

  function handleDelete() {
    if (!project) return
    if (confirm(`Excluir o projeto "${project.name}"? Essa ação não pode ser desfeita.`)) {
      deleteProject(project.id)
      navigate('/')
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <button type="button" onClick={() => navigate('/')} className="text-sm text-slate-500 hover:text-slate-700">
          ← Todos os projetos
        </button>
        <div className="mt-2 flex items-start justify-between gap-3">
          <input
            value={project.name}
            onChange={(e) => updateProject(project.id, { name: e.target.value })}
            className="w-full rounded-lg border-0 bg-transparent text-2xl font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button type="button" onClick={handleDelete} className="shrink-0 text-xs text-slate-400 hover:text-red-600">
            Excluir projeto
          </button>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">1. Problema e hipótese</h2>
        <p className="mt-1 text-sm text-slate-500">
          Descreva a dor do usuário e a hipótese de solução antes de desenhar qualquer tela.
        </p>
        <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Problema identificado</span>
            <textarea
              value={project.problem}
              onChange={(e) => updateProject(project.id, { problem: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Hipótese de design</span>
            <textarea
              value={project.hypothesis}
              onChange={(e) => updateProject(project.id, { hypothesis: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Objetivo (Goal)</span>
            <input
              value={project.objective}
              onChange={(e) => updateProject(project.id, { objective: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">2. O que você precisa medir?</h2>
        <p className="mt-1 text-sm text-slate-500">
          Marque a(s) necessidade(s) desta etapa do projeto. O sistema recomenda as métricas certas para cada uma.
        </p>
        <div className="mt-3">
          <NeedPicker project={project} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">3. Acompanhamento de métricas</h2>
        <p className="mt-1 text-sm text-slate-500">
          Para cada métrica adicionada: defina baseline e meta, veja as dicas de coleta e registre os dados coletados ao longo do tempo.
        </p>
        <div className="mt-3 space-y-3">
          {project.metrics.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              Nenhuma métrica em acompanhamento ainda. Selecione uma necessidade acima e adicione as métricas recomendadas.
            </p>
          )}
          {project.metrics.map((pm) => (
            <MetricTrackCard key={pm.metricId} projectId={project.id} projectMetric={pm} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">4. Análise pós-lançamento</h2>
        <p className="mt-1 text-sm text-slate-500">
          15 a 30 dias após o lançamento, reúna o time e registre a decisão de design.
        </p>
        <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Data da revisão</span>
            <input
              type="date"
              value={project.postLaunch.reviewDate}
              onChange={(e) => updatePostLaunch(project.id, { reviewDate: e.target.value })}
              className="mt-1 w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Insights qualitativos complementares
            </span>
            <textarea
              value={project.postLaunch.insights}
              onChange={(e) => updatePostLaunch(project.id, { insights: e.target.value })}
              rows={2}
              placeholder="O que os usuários relataram? Houve comportamentos imprevistos?"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </label>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Decisão de design</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.entries(DECISION_LABELS) as [Exclude<PostLaunchDecision, null>, string][]).map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      updatePostLaunch(project.id, { decision: project.postLaunch.decision === value ? null : value })
                    }
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      project.postLaunch.decision === value
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-300 text-slate-600 hover:border-brand-300'
                    }`}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
