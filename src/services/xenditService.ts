import { config } from 'dotenv';
config();

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY || '';
const XENDIT_BASE_URL =
  process.env.XENDIT_IS_PRODUCTION === 'true' ? 'https://api.xendit.co' : 'https://api.xendit.co';

interface CreateInvoiceParams {
  externalId: string;
  amount: number;
  payerEmail: string;
  description: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    category?: string;
    url?: string;
  }>;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
  paymentMethods?: string[];
}

export const xenditService = {
  async createInvoice(params: CreateInvoiceParams) {
    if (!XENDIT_SECRET_KEY) {
      throw new Error('XENDIT_SECRET_KEY not configured');
    }

    const auth = Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64');

    const body = {
      external_id: params.externalId,
      amount: params.amount,
      payer_email: params.payerEmail,
      description: params.description,
      items: params.items || [],
      success_redirect_url:
        params.successRedirectUrl || `${process.env.FRONTEND_URL}/checkout/success`,
      failure_redirect_url:
        params.failureRedirectUrl || `${process.env.FRONTEND_URL}/checkout/failure`,
      payment_methods: params.paymentMethods || ['EWALLET', 'VA', 'QRIS', 'RETAIL_OUTLET'],
      currency: 'IDR',
    };

    const response = await fetch(`${XENDIT_BASE_URL}/v2/invoices`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data: any = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create Xendit invoice');
    }

    return {
      id: data.id,
      externalId: data.external_id,
      status: data.status,
      invoiceUrl: data.invoice_url,
      amount: data.amount,
      payerEmail: data.payer_email,
      description: data.description,
      paymentMethods: data.payment_methods,
      expiredAt: data.expired_at,
    };
  },

  async getInvoice(invoiceId: string) {
    if (!XENDIT_SECRET_KEY) throw new Error('XENDIT_SECRET_KEY not configured');

    const auth = Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64');

    const response = await fetch(`${XENDIT_BASE_URL}/v2/invoices/${invoiceId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    return response.json() as Promise<any>;
  },

  async verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
    const webhookToken = process.env.XENDIT_WEBHOOK_TOKEN || '';
    // Xendit uses callback token verification
    return signature === webhookToken;
  },

  parseWebhookEvent(body: any) {
    return {
      id: body.id,
      externalId: body.external_id,
      status: body.status, // PAID, EXPIRED, PENDING, etc.
      amount: body.amount,
      paymentMethod: body.payment_method,
      paymentChannel: body.payment_channel,
      paidAt: body.paid_at ? new Date(body.paid_at) : null,
      fees: body.fees,
    };
  },
};
