'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { AdminLayout } from '@/components/layout/admin-layout';
import { cn, formatPrice, stockLabel } from '@/lib/format';
import type { Book, Category } from '@/lib/types';
import { BookCover } from '@/components/books/book-cover';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Tidak Aktif' },
  { value: 'low-stock', label: 'Stok Menipis' },
  { value: 'out-of-stock', label: 'Habis' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'price-asc', label: 'Harga Terendah' },
  { value: 'price-desc', label: 'Harga Tertinggi' },
  { value: 'stock-asc', label: 'Stok Sedikit' },
  { value: 'stock-desc', label: 'Stok Banyak' },
  { value: 'title-asc', label: 'Judul A-Z' },
  { value: 'title-desc', label: 'Judul Z-A' },
];

function AdminBooksContent() {
  const searchParams = useSearchParams();

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{ page: number; total: number; totalPages: number } | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Math.max(1, parseInt(searchParams.get('page') || '1', 10)));
  const [formModal, setFormModal] = useState<Book | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  interface BookFormState {
    title: string;
    author: string;
    isbn: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    publisher: string;
    publishedYear: number;
    pages: number;
    weight: number;
    coverColor: string;
    coverImage: string;
    isActive: boolean;
  }

  const [form, setForm] = useState<BookFormState>({
    title: '',
    author: '',
    isbn: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: '',
    publisher: '',
    publishedYear: new Date().getFullYear(),
    pages: 0,
    weight: 300,
    coverColor: '#B3173B',
    coverImage: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [coverColor, setCoverColor] = useState('#B3173B');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (categoryId) params.set('categoryId', categoryId);
    params.set('sort', sort);
    params.set('page', String(page));
    params.set('limit', '20');

    api
      .get<Book[]>(`/admin/books?${params.toString()}`)
      .then(response => {
        if (!active) return;
        setBooks(response.data);
        setMeta(response.meta || null);
      })
      .catch(() => {
        if (active) setBooks([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, status, categoryId, sort, page]);

  const loadCategories = async () => {
    try {
      const response = await api.get<Category[]>('/categories?limit=100');
      setCategories(response.data);
    } catch {}
  };

  function buildHref(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    return `/admin/books?${params.toString()}`;
  }

  function openCreate() {
    setForm({
      title: '',
      author: '',
      isbn: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: '',
      publisher: '',
      publishedYear: new Date().getFullYear(),
      pages: 0,
      weight: 300,
      coverColor: '#B3173B',
      coverImage: '',
      isActive: true,
    });
    setCoverColor('#B3173B');
    setFormModal({} as Book);
  }

  function openEdit(book: Book) {
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      description: book.description || '',
      price: book.price,
      stock: book.stock,
      categoryId: book.categoryId,
      publisher: book.publisher || '',
      publishedYear: book.publishedYear || new Date().getFullYear(),
      pages: book.pages || 0,
      weight: book.weight,
      coverColor: book.coverColor || '#B3173B',
      coverImage: book.coverImage || '',
      isActive: book.isActive,
    });
    setCoverColor(book.coverColor || '#B3173B');
    setFormModal(book);
  }

  function confirmDelete(id: string) {
    setDeleteId(id);
  }

  function handleDelete() {
    if (!deleteId) return;
    api
      .delete(`/admin/books/${deleteId}`)
      .then(() => {
        setBooks(current => current.filter(b => b.id !== deleteId));
        setDeleteId(null);
      })
      .catch(() => alert('Gagal menghapus buku'));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title || !form.author || !form.categoryId || !form.price || form.price <= 0) {
      alert('Lengkapi field wajib: judul, penulis, kategori, harga');
      return;
    }

    setSaving(true);
    const data = { ...form, coverColor };
    const promise = formModal?.id
      ? api.patch<Book>(`/admin/books/${formModal.id}`, data)
      : api.post<Book>('/admin/books', data);

    promise
      .then(response => {
        if (formModal?.id) {
          setBooks(current => current.map(b => (b.id === formModal!.id ? response.data : b)));
        } else {
          setBooks(current => [response.data, ...current]);
        }
        setFormModal(null);
      })
      .catch(() => alert('Gagal menyimpan buku'))
      .finally(() => setSaving(false));
  }

  function handleExport() {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (categoryId) params.set('categoryId', categoryId);
    params.set('sort', sort);
    params.set('limit', '10000');

    window.open(`/api/admin/books/export?${params.toString()}`, '_blank');
  }

  const totalBooks = meta?.total ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Admin / Buku</p>
            <h1 className="mt-2 font-display text-[30px] font-semibold tracking-tight text-navy sm:text-[44px]">
              Kelola buku
            </h1>
            <p className="mt-1.5 text-sm text-muted">{totalBooks} buku total</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={handleExport} className="btn-secondary btn-sm">
              <Download className="h-3.5 w-3.5" />
              Ekspor CSV
            </button>
            <button type="button" onClick={openCreate} className="btn-primary">
              <Plus className="h-4 w-4" />
              Tambah Buku
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-line bg-white/60 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-1 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Cari judul, penulis, ISBN..."
                  className="input pl-10"
                />
              </div>
              <select
                value={status}
                onChange={e => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="select w-full sm:w-auto sm:min-w-[150px]"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={categoryId}
                onChange={e => {
                  setCategoryId(e.target.value);
                  setPage(1);
                }}
                className="select w-full sm:w-auto sm:min-w-[150px]"
              >
                <option value="">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={e => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="select w-full sm:w-auto sm:min-w-[150px]"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {(search || status || categoryId) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatus('');
                  setCategoryId('');
                  setPage(1);
                }}
                className="btn-ghost btn-sm"
              >
                <X className="h-3.5 w-3.5" />
                Reset filter
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-line bg-white/60 overflow-hidden">
          {loading ? (
            <div className="p-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <BookRowSkeleton key={index} />
              ))}
            </div>
          ) : books.length === 0 ? (
            <EmptyState
              title="Tidak ada buku ditemukan"
              description={search || status || categoryId ? 'Coba ubah filter pencarian Anda.' : 'Belum ada buku. Tambahkan buku pertama untuk memulai.'}
              actionLabel={!(search || status || categoryId) ? 'Tambah Buku' : undefined}
              onAction={!(search || status || categoryId) ? openCreate : undefined}
              icon={<FileText className="h-7 w-7" />}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line bg-cream/50 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                      <th className="px-4 py-3">Cover</th>
                      <th className="px-4 py-3">Judul / Penulis</th>
                      <th className="px-4 py-3 hidden md:table-cell">Kategori</th>
                      <th className="px-4 py-3 hidden lg:table-cell">Harga</th>
                      <th className="px-4 py-3">Stok</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {books.map(book => (
                      <BookRow key={book.id} book={book} onEdit={openEdit} onDelete={confirmDelete} />
                    ))}
                  </tbody>
                </table>
              </div>
              {meta && meta.totalPages > 1 && (
                <Pagination page={page} totalPages={meta.totalPages} buildHref={buildHref} className="border-t border-line px-4 py-4 justify-center" />
              )}
            </>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <Modal open={Boolean(formModal)} onClose={() => setFormModal(null)} title={formModal?.id ? 'Edit Buku' : 'Tambah Buku Baru'} size="lg" mobileFullScreen footer={
        <div className="flex gap-2">
          <button type="button" onClick={() => setFormModal(null)} className="btn-secondary flex-1">Batal</button>
          <button type="submit" form="book-form" disabled={saving} className="btn-primary flex-1">{saving ? 'Menyimpan...' : 'Simpan Buku'}</button>
        </div>
      }>
        <form id="book-form" onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="title" className="label">Judul buku <span className="text-danger">*</span></label>
                  <input id="title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" required />
                </div>
                <div>
                  <label htmlFor="author" className="label">Penulis <span className="text-danger">*</span></label>
                  <input id="author" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className="input" required />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="isbn" className="label">ISBN</label>
                  <input id="isbn" value={form.isbn} onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))} className="input" placeholder="978-623-xxxxx" />
                </div>
                <div>
                  <label htmlFor="publisher" className="label">Penerbit</label>
                  <input id="publisher" value={form.publisher} onChange={e => setForm(f => ({ ...f, publisher: e.target.value }))} className="input" placeholder="Gramedia, Mizan, dll" />
                </div>
                <div>
                  <label htmlFor="publishedYear" className="label">Tahun terbit</label>
                  <input id="publishedYear" type="number" min="1900" max={new Date().getFullYear() + 1} value={form.publishedYear} onChange={e => setForm(f => ({ ...f, publishedYear: parseInt(e.target.value) || 0 }))} className="input" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="pages" className="label">Jumlah halaman</label>
                  <input id="pages" type="number" min="1" value={form.pages} onChange={e => setForm(f => ({ ...f, pages: parseInt(e.target.value) || 0 }))} className="input" />
                </div>
                <div>
                  <label htmlFor="weight" className="label">Berat (gram)</label>
                  <input id="weight" type="number" min="1" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: parseInt(e.target.value) || 0 }))} className="input" />
                </div>
              </div>

              <div>
                <label htmlFor="categoryId" className="label">Kategori <span className="text-danger">*</span></label>
                <select id="categoryId" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="select" required>
                  <option value="">Pilih kategori</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="label">Deskripsi</label>
                <textarea id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="textarea" rows={4} placeholder="Sinopsis buku, deskripsi fisik, dll." />
              </div>

              <div className="grid gap-4 sm:grid-cols-3 border-t border-line pt-4">
                <div>
                  <label htmlFor="price" className="label">Harga <span className="text-danger">*</span></label>
                  <input id="price" type="number" min="0" step="1000" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseInt(e.target.value) || 0 }))} className="input" required placeholder="125000" />
                </div>
                <div>
                  <label htmlFor="stock" className="label">Stok <span className="text-danger">*</span></label>
                  <input id="stock" type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))} className="input" required />
                </div>
                <div className="flex items-end">
                  <label htmlFor="isActive" className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/75 w-full">
                    <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="checkbox" />
                    Buku aktif (tampil di toko)
                  </label>
                </div>
              </div>
            </div>

            {/* Cover Preview */}
            <div className="space-y-5">
              <div>
                <p className="eyebrow">Pratinjau Cover</p>
                <h3 className="mt-1 font-display text-lg font-semibold text-navy">Live Spine Preview</h3>
              </div>

              <div className="relative flex flex-col items-center gap-4">
                <div className="relative w-full max-w-xs">
                  <BookCover title={form.title || 'Judul Buku'} author={form.author || 'Penulis'} coverColor={coverColor} publisher={form.publisher || undefined} category={categories.find(c => c.id === form.categoryId)?.name} className="shadow-cover" />
                </div>

                <div className="w-full space-y-4">
                  <div>
                    <label htmlFor="coverColor" className="label">Warna Cover (hex)</label>
                    <div className="flex items-center gap-3">
                      <input id="coverColor" type="color" value={coverColor} onChange={e => setCoverColor(e.target.value)} className="h-10 w-14 rounded-lg border border-line cursor-pointer" />
                      <input type="text" value={coverColor} onChange={e => setCoverColor(e.target.value)} className="input font-mono text-sm" placeholder="#B3173B" />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {['#B3173B', '#14213D', '#2F5D50', '#D9A404', '#6B8CAE', '#8B4513', '#6B4226', '#C0392B', '#2C3E50', '#27AE60'].map(color => (
                        <button key={color} type="button" onClick={() => setCoverColor(color)} className={`h-6 w-6 rounded border-2 transition ${coverColor === color ? 'border-cherry scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} aria-label={color} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="coverImage" className="label">URL Cover Image (opsional)</label>
                    <input id="coverImage" type="url" value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} className="input" placeholder="https://example.com/cover.jpg" />
                    <p className="mt-1 text-xs text-muted">Kosongkan untuk menggunakan cover generatif berdasarkan warna di atas.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal open={Boolean(deleteId)} onClose={() => setDeleteId(null)} title="Hapus buku" description="Apakah Anda yakin ingin menghapus buku ini? Tindakan ini tidak bisa dibatalkan." size="sm" mobileFullScreen footer={
        <div className="flex gap-2">
          <button type="button" onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Batal</button>
          <button type="button" onClick={handleDelete} className="btn bg-danger text-white hover:bg-danger/90 flex-1">Hapus</button>
        </div>
      }>
        <p className="text-sm text-muted">Buku akan dihapus permanen dari database.</p>
      </Modal>
    </AdminLayout>
  );
}

export default function AdminBooksPage() {
  return (
    <Suspense fallback={<AdminBooksSkeleton />}>
      <AdminBooksContent />
    </Suspense>
  );
}

function AdminBooksSkeleton() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton mt-2 h-11 w-72 rounded" />
            <div className="skeleton mt-1.5 h-4 w-40 rounded" />
          </div>
          <div className="skeleton h-10 w-40 rounded" />
        </div>
        <div className="skeleton h-12 w-full rounded-xl" />
        <div className="skeleton h-200 w-full rounded-xl" />
      </div>
    </AdminLayout>
  );
}

function BookRow({ book, onEdit, onDelete }: { book: Book; onEdit: (book: Book) => void; onDelete: (id: string) => void }) {
  const stock = stockLabel(book.stock);
  const categoryName = book.category?.name || '—';

  return (
    <tr className="hover:bg-cream/30 transition">
      <td className="px-4 py-3">
        <Link href={`/book/${book.slug}`} target="_blank" rel="noopener noreferrer" className="block w-16">
          <BookCover title={book.title} coverColor={book.coverColor} coverImage={book.coverImage || undefined} compact />
        </Link>
      </td>
      <td className="px-4 py-3">
        <Link href={`/book/${book.slug}`} target="_blank" rel="noopener noreferrer" className="font-display text-base font-semibold text-navy hover:text-cherry transition line-clamp-1 max-w-xs">
          {book.title}
        </Link>
        <p className="mt-0.5 text-sm text-muted">{book.author}</p>
        <p className="mt-0.5 text-xs font-mono text-muted/60">ISBN: {book.isbn || '—'}</p>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/70 px-2.5 py-1 text-[11px] font-medium text-navy/80">{categoryName}</span>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell font-semibold text-navy tabular">{formatPrice(book.price)}</td>
      <td className="px-4 py-3">
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide', stock.className)}>
          {stock.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide', book.isActive ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted')}>
          {book.isActive ? 'Aktif' : 'Tidak Aktif'}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button type="button" onClick={() => onEdit(book)} className="btn-ghost btn-sm p-2" aria-label="Edit">
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => onDelete(book.id)} className="btn-ghost btn-sm p-2 text-danger hover:bg-danger/5" aria-label="Hapus">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function BookRowSkeleton() {
  return (
    <tr>
      <td className="px-4 py-3"><div className="skeleton w-16 h-24 rounded" /></td>
      <td className="px-4 py-3"><div className="skeleton h-5 w-48 rounded" /><div className="skeleton mt-2 h-4 w-32 rounded" /></td>
      <td className="px-4 py-3 hidden md:table-cell"><div className="skeleton h-5 w-24 rounded-full" /></td>
      <td className="px-4 py-3 hidden lg:table-cell"><div className="skeleton h-5 w-20 rounded" /></td>
      <td className="px-4 py-3"><div className="skeleton h-5 w-20 rounded-full" /></td>
      <td className="px-4 py-3"><div className="skeleton h-5 w-20 rounded-full" /></td>
      <td className="px-4 py-3 text-right"><div className="skeleton h-8 w-20 rounded" /></td>
    </tr>
  );
}