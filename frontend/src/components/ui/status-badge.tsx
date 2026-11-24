import { cn } from '@/lib/format';
import { orderStatusMeta, paymentStatusMeta } from '@/lib/format';
import type { OrderStatus, PaymentStatus } from '@/lib/types';

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const meta = orderStatusMeta[status] || orderStatusMeta.PENDING;
  return <span className={cn(meta.className, className)}>{meta.label}</span>;
}

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  const meta = paymentStatusMeta[status] || paymentStatusMeta.PENDING;
  return <span className={cn(meta.className, className)}>{meta.label}</span>;
}
