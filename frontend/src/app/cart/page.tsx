'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Heart,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { cn, formatPrice } from '@/lib/format';
import { BookCover } from '@/components/books/book-cover';
import { QtyStepper } from '@/components/ui/qty-stepper';

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, count, subtotal, totalWeight, loading, isGuest, updateQty, removeItem, clear } =
    useCart();
  const { has, toggle } = useWishlist();

  const hasOutOfStock = useMemo(() => items.some(item => item.isOutOfStock), [items]);
  const freeShipping = subtotal >= 200000;

  function goToCheckout() {
    if (!user) {
      router.push('/login?redirect=%2Fcheckout');
      return;
    }
    router.push('/checkout');
  }

  if (loading || authLoading) {
    return <CartSkeleton />;
  }

  return (
    <div className="container-editorial py-8 lg:py-12">
      <nav className="flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/" className="transition hover:text-cherry">
          Beranda
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-navy">Keranjang</span>
      </nav>

      <div className="mt-5 flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Keranjang belanja</p>
          <h1 className="mt-2 font-display text-[30px] font-semibold tracking-tight text-navy sm:text-[44px]">
            Buku pilihan Anda
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {count > 0
              ? `${count} buku · ${(totalWeight / 1000).toFixed(1).replace('.', ',')} kg`
              : 'Belum ada buku yang dipilih'}
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-muted transition hover:text-danger sm:self-auto"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Kosongkan keranjang
          </button>
        )}
      </div>

      {isGuest && items.length > 0 && (
        <div className="mt-6 flex flex-col gap-4 rounded-xl border border-cherry/20 bg-cherry/[0.04] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cherry/10 text-cherry">
              <BookOpen className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-navy">Masuk untuk menyimpan keranjangmu</p>
              <p className="text-xs text-muted">
                Keranjang akan tersimpan di akun dan bisa dibuka dari perangkat lain.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/login?redirect=%2Fcart" className="btn-secondary btn-sm">
              Masuk
            </Link>
            <Link href="/register" className="btn-primary btn-sm">
              Daftar
            </Link>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="mt-10 grid items-center gap-10 lg:grid-cols-2">
          <EmptyShelf />
          <div className="max-w-md">
            <span className="badge bg-cherry/10 text-cherry">Rak masih kosong</span>
            <h2 className="mt-4 font-display text-[32px] font-semibold leading-tight text-navy sm:text-[38px]">
              Keranjang Anda belum membawa pulang satu buku pun.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Mulai dari rak yang paling Anda sukai, atau biarkan kami memilihkan sesuatu dari
              daftar buku terlaris bulan ini.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href="/books" className="btn-primary">
                Mulai Belanja
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/books?sort=popular" className="btn-secondary">
                Lihat buku terlaris
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_372px] lg:gap-12">
          <div className="min-w-0">
            <div className="hidden grid-cols-[1fr_auto_auto] gap-4 border-b border-line px-1 pb-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted sm:grid">
              <span>Buku</span>
              <span className="w-36 text-center">Jumlah</span>
              <span className="w-24 text-right">Subtotal</span>
            </div>

            <ul className="divide-y divide-line">
              {items.map(item => {
                const favorite = has(item.bookId);
                return (
                  <li key={item.id} className="py-5 sm:hidden">
                    <div className="flex gap-3">
                      <Link
                        href={`/book/${item.book.slug}`}
                        className="w-[74px] shrink-0 transition hover:-translate-y-0.5"
                      >
                        <BookCover
                          title={item.book.title}
                          author={item.book.author}
                          coverImage={item.book.coverImage}
                          coverColor={item.book.coverColor}
                          compact
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                          {item.book.isActive === false ? 'Tidak tersedia' : 'Buku'}
                        </p>
                        <Link
                          href={`/book/${item.book.slug}`}
                          className="block font-display text-base font-semibold leading-snug text-navy transition hover:text-cherry"
                        >
                          {item.book.title}
                        </Link>
                        <p className="text-xs text-muted">{item.book.author}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-navy">
                            {formatPrice(item.book.price)}
                          </span>
                          {item.book.stock > 0 && item.book.stock <= 5 && (
                            <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold text-[#A86B00]">
                              Stok tersisa {item.book.stock}
                            </span>
                          )}
                          {item.isOutOfStock && (
                            <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-bold text-danger">
                              Melebihi stok tersedia
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <QtyStepper
                              value={item.qty}
                              max={Math.max(1, item.book.stock)}
                              size="sm"
                              onChange={value => updateQty(item, value)}
                            />
                            <button
                              type="button"
                              onClick={() => toggle(item.book)}
                              className={cn(
                                'inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold transition',
                                favorite
                                  ? 'text-cherry'
                                  : 'text-muted hover:text-cherry'
                              )}
                            >
                              <Heart className={cn('h-3.5 w-3.5', favorite && 'fill-current')} />
                              {favorite ? 'Favorit' : 'Simpan'}
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-base font-bold tabular text-navy">
                              {formatPrice(item.subtotal)}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeItem(item)}
                              className="grid h-8 w-8 place-items-center rounded-full text-muted transition hover:bg-danger/10 hover:text-danger"
                              aria-label={`Hapus ${item.book.title} dari keranjang`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <ul className="divide-y divide-line hidden sm:block">
              {items.map(item => {
                const favorite = has(item.bookId);
                return (
                  <li key={item.id} className="py-5">
                    <div className="flex gap-4 sm:gap-5">
                      <Link
                        href={`/book/${item.book.slug}`}
                        className="w-[74px] shrink-0 transition hover:-translate-y-0.5 sm:w-[88px]"
                      >
                        <BookCover
                          title={item.book.title}
                          author={item.book.author}
                          coverImage={item.book.coverImage}
                          coverColor={item.book.coverColor}
                          compact
                        />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                              {item.book.isActive === false ? 'Tidak tersedia' : 'Buku'}
                            </p>
                            <Link
                              href={`/book/${item.book.slug}`}
                              className="mt-0.5 block font-display text-lg font-semibold leading-snug text-navy transition hover:text-cherry"
                            >
                              {item.book.title}
                            </Link>
                            <p className="text-xs text-muted">{item.book.author}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item)}
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-danger/10 hover:text-danger"
                            aria-label={`Hapus ${item.book.title} dari keranjang`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-navy">
                            {formatPrice(item.book.price)}
                          </span>
                          {item.book.stock > 0 && item.book.stock <= 5 && (
                            <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold text-[#A86B00]">
                              Stok tersisa {item.book.stock}
                            </span>
                          )}
                          {item.isOutOfStock && (
                            <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-bold text-danger">
                              Melebihi stok tersedia
                            </span>
                          )}
                        </div>

                        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                          <div className="flex items-center gap-2">
                            <QtyStepper
                              value={item.qty}
                              max={Math.max(1, item.book.stock)}
                              size="sm"
                              onChange={value => updateQty(item, value)}
                            />
                            <button
                              type="button"
                              onClick={() => toggle(item.book)}
                              className={cn(
                                'inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold transition',
                                favorite
                                  ? 'text-cherry'
                                  : 'text-muted hover:text-cherry'
                              )}
                            >
                              <Heart className={cn('h-3.5 w-3.5', favorite && 'fill-current')} />
                              {favorite ? 'Favorit' : 'Simpan'}
                            </button>
                          </div>
                          <p className="text-base font-bold tabular text-navy">
                            {formatPrice(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white/45 px-4 py-3.5">
              <Link
                href="/books"
                className="inline-flex items-center gap-2 text-sm font-semibold text-navy transition hover:text-cherry"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Lanjut belanja
              </Link>
              <p className="text-xs text-muted">
                Butuh bantuan memilih?{' '}
                <Link href="/books?sort=popular" className="font-semibold text-cherry underline-offset-2 hover:underline">
                  Lihat rekomendasi pembaca
                </Link>
              </p>
            </div>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-[104px]">
            <div className="rounded-xl border border-line bg-white/65 p-5 shadow-paper sm:p-6">
              <h2 className="font-display text-xl font-semibold text-navy">Ringkasan pesanan</h2>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Subtotal ({count} buku)</dt>
                  <dd className="font-semibold tabular text-navy">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Estimasi ongkir</dt>
                  <dd className="text-xs text-muted">Dihitung saat checkout</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Diskon / Kupon</dt>
                  <dd className="text-xs text-muted">Masukkan saat checkout</dd>
                </div>
                <div className="border-t border-line pt-3">
                  <div className="flex items-end justify-between">
                    <dt className="font-semibold text-navy">Total sementara</dt>
                    <dd className="font-display text-2xl font-bold tabular text-navy">
                      {formatPrice(subtotal)}
                    </dd>
                  </div>
                  <p className="mt-1 text-right text-[10px] text-muted">Belum termasuk ongkir</p>
                </div>
              </dl>

              <div
                className={cn(
                  'mt-4 flex items-center gap-2 rounded-lg px-3 py-2.5 text-[11px] font-medium',
                  freeShipping ? 'bg-success/10 text-success' : 'bg-cream text-muted'
                )}
              >
                <Truck className="h-3.5 w-3.5 shrink-0" />
                {freeShipping
                  ? 'Selamat! Pesanan Anda memenuhi syarat gratis ongkir.'
                  : `Belanja ${formatPrice(200000 - subtotal)} lagi untuk gratis ongkir.`}
              </div>

              <button
                type="button"
                onClick={goToCheckout}
                disabled={hasOutOfStock}
                className="btn-primary btn-lg mt-4 w-full"
              >
                Lanjut ke Checkout
                <ArrowRight className="h-4 w-4" />
              </button>

              {hasOutOfStock && (
                <p className="mt-2 text-center text-[11px] font-medium text-danger">
                  Sesuaikan jumlah buku yang melebihi stok sebelum melanjutkan.
                </p>
              )}

              {!user && (
                <p className="mt-2 text-center text-[11px] text-muted">
                  Anda akan diarahkan masuk terlebih dahulu.
                </p>
              )}

              <div className="mt-5 space-y-2 border-t border-line pt-4 text-[11px] text-muted">
                <p className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" />
                  Pembayaran diproses aman oleh Xendit
                </p>
                <p className="flex items-center gap-2">
                  <ShoppingBag className="h-3.5 w-3.5 text-cherry" />
                  Buku dikemas dengan pelindung ekstra
                </p>
              </div>
            </div>

            <p className="mt-4 px-2 font-hand text-xl leading-snug text-muted">
              &ldquo;Membeli buku adalah cara paling murah untuk bepergian jauh.&rdquo;
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

function EmptyShelf() {
  const colors = ['#B3173B', '#14213D', '#D9A404', '#2F5D50', '#6B8CAE', '#B4532A'];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-[#f1e7d6] via-cream to-[#fbf8f2] px-8 py-12">
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full border border-navy/5" />
      <div className="relative mx-auto w-full max-w-[300px]">
        <div className="shelf-cabinet !rotate-0 !p-4">
          <div className="shelf-row !mb-0">
            <div className="shelf-books min-h-[128px] items-end gap-2 px-3">
              {[0, 1, 2, 3, 4].map(index => (
                <span
                  key={index}
                  className="block rounded-sm opacity-70"
                  style={{
                    width: index === 2 ? 38 : 22,
                    height: 86 + ((index * 13) % 26),
                    background: `linear-gradient(90deg, color-mix(in srgb, ${colors[index]} 72%, #000), ${colors[index]}, color-mix(in srgb, ${colors[index]} 80%, #fff))`,
                    transform: index === 4 ? 'rotate(9deg) translateY(2px)' : undefined,
                    transformOrigin: 'bottom',
                  }}
                />
              ))}
              <span className="ml-2 block h-10 w-7 rounded-b-sm rounded-t-sm border border-black/10 bg-[#B4532A]" />
            </div>
            <div className="shelf-plank" />
          </div>
          <div className="shelf-dust" />
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-muted">
          <span className="h-px w-8 bg-line" />
          <BookOpen className="h-4 w-4" />
          <span className="h-px w-8 bg-line" />
        </div>
        <p className="mt-2 text-center font-hand text-lg text-muted">
          rak ini menunggu buku pertama
        </p>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="container-editorial py-10">
      <div className="skeleton h-3 w-40 rounded" />
      <div className="skeleton mt-5 h-11 w-72 rounded" />
      <div className="mt-9 grid gap-10 lg:grid-cols-[1fr_372px]">
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-5 border-b border-line pb-5">
              <div className="skeleton aspect-[2/3] w-[88px] rounded" />
              <div className="flex-1">
                <div className="skeleton h-5 w-2/3 rounded" />
                <div className="skeleton mt-2 h-3 w-1/3 rounded" />
                <div className="skeleton mt-5 h-8 w-32 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="skeleton h-80 rounded-xl" />
      </div>
    </div>
  );
}
