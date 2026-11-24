import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/format';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  align?: 'left' | 'center';
  className?: string;
  light?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = 'Lihat semua',
  align = 'left',
  className,
  light = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
        className
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && <p className={cn('eyebrow mb-2', light && 'text-[#F0B7C4]')}>{eyebrow}</p>}
        <h2
          className={cn(
            'font-display text-[30px] font-semibold leading-[1.05] tracking-tight sm:text-[38px]',
            light ? 'text-cream' : 'text-navy'
          )}
        >
          {title}
        </h2>
        {description && (
          <p className={cn('mt-2.5 max-w-xl text-sm leading-relaxed', light ? 'text-cream/70' : 'text-muted')}>
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className={cn(
            'group inline-flex shrink-0 items-center gap-2 text-sm font-semibold',
            light ? 'text-cream hover:text-white' : 'text-navy hover:text-cherry'
          )}
        >
          {linkLabel}
          <span className="grid h-8 w-8 place-items-center rounded-full border border-current/20 transition group-hover:translate-x-1 group-hover:border-current">
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      )}
    </div>
  );
}
