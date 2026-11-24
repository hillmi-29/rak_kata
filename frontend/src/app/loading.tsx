'use client';

import { useEffect } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { gsap } from 'gsap';
import { cn } from '@/lib/format';

const bookColors = ['#B3173B', '#14213D', '#B4532A', '#1F5F63', '#8B2635', '#2D4A5E'];

export default function Loading() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.loading-book', {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.08,
        ease: 'back.out(1.5)',
      });

      gsap.to('.loading-book', {
        y: -15,
        duration: 1.5,
        stagger: 0.15,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      gsap.from('.loading-text', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'expo.out',
        delay: 0.3,
      });

      gsap.to('.loading-dot', {
        opacity: 1,
        duration: 0.4,
        stagger: 0.2,
        ease: 'power2.inOut',
        repeat: -1,
        yoyo: true,
      });
    }, '.loading-page');

    return () => ctx.revert();
  }, []);

  return (
    <main className="loading-page min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--paper)' }}>
      <div className="text-center">
        <div className="flex justify-center gap-2 mb-6" role="img" aria-label="Buku-buku sedang dimuat">
          {bookColors.map((color, i) => (
            <div
              key={i}
              className="loading-book"
              style={{
                width: '40px',
                height: `${110 + (i % 3) * 15}px`,
                backgroundColor: color,
                borderRadius: '3px 3px 0 0',
                position: 'relative',
                boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.12), inset 1px 0 3px rgba(255,255,255,0.08), 4px 8px 20px rgba(0,0,0,0.15)',
                transformOrigin: 'bottom center',
              }}
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white/20 rounded" />
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white/15 rounded" />
              <div
                className="absolute inset-0 flex items-center justify-center px-1"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <span className="text-[8px] font-bold text-white leading-tight whitespace-nowrap font-display">
                  RAK KATA
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="loading-text flex items-center justify-center gap-1.5 mb-8">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--cherry)' }} />
          <span className="font-display text-xl font-semibold" style={{ color: 'var(--navy)' }}>
            Memuat rak buku...
          </span>
        </div>

        <div className="flex justify-center gap-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="loading-dot"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--cherry)',
                opacity: 0.3,
                animationDelay: `${i * 150}ms`,
              }}
            />
          ))}
        </div>

        <p className="text-sm mt-6" style={{ color: 'var(--muted)' }}>
          Menyiapkan cerita terbaik untuk Anda...
        </p>
      </div>

      <style jsx>{`
        .loading-page {
          background: var(--paper);
          background-image:
            radial-gradient(1100px 620px at 88% -8%, rgba(255, 255, 255, 0.9), transparent 62%),
            radial-gradient(900px 500px at -10% 8%, rgba(230, 223, 211, 0.55), transparent 60%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </main>
  );
}