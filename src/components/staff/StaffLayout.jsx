import { Navigate, Outlet, Link } from 'react-router-dom';
import Button from '../ui/Button';
import Logo from '../ui/Logo';
import { useStaffAuth } from '../../context/StaffAuthContext';

export default function StaffLayout() {
  const { staff, loading, logout } = useStaffAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Loading...
      </div>
    );
  }

  if (!staff) return <Navigate to="/staff/login" replace />;

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/staff/dashboard" className="flex items-center gap-2">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted sm:inline">{staff.name}</span>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-1 px-4 pb-3">
          <Link
            to="/staff/dashboard"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand-light"
          >
            Dashboard
          </Link>
          <Link
            to="/staff/attendance"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            My Attendance
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
