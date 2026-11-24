'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { cn } from '@/lib/format';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const { error, success } = useToast();

  const redirect = searchParams.get('redirect') || '/account';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const passwordStrength = useMemo(() => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return Math.min(4, strength);
  }, [password]);

  const strengthLabels = ['Sangat lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat kuat'];
  const strengthColors = ['bg-danger', 'bg-warning', 'bg-info', 'bg-success', 'bg-success'];

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      error('Semua field wajib diisi');
      return;
    }
    if (password !== confirmPassword) {
      error('Konfirmasi kata sandi tidak cocok');
      return;
    }
    if (password.length < 8) {
      error('Kata sandi minimal 8 karakter');
      return;
    }

    setSubmitting(true);
    register(name, email, password)
      .then(() => {
        success('Akun berhasil dibuat. Selamat bergabung!');
        router.push(redirect);
        router.refresh();
      })
      .catch(err => error(err instanceof Error ? err.message : 'Gagal mendaftar'))
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
          </div>
        </div>

        <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12 lg:px-12 lg:py-20">
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-cherry font-display text-lg font-bold text-cream">R</span>
            <span className="font-display text-xl font-bold text-navy">Rak Kata</span>
          </Link>

          <div className="w-full max-w-md">
            <h1 className="font-display text-[32px] font-semibold tracking-tight text-navy">Buat akun baru</h1>
            <p className="mt-2 text-sm text-muted">Bergabunglah dengan komunitas pembaca Rak Kata.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
              <div>
                <label htmlFor="name" className="label">Nama lengkap</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="input pl-10"
                    placeholder="Nama Anda"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

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
                <label htmlFor="password" className="label">Kata sandi</label>
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
                    autoComplete="new-password"
                    minLength={8}
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
                {password && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full rounded-full bg-line overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-300',
                          strengthColors[passwordStrength]
                        )}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted">{strengthLabels[passwordStrength]}</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">Konfirmasi kata sandi</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="input pl-10"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-xs text-danger">Kata sandi tidak cocok</p>
                  )}
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
                    Mendaftar...
                  </>
                ) : (
                  'Daftar'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Sudah punya akun?{' '}
              <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="font-semibold text-cherry underline-offset-2 hover:underline">
                Masuk
              </Link>
            </p>

            <p className="mt-4 text-center text-[11px] text-muted/60">
              Dengan mendaftar, Anda menyetujui <Link href="/faq" className="underline-offset-2 hover:text-cherry">Syarat & Ketentuan</Link> dan <Link href="/faq" className="underline-offset-2 hover:text-cherry">Kebijakan Privasi</Link> kami.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <RegisterContent />
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