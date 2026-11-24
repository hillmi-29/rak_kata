'use client';

import Link from 'next/link';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/ui/reveal';
import type { Book, Category } from '@/lib/types';

const meta: Record<
  string,
  { bg: string; fg: string; blurb: string; decor: string; className: string }
> = {
  fiksi: {
    bg: '#B3173B',
    fg: '#FAF6EF',
    blurb: 'Novel dan cerita yang membuat kita tinggal lebih lama di dunia lain.',
    decor: 'rgba(255,255,255,0.16)',
    className: 'md:col-span-5 md:row-span-2',
  },
  sastra: {
    bg: '#14213D',
    fg: '#FAF6EF',
    blurb: 'Karya klasik dan suara-suara penting sastra Indonesia.',
    decor: 'rgba(255,255,255,0.13)',
    className: 'md:col-span-4',
  },
  'non-fiksi': {
    bg: '#2F5D50',
    fg: '#FAF6EF',
    blurb: 'Sejarah, gagasan, dan pengetahuan untuk melihat lebih jauh.',
    decor: 'rgba(255,255,255,0.14)',
    className: 'md:col-span-3',
  },
  'pengembangan-diri': {
    bg: '#D9A404',
    fg: '#1B1B1F',
    blurb: 'Kebiasaan kecil dan cara berpikir yang menumbuhkan.',
    decor: 'rgba(27,27,31,0.13)',
    className: 'md:col-span-3',
  },
  bisnis: {
    bg: '#E6DFD3',
    fg: '#14213D',
    blurb: 'Strategi, uang, dan keberanian membangun sesuatu.',
    decor: 'rgba(20,33,61,0.1)',
    className: 'md:col-span-2',
  },
  anak: {
    bg: '#6B8CAE',
    fg: '#FAF6EF',
    blurb: 'Cerita dan rasa ingin tahu untuk pembaca muda.',
    decor: 'rgba(255,255,255,0.18)',
    className: 'md:col-span-2',
  },
};

interface CategoryStripProps {
  categories: Category[];
  books: Book[];
}

export function CategoryStrip({ categories, books }: CategoryStripProps) {
  const ordered = [...categories].sort(
    (a, b) => Object.keys(meta).indexOf(a.slug) - Object.keys(meta).indexOf(b.slug)
  );

  return (
    <section className="container-editorial py-16 lg:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="Kategori pilihan"
          title="Mulai dari rak yang paling Anda sukai"
          description="Enam rak kecil yang kami rawat dengan sabar. Pilih satu, lalu biarkan judul-judulnya menemukan Anda."
          href="/books"
          linkLabel="Semua kategori"
        />
      </Reveal>

      <div className="mt-8 grid auto-rows-[minmax(176px,auto)] grid-cols-1 gap-3 sm:auto-rows-[minmax(190px,auto)] sm:grid-cols-2 md:auto-rows-[minmax(205px,auto)] md:grid-cols-12 md:gap-4">
        {ordered.map((category, index) => {
          const style = meta[category.slug] || {
            bg: '#E6DFD3',
            fg: '#14213D',
            blurb: category.description || 'Buku pilihan dari rak kami.',
            decor: 'rgba(20,33,61,0.1)',
            className: 'md:col-span-3',
          };
          const count = books.filter(book => book.category?.slug === category.slug).length;
          return (
            <Reveal
              key={category.id}
              delay={index * 0.04}
              className={`${style.className} ${category.slug === 'fiksi' ? 'sm:col-span-2' : ''} h-full`}
            >
              <Link
                href={`/books?category=${category.slug}`}
                className="group relative flex h-full overflow-hidden rounded-xl p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lift md:p-6"
                style={{ backgroundColor: style.bg, color: style.fg }}
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full border"
                  style={{ borderColor: style.decor }}
                />
                <div
                  className="pointer-events-none absolute -bottom-10 right-6 flex items-end gap-1.5 opacity-70 transition duration-500 group-hover:translate-y-[-6px]"
                  aria-hidden
                >
                  {[44, 62, 52, 74].map((height, spineIndex) => (
                    <span
                      key={spineIndex}
                      className="w-3 rounded-sm"
                      style={{
                        height,
                        backgroundColor: style.decor,
                        transform: `rotate(${spineIndex === 3 ? -4 : 0}deg)`,
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10 flex h-full w-full flex-col">
                  <div className="flex items-start justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                      0{index + 1} · Kategori
                    </p>
                    <ArrowUpRight className="h-4 w-4 opacity-50 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </div>
                  <h3 className="mt-2 font-display text-[24px] font-semibold leading-[1.08] tracking-tight md:text-[28px]">
                    {category.name}
                  </h3>
                  <p className="mt-2 max-w-[22rem] text-[12px] leading-relaxed opacity-70">
                    {style.blurb}
                  </p>
                  <div className="mt-auto flex items-center gap-2 pt-4 text-[11px] font-semibold">
                    <BookOpen className="h-3.5 w-3.5 opacity-70" />
                    {count > 0 ? `${count} judul di rak` : 'Segera hadir'}
                  </div>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
