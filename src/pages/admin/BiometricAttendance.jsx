import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFingerprint } from 'react-icons/fa';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { biometricDeviceService } from '../../services';
import { formatTime, methodLabel, statusLabel } from '../../utils/attendanceHelpers';

export default function BiometricAttendance() {
  const toast = useToast();
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState('');
  const [deviceUserId, setDeviceUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await biometricDeviceService.list();
        const list = res.data.data.devices || [];
        setDevices(list);
        const preferred =
          list.find((d) => d.status === 'connected' || d.status === 'active') || list[0];
        if (preferred) setDeviceId(preferred._id || preferred.id);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load devices');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = devices.find((d) => (d._id || d.id) === deviceId);

  const scan = async () => {
    setError('');
    setLastResult(null);
    setScanning(true);
    try {
      const res = await biometricDeviceService.scan({
        deviceId,
        ...(deviceUserId.trim() ? { deviceUserId: deviceUserId.trim() } : {}),
      });
      setLastResult(res.data.data);
      toast.success(res.data.message);
      setDeviceUserId('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Fingerprint scan failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Biometric Attendance</h1>
          <p className="mt-1 text-sm text-muted">
            Scan staff fingerprint on the office device. Staff is identified automatically — no manual
            staff select.
          </p>
        </div>
        <Button href="/admin/biometric-devices" variant="outline">
          Manage Devices
        </Button>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-muted">Loading...</p>
      ) : devices.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm text-muted">No biometric device configured.</p>
          <Link to="/admin/biometric-devices" className="mt-2 inline-block text-sm text-brand hover:underline">
            Add Biometric Device
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Device</span>
            <select
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand"
            >
              {devices.map((d) => (
                <option key={d._id || d.id} value={d._id || d.id}>
                  {d.name} ({d.status})
                </option>
              ))}
            </select>
          </label>

          {selected && (
            <p className="text-sm">
              Status:{' '}
              <span
                className={
                  selected.status === 'connected' || selected.status === 'active'
                    ? 'font-semibold text-emerald-700'
                    : 'font-semibold text-amber-700'
                }
              >
                ● {selected.status}
              </span>
              {selected.connectionType === 'SIMULATOR' && (
                <span className="ml-2 text-xs text-muted">(Simulator mode)</span>
              )}
            </p>
          )}

          {selected?.connectionType === 'SIMULATOR' && (
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Device User ID (simulator)</span>
              <input
                value={deviceUserId}
                onChange={(e) => setDeviceUserId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand"
                placeholder="Enter enrolled Device User ID, or leave blank for latest enrollment"
              />
            </label>
          )}

          <Button onClick={scan} disabled={scanning || !deviceId} className="w-full sm:w-auto">
            <span className="inline-flex items-center gap-2">
              <FaFingerprint />
              {scanning ? 'Scanning...' : 'Scan Fingerprint'}
            </span>
          </Button>

          <p className="text-xs text-muted">
            Location is taken from the device&apos;s registered office Attendance Location (not browser
            GPS).
          </p>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {lastResult && (
        <div className="mt-4 space-y-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 text-sm">
          <p className="font-semibold text-emerald-800">
            {lastResult.action === 'check_out' ? 'Check-out recorded' : 'Attendance marked'}
          </p>
          <p>
            Staff: <strong>{lastResult.staff?.name}</strong> ({lastResult.staff?.staffCode})
          </p>
          <p>
            Status: <strong>{statusLabel(lastResult.attendance?.status)}</strong>
          </p>
          <p>
            Method: <strong>{methodLabel(lastResult.method)}</strong>
          </p>
          <p>Device User ID: {lastResult.biometricUserId}</p>
          <p>Check In: {formatTime(lastResult.attendance?.checkIn)}</p>
          <p>Check Out: {formatTime(lastResult.attendance?.checkOut)}</p>
          <p>Location: Verified (Device / Office)</p>
        </div>
      )}
    </div>
  );
}
