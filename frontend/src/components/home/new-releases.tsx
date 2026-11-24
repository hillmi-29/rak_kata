import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { BookCover } from '@/components/books/book-cover';
import { Rating } from '@/components/ui/rating';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/ui/reveal';
import { formatPrice } from '@/lib/format';
import type { Book } from '@/lib/types';

interface NewReleasesProps {
  books: Book[];
}

export function NewReleases({ books }: NewReleasesProps) {
  const [featured, ...rest] = books;

  if (!featured) return null;

  return (
    <section className="container-editorial py-16 lg:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="Baru terbit"
          title="Yang baru sampai di meja kami"
          description="Buku-buku yang baru saja kami buka dari kardus. Masih hangat, masih rapi."
          href="/books?sort=newest"
          linkLabel="Semua buku baru"
        />
      </Reveal>

      <div className="mt-9 grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
        <Reveal className="min-w-0">
          <div className="group relative overflow-hidden rounded-xl border border-line bg-gradient-to-br from-[#f1e7d6] via-cream to-[#fbf8f2] p-5 sm:p-9">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-navy/5" />
            <div className="pointer-events-none absolute -bottom-10 right-4 font-display text-[140px] font-bold leading-none text-navy/[0.035]">
              Baru
            </div>
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              <Link href={`/book/${featured.slug}`} className="mx-auto w-[52%] max-w-[200px] shrink-0 sm:mx-0 sm:w-[45%] sm:max-w-[220px]">
                <BookCover
                  title={featured.title}
                  author={featured.author}
                  coverImage={featured.coverImage}
                  coverColor={featured.coverColor}
                  publisher={featured.publisher}
                  category={featured.category?.name}
                  className="transition duration-500 group-hover:-translate-y-2 group-hover:rotate-[1deg]"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <span className="badge bg-cherry/10 text-cherry">Baru di rak</span>
                <h3 className="mt-3 font-display text-[24px] font-semibold leading-[1.08] text-navy sm:text-[31px]">
                  {featured.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{featured.author}</p>
                <Rating value={featured.averageRating} count={featured.reviewCount} className="mt-2" />
                <p className="mt-3 line-clamp-4 text-[13px] leading-relaxed text-ink/65">
                  {featured.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <p className="font-display text-2xl font-bold text-navy">{formatPrice(featured.price)}</p>
                  <Link href={`/book/${featured.slug}`} className="btn-primary btn-sm">
                    Lihat buku
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="flex min-w-0 flex-col">
          {rest.slice(0, 4).map((book, index) => (
            <Reveal key={book.id} delay={index * 0.05}>
              <Link
                href={`/book/${book.slug}`}
                className="group flex items-center gap-4 border-b border-line py-4 first:pt-0 last:border-b-0"
              >
                <span className="w-7 shrink-0 font-display text-sm italic text-muted/60">
                  0{index + 1}
                </span>
                <div className="w-12 shrink-0 sm:w-14">
                  <BookCover
                    title={book.title}
                    author={book.author}
                    coverImage={book.coverImage}
                    coverColor={book.coverColor}
                    category={book.category?.name}
                    className="transition duration-300 group-hover:-translate-y-1"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted/70">
                    {book.category?.name}
                  </p>
                  <h4 className="mt-0.5 line-clamp-1 font-display text-lg font-semibold text-navy transition group-hover:text-cherry">
                    {book.title}
                  </h4>
                  <p className="text-xs text-muted">{book.author}</p>
                </div>
                <div className="text-right">
                  <p className="tabular text-sm font-bold text-navy">{formatPrice(book.price)}</p>
                  <p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-muted">
                    <BookOpen className="h-3 w-3" />
                    {book.pages} hlm
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
