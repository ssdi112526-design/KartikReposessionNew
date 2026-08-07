import { NavLink, Outlet, Link, Navigate } from 'react-router-dom';
import { useState } from 'react';
import {
  FaTachometerAlt,
  FaUsers,
  FaClipboardCheck,
  FaHistory,
  FaCalendarAlt,
  FaQrcode,
  FaEnvelope,
  FaBars,
  FaTimes,
  FaUserPlus,
  FaMapMarkerAlt,
  FaFileAlt,
  FaFingerprint,
  FaChartPie,
  FaMoneyBillWave,
  FaReceipt,
  FaExchangeAlt,
  FaCog,
  FaUserTie,
} from 'react-icons/fa';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: FaTachometerAlt, end: true },
      { to: '/admin/inquiries', label: 'Inquiries', icon: FaEnvelope },
    ],
  },
  {
    title: 'Staff',
    items: [
      { to: '/admin/staff', label: 'All Staff', icon: FaUsers, end: true },
      { to: '/admin/staff/new', label: 'Add Staff', icon: FaUserPlus },
    ],
  },
  {
    title: 'Attendance',
    items: [
      { to: '/admin/attendance', label: "Today's Attendance", icon: FaClipboardCheck, end: true },
      { to: '/admin/attendance/history', label: 'Attendance History', icon: FaHistory },
      { to: '/admin/attendance/monthly', label: 'Monthly Report', icon: FaCalendarAlt },
      { to: '/admin/attendance/reports', label: 'Attendance Reports', icon: FaFileAlt },
      { to: '/admin/attendance/qr', label: 'QR Attendance', icon: FaQrcode },
      { to: '/admin/attendance/biometric', label: 'Biometric Attendance', icon: FaFingerprint },
      { to: '/admin/attendance/settings', label: 'Attendance Settings', icon: FaMapMarkerAlt },
    ],
  },
  {
    title: 'Biometric',
    items: [
      { to: '/admin/biometric-devices', label: 'Biometric Devices', icon: FaFingerprint, end: true },
    ],
  },
  {
    title: 'Finance',
    items: [
      { to: '/admin/finance', label: 'Finance Dashboard', icon: FaChartPie, end: true },
      { to: '/admin/finance/income', label: 'Income', icon: FaMoneyBillWave },
      { to: '/admin/finance/expenses', label: 'Expenses', icon: FaReceipt },
      { to: '/admin/finance/salaries', label: 'Staff Salary', icon: FaUserTie },
      { to: '/admin/finance/transactions', label: 'Transactions', icon: FaExchangeAlt },
      { to: '/admin/finance/reports', label: 'Financial Reports', icon: FaFileAlt },
      { to: '/admin/finance/settings', label: 'Finance Settings', icon: FaCog },
    ],
  },
];

function SidebarLink({ to, label, icon: Icon, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive ? 'bg-brand text-white' : 'text-slate-600 hover:bg-brand-light hover:text-brand'
        }`
      }
    >
      <Icon size={14} />
      {label}
    </NavLink>
  );
}

export default function AdminLayout() {
  const { user, loading, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">Loading...</div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const nav = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-slate-100 px-4 py-4">
        <Logo />
        <p className="mt-2 text-xs text-muted">Admin Panel</p>
      </div>
      <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarLink
                  key={item.to}
                  {...item}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="shrink-0 border-t border-slate-100 p-4">
        <p className="truncate text-xs text-muted">{user.email}</p>
        <div className="mt-3 flex gap-2">
          <Link to="/" className="text-sm font-medium text-brand hover:underline">
            Website
          </Link>
          <button
            type="button"
            onClick={logout}
            className="text-sm font-medium text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop: fixed sidebar — does not scroll with page content */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-100 bg-white lg:flex">
        {nav}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-72 flex-col bg-white shadow-xl">{nav}</aside>
        </div>
      )}

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 lg:px-6">
          <button
            type="button"
            className="rounded-lg p-2 text-ink lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
          <p className="text-sm font-medium text-ink lg:hidden">Admin</p>
          <div className="ml-auto hidden items-center gap-3 sm:flex">
            <span className="text-sm text-muted">{user.email}</span>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
