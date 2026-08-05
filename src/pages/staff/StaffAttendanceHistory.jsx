import { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { staffAuthService } from '../../services';
import {
  formatDate,
  formatTime,
  methodBadgeClass,
  methodLabel,
  statusBadgeClass,
  statusLabel,
} from '../../utils/attendanceHelpers';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function StaffAttendanceHistory() {
  const toast = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await staffAuthService.myHistory({ year, month });
        setData(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load attendance');
      } finally {
        setLoading(false);
      }
    })();
  }, [year, month, toast]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">My Attendance</h1>
      <p className="mt-1 text-sm text-muted">View your personal attendance history.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          {[year - 1, year, year + 1].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {data?.summary && (
        <p className="mt-4 text-sm text-muted">
          {MONTHS[month - 1]} {year} · Present {data.summary.present} · Absent {data.summary.absent}{' '}
          · Late {data.summary.late} · {data.summary.attendancePercentage}%
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-center text-sm text-muted">Loading...</p>
      ) : !data?.records?.length ? (
        <p className="mt-8 text-center text-sm text-muted">No attendance records for this month.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Check In</th>
                <th className="px-4 py-3">Check Out</th>
              </tr>
            </thead>
            <tbody>
              {data.records.map((row) => (
                <tr key={row._id || row.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">{formatDate(row.date)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(row.status)}`}
                    >
                      {statusLabel(row.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.attendanceMethod ? (
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${methodBadgeClass(row.attendanceMethod)}`}
                      >
                        {methodLabel(row.attendanceMethod)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">{formatTime(row.checkIn)}</td>
                  <td className="px-4 py-3">{formatTime(row.checkOut)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
