import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type { MetricEntry, MetricTrackStatus, PostLaunchDecision, Project, ProjectMetric } from '../types'

function now() {
  return new Date().toISOString()
}

interface ProjectsState {
  projects: Project[]
  createProject: (input: { name: string; problem: string; hypothesis: string; objective: string }) => string
  updateProject: (id: string, patch: Partial<Pick<Project, 'name' | 'problem' | 'hypothesis' | 'objective'>>) => void
  deleteProject: (id: string) => void

  toggleNeed: (projectId: string, needId: string) => void

  addMetricToProject: (projectId: string, metricId: string) => void
  removeMetricFromProject: (projectId: string, metricId: string) => void
  updateProjectMetric: (
    projectId: string,
    metricId: string,
    patch: Partial<Pick<ProjectMetric, 'baseline' | 'target' | 'status'>>,
  ) => void

  addMetricEntry: (projectId: string, metricId: string, entry: Omit<MetricEntry, 'id'>) => void
  removeMetricEntry: (projectId: string, metricId: string, entryId: string) => void

  updatePostLaunch: (
    projectId: string,
    patch: Partial<{ reviewDate: string; insights: string; decision: PostLaunchDecision }>,
  ) => void
}

function withProject(projects: Project[], id: string, fn: (p: Project) => Project): Project[] {
  return projects.map((p) => (p.id === id ? { ...fn(p), updatedAt: now() } : p))
}

function emptyStatus(): MetricTrackStatus {
  return 'nao_iniciado'
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set) => ({
      projects: [],

      createProject: ({ name, problem, hypothesis, objective }) => {
        const id = uuid()
        const project: Project = {
          id,
          name,
          problem,
          hypothesis,
          objective,
          needIds: [],
          metrics: [],
          createdAt: now(),
          updatedAt: now(),
          postLaunch: { reviewDate: '', insights: '', decision: null },
        }
        set((state) => ({ projects: [project, ...state.projects] }))
        return id
      },

      updateProject: (id, patch) =>
        set((state) => ({ projects: withProject(state.projects, id, (p) => ({ ...p, ...patch })) })),

      deleteProject: (id) => set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),

      toggleNeed: (projectId, needId) =>
        set((state) => ({
          projects: withProject(state.projects, projectId, (p) => {
            const has = p.needIds.includes(needId)
            return { ...p, needIds: has ? p.needIds.filter((n) => n !== needId) : [...p.needIds, needId] }
          }),
        })),

      addMetricToProject: (projectId, metricId) =>
        set((state) => ({
          projects: withProject(state.projects, projectId, (p) => {
            if (p.metrics.some((m) => m.metricId === metricId)) return p
            const metric: ProjectMetric = {
              metricId,
              baseline: '',
              target: '',
              status: emptyStatus(),
              entries: [],
            }
            return { ...p, metrics: [...p.metrics, metric] }
          }),
        })),

      removeMetricFromProject: (projectId, metricId) =>
        set((state) => ({
          projects: withProject(state.projects, projectId, (p) => ({
            ...p,
            metrics: p.metrics.filter((m) => m.metricId !== metricId),
          })),
        })),

      updateProjectMetric: (projectId, metricId, patch) =>
        set((state) => ({
          projects: withProject(state.projects, projectId, (p) => ({
            ...p,
            metrics: p.metrics.map((m) => (m.metricId === metricId ? { ...m, ...patch } : m)),
          })),
        })),

      addMetricEntry: (projectId, metricId, entry) =>
        set((state) => ({
          projects: withProject(state.projects, projectId, (p) => ({
            ...p,
            metrics: p.metrics.map((m) =>
              m.metricId === metricId ? { ...m, entries: [{ ...entry, id: uuid() }, ...m.entries] } : m,
            ),
          })),
        })),

      removeMetricEntry: (projectId, metricId, entryId) =>
        set((state) => ({
          projects: withProject(state.projects, projectId, (p) => ({
            ...p,
            metrics: p.metrics.map((m) =>
              m.metricId === metricId ? { ...m, entries: m.entries.filter((e) => e.id !== entryId) } : m,
            ),
          })),
        })),

      updatePostLaunch: (projectId, patch) =>
        set((state) => ({
          projects: withProject(state.projects, projectId, (p) => ({
            ...p,
            postLaunch: { ...p.postLaunch, ...patch },
          })),
        })),
    }),
    { name: 'designer-metrics-store' },
  ),
)
