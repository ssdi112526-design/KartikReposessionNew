import { Fragment, useEffect, useMemo, useState } from 'react';
import { FaHistory, FaTimes } from 'react-icons/fa';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/admin/EmptyState';
import SearchBar from '../../../components/admin/SearchBar';
import { useToast } from '../../../context/ToastContext';
import { financeService, staffService } from '../../../services';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import {
  MONTH_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  currentYearMonth,
  formatDateIN,
  formatINR,
  salaryStatusClass,
  salaryStatusLabel,
  paymentMethodLabel,
} from '../../../utils/financeHelpers.js';

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand disabled:bg-slate-50';

const EMPTY_FORM = {
  staffId: '',
  salaryMonth: currentYearMonth().month,
  salaryYear: currentYearMonth().year,
  monthlySalary: '',
  paymentAmount: '',
  paymentDate: new Date().toISOString().slice(0, 10),
  paymentMethod: 'cash',
  referenceNumber: '',
  notes: '',
};

function apiErrorMessage(err, fallback) {
  const data = err.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors.filter(Boolean).join('. ');
  }
  return data?.message || fallback;
}

function firstDayOfMonth(year, month) {
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

export default function FinanceStaffSalary() {
  const toast = useToast();
  const ym = currentYearMonth();
  const [year, setYear] = useState(ym.year);
  const [month, setMonth] = useState(ym.month);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [previousPaid, setPreviousPaid] = useState(0);
  const [configuredSalary, setConfiguredSalary] = useState(0);
  const [recentPayments, setRecentPayments] = useState([]);
  const [historyStaffId, setHistoryStaffId] = useState(null);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadStaffOptions = async () => {
    try {
      const res = await staffService.list({ status: 'active', limit: 100 });
      setStaffList(res.data.data.staff || []);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to load staff list'));
    }
  };

  useEffect(() => {
    loadStaffOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async (override = {}) => {
    const y = override.year ?? year;
    const m = override.month ?? month;
    setLoading(true);
    try {
      const res = await financeService.salaries({
        year: y,
        month: m,
        ...(status && { status }),
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
      });
      setRows(res.data.data.rows || []);
      setSummary(res.data.data.summary || null);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to load salaries'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, status, debouncedSearch]);

  const openAddSalary = (staffId = '') => {
    setForm({
      ...EMPTY_FORM,
      staffId,
      salaryMonth: month,
      salaryYear: year,
      paymentDate: new Date().toISOString().slice(0, 10),
    });
    setPreviousPaid(0);
    setConfiguredSalary(0);
    setRecentPayments([]);
    setShowForm(true);
    // Refresh staff options when opening the form (avoids empty dropdown)
    loadStaffOptions();
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setPreviousPaid(0);
    setConfiguredSalary(0);
    setRecentPayments([]);
  };

  // Load previous paid + salary config when staff/month/year change in the form
  useEffect(() => {
    if (!showForm || !form.staffId) {
      setPreviousPaid(0);
      setConfiguredSalary(0);
      setRecentPayments([]);
      return;
    }
    let cancelled = false;
    setBalanceLoading(true);
    (async () => {
      try {
        const [salRes, histRes] = await Promise.all([
          financeService.salaries({ year: form.salaryYear, month: form.salaryMonth }),
          financeService.staffSalaryHistory(form.staffId),
        ]);
        if (cancelled) return;
        const row = (salRes.data.data.rows || []).find(
          (r) => (r.staff?._id || r.staff?.id) === form.staffId
        );
        const payable = Number(row?.salaryPayable) || 0;
        const paid = Number(row?.amountPaid) || 0;
        setConfiguredSalary(payable);
        setPreviousPaid(paid);
        setForm((f) => ({
          ...f,
          monthlySalary: payable > 0 ? String(payable) : f.monthlySalary || '',
        }));
        const monthPays = (histRes.data.data.payments || []).filter(
          (p) => Number(p.salaryMonth) === Number(form.salaryMonth) && Number(p.salaryYear) === Number(form.salaryYear)
        );
        setRecentPayments(monthPays);
      } catch {
        if (!cancelled) {
          setPreviousPaid(0);
          setConfiguredSalary(0);
          setRecentPayments([]);
        }
      } finally {
        if (!cancelled) setBalanceLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showForm, form.staffId, form.salaryMonth, form.salaryYear]);

  const staffOptions = useMemo(() => {
    const map = new Map();
    for (const s of staffList) {
      const id = s._id || s.id;
      if (id) map.set(id, { _id: id, staffCode: s.staffCode, name: s.name });
    }
    // Fallback from salary table rows if list API failed earlier
    for (const row of rows) {
      const id = row.staff?._id || row.staff?.id;
      if (id && !map.has(id)) {
        map.set(id, {
          _id: id,
          staffCode: row.staff?.staffCode,
          name: row.staff?.name,
        });
      }
    }
    return [...map.values()].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  }, [staffList, rows]);

  const selectedStaff = useMemo(
    () => staffOptions.find((s) => s._id === form.staffId) || null,
    [staffOptions, form.staffId]
  );

  const salaryAmount = Number(form.monthlySalary) || 0;
  const currentPayment = Number(form.paymentAmount) || 0;
  const remainingBefore = Math.max(0, Math.round((salaryAmount - previousPaid) * 100) / 100);
  const totalPaidPreview = Math.round((previousPaid + currentPayment) * 100) / 100;
  const pendingPreview = Math.max(0, Math.round((salaryAmount - totalPaidPreview) * 100) / 100);
  const statusPreview =
    salaryAmount <= 0
      ? 'pending'
      : currentPayment <= 0 && previousPaid <= 0
        ? 'pending'
        : pendingPreview <= 0.001
          ? 'paid'
          : previousPaid + currentPayment > 0
            ? 'partially_paid'
            : 'pending';

  const years = Array.from({ length: 6 }, (_, i) => ym.year - 2 + i);

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!form.staffId) {
      toast.error('Please select a staff member');
      return;
    }
    if (!(salaryAmount > 0)) {
      toast.error('Monthly salary is required');
      return;
    }
    if (!(currentPayment > 0)) {
      toast.error('Current payment must be greater than 0');
      return;
    }

    if (previousPaid + 0.001 >= salaryAmount) {
      toast.error('Salary is already fully paid for this month.');
      return;
    }
    if (currentPayment > remainingBefore + 0.001) {
      toast.error(
        `Payment cannot exceed the remaining salary of ${formatINR(remainingBefore)}.`
      );
      return;
    }

    setSaving(true);
    try {
      // Ensure salary config exists / matches entered monthly salary
      const needsSalaryUpdate =
        !configuredSalary || Math.abs(configuredSalary - salaryAmount) > 0.001;
      if (needsSalaryUpdate) {
        await financeService.setSalary({
          staffId: form.staffId,
          monthlySalary: salaryAmount,
          effectiveFrom: firstDayOfMonth(form.salaryYear, form.salaryMonth),
          salaryType: 'monthly',
          notes: form.notes || null,
        });
      }

      await financeService.createSalaryPayment({
        staffId: form.staffId,
        salaryMonth: Number(form.salaryMonth),
        salaryYear: Number(form.salaryYear),
        paymentAmount: currentPayment,
        paymentDate: form.paymentDate,
        paymentMethod: form.paymentMethod,
        referenceNumber: form.referenceNumber || null,
        notes: form.notes || null,
        allowOverpayment: false,
      });

      toast.success('Salary payment saved');
      const payMonth = Number(form.salaryMonth);
      const payYear = Number(form.salaryYear);
      closeForm();
      setMonth(payMonth);
      setYear(payYear);
      await load({ year: payYear, month: payMonth });
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to save payment'));
    } finally {
      setSaving(false);
    }
  };

  const toggleHistory = async (staffId) => {
    if (historyStaffId === staffId) {
      setHistoryStaffId(null);
      setHistory(null);
      return;
    }
    setHistoryStaffId(staffId);
    setHistoryLoading(true);
    try {
      const res = await financeService.staffSalaryHistory(staffId);
      setHistory(res.data.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to load history'));
      setHistoryStaffId(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Staff Salary</h1>
          <p className="mt-1 text-sm text-muted">
            Set salaries, record payments, and review monthly status in one place.
          </p>
        </div>
        <Button onClick={() => openAddSalary()}>Salary Payment</Button>
      </div>

      {summary && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-muted">Payable</p>
            <p className="mt-1 text-lg font-bold text-ink">{formatINR(summary.totalPayable)}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-muted">Paid</p>
            <p className="mt-1 text-lg font-bold text-emerald-700">{formatINR(summary.totalPaid)}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-muted">Pending</p>
            <p className="mt-1 text-lg font-bold text-amber-700">{formatINR(summary.totalPending)}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-muted">Staff</p>
            <p className="mt-1 text-lg font-bold text-ink">{summary.totalStaff}</p>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search staff name or ID..." />
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          {MONTH_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {loading ? (
        <p className="mt-8 text-center text-sm text-muted">Loading...</p>
      ) : rows.length === 0 ? (
        <EmptyState message="No staff salary rows match the selected filters." />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3">Salary</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Pending</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Payment</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const staffId = row.staff?._id || row.staff?.id;
                return (
                  <Fragment key={staffId}>
                    <tr className="border-b border-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{row.staff?.name}</div>
                        <div className="text-xs text-muted">{row.staff?.staffCode}</div>
                      </td>
                      <td className="px-4 py-3">{formatINR(row.salaryPayable)}</td>
                      <td className="px-4 py-3 text-emerald-700">{formatINR(row.amountPaid)}</td>
                      <td className="px-4 py-3 text-amber-700">{formatINR(row.pendingAmount)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${salaryStatusClass(row.paymentStatus)}`}
                        >
                          {salaryStatusLabel(row.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3">{formatDateIN(row.lastPaymentDate)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openAddSalary(staffId)}
                            className="rounded-lg px-2 py-1 text-xs font-medium text-brand hover:bg-brand/10"
                            title="Add payment"
                          >
                            Pay
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleHistory(staffId)}
                            title={historyStaffId === staffId ? 'Hide History' : 'View History'}
                            aria-label={historyStaffId === staffId ? 'Hide History' : 'View History'}
                            className={`rounded-lg p-2 transition ${
                              historyStaffId === staffId
                                ? 'bg-brand/10 text-brand'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-brand'
                            }`}
                          >
                            <FaHistory className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {historyStaffId === staffId && (
                      <tr className="border-b border-slate-50 bg-slate-50/60">
                        <td colSpan={7} className="px-4 py-3">
                          {historyLoading ? (
                            <p className="text-sm text-muted">Loading history...</p>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-xs text-muted">
                                Current salary:{' '}
                                <span className="font-semibold text-ink">
                                  {formatINR(history?.totals?.monthlySalary)}
                                </span>
                                {' · '}Paid this month:{' '}
                                <span className="font-semibold text-ink">
                                  {formatINR(history?.totals?.paidThisMonth)}
                                </span>
                                {' · '}Pending this month:{' '}
                                <span className="font-semibold text-ink">
                                  {formatINR(history?.totals?.pendingThisMonth)}
                                </span>
                                {' · '}Total paid all-time:{' '}
                                <span className="font-semibold text-ink">
                                  {formatINR(history?.totals?.totalPaid)}
                                </span>
                              </p>
                              {(history?.payments || []).length === 0 ? (
                                <p className="text-sm text-muted">No payment history yet.</p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-left text-xs">
                                    <thead className="text-muted">
                                      <tr>
                                        <th className="py-1 pr-3">Date</th>
                                        <th className="py-1 pr-3">Month</th>
                                        <th className="py-1 pr-3">Paid</th>
                                        <th className="py-1 pr-3">Pending</th>
                                        <th className="py-1 pr-3">Method</th>
                                        <th className="py-1 pr-3">Reference</th>
                                        <th className="py-1 pr-3">Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {history.payments.map((p) => (
                                        <tr key={p._id || p.id}>
                                          <td className="py-1 pr-3">{formatDateIN(p.paymentDate)}</td>
                                          <td className="py-1 pr-3">
                                            {p.salaryMonth}/{p.salaryYear}
                                          </td>
                                          <td className="py-1 pr-3">{formatINR(p.paymentAmount)}</td>
                                          <td className="py-1 pr-3">{formatINR(p.pendingAmount)}</td>
                                          <td className="py-1 pr-3">
                                            {p.paymentMethodLabel ||
                                              paymentMethodLabel(p.paymentMethod)}
                                          </td>
                                          <td className="py-1 pr-3">{p.referenceNumber || '—'}</td>
                                          <td className="py-1 pr-3">{p.notes || '—'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="salary-payment-title"
        >
          <div className="w-full max-w-2xl rounded-xl border border-slate-100 bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 id="salary-payment-title" className="text-lg font-bold text-ink">
                Salary Payment
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Set monthly salary and record a payment without overwriting previous payments.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4 px-5 py-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-muted">Staff *</label>
                  <select
                    required
                    value={form.staffId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, staffId: e.target.value, monthlySalary: '', paymentAmount: '' }))
                    }
                    className={inputClass}
                  >
                    <option value="">Select staff</option>
                    {staffOptions.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.staffCode} — {s.name}
                      </option>
                    ))}
                  </select>
                  {staffOptions.length === 0 && (
                    <p className="mt-1 text-xs text-red-600">
                      No staff found. Check Staff → All Staff, then reopen this form.
                    </p>
                  )}
                  {selectedStaff && (
                    <p className="mt-1 text-xs text-muted">
                      Staff ID: <span className="font-medium text-ink">{selectedStaff.staffCode}</span>
                      {' · '}
                      Name: <span className="font-medium text-ink">{selectedStaff.name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Salary Month *</label>
                  <select
                    required
                    value={form.salaryMonth}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, salaryMonth: Number(e.target.value), paymentAmount: '' }))
                    }
                    className={inputClass}
                  >
                    {MONTH_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Year *</label>
                  <select
                    required
                    value={form.salaryYear}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, salaryYear: Number(e.target.value), paymentAmount: '' }))
                    }
                    className={inputClass}
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Monthly Salary *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.monthlySalary}
                    onChange={(e) => setForm((f) => ({ ...f, monthlySalary: e.target.value }))}
                    className={inputClass}
                    placeholder="25000"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Previous Paid</label>
                  <input
                    readOnly
                    value={balanceLoading ? 'Loading...' : formatINR(previousPaid)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Current Payment *</label>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.paymentAmount}
                    onChange={(e) => setForm((f) => ({ ...f, paymentAmount: e.target.value }))}
                    className={inputClass}
                    disabled={previousPaid + 0.001 >= salaryAmount && salaryAmount > 0}
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Payment Date *</label>
                  <input
                    required
                    type="date"
                    value={form.paymentDate}
                    onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Payment Method *</label>
                  <select
                    required
                    value={form.paymentMethod}
                    onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                    className={inputClass}
                  >
                    {PAYMENT_METHOD_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Reference Number</label>
                  <input
                    value={form.referenceNumber}
                    onChange={(e) => setForm((f) => ({ ...f, referenceNumber: e.target.value }))}
                    className={inputClass}
                    placeholder="Optional"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-muted">Notes</label>
                  <input
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    className={inputClass}
                    placeholder="Optional"
                  />
                </div>
              </div>

              {form.staffId && salaryAmount > 0 && (
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 px-3 py-3 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted">Total Paid</p>
                    <p className="font-semibold text-emerald-700">{formatINR(totalPaidPreview)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Pending</p>
                    <p className="font-semibold text-amber-700">{formatINR(pendingPreview)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Remaining before pay</p>
                    <p className="font-semibold text-ink">{formatINR(remainingBefore)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Status</p>
                    <span
                      className={`mt-0.5 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${salaryStatusClass(statusPreview)}`}
                    >
                      {salaryStatusLabel(statusPreview)}
                    </span>
                  </div>
                </div>
              )}

              {previousPaid + 0.001 >= salaryAmount && salaryAmount > 0 && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Salary is already fully paid for this month.
                </p>
              )}

              {recentPayments.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Payments this month ({recentPayments.length})
                  </p>
                  <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-100">
                    <table className="min-w-full text-left text-xs">
                      <thead className="bg-slate-50 text-muted">
                        <tr>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Amount</th>
                          <th className="px-3 py-2">Method</th>
                          <th className="px-3 py-2">Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentPayments.map((p) => (
                          <tr key={p._id || p.id} className="border-t border-slate-50">
                            <td className="px-3 py-2">{formatDateIN(p.paymentDate)}</td>
                            <td className="px-3 py-2">{formatINR(p.paymentAmount)}</td>
                            <td className="px-3 py-2">
                              {p.paymentMethodLabel || paymentMethodLabel(p.paymentMethod)}
                            </td>
                            <td className="px-3 py-2">{p.referenceNumber || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                <Button type="button" variant="outline" onClick={closeForm} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    saving ||
                    balanceLoading ||
                    !form.staffId ||
                    !(salaryAmount > 0) ||
                    !(currentPayment > 0) ||
                    previousPaid + 0.001 >= salaryAmount
                  }
                >
                  {saving ? 'Saving...' : 'Save Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
