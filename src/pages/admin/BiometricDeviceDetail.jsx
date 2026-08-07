import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { biometricDeviceService, staffService } from '../../services';

export default function BiometricDeviceDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [device, setDevice] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [staffId, setStaffId] = useState('');
  const [deviceUserId, setDeviceUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [devRes, staffRes] = await Promise.all([
        biometricDeviceService.getOne(id),
        staffService.list({ status: 'active', limit: 100 }),
      ]);
      setDevice(devRes.data.data.device);
      setEnrollments(devRes.data.data.enrollments || []);
      setStaffList(staffRes.data.data.staff || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load device');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const enroll = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await biometricDeviceService.enroll(id, { staffId, deviceUserId: deviceUserId.trim() });
      toast.success('Staff enrolled on biometric device');
      setStaffId('');
      setDeviceUserId('');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setSaving(false);
    }
  };

  const unenroll = async (staff) => {
    try {
      await biometricDeviceService.unenroll(id, staff._id || staff.id);
      toast.success('Enrollment removed');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove enrollment');
    }
  };

  if (loading) return <p className="text-sm text-muted">Loading...</p>;
  if (!device) return <p className="text-sm text-red-600">Device not found</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin/biometric-devices" className="text-sm text-brand hover:underline">
        ← Biometric Devices
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-ink">{device.name}</h1>
      <p className="mt-1 text-sm text-muted">
        {device.connectionType}
        {device.ipAddress ? ` · ${device.ipAddress}:${device.port}` : ''} · Status: {device.status}
      </p>
      <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-muted">
        Enroll maps a Device User ID (from the fingerprint machine) to a Staff account. Fingerprint
        templates stay on the device — not in this database.
      </p>

      <form
        onSubmit={enroll}
        className="mt-6 space-y-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-ink">Enroll Staff Fingerprint</h2>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Staff *</span>
          <select
            required
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand"
          >
            <option value="">Select staff</option>
            {staffList.map((s) => (
              <option key={s._id} value={s._id}>
                {s.staffCode} — {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Device User ID *</span>
          <input
            required
            value={deviceUserId}
            onChange={(e) => setDeviceUserId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand"
            placeholder="e.g. 1025 (ID shown on fingerprint device)"
          />
        </label>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Enroll Fingerprint Mapping'}
        </Button>
      </form>

      <div className="mt-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">Enrolled Users</h2>
        {enrollments.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No enrollments yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {enrollments.map((e) => (
              <li key={e._id || e.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{e.staff?.name}</p>
                  <p className="text-xs text-muted">
                    {e.staff?.staffCode} · Device User ID: {e.deviceUserId}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-red-500 hover:underline"
                  onClick={() => unenroll(e.staff)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
