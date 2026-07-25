import type { MetricCategory } from '../types'
import { CATEGORY_LABELS } from '../types'

const CATEGORY_STYLES: Record<MetricCategory, string> = {
  usabilidade: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  percepcao: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200',
  engajamento: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200',
  negocio: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
}

export default function CategoryBadge({ category }: { category: MetricCategory }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_STYLES[category]}`}>
      {CATEGORY_LABELS[category]}
    </span>
  )
}
