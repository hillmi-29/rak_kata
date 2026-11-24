'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/format';

interface QtyStepperProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export function QtyStepper({ value, onChange, max = 99, min = 1, size = 'md', disabled }: QtyStepperProps) {
  const buttonClass = cn(
    'grid place-items-center text-muted transition hover:text-cherry disabled:cursor-not-allowed disabled:opacity-30',
    size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'
  );

  return (
    <div
      className={cn(
        'inline-flex items-center overflow-hidden rounded-lg border border-line bg-white',
        size === 'sm' ? 'h-8' : 'h-10'
      )}
    >
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label="Kurangi jumlah"
      >
        <Minus className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      </button>
      <span
        className={cn(
          'grid place-items-center font-semibold tabular text-ink',
          size === 'sm' ? 'w-7 text-xs' : 'w-9 text-sm'
        )}
      >
        {value}
      </span>
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Tambah jumlah"
      >
        <Plus className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      </button>
    </div>
  );
}
