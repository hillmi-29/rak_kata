import type { OrderStatus, PaymentStatus } from './types';

export function formatPrice(value: number | null | undefined): string {
  const amount = Number(value || 0);
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1).replace('.', ',')} jt`;
  if (value >= 1_000) return `Rp ${Math.round(value / 1_000)} rb`;
  return formatPrice(value);
}

export function formatDate(value?: string | Date | null, withTime = false): string {
  if (!value) return '-';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
}

export function formatShortDate(value?: string | Date | null): string {
  if (!value) return '-';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export function timeAgo(value?: string | Date | null): string {
  if (!value) return '-';
  const date = typeof value === 'string' ? new Date(value) : value;
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return formatDate(date);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function initials(name?: string | null): string {
  if (!name) return 'RK';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

export const orderStatusMeta: Record<
  OrderStatus,
  { label: string; className: string; step: number }
> = {
  PENDING: { label: 'Menunggu Pembayaran', className: 'badge-warning', step: 1 },
  PAID: { label: 'Dibayar', className: 'badge-success', step: 2 },
  PROCESSING: { label: 'Diproses', className: 'badge-info', step: 3 },
  SHIPPED: { label: 'Dikirim', className: 'badge-info', step: 4 },
  DELIVERED: { label: 'Selesai', className: 'badge-success', step: 5 },
  CANCELLED: { label: 'Dibatalkan', className: 'badge-danger', step: 0 },
  REFUNDED: { label: 'Dikembalikan', className: 'badge-muted', step: 0 },
};

export const paymentStatusMeta: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING: { label: 'Menunggu', className: 'badge-warning' },
  SUCCESS: { label: 'Berhasil', className: 'badge-success' },
  FAILED: { label: 'Gagal', className: 'badge-danger' },
  EXPIRED: { label: 'Kedaluwarsa', className: 'badge-danger' },
  REFUNDED: { label: 'Dikembalikan', className: 'badge-muted' },
};

export function orderStatusLabel(status: OrderStatus): string {
  return orderStatusMeta[status]?.label ?? status;
}

export function stockLabel(stock: number): { label: string; className: string } {
  if (stock <= 0) return { label: 'Habis', className: 'badge-danger' };
  if (stock <= 5) return { label: `Stok menipis · ${stock}`, className: 'badge-warning' };
  return { label: 'Tersedia', className: 'badge-success' };
}

export function readingTime(pages?: number | null): string {
  if (!pages) return '± 3 jam';
  const hours = Math.max(1, Math.round(pages / 45));
  return `± ${hours} jam membaca`;
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function getInitialsColor(name: string): string {
  const palettes = ['#B3173B', '#14213D', '#2F5D50', '#B4532A', '#5E3A5D', '#1F5F63'];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palettes[Math.abs(hash) % palettes.length];
}
