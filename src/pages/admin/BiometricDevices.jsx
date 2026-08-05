import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlug, FaSync } from 'react-icons/fa';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/admin/EmptyState';
import { useToast } from '../../context/ToastContext';
import { attendanceService, biometricDeviceService } from '../../services';

const CONNECTION_TYPES = ['SIMULATOR', 'LAN', 'USB', 'CLOUD'];
const STATUS_OPTIONS = ['active', 'inactive', 'connected', 'disconnected', 'error'];

const emptyForm = {
  name: '',
  deviceType: 'Fingerprint',
  model: '',
  ipAddress: '',
  port: 4370,
  serialNumber: '',
  connectionType: 'SIMULATOR',
  locationLabel: 'Kartik Repossession Office',
  attendanceLocationId: '',
  status: 'active',
};

function statusColor(status) {
  if (status === 'connected' || status === 'active') return 'text-emerald-700 bg-emerald-50';
  if (status === 'disconnected' || status === 'inactive') return 'text-slate-600 bg-slate-100';
  return 'text-red-700 bg-red-50';
}

export default function BiometricDevices() {
  const toast = useToast();
  const [devices, setDevices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [confirm, setConfirm] = useState({ open: false, id: null, loading: false });

  const load = async () => {
    setLoading(true);
    try {
      const [devRes, locRes] = await Promise.all([
        biometricDeviceService.list(),
        attendanceService.getLocation().catch(() => null),
      ]);
      setDevices(devRes.data.data.devices || []);
      const loc = locRes?.data?.data?.location;
      setLocations(loc ? [loc] : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      attendanceLocationId: locations[0]?._id || locations[0]?.id || '',
    });
    setShowForm(true);
  };

  const openEdit = (d) => {
    setEditingId(d._id || d.id);
    setForm({
      name: d.name || '',
      deviceType: d.deviceType || 'Fingerprint',
      model: d.model || '',
      ipAddress: d.ipAddress || '',
      port: d.port ?? 4370,
      serialNumber: d.serialNumber || '',
      connectionType: d.connectionType || 'SIMULATOR',
      locationLabel: d.locationLabel || '',
      attendanceLocationId: d.attendanceLocationId || d.attendanceLocation?._id || '',
      status: d.status || 'active',
    });
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        port: form.port === '' ? null : Number(form.port),
        attendanceLocationId: form.attendanceLocationId || null,
      };
      if (editingId) {
        await biometricDeviceService.update(editingId, payload);
        toast.success('Device updated');
      } else {
        await biometricDeviceService.create(payload);
        toast.success('Device added');
      }
      setShowForm(false);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save device');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (id) => {
    setBusyId(`test-${id}`);
    try {
      const res = await biometricDeviceService.test(id);
      toast.success(res.data.message || 'Test complete');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Connection test failed');
      await load();
    } finally {
      setBusyId('');
    }
  };

  const syncUsers = async (id) => {
    setBusyId(`sync-${id}`);
    try {
      const res = await biometricDeviceService.sync(id);
      toast.success(res.data.message || 'Synced');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sync failed');
    } finally {
      setBusyId('');
    }
  };

  const handleDelete = async () => {
    setConfirm((s) => ({ ...s, loading: true }));
    try {
      await biometricDeviceService.remove(confirm.id);
      toast.success('Device deleted');
      setConfirm({ open: false, id: null, loading: false });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
      setConfirm((s) => ({ ...s, loading: false }));
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Biometric Devices</h1>
          <p className="mt-1 text-sm text-muted">
            Register office fingerprint scanners. Raw fingerprints are never stored — only Device User
            ID ↔ Staff mapping.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/admin/attendance/biometric" variant="outline">
            Biometric Attendance
          </Button>
          <Button onClick={openCreate}>+ Add Device</Button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={save}
          className="mt-6 space-y-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-ink">
            {editingId ? 'Edit Device' : 'Add Biometric Device'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Device Name *</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand"
                placeholder="Office Fingerprint Scanner"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Device Type</span>
              <input
                value={form.deviceType}
                onChange={(e) => setForm((f) => ({ ...f, deviceType: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Model</span>
              <input
                value={form.model}
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand"
                placeholder="e.g. ZKTeco K40 / eSSL"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Connection Type</span>
              <select
                value={form.connectionType}
                onChange={(e) => setForm((f) => ({ ...f, connectionType: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              >
                {CONNECTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">IP Address</span>
              <input
                value={form.ipAddress}
                onChange={(e) => setForm((f) => ({ ...f, ipAddress: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand"
                placeholder="192.168.1.100"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Port</span>
              <input
                type="number"
                value={form.port}
                onChange={(e) => setForm((f) => ({ ...f, port: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Serial Number</span>
              <input
                value={form.serialNumber}
                onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Location Label</span>
              <input
                value={form.locationLabel}
                onChange={(e) => setForm((f) => ({ ...f, locationLabel: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Attendance Location</span>
              <select
                value={form.attendanceLocationId}
                onChange={(e) => setForm((f) => ({ ...f, attendanceLocationId: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              >
                <option value="">Use active office location</option>
                {locations.map((l) => (
                  <option key={l._id || l.id} value={l._id || l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="text-xs text-muted">
            Use <strong>SIMULATOR</strong> to test without hardware. For real LAN scanners, set IP/Port
            and later connect the vendor SDK (ZKTeco/eSSL/etc).
          </p>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Device'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="mt-8 text-center text-sm text-muted">Loading...</p>
      ) : devices.length === 0 ? (
        <EmptyState message="No biometric devices yet. Add your office fingerprint scanner." />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">Connection</th>
                <th className="px-4 py-3">Network</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Enrolled</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => {
                const id = d._id || d.id;
                return (
                  <tr key={id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{d.name}</div>
                      <div className="text-xs text-muted">
                        {d.model || d.deviceType}
                        {d.serialNumber ? ` · ${d.serialNumber}` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3">{d.connectionType}</td>
                    <td className="px-4 py-3 text-xs">
                      {d.ipAddress ? `${d.ipAddress}:${d.port || '—'}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(d.status)}`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{d.enrollmentCount ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          to={`/admin/biometric-devices/${id}`}
                          className="text-brand hover:underline"
                        >
                          Enroll
                        </Link>
                        <button
                          type="button"
                          title="Test connection"
                          className="text-slate-600 hover:text-brand"
                          disabled={busyId === `test-${id}`}
                          onClick={() => testConnection(id)}
                        >
                          <FaPlug />
                        </button>
                        <button
                          type="button"
                          title="Sync users"
                          className="text-slate-600 hover:text-brand"
                          disabled={busyId === `sync-${id}`}
                          onClick={() => syncUsers(id)}
                        >
                          <FaSync />
                        </button>
                        <button
                          type="button"
                          title="Edit"
                          className="text-brand"
                          onClick={() => openEdit(d)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          className="text-red-500"
                          onClick={() => setConfirm({ open: true, id, loading: false })}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirm.open}
        title="Delete biometric device?"
        message="Enrollments for this device will also be removed. Attendance history is kept."
        confirmLabel="Delete"
        danger
        loading={confirm.loading}
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null, loading: false })}
      />
    </div>
  );
}
