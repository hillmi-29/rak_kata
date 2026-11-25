import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { SiteChrome } from '@/components/layout/site-chrome';

export const metadata: Metadata = {
  title: {
    default: 'Rak Kata — Toko Buku Indonesia',
    template: '%s · Rak Kata',
  },
  description:
    'Toko buku independen untuk pembaca Indonesia. Temukan fiksi, sastra, non-fiksi, buku bisnis, dan cerita anak pilihan dengan pengiriman ke seluruh Indonesia.',
  keywords: ['toko buku online', 'beli buku', 'buku Indonesia', 'novel', 'sastra'],
  openGraph: {
    title: 'Rak Kata — Toko Buku Indonesia',
    description: 'Pilih buku dari rak, baca sinopsisnya sebelum membawanya pulang.',
    type: 'website',
    locale: 'id_ID',
  },
};

export const viewport: Viewport = {
  themeColor: '#FAF6EF',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Fraunces:opsz,wght@9..144,300..900&family=Source+Sans+3:wght@300..700&display=swap"
          rel="stylesheet"
        />
        <script src="/button.js" defer />
        <script src="/sakuga-theme.js" defer />
      </head>
      <body>
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
