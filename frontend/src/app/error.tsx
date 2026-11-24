'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, RefreshCw, AlertTriangle, BookOpen, Bug } from 'lucide-react';
import { gsap } from 'gsap';
import { cn } from '@/lib/format';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const errorMessages = [
  { code: 'ERR_BOOK_NOT_FOUND', title: 'Buku tidak ditemukan', description: 'Sepertinya buku ini sudah dipindahkan ke rak lain.' },
  { code: 'ERR_CART_EMPTY', title: 'Keranjang kosong', description: 'Belum ada buku di keranjang. Yuk isi dulu!' },
  { code: 'ERR_CHECKOUT_FAILED', title: 'Checkout gagal', description: 'Terjadi kesalahan saat memproses pesanan.' },
  { code: 'ERR_AUTH_EXPIRED', title: 'Sesi berakhir', description: 'Silakan masuk kembali untuk melanjutkan.' },
  { code: 'ERR_NETWORK', title: 'Koneksi bermasalah', description: 'Periksa koneksi internet dan coba lagi.' },
  { code: 'ERR_UNKNOWN', title: 'Terjadi kesalahan', description: 'Maaf, ada yang tidak beres di server kami.' },
];

function getErrorInfo(digest?: string) {
  if (!digest) return errorMessages[5];
  const idx = digest.charCodeAt(0) % errorMessages.length;
  return errorMessages[idx];
}

export default function Error({ error, reset }: ErrorProps) {
  const pathname = usePathname();
  const errorInfo = getErrorInfo(error.digest);
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.error-card', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'expo.out',
      });

      gsap.from('.error-icon', {
        scale: 0,
        rotation: -180,
        duration: 0.6,
        ease: 'back.out(2)',
        delay: 0.2,
      });

      gsap.from('.error-title', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'expo.out',
        delay: 0.4,
      });

      gsap.from('.error-desc', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'expo.out',
        delay: 0.5,
      });

      gsap.from('.error-actions > *', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
        ease: 'expo.out',
        delay: 0.6,
      });

      if (isDev) {
        gsap.from('.error-dev', {
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: 'expo.out',
          delay: 0.8,
        });
      }
    }, '.error-page');

    return () => ctx.revert();
  }, [pathname]);

  return (
    <main className="error-page min-h-screen flex items-center justify-center px-4 py-20" style={{ backgroundColor: 'var(--paper)' }}>
      <div className="error-card w-full max-w-md" style={{ backgroundColor: 'var(--paper)' }}>
        <div className="relative text-center">
          <div
            className="error-icon inline-flex items-center justify-center mb-6"
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--cherry)/10, var(--navy)/10)',
              border: '2px solid var(--cherry)/20',
            }}
          >
            <AlertTriangle className="h-12 w-12" style={{ color: 'var(--cherry)' }} />
          </div>

          <h1 className="error-title font-display text-2xl font-semibold mb-2" style={{ color: 'var(--navy)' }}>
            {errorInfo.title}
          </h1>

          <p className="error-desc text-base leading-relaxed mb-8" style={{ color: 'var(--ink)' }}>
            {errorInfo.description}
          </p>

          <div className="error-actions flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <button
              onClick={reset}
              className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3"
            >
              <RefreshCw className="h-5 w-5" />
              Coba Lagi
            </button>
            <Link
              href="/"
              className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3"
            >
              <Home className="h-5 w-5" />
              Ke Beranda
            </Link>
          </div>

          <div className="relative pt-6" style={{ borderTop: '1px solid var(--line)' }}>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              Ingin mencari buku lain?
            </p>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 text-sm font-semibold transition"
              style={{ color: 'var(--cherry)' }}
            >
              <BookOpen className="h-4 w-4" />
              Jelajahi Katalog
            </Link>
          </div>

          {isDev && (
            <details className="error-dev mt-6 text-left">
              <summary className="cursor-pointer flex items-center gap-2 font-medium text-sm" style={{ color: 'var(--navy)' }}>
                <Bug className="h-4 w-4" />
                Detail Error (Development)
              </summary>
              <div className="mt-3 p-4 rounded-xl overflow-x-auto" style={{ backgroundColor: 'var(--paper-deep)', border: '1px solid var(--line)' }}>
                <pre className="text-[11px] font-mono whitespace-pre-wrap break-words" style={{ color: 'var(--ink)' }}>
                  {error.message}
                  {error.digest && `\n\nDigest: ${error.digest}`}
                  {error.stack && `\n\nStack:\n${error.stack}`}
                </pre>
              </div>
            </details>
          )}
        </div>
      </div>

      <style jsx>{`
        .error-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, var(--paper) 100%);
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 40px 24px;
          box-shadow: 0 20px 60px rgba(20,33,61,0.08), 0 4px 12px rgba(20,33,61,0.04);
        }
        details summary {
          list-style: none;
        }
        details summary::-webkit-details-marker {
          display: none;
        }
      `}</style>
    </main>
  );
}