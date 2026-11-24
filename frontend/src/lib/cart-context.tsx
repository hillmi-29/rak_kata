'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { useAuth } from './auth-context';
import { useToast } from './toast-context';
import type { Book, CartBook, DisplayCartItem, ServerCart } from './types';

const GUEST_KEY = 'rakkata_guest_cart';

interface GuestLine {
  book: CartBook;
  qty: number;
}

interface CartContextValue {
  items: DisplayCartItem[];
  count: number;
  subtotal: number;
  totalWeight: number;
  loading: boolean;
  isGuest: boolean;
  addItem: (book: Book | CartBook, qty?: number) => Promise<void>;
  updateQty: (item: DisplayCartItem, qty: number) => Promise<void>;
  removeItem: (item: DisplayCartItem) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

function readGuestCart(): GuestLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(GUEST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      line => line && line.book && typeof line.book.id === 'string' && Number(line.qty) > 0
    );
  } catch {
    return [];
  }
}

function writeGuestCart(lines: GuestLine[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(GUEST_KEY, JSON.stringify(lines));
}

function clearGuestCart() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(GUEST_KEY);
}

function toCartBook(book: Book | CartBook): CartBook {
  return {
    id: book.id,
    title: book.title,
    slug: book.slug,
    author: 'author' in book ? book.author : undefined,
    price: book.price,
    stock: book.stock,
    coverImage: book.coverImage ?? null,
    coverColor: 'coverColor' in book ? book.coverColor ?? null : null,
    weight: book.weight,
    isActive: 'isActive' in book ? book.isActive : true,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { success, error } = useToast();
  const [serverCart, setServerCart] = useState<ServerCart | null>(null);
  const [guestLines, setGuestLines] = useState<GuestLine[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get<ServerCart>('/cart');
      setServerCart(response.data);
    } catch {
      setServerCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    let active = true;

    async function sync() {
      if (!user) {
        setGuestLines(readGuestCart());
        setServerCart(null);
        setLoading(false);
        return;
      }

      const guest = readGuestCart();
      if (guest.length > 0) {
        try {
          await api.post('/cart/merge', {
            items: guest.map(line => ({ bookId: line.book.id, qty: line.qty })),
          });
          clearGuestCart();
          if (active) setGuestLines([]);
        } catch {
          // Leave guest cart in place if merging fails.
        }
      }

      try {
        const response = await api.get<ServerCart>('/cart');
        if (active) setServerCart(response.data);
      } catch {
        if (active) setServerCart(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    setLoading(true);
    sync();
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const items = useMemo<DisplayCartItem[]>(() => {
    if (user) {
      return (serverCart?.items || []).map(item => ({ ...item, guest: false }));
    }
    return guestLines.map((line, index) => ({
      id: `guest-${line.book.id}-${index}`,
      bookId: line.book.id,
      qty: line.qty,
      book: line.book,
      subtotal: line.book.price * line.qty,
      isOutOfStock: line.book.stock < line.qty,
      guest: true,
    }));
  }, [user, serverCart, guestLines]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.subtotal, 0), [items]);
  const count = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);
  const totalWeight = useMemo(
    () => items.reduce((sum, item) => sum + (item.book.weight || 300) * item.qty, 0),
    [items]
  );

  const addItem = useCallback(
    async (book: Book | CartBook, qty: number = 1) => {
      if (book.stock <= 0) {
        error('Maaf, stok buku ini sedang habis');
        return;
      }

      if (user) {
        try {
          await api.post('/cart/items', { bookId: book.id, qty });
          await refresh();
          success(`"${book.title}" ditambahkan ke keranjang`);
        } catch (err) {
          error(err instanceof Error ? err.message : 'Gagal menambahkan ke keranjang');
        }
        return;
      }

      const lines = readGuestCart();
      const existing = lines.find(line => line.book.id === book.id);
      const cartBook = toCartBook(book);
      if (existing) {
        const nextQty = existing.qty + qty;
        if (nextQty > book.stock) {
          error(`Stok tersisa ${book.stock}`);
          return;
        }
        existing.qty = nextQty;
      } else {
        if (qty > book.stock) {
          error(`Stok tersisa ${book.stock}`);
          return;
        }
        lines.push({ book: cartBook, qty });
      }
      writeGuestCart(lines);
      setGuestLines(lines);
      success(`"${book.title}" ditambahkan ke keranjang`);
    },
    [user, refresh, success, error]
  );

  const updateQty = useCallback(
    async (item: DisplayCartItem, qty: number) => {
      if (qty < 1) return;
      if (user && !item.guest) {
        try {
          await api.patch(`/cart/items/${item.id}`, { qty });
          await refresh();
        } catch (err) {
          error(err instanceof Error ? err.message : 'Gagal mengubah jumlah');
        }
        return;
      }

      if (qty > item.book.stock) {
        error(`Stok tersisa ${item.book.stock}`);
        return;
      }
      const lines = readGuestCart().map(line =>
        line.book.id === item.bookId ? { ...line, qty } : line
      );
      writeGuestCart(lines);
      setGuestLines(lines);
    },
    [user, refresh, error]
  );

  const removeItem = useCallback(
    async (item: DisplayCartItem) => {
      if (user && !item.guest) {
        try {
          await api.delete(`/cart/items/${item.id}`);
          await refresh();
          success('Buku dihapus dari keranjang');
        } catch (err) {
          error(err instanceof Error ? err.message : 'Gagal menghapus item');
        }
        return;
      }
      const lines = readGuestCart().filter(line => line.book.id !== item.bookId);
      writeGuestCart(lines);
      setGuestLines(lines);
      success('Buku dihapus dari keranjang');
    },
    [user, refresh, success, error]
  );

  const clear = useCallback(async () => {
    if (user) {
      try {
        await api.delete('/cart');
      } catch {
        // ignore
      }
      setServerCart(current => (current ? { ...current, items: [] } : current));
    } else {
      clearGuestCart();
      setGuestLines([]);
    }
    success('Keranjang dikosongkan');
  }, [user, success]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count,
      subtotal,
      totalWeight,
      loading,
      isGuest: !user,
      addItem,
      updateQty,
      removeItem,
      clear,
      refresh,
    }),
    [items, count, subtotal, totalWeight, loading, user, addItem, updateQty, removeItem, clear, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart harus dipakai di dalam CartProvider');
  return context;
}
