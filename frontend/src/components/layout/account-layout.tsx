'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, LogOut, Menu, Package, User, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { cn } from '@/lib/format';

const NAV_ITEMS = [
  { href: '/account', label: 'Profil', icon: User },
  { href: '/account/orders', label: 'Pesanan Saya', icon: Package },
  { href: '/account/favorites', label: 'Buku Favorit', icon: User },
  { href: '/account/addresses', label: 'Alamat Pengiriman', icon: User },
];

export function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream">
      <a
        href="#account-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-lg focus:bg-cherry focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Lompat ke konten
      </a>

      <header className="sticky top-0 z-50 border-b border-line bg-cream/95 backdrop-blur-md">
        <div className="container-editorial">
          <div className="flex h-[70px] items-center gap-4">
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
              </span>
              <span className="leading-none">
                <span className="block font-display text-[23px] font-bold tracking-tight text-navy">Rak Kata</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
              <Link href="/books" className="px-3 py-2 text-sm font-semibold text-navy/80 transition hover:text-cherry">
                Katalog
              </Link>
              <Link href="/cart" className="relative px-3 py-2 text-sm font-semibold text-navy/80 transition hover:text-cherry">
                <span className="flex items-center gap-1.5">
                  Keranjang
                  {count > 0 && (
                    <span className="absolute -top-1 right-1 h-4 min-w-4 grid place-items-center rounded-full bg-cherry px-1 text-[9px] font-bold text-white">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </span>
              </Link>
            </nav>

            <div className="ml-auto flex items-center gap-2 md:ml-0">
              <Link
                href="/account"
                className="grid h-10 w-10 place-items-center rounded-lg text-navy transition hover:bg-navy/5 hover:text-cherry hidden sm:grid"
                aria-label="Akun saya"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-navy text-[10px] font-bold text-cream">
                  {user?.name
                    .split(' ')
                    .slice(0, 2)
                    .map(part => part[0])
                    .join('')
                    .toUpperCase()}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container-editorial py-6 sm:py-8 lg:py-12">
        <nav
          className="mb-6 flex gap-2 overflow-x-auto pb-1 hide-scrollbar lg:hidden"
          aria-label="Navigasi akun mobile"
        >
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active =
              item.href === '/account'
                ? pathname === '/account'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition',
                  active
                    ? 'border-cherry bg-cherry text-white'
                    : 'border-line bg-white/70 text-navy/80 hover:border-navy/30'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-[92px]">
              <div className="rounded-xl border border-line bg-white/60 p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy font-display text-xl font-bold text-cream">
                    {user?.name
                      .split(' ')
                      .slice(0, 2)
                      .map(part => part[0])
                      .join('')
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-navy truncate">{user?.name}</p>
                    <p className="text-sm text-muted truncate">{user?.email}</p>
                    {user?.role === 'ADMIN' && (
                      <Link
                        href="/admin/dashboard"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-cherry transition hover:underline"
                      >
                        <ChevronRight className="h-3 w-3" />
                        Panel Admin
                      </Link>
                    )}
                  </div>
                </div>

                <nav className="mt-5 space-y-1" aria-label="Navigasi akun">
                  {NAV_ITEMS.map(item => {
                    const Icon = item.icon;
                    const active =
                      item.href === '/account'
                        ? pathname === '/account'
                        : pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition',
                          active ? 'bg-cherry/5 text-cherry' : 'text-navy/80 hover:bg-white hover:text-cherry'
                        )}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className={cn('h-4 w-4 shrink-0', active && 'text-cherry')} />
                        {item.label}
                        {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cherry" />}
                      </Link>
                    );
                  })}
                </nav>

                <button
                  type="button"
                  onClick={logout}
                  className="mt-5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/5"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            </div>
          </aside>

          <main id="account-content" className="min-h-[500px] min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {mobileOpen && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] lg:hidden"
          >
            <button
              type="button"
              className="absolute inset-0 bg-navy/40 backdrop-blur-[2px]"
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-cream shadow-lift"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <span className="font-display text-xl font-bold text-navy">Akun Saya</span>
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
                <div className="mb-5 rounded-xl border border-line bg-white/70 p-4">
                  <p className="text-sm font-semibold text-navy">Halo, {user?.name.split(' ')[0]}</p>
                  <p className="truncate text-xs text-muted">{user?.email}</p>
                </div>
                <nav className="space-y-1">
                  {NAV_ITEMS.map(item => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold',
                          active ? 'bg-cherry/5 text-cherry' : 'text-navy/80 hover:bg-white'
                        )}
                      >
                        <Icon className={cn('h-5 w-5', active && 'text-cherry')} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <button
                  type="button"
                  onClick={logout}
                  className="mt-6 btn-danger w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}