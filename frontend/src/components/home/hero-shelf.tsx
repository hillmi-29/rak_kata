'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import gsap from 'gsap';
import {
  ArrowRight,
  BookOpen,
  MousePointer2,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { Bookshelf } from '@/components/books/bookshelf';
import { BookCover } from '@/components/books/book-cover';
import { Rating } from '@/components/ui/rating';
import { useCart } from '@/lib/cart-context';
import { cn, formatPrice } from '@/lib/format';
import type { Book } from '@/lib/types';

interface HeroShelfProps {
  books: Book[];
  loading?: boolean;
}

export function HeroShelf({ books, loading }: HeroShelfProps) {
  const [selected, setSelected] = useState<Book | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const { addItem } = useCart();

  const fiksi = books.filter(book => ['fiksi', 'sastra'].includes(book.category?.slug || '')).slice(0, 7);
  const nonFiksi = books.filter(book => ['non-fiksi', 'pengembangan-diri', 'bisnis'].includes(book.category?.slug || '')).slice(0, 7);
  const used = new Set([...fiksi, ...nonFiksi].map(book => book.id));
  const terlaris = books
    .filter(book => !used.has(book.id))
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 8);

  const groups = [
    { label: 'Fiksi', books: fiksi },
    { label: 'Non-Fiksi', books: nonFiksi },
    { label: 'Terlaris', books: terlaris },
  ].filter(group => group.books.length > 0);

  useEffect(() => {
    if (loading || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      gsap.from('.hero-copy > *', {
        y: 26,
        opacity: 0,
        duration: 0.85,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'transform',
      });
      gsap.from('.hero-shelf-wrap', {
        opacity: 0,
        y: 34,
        rotateY: -4,
        duration: 1.1,
        delay: 0.15,
        ease: 'power3.out',
        clearProps: 'transform',
      });
    }, sectionRef);
    return () => context.revert();
  }, [loading]);

  const avgRating = books.length
    ? (books.reduce((sum, book) => sum + book.averageRating, 0) / books.length).toFixed(1).replace('.', ',')
    : '4,8';

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-line bg-[radial-gradient(120%_100%_at_80%_0%,#fffdf8_0%,#faf6ef_54%,#f3ecdf_100%)]"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px bg-line/40" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#efe3cd]/50 blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] top-16 h-80 w-80 rounded-full bg-[#f7dfc7]/40 blur-3xl" />

      <div className="container-editorial relative grid min-h-[calc(100svh-106px)] grid-cols-1 items-center gap-8 py-8 sm:gap-10 sm:py-10 lg:grid-cols-[0.86fr_1.14fr] lg:gap-6 lg:py-12">
        <div className="hero-copy relative z-10 min-w-0 max-w-xl">
          <div className="mb-4 flex items-center gap-3 sm:mb-5">
            <span className="eyebrow">Toko buku independen · Jakarta</span>
            <span className="hidden h-px w-12 bg-cherry/30 sm:block" />
          </div>
          <h1 className="font-display text-[32px] font-semibold leading-[1.04] tracking-[-0.03em] text-navy sm:text-[52px] sm:leading-[0.98] sm:tracking-[-0.035em] lg:text-[60px]">
            Pilih buku dari <em className="font-light italic text-cherry">rak</em>, baca sinopsisnya sebelum membawanya pulang.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/65 sm:mt-5 sm:text-[15px]">
            Bukan sekadar katalog. Sentuh buku di rak, kenali ceritanya, lalu temukan yang paling
            terasa seperti milik Anda.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:mt-7 sm:gap-3">
            <Link href="/books" className="btn-primary flex-1 px-4 py-3 text-sm sm:btn-lg sm:flex-initial">
              Jelajahi Katalog
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/books?view=shelf" className="btn-secondary flex-1 px-4 py-3 text-sm sm:btn-lg sm:flex-initial">
              <BookOpen className="h-4 w-4" />
              Lihat Rak 3D
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3 border-t border-line pt-5 sm:mt-8 sm:flex sm:items-center sm:gap-5">
            <div>
              <p className="font-display text-xl font-semibold text-navy sm:text-2xl">{books.length || 26}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted sm:tracking-[0.15em]">Judul pilihan</p>
            </div>
            <span className="hidden h-9 w-px bg-line sm:block" />
            <div className="border-x border-line px-3 sm:border-none sm:px-0">
              <p className="flex items-center gap-1 font-display text-xl font-semibold text-navy sm:text-2xl">
                {avgRating}
                <Star className="h-3.5 w-3.5 fill-[#D9A404] text-[#D9A404]" />
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted sm:tracking-[0.15em]">Rating pembaca</p>
            </div>
            <span className="hidden h-9 w-px bg-line sm:block" />
            <div>
              <p className="font-display text-xl font-semibold text-navy sm:text-2xl">6</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted sm:tracking-[0.15em]">Kategori kurasi</p>
            </div>
          </div>

          <p className="mt-5 flex items-center gap-2 font-hand text-lg text-muted sm:mt-6">
            <MousePointer2 className="h-4 w-4 -rotate-12 text-cherry" />
            Klik buku di rak untuk melihat sinopsis
          </p>
        </div>

        <div className="hero-shelf-wrap relative z-10 min-w-0 lg:pt-7">
          <div className="pointer-events-none absolute left-0 top-0 z-30 hidden items-center gap-2 rounded-full border border-line bg-cream/95 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-navy shadow-paper backdrop-blur lg:flex">
            <Sparkles className="h-3 w-3 text-cherry" />
            Edisi kurasi musim hujan
          </div>

          <div
            className={cn(
              'relative z-10 transition duration-500 ease-out',
              selected && 'scale-[0.985] opacity-30 blur-[2px]'
            )}
          >
            {loading ? (
              <div className="skeleton h-[430px] w-full rounded-lg" />
            ) : (
              <div className="overflow-x-auto pb-8 hide-scrollbar lg:overflow-visible lg:pb-0">
                <Bookshelf
                  groups={groups}
                  onSelect={setSelected}
                  className="min-w-[570px] lg:min-w-0"
                />
              </div>
            )}
          </div>

          <AnimatePresence>
            {selected && (
              <>
                <div className="pointer-events-none absolute inset-y-0 left-2 z-20 hidden items-center sm:flex lg:left-4">
                  <motion.div
                    key={`cover-${selected.id}`}
                    initial={{ opacity: 0, y: 40, rotateY: 28, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, rotateY: -6, scale: 1 }}
                    exit={{ opacity: 0, y: 24, rotateY: 18, scale: 0.94 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 180 }}
                    className="w-[178px] [perspective:900px]"
                  >
                    <BookCover
                      title={selected.title}
                      author={selected.author}
                      coverImage={selected.coverImage}
                      coverColor={selected.coverColor}
                      publisher={selected.publisher}
                      category={selected.category?.name}
                      className="shadow-[0_40px_60px_-24px_rgba(20,33,61,0.6)]"
                    />
                  </motion.div>
                </div>

                <div className="pointer-events-none absolute inset-y-0 right-0 z-30 hidden items-center lg:flex">
                  <motion.aside
                    key={`panel-${selected.id}`}
                    initial={{ opacity: 0, x: 38 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="pointer-events-auto relative flex max-h-[540px] w-[350px] flex-col overflow-y-auto rounded-xl border border-line bg-cream/97 p-5 shadow-lift backdrop-blur-md thin-scrollbar"
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="absolute right-3.5 top-3.5 grid h-7 w-7 place-items-center rounded-full text-muted transition hover:bg-navy/5 hover:text-ink"
                      aria-label="Tutup sinopsis"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <span className="mb-2.5 inline-flex w-fit items-center rounded-full bg-cherry/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-cherry">
                      {selected.category?.name || 'Buku pilihan'}
                    </span>
                    <h2 className="pr-6 font-display text-[25px] font-semibold leading-[1.08] text-navy">
                      {selected.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted">{selected.author}</p>
                    <Rating value={selected.averageRating} count={selected.reviewCount} className="mt-1.5" />
                    <p className="mt-3 line-clamp-4 text-[13px] leading-relaxed text-ink/70">
                      {selected.description}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg border border-line bg-white/60 p-2.5 text-center">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted">Halaman</p>
                        <p className="text-xs font-bold text-navy">{selected.pages || '-'}</p>
                      </div>
                      <div className="border-x border-line">
                        <p className="text-[10px] uppercase tracking-wide text-muted">Tahun</p>
                        <p className="text-xs font-bold text-navy">{selected.publishedYear || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted">Stok</p>
                        <p className={cn('text-xs font-bold', selected.stock > 0 ? 'text-success' : 'text-danger')}>
                          {selected.stock > 0 ? selected.stock : 'Habis'}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-muted">Penerbit</p>
                    <p className="text-xs font-semibold text-navy">{selected.publisher}</p>
                    <p className="mt-2.5 font-display text-2xl font-bold text-navy">{formatPrice(selected.price)}</p>
                    <div className="mt-3 flex flex-col gap-2">
                      <Link href={`/book/${selected.slug}`} className="btn-primary w-full">
                        Lihat Detail
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => addItem(selected, 1)}
                        className="btn-secondary w-full"
                        disabled={selected.stock <= 0}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Tambah ke Keranjang
                      </button>
                    </div>
                  </motion.aside>
                </div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[75] lg:hidden">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-navy/40 backdrop-blur-[2px]"
              onClick={() => setSelected(null)}
              aria-label="Tutup sinopsis"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-line bg-cream px-5 pb-6 pt-4 shadow-lift thin-scrollbar"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 gap-3.5">
                  <div className="w-20 shrink-0">
                    <BookCover
                      title={selected.title}
                      author={selected.author}
                      coverImage={selected.coverImage}
                      coverColor={selected.coverColor}
                      category={selected.category?.name}
                      compact
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center rounded-full bg-cherry/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-cherry">
                      {selected.category?.name || 'Buku pilihan'}
                    </span>
                    <h2 className="mt-1.5 font-display text-xl font-semibold leading-snug text-navy">
                      {selected.title}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted">{selected.author}</p>
                    <Rating value={selected.averageRating} count={selected.reviewCount} className="mt-1.5" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-navy/5 hover:text-ink"
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-ink/75">{selected.description}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-line bg-white/60 p-2.5 text-center">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted">Halaman</p>
                  <p className="text-xs font-bold text-navy">{selected.pages || '-'}</p>
                </div>
                <div className="border-x border-line">
                  <p className="text-[10px] uppercase tracking-wide text-muted">Tahun</p>
                  <p className="text-xs font-bold text-navy">{selected.publishedYear || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted">Stok</p>
                  <p className={cn('text-xs font-bold', selected.stock > 0 ? 'text-success' : 'text-danger')}>
                    {selected.stock > 0 ? selected.stock : 'Habis'}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Penerbit</p>
                  <p className="truncate text-xs font-semibold text-navy">{selected.publisher || '-'}</p>
                </div>
                <span className="shrink-0 font-display text-2xl font-bold text-navy">
                  {formatPrice(selected.price)}
                </span>
              </div>
              <div className="mt-4 flex gap-2.5">
                <Link href={`/book/${selected.slug}`} className="btn-primary flex-1">
                  Lihat Detail
                </Link>
                <button
                  type="button"
                  onClick={() => addItem(selected, 1)}
                  className="btn-secondary flex-1"
                  disabled={selected.stock <= 0}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Keranjang
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
