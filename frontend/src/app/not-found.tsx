'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { BookOpen, Home, Search, RotateCcw } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/format';

gsap.registerPlugin(ScrollTrigger);

const floatingBooks = [
  { rotation: -12, x: -80, y: -120, delay: 0, color: '#B3173B', title: 'Sastra', author: 'Indonesia' },
  { rotation: 8, x: 100, y: -80, delay: 0.2, color: '#14213D', title: 'Sejarah', author: 'Nusantara' },
  { rotation: -5, x: -60, y: 100, delay: 0.4, color: '#B4532A', title: 'Fiksi', author: 'Klasik' },
  { rotation: 15, x: 120, y: 40, delay: 0.6, color: '#1F5F63', title: 'Filosofi', author: 'Hidup' },
  { rotation: -10, x: -100, y: 60, delay: 0.8, color: '#8B2635', title: 'Puisi', author: 'Cinta' },
  { rotation: 6, x: 80, y: -140, delay: 1, color: '#2D4A5E', title: 'Biografi', author: 'Pahlawan' },
];

export default function NotFound() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.floating-book', { opacity: 0, scale: 0.8 });

      floatingBooks.forEach((book, i) => {
        gsap.to(`.floating-book-${i}`, {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: book.delay + 0.3,
          ease: 'back.out(1.7)',
        });

        gsap.to(`.floating-book-${i}`, {
          y: `+=${20 + i * 10}`,
          x: `+=${5 * (i % 2 === 0 ? 1 : -1)}`,
          rotation: `+=${2 * (i % 2 === 0 ? 1 : -1)}`,
          duration: 3 + i * 0.5,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        });
      });

      gsap.from('.error-code', {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: 'expo.out',
        delay: 0.2,
      });

      gsap.from('.error-content > *', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: 'expo.out',
        delay: 0.5,
      });

      gsap.from('.book-spine', {
        opacity: 0,
        x: -30,
        duration: 0.6,
        stagger: 0.08,
        ease: 'back.out(1.5)',
        delay: 1,
      });
    }, '.not-found-page');

    return () => ctx.revert();
  }, []);

  return (
    <main className="not-found-page min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--paper)' }}>
      <div className="fixed inset-0" aria-hidden="true">
        {floatingBooks.map((book, i) => (
          <div
            key={i}
            className={cn(
              'floating-book floating-book-absolute',
              `floating-book-${i}`
            )}
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${book.x}px, ${book.y}px) rotate(${book.rotation}deg)`,
            }}
            aria-hidden="true"
          >
            <div
              className="book-spine"
              style={{
                width: '36px',
                height: `${140 + (i % 3) * 20}px`,
                backgroundColor: book.color,
                borderRadius: '3px 3px 0 0',
                position: 'relative',
                boxShadow: 'inset -4px 0 8px rgba(0,0,0,0.15), inset 2px 0 4px rgba(255,255,255,0.1), 4px 8px 20px rgba(0,0,0,0.15)',
              }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center px-1"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <span className="text-[9px] font-bold text-white leading-tight whitespace-nowrap font-display">
                  {book.title}
                </span>
              </div>
              <div
                className="absolute bottom-3 left-1/2 -translate-x-1/2"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <span className="text-[7px] text-white/70 font-medium">{book.author}</span>
              </div>
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white/20 rounded" />
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white/15 rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="error-content max-w-xl w-full text-center">
          <div className="error-code mb-6">
            <span className="font-display text-[120px] sm:text-[160px] font-bold leading-none tracking-tight" style={{ color: 'var(--navy)' }}>
              404
            </span>
            <div
              className="w-24 h-1 mx-auto mt-4"
              style={{
                background: 'linear-gradient(90deg, var(--cherry), var(--navy))',
                borderRadius: '9999px',
              }}
            />
            <div className="mt-2 flex justify-center gap-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--navy)' }} />
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--cherry)' }} />
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--navy)' }} />
            </div>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-semibold mb-4" style={{ color: 'var(--navy)' }}>
            Halaman tidak ditemukan di rak kami
          </h1>

          <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--ink)' }}>
            Sepertinya buku yang Anda cari sudah dipinjam orang lain, atau mungkin tautannya salah ketik.
            Jangan khawatir, rak kami masih penuh cerita menarik lain.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link
              href="/books"
              className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3"
              style={{ fontSize: '1rem' }}
            >
              <Search className="h-5 w-5" />
              Jelajahi Katalog
            </Link>
            <Link
              href="/"
              className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3"
              style={{ fontSize: '1rem' }}
            >
              <Home className="h-5 w-5" />
              Kembali ke Beranda
            </Link>
          </div>

          <div className="relative" role="img" aria-label="Rak buku kosong">
            <div
              className="mx-auto max-w-md"
              style={{
                perspective: '1000px',
              }}
            >
              <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(180deg, var(--paper-deep) 0%, var(--paper) 100%)',
                    borderRadius: '12px 12px 0 0',
                    boxShadow: '0 20px 60px rgba(20,33,61,0.15), inset 0 -2px 10px rgba(0,0,0,0.05)',
                    transform: 'translateZ(-40px)',
                  }}
                />
                <div
                  className="relative p-6"
                  style={{
                    background: 'linear-gradient(180deg, #fff 0%, var(--paper) 100%)',
                    borderRadius: '12px 12px 0 0',
                    border: '1px solid var(--line)',
                    boxShadow: '0 30px 80px rgba(20,33,61,0.12)',
                    minHeight: '200px',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar" style={{ transform: 'translateZ(20px)' }}>
                    {[
                      { color: '#B3173B', title: 'Laut', author: 'Bercerita' },
                      { color: '#14213D', title: 'Pulang', author: 'Toba' },
                      { color: '#B4532A', title: 'Senja', author: 'Di Jakarta' },
                      { color: '#1F5F63', title: 'Cahaya', author: 'Hati' },
                      { color: '#8B2635', title: 'Mimpi', author: 'Kita' },
                      { color: '#2D4A5E', title: 'Hujan', author: 'Musim' },
                    ].map((book, i) => (
                      <div
                        key={i}
                        className="book-spine flex-shrink-0 flex flex-col items-center justify-between p-2"
                        style={{
                          width: '44px',
                          height: `${120 + (i % 4) * 15}px`,
                          backgroundColor: book.color,
                          borderRadius: '3px 3px 0 0',
                          boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.12), inset 1px 0 3px rgba(255,255,255,0.08), 2px 4px 12px rgba(0,0,0,0.1)',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateZ(30px) translateY(-8px)';
                          e.currentTarget.style.boxShadow = 'inset -3px 0 6px rgba(0,0,0,0.12), inset 1px 0 3px rgba(255,255,255,0.08), 8px 16px 32px rgba(0,0,0,0.2)';
                          e.currentTarget.style.zIndex = '10';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateZ(20px)';
                          e.currentTarget.style.boxShadow = 'inset -3px 0 6px rgba(0,0,0,0.12), inset 1px 0 3px rgba(255,255,255,0.08), 2px 4px 12px rgba(0,0,0,0.1)';
                          e.currentTarget.style.zIndex = '1';
                        }}
                      >
                        <span className="text-[8px] font-bold text-white leading-tight text-center px-1 whitespace-nowrap font-display" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                          {book.title}
                        </span>
                        <span className="text-[6px] text-white/70 font-medium" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                          {book.author}
                        </span>
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-white/20 rounded" />
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-white/15 rounded" />
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-sm mt-4" style={{ color: 'var(--muted)' }}>
                    Klik buku untuk melihat detail · Geser untuk melihat lainnya
                  </p>
                </div>
                <div
                  className="absolute bottom-0 left-4 right-4 h-2"
                  style={{
                    background: 'linear-gradient(90deg, transparent, var(--line), transparent)',
                    borderRadius: '0 0 8px 8px',
                    transform: 'translateZ(-42px)',
                    opacity: 0.5,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-line">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Atau coba cari judul, penulis, atau ISBN yang Anda inginkan:
            </p>
            <form
              action="/books"
              method="GET"
              className="mt-4 flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
            >
              <input
                type="search"
                name="q"
                placeholder="Cari buku..."
                className="flex-1 px-4 py-3 rounded-xl border border-line bg-white/80 focus:border-cherry focus:ring-4 focus:ring-cherry/10 outline-none text-base"
                autoFocus
              />
              <button
                type="submit"
                className="btn-primary px-6 py-3 whitespace-nowrap"
              >
                <Search className="h-5 w-5" />
                <span className="hidden sm:inline">Cari</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .floating-book-absolute {
          pointer-events: none;
          will-change: transform, opacity;
        }
        .book-spine {
          cursor: pointer;
          user-select: none;
        }
        .book-spine:focus-visible {
          outline: 2px solid var(--cherry);
          outline-offset: 2px;
          border-radius: 4px;
        }
      `}</style>
    </main>
  );
}