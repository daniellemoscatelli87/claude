export type MetricCategory = 'usabilidade' | 'percepcao' | 'engajamento' | 'negocio'

export const CATEGORY_LABELS: Record<MetricCategory, string> = {
  usabilidade: 'Usabilidade e Eficiência',
  percepcao: 'Percepção e Satisfação',
  engajamento: 'Engajamento e Retenção',
  negocio: 'Negócio e Conversão',
}

export interface MetricDef {
  id: string
  name: string
  fullName: string
  category: MetricCategory
  unit: string
  /** Whether an increase in this metric is a good outcome. */
  direction: 'up' | 'down'
  description: string
  origin: string
  /** Does the designer need to actively run a test/survey, or is it already collected automatically? */
  requiresResearch: boolean
  howToCollect: string
  tools: string[]
  people: string[]
}

export interface NeedDef {
  id: string
  title: string
  when: string
  metricIds: string[]
}

export type MetricTrackStatus = 'nao_iniciado' | 'em_coleta' | 'meta_atingida' | 'abaixo_da_meta'

export const STATUS_LABELS: Record<MetricTrackStatus, string> = {
  nao_iniciado: 'Não iniciado',
  em_coleta: 'Em coleta',
  meta_atingida: 'Meta atingida',
  abaixo_da_meta: 'Abaixo da meta',
}

export interface MetricEntry {
  id: string
  date: string
  value: string
  source?: string
  notes?: string
}

export interface ProjectMetric {
  metricId: string
  baseline: string
  target: string
  status: MetricTrackStatus
  entries: MetricEntry[]
}

export type PostLaunchDecision = 'manter_escalar' | 'iterar_ajustar' | 'pivotar_reverter' | null

export const DECISION_LABELS: Record<Exclude<PostLaunchDecision, null>, string> = {
  manter_escalar: 'Manter & Escalar',
  iterar_ajustar: 'Iterar & Ajustar',
  pivotar_reverter: 'Pivotar / Reverter',
}

export interface Project {
  id: string
  name: string
  problem: string
  hypothesis: string
  objective: string
  needIds: string[]
  metrics: ProjectMetric[]
  createdAt: string
  updatedAt: string
  postLaunch: {
    reviewDate: string
    insights: string
    decision: PostLaunchDecision
  }
}
