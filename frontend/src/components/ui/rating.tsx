import { Star } from 'lucide-react';
import { cn } from '@/lib/format';

interface RatingProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
  className?: string;
}

export function Rating({ value, count, size = 'sm', showValue = true, className }: RatingProps) {
  const rounded = Math.round(value || 0);
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={cn(
              iconSize,
              star <= rounded ? 'fill-[#D9A404] text-[#D9A404]' : 'fill-transparent text-line'
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className={cn('font-semibold tabular text-navy', size === 'sm' ? 'text-[11px]' : 'text-sm')}>
          {(value || 0).toFixed(1).replace('.', ',')}
        </span>
      )}
      {typeof count === 'number' && count > 0 && (
        <span className="text-[11px] text-muted">({count})</span>
      )}
      <span className="sr-only">Rating {(value || 0).toFixed(1)} dari 5</span>
    </div>
  );
}
