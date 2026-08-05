import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Logo from '../../components/ui/Logo';
import Button from '../../components/ui/Button';
import { useStaffAuth } from '../../context/StaffAuthContext';

export default function StaffLogin() {
  const { login, staff, loading } = useStaffAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setError('');
    try {
      await login({ identifier: data.identifier.trim(), password: data.password });
      navigate('/staff/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Cannot reach server. Make sure the API is running on port 5000.'
          : 'Invalid email/mobile number or password.');
      setError(message);
    }
  };

  if (!loading && staff) {
    return <Navigate to="/staff/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-brand-light px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-center text-2xl font-bold text-ink">Staff Login</h1>
        <p className="mt-1 text-center text-sm text-muted">
          Sign in to mark attendance with QR and GPS
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Email / Mobile Number</span>
            <input
              type="text"
              autoComplete="username"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              {...register('identifier', { required: 'Email or mobile number is required' })}
            />
            {errors.identifier && (
              <span className="mt-1 block text-xs text-red-500">{errors.identifier.message}</span>
            )}
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && (
              <span className="mt-1 block text-xs text-red-500">{errors.password.message}</span>
            )}
          </label>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Login'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          Forgot Password? Contact Admin.
        </p>
        <p className="mt-2 text-center text-sm text-muted">
          <Link to="/" className="text-brand hover:underline">
            Back to website
          </Link>
          {' · '}
          <Link to="/admin/login" className="text-brand hover:underline">
            Admin Login
          </Link>
        </p>
      </div>
    </div>
  );
}
