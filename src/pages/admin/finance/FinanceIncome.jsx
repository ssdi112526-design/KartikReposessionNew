import { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import EmptyState from '../../../components/admin/EmptyState';
import { useToast } from '../../../context/ToastContext';
import { financeService } from '../../../services';
import {
  DATE_FILTER_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  formatDateIN,
  formatINR,
  paymentMethodLabel,
} from '../../../utils/financeHelpers.js';

const EMPTY = {
  title: '',
  category: '',
  amount: '',
  date: '',
  paymentMethod: 'cash',
  referenceNumber: '',
  description: '',
};

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand';

export default function FinanceIncome() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [filter, setFilter] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [confirm, setConfirm] = useState({ open: false, id: null, title: '', loading: false });

  useEffect(() => {
    financeService
      .meta()
      .then((res) => setCategories(res.data.data.incomeCategories || []))
      .catch(() => {});
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const params = {
        filter,
        ...(filter === 'custom' && startDate && { startDate }),
        ...(filter === 'custom' && endDate && { endDate }),
      };
      const res = await financeService.income(params);
      setRows(res.data.data.income || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load income');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filter === 'custom' && (!startDate || !endDate)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, startDate, endDate]);

  const openCreate = () => {
    setEditId(null);
    setForm({
      ...EMPTY,
      category: categories[0] || '',
      date: new Date().toISOString().slice(0, 10),
    });
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditId(row._id || row.id);
    setForm({
      title: row.title || '',
      category: row.category || '',
      amount: String(row.amount ?? ''),
      date: row.date ? String(row.date).slice(0, 10) : '',
      paymentMethod: row.paymentMethod || 'cash',
      referenceNumber: row.referenceNumber || '',
      description: row.description || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        amount: Number(form.amount),
        date: form.date,
        paymentMethod: form.paymentMethod,
        referenceNumber: form.referenceNumber || null,
        description: form.description || null,
      };
      if (editId) {
        await financeService.updateIncome(editId, payload);
        toast.success('Income updated');
      } else {
        await financeService.createIncome(payload);
        toast.success('Income added');
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setConfirm((c) => ({ ...c, loading: true }));
    try {
      await financeService.deleteIncome(confirm.id);
      toast.success('Income deleted');
      setConfirm({ open: false, id: null, title: '', loading: false });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
      setConfirm((c) => ({ ...c, loading: false }));
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Income</h1>
          <p className="mt-1 text-sm text-muted">Record and manage income transactions.</p>
        </div>
        <Button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditId(null);
            } else {
              openCreate();
            }
          }}
        >
          {showForm ? 'Close Form' : 'Add Income'}
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
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

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-ink">{editId ? 'Edit Income' : 'Add Income'}</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Category</label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Amount</label>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Date</label>
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Payment Method</label>
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
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-xs font-medium text-muted">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editId ? 'Update' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="mt-8 text-center text-sm text-muted">Loading...</p>
      ) : rows.length === 0 ? (
        <EmptyState message="No income records found for the selected filters." />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const id = row._id || row.id;
                return (
                  <tr key={id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">{formatDateIN(row.date)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{row.title}</div>
                      {row.description && (
                        <div className="text-xs text-muted line-clamp-1">{row.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">{row.category}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">{formatINR(row.amount)}</td>
                    <td className="px-4 py-3">{paymentMethodLabel(row.paymentMethod)}</td>
                    <td className="px-4 py-3">{row.referenceNumber || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="text-sm font-medium text-brand hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirm({ open: true, id, title: row.title, loading: false })
                          }
                          className="text-sm font-medium text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirm.open}
        danger
        title="Delete income?"
        message={`Delete "${confirm.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={confirm.loading}
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null, title: '', loading: false })}
      />
    </div>
  );
}
