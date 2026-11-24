'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, User } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { cn, formatDate } from '@/lib/format';
import { AccountLayout } from '@/components/layout/account-layout';
import { Modal } from '@/components/ui/modal';

export default function AccountProfilePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim() === user?.name) return;

    setSaving(true);
    api
      .patch('/users/me', { name: name.trim() })
      .then(() => {
        success('Nama berhasil diperbarui');
        refreshUser();
      })
      .catch(err => error(err instanceof Error ? err.message : 'Gagal menyimpan'))
      .finally(() => setSaving(false));
  }

  function handlePasswordChange(event: React.FormEvent) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      error('Konfirmasi kata sandi tidak cocok');
      return;
    }
    if (newPassword.length < 8) {
      error('Kata sandi minimal 8 karakter');
      return;
    }

    setChangingPassword(true);
    api
      .patch('/users/me/password', {
        currentPassword,
        newPassword,
      })
      .then(() => {
        success('Kata sandi berhasil diubah');
        setPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      })
      .catch(err => error(err instanceof Error ? err.message : 'Gagal mengubah kata sandi'))
      .finally(() => setChangingPassword(false));
  }

  return (
    <AccountLayout>
      <div className="space-y-8">
        <div>
          <p className="eyebrow">Profil</p>
          <h1 className="mt-2 font-display text-[30px] font-semibold tracking-tight text-navy sm:text-[44px]">
            Kelola akun Anda
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Informasi pribadi, keamanan, dan preferensi akun.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-white/60 p-5 sm:p-8">
          <form onSubmit={handleSave} className="max-w-xl space-y-6">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-navy font-display text-xl font-bold text-cream sm:h-20 sm:w-20 sm:text-2xl">
                {user?.name
                  .split(' ')
                  .slice(0, 2)
                  .map(part => part[0])
                  .join('')
                  .toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-xl font-semibold text-navy">{user?.name}</p>
                <p className="truncate text-sm text-muted">{user?.email}</p>
                {user?.role === 'ADMIN' && (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy">
                    Admin
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="label">Nama lengkap</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="input bg-cream/50 text-muted"
                />
                <p className="mt-1 text-xs text-muted">Email tidak bisa diubah</p>
              </div>
            </div>

            <div className="border-t border-line pt-4">
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold text-navy">Kata sandi</p>
                  <p className="text-sm text-muted">Terakhir diubah 6 bulan lalu</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPasswordModal(true)}
                  className="btn-secondary btn-sm"
                >
                  Ubah Kata Sandi
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saving || name.trim() === user?.name} className="btn-primary">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-xl border border-line bg-white/60 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-navy">Keamanan tambahan</p>
              <p className="text-sm text-muted">Aktifkan untuk perlindungan ekstra</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 rounded-full bg-line peer-focus:ring-4 peer-focus:ring-cherry/20 peer-checked:bg-cherry peer-checked:border-cherry transition" />
              <span className="sr-only">Verifikasi 2 langkah</span>
            </label>
          </div>
          <p className="mt-3 text-sm text-muted">
            Fitur verifikasi 2 langkah akan segera hadir. Saat ini akun Anda dilindungi oleh kata sandi yang kuat.
          </p>
        </div>
      </div>

      <Modal
        open={passwordModal}
        onClose={() => setPasswordModal(false)}
        title="Ubah kata sandi"
        size="sm"
        footer={
          <div className="flex gap-2">
            <button type="button" onClick={() => setPasswordModal(false)} className="btn-secondary flex-1">
              Batal
            </button>
            <button type="submit" form="password-form" disabled={changingPassword} className="btn-primary flex-1">
              {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan'}
            </button>
          </div>
        }
      >
        <form id="password-form" onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="label">Kata sandi saat ini</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="label">Kata sandi baru</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="input"
              required
              minLength={8}
            />
            <p className="mt-1 text-xs text-muted">Minimal 8 karakter</p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="label">Konfirmasi kata sandi baru</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="input"
              required
            />
          </div>
        </form>
      </Modal>
    </AccountLayout>
  );
}