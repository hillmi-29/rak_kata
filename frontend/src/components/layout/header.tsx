'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User as UserIcon,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { cn } from '@/lib/format';
import type { Category } from '@/lib/types';

const fallbackCategories = [
  { id: '1', name: 'Fiksi', slug: 'fiksi' },
  { id: '2', name: 'Sastra', slug: 'sastra' },
  { id: '3', name: 'Non-Fiksi', slug: 'non-fiksi' },
  { id: '4', name: 'Pengembangan Diri', slug: 'pengembangan-diri' },
  { id: '5', name: 'Bisnis', slug: 'bisnis' },
  { id: '6', name: 'Anak', slug: 'anak' },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { count } = useCart();
  const { count: favoriteCount } = useWishlist();
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Pick<Category, 'id' | 'name' | 'slug'>[]>(fallbackCategories);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    api
      .get<Category[]>('/categories')
      .then(response => {
        if (active && response.data.length > 0) setCategories(response.data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setCategoryOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoryOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const accountHref = useMemo(() => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/account';
  }, [user]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/books?search=${encodeURIComponent(trimmed)}` : '/books');
    setMobileOpen(false);
  }

  return (
    <>
      <div className="bg-navy text-cream">
        <div className="container-editorial flex h-9 items-center justify-between gap-4 text-[11px] font-medium tracking-wide">
          <p className="truncate text-cream/85">
            Gratis ongkir untuk pesanan di atas Rp 200.000 · Kirim ke seluruh Indonesia
          </p>
          <p className="hidden shrink-0 items-center gap-2 text-cream/65 sm:flex">
            Kode baru: <span className="rounded-sm bg-cherry px-1.5 py-0.5 font-bold text-white">RAKKATA10</span>
          </p>
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-50 border-b border-line/80 bg-cream/95 backdrop-blur-md transition-shadow',
          scrolled && 'shadow-[0_12px_30px_-24px_rgba(20,33,61,0.45)]'
        )}
      >
        <div className="container-editorial">
          <div className="flex h-[70px] items-center gap-4 lg:gap-7">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="-ml-2 grid h-10 w-10 place-items-center rounded-lg text-navy transition hover:bg-navy/5 lg:hidden"
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="Rak Kata - Beranda">
              <span className="relative grid h-10 w-10 place-items-center rounded-lg bg-cherry text-cream shadow-[0_8px_18px_-10px_rgba(179,23,59,0.9)]">
                <span className="font-display text-lg font-bold leading-none">R</span>
                <span className="absolute bottom-[7px] left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-cream/60" />
              </span>
              <span className="leading-none">
                <span className="block font-display text-[23px] font-bold tracking-tight text-navy">Rak Kata</span>
                <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.26em] text-muted">
                  Toko Buku Indonesia
                </span>
              </span>
            </Link>

            <nav className="hidden items-center gap-5 text-[13px] font-semibold text-navy/80 lg:flex" aria-label="Navigasi utama">
              <Link href="/" className="py-2 transition hover:text-cherry">
                Beranda
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setCategoryOpen(value => !value)}
                  className="flex items-center gap-1 py-2 transition hover:text-cherry"
                  aria-expanded={categoryOpen}
                >
                  Kategori
                  <ChevronDown className={cn('h-3.5 w-3.5 transition', categoryOpen && 'rotate-180')} />
                </button>
                {categoryOpen && (
                  <div className="absolute left-1/2 top-full z-50 w-[430px] -translate-x-1/2 rounded-xl border border-line bg-cream p-2 shadow-lift">
                    <div className="grid grid-cols-2 gap-1">
                      {categories.map(category => (
                        <Link
                          key={category.id}
                          href={`/books?category=${category.slug}`}
                          onClick={() => setCategoryOpen(false)}
                          className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition hover:bg-white"
                        >
                          <span className="text-sm font-medium text-navy group-hover:text-cherry">{category.name}</span>
                          <span className="text-[10px] text-muted opacity-0 transition group-hover:opacity-100">Lihat →</span>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/books"
                      onClick={() => setCategoryOpen(false)}
                      className="mt-1 block rounded-lg bg-navy px-3 py-2.5 text-center text-xs font-semibold text-cream transition hover:bg-navy-light"
                    >
                      Jelajahi semua buku
                    </Link>
                  </div>
                )}
              </div>
              <Link href="/books?sort=newest" className="py-2 transition hover:text-cherry">
                Terbaru
              </Link>
              <Link href="/books?sort=popular" className="py-2 transition hover:text-cherry">
                Terlaris
              </Link>
              <Link href="/books?view=shelf" className="flex items-center gap-1.5 py-2 transition hover:text-cherry">
                Rak 3D
                <span className="rounded-sm bg-cherry/10 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-cherry">
                  Baru
                </span>
              </Link>
            </nav>

            <form onSubmit={submitSearch} className="relative ml-auto hidden max-w-[300px] flex-1 md:block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Cari judul, penulis, atau ISBN"
                className="h-10 w-full rounded-full border border-line bg-white/80 pl-10 pr-4 text-[13px] text-ink outline-none transition placeholder:text-muted/65 focus:border-cherry focus:ring-4 focus:ring-cherry/10"
                aria-label="Cari buku"
              />
            </form>

            <div className="ml-auto flex items-center gap-0.5 md:ml-0">
              <Link
                href="/account/favorites"
                className="relative hidden h-10 w-10 place-items-center rounded-lg text-navy transition hover:bg-navy/5 hover:text-cherry sm:grid"
                aria-label="Buku favorit"
              >
                <Heart className="h-[19px] w-[19px]" />
                {favoriteCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-cherry px-1 text-[9px] font-bold text-white">
                    {favoriteCount}
                  </span>
                )}
              </Link>
              <Link
                href={accountHref}
                className="grid h-10 w-10 place-items-center rounded-lg text-navy transition hover:bg-navy/5 hover:text-cherry"
                aria-label={user ? 'Akun saya' : 'Masuk'}
              >
                {user ? (
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-navy text-[10px] font-bold text-cream">
                    {user.name
                      .split(' ')
                      .slice(0, 2)
                      .map(part => part[0])
                      .join('')
                      .toUpperCase()}
                  </span>
                ) : (
                  <UserIcon className="h-[19px] w-[19px]" />
                )}
              </Link>
              <Link
                href="/cart"
                className="relative grid h-10 w-10 place-items-center rounded-lg text-navy transition hover:bg-navy/5 hover:text-cherry"
                aria-label={`Keranjang, ${count} item`}
              >
                <ShoppingBag className="h-[19px] w-[19px]" />
                {count > 0 && (
                  <span className="absolute right-0 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-cherry px-1 text-[9px] font-bold text-white">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <form onSubmit={submitSearch} className="relative pb-3 md:hidden">
            <Search className="pointer-events-none absolute left-3.5 top-[18px] h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Cari judul, penulis, atau ISBN"
              className="h-10 w-full rounded-full border border-line bg-white/85 pl-10 pr-4 text-[13px] outline-none focus:border-cherry focus:ring-4 focus:ring-cherry/10"
              aria-label="Cari buku"
            />
          </form>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-navy/40 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup menu"
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-cream shadow-lift">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="font-display text-xl font-bold text-navy">Rak Kata</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-navy/5"
                aria-label="Tutup menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {user && (
                <div className="mb-5 rounded-xl border border-line bg-white/70 p-4">
                  <p className="text-sm font-semibold text-navy">Halo, {user.name.split(' ')[0]}</p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                  <div className="mt-3 flex gap-2">
                    <Link href="/account" className="btn-secondary btn-sm flex-1">
                      Akun
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link href="/admin/dashboard" className="btn-dark btn-sm flex-1">
                        Admin
                      </Link>
                    )}
                  </div>
                </div>
              )}
              <p className="eyebrow-navy mb-2">Jelajahi</p>
              <nav className="mb-6 flex flex-col">
                <Link href="/" onClick={() => setMobileOpen(false)} className="border-b border-line py-3 text-sm font-semibold text-navy">
                  Beranda
                </Link>
                <Link href="/books" onClick={() => setMobileOpen(false)} className="border-b border-line py-3 text-sm font-semibold text-navy">
                  Semua Buku
                </Link>
                <Link href="/books?sort=newest" onClick={() => setMobileOpen(false)} className="border-b border-line py-3 text-sm font-semibold text-navy">
                  Baru Terbit
                </Link>
                <Link href="/books?sort=popular" onClick={() => setMobileOpen(false)} className="border-b border-line py-3 text-sm font-semibold text-navy">
                  Buku Terlaris
                </Link>
                <Link href="/books?view=shelf" onClick={() => setMobileOpen(false)} className="border-b border-line py-3 text-sm font-semibold text-navy">
                  Rak Buku 3D
                </Link>
              </nav>
              <p className="eyebrow-navy mb-2">Kategori</p>
              <nav className="flex flex-col">
                {categories.map(category => (
                  <Link
                    key={category.id}
                    href={`/books?category=${category.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="border-b border-line/70 py-2.5 text-sm text-ink/80"
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 flex flex-col gap-2">
                {!user && (
                  <>
                    <Link href="/login" className="btn-primary">
                      Masuk
                    </Link>
                    <Link href="/register" className="btn-secondary">
                      Daftar akun
                    </Link>
                  </>
                )}
                <Link href="/cart" className="btn-ghost">
                  Keranjang ({count})
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
