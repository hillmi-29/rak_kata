'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  ChevronRight,
  Filter,
  Grid2X2,
  LibraryBig,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { api, queryString } from '@/lib/api';
import { cn, formatPrice, stockLabel } from '@/lib/format';
import type { Book, Category, Meta } from '@/lib/types';
import { BookCard, BookCardSkeleton } from '@/components/books/book-card';
import { BookCover } from '@/components/books/book-cover';
import { Bookshelf } from '@/components/books/bookshelf';
import { Rating } from '@/components/ui/rating';
import { Pagination } from '@/components/ui/pagination';
import { Drawer } from '@/components/ui/drawer';
import { EmptyState } from '@/components/ui/empty-state';
import { useCart } from '@/lib/cart-context';
import type { SakugaButtonElement } from '@/types/sakuga';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'popular', label: 'Terpopuler' },
  { value: 'price_asc', label: 'Harga Terendah' },
  { value: 'price_desc', label: 'Harga Tertinggi' },
];

const MAX_PRICE = 250000;

interface AppliedFilters {
  search: string;
  category: string;
  author: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  sortBy: string;
  view: 'grid' | 'shelf';
  page: number;
}

function useAppliedFilters(): AppliedFilters {
  const searchParams = useSearchParams();
  return useMemo(
    () => ({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      author: searchParams.get('author') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      inStock: searchParams.get('inStock') === 'true',
      sortBy: searchParams.get('sortBy') || searchParams.get('sort') || 'newest',
      view: searchParams.get('view') === 'shelf' ? 'shelf' : 'grid',
      page: Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1),
    }),
    [searchParams]
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogContent />
    </Suspense>
  );
}

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applied = useAppliedFilters();
  const { addItem } = useCart();
  const quickAddRef = useRef<SakugaButtonElement | null>(null);

  const [books, setBooks] = useState<Book[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<Book | null>(null);
  const [draft, setDraft] = useState({
    category: applied.category,
    author: applied.author,
    minPrice: applied.minPrice,
    maxPrice: applied.maxPrice || String(MAX_PRICE),
    inStock: applied.inStock,
  });

  useEffect(() => {
    setDraft({
      category: applied.category,
      author: applied.author,
      minPrice: applied.minPrice,
      maxPrice: applied.maxPrice || String(MAX_PRICE),
      inStock: applied.inStock,
    });
  }, [applied]);

  useEffect(() => {
    let active = true;
    api
      .get<Category[]>('/categories')
      .then(response => {
        if (active) setCategories(response.data);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const limit = applied.view === 'shelf' ? 24 : 12;

  useEffect(() => {
    let active = true;
    const append = applied.view === 'shelf' && applied.page > 1;

    if (append) setLoadingMore(true);
    else setLoading(true);
    setError('');

    const query = queryString({
      page: applied.page,
      limit,
      search: applied.search,
      category: applied.category,
      author: applied.author,
      minPrice: applied.minPrice,
      maxPrice: applied.maxPrice,
      inStock: applied.inStock ? 'true' : undefined,
      sortBy: applied.sortBy,
    });

    api
      .get<Book[]>(`/books${query}`)
      .then(response => {
        if (!active) return;
        setBooks(current => {
          if (!append) return response.data;
          const merged = new Map(current.map(book => [book.id, book]));
          response.data.forEach(book => merged.set(book.id, book));
          return Array.from(merged.values());
        });
        setMeta(response.meta || null);
      })
      .catch(err => {
        if (active) setError(err instanceof Error ? err.message : 'Gagal memuat buku');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setLoadingMore(false);
        }
      });

    return () => {
      active = false;
    };
  }, [applied, limit]);

  function updateQuery(patch: Record<string, string | number | undefined>, resetPage = true) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === null) params.delete(key);
      else params.set(key, String(value));
    });
    if (resetPage) params.set('page', '1');
    router.push(`/books?${params.toString()}`, { scroll: false });
  }

  function selectCategory(slug: string) {
    setDraft(current => ({ ...current, category: slug }));
    updateQuery({ category: slug || undefined });
  }

  function applyFilters() {
    updateQuery({
      category: draft.category || undefined,
      author: draft.author.trim() || undefined,
      minPrice: draft.minPrice ? Number(draft.minPrice) : undefined,
      maxPrice:
        draft.maxPrice && Number(draft.maxPrice) < MAX_PRICE ? Number(draft.maxPrice) : undefined,
      inStock: draft.inStock ? 'true' : undefined,
    });
    setFilterOpen(false);
  }

  function resetFilters() {
    const params = new URLSearchParams();
    if (applied.sortBy !== 'newest') params.set('sortBy', applied.sortBy);
    if (applied.view === 'shelf') params.set('view', 'shelf');
    const query = params.toString();
    router.push(query ? `/books?${query}` : '/books', { scroll: false });
    setFilterOpen(false);
  }

  function switchView(view: 'grid' | 'shelf') {
    if (view === applied.view) return;
    updateQuery({ view: view === 'shelf' ? 'shelf' : undefined });
  }

  async function handleQuickAdd() {
    if (!selected) return;
    const ok = await addItem(selected, 1);
    if (ok) quickAddRef.current?.done();
  }

  const groupedShelves = useMemo(() => {
    const map = new Map<string, Book[]>();
    books.forEach(book => {
      const label = book.category?.name || 'Buku';
      map.set(label, [...(map.get(label) || []), book]);
    });
    return Array.from(map.entries()).map(([label, shelfBooks]) => ({ label, books: shelfBooks }));
  }, [books]);

  const activeChips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (applied.search) {
    activeChips.push({
      key: 'search',
      label: `"${applied.search}"`,
      clear: () => updateQuery({ search: undefined }),
    });
  }
  if (applied.category) {
    const category = categories.find(item => item.slug === applied.category);
    activeChips.push({
      key: 'category',
      label: category?.name || applied.category,
      clear: () => updateQuery({ category: undefined }),
    });
  }
  if (applied.author) {
    activeChips.push({ key: 'author', label: applied.author, clear: () => updateQuery({ author: undefined }) });
  }
  if (applied.minPrice || applied.maxPrice) {
    activeChips.push({
      key: 'price',
      label: `${formatPrice(Number(applied.minPrice || 0))} – ${formatPrice(Number(applied.maxPrice || MAX_PRICE))}`,
      clear: () => updateQuery({ minPrice: undefined, maxPrice: undefined }),
    });
  }
  if (applied.inStock) {
    activeChips.push({
      key: 'stock',
      label: 'Stok tersedia',
      clear: () => updateQuery({ inStock: undefined }),
    });
  }

  const total = meta?.total ?? 0;
  const pageTitle = applied.search
    ? `Hasil untuk “${applied.search}”`
    : applied.category
      ? categories.find(item => item.slug === applied.category)?.name || 'Katalog'
      : 'Semua Buku';

  const totalAllCategories = useMemo(
    () => categories.reduce((sum, item) => sum + (item._count?.books ?? 0), 0),
    [categories]
  );

  const filterPanel = (
    <div className="space-y-7">
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-navy">
          Kategori
        </h3>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => selectCategory('')}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition',
              !draft.category ? 'bg-navy text-cream' : 'text-ink/70 hover:bg-white'
            )}
          >
            Semua kategori
            <span className="text-[10px] opacity-60">{totalAllCategories || meta?.total || ''}</span>
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              type="button"
              onClick={() => selectCategory(category.slug)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition',
                draft.category === category.slug
                  ? 'bg-navy text-cream'
                  : 'text-ink/70 hover:bg-white'
              )}
            >
              <span>{category.name}</span>
              {typeof category._count?.books === 'number' ? (
                <span className="text-[10px] opacity-60">{category._count.books}</span>
              ) : (
                <ChevronRight className="h-3.5 w-3.5 opacity-40" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h3 className="mb-3 font-display text-lg font-semibold text-navy">Rentang Harga</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={MAX_PRICE}
            value={draft.minPrice}
            onChange={event => setDraft(current => ({ ...current, minPrice: event.target.value }))}
            placeholder="Min"
            className="input h-9 text-xs"
            aria-label="Harga minimum"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            min={0}
            max={MAX_PRICE}
            value={draft.maxPrice}
            onChange={event => setDraft(current => ({ ...current, maxPrice: event.target.value }))}
            placeholder="Maks"
            className="input h-9 text-xs"
            aria-label="Harga maksimum"
          />
        </div>
        <input
          type="range"
          min={0}
          max={MAX_PRICE}
          step={5000}
          value={Number(draft.maxPrice) || MAX_PRICE}
          onChange={event => setDraft(current => ({ ...current, maxPrice: event.target.value }))}
          className="mt-4 w-full accent-cherry"
          aria-label="Harga maksimum"
        />
        <div className="mt-1 flex justify-between text-[10px] text-muted">
          <span>Rp 0</span>
          <span>{formatPrice(MAX_PRICE)}</span>
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <label className="label" htmlFor="author-filter">
          Penulis
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            id="author-filter"
            value={draft.author}
            onChange={event => setDraft(current => ({ ...current, author: event.target.value }))}
            placeholder="Nama penulis"
            className="input pl-9"
          />
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/75">
          <input
            type="checkbox"
            checked={draft.inStock}
            onChange={event => {
              const checked = event.target.checked;
              setDraft(current => ({ ...current, inStock: checked }));
              updateQuery({ inStock: checked ? 'true' : undefined });
            }}
            className="checkbox"
          />
          Hanya tampilkan stok tersedia
        </label>
      </div>

      <div className="space-y-2 border-t border-line pt-6">
        <button type="button" onClick={applyFilters} className="btn-primary w-full">
          Terapkan Filter
        </button>
        <button type="button" onClick={resetFilters} className="btn-ghost w-full text-xs">
          <RotateCcw className="h-3.5 w-3.5" />
          Reset filter
        </button>
      </div>
    </div>
  );

  return (
    <div className="container-editorial py-8 lg:py-12">
      <nav className="flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/" className="transition hover:text-cherry">Beranda</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-navy">Katalog</span>
        {applied.category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span className="text-navy">
              {categories.find(item => item.slug === applied.category)?.name || applied.category}
            </span>
          </>
        )}
      </nav>

      <div className="mt-5 flex flex-col gap-4 border-b border-line pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Katalog buku</p>
          <h1 className="mt-2 font-display text-[30px] font-semibold tracking-tight text-navy sm:text-[46px]">
            {pageTitle}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {loading ? 'Mencari di rak...' : `${total} buku ditemukan`}
            {applied.inStock && ' · hanya yang tersedia'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="btn-secondary btn-sm lg:hidden"
          >
            <Filter className="h-3.5 w-3.5" />
            Filter
          </button>

          <div className="flex items-center rounded-lg border border-line bg-white p-1">
            <button
              type="button"
              onClick={() => switchView('grid')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition',
                applied.view === 'grid' ? 'bg-navy text-cream' : 'text-muted hover:text-navy'
              )}
              aria-pressed={applied.view === 'grid'}
            >
              <Grid2X2 className="h-3.5 w-3.5" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => switchView('shelf')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition',
                applied.view === 'shelf' ? 'bg-navy text-cream' : 'text-muted hover:text-navy'
              )}
              aria-pressed={applied.view === 'shelf'}
            >
              <LibraryBig className="h-3.5 w-3.5" />
              Rak 3D
            </button>
          </div>

          <select
            value={applied.sortBy}
            onChange={event => updateQuery({ sortBy: event.target.value })}
            className="select h-[38px] min-w-[130px] flex-1 py-0 text-xs font-semibold sm:w-auto sm:min-w-[150px] sm:flex-initial"
            aria-label="Urutkan buku"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-[92px] max-h-[calc(100vh-110px)] overflow-y-auto rounded-xl border border-line bg-white/55 p-5 thin-scrollbar">
            <div className="mb-5 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-cherry" />
              <h2 className="font-display text-xl font-semibold text-navy">Filter</h2>
            </div>
            {filterPanel}
          </div>
        </aside>

        <div className="min-w-0">
          {activeChips.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Aktif:</span>
              {activeChips.map(chip => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.clear}
                  className="inline-flex items-center gap-1.5 rounded-full border border-cherry/20 bg-cherry/5 px-3 py-1 text-xs font-medium text-cherry transition hover:bg-cherry/10"
                >
                  {chip.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
              <button type="button" onClick={resetFilters} className="text-[11px] font-semibold text-muted underline-offset-2 hover:underline">
                Hapus semua
              </button>
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-ink/70">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <BookCardSkeleton key={index} />
              ))}
            </div>
          ) : books.length === 0 ? (
            <EmptyState
              title="Tidak ada buku di rak ini"
              description="Coba longgarkan filter, ubah kata kunci, atau lihat seluruh katalog kami."
              actionLabel="Reset filter"
              onAction={resetFilters}
              icon={<Search className="h-7 w-7" />}
            />
          ) : applied.view === 'grid' ? (
            <>
              <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
                {books.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
              <Pagination
                page={applied.page}
                totalPages={meta?.totalPages || 1}
                buildHref={page => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', String(page));
                  return `/books?${params.toString()}`;
                }}
                className="mt-12"
              />
            </>
          ) : (
            <div>
              <div className="mb-5 rounded-xl border border-line bg-white/55 px-4 py-3 text-xs text-muted">
                Rak menampilkan {books.length} dari {total} buku. Klik punggung buku untuk membaca sinopsisnya.
              </div>
              <div className="overflow-x-auto pb-4 hide-scrollbar">
                <Bookshelf
                  groups={groupedShelves}
                  onSelect={setSelected}
                  className="min-w-[620px]"
                />
              </div>
              {applied.page < (meta?.totalPages || 1) && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', String(applied.page + 1));
                      router.push(`/books?${params.toString()}`, { scroll: false });
                    }}
                    className="btn-secondary"
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Menyusun rak...' : 'Muat rak berikutnya'}
                    {!loadingMore && <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title}
        description={selected?.author}
        width="sm"
        mobileFullScreen
        footer={
          selected && (
            <div className="flex gap-2">
              <Link href={`/book/${selected.slug}`} className="btn-secondary flex-1">
                Lihat Detail
              </Link>
              <sakuga-button
                ref={quickAddRef}
                onClick={handleQuickAdd}
                disabled={selected.stock <= 0}
                className="sakuga-compact sakuga-full flex-1"
              >
                {selected.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
              </sakuga-button>
            </div>
          )
        }
      >
        {selected && (
          <div>
            <div className="flex gap-5">
              <div className="w-[38%] max-w-[160px]">
                <BookCover
                  title={selected.title}
                  author={selected.author}
                  coverImage={selected.coverImage}
                  coverColor={selected.coverColor}
                  publisher={selected.publisher}
                  category={selected.category?.name}
                />
              </div>
              <div className="flex-1">
                <span className="badge bg-navy/10 text-navy">{selected.category?.name}</span>
                <Rating value={selected.averageRating} count={selected.reviewCount} className="mt-3" />
                <p className="mt-4 font-display text-2xl font-bold text-navy">{formatPrice(selected.price)}</p>
                <p className={cn('mt-2 text-xs font-semibold', stockLabel(selected.stock).className.replace('badge ', ''))}>
                  {stockLabel(selected.stock).label}
                </p>
                <div className="mt-4 space-y-1.5 text-xs text-muted">
                  <p>{selected.pages} halaman · {selected.publisher}</p>
                  <p>{selected.publishedYear} · {selected.language}</p>
                  <p>Berat {selected.weight} gram</p>
                </div>
              </div>
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <h3 className="mb-2 font-display text-lg font-semibold text-navy">Sinopsis</h3>
              <p className="text-sm leading-relaxed text-ink/70">{selected.description}</p>
            </div>
          </div>
        )}
      </Drawer>

      <Drawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter buku"
        description="Persempit rak sesuai selera Anda."
        width="sm"
        mobileFullScreen
        footer={
          <div className="flex gap-2">
            <button type="button" onClick={resetFilters} className="btn-secondary flex-1">
              Reset
            </button>
            <button type="button" onClick={applyFilters} className="btn-primary flex-1">
              Terapkan
            </button>
          </div>
        }
      >
        {filterPanel}
      </Drawer>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="container-editorial py-10">
      <div className="skeleton h-4 w-40 rounded" />
      <div className="skeleton mt-4 h-10 w-72 rounded" />
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <BookCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
