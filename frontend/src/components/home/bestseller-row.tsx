'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BookCard } from '@/components/books/book-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/ui/reveal';
import type { Book } from '@/lib/types';

interface BestsellerRowProps {
  books: Book[];
}

export function BestsellerRow({ books }: BestsellerRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 1 | -1) {
    scrollRef.current?.scrollBy({ left: direction * 460, behavior: 'smooth' });
  }

  return (
    <section className="border-y border-line bg-white/45 py-16 lg:py-20">
      <div className="container-editorial">
        <Reveal>
          <SectionHeading
            eyebrow="Paling dicari"
            title="Buku yang sedang dibaca banyak orang"
            description="Pilihan pembaca bulan ini. Kalau ragu, mulai dari sini."
            href="/books?sort=popular"
          />
        </Reveal>

        <div className="mt-9 flex items-start gap-3 sm:gap-4 xl:-mx-[60px]">
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="mt-[127px] hidden h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-cream text-navy shadow-sm transition hover:scale-105 hover:border-navy hover:bg-navy hover:text-cream sm:grid"
            aria-label="Geser ke kiri"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            ref={scrollRef}
            className="hide-scrollbar flex min-w-0 flex-1 snap-x snap-mandatory gap-5 overflow-x-auto pb-3 pt-2"
          >
            {books.slice(0, 10).map(book => (
              <div
                key={book.id}
                className="w-[168px] shrink-0 snap-start sm:w-[188px]"
              >
                <BookCard book={book} />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll(1)}
            className="mt-[127px] hidden h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-cream text-navy shadow-sm transition hover:scale-105 hover:border-navy hover:bg-navy hover:text-cream sm:grid"
            aria-label="Geser ke kanan"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
