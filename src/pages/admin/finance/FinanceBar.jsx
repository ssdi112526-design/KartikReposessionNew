export default function FinanceBar({
  label,
  value,
  max,
  color = 'bg-brand',
  formatValue,
}) {
  const pct = max > 0 ? Math.min(100, Math.round((Number(value) / max) * 100)) : 0;
  const display = formatValue ? formatValue(value) : value;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-semibold text-ink">{display}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
