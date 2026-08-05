import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/admin/EmptyState';
import { useToast } from '../../context/ToastContext';
import { attendanceService, staffService } from '../../services';
import { triggerBlobDownload, parseBlobError } from '../../utils/downloadBlob';
import {
  formatDate,
  formatTime,
  statusBadgeClass,
  statusLabel,
} from '../../utils/attendanceHelpers';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function AttendanceReports() {
  const toast = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [staffId, setStaffId] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    staffService
      .list({ status: 'active', limit: 100 })
      .then((res) => setStaffList(res.data.data.staff))
      .catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await attendanceService.monthly({
          year,
          month,
          ...(staffId && { staffId }),
        });
        setData(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    })();
  }, [year, month, staffId, toast]);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const res = await attendanceService.export({
        format,
        year,
        month,
        ...(staffId && { staffId }),
      });
      const ext = format === 'excel' || format === 'xlsx' ? 'xlsx' : format;
      triggerBlobDownload(res.data, `attendance-${year}-${month}.${ext}`);
      toast.success(`Exported as ${ext.toUpperCase()}`);
    } catch (err) {
      toast.error(await parseBlobError(err));
    } finally {
      setExporting('');
    }
  };

  const summaries = !staffId ? data?.summaries || [] : [];
  const records = staffId ? data?.records || [] : [];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Attendance Reports</h1>
          <p className="mt-1 text-sm text-muted">
            Staff-wise reports with Excel, CSV and PDF export.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={!!exporting} onClick={() => handleExport('excel')}>
            Export Excel
          </Button>
          <Button variant="outline" disabled={!!exporting} onClick={() => handleExport('csv')}>
            Export CSV
          </Button>
          <Button variant="outline" disabled={!!exporting} onClick={() => handleExport('pdf')}>
            Export PDF
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
        <select
          value={staffId}
          onChange={(e) => setStaffId(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          <option value="">All staff</option>
          {staffList.map((s) => (
            <option key={s._id} value={s._id}>
              {s.staffCode} — {s.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="mt-8 text-center text-sm text-muted">Loading...</p>
      ) : staffId && data?.summary ? (
        <>
          <h2 className="mt-8 text-lg font-semibold text-ink">
            {data.staff?.name} — {MONTHS[month - 1]} {year}
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <p>Working Days: <strong>{data.summary.totalWorkingDays}</strong></p>
            <p>Present: <strong>{data.summary.present}</strong></p>
            <p>Absent: <strong>{data.summary.absent}</strong></p>
            <p>Leave: <strong>{data.summary.leave}</strong></p>
            <p>Half Day: <strong>{data.summary.halfDay}</strong></p>
            <p>Late: <strong>{data.summary.late}</strong></p>
            <p>Attendance %: <strong>{data.summary.attendancePercentage}%</strong></p>
          </div>
          {records.length === 0 ? (
            <EmptyState message="No records for this month." />
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-muted">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Check In</th>
                    <th className="px-4 py-3">Check Out</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((row) => (
                    <tr key={row._id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3">{formatDate(row.date)}</td>
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
                        {row.locationVerified ? 'Verified' : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {row.distanceMeters != null ? `${Math.round(row.distanceMeters)}m` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : summaries.length === 0 ? (
        <EmptyState message="No attendance data for this month." />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3">Working Days</th>
                <th className="px-4 py-3">Present</th>
                <th className="px-4 py-3">Absent</th>
                <th className="px-4 py-3">Leave</th>
                <th className="px-4 py-3">Half Day</th>
                <th className="px-4 py-3">Late</th>
                <th className="px-4 py-3">%</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map(({ staff, summary }) => (
                <tr key={staff._id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{staff.name}</div>
                    <div className="text-xs text-muted">{staff.staffCode}</div>
                  </td>
                  <td className="px-4 py-3">{summary.totalWorkingDays}</td>
                  <td className="px-4 py-3">{summary.present}</td>
                  <td className="px-4 py-3">{summary.absent}</td>
                  <td className="px-4 py-3">{summary.leave}</td>
                  <td className="px-4 py-3">{summary.halfDay}</td>
                  <td className="px-4 py-3">{summary.late}</td>
                  <td className="px-4 py-3 font-semibold">{summary.attendancePercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
