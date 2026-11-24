'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useToast } from './toast-context';
import type { Book, WishlistBook, CartBook } from './types';

const WISHLIST_KEY = 'rakkata_wishlist';

interface WishlistContextValue {
  favorites: WishlistBook[];
  count: number;
  has: (bookId: string) => boolean;
  toggle: (book: Book | WishlistBook | CartBook) => void;
  remove: (bookId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readWishlist(): WishlistBook[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(WISHLIST_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWishlist(books: WishlistBook[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(books));
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<WishlistBook[]>([]);
  const { success, info } = useToast();

  useEffect(() => {
    setFavorites(readWishlist());
  }, []);

  const has = useCallback((bookId: string) => favorites.some(book => book.id === bookId), [favorites]);

  const toggle = useCallback(
    (book: Book | WishlistBook | CartBook) => {
      const current = readWishlist();
      const exists = current.some(item => item.id === book.id);
      const next = exists
        ? current.filter(item => item.id !== book.id)
        : [
            ...current,
            {
              id: book.id,
              title: book.title,
              slug: book.slug,
              author: 'author' in book ? (book.author || '') : '',
              price: book.price,
              coverImage: book.coverImage ?? null,
              coverColor: book.coverColor ?? null,
              averageRating: 'averageRating' in book ? book.averageRating : undefined,
            },
          ];
      writeWishlist(next);
      setFavorites(next);
      if (exists) info('Dihapus dari buku favorit');
      else success('Ditambahkan ke buku favorit');
    },
    [success, info]
  );

  const remove = useCallback((bookId: string) => {
    const next = readWishlist().filter(item => item.id !== bookId);
    writeWishlist(next);
    setFavorites(next);
  }, []);

  const value = useMemo<WishlistContextValue>(
    () => ({ favorites, count: favorites.length, has, toggle, remove }),
    [favorites, has, toggle, remove]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist harus dipakai di dalam WishlistProvider');
  return context;
}
