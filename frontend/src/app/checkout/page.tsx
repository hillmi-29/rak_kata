'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  ChevronRight,
  Check,
  Circle,
  Copy,
  CreditCard,
  Edit,
  Heart,
  Loader2,
  MapPin,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
  Wallet,
  RotateCcw,
} from 'lucide-react';
import { api, queryString } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/lib/toast-context';
import { cn, formatPrice, stockLabel } from '@/lib/format';
import type { Address, Book, Order } from '@/lib/types';
import { BookCover } from '@/components/books/book-cover';
import { Modal } from '@/components/ui/modal';
import { QtyStepper } from '@/components/ui/qty-stepper';

const COURIER_OPTIONS = [
  { value: 'jne', label: 'JNE', services: ['REG', 'YES', 'OKE'] },
  { value: 'sicepat', label: 'SiCepat', services: ['GOKIL', 'SIUNTUNG'] },
  { value: 'jnt', label: 'J&T Express', services: ['EZ', 'ECO'] },
  { value: 'anteraja', label: 'AnterAja', services: ['REG', 'NEXTDAY'] },
];

const PAYMENT_GROUPS = [
  {
    label: 'E-Wallet',
    icon: Wallet,
    methods: [
      { id: 'ovo', label: 'OVO', channel: 'OVO' },
      { id: 'dana', label: 'DANA', channel: 'DANA' },
      { id: 'shopeepay', label: 'ShopeePay', channel: 'SHOPEEPAY' },
      { id: 'linkaja', label: 'LinkAja', channel: 'LINKAJA' },
    ],
  },
  {
    label: 'Virtual Account',
    icon: CreditCard,
    methods: [
      { id: 'va_bca', label: 'BCA Virtual Account', channel: 'BCA' },
      { id: 'va_mandiri', label: 'Mandiri Virtual Account', channel: 'MANDIRI' },
      { id: 'va_bni', label: 'BNI Virtual Account', channel: 'BNI' },
      { id: 'va_bri', label: 'BRI Virtual Account', channel: 'BRI' },
      { id: 'va_permata', label: 'Permata Virtual Account', channel: 'PERMATA' },
    ],
  },
  {
    label: 'QRIS',
    icon: Heart,
    methods: [{ id: 'qris', label: 'QRIS (Semua Aplikasi)', channel: 'QRIS' }],
  },
  {
    label: 'Gerai Retail',
    icon: Package,
    methods: [
      { id: 'alfamart', label: 'Alfamart', channel: 'ALFAMART' },
      { id: 'indomaret', label: 'Indomaret', channel: 'INDOMARET' },
    ],
  },
  {
    label: 'Kartu Kredit / Debit',
    icon: CreditCard,
    methods: [{ id: 'card', label: 'Kartu Kredit / Debit', channel: 'CARD' }],
  },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { items, subtotal, totalWeight, loading: cartLoading, clear } = useCart();
  const { success, error } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [newAddressModal, setNewAddressModal] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('ovo');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent('/checkout')}`);
      return;
    }
    loadAddresses();
    if (items.length > 0) {
      loadShippingRates();
    }
  }, [user, items.length]);

  const loadAddresses = async () => {
    try {
      const response = await api.get<Address[]>('/addresses');
      setAddresses(response.data);
      const defaultAddr = response.data.find(a => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (response.data.length > 0) setSelectedAddressId(response.data[0].id);
    } catch {
      error('Gagal memuat alamat');
    }
  };

  const loadShippingRates = async () => {
    const address = addresses.find(a => a.id === selectedAddressId);
    if (!address?.cityId) return;

    setShippingLoading(true);
    try {
      const response = await api.post<ShippingRate[]>('/shipping/rates', {
        cityId: address.cityId,
        weight: totalWeight,
        courier: 'jne',
      });
      setShippingRates(response.data);
      if (response.data.length > 0 && !selectedRate) {
        setSelectedRate(response.data[0]);
      }
    } catch {
      setShippingRates([]);
    } finally {
      setShippingLoading(false);
    }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponValidating(true);
    try {
      const response = await api.post<{ valid: boolean; discount: number; message: string }>('/coupons/validate', {
        code: couponCode.trim(),
        subtotal,
      });
      if (response.data.valid) {
        setCouponDiscount(response.data.discount);
        setCouponApplied(true);
        setCouponMessage('');
        success('Kupon berhasil diterapkan');
      } else {
        setCouponDiscount(0);
        setCouponApplied(false);
        setCouponMessage(response.data.message);
        error(response.data.message);
      }
    } catch (err) {
      setCouponDiscount(0);
      setCouponApplied(false);
      setCouponMessage(err instanceof Error ? err.message : 'Gagal memvalidasi kupon');
      error('Gagal memvalidasi kupon');
    } finally {
      setCouponValidating(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedAddressId || !selectedRate) {
      error('Pilih alamat dan opsi pengiriman terlebih dahulu');
      return;
    }
    if (items.some(item => item.isOutOfStock)) {
      error('Sesuaikan jumlah buku yang melebihi stok');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post<Order>('/orders', {
        addressId: selectedAddressId,
        couponCode: couponApplied ? couponCode.trim() : undefined,
        notes: notes.trim() || undefined,
      });

      const order = response.data;

      if (order.payment?.invoiceUrl) {
        window.location.href = order.payment.invoiceUrl;
      } else {
        success('Pesanan dibuat. Silakan lakukan pembayaran dari halaman detail pesanan.');
        await clear();
        router.push(`/orders/${order.id}`);
      }
    } catch (err) {
      error(err instanceof Error ? err.message : 'Gagal membuat pesanan');
    } finally {
      setSubmitting(false);
    }
  };

  const total = subtotal + (selectedRate?.cost || 0) - couponDiscount;
  const freeShipping = subtotal >= 200000;

  if (cartLoading || shippingLoading) {
    return <CheckoutSkeleton />;
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="container-editorial py-8 lg:py-12">
        <nav className="flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-cherry">
            Beranda
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/cart" className="transition hover:text-cherry">
            Keranjang
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-navy">Checkout</span>
        </nav>

        <div className="mt-5 flex flex-col gap-3 border-b border-line pb-6">
          <p className="eyebrow">Langkah checkout</p>
          <h1 className="font-display text-[30px] font-semibold tracking-tight text-navy sm:text-[44px]">
            Lengkapi detail pesanan
          </h1>
          <p className="text-sm text-muted">
            {items.length} buku · {formatPrice(subtotal)} · ongkir dihitung otomatis
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-12">
          <div className="min-w-0 space-y-8">
            {/* Shipping Address */}
            <section>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div>
                  <p className="eyebrow">Alamat pengiriman</p>
                  <h2 className="mt-1 font-display text-xl font-semibold text-navy sm:text-2xl">
                    Kirim ke mana?
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setNewAddressModal(true)}
                  className="btn-secondary btn-sm self-start shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah Alamat Baru
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {addresses.length === 0 ? (
                  <AddressCard
                    empty
                    onSelect={() => setNewAddressModal(true)}
                    className="sm:col-span-2"
                  />
                ) : (
                  addresses.map(address => (
                    <AddressCard
                      key={address.id}
                      address={address}
                      selected={selectedAddressId === address.id}
                      onSelect={() => setSelectedAddressId(address.id)}
                    />
                  ))
                )}
              </div>
            </section>

            {/* Courier & Shipping */}
            {addresses.some(a => a.id === selectedAddressId) && (
              <section>
                <p className="eyebrow">Kurir & layanan</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-navy sm:text-2xl">
                  Pilih pengiriman
                </h2>
                <p className="mt-1.5 text-sm text-muted">
                  Tarif dihitung berdasarkan berat <strong>{(totalWeight / 1000).toFixed(1).replace('.', ',')} kg</strong> ke kota tujuan.
                </p>

                <div className="mt-4 space-y-2">
                  {shippingRates.length === 0 && !shippingLoading ? (
                    <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-ink/75">
                      Tidak ada estimasi ongkir untuk alamat ini. Silakan coba alamat lain atau hubungi kami.
                    </div>
                  ) : (
                    shippingRates.map(rate => (
                      <ShippingRateCard
                        key={`${rate.courier}-${rate.service}`}
                        rate={rate}
                        selected={selectedRate?.courier === rate.courier && selectedRate?.service === rate.service}
                        onSelect={() => setSelectedRate(rate)}
                        loading={shippingLoading}
                      />
                    ))
                  )}
                  {shippingLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Loader2 className="h-4 w-4 animate-spin text-cherry" />
                      Memuat estimasi ongkir...
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Payment Method */}
            <section>
              <p className="eyebrow">Metode pembayaran</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-navy sm:text-2xl">
                Bayar dengan cara yang Anda sukai
              </h2>
              <p className="mt-1.5 text-sm text-muted">Diproses aman melalui Xendit.</p>

              <div className="mt-4 space-y-5">
                {PAYMENT_GROUPS.map(group => (
                  <PaymentGroup key={group.label} group={group} selected={paymentMethod} onSelect={setPaymentMethod} />
                ))}
              </div>
            </section>

            {/* Notes & Coupon */}
            <section>
              <p className="eyebrow">Catatan & kupon</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-navy sm:text-2xl">
                Tambahkan pesan atau gunakan kode diskon
              </h2>

              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="notes" className="label">
                    Catatan untuk penjual
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Contoh: tolong bungkus sebagai kado, kirim setelah jam 15.00"
                    className="textarea"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => {
                      setCouponCode(e.target.value);
                      if (couponApplied) {
                        setCouponApplied(false);
                        setCouponDiscount(0);
                      }
                    }}
                    placeholder="Kode kupon / voucher"
                    className="input flex-1"
                    disabled={couponValidating || couponApplied}
                  />
                  {couponApplied ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCouponCode('');
                        setCouponApplied(false);
                        setCouponDiscount(0);
                      }}
                      className="btn-ghost"
                      aria-label="Hapus kupon"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={validateCoupon}
                      disabled={couponValidating || !couponCode.trim()}
                      className="btn-secondary shrink-0"
                    >
                      {couponValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Terapkan'}
                    </button>
                  )}
                </div>

                {couponMessage && (
                  <p className={cn('text-sm', couponApplied ? 'text-success' : 'text-danger')}>
                    {couponMessage}
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Sticky Summary */}
          <aside className="lg:sticky lg:top-[104px]">
            <div className="rounded-xl border border-line bg-white/65 p-5 shadow-paper sm:p-6">
              <h2 className="font-display text-xl font-semibold text-navy">Ringkasan pembayaran</h2>

              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto hide-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex items-start gap-2.5">
                    <Link href={`/book/${item.book.slug}`} className="w-14 shrink-0">
                      <BookCover title={item.book.title} coverColor={item.book.coverColor} compact />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/book/${item.book.slug}`} className="font-display text-sm font-semibold text-navy line-clamp-1 transition hover:text-cherry">
                        {item.book.title}
                      </Link>
                      <p className="text-[11px] text-muted">{item.qty} × {formatPrice(item.book.price)}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-navy">{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              <dl className="mt-4 space-y-2.5 text-sm border-t border-line pt-4">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="font-semibold tabular text-navy">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Ongkir ({selectedRate?.service})</dt>
                  <dd className={cn('font-semibold tabular', freeShipping ? 'text-success' : 'text-navy')}>
                    {freeShipping ? 'Gratis' : formatPrice(selectedRate?.cost || 0)}
                  </dd>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-success">
                    <dt>Diskon kupon ({couponCode.toUpperCase()})</dt>
                    <dd className="font-semibold tabular">-{formatPrice(couponDiscount)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-line pt-2">
                  <dt className="font-semibold text-navy">Total pembayaran</dt>
                  <dd className="font-display text-xl font-bold tabular text-navy">{formatPrice(Math.max(0, total))}</dd>
                </div>
              </dl>

              <button
                type="submit"
                disabled={!selectedAddressId || !selectedRate || items.some(i => i.isOutOfStock) || submitting}
                className="btn-primary btn-lg mt-5 w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Buat Pesanan
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {!selectedAddressId && (
                <p className="mt-2 text-center text-sm text-danger">
                  Pilih alamat pengiriman terlebih dahulu.
                </p>
              )}
              {!selectedRate && selectedAddressId && (
                <p className="mt-2 text-center text-sm text-danger">
                  Pilih opsi pengiriman terlebih dahulu.
                </p>
              )}

              <div className="mt-5 space-y-2 border-t border-line pt-4 text-[11px] text-muted">
                <p className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" />
                  Pembayaran aman via Xendit
                </p>
                <p className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 text-cherry" />
                  Buku dikemas dengan pelindung ekstra
                </p>
                <p className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 text-info" />
                  Dikirim dari Jakarta dalam 1×24 jam
                </p>
              </div>
            </div>

            <p className="mt-4 text-center font-hand text-xl leading-snug text-muted">
              &ldquo;Buku yang Anda beli hari ini adalah investasi untuk pikiran besok.&rdquo;
            </p>
          </aside>
        </div>
      </form>

      <Modal
        open={newAddressModal}
        onClose={() => setNewAddressModal(false)}
        title="Tambah Alamat Baru"
        size="lg"
        mobileFullScreen
      >
        <AddressForm
          onSubmit={async data => {
            try {
              const response = await api.post<Address>('/addresses', data);
              setAddresses(current => [...current, response.data]);
              if (response.data.isDefault || addresses.length === 0) {
                setSelectedAddressId(response.data.id);
              }
              setNewAddressModal(false);
              success('Alamat berhasil ditambahkan');
            } catch (err) {
              error(err instanceof Error ? err.message : 'Gagal menambahkan alamat');
            }
          }}
          initial={{
            province: 'DKI Jakarta',
            provinceId: '6',
          }}
        />
      </Modal>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutContent />
    </Suspense>
  );
}

function AddressCard({
  address,
  selected,
  onSelect,
  empty,
  className,
}: {
  address?: Address;
  selected?: boolean;
  onSelect?: () => void;
  empty?: boolean;
  className?: string;
}) {
  if (empty) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-white/50 p-6 transition hover:border-cherry/50 hover:bg-cream/30',
          className
        )}
      >
        <MapPin className="h-8 w-8 text-muted group-hover:text-cherry transition" />
        <p className="mt-3 font-semibold text-navy">Tambah Alamat Baru</p>
        <p className="mt-1 text-sm text-muted">Simpan untuk checkout cepat</p>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative flex w-full flex-col gap-2 rounded-xl border-2 p-4 text-left transition',
        selected ? 'border-cherry bg-cherry/[0.04]' : 'border-line bg-white/50 hover:border-navy/30',
        className
      )}
    >
      {selected && (
        <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full border-2 border-cherry bg-cherry text-white">
          <Check className="h-3 w-3" />
        </span>
      )}
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy/10 text-navy">
          <MapPin className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-navy">{address!.label || 'Rumah'}</span>
            {address!.isDefault && (
              <span className="rounded-sm bg-navy px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-cream">
                Utama
              </span>
            )}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-ink/70">
            {address!.recipient} · {address!.phone}
          </p>
          <p className="mt-0.5 text-sm leading-relaxed text-muted">
            {address!.address}, {address!.subdistrict || ''}, {address!.city}, {address!.province} {address!.postalCode}
          </p>
        </div>
      </div>
    </button>
  );
}

function ShippingRateCard({
  rate,
  selected,
  onSelect,
  loading,
}: {
  rate: ShippingRate;
  selected: boolean;
  onSelect: () => void;
  loading: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={loading}
      className={cn(
        'relative flex w-full flex-col gap-2 rounded-xl border-2 p-4 text-left transition',
        selected ? 'border-cherry bg-cherry/[0.04]' : 'border-line bg-white/50 hover:border-navy/30 disabled:opacity-60'
      )}
    >
      {selected && (
        <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full border-2 border-cherry bg-cherry text-white">
          <Check className="h-3 w-3" />
        </span>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy/10 text-navy font-bold text-sm uppercase">
            {rate.courier.toUpperCase()}
          </span>
          <div>
            <p className="font-semibold text-navy">{rate.service}</p>
            <p className="text-xs text-muted">{rate.estimatedDays}</p>
          </div>
        </div>
        <p className="font-display text-lg font-bold text-navy tabular">
          {formatPrice(rate.cost)}
        </p>
      </div>
      <p className="text-[10px] text-muted">{rate.description}</p>
    </button>
  );
}

function PaymentGroup({
  group,
  selected,
  onSelect,
}: {
  group: { label: string; icon: React.FC<{ className?: string }>; methods: Array<{ id: string; label: string; channel: string }> };
  selected: string;
  onSelect: (id: string) => void;
}) {
  const Icon = group.icon;

  return (
    <div className="rounded-xl border border-line bg-white/55 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
        <Icon className="h-4 w-4 text-cherry" />
        {group.label}
      </div>
      <div className="grid grid-cols-1 gap-1 px-3 pb-3 sm:grid-cols-2">
        {group.methods.map(method => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={cn(
              'relative flex items-center justify-center gap-2 rounded-lg border-2 p-3 transition',
              selected === method.id
                ? 'border-cherry bg-cherry/[0.04]'
                : 'border-line bg-white/50 hover:border-navy/30'
            )}
          >
            {selected === method.id && (
              <span className="absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full border border-cherry bg-cherry text-white">
                <Check className="h-2.5 w-2.5" />
              </span>
            )}
            <Circle
              className={cn(
                'h-4 w-4 transition',
                selected === method.id ? 'text-cherry' : 'text-line'
              )}
            />
            <span className="text-sm font-medium text-navy">{method.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AddressForm({
  onSubmit,
  initial = {},
}: {
  onSubmit: (data: any) => void;
  initial?: Partial<Address>;
}) {
  const [form, setForm] = useState({
    label: 'Rumah',
    recipient: '',
    phone: '',
    address: '',
    province: initial.province || '',
    provinceId: initial.provinceId || '',
    city: '',
    cityId: '',
    subdistrict: '',
    subdistrictId: '',
    postalCode: '',
    isDefault: false,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="label" className="label">Label alamat</label>
          <select
            id="label"
            value={form.label}
            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            className="select"
          >
            <option value="Rumah">Rumah</option>
            <option value="Kantor">Kantor</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
        <div>
          <label htmlFor="isDefault" className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/75">
            <input
              type="checkbox"
              id="isDefault"
              checked={form.isDefault}
              onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
              className="checkbox"
            />
            Jadikan alamat utama
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="recipient" className="label">Nama penerima</label>
          <input
            id="recipient"
            value={form.recipient}
            onChange={e => setForm(f => ({ ...f, recipient: e.target.value }))}
            className="input"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="label">Nomor telepon</label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className="input"
            required
            placeholder="08xx-xxxx-xxxx"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="label">Alamat lengkap</label>
        <textarea
          id="address"
          value={form.address}
          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          className="textarea"
          rows={2}
          required
          placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="province" className="label">Provinsi</label>
          <select
            id="province"
            value={form.province}
            onChange={e => setForm(f => ({ ...f, province: e.target.value, city: '', cityId: '' }))}
            className="select"
            required
          >
            <option value="">Pilih provinsi</option>
            <option value="DKI Jakarta">DKI Jakarta</option>
            <option value="Jawa Barat">Jawa Barat</option>
            <option value="Jawa Tengah">Jawa Tengah</option>
            <option value="Jawa Timur">Jawa Timur</option>
            <option value="Banten">Banten</option>
            <option value="Sumatera Utara">Sumatera Utara</option>
            <option value="Sumatera Barat">Sumatera Barat</option>
            <option value="Sumatera Selatan">Sumatera Selatan</option>
            <option value="Bali">Bali</option>
            {/* Add more as needed */}
          </select>
        </div>
        <div>
          <label htmlFor="city" className="label">Kota / Kabupaten</label>
          <select
            id="city"
            value={form.city}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            className="select"
            required
          >
            <option value="">Pilih kota</option>
            {form.province === 'DKI Jakarta' && (
              <>
                <option value="Jakarta Pusat">Jakarta Pusat</option>
                <option value="Jakarta Utara">Jakarta Utara</option>
                <option value="Jakarta Barat">Jakarta Barat</option>
                <option value="Jakarta Selatan">Jakarta Selatan</option>
                <option value="Jakarta Timur">Jakarta Timur</option>
              </>
            )}
            {form.province === 'Jawa Barat' && (
              <>
                <option value="Bandung">Bandung</option>
                <option value="Bekasi">Bekasi</option>
                <option value="Depok">Depok</option>
                <option value="Bogor">Bogor</option>
              </>
            )}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="subdistrict" className="label">Kecamatan</label>
          <input
            id="subdistrict"
            value={form.subdistrict}
            onChange={e => setForm(f => ({ ...f, subdistrict: e.target.value }))}
            className="input"
            placeholder="Menteng, Kebayoran Baru, dll"
          />
        </div>
        <div>
          <label htmlFor="postalCode" className="label">Kode pos</label>
          <input
            id="postalCode"
            value={form.postalCode}
            onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))}
            className="input"
            required
            placeholder="10310"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary flex-1">
          Simpan Alamat
        </button>
      </div>
    </form>
  );
}

interface ShippingRate {
  courier: string;
  service: string;
  cost: number;
  estimatedDays: string;
  description: string;
}

function CheckoutSkeleton() {
  return (
    <div className="container-editorial py-10">
      <div className="skeleton h-3 w-40 rounded" />
      <div className="skeleton mt-5 h-11 w-72 rounded" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="skeleton h-5 w-48 rounded" />
              <div className="skeleton h-20 w-full rounded-xl" />
            </div>
          ))}
        </div>
        <div className="skeleton h-96 rounded-xl" />
      </div>
    </div>
  );
}