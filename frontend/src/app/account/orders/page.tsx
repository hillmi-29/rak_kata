'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, Loader2, Package, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { cn, formatDate, formatPrice, orderStatusLabel, orderStatusMeta } from '@/lib/format';
import type { Order, OrderStatus } from '@/lib/types';
import { AccountLayout } from '@/components/layout/account-layout';
import { EmptyState } from '@/components/ui/empty-state';
import { OrderStatusBadge } from '@/components/ui/status-badge';
import { Pagination } from '@/components/ui/pagination';

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Semua' },
  { value: 'PENDING', label: 'Menunggu Pembayaran' },
  { value: 'PAID', label: 'Dibayar' },
  { value: 'PROCESSING', label: 'Diproses' },
  { value: 'SHIPPED', label: 'Dikirim' },
  { value: 'DELIVERED', label: 'Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
];

function AccountOrdersContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{ page: number; total: number; totalPages: number } | null>(null);
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(Math.max(1, parseInt(searchParams.get('page') || '1', 10)));

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    params.set('page', String(page));
    params.set('limit', '10');

    api
      .get<Order[]>(`/orders?${params.toString()}`)
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
  }, [status, page]);

  function buildHref(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    return `/account/orders?${params.toString()}`;
  }

  const totalOrders = meta?.total ?? 0;

  return (
    <AccountLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Pesanan Saya</p>
            <h1 className="mt-2 font-display text-[30px] font-semibold tracking-tight text-navy sm:text-[44px]">
              Riwayat pembelian
            </h1>
            <p className="mt-1.5 text-sm text-muted">{totalOrders} pesanan ditemukan</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={e => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="select w-full sm:w-auto sm:min-w-[180px]"
            >
              {STATUS_FILTERS.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
            {status && (
              <button
                type="button"
                onClick={() => setStatus('')}
                className="btn-ghost btn-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <OrderCardSkeleton key={index} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title={status ? `Tidak ada pesanan dengan status "${orderStatusLabel(status as OrderStatus)}"` : 'Belum ada pesanan'}
            description={
              status
                ? 'Coba pilih status lain, atau mulai belanja untuk membuat pesanan pertama Anda.'
                : 'Jelajahi katalog buku kami dan temukan bacaan yang Anda sukai.'
            }
            actionHref={status ? undefined : '/books'}
            actionLabel={status ? undefined : 'Mulai Belanja'}
            icon={<Package className="h-7 w-7" />}
          />
        ) : (
          <>
            <div className="space-y-4">
              {orders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            {meta && meta.totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={meta.totalPages}
                buildHref={buildHref}
                className="mt-8 justify-center"
              />
            )}
          </>
        )}
      </div>
    </AccountLayout>
  );
}

export default function AccountOrdersPage() {
  return (
    <Suspense fallback={<AccountOrdersSkeleton />}>
      <AccountOrdersContent />
    </Suspense>
  );
}

function AccountOrdersSkeleton() {
  return (
    <AccountLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton mt-2 h-11 w-72 rounded" />
          </div>
        </div>
        <div className="skeleton h-12 w-full rounded-xl" />
        {Array.from({ length: 5 }).map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    </AccountLayout>
  );
}

function OrderCard({ order }: { order: Order }) {
  const statusMeta = orderStatusMeta[order.status];

  return (
    <Link href={`/orders/${order.id}`} className="group">
      <div className="rounded-xl border border-line bg-white/60 overflow-hidden transition hover:border-navy/30 hover:shadow-paper">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-cream">
                {order.items[0]?.bookCover && (
                  <img
                    src={order.items[0].bookCover}
                    alt={order.items[0].bookTitle}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center text-navy/20">
                  <Package className="h-6 w-6" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold text-navy truncate group-hover:text-cherry">
                  {order.orderNumber}
                </p>
                <p className="text-sm text-muted">{formatDate(order.createdAt, true)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-4">
              <div className="flex items-center gap-2.5 sm:hidden">
                <p className="font-display text-lg font-bold text-navy">{formatPrice(order.total)}</p>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="hidden text-right sm:block">
                <p className="font-display text-xl font-bold text-navy">{formatPrice(order.total)}</p>
                <OrderStatusBadge status={order.status} />
              </div>
              <ChevronRight className="h-5 w-5 text-muted transition group-hover:text-cherry sm:hidden" />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Buku:</span>
            {order.items.slice(0, 3).map((item, index) => (
              <span key={item.id} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/70 px-2.5 py-1 text-[11px] font-medium text-navy/80">
                {index > 0 && <span className="text-muted">+</span>}
                <span className="truncate max-w-[120px]">{item.bookTitle}</span>
                <span className="text-muted">×{item.qty}</span>
              </span>
            ))}
            {order.items.length > 3 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/70 px-2.5 py-1 text-[11px] font-medium text-muted">
                +{order.items.length - 3} buku lain
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function OrderCardSkeleton() {
  return (
    <div className="rounded-xl border border-line bg-white/60 p-5">
      <div className="flex items-center gap-4">
        <div className="skeleton w-16 h-20 rounded-lg" />
        <div className="flex-1">
          <div className="skeleton h-6 w-48 rounded" />
          <div className="skeleton mt-2 h-4 w-32 rounded" />
        </div>
      </div>
      <div className="mt-3 skeleton h-6 w-full rounded" />
    </div>
  );
}