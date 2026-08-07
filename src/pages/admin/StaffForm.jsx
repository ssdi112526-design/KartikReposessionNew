import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { staffService, financeService } from '../../services';
import { STAFF_STATUS_OPTIONS } from '../../utils/attendanceHelpers';
import {
  formatINR,
  formatDateIN,
  salaryStatusLabel,
  salaryStatusClass,
} from '../../utils/financeHelpers';

const EMPTY = {
  name: '',
  mobile: '',
  email: '',
  designation: '',
  department: '',
  joiningDate: '',
  profilePhoto: '',
  status: 'active',
  address: '',
  emergencyContact: '',
  staffCode: '',
  password: '',
  confirmPassword: '',
  monthlySalary: '',
  salaryType: 'monthly',
  salaryEffectiveFrom: '',
};

export default function StaffForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(isEdit);
  const [staff, setStaff] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [salaryInfo, setSalaryInfo] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: EMPTY });

  const password = watch('password');

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      try {
        const res = await staffService.getOne(id);
        const s = res.data.data.staff;
        setStaff(s);

        let monthlySalary = '';
        let salaryType = 'monthly';
        let salaryEffectiveFrom = '';
        try {
          const salRes = await financeService.staffSalaryHistory(id);
          setSalaryInfo(salRes.data.data);
          const cur = salRes.data.data.currentSalary;
          if (cur) {
            monthlySalary = String(cur.monthlySalary ?? '');
            salaryType = cur.salaryType || 'monthly';
            salaryEffectiveFrom = cur.effectiveFrom
              ? String(cur.effectiveFrom).slice(0, 10)
              : '';
          }
        } catch {
          setSalaryInfo(null);
        }

        reset({
          name: s.name || '',
          mobile: s.mobile || '',
          email: s.email || '',
          designation: s.designation || '',
          department: s.department || '',
          joiningDate: s.joiningDate ? String(s.joiningDate).slice(0, 10) : '',
          profilePhoto: s.profilePhoto || '',
          status: s.status || 'active',
          address: s.address || '',
          emergencyContact: s.emergencyContact || '',
          staffCode: s.staffCode || '',
          password: '',
          confirmPassword: '',
          monthlySalary,
          salaryType,
          salaryEffectiveFrom,
        });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load staff');
        navigate('/admin/staff');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, navigate, reset, toast]);

  const onSubmit = async (data) => {
    if (!isEdit && data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (isEdit && data.password && data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const salaryNum = Number(data.monthlySalary);
    if (!Number.isFinite(salaryNum) || salaryNum <= 0) {
      toast.error('Monthly salary is required');
      return;
    }

    const payload = {
      name: data.name,
      mobile: data.mobile,
      email: data.email || null,
      designation: data.designation,
      department: data.department,
      joiningDate: data.joiningDate || null,
      profilePhoto: data.profilePhoto,
      status: data.status,
      address: data.address,
      emergencyContact: data.emergencyContact,
      staffCode: data.staffCode || undefined,
      monthlySalary: salaryNum,
      salaryType: data.salaryType || 'monthly',
      salaryEffectiveFrom:
        data.salaryEffectiveFrom || data.joiningDate || new Date().toISOString().slice(0, 10),
    };

    if (data.password) {
      payload.password = data.password;
    }

    try {
      if (isEdit) {
        const res = await staffService.update(id, payload);
        setStaff(res.data.data.staff);
        toast.success('Staff updated successfully');
        const salRes = await financeService.staffSalaryHistory(id).catch(() => null);
        if (salRes) setSalaryInfo(salRes.data.data);
        reset({ ...data, password: '', confirmPassword: '' });
      } else {
        if (!data.password) {
          toast.error('Password is required for staff login');
          return;
        }
        const res = await staffService.create(payload);
        toast.success('Staff created with salary. They can login at /staff/login.');
        navigate(`/admin/staff/${res.data.data.staff._id}/edit`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const handleResetPassword = async () => {
    if (!resetPassword || resetPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await staffService.resetPassword(id, resetPassword);
      setResetPassword('');
      setStaff((s) => (s ? { ...s, hasPassword: true } : s));
      toast.success('Password reset successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
  };

  if (loading) {
    return <p className="text-sm text-muted">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-ink">{isEdit ? 'Edit Staff' : 'Add Staff'}</h1>
      <p className="mt-1 text-sm text-muted">
        {isEdit
          ? 'Update staff profile, salary and login credentials.'
          : 'Create staff with login credentials and monthly salary.'}
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
        noValidate
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block font-medium">Staff ID {isEdit ? '' : '(auto if blank)'}</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="STAFF-2026-0001"
              {...register('staffCode')}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Full Name *</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <span className="mt-1 block text-xs text-red-500">{errors.name.message}</span>}
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Mobile Number *</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              {...register('mobile', { required: 'Mobile is required' })}
            />
            {errors.mobile && (
              <span className="mt-1 block text-xs text-red-500">{errors.mobile.message}</span>
            )}
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Email</span>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              {...register('email')}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Designation</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              {...register('designation')}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Department</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              {...register('department')}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Joining Date</span>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              {...register('joiningDate')}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Status</span>
            <select
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              {...register('status')}
            >
              {STAFF_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block font-medium">Profile Photo URL</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="https://..."
              {...register('profilePhoto')}
            />
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block font-medium">Address</span>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              {...register('address')}
            />
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block font-medium">Emergency Contact</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              {...register('emergencyContact')}
            />
          </label>
        </div>

        <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/40 p-4">
          <h3 className="text-sm font-semibold text-ink">Salary *</h3>
          <p className="mt-1 text-xs text-muted">
            Salary is set when creating staff. Payments are recorded later from Finance → Salary
            Payments.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Monthly Salary (₹) *</span>
              <input
                type="number"
                min="1"
                step="0.01"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                placeholder="25000"
                {...register('monthlySalary', {
                  required: 'Monthly salary is required',
                  min: { value: 1, message: 'Must be greater than 0' },
                })}
              />
              {errors.monthlySalary && (
                <span className="mt-1 block text-xs text-red-500">{errors.monthlySalary.message}</span>
              )}
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Salary Type</span>
              <select
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                {...register('salaryType')}
              >
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
                <option value="hourly">Hourly</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Effective From</span>
              <input
                type="date"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                {...register('salaryEffectiveFrom')}
              />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-ink">Login Credentials</h3>
          <p className="mt-1 text-xs text-muted">
            Staff can log in with email or mobile + password at /staff/login.
            {isEdit && staff?.hasPassword
              ? ' Login is already set — leave blank to keep current password.'
              : ''}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Password {!isEdit && '*'}</span>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                {...register('password', {
                  required: !isEdit ? 'Password is required' : false,
                  minLength: { value: 6, message: 'Min 6 characters' },
                })}
              />
              {errors.password && (
                <span className="mt-1 block text-xs text-red-500">{errors.password.message}</span>
              )}
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Confirm Password {!isEdit && '*'}</span>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                {...register('confirmPassword', {
                  validate: (v) =>
                    (!password && isEdit) || v === password || 'Passwords do not match',
                })}
              />
              {errors.confirmPassword && (
                <span className="mt-1 block text-xs text-red-500">
                  {errors.confirmPassword.message}
                </span>
              )}
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Staff' : 'Create Staff'}
          </Button>
          <Button type="button" variant="outline" href="/admin/staff">
            Cancel
          </Button>
        </div>
      </form>

      {isEdit && salaryInfo && (
        <div className="mt-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">Salary Summary</h2>
              <p className="mt-1 text-sm text-muted">Payment history from Finance module.</p>
            </div>
            <Button href="/admin/finance/salaries" variant="outline">
              Manage Salary
            </Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div>
              <p className="text-muted">Current Salary</p>
              <p className="font-semibold text-ink">
                {salaryInfo.currentSalary
                  ? formatINR(salaryInfo.currentSalary.monthlySalary)
                  : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-muted">Total Paid</p>
              <p className="font-semibold text-ink">{formatINR(salaryInfo.totals?.totalPaid)}</p>
            </div>
            <div>
              <p className="text-muted">Last Payment</p>
              <p className="font-semibold text-ink">
                {salaryInfo.payments?.[0]
                  ? `${formatINR(salaryInfo.payments[0].paymentAmount)} · ${formatDateIN(salaryInfo.payments[0].paymentDate)}`
                  : '—'}
              </p>
            </div>
          </div>
          {!salaryInfo.currentSalary && (
            <p className="mt-3 text-xs text-amber-700">
              Status:{' '}
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${salaryStatusClass('pending')}`}>
                {salaryStatusLabel('pending')}
              </span>
            </p>
          )}
        </div>
      )}

      {isEdit && (
        <div className="mt-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Reset Password</h2>
          <p className="mt-1 text-sm text-muted">Set a new login password for this staff member.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="New password (min 6)"
              className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <Button type="button" onClick={handleResetPassword}>
              Reset Password
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
