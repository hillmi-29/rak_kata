'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Heart, Plus } from 'lucide-react';
import { BookCover } from './book-cover';
import { Rating } from '@/components/ui/rating';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { cn, formatPrice, stockLabel } from '@/lib/format';
import type { Book } from '@/lib/types';
import type { SakugaButtonElement } from '@/types/sakuga';

interface BookCardProps {
  book: Book;
  className?: string;
  showStock?: boolean;
}

export function BookCard({ book, className, showStock = true }: BookCardProps) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const addRef = useRef<SakugaButtonElement | null>(null);
  const addMobileRef = useRef<SakugaButtonElement | null>(null);
  const stock = stockLabel(book.stock);
  const favorite = has(book.id);

  async function handleAdd(target: 'desktop' | 'mobile') {
    const ok = await addItem(book, 1);
    if (!ok) return;
    (target === 'desktop' ? addRef : addMobileRef).current?.done();
  }

  return (
    <article className={cn('group relative flex flex-col', className)}>
      <div className="relative">
        <Link
          href={`/book/${book.slug}`}
          className="block transition duration-500 ease-out group-hover:-translate-y-2 group-hover:rotate-[0.6deg]"
          aria-label={`Lihat detail ${book.title}`}
        >
          <BookCover
            title={book.title}
            author={book.author}
            coverImage={book.coverImage}
            coverColor={book.coverColor}
            publisher={book.publisher}
            category={book.category?.name}
            className="transition-shadow duration-500 group-hover:shadow-cover"
          />
        </Link>

        <button
          type="button"
          onClick={() => toggle(book)}
          aria-label={favorite ? 'Hapus dari favorit' : 'Simpan ke favorit'}
          className={cn(
            'absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full border border-white/30 bg-cream/90 text-navy shadow-sm backdrop-blur transition hover:scale-105 hover:text-cherry',
            favorite && 'bg-cherry text-white hover:text-white'
          )}
        >
          <Heart className={cn('h-4 w-4', favorite && 'fill-current')} />
        </button>

        {showStock && book.stock <= 5 && (
          <span
            className={cn(
              'absolute left-2.5 top-2.5 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm backdrop-blur',
              book.stock <= 0 ? 'bg-danger text-white' : 'bg-warning text-white'
            )}
          >
            {book.stock <= 0 ? 'Habis' : `Sisa ${book.stock}`}
          </span>
        )}

        {book.stock > 0 && (
          <div className="absolute bottom-3 left-1/2 z-10 hidden w-[calc(100%-1.5rem)] -translate-x-1/2 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:block">
            <sakuga-button
              ref={addRef}
              onClick={() => handleAdd('desktop')}
              disabled={book.stock <= 0}
              className="sakuga-compact sakuga-full"
            >
              Tambah ke Keranjang
            </sakuga-button>
          </div>
        )}
      </div>

      <div className="mt-3.5 flex flex-1 flex-col">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted/80">
            {book.category?.name || 'Buku'}
          </span>
          <Rating value={book.averageRating} count={book.reviewCount} />
        </div>
        <Link href={`/book/${book.slug}`} className="group/title">
          <h3 className="font-display text-[17px] font-semibold leading-snug text-navy transition group-hover/title:text-cherry">
            {book.title}
          </h3>
        </Link>
        <p className="mt-0.5 text-[13px] text-muted">{book.author}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
          <div>
            <p className="tabular text-[15px] font-bold text-navy">{formatPrice(book.price)}</p>
            {showStock && (
              <span className={cn('mt-1 inline-block text-[10px] font-semibold', book.stock <= 0 ? 'text-danger' : book.stock <= 5 ? 'text-warning' : 'text-success')}>
                {stock.label}
              </span>
            )}
          </div>
          <sakuga-button
            ref={addMobileRef}
            onClick={() => handleAdd('mobile')}
            disabled={book.stock <= 0}
            aria-label={`Tambah ${book.title} ke keranjang`}
            className="sakuga-icon shrink-0 sm:hidden"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Tambah {book.title} ke keranjang</span>
          </sakuga-button>
        </div>
      </div>
    </article>
  );
}

export function BookCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[2/3] w-full rounded-lg" />
      <div className="skeleton mt-4 h-3 w-1/3 rounded" />
      <div className="skeleton mt-2 h-4 w-4/5 rounded" />
      <div className="skeleton mt-2 h-3 w-1/2 rounded" />
      <div className="skeleton mt-3 h-4 w-1/3 rounded" />
    </div>
  );
}
