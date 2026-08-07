import { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../context/ToastContext';
import { financeService } from '../../../services';

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand';

export default function FinanceSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    currencySymbol: '₹',
    allowOverpayment: false,
    companyDisplayName: 'Kartik Repossession Agency',
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await financeService.settings();
        const s = res.data.data.settings;
        setForm({
          currencySymbol: s.currencySymbol || '₹',
          allowOverpayment: Boolean(s.allowOverpayment),
          companyDisplayName: s.companyDisplayName || 'Kartik Repossession Agency',
        });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await financeService.saveSettings({
        currencySymbol: form.currencySymbol,
        allowOverpayment: Boolean(form.allowOverpayment),
        companyDisplayName: form.companyDisplayName,
      });
      toast.success('Finance settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-ink">Finance Settings</h1>
        <p className="mt-1 text-sm text-muted">Configure currency, company name and payment rules.</p>
      </div>

      {loading ? (
        <p className="mt-8 text-center text-sm text-muted">Loading...</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-6 max-w-xl rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Currency Symbol</label>
              <input
                value={form.currencySymbol}
                onChange={(e) => setForm((f) => ({ ...f, currencySymbol: e.target.value }))}
                className={inputClass}
                maxLength={8}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Company Display Name</label>
              <input
                value={form.companyDisplayName}
                onChange={(e) => setForm((f) => ({ ...f, companyDisplayName: e.target.value }))}
                className={inputClass}
                maxLength={150}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.allowOverpayment}
                onChange={(e) => setForm((f) => ({ ...f, allowOverpayment: e.target.checked }))}
                className="rounded border-slate-300"
              />
              Allow salary overpayment by default
            </label>
          </div>
          <div className="mt-6">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
