import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaPlaneDeparture,
  FaPercentage,
  FaClipboardList,
} from 'react-icons/fa';
import StatCard from '../../components/admin/StatCard';
import Button from '../../components/ui/Button';
import { attendanceService, contactService } from '../../services';
import { todayLabel } from '../../utils/attendanceHelpers';

export default function AdminDashboard() {
  const [attStats, setAttStats] = useState(null);
  const [contactStats, setContactStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [attRes, contactRes] = await Promise.all([
          attendanceService.stats(),
          contactService.stats(),
        ]);
        if (!cancelled) {
          setAttStats(attRes.data.data);
          setContactStats(contactRes.data.data);
        }
      } catch {
        /* non-blocking */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Staff attendance overview · {todayLabel()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/admin/attendance" variant="primary">
            Today&apos;s Attendance
          </Button>
          <Button href="/admin/attendance/qr" variant="outline">
            QR Scan
          </Button>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted">
        Staff Attendance
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Staff" value={attStats?.totalStaff ?? 0} icon={FaUsers} loading={loading} />
        <StatCard
          label="Present Today"
          value={attStats?.presentToday ?? 0}
          icon={FaUserCheck}
          loading={loading}
        />
        <StatCard
          label="Absent Today"
          value={attStats?.absentToday ?? 0}
          icon={FaUserTimes}
          loading={loading}
        />
        <StatCard label="On Leave" value={attStats?.onLeave ?? 0} icon={FaPlaneDeparture} loading={loading} />
        <StatCard label="Late Today" value={attStats?.lateToday ?? 0} icon={FaUserClock} loading={loading} />
        <StatCard
          label="Attendance %"
          value={`${attStats?.attendancePercentage ?? 0}%`}
          icon={FaPercentage}
          loading={loading}
        />
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-muted">
        Website Inquiries
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Inquiries"
          value={contactStats?.totalContacts ?? 0}
          icon={FaClipboardList}
          loading={loading}
        />
        <StatCard
          label="Today"
          value={contactStats?.todayContacts ?? 0}
          icon={FaClipboardList}
          loading={loading}
        />
        <StatCard
          label="New / Unresolved"
          value={contactStats?.statusBreakdown?.new ?? 0}
          icon={FaClipboardList}
          loading={loading}
        />
      </div>

      <div className="mt-6">
        <Link to="/admin/inquiries" className="text-sm font-medium text-brand hover:underline">
          Manage inquiries →
        </Link>
      </div>
    </div>
  );
}
