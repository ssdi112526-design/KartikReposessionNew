export default function StatCard({ label, value, icon: Icon, loading }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:gap-4 sm:p-5">
      {Icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand sm:h-11 sm:w-11">
          <Icon size={18} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted sm:text-xs">
          {label}
        </p>
        <p className="mt-1 break-words text-lg font-bold leading-snug text-ink sm:text-xl lg:text-2xl">
          {loading ? '...' : value}
        </p>
      </div>
    </div>
  );
}
