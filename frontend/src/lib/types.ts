export type Role = 'USER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'REFUNDED';

export interface Address {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  address: string;
  province: string;
  provinceId?: string | null;
  city: string;
  cityId?: string | null;
  subdistrict?: string | null;
  subdistrictId?: string | null;
  postalCode: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  avatar?: string | null;
  addresses?: Address[];
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  _count?: {
    books: number;
  };
}

export interface Book {
  id: string;
  title: string;
  slug: string;
  author: string;
  isbn?: string | null;
  description?: string | null;
  price: number;
  stock: number;
  coverImage?: string | null;
  coverColor?: string | null;
  images?: unknown;
  publisher?: string | null;
  publishedYear?: number | null;
  pages?: number | null;
  weight: number;
  dimensions?: string | null;
  language?: string | null;
  isActive: boolean;
  averageRating: number;
  reviewCount: number;
  categoryId: string;
  category?: Pick<Category, 'id' | 'name' | 'slug'>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartBook {
  id: string;
  title: string;
  slug: string;
  author?: string;
  price: number;
  stock: number;
  coverImage?: string | null;
  coverColor?: string | null;
  weight: number;
  isActive?: boolean;
}

export interface ServerCartItem {
  id: string;
  bookId: string;
  qty: number;
  book: CartBook;
  subtotal: number;
  isOutOfStock: boolean;
}

export interface ServerCart {
  id: string;
  items: ServerCartItem[];
  summary: {
    subtotal: number;
    totalWeight: number;
    itemCount: number;
  };
}

export interface DisplayCartItem {
  id: string;
  bookId: string;
  qty: number;
  book: CartBook;
  subtotal: number;
  isOutOfStock: boolean;
  guest?: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  bookId: string;
  qty: number;
  price: number;
  bookTitle: string;
  bookCover: string;
  book?: Book;
}

export interface Payment {
  id: string;
  orderId: string;
  provider: string;
  providerRef: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paymentMethod?: string | null;
  paymentChannel?: string | null;
  paidAt?: string | null;
  expiredAt?: string | null;
  invoiceUrl?: string | null;
  createdAt?: string;
}

export interface ShippingSnapshot {
  recipient: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  subdistrict?: string;
  cityId?: string;
  provinceId?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  shippingAddress: ShippingSnapshot;
  notes?: string | null;
  paidAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  trackingNumber?: string | null;
  courier?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payment?: Payment | null;
  user?: Pick<User, 'id' | 'name' | 'email' | 'phone'>;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  verifiedPurchase: boolean;
  createdAt: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
}

export interface BookDetail extends Book {
  reviews: Review[];
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: Meta;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  conversionRate: number;
  lowStockBooks: Array<{
    id: string;
    title: string;
    stock: number;
    coverImage?: string | null;
    coverColor?: string | null;
  }>;
  topBooks: Array<{
    id: string;
    title: string;
    coverImage?: string | null;
    coverColor?: string | null;
  }>;
  recentOrders: Order[];
}

export interface ShippingRate {
  courier: string;
  service: string;
  cost: number;
  estimatedDays: string;
  description: string;
}

export interface CheckoutResult {
  order: Order;
  payment: {
    invoiceUrl: string;
    invoiceId: string;
    expiresAt: string;
  } | null;
  shippingInfo: {
    cost: number;
    courier: string;
    estimatedDays: string;
    weight: number;
  };
}

export interface WishlistBook {
  id: string;
  title: string;
  slug: string;
  author: string;
  price: number;
  coverImage?: string | null;
  coverColor?: string | null;
  averageRating?: number;
}
