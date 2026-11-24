'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { useToast } from '@/lib/toast-context';

const footerCategories = [
  { name: 'Fiksi', slug: 'fiksi' },
  { name: 'Sastra', slug: 'sastra' },
  { name: 'Non-Fiksi', slug: 'non-fiksi' },
  { name: 'Pengembangan Diri', slug: 'pengembangan-diri' },
  { name: 'Bisnis', slug: 'bisnis' },
  { name: 'Anak', slug: 'anak' },
];

const paymentMethods = ['BCA', 'Mandiri', 'BNI', 'BRI', 'OVO', 'DANA', 'ShopeePay', 'QRIS', 'Alfamart', 'Indomaret'];

export function Footer() {
  const [email, setEmail] = useState('');
  const { success, error } = useToast();

  function subscribe(event: React.FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error('Masukkan alamat email yang valid');
      return;
    }
    success('Terima kasih! Surat kabar buku kami akan segera hadir di inbox Anda.');
    setEmail('');
  }

  return (
    <footer className="relative overflow-hidden bg-navy text-cream">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full border border-cream/5" />
      <div className="pointer-events-none absolute -right-16 -top-24 h-96 w-96 rounded-full border border-cream/5" />

      <div className="container-editorial relative py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.7fr_0.7fr_1.3fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-cherry font-display text-lg font-bold text-cream">
                R
              </span>
              <span>
                <span className="block font-display text-2xl font-bold leading-none">Rak Kata</span>
                <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.26em] text-cream/50">
                  Toko Buku Indonesia
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/65">
              Ruang kecil untuk pembaca yang percaya bahwa buku masih bisa mengubah cara kita melihat dunia.
            </p>
            <div className="mt-6 space-y-2.5 text-sm text-cream/70">
              <p className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-cherry" />
                Jl. Cendana No. 17, Jakarta Pusat
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-cherry" />
                0812-3456-7890
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-cherry" />
                halo@rakkata.id
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-display text-lg font-semibold">Jelajahi</h3>
            <ul className="space-y-2.5 text-sm text-cream/65">
              {footerCategories.map(category => (
                <li key={category.slug}>
                  <Link href={`/books?category=${category.slug}`} className="transition hover:text-cream">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-display text-lg font-semibold">Bantuan</h3>
            <ul className="space-y-2.5 text-sm text-cream/65">
              <li><Link href="/books" className="transition hover:text-cream">Cara Berbelanja</Link></li>
              <li><Link href="/account/orders" className="transition hover:text-cream">Lacak Pesanan</Link></li>
              <li><Link href="/account/addresses" className="transition hover:text-cream">Pengiriman</Link></li>
              <li><Link href="/login" className="transition hover:text-cream">Akun Saya</Link></li>
              <li><Link href="/faq" className="transition hover:text-cream">Pertanyaan Umum</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold">Surat dari rak kami</h3>
            <p className="mt-2 text-sm leading-relaxed text-cream/60">
              Rekomendasi buku, catatan editor, dan kabar promo. Sekali sebulan, tanpa spam.
            </p>
            <form onSubmit={subscribe} className="mt-4 flex overflow-hidden rounded-lg border border-cream/15 bg-cream/5">
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="Email Anda"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-cream outline-none placeholder:text-cream/40"
                aria-label="Alamat email untuk newsletter"
              />
              <button
                type="submit"
                className="grid w-12 place-items-center bg-cherry text-white transition hover:bg-cherry-dark"
                aria-label="Berlangganan"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mb-2 mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-cream/40">
              Pembayaran aman
            </p>
            <div className="flex flex-wrap gap-1.5">
              {paymentMethods.map(method => (
                <span
                  key={method}
                  className="rounded border border-cream/12 bg-cream/5 px-2 py-1 text-[10px] font-semibold text-cream/60"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-cream/10 pt-6 text-[11px] text-cream/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Rak Kata. Dibuat dengan tenang di Jakarta.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/faq" className="transition hover:text-cream/80">Kebijakan Privasi</Link>
            <Link href="/faq" className="transition hover:text-cream/80">Syarat & Ketentuan</Link>
            <span>Buku adalah jendela dunia.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
