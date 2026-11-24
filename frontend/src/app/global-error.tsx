'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCw, AlertCircle, WifiOff, Server } from 'lucide-react';
import { gsap } from 'gsap';
import { cn } from '@/lib/format';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.global-error-container', {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
      });

      gsap.from('.global-error-icon', {
        scale: 0,
        rotation: -90,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)',
        delay: 0.1,
      });

      gsap.from('.global-error-content > *', {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: 'expo.out',
        delay: 0.3,
      });
    }, '.global-error-page');

    return () => ctx.revert();
  }, []);

  return (
    <html lang="id" className="global-error-page">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Kesalahan Sistem - Rak Kata</title>
        <style>{`
          :root {
            --paper: #faf6ef;
            --paper-deep: #f2ebdd;
            --ink: #1b1b1f;
            --navy: #14213d;
            --cherry: #b3173b;
            --muted: #6b6b76;
            --line: #e6dfd3;
          }
          * { box-sizing: border-box; }
          body { margin: 0; font-family: 'Source Sans 3', system-ui, sans-serif; }
        `}</style>
      </head>
      <body style={{ backgroundColor: 'var(--paper)', minHeight: '100vh' }}>
        <div className="global-error-container min-h-screen flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-lg">
            <div className="global-error-content text-center" style={{ backgroundColor: 'var(--paper)' }}>
              <div
                className="global-error-icon inline-flex items-center justify-center mb-6"
                style={{
                  width: '104px',
                  height: '104px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--cherry)/15, var(--navy)/15)',
                  border: '2px solid var(--cherry)/20',
                }}
              >
                <Server className="h-14 w-14" style={{ color: 'var(--cherry)' }} />
              </div>

              <h1 className="font-display text-3xl font-semibold mb-3" style={{ color: 'var(--navy)' }}>
                Server sedang istirahat
              </h1>

              <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--ink)' }}>
                Maaf, sistem kami mengalami gangguan sementara. Tim teknis kami sudah diberitahu dan sedang memperbaikinya.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <button
                  onClick={reset}
                  className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3"
                >
                  <RefreshCw className="h-5 w-5" />
                  Muat Ulang
                </button>
                <Link
                  href="/"
                  className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3"
                >
                  <Home className="h-5 w-5" />
                  Ke Beranda
                </Link>
              </div>

              <div className="flex items-center justify-center gap-3 text-sm mb-8" style={{ color: 'var(--muted)' }}>
                <WifiOff className="h-5 w-5" style={{ color: 'var(--cherry)' }} />
                <span>Periksa koneksi internet Anda</span>
              </div>

              <div className="pt-6" style={{ borderTop: '1px solid var(--line)' }}>
                <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>
                  Butuh bantuan segera?
                </p>
                <a
                  href="mailto:support@rakkata.com"
                  className="inline-flex items-center gap-2 text-sm font-semibold transition"
                  style={{ color: 'var(--cherry)' }}
                >
                  <AlertCircle className="h-4 w-4" />
                  Hubungi Support
                </a>
              </div>

              {isDev && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer flex items-center gap-2 font-medium text-sm" style={{ color: 'var(--navy)' }}>
                    <AlertCircle className="h-4 w-4" />
                    Detail Error (Development)
                  </summary>
                  <div className="mt-3 p-4 rounded-xl overflow-x-auto text-left" style={{ backgroundColor: 'var(--paper-deep)', border: '1px solid var(--line)' }}>
                    <pre className="text-[11px] font-mono whitespace-pre-wrap break-words" style={{ color: 'var(--ink)' }}>
                      {error.message}
                      {error.digest && `\n\nDigest: ${error.digest}`}
                      {error.stack && `\n\nStack:\n${error.stack}`}
                    </pre>
                  </div>
                </details>
              )}
            </div>

            <p className="text-center text-xs mt-8" style={{ color: 'var(--muted)' }}>
              &copy; {new Date().getFullYear()} Rak Kata. Semua hak dilindungi.
            </p>
          </div>
        </div>

        <style jsx>{`
          .global-error-page {
            background: var(--paper);
            background-image:
              radial-gradient(1100px 620px at 88% -8%, rgba(255, 255, 255, 0.9), transparent 62%),
              radial-gradient(900px 500px at -10% 8%, rgba(230, 223, 211, 0.55), transparent 60%),
              url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          }
          details summary {
            list-style: none;
          }
          details summary::-webkit-details-marker {
            display: none;
          }
        `}</style>
      </body>
    </html>
  );
}