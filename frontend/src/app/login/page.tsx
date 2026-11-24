'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { cn } from '@/lib/format';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { error, success } = useToast();

  const redirect = searchParams.get('redirect') || '/account';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email || !password) {
      error('Email dan kata sandi wajib diisi');
      return;
    }
    setSubmitting(true);
    login(email, password)
      .then(() => {
        success('Selamat datang kembali!');
        router.push(redirect);
        router.refresh();
      })
      .catch(err => error(err instanceof Error ? err.message : 'Gagal masuk'))
      .finally(() => setSubmitting(false));
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="relative flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:px-12 lg:py-20 bg-navy text-cream" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 160 160\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.035\'/%3E%3C/svg%3E")' }}>
          <div className="max-w-sm text-center">
            <Link href="/" className="flex items-center gap-2.5 mb-8 justify-center">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-cherry font-display text-xl font-bold text-cream">R</span>
              <span className="font-display text-2xl font-bold">Rak Kata</span>
            </Link>
            <p className="font-display text-[32px] font-semibold leading-tight mb-6">
              &ldquo;Buku adalah jendela dunia yang membawa Anda berkelana tanpa batas.&rdquo;
            </p>
            <p className="font-hand text-xl text-cream/60">— Dicatat di rak kami</p>
            <div className="mt-12 flex items-center justify-center gap-4 text-sm text-cream/40">
              <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> halo@rakkata.id</span>
              <span className="flex items-center gap-1.5">0812-3456-7890</span>
            </div>
          </div>
        </div>

        <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12 lg:px-12 lg:py-20">
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-cherry font-display text-lg font-bold text-cream">R</span>
            <span className="font-display text-xl font-bold text-navy">Rak Kata</span>
          </Link>

          <div className="w-full max-w-md">
            <h1 className="font-display text-[32px] font-semibold tracking-tight text-navy">Masuk ke akun</h1>
            <p className="mt-2 text-sm text-muted">Selamat datang kembali, temukan buku favorit Anda.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="label">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="anda@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="label">Kata sandi</label>
                  <Link href="/forgot-password" className="text-sm font-semibold text-cherry underline-offset-2 hover:underline">
                    Lupa password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input pl-10 pr-10"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary btn-lg w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Masuk...
                  </>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Belum punya akun?{' '}
              <Link href={`/register?redirect=${encodeURIComponent(redirect)}`} className="font-semibold text-cherry underline-offset-2 hover:underline">
                Daftar
              </Link>
            </p>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted">Atau lanjutkan dengan</p>
              <div className="mt-3 flex justify-center gap-3">
                <button type="button" className="btn-ghost btn-sm h-10 w-10" disabled>
                  <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}

function AuthSkeleton() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="skeleton w-full max-w-md h-96 rounded-xl" />
    </div>
  );
}