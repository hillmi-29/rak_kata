'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ChevronRight,
  Filter,
  Loader2,
  Package,
  Search,
  Truck,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/layout/admin-layout';
import { cn, formatDate, formatPrice, orderStatusLabel, orderStatusMeta } from '@/lib/format';
import type { Order, OrderStatus } from '@/lib/types';
import { EmptyState } from '@/components/ui/empty-state';
import { OrderStatusBadge } from '@/components/ui/status-badge';
import { Pagination } from '@/components/ui/pagination';
import { Modal } from '@/components/ui/modal';

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'PENDING', label: 'Menunggu Pembayaran' },
  { value: 'PAID', label: 'Dibayar' },
  { value: 'PROCESSING', label: 'Diproses' },
  { value: 'SHIPPED', label: 'Dikirim' },
  { value: 'DELIVERED', label: 'Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
  { value: 'REFUNDED', label: 'Dikembalikan' },
];

const STATUS_OPTIONS_NO_EMPTY = STATUS_OPTIONS.filter(o => o.value);

function AdminOrdersContent() {
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{ page: number; total: number; totalPages: number } | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(Math.max(1, parseInt(searchParams.get('page') || '1', 10)));
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [shipOrder, setShipOrder] = useState<Order | null>(null);
  const [shipForm, setShipForm] = useState({ courier: '', trackingNumber: '', service: '' });
  const [shipping, setShipping] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    params.set('page', String(page));
    params.set('limit', '20');

    api
      .get<Order[]>(`/admin/orders?${params.toString()}`)
      .then(response => {
        if (!active) return;
        setOrders(response.data);
        setMeta(response.meta || null);
      })
      .catch(() => {
        if (active) setOrders([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, status, page]);

  function buildHref(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    return `/admin/orders?${params.toString()}`;
  }

  function openDetail(order: Order) {
    setDetailOrder(order);
  }

  function openShip(order: Order) {
    setShipOrder(order);
    setShipForm({ courier: order.courier || 'jne', trackingNumber: order.trackingNumber || '', service: order.courier ? 'REG' : '' });
  }

  function handleShip(event: React.FormEvent) {
    event.preventDefault();
    if (!shipOrder || !shipForm.courier || !shipForm.trackingNumber.trim()) {
      alert('Lengkapi kurir dan nomor resi');
      return;
    }
    setShipping(true);
    api
      .patch<Order>(`/admin/orders/${shipOrder.id}/ship`, {
        courier: shipForm.courier,
        trackingNumber: shipForm.trackingNumber.trim(),
        service: shipForm.service || undefined,
      })
      .then(response => {
        setOrders(current => current.map(o => (o.id === shipOrder!.id ? response.data : o)));
        if (detailOrder?.id === shipOrder.id) setDetailOrder(response.data);
        setShipOrder(null);
        setShipForm({ courier: '', trackingNumber: '', service: '' });
      })
      .catch(() => alert('Gagal mengirim pesanan'))
      .finally(() => setShipping(false));
  }

  function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    api
      .patch<Order>(`/admin/orders/${orderId}/status`, { status: newStatus })
      .then(response => {
        setOrders(current => current.map(o => (o.id === orderId ? response.data : o)));
        if (detailOrder?.id === orderId) setDetailOrder(response.data);
      })
      .catch(() => alert('Gagal mengubah status'));
  }

  const totalOrders = meta?.total ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Admin / Pesanan</p>
            <h1 className="mt-2 font-display text-[30px] font-semibold tracking-tight text-navy sm:text-[44px]">
              Kelola pesanan
            </h1>
            <p className="mt-1.5 text-sm text-muted">{totalOrders} pesanan total</p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-line bg-white/60 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-1 sm:flex-row sm:items-center">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Cari nomor pesanan, nama pelanggan, email..."
                  className="input pl-10"
                />
              </div>
              <select
                value={status}
                onChange={e => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="select w-full sm:w-auto sm:min-w-[200px]"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {(search || status) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatus('');
                  setPage(1);
                }}
                className="btn-ghost btn-sm"
              >
                <X className="h-3.5 w-3.5" />
                Reset filter
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-line bg-white/60 overflow-hidden">
          {loading ? (
            <div className="p-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <OrderRowSkeleton key={index} />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              title={status ? `Tidak ada pesanan dengan status "${orderStatusLabel(status as OrderStatus)}"` : 'Belum ada pesanan'}
              description={status ? 'Coba pilih status lain.' : 'Pesanan akan muncul di sini saat pelanggan melakukan checkout.'}
              icon={<Package className="h-7 w-7" />}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line bg-cream/50 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                      <th className="px-4 py-3">Pesanan</th>
                      <th className="px-4 py-3 hidden md:table-cell">Pelanggan</th>
                      <th className="px-4 py-3 hidden lg:table-cell">Item</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 hidden md:table-cell">Tanggal</th>
                      <th className="px-4 py-3">Pengiriman</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {orders.map(order => (
                      <OrderRow key={order.id} order={order} onDetail={openDetail} onShip={openShip} onStatusChange={handleStatusChange} />
                    ))}
                  </tbody>
                </table>
              </div>
              {meta && meta.totalPages > 1 && (
                <Pagination page={page} totalPages={meta.totalPages} buildHref={buildHref} className="border-t border-line px-4 py-4 justify-center" />
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        open={Boolean(detailOrder)}
        onClose={() => setDetailOrder(null)}
        title={`Detail Pesanan ${detailOrder?.orderNumber}`}
        size="lg"
        mobileFullScreen
      >
        {detailOrder && <OrderDetailContent order={detailOrder} onClose={() => setDetailOrder(null)} onShip={openShip} />}
      </Modal>

      {/* Ship Modal */}
      <Modal
        open={Boolean(shipOrder)}
        onClose={() => setShipOrder(null)}
        title={`Kirim Pesanan ${shipOrder?.orderNumber}`}
        size="sm"
        mobileFullScreen
        footer={
          <div className="flex gap-2">
            <button type="button" onClick={() => setShipOrder(null)} className="btn-secondary flex-1" disabled={shipping}>
              Batal
            </button>
            <button type="submit" form="ship-form" disabled={shipping} className="btn-primary flex-1">
              {shipping ? 'Mengirim...' : 'Kirim & Kirim Email'}
            </button>
          </div>
        }
      >
        <form id="ship-form" onSubmit={handleShip} className="space-y-4">
          <div>
            <label htmlFor="courier" className="label">Kurir</label>
            <select id="courier" value={shipForm.courier} onChange={e => setShipForm(f => ({ ...f, courier: e.target.value }))} className="select" required>
              <option value="jne">JNE</option>
              <option value="sicepat">SiCepat</option>
              <option value="jnt">J&T Express</option>
              <option value="anteraja">AnterAja</option>
            </select>
          </div>
          <div>
            <label htmlFor="service" className="label">Layanan</label>
            <select id="service" value={shipForm.service} onChange={e => setShipForm(f => ({ ...f, service: e.target.value }))} className="select">
              <option value="REG">Regular</option>
              <option value="YES">YES (JNE)</option>
              <option value="OKE">OKE (JNE)</option>
              <option value="GOKIL">GOKIL (SiCepat)</option>
              <option value="SIUNTUNG">SIUNTUNG (SiCepat)</option>
              <option value="EZ">EZ (J&T)</option>
              <option value="ECO">ECO (J&T)</option>
              <option value="NEXTDAY">Next Day (AnterAja)</option>
            </select>
          </div>
          <div>
            <label htmlFor="trackingNumber" className="label">Nomor Resi <span className="text-danger">*</span></label>
            <input id="trackingNumber" type="text" value={shipForm.trackingNumber} onChange={e => setShipForm(f => ({ ...f, trackingNumber: e.target.value }))} className="input" placeholder="JNE123456789" required autoFocus />
          </div>
          <p className="text-sm text-muted">Pelanggan akan menerima email notifikasi dengan nomor resi ini.</p>
        </form>
      </Modal>
    </AdminLayout>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<AdminOrdersSkeleton />}>
      <AdminOrdersContent />
    </Suspense>
  );
}

function AdminOrdersSkeleton() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton mt-2 h-11 w-72 rounded" />
            <div className="skeleton mt-1.5 h-4 w-40 rounded" />
          </div>
        </div>
        <div className="skeleton h-12 w-full rounded-xl" />
        <div className="skeleton h-200 w-full rounded-xl" />
      </div>
    </AdminLayout>
  );
}

function OrderRow({
  order,
  onDetail,
  onShip,
  onStatusChange,
}: {
  order: Order;
  onDetail: (order: Order) => void;
  onShip: (order: Order) => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  const statusMeta = orderStatusMeta[order.status];
  const canShip = order.status === 'PAID' || order.status === 'PROCESSING';
  const isShipped = order.status === 'SHIPPED' || order.status === 'DELIVERED';

  return (
    <tr className="hover:bg-cream/30 transition">
      <td className="px-4 py-3">
        <button type="button" onClick={() => onDetail(order)} className="font-mono font-semibold text-navy hover:text-cherry transition flex items-center gap-1.5">
          {order.orderNumber}
          <ChevronRight className="h-3.5 w-3.5 text-muted" />
        </button>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <div>
          <p className="font-medium text-navy">{order.user?.name || '—'}</p>
          <p className="text-xs text-muted">{order.user?.email}</p>
        </div>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted">
        {order.items.length} buku
      </td>
      <td className="px-4 py-3 font-semibold text-navy tabular">{formatPrice(order.total)}</td>
      <td className="px-4 py-3">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-sm text-muted">{formatDate(order.createdAt, true)}</td>
      <td className="px-4 py-3">
        {isShipped && order.trackingNumber ? (
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-cherry" />
            <div className="text-left">
              <p className="text-xs font-medium text-navy">{order.courier?.toUpperCase() || '—'}</p>
              <p className="text-[10px] font-mono text-muted truncate max-w-[140px]">{order.trackingNumber}</p>
            </div>
          </div>
        ) : canShip ? (
          <button type="button" onClick={() => onShip(order)} className="btn-secondary btn-sm">Kirim</button>
        ) : (
          <span className="text-xs text-muted">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button type="button" onClick={() => onDetail(order)} className="btn-ghost btn-sm p-2" aria-label="Detail">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <select
            value={order.status}
            onChange={e => onStatusChange(order.id, e.target.value as OrderStatus)}
            className="select text-[11px] py-1.5 px-2 min-w-[130px]"
            disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED' || order.status === 'REFUNDED'}
          >
            {STATUS_OPTIONS_NO_EMPTY.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </td>
    </tr>
  );
}

function OrderRowSkeleton() {
  return (
    <tr>
      <td className="px-4 py-3"><div className="skeleton h-5 w-32 rounded" /></td>
      <td className="px-4 py-3 hidden md:table-cell"><div className="skeleton h-5 w-32 rounded" /></td>
      <td className="px-4 py-3 hidden lg:table-cell"><div className="skeleton h-5 w-16 rounded" /></td>
      <td className="px-4 py-3"><div className="skeleton h-5 w-24 rounded" /></td>
      <td className="px-4 py-3"><div className="skeleton h-6 w-24 rounded-full" /></td>
      <td className="px-4 py-3 hidden md:table-cell"><div className="skeleton h-4 w-24 rounded" /></td>
      <td className="px-4 py-3"><div className="skeleton h-8 w-24 rounded" /></td>
      <td className="px-4 py-3 text-right"><div className="skeleton h-8 w-28 rounded" /></td>
    </tr>
  );
}

function OrderDetailContent({
  order,
  onClose,
  onShip,
}: {
  order: Order;
  onClose: () => void;
  onShip: (order: Order) => void;
}) {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const canShip = order.status === 'PAID' || order.status === 'PROCESSING';
  const isShipped = order.status === 'SHIPPED' || order.status === 'DELIVERED';

  return (
    <div className="space-y-6 max-h-[75vh] overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono font-semibold text-navy">{order.orderNumber}</p>
          <p className="text-sm text-muted">{formatDate(order.createdAt, true)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="border-t border-line pt-6 grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-navy">Pelanggan</h3>
          <div className="rounded-lg border border-line bg-white/60 p-4">
            <p className="font-semibold text-navy">{order.user?.name || '—'}</p>
            <p className="text-sm text-muted">{order.user?.email}</p>
            {order.user?.phone && <p className="text-sm text-muted mt-1">{String(order.user.phone)}</p>}
          </div>

          <h3 className="font-display text-lg font-semibold text-navy">Alamat Pengiriman</h3>
          <address className="rounded-lg border border-line bg-white/60 p-4 not-italic text-sm leading-relaxed text-ink/70">
            {order.shippingAddress.recipient}<br />
            {order.shippingAddress.phone}<br />
            {order.shippingAddress.address}<br />
            {order.shippingAddress.subdistrict ? `${order.shippingAddress.subdistrict}, ` : ''}
            {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
          </address>

          {isShipped && order.trackingNumber && (
            <div className="rounded-lg border border-line bg-white/60 p-4">
              <h3 className="font-display text-lg font-semibold text-navy mb-3 flex items-center gap-2"><Truck className="h-4 w-4 text-cherry" />Pelacakan</h3>
              <p className="font-mono text-sm text-navy">{order.trackingNumber}</p>
              <p className="text-xs text-muted mt-1">{order.courier?.toUpperCase()} • {order.shippingAddress.city}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-navy">Item Pesanan ({order.items.length})</h3>
          <div className="rounded-lg border border-line bg-white/60 divide-y divide-line max-h-80 overflow-y-auto">
            {order.items.map(item => (
              <div key={item.id} className="flex gap-3 p-3">
                <div className="w-14 h-20 shrink-0 rounded border border-line bg-cream" style={{ backgroundColor: item.bookCover ? undefined : '#B3173B' }}>
                  {item.bookCover && <img src={item.bookCover} alt={item.bookTitle} className="w-full h-full object-cover rounded" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy truncate">{item.bookTitle}</p>
                  <p className="text-sm text-muted">{item.qty} × {formatPrice(item.price)}</p>
                </div>
                <p className="shrink-0 font-semibold text-navy">{formatPrice(item.price * item.qty)}</p>
              </div>
            ))}
          </div>

          <h3 className="font-display text-lg font-semibold text-navy">Ringkasan Biaya</h3>
          <div className="rounded-lg border border-line bg-white/60 p-4 space-y-2">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-semibold text-navy">{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Ongkir</dt><dd className="font-semibold text-navy">{formatPrice(order.shippingCost)}</dd></div>
              {order.discount > 0 && <div className="flex justify-between text-success"><dt>Diskon</dt><dd className="font-semibold">-{formatPrice(order.discount)}</dd></div>}
              <div className="flex justify-between border-t border-line pt-2"><dt className="font-semibold text-navy">Total</dt><dd className="font-display text-xl font-bold text-navy">{formatPrice(order.total)}</dd></div>
            </dl>
          </div>

          {order.payment && (
            <div className="rounded-lg border border-line bg-white/60 p-4 space-y-2">
              <h3 className="font-display text-lg font-semibold text-navy">Pembayaran</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted">Metode</dt><dd className="font-semibold text-navy">{order.payment.paymentMethod || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Saluran</dt><dd className="font-semibold text-navy">{order.payment.paymentChannel || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Status</dt><dd><OrderStatusBadge status={order.payment.status as any} /></dd></div>
                {order.payment.invoiceUrl && (
                  <div className="flex justify-between"><dt className="text-muted">Invoice</dt><dd><a href={order.payment.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-cherry underline-offset-2 hover:underline">Lihat di Xendit</a></dd></div>
                )}
              </dl>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {canShip && (
              <button type="button" onClick={() => { onClose(); onShip(order); }} className="btn-primary flex-1">
                <Truck className="h-4 w-4" /> Kirim Pesanan
              </button>
            )}
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  );
}