import { Layers, Map, UserCircle, Search, Boxes, MonitorSmartphone, Presentation, GitBranch, type LucideIcon } from 'lucide-react';
import type { Artifact } from '../data/cases';

const ICONS: Record<Artifact['kind'], LucideIcon> = {
  canvas: Layers,
  journey: Map,
  persona: UserCircle,
  research: Search,
  system: Boxes,
  prototype: MonitorSmartphone,
  pitch: Presentation,
  blueprint: GitBranch,
};

export function CaseArtifactTile({ kind, label, pendingLabel }: { kind: Artifact['kind']; label: string; pendingLabel: string }) {
  const Icon = ICONS[kind];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-blood-400">
        <Icon size={16} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-white">{label}</p>
        <p className="text-[10px] italic text-graphite-400">{pendingLabel}</p>
      </div>
    </div>
  );
}
