import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import StatCard from '../../components/admin/StatCard';
import EmptyState from '../../components/admin/EmptyState';
import { useToast } from '../../context/ToastContext';
import { attendanceService } from '../../services';
import {
  ATTENDANCE_STATUS_OPTIONS,
  formatTime,
  methodBadgeClass,
  methodLabel,
  statusBadgeClass,
  statusLabel,
  todayLabel,
} from '../../utils/attendanceHelpers';
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaPlaneDeparture,
  FaPercentage,
} from 'react-icons/fa';

export default function TodayAttendance() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.today();
      setRows(res.data.data.attendance);
      setSummary(res.data.data.summary);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (row, status) => {
    const staffId = row.staff?._id || row.staffId;
    setSavingId(staffId);
    try {
      await attendanceService.mark({
        staffId,
        status,
        checkIn: row.checkIn || undefined,
        checkOut: row.checkOut || undefined,
      });
      toast.success(`Attendance updated for ${row.staff?.name || 'staff'}`);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Today&apos;s Attendance</h1>
          <p className="mt-1 text-sm text-muted">{todayLabel()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/admin/attendance/qr">QR Scan</Button>
          <Button href="/admin/attendance/biometric" variant="outline">
            Biometric
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Staff" value={summary?.totalStaff ?? 0} icon={FaUsers} loading={loading} />
        <StatCard label="Present" value={summary?.present ?? 0} icon={FaUserCheck} loading={loading} />
        <StatCard label="Absent" value={summary?.absent ?? 0} icon={FaUserTimes} loading={loading} />
        <StatCard label="Leave" value={summary?.leave ?? 0} icon={FaPlaneDeparture} loading={loading} />
        <StatCard label="Late" value={summary?.late ?? 0} icon={FaUserClock} loading={loading} />
        <StatCard
          label="Attendance %"
          value={`${summary?.attendancePercentage ?? 0}%`}
          icon={FaPercentage}
          loading={loading}
        />
      </div>

      {loading ? (
        <p className="mt-8 text-center text-sm text-muted">Loading...</p>
      ) : rows.length === 0 ? (
        <EmptyState message="No active staff found. Add staff members first." />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Staff ID</th>
                <th className="px-4 py-3">Staff Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Check In</th>
                <th className="px-4 py-3">Check Out</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Distance</th>
                <th className="px-4 py-3">Update</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const staffId = row.staff?._id || row.staffId;
                return (
                  <tr key={staffId} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium">{row.staff?.staffCode}</td>
                    <td className="px-4 py-3">{row.staff?.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(row.status)}`}
                      >
                        {statusLabel(row.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatTime(row.checkIn)}</td>
                    <td className="px-4 py-3">{formatTime(row.checkOut)}</td>
                    <td className="px-4 py-3">
                      {row.isPlaceholder || !row.attendanceMethod ? (
                        '—'
                      ) : (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${methodBadgeClass(row.attendanceMethod)}`}
                        >
                          {methodLabel(row.attendanceMethod)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {row.isPlaceholder ? (
                        '—'
                      ) : row.locationVerified ? (
                        <span className="font-medium text-emerald-700">Verified</span>
                      ) : row.checkIn ? (
                        <span className="text-amber-700">Failed</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {row.distanceMeters != null ? `${Math.round(row.distanceMeters)}m` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={row.status}
                        disabled={savingId === staffId}
                        onChange={(e) => updateStatus(row, e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand"
                      >
                        {ATTENDANCE_STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
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
