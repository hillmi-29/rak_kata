'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Package,
  RotateCcw,
  Share2,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/lib/toast-context';
import {
  cn,
  formatPrice,
  getInitialsColor,
  initials,
  readingTime,
  stockLabel,
  timeAgo,
} from '@/lib/format';
import { coverTheme, spineWidth } from '@/lib/cover';
import type {
  Book,
  BookDetail,
  RatingDistribution,
  Review,
} from '@/lib/types';
import { BookCover } from '@/components/books/book-cover';
import { FavoriteToggle } from '@/components/books/favorite-toggle';
import { Spine } from '@/components/books/spine';
import { Rating } from '@/components/ui/rating';
import { Modal } from '@/components/ui/modal';
import { QtyStepper } from '@/components/ui/qty-stepper';
import type { SakugaButtonElement } from '@/types/sakuga';

type GalleryView = 'front' | 'spine' | 'back' | 'inside';
type TabKey = 'deskripsi' | 'detail' | 'ulasan';

const galleryLabels: Record<GalleryView, string> = {
  front: 'Sampul',
  spine: 'Punggung',
  back: 'Belakang',
  inside: 'Halaman',
};

export default function BookDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { success, error } = useToast();

  const [book, setBook] = useState<BookDetail | null>(null);
  const addRef = useRef<SakugaButtonElement | null>(null);
  const addMobileRef = useRef<SakugaButtonElement | null>(null);
  const [similar, setSimilar] = useState<Book[]>([]);
  const [distribution, setDistribution] = useState<RatingDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<TabKey>('deskripsi');
  const [gallery, setGallery] = useState<GalleryView>('front');
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadBook = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setLoadError('');
    try {
      const response = await api.get<BookDetail>(`/books/${slug}`);
      setBook(response.data);
      const [distributionResponse, similarResponse] = await Promise.all([
        api
          .get<RatingDistribution>(`/reviews/book/${response.data.id}/distribution`)
          .catch(() => null),
        api
          .get<Book[]>(
            `/books?category=${response.data.category?.slug || ''}&limit=10&sortBy=popular`
          )
          .catch(() => null),
      ]);
      if (distributionResponse) setDistribution(distributionResponse.data);
      if (similarResponse) {
        setSimilar(similarResponse.data.filter(item => item.id !== response.data.id).slice(0, 8));
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Buku tidak ditemukan');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadBook();
  }, [loadBook]);

  useEffect(() => {
    setQty(1);
    setTab('deskripsi');
    setGallery('front');
    setDistribution(null);
    setSimilar([]);
  }, [slug]);

  const stock = book ? stockLabel(book.stock) : null;
  const theme = book ? coverTheme(book.slug, book.coverColor) : null;

  const reviewStats = useMemo(() => {
    if (!book) return { total: 0, average: 0 };
    return {
      total: distribution
        ? Object.values(distribution).reduce((sum, count) => sum + count, 0)
        : book.reviewCount,
      average: book.averageRating || 0,
    };
  }, [book, distribution]);

  async function handleAddToCart() {
    if (!book) return;
    setAdding(true);
    try {
      const ok = await addItem(book, qty);
      if (ok) {
        addRef.current?.done();
        addMobileRef.current?.done();
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleBuyNow() {
    if (!book) return;
    setBuying(true);
    try {
      await addItem(book, qty);
      if (user) {
        router.push('/checkout');
      } else {
        success('Buku ditambahkan. Masuk untuk menyelesaikan pesanan.');
        router.push('/cart');
      }
    } finally {
      setBuying(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      success('Tautan buku disalin');
    } catch {
      error('Tidak dapat menyalin tautan');
    }
  }

  function openReview() {
    if (!user) {
      error('Masuk terlebih dahulu untuk menulis ulasan');
      router.push('/login');
      return;
    }
    setReviewOpen(true);
  }

  async function submitReview(event: React.FormEvent) {
    event.preventDefault();
    if (!book) return;
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        bookId: book.id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      success('Terima kasih, ulasan Anda sudah tampil');
      setReviewOpen(false);
      setReviewComment('');
      setReviewRating(5);
      await loadBook();
    } catch (err) {
      error(err instanceof Error ? err.message : 'Gagal mengirim ulasan');
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return <DetailSkeleton />;
  }

  if (loadError || !book) {
    return (
      <div className="container-editorial py-24">
        <div className="mx-auto max-w-lg rounded-2xl border border-line bg-white/60 px-8 py-14 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-cream-dark text-navy">
            <BookOpen className="h-7 w-7" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold text-navy">
            Buku ini tidak ada di rak kami
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {loadError || 'Mungkin tautannya salah atau buku sudah dipindahkan.'}
          </p>
          <Link href="/books" className="btn-primary mt-6">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke katalog
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = book.category?.name || 'Buku';
  const distributionRows = distribution
    ? ([5, 4, 3, 2, 1] as const).map(star => ({
        star,
        count: distribution[star],
        percent:
          reviewStats.total > 0 ? Math.round((distribution[star] / reviewStats.total) * 100) : 0,
      }))
    : [];

  return (
    <div className="pb-28 lg:pb-0">
      <div className="container-editorial py-6 lg:py-9">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-cherry">
            Beranda
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/books" className="transition hover:text-cherry">
            Katalog
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/books?category=${book.category?.slug || ''}`}
            className="transition hover:text-cherry"
          >
            {categoryName}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1 text-navy">{book.title}</span>
        </nav>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy transition hover:text-cherry"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Rak
          </button>
          <p className="hidden items-center gap-1.5 text-[11px] text-muted sm:flex">
            <Package className="h-3.5 w-3.5" />
            Dikirim dari Jakarta dalam 1×24 jam
          </p>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-14">
          {/* Cover gallery */}
          <div className="min-w-0 lg:sticky lg:top-[104px] lg:self-start">
            <div className="relative">
              <div className="pointer-events-none absolute -left-8 top-8 hidden h-[86%] w-[70%] rounded-3xl bg-[#efe4d2] blur-2xl lg:block" />
              <div className="relative mx-auto max-w-[260px] sm:max-w-[390px]">
                <motion.div
                  initial={{ opacity: 0, y: 34, rotateY: 26, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }}
                  transition={{ type: 'spring', damping: 24, stiffness: 150 }}
                  className="[perspective:1200px]"
                >
                  <motion.div
                    animate={{ y: [0, -7, 0] }}
                    transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
                  >
                    <GalleryPreview
                      book={book}
                      view={gallery}
                      themeColor={theme?.color || '#B3173B'}
                    />
                  </motion.div>
                </motion.div>

                {book.stock <= 5 && (
                  <span
                    className={cn(
                      'absolute left-1 top-3 z-20 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] shadow-sm',
                      book.stock <= 0 ? 'bg-danger text-white' : 'bg-warning text-white'
                    )}
                  >
                    {book.stock <= 0 ? 'Stok habis' : `Sisa ${book.stock}`}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 sm:gap-2.5">
              {(Object.keys(galleryLabels) as GalleryView[]).map(view => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setGallery(view)}
                  className={cn(
                    'group relative w-[64px] shrink-0 overflow-hidden rounded-md border-2 bg-white p-1 transition sm:w-[72px]',
                    gallery === view
                      ? 'border-cherry shadow-sm'
                      : 'border-transparent opacity-65 hover:opacity-100'
                  )}
                  aria-label={`Lihat ${galleryLabels[view]}`}
                  aria-pressed={gallery === view}
                >
                  <span className="block aspect-[2/3] overflow-hidden rounded-sm">
                    <MiniPreview book={book} view={view} themeColor={theme?.color || '#B3173B'} />
                  </span>
                  <span className="mt-1 block text-center text-[9px] font-semibold uppercase tracking-wide text-muted">
                    {galleryLabels[view]}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl border border-line bg-white/55 p-3 text-center sm:p-4">
              <div>
                <BookOpen className="mx-auto h-4 w-4 text-cherry" />
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {book.pages || '—'} hlm
                </p>
                <p className="text-[10px] text-muted/70">{readingTime(book.pages)}</p>
              </div>
              <div className="border-x border-line">
                <ShieldCheck className="mx-auto h-4 w-4 text-cherry" />
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Original
                </p>
                <p className="text-[10px] text-muted/70">Langsung penerbit</p>
              </div>
              <div>
                <Truck className="mx-auto h-4 w-4 text-cherry" />
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {book.weight} gr
                </p>
                <p className="text-[10px] text-muted/70">Berat kirim</p>
              </div>
            </div>
          </div>

          {/* Book info */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/books?category=${book.category?.slug || ''}`}
                className="chip transition hover:border-cherry hover:text-cherry"
              >
                {categoryName}
              </Link>
              {book.publishedYear && (
                <span className="chip">Terbit {book.publishedYear}</span>
              )}
              <span className="chip">{book.language || 'Indonesia'}</span>
            </div>

            <h1 className="mt-4 font-display text-[28px] font-semibold leading-[1.06] tracking-[-0.03em] text-navy sm:text-[46px] sm:leading-[1.02]">
              {book.title}
            </h1>
            <p className="mt-2 text-[15px] text-muted">
              oleh{' '}
              <Link
                href={`/books?author=${encodeURIComponent(book.author)}`}
                className="font-semibold text-navy underline-offset-4 hover:text-cherry hover:underline"
              >
                {book.author}
              </Link>
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Rating value={reviewStats.average} count={reviewStats.total} size="md" />
              <button
                type="button"
                onClick={() => {
                  setTab('ulasan');
                  document.getElementById('detail-tabs')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs font-semibold text-cherry underline-offset-4 hover:underline"
              >
                Lihat {reviewStats.total} ulasan
              </button>
              <span className="h-3 w-px bg-line" />
              <span className="text-xs text-muted">Terjual 120+ bulan ini</span>
            </div>

            <div className="mt-6 rounded-xl border border-line bg-gradient-to-br from-white/80 to-cream/40 p-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-display text-[34px] font-bold leading-none text-navy">
                    {formatPrice(book.price)}
                  </p>
                  <p className="mt-1.5 text-xs text-muted">
                    Harga sudah termasuk pajak · belum termasuk ongkir
                  </p>
                </div>
                {stock && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide',
                      book.stock <= 0
                        ? 'bg-danger/10 text-danger'
                        : book.stock <= 5
                          ? 'bg-warning/10 text-[#A86B00]'
                          : 'bg-success/10 text-success'
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        book.stock <= 0
                          ? 'bg-danger'
                          : book.stock <= 5
                            ? 'bg-warning'
                            : 'bg-success'
                      )}
                    />
                    {stock.label}
                  </span>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <QtyStepper
                  value={qty}
                  onChange={setQty}
                  max={Math.max(1, book.stock)}
                  disabled={book.stock <= 0}
                />
                <span className="text-xs text-muted">
                  Subtotal: <strong className="text-navy">{formatPrice(book.price * qty)}</strong>
                </span>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <sakuga-button
                  ref={addRef}
                  onClick={handleAddToCart}
                  disabled={book.stock <= 0 || adding}
                  className="sakuga-lg sakuga-full"
                >
                  {book.stock <= 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                </sakuga-button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={book.stock <= 0 || buying}
                  className="btn-secondary btn-lg"
                >
                  {buying ? 'Menyiapkan...' : 'Beli Sekarang'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <FavoriteToggle book={book} variant="wide" />
                <button
                  type="button"
                  onClick={copyLink}
                  className="btn-ghost btn-sm border border-line bg-white/60"
                  aria-label="Bagikan buku"
                >
                  <Share2 className="h-4 w-4" />
                  Bagikan
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                Pembayaran aman via Xendit
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-info" />
                JNE · SiCepat · J&amp;T
              </span>
              <span className="flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-warning" />
                Buku rusak? Kami ganti
              </span>
            </div>

            <div className="mt-7 border-t border-line pt-5">
              <h2 className="font-display text-lg font-semibold text-navy">Sinopsis singkat</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                {book.description || 'Belum ada deskripsi untuk buku ini.'}
              </p>
            </div>

            <div className="mt-7">
              <button
                type="button"
                onClick={() => {
                  setTab('detail');
                  document.getElementById('detail-tabs')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group flex w-full items-center justify-between rounded-xl border border-line bg-white/55 px-4 py-3.5 text-left transition hover:border-navy/30"
              >
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                    Informasi penerbitan
                  </span>
                  <span className="mt-0.5 block text-sm font-semibold text-navy">
                    {book.publisher || 'Penerbit Indonesia'} · {book.publishedYear || '—'} ·{' '}
                    {book.pages || '—'} halaman
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-muted transition group-hover:translate-x-1 group-hover:text-cherry" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <section id="detail-tabs" className="mt-14 scroll-mt-24 lg:mt-20">
          <div className="flex gap-1 overflow-x-auto border-b border-line hide-scrollbar">
            {(
              [
                { key: 'deskripsi', label: 'Deskripsi' },
                { key: 'detail', label: 'Detail Buku' },
                { key: 'ulasan', label: `Ulasan (${reviewStats.total})` },
              ] as Array<{ key: TabKey; label: string }>
            ).map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={cn(
                  'relative shrink-0 px-4 py-3.5 text-sm font-semibold transition sm:px-6',
                  tab === item.key ? 'text-cherry' : 'text-muted hover:text-navy'
                )}
                aria-selected={tab === item.key}
              >
                {item.label}
                {tab === item.key && (
                  <motion.span
                    layoutId="detail-tab-line"
                    className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-cherry"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.24 }}
              >
                {tab === 'deskripsi' && (
                  <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
                    <div className="prose-editorial max-w-2xl">
                      <p className="eyebrow mb-3">Tentang buku ini</p>
                      <p className="first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[52px] first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-cherry">
                        {book.description || 'Belum ada deskripsi untuk buku ini.'}
                      </p>
                      <p>
                        {book.title} adalah salah satu judul yang kami rawat di rak {categoryName}.
                        Edisi ini dicetak lengkap dengan kertas yang nyaman dibaca dan sampul yang
                        tidak mudah rusak. Jika Anda sedang mencari hadiah, buku ini juga merupakan
                        pilihan yang aman.
                      </p>
                      <blockquote className="mt-6 border-l-2 border-cherry/40 pl-5 font-display text-xl font-medium leading-snug text-navy">
                        &ldquo;{book.description?.split('.')[0] || 'Buku yang layak tinggal di rak Anda.'}&rdquo;
                      </blockquote>
                    </div>
                    <aside className="h-fit rounded-xl border border-line bg-white/55 p-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                        Catatan dari rak
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-ink/70">
                        Kami memilih buku berdasarkan cerita, kualitas terbitan, dan seberapa sering
                        ia dibaca ulang oleh pembaca di toko kami.
                      </p>
                      <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-navy font-display text-sm font-bold text-cream">
                          RK
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-navy">Tim Kurasi Rak Kata</p>
                          <p className="text-[11px] text-muted">Jakarta, diperbarui rutin</p>
                        </div>
                      </div>
                    </aside>
                  </div>
                )}

                {tab === 'detail' && (
                  <div className="grid gap-8 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-xl border border-line bg-white/60">
                      {[
                        ['ISBN', book.isbn || '—'],
                        ['Penerbit', book.publisher || '—'],
                        ['Tahun Terbit', book.publishedYear ? String(book.publishedYear) : '—'],
                        ['Jumlah Halaman', book.pages ? `${book.pages} halaman` : '—'],
                        ['Berat', `${book.weight} gram`],
                        ['Dimensi', book.dimensions || '—'],
                        ['Bahasa', book.language || 'Indonesia'],
                        ['Kategori', categoryName],
                      ].map(([label, value], index) => (
                        <div
                          key={label}
                          className={cn(
                            'grid grid-cols-[0.9fr_1.1fr] gap-4 px-5 py-3.5 text-sm',
                            index % 2 === 0 && 'bg-cream/50'
                          )}
                        >
                          <dt className="text-muted">{label}</dt>
                          <dd className="font-semibold text-navy">{value}</dd>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-xl border border-line bg-white/55 p-5">
                        <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-navy">
                          <Truck className="h-4 w-4 text-cherry" />
                          Pengiriman
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink/70">
                          Pesanan sebelum pukul 15.00 WIB pada hari kerja biasanya dikirim di hari
                          yang sama. Berat kirim dihitung per buku, termasuk kemasan pelindung.
                        </p>
                        <p className="mt-3 text-xs text-muted">
                          Estimasi tiba: 2–5 hari kerja untuk Jabodetabek, 3–7 hari kerja untuk luar
                          kota.
                        </p>
                      </div>
                      <div className="rounded-xl border border-line bg-white/55 p-5">
                        <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-navy">
                          <RotateCcw className="h-4 w-4 text-cherry" />
                          Pengembalian
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink/70">
                          Jika buku yang Anda terima rusak, salah cetak, atau tidak sesuai pesanan,
                          hubungi kami dalam 3 hari setelah paket tiba. Kami akan mengganti atau
                          mengembalikan dana Anda.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'ulasan' && (
                  <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
                    <div className="h-fit rounded-xl border border-line bg-white/60 p-6 lg:sticky lg:top-[104px]">
                      <p className="eyebrow">Penilaian pembaca</p>
                      <div className="mt-3 flex items-end gap-3">
                        <span className="font-display text-[56px] font-semibold leading-none text-navy">
                          {reviewStats.average.toFixed(1).replace('.', ',')}
                        </span>
                        <div className="pb-1.5">
                          <Rating value={reviewStats.average} showValue={false} size="md" />
                          <p className="mt-1 text-xs text-muted">dari {reviewStats.total} ulasan</p>
                        </div>
                      </div>

                      <div className="mt-5 space-y-2">
                        {distributionRows.length > 0 ? (
                          distributionRows.map(row => (
                            <div key={row.star} className="flex items-center gap-2.5">
                              <span className="flex w-7 items-center gap-0.5 text-[11px] font-semibold text-navy">
                                {row.star}
                                <Star className="h-2.5 w-2.5 fill-[#D9A404] text-[#D9A404]" />
                              </span>
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream-dark">
                                <div
                                  className="h-full rounded-full bg-[#D9A404] transition-all duration-700"
                                  style={{ width: `${row.percent}%` }}
                                />
                              </div>
                              <span className="w-8 text-right text-[10px] tabular text-muted">
                                {row.count}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted">
                            Belum ada cukup ulasan untuk menampilkan grafik.
                          </p>
                        )}
                      </div>

                      <button type="button" onClick={openReview} className="btn-primary mt-6 w-full">
                        Tulis Ulasan
                      </button>
                      <p className="mt-2 text-center text-[11px] text-muted">
                        Ulasan dari pembaca yang sudah membeli ditandai khusus.
                      </p>
                    </div>

                    <div>
                      {book.reviews.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-line bg-white/40 px-6 py-12 text-center">
                          <Star className="mx-auto h-7 w-7 text-[#D9A404]" />
                          <h3 className="mt-3 font-display text-xl font-semibold text-navy">
                            Belum ada ulasan
                          </h3>
                          <p className="mt-1 text-sm text-muted">
                            Jadilah pembaca pertama yang membagikan kesan tentang buku ini.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {book.reviews.map(review => (
                            <ReviewCard key={review.id} review={review} />
                          ))}
                        </div>
                      )}

                      {reviewStats.total > book.reviews.length && (
                        <p className="mt-5 text-center text-xs text-muted">
                          Menampilkan {book.reviews.length} ulasan terbaru dari {reviewStats.total}.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Similar books */}
        {similar.length > 0 && (
          <section className="mt-16 border-t border-line pt-10 lg:mt-24">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Buku serupa</p>
                <h2 className="mt-2 font-display text-[30px] font-semibold tracking-tight text-navy sm:text-[36px]">
                  Masih di rak {categoryName}
                </h2>
              </div>
              <Link
                href={`/books?category=${book.category?.slug || ''}`}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-cherry"
              >
                Lihat semua
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-6 overflow-x-auto pb-3 hide-scrollbar">
              <div className="flex min-w-max items-end gap-2 rounded-xl border border-line bg-gradient-to-b from-white/70 to-cream px-5 py-6">
                {similar.map((item, index) => (
                  <Spine
                    key={item.id}
                    book={item}
                    index={index}
                    onClick={() => router.push(`/book/${item.slug}`)}
                  />
                ))}
                <div className="ml-auto hidden w-44 shrink-0 rounded-lg border border-line bg-white/70 p-3 sm:block">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                    Klik punggung buku
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ink/70">
                    untuk berpindah ke buku lain di rak yang sama.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Sticky mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-4 py-3 shadow-[0_-12px_30px_-20px_rgba(20,33,61,0.5)] backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wide text-muted">Harga</p>
            <p className="font-display text-xl font-bold leading-tight text-navy">
              {formatPrice(book.price * qty)}
            </p>
            {stock && (
              <p
                className={cn(
                  'truncate text-[10px] font-semibold',
                  book.stock <= 0
                    ? 'text-danger'
                    : book.stock <= 5
                      ? 'text-warning'
                      : 'text-success'
                )}
              >
                {stock.label}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={book.stock <= 0 || buying}
            className="btn-primary shrink-0 px-4"
          >
            {book.stock <= 0 ? 'Habis' : buying ? '...' : 'Beli'}
          </button>
          <sakuga-button
            ref={addMobileRef}
            onClick={handleAddToCart}
            disabled={book.stock <= 0 || adding}
            className="sakuga-compact shrink-0"
          >
            Keranjang
          </sakuga-button>
        </div>
      </div>

      <Modal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Tulis ulasan"
        description={`Bagikan kesan Anda tentang ${book.title}`}
        size="sm"
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setReviewOpen(false)}
              className="btn-secondary flex-1"
            >
              Batal
            </button>
            <button
              type="submit"
              form="review-form"
              disabled={submittingReview}
              className="btn-primary flex-1"
            >
              {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
            </button>
          </div>
        }
      >
        <form id="review-form" onSubmit={submitReview} className="space-y-5">
          <div>
            <span className="label">Penilaian</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  aria-label={`Beri ${star} bintang`}
                  className="rounded p-0.5 transition hover:scale-110"
                >
                  <Star
                    className={cn(
                      'h-7 w-7',
                      star <= reviewRating
                        ? 'fill-[#D9A404] text-[#D9A404]'
                        : 'fill-transparent text-line'
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-semibold text-navy">{reviewRating}/5</span>
            </div>
          </div>
          <div>
            <label htmlFor="review-comment" className="label">
              Ulasan Anda
            </label>
            <textarea
              id="review-comment"
              value={reviewComment}
              onChange={event => setReviewComment(event.target.value)}
              placeholder="Apa yang paling berkesan dari buku ini?"
              className="textarea"
              rows={4}
            />
          </div>
          <p className="text-[11px] leading-relaxed text-muted">
            Ulasan akan tampil setelah dikirim. Mohon gunakan bahasa yang sopan dan relevan.
          </p>
        </form>
      </Modal>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="rounded-xl border border-line bg-white/60 p-5">
      <div className="flex items-start gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold text-cream"
          style={{ backgroundColor: getInitialsColor(review.user?.name || 'Pembaca') }}
        >
          {initials(review.user?.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-sm font-semibold text-navy">{review.user?.name || 'Pembaca'}</p>
            {review.verifiedPurchase && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-success">
                <Check className="h-2.5 w-2.5" />
                Pembelian terverifikasi
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Rating value={review.rating} showValue={false} />
            <span className="text-[11px] text-muted">{timeAgo(review.createdAt)}</span>
          </div>
        </div>
      </div>
      {review.comment && (
        <p className="mt-3 text-sm leading-relaxed text-ink/75">{review.comment}</p>
      )}
    </article>
  );
}

function GalleryPreview({
  book,
  view,
  themeColor,
}: {
  book: BookDetail;
  view: GalleryView;
  themeColor: string;
}) {
  if (view === 'front') {
    return (
      <div className="group relative [perspective:1000px]">
        <div className="transition duration-700 ease-out group-hover:[transform:rotateY(-8deg)_rotateX(2deg)]">
          <BookCover
            title={book.title}
            author={book.author}
            coverImage={book.coverImage}
            coverColor={book.coverColor}
            publisher={book.publisher}
            category={book.category?.name}
            className="shadow-[0_45px_70px_-30px_rgba(20,33,61,0.65)]"
          />
        </div>
        <span className="pointer-events-none absolute inset-y-6 -right-1.5 w-2 rounded-r-sm bg-gradient-to-r from-[#d9cdbb] to-[#f5eee2] opacity-80" />
      </div>
    );
  }

  const base = (
    <div
      className="relative flex aspect-[2/3] w-full overflow-hidden rounded-r-lg border border-line shadow-[0_35px_60px_-28px_rgba(20,33,61,0.55)]"
      style={{ backgroundColor: themeColor }}
    >
      {view === 'spine' && (
        <div className="relative flex h-full w-full items-center justify-center">
          <div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-x border-white/20"
            style={{ width: spineWidth(book.pages), backgroundColor: themeColor }}
          >
            <span
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-sm font-semibold tracking-wide text-white"
              style={{ writingMode: 'vertical-rl', transform: 'translate(-50%, -50%) rotate(180deg)' }}
            >
              {book.title}
            </span>
            <span className="absolute inset-x-1 top-4 h-px bg-white/30" />
            <span className="absolute inset-x-1 bottom-4 h-px bg-white/30" />
          </div>
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded bg-black/20 px-2 py-0.5 text-[8px] uppercase tracking-wide text-white/80">
            {spineWidth(book.pages)} px
          </span>
        </div>
      )}

      {view === 'back' && (
        <div className="flex w-full flex-col px-7 py-8 text-[#faf6ef]">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] opacity-60">Rak Kata</p>
          <p className="mt-4 font-display text-xl font-semibold leading-snug">{book.title}</p>
          <p className="mt-1 text-xs opacity-75">{book.author}</p>
          <p className="mt-5 text-[11px] leading-relaxed opacity-80">
            {book.description?.slice(0, 220) || 'Buku pilihan dari rak Rak Kata.'}...
          </p>
          <div className="mt-auto">
            <div className="flex items-end gap-[2px]" aria-hidden>
              {Array.from({ length: 34 }).map((_, index) => (
                <span
                  key={index}
                  className="w-[2px] bg-white/80"
                  style={{ height: `${12 + ((index * 7) % 20)}px` }}
                />
              ))}
            </div>
            <p className="mt-2 text-[9px] tracking-[0.18em] opacity-60">
              ISBN {book.isbn || '—'}
            </p>
          </div>
        </div>
      )}

      {view === 'inside' && (
        <div className="flex w-full bg-[#fbf8f2] text-ink">
          <div className="flex w-1/2 flex-col border-r border-line px-4 py-8">
            <p className="font-display text-[9px] uppercase tracking-[0.2em] text-muted">
              Rak Kata
            </p>
            <p className="mt-10 font-display text-base font-semibold leading-tight text-navy">
              {book.title}
            </p>
            <p className="mt-1 text-[10px] text-muted">{book.author}</p>
            <p className="mt-auto text-[8px] uppercase tracking-wide text-muted/60">
              {book.publisher}
            </p>
          </div>
          <div className="flex w-1/2 flex-col justify-between bg-[#f6f0e5] px-4 py-8">
            <p className="text-[9px] leading-relaxed text-ink/60">
              &ldquo;Halaman demi halaman membawa kita lebih dekat ke pertanyaan yang selama ini
              kita hindari.&rdquo;
            </p>
            <div className="space-y-1" aria-hidden>
              {[92, 84, 96, 70, 88].map((width, index) => (
                <span
                  key={index}
                  className="block h-[2px] rounded-full bg-ink/10"
                  style={{ width: `${width}%` }}
                />
              ))}
            </div>
            <p className="text-[8px] uppercase tracking-[0.16em] text-muted/60">Halaman 1</p>
          </div>
        </div>
      )}
    </div>
  );

  return <div className="[perspective:1000px]">{base}</div>;
}

function MiniPreview({
  book,
  view,
  themeColor,
}: {
  book: BookDetail;
  view: GalleryView;
  themeColor: string;
}) {
  if (view === 'front') {
    return (
      <BookCover
        title={book.title}
        author={book.author}
        coverColor={book.coverColor}
        compact
      />
    );
  }

  if (view === 'spine') {
    return (
      <span className="flex h-full w-full items-center justify-center" style={{ backgroundColor: themeColor }}>
        <span
          className="whitespace-nowrap font-display text-[7px] font-semibold text-white"
          style={{ writingMode: 'vertical-rl' }}
        >
          {book.title}
        </span>
      </span>
    );
  }

  if (view === 'back') {
    return (
      <span
        className="flex h-full w-full flex-col justify-between p-1.5 text-[5px] text-white"
        style={{ backgroundColor: themeColor }}
      >
        <span className="font-semibold leading-tight">{book.title}</span>
        <span className="leading-tight opacity-70">{book.author}</span>
        <span className="flex items-end gap-[1px] opacity-60">
          {Array.from({ length: 10 }).map((_, index) => (
            <span key={index} className="w-px bg-white" style={{ height: 3 + (index % 4) }} />
          ))}
        </span>
      </span>
    );
  }

  return (
    <span className="grid h-full w-full grid-cols-2 bg-[#fbf8f2] text-[5px] text-ink/60">
      <span className="flex flex-col justify-between border-r border-line p-1.5">
        <span className="font-display text-[6px] font-semibold text-navy">{book.title}</span>
        <span>{book.author}</span>
      </span>
      <span className="flex flex-col justify-between bg-[#f6f0e5] p-1.5">
        <span>&ldquo;Halaman buku&rdquo;</span>
        <span className="block h-px w-full bg-ink/10" />
      </span>
    </span>
  );
}

function DetailSkeleton() {
  return (
    <div className="container-editorial py-8 lg:py-12">
      <div className="skeleton h-3 w-56 rounded" />
      <div className="mt-8 grid gap-12 lg:grid-cols-[0.86fr_1.14fr]">
        <div>
          <div className="skeleton mx-auto aspect-[2/3] w-full max-w-[360px] rounded-lg" />
          <div className="mx-auto mt-6 flex max-w-[360px] justify-center gap-2.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton h-20 w-[72px] rounded-md" />
            ))}
          </div>
        </div>
        <div>
          <div className="skeleton h-4 w-28 rounded" />
          <div className="skeleton mt-4 h-12 w-4/5 rounded" />
          <div className="skeleton mt-3 h-5 w-48 rounded" />
          <div className="skeleton mt-6 h-20 w-full rounded" />
          <div className="skeleton mt-6 h-48 w-full rounded-xl" />
          <div className="skeleton mt-6 h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
