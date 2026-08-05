import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import SearchBar from '../../components/admin/SearchBar';
import Pagination from '../../components/admin/Pagination';
import EmptyState from '../../components/admin/EmptyState';
import { useToast } from '../../context/ToastContext';
import { staffService } from '../../services';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { formatDate } from '../../utils/attendanceHelpers';

export default function StaffList() {
  const toast = useToast();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [confirm, setConfirm] = useState({
    open: false,
    id: null,
    name: '',
    hard: false,
    loading: false,
  });

  const filtersKey = JSON.stringify({ debouncedSearch, status });
  const prevKey = useRef(filtersKey);

  const fetchStaff = async (page) => {
    setLoading(true);
    setError('');
    try {
      const res = await staffService.list({
        page,
        limit: pagination.limit,
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
        ...(status && { status }),
      });
      const { staff: list, pagination: p } = res.data.data;
      setStaff(list);
      setPagination((prev) => ({ ...prev, total: p.total, pages: p.pages, page: p.page }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load staff');
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
    fetchStaff(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filtersKey]);

  const openDelete = (member) => {
    setConfirm({
      open: true,
      id: member._id || member.id,
      name: member.name || member.staffCode || 'this staff member',
      hard: member.status === 'inactive',
      loading: false,
    });
  };

  const handleDelete = async () => {
    setConfirm((s) => ({ ...s, loading: true }));
    try {
      await staffService.remove(confirm.id, confirm.hard);
      toast.success(confirm.hard ? 'Staff deleted permanently' : 'Staff deleted (deactivated)');
      setConfirm({ open: false, id: null, name: '', hard: false, loading: false });
      fetchStaff(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete staff');
      setConfirm((s) => ({ ...s, loading: false }));
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">All Staff</h1>
          <p className="mt-1 text-sm text-muted">Manage staff members and their profiles.</p>
        </div>
        <Button href="/admin/staff/new">Add Staff</Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search name, ID, mobile..." />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand"
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="mt-8 text-center text-sm text-muted">Loading staff...</p>
      ) : staff.length === 0 ? (
        <EmptyState message="No staff members found. Add your first staff member." />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Staff ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Joining</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s._id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{s.staffCode}</td>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">{s.mobile}</td>
                  <td className="px-4 py-3">{s.designation || '—'}</td>
                  <td className="px-4 py-3">{s.department || '—'}</td>
                  <td className="px-4 py-3">{formatDate(s.joiningDate)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        s.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/admin/staff/${s._id}/edit`}
                        aria-label={`Edit ${s.name}`}
                        title="Edit"
                        className="text-brand hover:text-brand-dark"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        type="button"
                        aria-label={`Delete ${s.name}`}
                        title="Delete"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => openDelete(s)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && staff.length > 0 && (
        <Pagination
          pagination={pagination}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          onLimitChange={(limit) => setPagination((prev) => ({ ...prev, limit, page: 1 }))}
        />
      )}

      <ConfirmDialog
        open={confirm.open}
        title={confirm.hard ? 'Delete staff permanently?' : 'Delete staff member?'}
        message={
          confirm.hard
            ? `This will permanently delete ${confirm.name} and their attendance records. This cannot be undone.`
            : `${confirm.name} will be removed from active staff and excluded from daily attendance.`
        }
        confirmLabel="Delete"
        danger
        loading={confirm.loading}
        onConfirm={handleDelete}
        onCancel={() =>
          setConfirm({ open: false, id: null, name: '', hard: false, loading: false })
        }
      />
    </div>
  );
}
