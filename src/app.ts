import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import authRoutes from './routes/authRoutes';
import bookRoutes from './routes/bookRoutes';
import categoryRoutes from './routes/categoryRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';
import reviewRoutes from './routes/reviewRoutes';
import couponRoutes from './routes/couponRoutes';
import addressRoutes from './routes/addressRoutes';
import shippingRoutes from './routes/shippingRoutes';
import xenditWebhookRoutes from './routes/xenditWebhookRoutes';

config();

const app = express();

// Security middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting – global
const isDev = process.env.NODE_ENV !== 'production';
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 2000 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Terlalu banyak permintaan' },
  },
});
app.use(globalLimiter);

// Logger
app.use(morgan('combined'));

// API routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Bookstore E-commerce API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      books: '/api/v1/books',
      categories: '/api/v1/categories',
      auth: '/api/v1/auth',
      cart: '/api/v1/cart',
      orders: '/api/v1/orders',
      reviews: '/api/v1/reviews',
      coupons: '/api/v1/coupons',
      addresses: '/api/v1/addresses',
      shipping: '/api/v1/shipping',
      admin: '/api/v1/admin',
      webhook: '/api/v1/webhook/xendit',
    },
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/shipping', shippingRoutes);
app.use('/api/v1/webhook/xendit', xenditWebhookRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res
    .status(404)
    .json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint tidak ditemukan' } });
});

// Error handler (standard format)
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const status =
    err instanceof Error && 'statusCode' in err && typeof err.statusCode === 'number'
      ? err.statusCode
      : 500;
  const code =
    err instanceof Error && 'code' in err && typeof err.code === 'string'
      ? err.code
      : 'INTERNAL_ERROR';
  const message = err instanceof Error ? err.message : 'Terjadi kesalahan server';
  const details = err instanceof Error && 'details' in err ? err.details : undefined;
  res.status(status).json({ success: false, error: { code, message, details } });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`🚀 Server berjalan di http://localhost:${PORT}`));
}

export default app;
