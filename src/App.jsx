import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StaffAuthProvider } from './context/StaffAuthContext';
import { ToastProvider } from './context/ToastContext';
import ScrollToHash from './components/ScrollToHash';
import AdminLayout from './components/admin/AdminLayout';
import StaffLayout from './components/staff/StaffLayout';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Terms = lazy(() => import('./pages/Terms'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminInquiries = lazy(() => import('./pages/admin/AdminInquiries'));
const StaffList = lazy(() => import('./pages/admin/StaffList'));
const StaffForm = lazy(() => import('./pages/admin/StaffForm'));
const TodayAttendance = lazy(() => import('./pages/admin/TodayAttendance'));
const AttendanceHistory = lazy(() => import('./pages/admin/AttendanceHistory'));
const MonthlyReport = lazy(() => import('./pages/admin/MonthlyReport'));
const AttendanceReports = lazy(() => import('./pages/admin/AttendanceReports'));
const QrAttendance = lazy(() => import('./pages/admin/QrAttendance'));
const AttendanceLocationSettings = lazy(() => import('./pages/admin/AttendanceLocationSettings'));
const BiometricDevices = lazy(() => import('./pages/admin/BiometricDevices'));
const BiometricDeviceDetail = lazy(() => import('./pages/admin/BiometricDeviceDetail'));
const BiometricAttendance = lazy(() => import('./pages/admin/BiometricAttendance'));
const FinanceDashboard = lazy(() => import('./pages/admin/finance/FinanceDashboard'));
const FinanceIncome = lazy(() => import('./pages/admin/finance/FinanceIncome'));
const FinanceExpenses = lazy(() => import('./pages/admin/finance/FinanceExpenses'));
const FinanceStaffSalary = lazy(() => import('./pages/admin/finance/FinanceStaffSalary'));
const FinanceTransactions = lazy(() => import('./pages/admin/finance/FinanceTransactions'));
const FinanceReports = lazy(() => import('./pages/admin/finance/FinanceReports'));
const FinanceSettings = lazy(() => import('./pages/admin/finance/FinanceSettings'));
const StaffLogin = lazy(() => import('./pages/staff/StaffLogin'));
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'));
const StaffAttendanceHistory = lazy(() => import('./pages/staff/StaffAttendanceHistory'));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted">
      Loading...
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StaffAuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <ScrollToHash />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Navigate to="/admin/login" replace />} />
                <Route path="/admin/login" element={<Login />} />
                <Route path="/terms" element={<Terms />} />

                <Route path="/staff/login" element={<StaffLogin />} />
                <Route path="/staff" element={<StaffLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<StaffDashboard />} />
                  <Route path="attendance" element={<StaffAttendanceHistory />} />
                </Route>

                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="inquiries" element={<AdminInquiries />} />
                  <Route path="staff" element={<StaffList />} />
                  <Route path="staff/new" element={<StaffForm />} />
                  <Route path="staff/:id/edit" element={<StaffForm />} />
                  <Route path="attendance" element={<TodayAttendance />} />
                  <Route path="attendance/history" element={<AttendanceHistory />} />
                  <Route path="attendance/monthly" element={<MonthlyReport />} />
                  <Route path="attendance/reports" element={<AttendanceReports />} />
                  <Route path="attendance/qr" element={<QrAttendance />} />
                  <Route path="attendance/biometric" element={<BiometricAttendance />} />
                  <Route path="attendance/settings" element={<AttendanceLocationSettings />} />
                  <Route path="biometric-devices" element={<BiometricDevices />} />
                  <Route path="biometric-devices/:id" element={<BiometricDeviceDetail />} />
                  <Route path="finance" element={<FinanceDashboard />} />
                  <Route path="finance/income" element={<FinanceIncome />} />
                  <Route path="finance/expenses" element={<FinanceExpenses />} />
                  <Route path="finance/salaries" element={<FinanceStaffSalary />} />
                  <Route
                    path="finance/salary-payments"
                    element={<Navigate to="/admin/finance/salaries" replace />}
                  />
                  <Route path="finance/transactions" element={<FinanceTransactions />} />
                  <Route path="finance/reports" element={<FinanceReports />} />
                  <Route path="finance/settings" element={<FinanceSettings />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </StaffAuthProvider>
    </AuthProvider>
  );
}
