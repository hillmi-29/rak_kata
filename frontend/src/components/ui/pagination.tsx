import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/format';

interface PaginationProps {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
}

export function Pagination({ page, totalPages, buildHref, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    number => number === 1 || number === totalPages || Math.abs(number - page) <= 1
  );

  return (
    <nav className={cn('flex flex-wrap items-center justify-center gap-1.5', className)} aria-label="Navigasi halaman">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={cn(
          'grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-navy transition hover:border-navy',
          page <= 1 && 'pointer-events-none opacity-40'
        )}
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      {pages.map((number, index) => {
        const previous = pages[index - 1];
        const gap = previous && number - previous > 1;
        return (
          <span key={number} className="flex items-center gap-1.5">
            {gap && <span className="px-1 text-xs text-muted">...</span>}
            <Link
              href={buildHref(number)}
              aria-current={number === page ? 'page' : undefined}
              className={cn(
                'grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm font-semibold transition',
                number === page
                  ? 'border-cherry bg-cherry text-white'
                  : 'border-line bg-white text-navy hover:border-navy'
              )}
            >
              {number}
            </Link>
          </span>
        );
      })}
      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={cn(
          'grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-navy transition hover:border-navy',
          page >= totalPages && 'pointer-events-none opacity-40'
        )}
        aria-label="Halaman berikutnya"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
