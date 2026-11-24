'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { cn } from '@/lib/format';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email) {
      error('Email wajib diisi');
      return;
    }
    setSubmitting(true);
    api
      .post<{ sent: boolean; resetUrl?: string }>('/auth/forgot-password', { email })
      .then(response => {
        if (response.data.resetUrl) {
          setResetUrl(response.data.resetUrl);
        }
        setSent(true);
        success('Jika email terdaftar, tautan reset telah dikirim');
      })
      .catch(err => error(err instanceof Error ? err.message : 'Gagal mengirim tautan reset'))
      .finally(() => setSubmitting(false));
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-navy transition hover:text-cherry">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke masuk
          </Link>
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-semibold text-navy">Periksa email Anda</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Jika <strong>{email}</strong> terdaftar di sistem kami, tautan untuk mengatur ulang
              kata sandi telah dikirim. Tautan berlaku selama 1 jam.
            </p>
            {resetUrl && (
              <div className="mt-5 rounded-lg border border-cherry/20 bg-cherry/5 p-3 text-xs text-cherry font-mono break-all">
                <strong>Mode development:</strong> {resetUrl}
              </div>
            )}
            <Link href="/login" className="btn-primary mt-6 w-full">
              Kembali ke halaman masuk
            </Link>
          </div>
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

        <h1 className="font-display text-[32px] font-semibold tracking-tight text-navy text-center">Lupa kata sandi?</h1>
        <p className="mt-2 text-sm text-muted text-center">Masukkan email Anda, kami akan kirim tautan untuk mengatur ulang kata sandi.</p>

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

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary btn-lg w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              'Kirim Tautan Reset'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Ingat kata sandi?{' '}
          <Link href="/login" className="font-semibold text-cherry underline-offset-2 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}