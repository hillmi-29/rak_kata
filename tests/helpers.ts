import { prisma } from '../src/config/database';
import bcrypt from 'bcryptjs';
import { generateTokens } from '../src/utils/jwt';

export async function createTestUser(overrides: {
  email?: string;
  name?: string;
  password?: string;
  role?: 'USER' | 'ADMIN';
} = {}) {
  const passwordHash = await bcrypt.hash(overrides.password || 'password123', 10);
  
  return prisma.user.create({
    data: {
      email: overrides.email || `test-${Date.now()}@example.com`,
      name: overrides.name || 'Test User',
      passwordHash,
      role: overrides.role || 'USER',
      emailVerified: true,
    },
  });
}

export async function getAuthToken(userId: string, role: 'USER' | 'ADMIN' = 'USER') {
  const tokens = generateTokens({ userId, email: `test-${userId}@example.com`, role });
  return tokens.accessToken;
}

export async function createTestCategory(overrides: { name?: string; slug?: string } = {}) {
  return prisma.category.create({
    data: {
      name: overrides.name || 'Test Category',
      slug: overrides.slug || `test-${Date.now()}`,
    },
  });
}

export async function createTestBook(overrides: {
  title?: string;
  slug?: string;
  categoryId?: string;
  price?: number;
  stock?: number;
} = {}) {
  const category = overrides.categoryId 
    ? await prisma.category.findUnique({ where: { id: overrides.categoryId } })
    : await createTestCategory();
  
  if (!category) throw new Error('Category not found');

  return prisma.book.create({
    data: {
      title: overrides.title || 'Test Book',
      slug: overrides.slug || `test-book-${Date.now()}`,
      author: 'Test Author',
      price: overrides.price || 100000,
      stock: overrides.stock ?? 10,
      categoryId: category.id,
    },
  });
}

export async function createTestOrder(userId: string, bookId: string, overrides: {
  status?: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
} = {}) {
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw new Error('Book not found');

  const orderNumber = `ORD-TEST-${Date.now()}`;
  
  return prisma.order.create({
    data: {
      orderNumber,
      userId,
      status: overrides.status || 'PENDING',
      subtotal: book.price,
      shippingCost: 15000,
      discount: 0,
      total: book.price + 15000,
      shippingAddress: {
        recipient: 'Test User',
        phone: '081234567890',
        address: 'Jl. Test No. 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
      } as any,
      items: {
        create: {
          bookId,
          qty: 1,
          price: book.price,
          bookTitle: book.title,
          bookCover: book.coverImage || '',
        }
      }
    },
    include: { items: true }
  });
}