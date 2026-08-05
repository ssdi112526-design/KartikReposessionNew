import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Button from '../../components/ui/Button';
import { useStaffAuth } from '../../context/StaffAuthContext';
import { useToast } from '../../context/ToastContext';
import { staffAuthService } from '../../services';
import { formatTime, methodLabel, statusLabel, todayLabel } from '../../utils/attendanceHelpers';

const SCANNER_ID = 'staff-office-qr-reader';

function isSecureMediaContext() {
  return typeof window !== 'undefined' && window.isSecureContext;
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error(
          'Unable to determine your current location. Please enable GPS/location services and try again.'
        )
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(
            new Error(
              'Location permission is required to mark attendance. Please enable location access and try again.'
            )
          );
        } else {
          reject(
            new Error(
              'Unable to determine your current location. Please enable GPS/location services and try again.'
            )
          );
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  });
}

function cameraErrorMessage(err) {
  const msg = String(err?.message || err || '').toLowerCase();
  if (!isSecureMediaContext()) {
    return 'Camera needs a secure (HTTPS) link. Open this app with https:// and your PC IP, then allow the certificate warning.';
  }
  if (msg.includes('permission') || msg.includes('notallowed') || msg.includes('denied')) {
    return 'Camera permission is required to scan the QR code. Allow camera access in browser settings and try again.';
  }
  return 'Unable to access camera. Allow camera permission, or paste the QR code text below.';
}

export default function StaffDashboard() {
  const { staff } = useStaffAuth();
  const toast = useToast();
  const scannerRef = useRef(null);
  const busyRef = useRef(false);

  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [phase, setPhase] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [manualCode, setManualCode] = useState('');
  const secureContext = isSecureMediaContext();

  const loadToday = useCallback(async () => {
    setLoading(true);
    try {
      const res = await staffAuthService.today();
      setToday(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (scanner.isScanning) await scanner.stop();
      await scanner.clear();
    } catch {
      /* ignore */
    }
    scannerRef.current = null;
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processQrPayload = async (qrPayload) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setError('');
    setSuccess('');
    setPhase('locating');

    try {
      await stopScanner();
      const pos = await getCurrentPosition();
      setPhase('verifying');

      const res = await staffAuthService.scan({
        qrPayload,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });

      setPhase('done');
      setSuccess(res.data.message || 'Attendance marked successfully.');
      toast.success(res.data.message);
      setManualCode('');
      await loadToday();
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Unable to mark attendance. Please try again.';
      setError(msg);
      toast.error(msg);
      setPhase('');
    } finally {
      setTimeout(() => {
        busyRef.current = false;
      }, 1500);
    }
  };

  const startScanner = async () => {
    setError('');
    setSuccess('');

    if (!secureContext) {
      setError(
        'Camera and GPS need HTTPS. Open https://' +
          (window.location.host || 'PC-IP') +
          '/staff — accept the certificate, then allow Camera and Location.'
      );
      setPhase('');
      return;
    }

    setPhase('scanning');
    try {
      await stopScanner();
      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 8, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          processQrPayload(decoded);
        },
        () => {}
      );
      setScanning(true);
    } catch (err) {
      setError(cameraErrorMessage(err));
      setScanning(false);
      setPhase('');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    await processQrPayload(code);
  };

  const attendance = today?.attendance;
  const checkedIn = Boolean(attendance?.checkIn);
  const checkedOut = Boolean(attendance?.checkOut);
  const canScan = !checkedOut;

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Welcome, {staff?.name}</h1>
      <p className="mt-1 text-sm text-muted">
        {staff?.staffCode}
        {staff?.designation ? ` · ${staff.designation}` : ''}
      </p>

      {!secureContext && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          This page is opened over HTTP, so camera and GPS are blocked on mobile. Use{' '}
          <strong>https://{window.location.host}/staff</strong>.
        </p>
      )}

      <div className="mt-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">Today&apos;s Attendance</h2>
        <p className="mt-1 text-sm text-muted">Date: {todayLabel()}</p>

        {loading ? (
          <p className="mt-4 text-sm text-muted">Loading...</p>
        ) : checkedIn && checkedOut ? (
          <div className="mt-4 space-y-2 text-sm">
            <p className="rounded-lg bg-emerald-50 px-3 py-2 font-medium text-emerald-800">
              ✓ Attendance Marked
            </p>
            <p>
              Status: <strong>{statusLabel(attendance.status)}</strong>
            </p>
            <p>
              Method: <strong>{methodLabel(attendance.attendanceMethod)}</strong>
            </p>
            <p>Check In: {formatTime(attendance.checkIn)}</p>
            <p>Check Out: {formatTime(attendance.checkOut)}</p>
            <p>
              Location:{' '}
              {attendance.locationVerified ? (
                <span className="font-medium text-emerald-700">Verified</span>
              ) : (
                '—'
              )}
            </p>
          </div>
        ) : checkedIn ? (
          <div className="mt-4 space-y-2 text-sm">
            <p>
              Status:{' '}
              <span className="font-semibold text-emerald-700">{statusLabel(attendance.status)}</span>
            </p>
            <p>
              Method: <strong>{methodLabel(attendance.attendanceMethod)}</strong>
            </p>
            <p>Check In: {formatTime(attendance.checkIn)}</p>
            <p className="mt-3 text-muted">Scan QR again to check out.</p>
            <Button onClick={startScanner} disabled={scanning}>
              Scan QR for Check Out
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-sm">
              Status: <span className="font-semibold text-amber-700">Not Marked</span>
            </p>
            {!today?.locationConfigured && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Attendance location has not been configured by Admin. Please contact Admin.
              </p>
            )}
            <Button onClick={startScanner} disabled={scanning || !today?.locationConfigured}>
              Scan QR Attendance
            </Button>
          </div>
        )}

        {canScan && today?.locationConfigured && (
          <form onSubmit={handleManualSubmit} className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-sm font-medium text-ink">Or enter QR code manually</p>
            <textarea
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Paste attendance QR payload"
              disabled={phase === 'locating' || phase === 'verifying'}
            />
            <Button
              type="submit"
              variant="outline"
              className="mt-2"
              disabled={!manualCode.trim() || phase === 'locating' || phase === 'verifying'}
            >
              Submit QR Code
            </Button>
          </form>
        )}
      </div>

      {(scanning || phase) && (
        <div className="mt-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-ink">
            {phase === 'locating' && 'Getting Location...'}
            {phase === 'verifying' && 'Checking Attendance Location...'}
            {phase === 'done' && 'Location Verified'}
            {(phase === 'scanning' || scanning) &&
              phase !== 'locating' &&
              phase !== 'verifying' &&
              'Camera Scanner'}
          </h2>
          <div id={SCANNER_ID} className="mt-3 overflow-hidden rounded-lg bg-slate-100" />
          {scanning && (
            <Button variant="outline" className="mt-3" onClick={stopScanner}>
              Cancel
            </Button>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {success && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{success}</p>
      )}
    </div>
  );
}
