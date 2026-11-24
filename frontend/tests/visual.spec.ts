import { test, expect } from '@playwright/test';

const pages = [
  { name: 'home', path: '/', waitFor: '.hero-shelf-wrap, [class*="hero"]' },
  { name: 'books', path: '/books', waitFor: '[class*="book-card"], [class*="bookshelf"]' },
  { name: 'book-detail', path: '/book/dongeng-nusantara', waitFor: '[class*="book-cover"]' },
  { name: 'cart', path: '/cart', waitFor: '[class*="cart"], [class*="empty-state"]' },
  { name: 'checkout', path: '/checkout', waitFor: '[class*="checkout"], [class*="empty-state"]' },
  { name: 'login', path: '/login', waitFor: '[class*="auth"], form' },
  { name: 'register', path: '/register', waitFor: '[class*="auth"], form' },
  { name: 'forgot-password', path: '/forgot-password', waitFor: 'form' },
  { name: 'account', path: '/account', waitFor: '[class*="account"]' },
  { name: 'account-orders', path: '/account/orders', waitFor: '[class*="order"]' },
  { name: 'account-favorites', path: '/account/favorites', waitFor: '[class*="favorite"], [class*="empty-state"]' },
  { name: 'account-addresses', path: '/account/addresses', waitFor: '[class*="address"]' },
  { name: 'admin-dashboard', path: '/admin/dashboard', waitFor: '[class*="admin"]' },
  { name: 'admin-books', path: '/admin/books', waitFor: '[class*="admin"]' },
  { name: 'admin-orders', path: '/admin/orders', waitFor: '[class*="admin"]' },
];

for (const page of pages) {
  test(`${page.name} - desktop`, async ({ page: p }) => {
    await p.goto(page.path);
    if (page.waitFor) {
      await p.waitForSelector(page.waitFor, { timeout: 10000 }).catch(() => {});
    }
    await p.waitForLoadState('networkidle');
    await p.screenshot({ path: `tests/screenshots/${page.name}-desktop.png`, fullPage: true });
  });

  test(`${page.name} - mobile`, async ({ page: p }) => {
    await p.setViewportSize({ width: 390, height: 844 });
    await p.goto(page.path);
    if (page.waitFor) {
      await p.waitForSelector(page.waitFor, { timeout: 10000 }).catch(() => {});
    }
    await p.waitForLoadState('networkidle');
    await p.screenshot({ path: `tests/screenshots/${page.name}-mobile.png`, fullPage: true });
  });
}

test('home - hero shelf interaction', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.hero-shelf-wrap, [class*="hero"]', { timeout: 10000 }).catch(() => {});
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/home-hero-desktop.png', fullPage: true });
});

test('books - toggle grid/shelf', async ({ page }) => {
  await page.goto('/books');
  await page.waitForSelector('[class*="book-card"], [class*="bookshelf"]', { timeout: 10000 }).catch(() => {});
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/books-grid-desktop.png', fullPage: true });
  
  const shelfToggle = page.locator('button:has-text("Rak 3D"), a:has-text("Rak 3D")').first();
  if (await shelfToggle.isVisible().catch(() => false)) {
    await shelfToggle.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/books-shelf-desktop.png', fullPage: true });
  }
});

test('book-detail - tabs', async ({ page }) => {
  await page.goto('/book/dongeng-nusantara');
  await page.waitForSelector('[class*="book-cover"]', { timeout: 10000 }).catch(() => {});
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'tests/screenshots/book-detail-desktop.png', fullPage: true });
  
  const tabs = ['Deskripsi', 'Detail Buku', 'Ulasan'];
  for (const tab of tabs) {
    const tabButton = page.locator(`button:has-text("${tab}"), [role="tab"]:has-text("${tab}")`).first();
    if (await tabButton.isVisible().catch(() => false)) {
      await tabButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `tests/screenshots/book-detail-tab-${tab.toLowerCase()}.png`, fullPage: true });
    }
  }
});