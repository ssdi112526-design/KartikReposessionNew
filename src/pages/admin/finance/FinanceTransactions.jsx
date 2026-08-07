import { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/admin/EmptyState';
import SearchBar from '../../../components/admin/SearchBar';
import { useToast } from '../../../context/ToastContext';
import { financeService } from '../../../services';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import { triggerBlobDownload, parseBlobError } from '../../../utils/downloadBlob';
import {
  DATE_FILTER_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  formatDateIN,
  formatINR,
  paymentMethodLabel,
} from '../../../utils/financeHelpers.js';

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'salary_payment', label: 'Salary Payment' },
];

function typeLabel(type) {
  if (type === 'income') return 'Income';
  if (type === 'expense') return 'Expense';
  if (type === 'salary_payment') return 'Salary';
  return type || '—';
}

function typeClass(type) {
  if (type === 'income') return 'bg-emerald-50 text-emerald-700';
  if (type === 'expense') return 'bg-rose-50 text-rose-700';
  return 'bg-sky-50 text-sky-700';
}

export default function FinanceTransactions() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [filters, setFilters] = useState({
    type: '',
    paymentMethod: '',
    dateFilter: 'month',
    startDate: '',
    endDate: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const params = {
        ...(filters.type && { type: filters.type }),
        ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
        ...(filters.dateFilter && { filter: filters.dateFilter }),
        ...(filters.dateFilter === 'custom' && filters.startDate && { startDate: filters.startDate }),
        ...(filters.dateFilter === 'custom' && filters.endDate && { endDate: filters.endDate }),
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
      };
      const res = await financeService.transactions(params);
      setRows(res.data.data.transactions || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters.dateFilter === 'custom' && (!filters.startDate || !filters.endDate)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, debouncedSearch]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        kind: 'transactions',
        format: 'excel',
        filter: filters.dateFilter,
        ...(filters.dateFilter === 'custom' && filters.startDate && { startDate: filters.startDate }),
        ...(filters.dateFilter === 'custom' && filters.endDate && { endDate: filters.endDate }),
      };
      const res = await financeService.export(params);
      triggerBlobDownload(res.data, 'finance-transactions.xlsx');
      toast.success('Exported Excel');
    } catch (err) {
      toast.error(await parseBlobError(err));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Transactions</h1>
          <p className="mt-1 text-sm text-muted">Unified ledger of income, expenses and salary payments.</p>
        </div>
        <Button variant="outline" disabled={exporting} onClick={handleExport}>
          {exporting ? 'Exporting...' : 'Export Excel'}
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search description, category, reference..." />
        <select
          value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={filters.paymentMethod}
          onChange={(e) => setFilters((f) => ({ ...f, paymentMethod: e.target.value }))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          <option value="">All methods</option>
          {PAYMENT_METHOD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={filters.dateFilter}
          onChange={(e) => setFilters((f) => ({ ...f, dateFilter: e.target.value }))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          {DATE_FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {filters.dateFilter === 'custom' && (
          <>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </>
        )}
      </div>

      {loading ? (
        <p className="mt-8 text-center text-sm text-muted">Loading...</p>
      ) : rows.length === 0 ? (
        <EmptyState message="No transactions found for the selected filters." />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Staff</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const id = row._id || row.id;
                return (
                  <tr key={id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">{formatDateIN(row.date)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeClass(row.type)}`}
                      >
                        {typeLabel(row.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{row.category}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{row.description || '—'}</td>
                    <td className="px-4 py-3 font-semibold">{formatINR(row.amount)}</td>
                    <td className="px-4 py-3">
                      {row.paymentMethodLabel || paymentMethodLabel(row.paymentMethod)}
                    </td>
                    <td className="px-4 py-3">{row.referenceNumber || '—'}</td>
                    <td className="px-4 py-3">
                      {row.staff ? (
                        <>
                          <div className="font-medium">{row.staff.name}</div>
                          <div className="text-xs text-muted">{row.staff.staffCode}</div>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
