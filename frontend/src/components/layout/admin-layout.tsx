'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import {
  BarChart2,
  BookOpen,
  ChevronRight,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Truck,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/format';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/books', label: 'Kelola Buku', icon: BookOpen },
  { href: '/admin/orders', label: 'Kelola Pesanan', icon: Package },
  { href: '/admin/users', label: 'Pengguna', icon: Users },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-cream">
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-line bg-navy transition-all duration-300 lg:flex',
          collapsed ? 'w-16' : 'w-64'
        )}
        aria-label="Admin navigation"
      >
        <div className="flex h-[70px] items-center justify-between border-b border-navy-light px-4">
          {!collapsed && (
            <Link href="/admin/dashboard" className="flex items-center gap-2.5" aria-label="Rak Kata Admin">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-cherry font-display text-lg font-bold text-cream">R</span>
              <span className="font-display text-xl font-bold text-cream">Rak Kata</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(c => !c)}
            className="grid h-9 w-9 place-items-center rounded-lg text-cream/70 transition hover:bg-white/10"
            aria-label={collapsed ? 'Perluas sidebar' : 'Lipat sidebar'}
          >
            {collapsed ? <ChevronRight className="h-5 w-5 rotate-180" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Navigasi admin">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 transition',
                  active
                    ? 'bg-cherry/10 text-cherry'
                    : 'text-cream/80 hover:bg-white/5 hover:text-cream'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className={cn('h-5 w-5 shrink-0', active && 'text-cherry')} />
                {!collapsed && <span className="font-semibold">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-navy-light p-4">
          {!collapsed ? (
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-cream/80 transition hover:bg-white/5 hover:text-cream"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-semibold">Keluar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={logout}
              className="mx-auto grid h-9 w-9 place-items-center rounded-lg text-cream/80 transition hover:bg-white/5 hover:text-cream"
              aria-label="Keluar"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>

      <div className={cn('min-w-0 transition-all duration-300', collapsed ? 'lg:ml-16' : 'lg:ml-64')}>
        <header className="sticky top-0 z-30 border-b border-line bg-cream/95 backdrop-blur-md">
          <div className="flex h-[70px] items-center justify-between gap-4 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="-ml-2 grid h-10 w-10 place-items-center rounded-lg text-navy transition hover:bg-navy/5 lg:hidden"
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden items-center gap-4 lg:flex">
              <Link href="/" className="text-sm font-semibold text-muted transition hover:text-cherry">
                Lihat toko
              </Link>
              <span className="h-5 w-px bg-line" />
              <span className="text-sm text-muted">Admin Panel</span>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <span className="hidden text-sm text-muted lg:block">
                {user?.name}
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-cherry font-display text-sm font-bold text-cream">
                {user?.name
                  .split(' ')
                  .slice(0, 2)
                  .map(part => part[0])
                  .join('')
                  .toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 lg:ml-0">
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

      {mobileOpen && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-navy shadow-lift"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-navy-light px-4 py-4">
                <Link href="/admin/dashboard" className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-cherry font-display text-lg font-bold text-cream">R</span>
                  <span className="font-display text-xl font-bold text-cream">Rak Kata</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-lg text-cream/70 transition hover:bg-white/10"
                  aria-label="Tutup menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {NAV_ITEMS.map(item => {
                  const Icon = item.icon;
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 transition',
                        active
                          ? 'bg-cherry/10 text-cherry'
                          : 'text-cream/80 hover:bg-white/5 hover:text-cream'
                      )}
                    >
                      <Icon className={cn('h-5 w-5', active && 'text-cherry')} />
                      <span className="font-semibold">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-navy-light p-4">
                <button
                  type="button"
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-cream/80 transition hover:bg-white/5 hover:text-cream"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-semibold">Keluar</span>
                </button>
              </div>
            </motion.aside>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}