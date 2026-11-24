'use client';

import { useEffect, useState } from 'react';
import { Check, Edit, MapPin, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { cn, formatDate } from '@/lib/format';
import type { Address } from '@/lib/types';
import { AccountLayout } from '@/components/layout/account-layout';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';

export default function AccountAddressesPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<Address | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  interface AddressFormState {
    label: string;
    recipient: string;
    phone: string;
    address: string;
    province: string;
    provinceId: string;
    city: string;
    cityId: string;
    subdistrict: string;
    subdistrictId: string;
    postalCode: string;
    isDefault: boolean;
  }

  const [form, setForm] = useState<AddressFormState>({
    label: 'Rumah',
    recipient: '',
    phone: '',
    address: '',
    province: 'DKI Jakarta',
    provinceId: '6',
    city: '',
    cityId: '',
    subdistrict: '',
    subdistrictId: '',
    postalCode: '',
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const response = await api.get<Address[]>('/addresses');
      setAddresses(response.data);
    } catch {
      error('Gagal memuat alamat');
    } finally {
      setLoading(false);
    }
  };

  function openEdit(address?: Address) {
    if (address) {
      setForm({
        label: address.label,
        recipient: address.recipient,
        phone: address.phone,
        address: address.address,
        province: address.province,
        provinceId: address.provinceId || '',
        city: address.city,
        cityId: address.cityId || '',
        subdistrict: address.subdistrict || '',
        subdistrictId: address.subdistrictId || '',
        postalCode: address.postalCode,
        isDefault: address.isDefault,
      });
      setEditModal(address);
    } else {
      setForm({
        label: 'Rumah',
        recipient: '',
        phone: '',
        address: '',
        province: 'DKI Jakarta',
        provinceId: '6',
        city: '',
        cityId: '',
        subdistrict: '',
        subdistrictId: '',
        postalCode: '',
        isDefault: addresses.length === 0,
      });
      setEditModal({} as Address);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.recipient || !form.phone || !form.address || !form.province || !form.city || !form.postalCode) {
      error('Lengkapi semua field wajib');
      return;
    }

    setSaving(true);
    const isNew = !editModal?.id;
    const promise = isNew
      ? api.post<Address>('/addresses', form)
      : api.patch<Address>(`/addresses/${editModal!.id}`, form);

    promise
      .then(response => {
        if (isNew) setAddresses(current => [...current, response.data]);
        else setAddresses(current => current.map(a => (a.id === editModal!.id ? response.data : a)));
        success(isNew ? 'Alamat berhasil ditambahkan' : 'Alamat berhasil diperbarui');
        setEditModal(null);
      })
      .catch(err => error(err instanceof Error ? err.message : 'Gagal menyimpan alamat'))
      .finally(() => setSaving(false));
  }

  function confirmDelete(id: string) {
    setDeleteId(id);
  }

  function handleDelete() {
    if (!deleteId) return;
    api
      .delete(`/addresses/${deleteId}`)
      .then(() => {
        setAddresses(current => current.filter(a => a.id !== deleteId));
        success('Alamat berhasil dihapus');
        setDeleteId(null);
      })
      .catch(err => error(err instanceof Error ? err.message : 'Gagal menghapus alamat'));
  }

  return (
    <AccountLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Alamat Pengiriman</p>
            <h1 className="mt-2 font-display text-[30px] font-semibold tracking-tight text-navy sm:text-[44px]">
              Kelola alamat pengiriman
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              Simpan alamat untuk checkout yang lebih cepat.
            </p>
          </div>
          <button type="button" onClick={() => openEdit()} className="btn-primary self-start shrink-0 sm:self-auto">
            <Plus className="h-4 w-4" />
            Tambah Alamat Baru
          </button>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <AddressCardSkeleton key={index} />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <EmptyState
            title="Belum ada alamat tersimpan"
            description="Tambahkan alamat rumah, kantor, atau lokasi lain untuk mempercepat proses checkout."
            actionLabel="Tambah Alamat Baru"
            onAction={() => openEdit()}
            icon={<MapPin className="h-7 w-7" />}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map(address => (
              <AddressCard key={address.id} address={address} onEdit={openEdit} onDelete={confirmDelete} />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={Boolean(editModal)}
        onClose={() => setEditModal(null)}
        title={editModal?.id ? 'Edit Alamat' : 'Tambah Alamat Baru'}
        size="lg"
        mobileFullScreen
        footer={
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditModal(null)} className="btn-secondary flex-1">
              Batal
            </button>
            <button type="submit" form="address-form" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Menyimpan...' : 'Simpan Alamat'}
            </button>
          </div>
        }
      >
        <form id="address-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="label" className="label">Label alamat</label>
              <select
                id="label"
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                className="select"
              >
                <option value="Rumah">Rumah</option>
                <option value="Kantor">Kantor</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label htmlFor="isDefault" className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/75">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={form.isDefault}
                  onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
                  className="checkbox"
                />
                Jadikan alamat utama
              </label>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="recipient" className="label">Nama penerima</label>
              <input
                id="recipient"
                value={form.recipient}
                onChange={e => setForm(f => ({ ...f, recipient: e.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="label">Nomor telepon</label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="input"
                required
                placeholder="08xx-xxxx-xxxx"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="label">Alamat lengkap</label>
            <textarea
              id="address"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="textarea"
              rows={2}
              required
              placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="province" className="label">Provinsi</label>
              <select
                id="province"
                value={form.province}
                onChange={e => setForm(f => ({ ...f, province: e.target.value, city: '', cityId: '' }))}
                className="select"
                required
              >
                <option value="">Pilih provinsi</option>
                <option value="DKI Jakarta">DKI Jakarta</option>
                <option value="Jawa Barat">Jawa Barat</option>
                <option value="Jawa Tengah">Jawa Tengah</option>
                <option value="Jawa Timur">Jawa Timur</option>
                <option value="Banten">Banten</option>
                <option value="Sumatera Utara">Sumatera Utara</option>
                <option value="Sumatera Barat">Sumatera Barat</option>
                <option value="Sumatera Selatan">Sumatera Selatan</option>
                <option value="Bali">Bali</option>
              </select>
            </div>
            <div>
              <label htmlFor="city" className="label">Kota / Kabupaten</label>
              <select
                id="city"
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="select"
                required
              >
                <option value="">Pilih kota</option>
                {form.province === 'DKI Jakarta' && (
                  <>
                    <option value="Jakarta Pusat">Jakarta Pusat</option>
                    <option value="Jakarta Utara">Jakarta Utara</option>
                    <option value="Jakarta Barat">Jakarta Barat</option>
                    <option value="Jakarta Selatan">Jakarta Selatan</option>
                    <option value="Jakarta Timur">Jakarta Timur</option>
                  </>
                )}
                {form.province === 'Jawa Barat' && (
                  <>
                    <option value="Bandung">Bandung</option>
                    <option value="Bekasi">Bekasi</option>
                    <option value="Depok">Depok</option>
                    <option value="Bogor">Bogor</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="subdistrict" className="label">Kecamatan</label>
              <input
                id="subdistrict"
                value={form.subdistrict}
                onChange={e => setForm(f => ({ ...f, subdistrict: e.target.value }))}
                className="input"
                placeholder="Menteng, Kebayoran Baru, dll"
              />
            </div>
            <div>
              <label htmlFor="postalCode" className="label">Kode pos</label>
              <input
                id="postalCode"
                value={form.postalCode}
                onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))}
                className="input"
                required
                placeholder="10310"
              />
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Hapus alamat"
        description="Apakah Anda yakin ingin menghapus alamat ini? Tindakan ini tidak bisa dibatalkan."
        size="sm"
        footer={
          <div className="flex gap-2">
            <button type="button" onClick={() => setDeleteId(null)} className="btn-secondary flex-1">
              Batal
            </button>
            <button type="button" onClick={handleDelete} className="btn bg-danger text-white hover:bg-danger/90 flex-1">
              Hapus
            </button>
          </div>
        }
      >
        <p className="text-sm text-muted">Alamat akan dihapus permanen dari daftar.</p>
      </Modal>
    </AccountLayout>
  );
}

function AddressCard({
  address,
  onEdit,
  onDelete,
}: {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="relative rounded-xl border border-line bg-white/60 p-5 transition hover:border-navy/30 hover:shadow-paper">
      {address.isDefault && (
        <span className="absolute right-4 top-4 rounded-sm bg-navy px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-cream">
          Utama
        </span>
      )}
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy/10 text-navy">
          <MapPin className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-navy">{address.label}</p>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-ink/70">
            {address.recipient} · {address.phone}
          </p>
          <p className="mt-0.5 text-sm leading-relaxed text-muted">
            {address.address}, {address.subdistrict ? `${address.subdistrict}, ` : ''}
            {address.city}, {address.province} {address.postalCode}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(address)}
              className="btn-ghost btn-sm"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(address.id)}
              className="btn-ghost btn-sm text-danger hover:bg-danger/5 hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddressCardSkeleton() {
  return (
    <div className="rounded-xl border border-line bg-white/60 p-5">
      <div className="flex items-start gap-3">
        <div className="skeleton h-10 w-10 rounded-lg" />
        <div className="flex-1">
          <div className="skeleton h-5 w-24 rounded" />
          <div className="skeleton mt-2 h-4 w-40 rounded" />
          <div className="skeleton mt-2 h-4 w-56 rounded" />
        </div>
      </div>
    </div>
  );
}