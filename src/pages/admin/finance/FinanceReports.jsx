import { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/admin/EmptyState';
import { useToast } from '../../../context/ToastContext';
import { financeService } from '../../../services';
import { triggerBlobDownload, parseBlobError } from '../../../utils/downloadBlob';
import {
  DATE_FILTER_OPTIONS,
  formatINR,
  paymentMethodLabel,
} from '../../../utils/financeHelpers.js';

export default function FinanceReports() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');
  const [filter, setFilter] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = {
        filter,
        ...(filter === 'custom' && startDate && { startDate }),
        ...(filter === 'custom' && endDate && { endDate }),
      };
      const res = await financeService.reports(params);
      setData(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filter === 'custom' && (!startDate || !endDate)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, startDate, endDate]);

  const handleExport = async (kind) => {
    setExporting(kind);
    try {
      const params = {
        kind,
        format: 'excel',
        filter,
        ...(filter === 'custom' && startDate && { startDate }),
        ...(filter === 'custom' && endDate && { endDate }),
      };
      const res = await financeService.export(params);
      triggerBlobDownload(res.data, `finance-${kind}.xlsx`);
      toast.success(`Exported ${kind}`);
    } catch (err) {
      toast.error(await parseBlobError(err));
    } finally {
      setExporting('');
    }
  };

  const pl = data?.profitLoss;
  const methods = data?.paymentMethods || [];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Finance Reports</h1>
          <p className="mt-1 text-sm text-muted">Profit &amp; loss summary and payment method breakdown.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
          >
            {DATE_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {filter === 'custom' && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          { kind: 'income', label: 'Export Income' },
          { kind: 'expenses', label: 'Export Expenses' },
          { kind: 'salary', label: 'Export Salary' },
          { kind: 'transactions', label: 'Export Transactions' },
        ].map((b) => (
          <Button
            key={b.kind}
            variant="outline"
            disabled={!!exporting}
            onClick={() => handleExport(b.kind)}
          >
            {exporting === b.kind ? 'Exporting...' : b.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <p className="mt-8 text-center text-sm text-muted">Loading...</p>
      ) : !data ? (
        <EmptyState message="No report data available." />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase text-muted">Total Income</p>
              <p className="mt-1 text-xl font-bold text-emerald-700">{formatINR(pl?.totalIncome)}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase text-muted">Expenses (ops)</p>
              <p className="mt-1 text-xl font-bold text-rose-700">{formatINR(pl?.totalExpensesOnly)}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase text-muted">Salary Paid</p>
              <p className="mt-1 text-xl font-bold text-ink">{formatINR(pl?.totalSalaryPaid)}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase text-muted">Total Expenses</p>
              <p className="mt-1 text-xl font-bold text-rose-700">{formatINR(pl?.totalExpenses)}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm col-span-2 sm:col-span-1">
              <p className="text-xs uppercase text-muted">Net Profit / Loss</p>
              <p
                className={`mt-1 text-xl font-bold ${(pl?.net || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
              >
                {formatINR(pl?.net)}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-ink">Payment Method Summary</h2>
            {methods.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No transactions in this period.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-muted">
                    <tr>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Count</th>
                      <th className="px-4 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {methods.map((m) => (
                      <tr key={m.method} className="border-b border-slate-50 last:border-0">
                        <td className="px-4 py-3">{m.label || paymentMethodLabel(m.method)}</td>
                        <td className="px-4 py-3">{m.count}</td>
                        <td className="px-4 py-3 font-semibold">{formatINR(m.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
