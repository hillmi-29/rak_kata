'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Circle,
  Clock,
  Copy,
  MapPin,
  Package,
  ShieldCheck,
  Star,
  Truck,
  Wallet,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { cn, formatDate, formatPrice, orderStatusLabel, orderStatusMeta, paymentStatusMeta, stockLabel, timeAgo } from '@/lib/format';
import type { Order, OrderStatus, PaymentStatus } from '@/lib/types';
import { BookCover } from '@/components/books/book-cover';
import { Modal } from '@/components/ui/modal';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/status-badge';

const STATUS_ORDER: OrderStatus[] = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const { user } = useAuth();
  const { error, success } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    setLoadError('');
    api
      .get<Order>(`/orders/${orderId}`)
      .then(response => {
        setOrder(response.data);
      })
      .catch(err => {
        setLoadError(err instanceof Error ? err.message : 'Pesanan tidak ditemukan');
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const statusMeta = order ? orderStatusMeta[order.status] : null;
  const paymentMeta = order?.payment ? paymentStatusMeta[order.payment.status as PaymentStatus] : null;
  const isPending = order?.status === 'PENDING';
  const isShipped = order?.status === 'SHIPPED';

  if (loading) return <OrderDetailSkeleton />;
  if (loadError || !order) {
    return (
      <div className="container-editorial py-24">
        <div className="mx-auto max-w-lg rounded-2xl border border-line bg-white/60 px-8 py-14 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-cream-dark text-navy">
            <Package className="h-7 w-7" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold text-navy">Pesanan tidak ditemukan</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{loadError || 'Mungkin ID pesanan tidak valid.'}</p>
          <Link href="/account/orders" className="btn-primary mt-6">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke daftar pesanan
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const expiresAt = order.payment?.expiredAt ? new Date(order.payment.expiredAt) : null;
  const showCountdown = isPending && expiresAt && expiresAt > new Date();

  return (
    <div className="container-editorial py-8 lg:py-12">
      <nav className="flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/" className="transition hover:text-cherry">Beranda</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/account/orders" className="transition hover:text-cherry">Pesanan Saya</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-mono text-navy">{order.orderNumber}</span>
      </nav>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="eyebrow">Pesanan</p>
            <OrderStatusBadge status={order.status} />
            {order.payment && <PaymentStatusBadge status={order.payment.status as PaymentStatus} />}
          </div>
          <h1 className="mt-2 break-all font-display text-[26px] font-semibold tracking-tight text-navy sm:text-[44px]">
            {order.orderNumber}
          </h1>
          <p className="mt-1.5 text-sm text-muted">Dipesan pada {formatDate(order.createdAt, true)}</p>
        </div>
        {isPending && (
          <button
            type="button"
            onClick={() => router.push(`/checkout?order=${order.id}`)}
            className="btn-secondary shrink-0"
          >
            <Wallet className="h-4 w-4" />
            Bayar Sekarang
          </button>
        )}
      </div>

      {/* Timeline */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold text-navy">Perkembangan pesanan</h2>
        <div className="relative mt-5 space-y-4">
          <div className="absolute bottom-2 left-5 top-2 w-0.5 -translate-x-1/2 bg-line" />
          {STATUS_ORDER.map((status, index) => {
            const completed = STATUS_ORDER.indexOf(order.status) >= index;
            return (
              <div key={status} className="relative flex items-start gap-4">
                <span className={cn(
                  'relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition',
                  completed ? 'border-cherry bg-cherry text-cream' : 'border-line bg-white text-line'
                )}>
                  {completed ? <Check className="h-5 w-5" /> : <Circle className="h-2 w-2 rounded-full" />}
                </span>
                <div className="pt-1">
                  <p className={cn('text-sm font-semibold', completed ? 'text-navy' : 'text-muted')}>
                    {orderStatusLabel(status)}
                  </p>
                  {status === 'PENDING' && (
                    <p className="text-xs text-muted">{formatDate(order.createdAt, true)}</p>
                  )}
                  {status === 'PAID' && order.paidAt && (
                    <p className="text-xs text-muted">Dibayar {formatDate(order.paidAt, true)}</p>
                  )}
                  {status === 'SHIPPED' && order.shippedAt && (
                    <p className="text-xs text-muted">Dikirim {formatDate(order.shippedAt, true)}</p>
                  )}
                  {status === 'DELIVERED' && order.deliveredAt && (
                    <p className="text-xs text-muted">Tiba {formatDate(order.deliveredAt, true)}</p>
                  )}
                  {status === 'CANCELLED' && order.cancelledAt && (
                    <p className="text-xs text-danger">Dibatalkan {formatDate(order.cancelledAt, true)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-12">
        <div className="min-w-0 space-y-8">
          {/* Items */}
          <section className="rounded-xl border border-line bg-white/60 overflow-hidden">
            <div className="border-b border-line px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-navy">Buku yang dipesan ({order.items.length})</h2>
            </div>
            <ul className="divide-y divide-line">
              {order.items.map(item => (
                <li key={item.id} className="flex gap-4 px-5 py-4">
                  <Link href={`/book/${item.id}`} className="w-16 shrink-0 transition hover:-translate-y-0.5">
                    <BookCover
                      title={item.bookTitle}
                      coverImage={item.bookCover || undefined}
                      compact
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <Link href={`/book/${item.id}`} className="font-display text-base font-semibold text-navy line-clamp-1 transition hover:text-cherry">
                        {item.bookTitle}
                      </Link>
                      <p className="text-sm text-muted">{item.qty} × {formatPrice(item.price)}</p>
                    </div>
                    <p className="text-sm font-semibold text-navy">{formatPrice(item.price * item.qty)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Address & Payment */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-white/60 p-5">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cherry" />
                <h2 className="font-display text-lg font-semibold text-navy">Alamat pengiriman</h2>
              </div>
              <address className="mt-3 not-italic text-sm leading-relaxed text-ink/70">
                {order.shippingAddress.recipient}<br />
                {order.shippingAddress.phone}<br />
                {order.shippingAddress.address}<br />
                {order.shippingAddress.subdistrict ? `${order.shippingAddress.subdistrict}, ` : ''}
                {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
              </address>
            </div>

            <div className="rounded-xl border border-line bg-white/60 p-5">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-cherry" />
                <h2 className="font-display text-lg font-semibold text-navy">Metode pembayaran</h2>
              </div>
              <div className="mt-3 space-y-1.5 text-sm">
                {order.payment ? (
                  <>
                    <p>
                      <span className="text-muted">Metode: </span>
                      <span className="font-semibold text-navy">{order.payment.paymentMethod || '—'}</span>
                    </p>
                    <p>
                      <span className="text-muted">Saluran: </span>
                      <span className="font-semibold text-navy">{order.payment.paymentChannel || '—'}</span>
                    </p>
                    <p>
                      <span className="text-muted">Status: </span>
                      <PaymentStatusBadge status={order.payment.status as PaymentStatus} />
                    </p>
                    {order.payment.invoiceUrl && (
                      <p>
                        <Link href={order.payment.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-cherry underline-offset-2 hover:underline flex items-center gap-1">
                          Lihat invoice Xendit
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-muted">Belum ada data pembayaran</p>
                )}
              </div>
            </div>
          </div>

          {/* Courier & Tracking */}
          {isShipped && order.trackingNumber && (
            <section className="rounded-xl border border-line bg-white/60 p-5">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-cherry" />
                <h2 className="font-display text-lg font-semibold text-navy">Pelacakan pengiriman</h2>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <div className="rounded-lg border border-line bg-white/50 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-navy">{order.courier || 'JNE'}</p>
                      <p className="text-xs text-muted">No. Resi: <span className="font-mono text-ink">{order.trackingNumber}</span></p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(order.trackingNumber || '').then(() => success('Nomor resi disalin'))}
                      className="btn-ghost btn-sm"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Salin
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted">Gunakan nomor resi di website/aplikasi kurir untuk melacak paket secara real-time.</p>
              </div>
            </section>
          )}

          {/* Cancel Order */}
          {isPending && (
            <section className="rounded-xl border border-warning/30 bg-warning/5 p-5">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                <h2 className="font-display text-lg font-semibold text-navy">Batalkan pesanan</h2>
              </div>
              <p className="mt-2 text-sm text-muted">
                Pesanan ini masih menunggu pembayaran. Anda dapat membatalkannya kapan saja sebelum batas waktu.
              </p>
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="btn-secondary btn-sm mt-3"
              >
                Batalkan Pesanan
              </button>
            </section>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-[104px]">
          <div className="rounded-xl border border-line bg-white/65 p-5 shadow-paper sm:p-6">
            <h2 className="font-display text-xl font-semibold text-navy">Rincian biaya</h2>

            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal ({order.items.length} buku)</dt>
                <dd className="font-semibold tabular text-navy">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Ongkir</dt>
                <dd className="font-semibold tabular text-navy">{formatPrice(order.shippingCost)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success">
                  <dt>Diskon</dt>
                  <dd className="font-semibold tabular">-{formatPrice(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-line pt-2">
                <dt className="font-semibold text-navy">Total</dt>
                <dd className="font-display text-2xl font-bold tabular text-navy">{formatPrice(order.total)}</dd>
              </div>
            </dl>

            {showCountdown && (
              <CountdownTimer target={expiresAt!} className="mt-4" />
            )}

            <div className="mt-5 space-y-2 border-t border-line pt-4 text-[11px] text-muted">
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                Pembayaran diproses aman oleh Xendit
              </p>
              <p className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-cherry" />
                Buku dikemas dengan pelindung ekstra
              </p>
            </div>

            <Link href="/account/orders" className="btn-ghost mt-4 w-full">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke daftar pesanan
            </Link>
          </div>
        </aside>
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Batalkan pesanan"
        description={`Apakah Anda yakin ingin membatalkan ${order.orderNumber}?`}
        size="sm"
        mobileFullScreen
        footer={
          <div className="flex gap-2">
            <button type="button" onClick={() => setCancelOpen(false)} className="btn-secondary flex-1">
              Batal
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await api.post(`/orders/${order.id}/cancel`, { reason: cancelReason });
                  success('Pesanan berhasil dibatalkan');
                  setCancelOpen(false);
                  setCancelReason('');
                  router.refresh();
                } catch (err) {
                  error(err instanceof Error ? err.message : 'Gagal membatalkan pesanan');
                }
              }}
              className="btn bg-danger text-white hover:bg-danger/90 flex-1"
            >
              Ya, Batalkan
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-muted">Alasan pembatalan (opsional)</p>
          <textarea
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            placeholder="Contoh: Salah alamat, tidak jadi beli, dsb."
            className="textarea"
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
}

function CountdownTimer({ target, className }: { target: Date; className?: string }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const update = () => {
      const diff = target.getTime() - Date.now();
      setTimeLeft(Math.max(0, diff));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [target]);

  const hours = Math.floor(timeLeft / 3600000);
  const minutes = Math.floor((timeLeft % 3600000) / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  if (timeLeft <= 0) return null;

  return (
    <div className={cn('rounded-lg bg-danger/5 border border-danger/20 p-3', className)}>
      <p className="flex items-center justify-center gap-2 text-sm font-semibold text-danger">
        <Clock className="h-4 w-4" />
        Batas pembayaran:
        <span className="font-mono tabular">
          {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </p>
      <p className="mt-1 text-center text-[11px] text-danger/80">
        Pesanan akan otomatis dibatalkan setelah waktu habis.
      </p>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="container-editorial py-10">
      <div className="skeleton h-3 w-40 rounded" />
      <div className="skeleton mt-5 h-11 w-72 rounded" />
      <div className="mt-8 space-y-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="skeleton h-10 w-1/3 rounded" />
        ))}
        <div className="skeleton h-40 rounded-xl" />
        <div className="skeleton h-40 rounded-xl" />
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="skeleton h-56 rounded-xl" />
          <div className="skeleton h-56 rounded-xl" />
        </div>
      </div>
    </div>
  );
}