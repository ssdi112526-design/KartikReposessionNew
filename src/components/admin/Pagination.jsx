const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

export default function Pagination({ pagination, onPageChange, onLimitChange }) {
  const { page, pages, total, limit } = pagination;

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div className="flex items-center gap-2 text-sm text-muted">
        <span>Rows per page</span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand"
        >
          {ROWS_PER_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span className="hidden sm:inline">&middot; {total} total record{total === 1 ? '' : 's'}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-ink disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:bg-slate-50"
        >
          Previous
        </button>
        <span className="text-sm text-muted">
          Page {page} of {pages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-ink disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:bg-slate-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
