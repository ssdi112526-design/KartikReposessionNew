import { useEffect, useRef, useState } from 'react';
import SearchBar from '../../components/admin/SearchBar';
import Pagination from '../../components/admin/Pagination';
import EmptyState from '../../components/admin/EmptyState';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { attendanceService, staffService } from '../../services';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { triggerBlobDownload, parseBlobError } from '../../utils/downloadBlob';
import {
  ATTENDANCE_METHOD_OPTIONS,
  ATTENDANCE_STATUS_OPTIONS,
  DATE_FILTER_OPTIONS,
  formatDate,
  formatTime,
  methodBadgeClass,
  methodLabel,
  statusBadgeClass,
  statusLabel,
} from '../../utils/attendanceHelpers';

export default function AttendanceHistory() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [filters, setFilters] = useState({
    dateFilter: 'month',
    startDate: '',
    endDate: '',
    status: '',
    staffId: '',
    locationVerified: '',
    attendanceMethod: '',
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });

  const filtersKey = JSON.stringify({ ...filters, debouncedSearch });
  const prevKey = useRef(filtersKey);

  useEffect(() => {
    staffService
      .list({ status: 'active', limit: 100 })
      .then((res) => setStaffList(res.data.data.staff))
      .catch(() => {});
  }, []);

  const buildParams = (page) => ({
    page,
    limit: pagination.limit,
    ...(filters.status && { status: filters.status }),
    ...(filters.staffId && { staffId: filters.staffId }),
    ...(filters.dateFilter && { dateFilter: filters.dateFilter }),
    ...(filters.dateFilter === 'custom' && filters.startDate && { startDate: filters.startDate }),
    ...(filters.dateFilter === 'custom' && filters.endDate && { endDate: filters.endDate }),
    ...(filters.locationVerified && { locationVerified: filters.locationVerified }),
    ...(filters.attendanceMethod && { attendanceMethod: filters.attendanceMethod }),
  });

  const load = async (page) => {
    setLoading(true);
    try {
      const res = await attendanceService.history(buildParams(page));
      let list = res.data.data.attendance;
      if (debouncedSearch.trim()) {
        const term = debouncedSearch.trim().toLowerCase();
        list = list.filter(
          (r) =>
            r.staff?.name?.toLowerCase().includes(term) ||
            r.staff?.staffCode?.toLowerCase().includes(term)
        );
      }
      setRows(list);
      const p = res.data.data.pagination;
      setPagination((prev) => ({ ...prev, total: p.total, pages: p.pages, page: p.page }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const changed = prevKey.current !== filtersKey;
    prevKey.current = filtersKey;
    if (changed && pagination.page !== 1) {
      setPagination((prev) => ({ ...prev, page: 1 }));
      return;
    }
    load(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filtersKey]);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const params = { ...buildParams(1), format, limit: 5000 };
      delete params.page;
      const res = await attendanceService.export(params);
      const ext = format === 'excel' || format === 'xlsx' ? 'xlsx' : format;
      triggerBlobDownload(res.data, `attendance-export.${ext}`);
      toast.success(`Exported as ${ext.toUpperCase()}`);
    } catch (err) {
      toast.error(await parseBlobError(err));
    } finally {
      setExporting('');
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Attendance History</h1>
          <p className="mt-1 text-sm text-muted">View, filter and download staff attendance records.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={!!exporting} onClick={() => handleExport('excel')}>
            {exporting === 'excel' ? 'Exporting...' : 'Export Excel'}
          </Button>
          <Button variant="outline" disabled={!!exporting} onClick={() => handleExport('csv')}>
            {exporting === 'csv' ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button variant="outline" disabled={!!exporting} onClick={() => handleExport('pdf')}>
            {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Filter by name or Staff ID..." />
        <select
          value={filters.dateFilter}
          onChange={(e) => setFilters((f) => ({ ...f, dateFilter: e.target.value }))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          {DATE_FILTER_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {filters.dateFilter === 'custom' && (
          <>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </>
        )}
        <select
          value={filters.staffId}
          onChange={(e) => setFilters((f) => ({ ...f, staffId: e.target.value }))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          <option value="">All staff</option>
          {staffList.map((s) => (
            <option key={s._id} value={s._id}>
              {s.staffCode} — {s.name}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          <option value="">All status</option>
          {ATTENDANCE_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={filters.attendanceMethod}
          onChange={(e) => setFilters((f) => ({ ...f, attendanceMethod: e.target.value }))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          {ATTENDANCE_METHOD_OPTIONS.map((o) => (
            <option key={o.value || 'all-methods'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={filters.locationVerified}
          onChange={(e) => setFilters((f) => ({ ...f, locationVerified: e.target.value }))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          <option value="">All locations</option>
          <option value="true">Verified</option>
          <option value="false">Failed / N/A</option>
        </select>
      </div>

      {loading ? (
        <p className="mt-8 text-center text-sm text-muted">Loading...</p>
      ) : rows.length === 0 ? (
        <EmptyState message="No attendance records found for the selected filters." />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Check In</th>
                <th className="px-4 py-3">Check Out</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Distance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">{formatDate(row.date)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{row.staff?.name}</div>
                    <div className="text-xs text-muted">{row.staff?.staffCode}</div>
                  </td>
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
                  <td className="px-4 py-3">
                    {row.locationVerified ? (
                      <span className="text-emerald-700">Verified</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
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

      {!loading && rows.length > 0 && (
        <Pagination
          pagination={pagination}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          onLimitChange={(limit) => setPagination((prev) => ({ ...prev, limit, page: 1 }))}
        />
      )}
    </div>
  );
}
