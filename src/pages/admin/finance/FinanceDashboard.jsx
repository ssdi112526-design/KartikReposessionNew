import { useEffect, useState } from 'react';
import {
  FaArrowDown,
  FaArrowUp,
  FaBalanceScale,
  FaMoneyBillWave,
  FaWallet,
  FaHourglassHalf,
} from 'react-icons/fa';
import StatCard from '../../../components/admin/StatCard';
import { useToast } from '../../../context/ToastContext';
import { financeService } from '../../../services';
import {
  DATE_FILTER_OPTIONS,
  MONTH_OPTIONS,
  formatINR,
} from '../../../utils/financeHelpers.js';
import FinanceBar from './FinanceBar';

function monthLabel(m) {
  return MONTH_OPTIONS.find((o) => o.value === m)?.label?.slice(0, 3) || String(m);
}

function VerticalBars({ items, getValue, getColor, formatTooltip }) {
  const max = Math.max(...items.map((i) => Math.abs(getValue(i))), 1);
  return (
    <div className="flex h-48 items-end gap-1.5 sm:gap-2">
      {items.map((item) => {
        const v = getValue(item);
        const h = Math.max(4, Math.round((Math.abs(v) / max) * 100));
        return (
          <div key={item.month} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`w-full max-w-[28px] rounded-t-md ${getColor(v)}`}
              style={{ height: `${h}%` }}
              title={formatTooltip ? formatTooltip(item) : formatINR(v)}
            />
            <span className="text-[10px] text-muted">{monthLabel(item.month)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function FinanceDashboard() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState({ monthly: [], salaryPaidVsPending: { paid: 0, pending: 0 } });

  const load = async () => {
    setLoading(true);
    try {
      const params = {
        filter,
        ...(filter === 'custom' && startDate && { startDate }),
        ...(filter === 'custom' && endDate && { endDate }),
      };
      const res = await financeService.dashboard(params);
      setSummary(res.data.data.summary);
      setCharts(res.data.data.charts);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load finance dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filter === 'custom' && (!startDate || !endDate)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, startDate, endDate]);

  const monthly = charts.monthly || [];
  const salaryMax = Math.max(
    charts.salaryPaidVsPending?.paid || 0,
    charts.salaryPaidVsPending?.pending || 0,
    1
  );
  const ieMax = Math.max(...monthly.flatMap((m) => [m.income, m.expenses]), 1);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Finance Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Income, expenses and salary overview.</p>
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

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total Income"
          value={formatINR(summary?.totalIncome)}
          icon={FaArrowUp}
          loading={loading}
        />
        <StatCard
          label="Total Expenses"
          value={formatINR(summary?.totalExpenses)}
          icon={FaArrowDown}
          loading={loading}
        />
        <StatCard
          label="Total Staff Salary"
          value={formatINR(summary?.totalStaffSalary)}
          icon={FaMoneyBillWave}
          loading={loading}
        />
        <StatCard
          label="Salary Paid"
          value={formatINR(summary?.salaryPaid)}
          icon={FaWallet}
          loading={loading}
        />
        <StatCard
          label="Salary Pending"
          value={formatINR(summary?.salaryPending)}
          icon={FaHourglassHalf}
          loading={loading}
        />
        <StatCard
          label="Net Balance"
          value={formatINR(summary?.netBalance)}
          icon={FaBalanceScale}
          loading={loading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-sm font-semibold text-ink">Income vs Expense (Monthly)</h2>
          <p className="mt-0.5 text-xs text-muted">Blue = income · Rose = expenses</p>
          {loading ? (
            <p className="mt-8 text-center text-sm text-muted">Loading...</p>
          ) : (
            <div className="mt-4 flex h-48 items-end gap-1.5 sm:gap-2">
              {monthly.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-40 w-full max-w-[32px] items-end justify-center gap-0.5">
                    <div
                      className="w-1/2 rounded-t bg-brand"
                      style={{ height: `${Math.max(4, Math.round((m.income / ieMax) * 100))}%` }}
                      title={`Income: ${formatINR(m.income)}`}
                    />
                    <div
                      className="w-1/2 rounded-t bg-rose-400"
                      style={{ height: `${Math.max(4, Math.round((m.expenses / ieMax) * 100))}%` }}
                      title={`Expenses: ${formatINR(m.expenses)}`}
                    />
                  </div>
                  <span className="text-[10px] text-muted">{monthLabel(m.month)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">Salary Paid vs Pending</h2>
          <p className="mt-0.5 text-xs text-muted">Current month</p>
          <div className="mt-6 space-y-5">
            <FinanceBar
              label="Paid"
              value={charts.salaryPaidVsPending?.paid || 0}
              max={salaryMax}
              color="bg-emerald-500"
              formatValue={formatINR}
            />
            <FinanceBar
              label="Pending"
              value={charts.salaryPaidVsPending?.pending || 0}
              max={salaryMax}
              color="bg-amber-500"
              formatValue={formatINR}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-ink">Monthly Net</h2>
        <p className="mt-0.5 text-xs text-muted">Emerald = profit · Rose = loss</p>
        {loading ? (
          <p className="mt-8 text-center text-sm text-muted">Loading...</p>
        ) : (
          <div className="mt-4">
            <VerticalBars
              items={monthly}
              getValue={(m) => m.net}
              getColor={(v) => (v >= 0 ? 'bg-emerald-500' : 'bg-rose-400')}
              formatTooltip={(m) => `${monthLabel(m.month)}: ${formatINR(m.net)}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
