import { Router, Request, Response } from 'express';
import { xenditService } from '../services/xenditService';
import { orderService } from '../services/orderService';
import { prisma } from '../config/database';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const callbackToken = req.headers['x-callback-token'] as string;
    const webhookToken = process.env.XENDIT_WEBHOOK_TOKEN || '';

    if (callbackToken !== webhookToken) {
      console.warn('Invalid Xendit webhook token received');
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Token webhook tidak valid' },
      });
    }

    const event = req.body;
    console.log('🔔 Xendit Webhook:', event.external_id, event.status);

    // Parse event
    const parsedEvent = xenditService.parseWebhookEvent(event);

    // Find order by external_id (which is our orderNumber)
    const order = await prisma.order.findUnique({
      where: { orderNumber: parsedEvent.externalId },
      include: { payment: true },
    });

    if (!order) {
      console.warn('Order not found for webhook:', parsedEvent.externalId);
      return res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'Pesanan tidak ditemukan' },
      });
    }

    // Idempotency: check if already processed
    if (
      order.payment &&
      order.payment.providerRef === parsedEvent.id &&
      order.payment.status === 'SUCCESS' &&
      parsedEvent.status === 'PAID'
    ) {
      console.log('Webhook already processed for:', parsedEvent.externalId);
      return res.status(200).json({ success: true, message: 'Webhook sudah diproses' });
    }

    // Update payment record
    if (order.payment) {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          status:
            parsedEvent.status === 'PAID'
              ? 'SUCCESS'
              : parsedEvent.status === 'EXPIRED'
                ? 'EXPIRED'
                : 'FAILED',
          paymentMethod: parsedEvent.paymentMethod,
          paymentChannel: parsedEvent.paymentChannel,
          paidAt: parsedEvent.paidAt,
          rawResponse: event,
        },
      });
    }

    // Handle based on status
    if (parsedEvent.status === 'PAID') {
      await orderService.handlePaymentSuccess(order.id);
    } else if (['EXPIRED', 'FAILED'].includes(parsedEvent.status)) {
      await orderService.handlePaymentFailed(order.id);
    }

    return res.status(200).json({ success: true, message: 'Webhook diproses' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'WEBHOOK_ERROR', message: 'Gagal memproses webhook' },
    });
  }
});

export default router;
