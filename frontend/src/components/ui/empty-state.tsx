import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/format';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-white/50 px-6 py-14 text-center',
        className
      )}
    >
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-cream-dark text-navy">
        {icon || <BookOpen className="h-7 w-7" />}
      </div>
      <h3 className="font-display text-2xl font-semibold text-navy">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-primary mt-6">
          {actionLabel}
        </Link>
      )}
      {onAction && actionLabel && (
        <button type="button" onClick={onAction} className="btn-primary mt-6">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
