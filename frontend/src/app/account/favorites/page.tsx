'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Heart, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useToast } from '@/lib/toast-context';
import { cn, formatPrice, stockLabel } from '@/lib/format';
import type { Book } from '@/lib/types';
import { AccountLayout } from '@/components/layout/account-layout';
import { BookCover } from '@/components/books/book-cover';
import { EmptyState } from '@/components/ui/empty-state';
import { useCart } from '@/lib/cart-context';
import type { SakugaButtonElement } from '@/types/sakuga';

export default function AccountFavoritesPage() {
  const { user } = useAuth();
  const { favorites, remove, toggle } = useWishlist();
  const { addItem } = useCart();
  const { success, error } = useToast();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favorites.length === 0) {
      setBooks([]);
      setLoading(false);
      return;
    }
    let active = true;
    const ids = favorites.map(b => b.id).join(',');
    api
      .get<Book[]>(`/books?ids=${ids}`)
      .then(response => {
        if (!active) return;
        setBooks(response.data);
      })
      .catch(() => {
        if (active) setBooks([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [favorites]);

  return (
    <AccountLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Buku Favorit</p>
            <h1 className="mt-2 font-display text-[30px] font-semibold tracking-tight text-navy sm:text-[44px]">
              Daftar bacaan Anda
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              {books.length} buku disimpan · Klik hati untuk menghapus
            </p>
          </div>
          {books.length > 0 && (
            <Link href="/books" className="btn-ghost shrink-0">
              <ArrowRight className="h-4 w-4" />
              Jelajahi katalog
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="skeleton aspect-[2/3] w-full rounded-lg" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <EmptyState
            title="Belum ada buku favorit"
            description="Saat menemukan buku yang Anda sukai, klik ikon hati untuk menyimpannya di sini."
            actionHref="/books"
            actionLabel="Jelajahi katalog"
            icon={<Heart className="h-7 w-7" />}
          />
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
            {books.map(book => (
              <FavoriteCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}

function FavoriteCard({ book }: { book: Book }) {
  const { addItem } = useCart();
  const { has, toggle, remove } = useWishlist();
  const addRef = useRef<SakugaButtonElement | null>(null);
  const stock = stockLabel(book.stock);
  const favorite = has(book.id);

  async function handleAdd() {
    const ok = await addItem(book, 1);
    if (ok) addRef.current?.done();
  }

  return (
    <article className="group relative flex flex-col">
      <div className="relative">
        <Link href={`/book/${book.slug}`} className="block transition duration-500 group-hover:-translate-y-2 group-hover:rotate-[0.6deg]">
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
          className={cn(
            'absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full border border-white/30 bg-cream/90 text-navy shadow-sm backdrop-blur transition hover:scale-105 hover:text-cherry',
            favorite && 'bg-cherry text-white hover:text-white'
          )}
          aria-label={favorite ? 'Hapus dari favorit' : 'Simpan ke favorit'}
        >
          <Heart className={cn('h-4 w-4', favorite && 'fill-current')} />
        </button>

        {book.stock <= 5 && book.stock > 0 && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-warning/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Sisa {book.stock}
          </span>
        )}
        {book.stock <= 0 && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-danger/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Habis
          </span>
        )}
      </div>

      <div className="mt-3.5 flex flex-1 flex-col">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted/80">
            {book.category?.name || 'Buku'}
          </span>
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
            <span className={cn('mt-1 inline-block text-[10px] font-semibold', book.stock <= 0 ? 'text-danger' : book.stock <= 5 ? 'text-warning' : 'text-success')}>
              {stock.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <sakuga-button
              ref={addRef}
              onClick={handleAdd}
              disabled={book.stock <= 0}
              className="sakuga-compact"
            >
              Beli
            </sakuga-button>
            <button
              type="button"
              onClick={() => remove(book.id)}
              className="btn-ghost btn-sm p-1.5"
              aria-label="Hapus dari favorit"
            >
              <Trash2 className="h-4 w-4 text-danger" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}