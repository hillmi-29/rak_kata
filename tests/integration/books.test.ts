import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { createTestUser, createTestCategory, createTestBook, getAuthToken } from '../helpers';

describe('Books API', () => {
  let testCategory: any;
  let testBook: any;
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.book.deleteMany({ where: { slug: { contains: 'test-book' } } });
    await prisma.category.deleteMany({ where: { slug: { contains: 'test-category' } } });
    await prisma.user.deleteMany({ where: { email: { contains: 'booktest' } } });
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.book.deleteMany({ where: { slug: { contains: 'test-book' } } });
    await prisma.category.deleteMany({ where: { slug: { contains: 'test-category' } } });
    await prisma.user.deleteMany({ where: { email: { contains: 'booktest' } } });
    
    // Create fresh test data for each test
    testUser = await createTestUser({
      email: 'booktest@example.com',
      name: 'Book Test User',
    });
    authToken = await getAuthToken(testUser.id);
    
    testCategory = await createTestCategory({ name: 'Test Category', slug: 'test-category' });
    testBook = await createTestBook({
      title: 'Test Book',
      slug: 'test-book',
      categoryId: testCategory.id,
      price: 150000,
      stock: 10,
    });
  });

  afterAll(async () => {
    await prisma.book.deleteMany({ where: { slug: { contains: 'test-book' } } });
    await prisma.category.deleteMany({ where: { slug: { contains: 'test-category' } } });
    await prisma.user.deleteMany({ where: { email: { contains: 'booktest' } } });
  });

  it('GET /api/v1/books - should list books with pagination', async () => {
    const res = await request(app)
      .get('/api/v1/books')
      .query({ page: 1, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.page).toBe(1);
  });

  it('GET /api/v1/books - should filter by category', async () => {
    const res = await request(app)
      .get('/api/v1/books')
      .query({ category: testCategory.slug });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.every((book: any) => book.category.slug === testCategory.slug)).toBe(true);
  });

  it('GET /api/v1/books - should search by query', async () => {
    const res = await request(app)
      .get('/api/v1/books')
      .query({ search: 'Test Book' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/books/:slug - should get book detail', async () => {
    const res = await request(app)
      .get(`/api/v1/books/${testBook.slug}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(testBook.id);
    expect(res.body.data.title).toBe('Test Book');
  });

  it('GET /api/v1/books/:slug - should return 404 for non-existent book', async () => {
    const res = await request(app)
      .get('/api/v1/books/non-existent-slug');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('BOOK_NOT_FOUND');
  });
});