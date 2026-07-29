/**
 * Placeholder wordmark — no logo file was supplied in the shared assets.
 * Swap this for the real white-on-dark logo mark whenever it's available;
 * everything here uses currentColor / relative sizing so a drop-in <img> works too.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] text-[13px] font-bold tracking-tight text-white">
        DM
      </span>
      <span className="hidden flex-col leading-none sm:flex">
        <span className="text-[13px] font-semibold tracking-[0.02em] text-white">Dani Moscatelli</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-blood-400">
          Experience Design Studio
        </span>
      </span>
    </span>
  );
}
