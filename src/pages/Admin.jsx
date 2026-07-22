import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FaClipboardList, FaCalendarDay, FaEnvelopeOpenText } from 'react-icons/fa';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { contactService } from '../services';
import useDebouncedValue from '../hooks/useDebouncedValue';
import { triggerBlobDownload, parseBlobError } from '../utils/downloadBlob';
import StatCard from '../components/admin/StatCard';
import SearchBar from '../components/admin/SearchBar';
import FilterBar from '../components/admin/FilterBar';
import BulkActionsBar from '../components/admin/BulkActionsBar';
import DataTable from '../components/admin/DataTable';
import Pagination from '../components/admin/Pagination';
import ViewModal from '../components/admin/ViewModal';

const EMPTY_FILTERS = { dateFilter: '', startDate: '', endDate: '', status: '' };
const MIME_TYPES = {
  csv: 'text/csv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export default function Admin() {
  const { user, loading, isAdmin, logout } = useAuth();
  const toast = useToast();

  const [contacts, setContacts] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirmState, setConfirmState] = useState({ open: false, mode: null, targetId: null, loading: false });
  const [viewingContact, setViewingContact] = useState(null);
  const [exporting, setExporting] = useState(false);

  const [stats, setStats] = useState({ totalContacts: 0, totalMessages: 0, todayContacts: 0, statusBreakdown: {} });
  const [statsLoading, setStatsLoading] = useState(true);

  const filtersKey = JSON.stringify({ debouncedSearch, ...filters });
  const prevFiltersKeyRef = useRef(filtersKey);

  const buildParams = (page) => ({
    page,
    limit: pagination.limit,
    ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
    ...(filters.status && { status: filters.status }),
    ...(filters.dateFilter && { dateFilter: filters.dateFilter }),
    ...(filters.dateFilter === 'custom' && filters.startDate && { startDate: filters.startDate }),
    ...(filters.dateFilter === 'custom' && filters.endDate && { endDate: filters.endDate }),
  });

  const fetchContacts = async (page) => {
    setListLoading(true);
    setListError('');
    try {
      const res = await contactService.list(buildParams(page));
      const { contacts: list, pagination: p } = res.data.data;
      setContacts(list);
      setPagination((prev) => ({ ...prev, total: p.total, pages: p.pages, page: p.page }));
      return list;
    } catch (err) {
      setListError(err.response?.data?.message || 'Failed to load records');
      return [];
    } finally {
      setListLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await contactService.stats();
      setStats(res.data.data);
    } catch {
      /* stats are non-critical; leave previous values */
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    const filtersChanged = prevFiltersKeyRef.current !== filtersKey;
    prevFiltersKeyRef.current = filtersKey;

    if (filtersChanged && pagination.page !== 1) {
      setPagination((prev) => ({ ...prev, page: 1 }));
      return;
    }

    fetchContacts(pagination.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, pagination.page, pagination.limit, filtersKey]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">Loading...</div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    const pageIds = contacts.map((c) => c._id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await contactService.updateStatus(id, status);
      setContacts((prev) => prev.map((c) => (c._id === id ? res.data.data.contact : c)));
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleDeleteOne = (id) => {
    setConfirmState({ open: true, mode: 'single', targetId: id, loading: false });
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one record.');
      return;
    }
    setConfirmState({ open: true, mode: 'bulk', targetId: null, loading: false });
  };

  const handleConfirmDelete = async () => {
    setConfirmState((s) => ({ ...s, loading: true }));
    try {
      if (confirmState.mode === 'single') {
        await contactService.remove(confirmState.targetId);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(confirmState.targetId);
          return next;
        });
        toast.success('Record deleted successfully');
      } else {
        const ids = [...selectedIds];
        await contactService.bulkDelete(ids);
        setSelectedIds(new Set());
        toast.success(`${ids.length} record(s) deleted successfully`);
      }

      setConfirmState({ open: false, mode: null, targetId: null, loading: false });

      const remaining = await fetchContacts(pagination.page);
      if (remaining.length === 0 && pagination.page > 1) {
        setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
      }
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
      setConfirmState((s) => ({ ...s, loading: false }));
    }
  };

  const handleExport = async (format) => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one record.');
      return;
    }
    setExporting(true);
    try {
      const res = await contactService.exportRecords({ ids: [...selectedIds], format });
      const blob = new Blob([res.data], { type: MIME_TYPES[format] });
      const date = new Date().toISOString().slice(0, 10);
      triggerBlobDownload(blob, `contacts-${date}.${format}`);
      toast.success('Export downloaded successfully');
    } catch (err) {
      toast.error(await parseBlobError(err));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">{user.email}</span>
            <Link to="/" className="text-sm font-medium text-brand hover:underline">
              Website
            </Link>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-ink">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Manage inquiries submitted from the website form.</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Records" value={stats.totalContacts} icon={FaClipboardList} loading={statsLoading} />
          <StatCard label="Today's Records" value={stats.todayContacts} icon={FaCalendarDay} loading={statsLoading} />
          <StatCard
            label="New / Unresolved"
            value={stats.statusBreakdown?.new ?? 0}
            icon={FaEnvelopeOpenText}
            loading={statsLoading}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar value={search} onChange={setSearch} />
          <FilterBar filters={filters} onChange={setFilters} />
        </div>

        <div className="mt-4">
          <BulkActionsBar
            count={selectedIds.size}
            onExport={handleExport}
            onBulkDelete={handleBulkDeleteClick}
            onClear={() => setSelectedIds(new Set())}
            exporting={exporting}
          />
        </div>

        <DataTable
          contacts={contacts}
          loading={listLoading}
          error={listError}
          page={pagination.page}
          limit={pagination.limit}
          selectedIds={selectedIds}
          onToggleRow={toggleRow}
          onToggleAllOnPage={toggleAllOnPage}
          onView={setViewingContact}
          onDeleteOne={handleDeleteOne}
          onStatusChange={handleStatusChange}
        />

        {!listLoading && !listError && contacts.length > 0 && (
          <Pagination
            pagination={pagination}
            onPageChange={(page) => setPagination((prev) => ({ ...prev, page: Math.min(Math.max(1, page), prev.pages) }))}
            onLimitChange={(limit) => setPagination((prev) => ({ ...prev, limit, page: 1 }))}
          />
        )}
      </main>

      <ConfirmDialog
        open={confirmState.open}
        title="Are you sure you want to delete this record?"
        message={
          confirmState.mode === 'bulk'
            ? `This will permanently delete ${selectedIds.size} selected record(s).`
            : 'This action cannot be undone.'
        }
        confirmLabel="Delete"
        danger
        loading={confirmState.loading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmState({ open: false, mode: null, targetId: null, loading: false })}
      />

      <ViewModal contact={viewingContact} onClose={() => setViewingContact(null)} />
    </div>
  );
}
