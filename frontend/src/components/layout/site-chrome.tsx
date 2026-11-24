'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';

const BARE_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isBare = BARE_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));
  const hideChrome = isAdmin || isBare;

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname]);

  if (hideChrome) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-lg focus:bg-cherry focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Lompat ke konten
      </a>
      <Header />
      <main id="konten-utama" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
