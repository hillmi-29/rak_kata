import nodemailer from 'nodemailer';
import { config } from 'dotenv';
config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const emailService = {
  async sendEmail(options: EmailOptions) {
    const from = process.env.EMAIL_FROM || 'Toko Buku <noreply@tokobuku.com>';

    try {
      const info = await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Email send failed:', error);
      throw error;
    }
  },

  async sendOrderConfirmation(to: string, orderNumber: string, total: number) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14213D;">Konfirmasi Pesanan</h2>
        <p>Terima kasih telah berbelanja di Toko Buku!</p>
        <p><strong>Nomor Pesanan:</strong> ${orderNumber}</p>
        <p><strong>Total Pembayaran:</strong> Rp ${total.toLocaleString('id-ID')}</p>
        <p>Silakan lakukan pembayaran melalui tautan yang tersedia di halaman detail pesanan.</p>
        <hr style="border-color: #E6DFD3;">
        <p style="color: #6B6B76; font-size: 14px;">Jika Anda tidak melakukan pemesanan ini, abaikan email ini.</p>
      </div>
    `;
    return this.sendEmail({ to, subject: `Konfirmasi Pesanan #${orderNumber}`, html });
  },

  async sendPaymentSuccess(to: string, orderNumber: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2E7D5B;">Pembayaran Berhasil</h2>
        <p>Pembayaran untuk pesanan <strong>${orderNumber}</strong> telah kami terima.</p>
        <p>Pesanan Anda akan segera diproses dan dikirim.</p>
        <hr style="border-color: #E6DFD3;">
        <p style="color: #6B6B76; font-size: 14px;">Terima kasih telah berbelanja di Toko Buku!</p>
      </div>
    `;
    return this.sendEmail({ to, subject: `Pembayaran Berhasil - Pesanan #${orderNumber}`, html });
  },

  async sendPaymentFailed(to: string, orderNumber: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #C62828;">Pembayaran Gagal / Kedaluwarsa</h2>
        <p>Pembayaran untuk pesanan <strong>${orderNumber}</strong> tidak berhasil atau telah kedaluwarsa.</p>
        <p>Anda dapat membuat pesanan baru atau menghubungi layanan pelanggan.</p>
        <hr style="border-color: #E6DFD3;">
        <p style="color: #6B6B76; font-size: 14px;">Toko Buku</p>
      </div>
    `;
    return this.sendEmail({ to, subject: `Pembayaran Gagal - Pesanan #${orderNumber}`, html });
  },

  async sendOrderShipped(
    to: string,
    orderNumber: string,
    courier: string,
    trackingNumber: string,
    trackingUrl?: string
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14213D;">Pesanan Dikirim</h2>
        <p>Pesanan <strong>${orderNumber}</strong> telah dikirim.</p>
        <p><strong>Kurir:</strong> ${courier}</p>
        <p><strong>Nomor Resi:</strong> ${trackingNumber}</p>
        ${trackingUrl ? `<p><a href="${trackingUrl}" style="color: #B3173B;">Lacak Pengiriman</a></p>` : ''}
        <hr style="border-color: #E6DFD3;">
        <p style="color: #6B6B76; font-size: 14px;">Toko Buku</p>
      </div>
    `;
    return this.sendEmail({ to, subject: `Pesanan Dikirim #${orderNumber}`, html });
  },

  async sendOrderDelivered(to: string, orderNumber: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2E7D5B;">Pesanan Telah Diterima</h2>
        <p>Pesanan <strong>${orderNumber}</strong> telah diterima.</p>
        <p>Terima kasih telah berbelanja di Toko Buku. Semoga buku-bukunya bermanfaat!</p>
        <p>Silakan berikan ulasan untuk buku yang Anda beli.</p>
        <hr style="border-color: #E6DFD3;">
        <p style="color: #6B6B76; font-size: 14px;">Toko Buku</p>
      </div>
    `;
    return this.sendEmail({ to, subject: `Pesanan Selesai #${orderNumber}`, html });
  },

  async sendOrderCancelled(to: string, orderNumber: string, reason?: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #D98E04;">Pesanan Dibatalkan</h2>
        <p>Pesanan <strong>${orderNumber}</strong> telah dibatalkan.</p>
        ${reason ? `<p><strong>Alasan:</strong> ${reason}</p>` : ''}
        <p>Jika Anda memiliki pertanyaan, silakan hubungi layanan pelanggan.</p>
        <hr style="border-color: #E6DFD3;">
        <p style="color: #6B6B76; font-size: 14px;">Toko Buku</p>
      </div>
    `;
    return this.sendEmail({ to, subject: `Pesanan Dibatalkan #${orderNumber}`, html });
  },

  async sendPasswordReset(to: string, name: string, resetUrl: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14213D;">Atur Ulang Kata Sandi</h2>
        <p>Halo ${name || 'Sahabat Rak Kata'},</p>
        <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda.</p>
        <p style="margin: 28px 0;">
          <a href="${resetUrl}" style="background: #B3173B; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Atur Ulang Kata Sandi</a>
        </p>
        <p>Tautan ini berlaku selama 1 jam. Jika Anda tidak meminta reset, abaikan email ini.</p>
        <hr style="border-color: #E6DFD3;">
        <p style="color: #6B6B76; font-size: 14px;">Rak Kata - Toko Buku Indonesia</p>
      </div>
    `;
    return this.sendEmail({ to, subject: 'Atur Ulang Kata Sandi - Rak Kata', html });
  },
};
