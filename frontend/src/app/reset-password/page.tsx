'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { cn } from '@/lib/format';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useToast();

  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successState, setSuccessState] = useState(false);

  useEffect(() => {
    if (!token) {
      error('Tautan reset tidak valid');
      router.push('/forgot-password');
    }
  }, [token, router]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    if (password !== confirmPassword) {
      error('Konfirmasi kata sandi tidak cocok');
      return;
    }
    if (password.length < 8) {
      error('Kata sandi minimal 8 karakter');
      return;
    }

    setSubmitting(true);
    api
      .post('/auth/reset-password', { token, password })
      .then(() => {
        setSuccessState(true);
        success('Kata sandi berhasil diatur ulang');
      })
      .catch(err => error(err instanceof Error ? err.message : 'Gagal mengatur ulang kata sandi'))
      .finally(() => setSubmitting(false));
  }

  if (successState) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-navy transition hover:text-cherry">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke masuk
          </Link>
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold text-navy">Kata sandi berhasil diubah</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Kata sandi Anda telah diperbarui. Silakan masuk dengan kata sandi baru.
          </p>
          <Link href="/login" className="btn-primary mt-6 w-full">
            Masuk Sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-navy transition hover:text-cherry">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke masuk
        </Link>
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 justify-center">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-cherry font-display text-lg font-bold text-cream">R</span>
            <span className="font-display text-xl font-bold text-navy">Rak Kata</span>
          </Link>
        </div>

        <h1 className="font-display text-[32px] font-semibold tracking-tight text-navy text-center">Atur ulang kata sandi</h1>
        <p className="mt-2 text-sm text-muted text-center">Masukkan kata sandi baru Anda. Pastikan mudah diingat tapi sulit ditebak.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <div>
            <label htmlFor="password" className="label">Kata sandi baru</label>
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
          </div>

          <div>
            <label htmlFor="confirmPassword" className="label">Konfirmasi kata sandi baru</label>
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
                Menyimpan...
              </>
            ) : (
              'Simpan Kata Sandi Baru'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Kembali ke{' '}
          <Link href="/login" className="font-semibold text-cherry underline-offset-2 hover:underline">
            halaman masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <ResetPasswordContent />
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