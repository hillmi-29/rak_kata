'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';
import { api } from '@/lib/api';
import type { Book, Category } from '@/lib/types';
import { HeroShelf } from '@/components/home/hero-shelf';
import { CategoryStrip } from '@/components/home/category-strip';
import { BestsellerRow } from '@/components/home/bestseller-row';
import { NewReleases } from '@/components/home/new-releases';
import { TrustBanner } from '@/components/home/trust-banner';
import { Reveal } from '@/components/ui/reveal';
import { BookCover } from '@/components/books/book-cover';

const fallbackCategories: Category[] = [
  { id: 'fiksi', name: 'Fiksi', slug: 'fiksi' },
  { id: 'sastra', name: 'Sastra', slug: 'sastra' },
  { id: 'non-fiksi', name: 'Non-Fiksi', slug: 'non-fiksi' },
  { id: 'pengembangan-diri', name: 'Pengembangan Diri', slug: 'pengembangan-diri' },
  { id: 'bisnis', name: 'Bisnis', slug: 'bisnis' },
  { id: 'anak', name: 'Anak', slug: 'anak' },
];

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get<Book[]>('/books?limit=100&sortBy=popular'),
      api.get<Category[]>('/categories'),
    ])
      .then(([bookResponse, categoryResponse]) => {
        if (!active) return;
        setBooks(bookResponse.data);
        if (categoryResponse.data.length > 0) setCategories(categoryResponse.data);
      })
      .catch(err => {
        if (active) setError(err instanceof Error ? err.message : 'Gagal memuat katalog');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const newest = useMemo(
    () =>
      [...books]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 5),
    [books]
  );

  const quoteBooks = useMemo(() => books.filter(book => book.averageRating >= 4.5).slice(0, 3), [books]);

  return (
    <>
      <HeroShelf books={books} loading={loading} />

      {error && (
        <div className="container-editorial pt-6">
          <div className="rounded-xl border border-warning/30 bg-warning/5 px-5 py-4 text-sm text-ink/75">
            Katalog belum bisa dimuat: {error}. Pastikan API berjalan di{' '}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">localhost:3000</code>.
          </div>
        </div>
      )}

      {loading ? (
        <div className="container-editorial py-16">
          <div className="skeleton h-8 w-64 rounded" />
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton h-40 rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <CategoryStrip categories={categories} books={books} />
      )}

      <BestsellerRow books={books} />

      <section className="container-editorial py-16 lg:py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-line bg-cream-dark px-6 py-12 sm:px-12 lg:px-16">
            <div className="pointer-events-none absolute -left-6 -top-10 font-display text-[220px] leading-none text-navy/[0.045]">
              &ldquo;
            </div>
            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-10">
              <div className="min-w-0">
                <p className="eyebrow">Catatan dari rak</p>
                <Quote className="mt-4 h-6 w-6 text-cherry/40 sm:mt-5 sm:h-7 sm:w-7" />
                <blockquote className="mt-3 max-w-2xl font-display text-[22px] font-medium leading-[1.2] tracking-tight text-navy sm:text-[32px] lg:text-[38px] lg:leading-[1.15]">
                  Seorang pembaca hidup seribu kehidupan sebelum ia mati. Yang tidak pernah membaca
                  hanya hidup satu.
                </blockquote>
                <p className="mt-5 font-hand text-xl text-muted">— George R.R. Martin, dikutip di rak kami</p>
                <Link href="/books" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-cherry">
                  Temukan kehidupan berikutnya
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="flex items-end justify-center gap-3 lg:justify-end">
                {quoteBooks.map((book, index) => (
                  <Link
                    key={book.id}
                    href={`/book/${book.slug}`}
                    className={
                      index === 1
                        ? 'w-[38%] max-w-[160px] -translate-y-5 transition hover:-translate-y-7'
                        : 'w-[31%] max-w-[130px] transition hover:-translate-y-2'
                    }
                  >
                    <BookCover
                      title={book.title}
                      author={book.author}
                      coverImage={book.coverImage}
                      coverColor={book.coverColor}
                      category={book.category?.name}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {!loading && <NewReleases books={newest} />}

      <TrustBanner />
    </>
  );
}
