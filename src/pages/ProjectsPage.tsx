import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectsStore } from '../store/useProjectsStore'

export default function ProjectsPage() {
  const projects = useProjectsStore((s) => s.projects)
  const createProject = useProjectsStore((s) => s.createProject)
  const navigate = useNavigate()

  const [showForm, setShowForm] = useState(projects.length === 0)
  const [name, setName] = useState('')
  const [problem, setProblem] = useState('')
  const [hypothesis, setHypothesis] = useState('')
  const [objective, setObjective] = useState('')

  function resetForm() {
    setName('')
    setProblem('')
    setHypothesis('')
    setObjective('')
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const id = createProject({ name: name.trim(), problem, hypothesis, objective })
    resetForm()
    setShowForm(false)
    navigate(`/projetos/${id}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Seus projetos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cada projeto guarda o problema, as métricas recomendadas e o histórico de coleta.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Novo projeto
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Novo projeto</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="name">
              Nome do projeto
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Redesign do checkout mobile"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="problem">
              Problema identificado
            </label>
            <textarea
              id="problem"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="O que não está funcionando hoje? Que evidências já existem?"
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="hypothesis">
              Hipótese de design
            </label>
            <textarea
              id="hypothesis"
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder='"Acreditamos que ao [alteração de design], alcançaremos [comportamento], medido por [métrica]."'
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="objective">
              Objetivo (Goal)
            </label>
            <input
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="O que queremos que o usuário alcance ou sinta?"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              Criar projeto
            </button>
            {projects.length > 0 && (
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      {projects.length > 0 && (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {projects.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => navigate(`/projetos/${p.id}`)}
                className="flex h-full w-full flex-col items-start rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-brand-300 hover:shadow-sm"
              >
                <span className="font-semibold text-slate-900">{p.name}</span>
                {p.problem && <span className="mt-1 line-clamp-2 text-sm text-slate-500">{p.problem}</span>}
                <span className="mt-3 text-xs text-slate-400">
                  {p.metrics.length} métrica(s) acompanhada(s) · {p.needIds.length} necessidade(s) mapeada(s)
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {projects.length === 0 && !showForm && (
        <p className="mt-6 text-sm text-slate-500">Você ainda não tem projetos. Crie o primeiro para começar.</p>
      )}
    </div>
  )
}
