import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { attendanceService } from '../../services';
import { formatTime, statusLabel } from '../../utils/attendanceHelpers';

const SCANNER_ID = 'staff-qr-reader';

export default function QrAttendance() {
  const toast = useToast();
  const scannerRef = useRef(null);
  const busyRef = useRef(false);
  const [tab, setTab] = useState('office'); // office | scan-staff
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState('');
  const [officeQr, setOfficeQr] = useState(null);
  const [ttl, setTtl] = useState(0);

  const loadOfficeQr = useCallback(
    async (refresh = false) => {
      try {
        const res = await attendanceService.officeQr(refresh ? { refresh: true } : {});
        setOfficeQr(res.data.data);
        setTtl(res.data.data.ttlSeconds ?? 0);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load office QR');
      }
    },
    [toast]
  );

  useEffect(() => {
    if (tab !== 'office') return;
    loadOfficeQr(false);
  }, [tab, loadOfficeQr]);

  useEffect(() => {
    if (tab !== 'office' || !officeQr) return undefined;
    const timer = setInterval(() => {
      setTtl((prev) => {
        if (prev <= 1) {
          loadOfficeQr(true);
          return officeQr.ttl || 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [tab, officeQr, loadOfficeQr]);

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

  const processPayload = async (payload) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setError('');
    try {
      const res = await attendanceService.markQr(payload);
      setLastResult(res.data);
      toast.success(res.data.message);
    } catch (err) {
      const msg = err.response?.data?.message || 'QR scan failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setTimeout(() => {
        busyRef.current = false;
      }, 1500);
    }
  };

  const startScanner = async () => {
    setError('');
    try {
      await stopScanner();
      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 8, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          processPayload(decoded);
        },
        () => {}
      );
      setScanning(true);
    } catch (err) {
      setError(err?.message || 'Unable to access camera. You can enter the code manually.');
      setScanning(false);
    }
  };

  const handleManual = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    await processPayload(manualCode.trim());
    setManualCode('');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">QR Attendance</h1>
      <p className="mt-1 text-sm text-muted">
        Display the office QR for staff to scan, or scan a staff QR for admin check-in.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant={tab === 'office' ? 'primary' : 'outline'}
          onClick={() => {
            stopScanner();
            setTab('office');
          }}
        >
          Office QR (Staff Scan)
        </Button>
        <Button
          variant={tab === 'scan-staff' ? 'primary' : 'outline'}
          onClick={() => setTab('scan-staff')}
        >
          Scan Staff QR
        </Button>
      </div>

      {tab === 'office' && (
        <div className="mt-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Live Attendance QR</h2>
          <p className="mt-1 text-sm text-muted">
            Staff scan this QR from their dashboard. QR rotates automatically and invalidates after
            use.
          </p>
          <div className="mt-6 flex flex-col items-center gap-4">
            {officeQr?.qrPayload ? (
              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <QRCodeSVG value={officeQr.qrPayload} size={240} />
              </div>
            ) : (
              <p className="text-sm text-muted">Loading QR...</p>
            )}
            <p className="text-sm font-medium text-ink">
              Expires in: <span className="text-brand">{ttl}s</span>
            </p>
            <Button variant="outline" onClick={() => loadOfficeQr(true)}>
              Refresh QR Now
            </Button>
          </div>
        </div>
      )}

      {tab === 'scan-staff' && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <div id={SCANNER_ID} className="overflow-hidden rounded-lg bg-slate-100" />
            <div className="mt-4 flex flex-wrap gap-2">
              {!scanning ? (
                <Button onClick={startScanner}>Start Camera Scan</Button>
              ) : (
                <Button variant="outline" onClick={stopScanner}>
                  Stop Scanner
                </Button>
              )}
            </div>
            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          </div>

          <div className="space-y-5">
            <form
              onSubmit={handleManual}
              className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <h2 className="font-semibold text-ink">Manual / Staff ID Entry</h2>
              <p className="mt-1 text-sm text-muted">Paste QR payload or enter Staff ID code.</p>
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="KRA-STAFF:... or STAFF-2026-0001"
                className="mt-3 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <Button type="submit" className="mt-3">
                Mark Attendance
              </Button>
            </form>

            {lastResult && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
                <p className="font-semibold text-emerald-800">{lastResult.message}</p>
                {lastResult.data?.attendance && (
                  <div className="mt-3 space-y-1 text-sm text-emerald-900">
                    <p>
                      <span className="font-medium">Staff:</span>{' '}
                      {lastResult.data.attendance.staff?.name} (
                      {lastResult.data.attendance.staff?.staffCode})
                    </p>
                    <p>
                      <span className="font-medium">Action:</span>{' '}
                      {lastResult.data.action === 'check_out' ? 'Check Out' : 'Check In'}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{' '}
                      {statusLabel(lastResult.data.attendance.status)}
                    </p>
                    <p>
                      <span className="font-medium">Check In:</span>{' '}
                      {formatTime(lastResult.data.attendance.checkIn)}
                    </p>
                    <p>
                      <span className="font-medium">Check Out:</span>{' '}
                      {formatTime(lastResult.data.attendance.checkOut)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
