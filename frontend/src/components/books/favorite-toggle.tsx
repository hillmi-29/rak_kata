'use client';

import { useEffect, useRef } from 'react';
import { useWishlist } from '@/lib/wishlist-context';
import { cn } from '@/lib/format';
import type { Book } from '@/lib/types';
import type { SakugaCheckboxElement } from '@/types/sakuga';

interface FavoriteToggleProps {
  book: Book;
  variant?: 'icon' | 'wide';
  className?: string;
}

/**
 * Favorite control backed by <sakuga-checkbox>.
 * The checkbox is the real control; CSS turns its box into a heart.
 */
export function FavoriteToggle({ book, variant = 'icon', className }: FavoriteToggleProps) {
  const { has, toggle } = useWishlist();
  const ref = useRef<SakugaCheckboxElement | null>(null);
  const favorite = has(book.id);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onChange = () => {
      if (el.checked !== favorite) toggle(book);
    };
    el.addEventListener('change', onChange);
    return () => el.removeEventListener('change', onChange);
  }, [book, favorite, toggle]);

  // Keep the checkbox in sync when the wishlist changes elsewhere.
  useEffect(() => {
    const el = ref.current;
    if (!el || !customElements.get('sakuga-checkbox')) return;
    if (el.checked !== favorite) el.checked = favorite;
  }, [favorite]);

  return (
    <sakuga-checkbox
      ref={ref}
      checked={favorite}
      className={cn(
        'fav-toggle',
        variant === 'icon' ? 'fav-toggle-icon' : 'fav-toggle-wide',
        favorite && 'is-fav',
        className
      )}
    >
      {variant === 'icon' ? (
        <span className="sr-only">{favorite ? 'Hapus dari favorit' : 'Simpan ke favorit'}</span>
      ) : (
        <span>{favorite ? 'Tersimpan di favorit' : 'Simpan ke favorit'}</span>
      )}
    </sakuga-checkbox>
  );
}
