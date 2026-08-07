export const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'other', label: 'Other' },
];

export const DATE_FILTER_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

export const MONTH_OPTIONS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
].map((label, i) => ({ value: i + 1, label }));

export function formatINR(amount) {
  const n = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(n);
}

export function paymentMethodLabel(method) {
  return PAYMENT_METHOD_OPTIONS.find((o) => o.value === method)?.label || method || '—';
}

export function salaryStatusLabel(status) {
  if (status === 'paid') return 'Paid';
  if (status === 'partially_paid') return 'Partially Paid';
  return 'Pending';
}

export function salaryStatusClass(status) {
  if (status === 'paid') return 'bg-emerald-50 text-emerald-700';
  if (status === 'partially_paid') return 'bg-amber-50 text-amber-700';
  return 'bg-red-50 text-red-700';
}

export function formatDateIN(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

export function currentYearMonth() {
  const now = new Date();
  // Approximate IST
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return { year: ist.getUTCFullYear(), month: ist.getUTCMonth() + 1 };
}
