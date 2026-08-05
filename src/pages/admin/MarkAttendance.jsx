import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/admin/EmptyState';
import { useToast } from '../../context/ToastContext';
import { attendanceService, staffService } from '../../services';
import { ATTENDANCE_STATUS_OPTIONS, todayLabel } from '../../utils/attendanceHelpers';

export default function MarkAttendance() {
  const toast = useToast();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [staffRes, todayRes] = await Promise.all([
        staffService.list({ status: 'active', limit: 100 }),
        attendanceService.today(),
      ]);

      const existingByStaff = new Map();
      if (date === new Date().toISOString().slice(0, 10)) {
        for (const row of todayRes.data.data.attendance) {
          if (!row.isPlaceholder) {
            existingByStaff.set(row.staff?._id || row.staffId, row);
          }
        }
      } else {
        const hist = await attendanceService.history({ date, limit: 100 });
        for (const row of hist.data.data.attendance) {
          existingByStaff.set(row.staff?._id || row.staffId, row);
        }
      }

      const mapped = staffRes.data.data.staff.map((s) => {
        const existing = existingByStaff.get(s._id);
        return {
          staffId: s._id,
          staffCode: s.staffCode,
          name: s.name,
          status: existing?.status || 'absent',
          checkIn: existing?.checkIn
            ? new Date(existing.checkIn).toISOString().slice(11, 16)
            : '',
          checkOut: existing?.checkOut
            ? new Date(existing.checkOut).toISOString().slice(11, 16)
            : '',
        };
      });
      setRows(mapped);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const updateRow = (staffId, patch) => {
    setRows((prev) => prev.map((r) => (r.staffId === staffId ? { ...r, ...patch } : r)));
  };

  const toIsoTime = (timeStr) => {
    if (!timeStr) return null;
    return `${date}T${timeStr}:00`;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await attendanceService.bulk({
        date,
        records: rows.map((r) => ({
          staffId: r.staffId,
          status: r.status,
          checkIn: toIsoTime(r.checkIn),
          checkOut: toIsoTime(r.checkOut),
        })),
      });
      toast.success('Attendance saved successfully');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Mark Attendance</h1>
          <p className="mt-1 text-sm text-muted">Manually mark staff attendance · {todayLabel()}</p>
        </div>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-muted">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </label>
      </div>

      {loading ? (
        <p className="mt-8 text-center text-sm text-muted">Loading...</p>
      ) : rows.length === 0 ? (
        <EmptyState message="No active staff to mark attendance." />
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Staff ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Check In</th>
                  <th className="px-4 py-3">Check Out</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.staffId} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium">{row.staffCode}</td>
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">
                      <select
                        value={row.status}
                        onChange={(e) => updateRow(row.staffId, { status: e.target.value })}
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand"
                      >
                        {ATTENDANCE_STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        value={row.checkIn}
                        onChange={(e) => updateRow(row.staffId, { checkIn: e.target.value })}
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        value={row.checkOut}
                        onChange={(e) => updateRow(row.staffId, { checkOut: e.target.value })}
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Attendance'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
