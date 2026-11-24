import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { createTestUser, createTestCategory, createTestBook, getAuthToken } from '../helpers';

describe('Cart API', () => {
  let testCategory: any;
  let testBook: any;
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    testUser = await createTestUser({
      email: 'carttest@example.com',
      name: 'Cart Test User',
    });
    authToken = await getAuthToken(testUser.id);
    
    testCategory = await createTestCategory({ name: 'Cart Test Category', slug: 'cart-test-category' });
    testBook = await createTestBook({
      title: 'Cart Test Book',
      slug: 'cart-test-book',
      categoryId: testCategory.id,
      price: 120000,
      stock: 5,
    });
  });

  afterAll(async () => {
    await prisma.cartItem.deleteMany({ where: { cart: { userId: testUser.id } } });
    await prisma.cart.deleteMany({ where: { userId: testUser.id } });
    await prisma.book.deleteMany({ where: { slug: { contains: 'cart-test-book' } } });
    await prisma.category.deleteMany({ where: { slug: { contains: 'cart-test-category' } } });
    await prisma.user.deleteMany({ where: { email: { contains: 'carttest' } } });
  });

  it('GET /api/v1/cart - should return empty cart initially', async () => {
    const res = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toEqual([]);
    expect(res.body.data.summary.itemCount).toBe(0);
  });
});