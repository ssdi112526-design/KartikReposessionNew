export const ATTENDANCE_STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'half_day', label: 'Half Day' },
  { value: 'leave', label: 'Leave' },
];

export const ATTENDANCE_METHOD_OPTIONS = [
  { value: '', label: 'All methods' },
  { value: 'QR', label: 'QR' },
  { value: 'BIOMETRIC', label: 'Biometric' },
  { value: 'MANUAL', label: 'Manual' },
];

export function methodLabel(method) {
  if (!method) return '—';
  if (method === 'BIOMETRIC') return 'Biometric';
  if (method === 'QR') return 'QR';
  if (method === 'MANUAL') return 'Manual';
  return method;
}

export function methodBadgeClass(method) {
  switch (method) {
    case 'QR':
      return 'bg-sky-50 text-sky-700';
    case 'BIOMETRIC':
      return 'bg-violet-50 text-violet-700';
    case 'MANUAL':
      return 'bg-slate-100 text-slate-700';
    default:
      return 'bg-slate-50 text-slate-600';
  }
}
export const STAFF_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const DATE_FILTER_OPTIONS = [
  { value: '', label: 'All dates' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'previous_month', label: 'Previous Month' },
  { value: 'custom', label: 'Custom Range' },
];

export function statusLabel(status) {
  return ATTENDANCE_STATUS_OPTIONS.find((o) => o.value === status)?.label || status || '—';
}

export function statusBadgeClass(status) {
  switch (status) {
    case 'present':
      return 'bg-emerald-50 text-emerald-700';
    case 'absent':
      return 'bg-red-50 text-red-700';
    case 'late':
      return 'bg-amber-50 text-amber-700';
    case 'half_day':
      return 'bg-sky-50 text-sky-700';
    case 'leave':
      return 'bg-violet-50 text-violet-700';
    default:
      return 'bg-slate-50 text-slate-600';
  }
}

export function formatTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

export function formatDate(value) {
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

export function todayLabel() {
  return new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

export function buildStaffQrPayload(qrToken) {
  return `KRA-STAFF:${qrToken}`;
}
