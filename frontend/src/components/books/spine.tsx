'use client';

import { coverTheme, spineHeight, spineWidth } from '@/lib/cover';
import { cn } from '@/lib/format';
import type { Book } from '@/lib/types';

interface SpineProps {
  book: Book;
  index?: number;
  onClick?: () => void;
  active?: boolean;
  lean?: boolean;
  className?: string;
}

export function Spine({ book, index = 0, onClick, active = false, lean = false, className }: SpineProps) {
  const theme = coverTheme(book.slug, book.coverColor);
  const width = spineWidth(book.pages);
  const height = spineHeight(book.title, index);

  const spineStyle = {
      width,
      height,
      '--spine': theme.color,
      '--spine-ink': theme.ink,
      transform: lean ? 'rotate(6deg) translateY(1px)' : undefined,
      opacity: active ? 1 : undefined,
    } as React.CSSProperties;

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${book.title} — ${book.author}`}
      aria-label={`Lihat ${book.title}`}
      className={cn('spine shrink-0', lean && 'origin-bottom', className)}
      style={spineStyle}
    >
      <span className="spine-text">{book.title}</span>
    </button>
  );
}

interface DecorativeStackProps {
  colors?: string[];
}

export function DecorativeStack({ colors = ['#B4532A', '#14213D'] }: DecorativeStackProps) {
  return (
    <div className="relative ml-auto mr-2 hidden h-9 w-24 flex-col justify-end sm:flex" aria-hidden>
      {colors.map((color, index) => (
        <div
          key={`${color}-${index}`}
          className="h-4 rounded-[2px] border border-black/10 shadow-sm"
          style={{
            width: `${94 - index * 12}%`,
            background: `linear-gradient(180deg, ${color}, color-mix(in srgb, ${color} 72%, #000))`,
            marginLeft: index * 8,
          }}
        />
      ))}
    </div>
  );
}

export function ShelfPlant() {
  return (
    <div className="relative ml-1 hidden h-[58px] w-11 shrink-0 items-end justify-center sm:flex" aria-hidden>
      <div className="absolute bottom-0 h-7 w-8 rounded-b-[4px] rounded-t-sm bg-[#B4532A] shadow-inner">
        <div className="mx-auto mt-1 h-1 w-6 rounded-full bg-black/15" />
      </div>
      <div className="absolute bottom-5 left-1/2 h-9 w-9 -translate-x-1/2">
        <span className="absolute bottom-0 left-1/2 h-8 w-1.5 origin-bottom -translate-x-1/2 -rotate-[28deg] rounded-full bg-[#3E6B52]" />
        <span className="absolute bottom-0 left-1/2 h-7 w-1.5 origin-bottom -translate-x-1/2 rotate-[30deg] rounded-full bg-[#2F5D50]" />
        <span className="absolute bottom-0 left-1/2 h-9 w-1.5 origin-bottom -translate-x-1/2 rotate-[2deg] rounded-full bg-[#4C7A5E]" />
        <span className="absolute bottom-0 left-1/2 h-6 w-1.5 origin-bottom -translate-x-1/2 -rotate-[55deg] rounded-full bg-[#5E8C6E]" />
      </div>
    </div>
  );
}

export function Bookend() {
  return (
    <div className="relative ml-2 hidden h-[48px] w-4 shrink-0 sm:block" aria-hidden>
      <div className="absolute bottom-0 left-0 h-full w-1.5 rounded-sm bg-[#5A3B24]" />
      <div className="absolute bottom-0 left-0 h-1.5 w-full rounded-sm bg-[#5A3B24]" />
    </div>
  );
}
