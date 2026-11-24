import Link from 'next/link';
import { ArrowRight, RefreshCw, ShieldCheck, Truck } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';

const items = [
  {
    icon: ShieldCheck,
    title: 'Pembayaran aman',
    description: 'QRIS, virtual account, e-wallet, dan gerai retail lewat Xendit.',
  },
  {
    icon: Truck,
    title: 'Kirim ke seluruh Indonesia',
    description: 'JNE, SiCepat, J&T, dan Anteraja dengan tarif yang transparan.',
  },
  {
    icon: RefreshCw,
    title: 'Stok selalu diperbarui',
    description: 'Jumlah di rak sama dengan jumlah yang benar-benar tersedia.',
  },
];

export function TrustBanner() {
  return (
    <section className="relative overflow-hidden bg-navy py-16 text-cream lg:py-20">
      <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-cream/5" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full border border-cream/5" />
      <div className="container-editorial relative">
        <Reveal>
          <div className="flex flex-col justify-between gap-6 border-b border-cream/10 pb-10 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow text-[#F0B7C4]">Tenang dari awal sampai paket tiba</p>
              <h2 className="mt-3 font-display text-[32px] font-semibold leading-[1.02] tracking-tight sm:text-[44px]">
                Belanja dengan tenang, buku sampai dengan selamat.
              </h2>
            </div>
            <Link href="/books" className="btn bg-cream text-navy hover:bg-white">
              Mulai pilih buku
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-9 grid gap-7 md:grid-cols-3">
          {items.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.06}>
              <div className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cream/15 bg-cream/5 text-[#F0B7C4]">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-cream/55">{item.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-cream/10 pt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-cream/35">
            <span>BCA</span><span>Mandiri</span><span>BNI</span><span>BRI</span>
            <span className="h-3 w-px bg-cream/15" />
            <span>OVO</span><span>DANA</span><span>ShopeePay</span><span>QRIS</span>
            <span className="h-3 w-px bg-cream/15" />
            <span>Alfamart</span><span>Indomaret</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
