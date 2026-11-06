import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layers, TriangleAlert } from 'lucide-react';
import Seo from '../../components/Seo.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import InitialLoading from '../../components/layout/InitialLoading.jsx';
import { useAuth } from '../../features/auth/useAuth.js';
import { loginSchema } from '../../features/auth/loginSchema.js';
import { useSettings } from '../../features/settings/useSettings.js';
import { getApiError } from '../../lib/apiErrors.js';

// Where to go after signing in: the page the visitor was trying to open (RequireAuth remembers it),
// but ONLY if it is inside /admin. Anything else would be an "open redirect": a login link that, once
// you sign in, bounces you to some other website.
function destinationAfterLogin(location) {
  const from = location.state?.from;
  const path = typeof from?.pathname === 'string' ? from.pathname : '';
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) return `${path}${from.search ?? ''}`;
  return '/admin';
}

export default function Login() {
  const { status, login } = useAuth();
  const location = useLocation();
  const { companyName } = useSettings();
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  // Already signed in (or just became signed in): there is nothing to do on this page
  if (status === 'authenticated') return <Navigate to={destinationAfterLogin(location)} replace />;
  if (status === 'loading') return <InitialLoading />;

  const onSubmit = async ({ email, password }) => {
    setFormError('');
    try {
      await login(email, password); // on success the status changes and the <Navigate> above takes over
    } catch (error) {
      setFormError(getApiError(error).message); // "Invalid email or password", the rate limit message, or a network message
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <main className="w-full max-w-md">
        <Seo title="Sign in" noindex />
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-brand-600 to-accent-500 text-white">
            <Layers className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold tracking-tight text-ink">{companyName}</span>
        </div>

        <Card>
          <h1 className="text-h3">Sign in</h1>
          <p className="mt-1 text-slate-600">Admin dashboard</p>

          <form onSubmit={(event) => handleSubmit(onSubmit)(event)} noValidate className="mt-6 space-y-5">
            <Input
              label="Email"
              type="email"
              required
              autoComplete="username"
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="space-y-2">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(event) => setShowPassword(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600"
                />
                Show password
              </label>
            </div>

            {formError && (
              <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <p>{formError}</p>
              </div>
            )}

            <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link to="/" className="font-semibold text-brand-700 hover:underline">
            Back to the website
          </Link>
        </p>
      </main>
    </div>
  );
}
