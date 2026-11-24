# Bookstore E-commerce - Detailed Project Plan

## Final Decisions (Confirmed)

| Decision | Choice | Notes |
|----------|--------|-------|
| Database | **PostgreSQL 15+** | ACID, JSONB, full-text search |
| ORM | **Prisma 5.x** | Type-safe, migrations, Prisma Studio |
| Payment | **Xendit** | Invoice API, VA/E-Wallet/QRIS/Retail, sandbox ready |
| Auth | **JWT Stateless** | Access (15m) + Refresh (7d) in httpOnly cookies |
| Frontend | **Next.js 14+ (separate repo)** | API-only backend, SSR/SSG frontend |
| Animation & UX | **GSAP + Motion + Lenis** | Complex scroll timelines, micro-interactions, smooth scroll |
| File Upload | **Local dev / S3-compatible prod** | Cloudflare R2 for production |

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Runtime | Node.js 20+ (LTS) | Long-term support, modern JS features |
| Framework | Express 4.x | Minimal, mature, huge ecosystem |
| Language | TypeScript 5.x | Type safety, better DX, catches bugs early |
| Database | PostgreSQL 15+ | ACID, JSONB, full-text search, reliability |
| ORM | Prisma 5.x | Type-safe, migrations, great DX, Prisma Studio |
| Auth | JWT (access + refresh tokens) | Stateless, scalable, industry standard |
| Validation | Zod | Schema-first, TypeScript inference |
| Payment | Xendit | Indonesia market leader, VA/E-Wallet/QRIS, sandbox available |
| Email | Nodemailer + SMTP (SendGrid/Mailgun) | Reliable delivery, templates |
| Caching | Redis 7+ | Session, rate limiting, cart performance |
| Testing | Vitest + Supertest | Fast, Jest-compatible, TypeScript native |
| CI/CD | GitHub Actions | Free for public, integrated |
| Container | Docker + Docker Compose | Consistent dev/prod, easy deploy |
| Reverse Proxy | Nginx (production) | SSL termination, static files, rate limit |
| Process Manager | PM2 (VPS) / Native (PaaS) | Zero-downtime reload, monitoring |

---

## Frontend Integration (Next.js - Separate Repo)

This backend is **API-only**. Frontend will be a separate Next.js 14+ (App Router) repository.

### Repository Structure
```
bookstore-frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/login, register, forgot-password
│   │   ├── (shop)/books, categories, book/[slug]
│   │   ├── (dashboard)/account, orders, addresses
│   │   ├── (admin)/dashboard, books, orders, users
│   │   ├── api/auth/[...nextauth]  # NextAuth.js for session management
│   │   └── layout.tsx, page.tsx
│   ├── components/
│   ├── lib/           # API client, utils
│   ├── hooks/         # React Query hooks
│   ├── types/         # Shared types (generated from OpenAPI)
│   └── styles/
├── public/
└── package.json
```

### API Client Strategy
- **TanStack Query (React Query)** for server state
- **Axios** instance with interceptors for auth
- **OpenAPI TypeScript codegen** from backend spec → type-safe hooks
- **NextAuth.js** credentials provider → calls backend `/api/v1/auth/login`

### Auth Flow (Frontend + Backend)
1. User logs in on Next.js → calls backend `POST /api/v1/auth/login`
2. Backend sets `accessToken` (15m) + `refreshToken` (7d) as **httpOnly, Secure, SameSite=Strict cookies**
3. Frontend receives user data, stores in React Query cache
4. Subsequent requests: cookies sent automatically
5. Access token expiry → frontend calls `POST /api/v1/auth/refresh` (cookie-based)
6. Logout → `POST /api/v1/auth/logout` clears cookies

### CORS Configuration
```typescript
// Backend CORS - only allow frontend origin
const corsOptions = {
  origin: process.env.FRONTEND_URL, // e.g., "https://bookstore.com"
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

### Shared Types (Type Safety)
```bash
# Backend: generate OpenAPI spec
npm run openapi:generate  # → openapi.json

# Frontend: generate types & hooks
npx @hey-api/openapi-ts -i http://localhost:3000/api/v1/openapi.json -o src/lib/api
```

---

## Frontend Design System & UI/UX Specifications (Prompts 0 - 11)

### Animation & Interaction Architecture (GSAP + Motion + Lenis)
- **Lenis (`@studio-freight/lenis` / `lenis/react`)**: Global buttery-smooth scrolling. Synchronized with GSAP via `ScrollTrigger.update` and RAF ticker.
- **GSAP (`gsap` + `ScrollTrigger` + `Flip`)**: Powers the complex 3D Bookshelf perspective transformations, camera angle tilting (~15°), book spine sliding, and parallax scroll reveals.
- **Motion (`motion/react`)**: Handles component-level micro-interactions, spring physics, modal/drawer enter-exit transitions, and shared-element transitions (`layoutId`) when a book transitions from shelf spine to floating front cover.

```typescript
// Example: Lenis + GSAP ScrollTrigger Synchronization (Next.js Root Layout)
'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return <>{children}</>;
}
```

---

### Prompt 0: Design System
Design system for **"Bookstore"**, an Indonesian online bookstore (web, responsive, desktop-first 1440px + mobile 390px).

- **Style**: Editorial, warm, and human, like an independent bookshop's printed catalogue. NOT a generic SaaS or "AI-looking" template. Avoid purple gradients, glassmorphism, and identical card grids repeated everywhere. Vary layout structure between sections (asymmetric grids, large book covers overlapping the background, an occasional full-bleed band, pull quotes).
- **Colors**:
  - Primary: Cherry Red `#B3173B` (CTA, sale badges, active states)
  - Secondary: Deep Navy `#14213D` (headings, footer, admin sidebar)
  - Background: Warm Paper Cream `#FAF6EF`, Surface White `#FFFFFF`
  - Text: `#1B1B1F`, Muted text `#6B6B76`, Border `#E6DFD3`
  - Status: Success `#2E7D5B`, Warning `#D98E04`, Error `#C62828`, Info `#2F6DB5`
  - Wood tones for 3D bookshelf: `#8B5E3C` (shelf), `#6B4428` (shadow side), `#C99A6B` (highlight)
- **Typography**:
  - Headings: Serif with character (e.g. *Fraunces* or *Playfair Display*)
  - Body & UI: *Trebuchet MS* / Calibri-style humanist sans
  - Prices: Tabular figures (`font-variant-numeric: tabular-nums`)
- **Components**:
  - Rounded corners `8px`, soft paper-like shadows, thin 1px borders (`#E6DFD3`)
  - Book covers always shown at 2:3 ratio with subtle ambient drop-shadow
  - Primary button: Solid Cherry Red, Secondary: Navy outline
  - Visible focus states for accessibility
- **Language & Formatting**:
  - ALL UI text in Bahasa Indonesia
  - Currency format: `Rp 125.000`
  - Realistic Indonesian book data (e.g., *"Laskar Pelangi – Andrea Hirata"*, *"Bumi Manusia – Pramoedya Ananta Toer"*, *"Filosofi Teras – Henry Manampiring"*)
- **Mood**: Calm, trustworthy, bookish, with room for micro-interactions (hover lift on covers, smooth scroll feel).

---

### Prompt 1: Beranda dengan Hero Rak Buku 3D
Design the **HOME** page. The hero section is an interactive **3D BOOKSHELF** scene.

#### Hero Layout (Full viewport height under sticky header):
- Wooden bookshelf in slight 3/4 perspective (camera angled ~15° from the left), 3 shelves, warm lighting from top-left, soft shadows on cream wall.
- Books stand with SPINES facing viewer: varied heights, thicknesses (based on page count), spine colors (cherry, navy, mustard, forest green, cream) with vertical title & author text.
- Natural details: a few books leaning, small plant, bookends.
- Left side: Headline *"Pilih buku dari rak, baca sinopsisnya sebelum membawanya pulang"*, subtitle, hint with pointer icon *"Klik buku untuk melihat sinopsis"*.
- Small shelf labels per row: *"Fiksi"*, *"Non-Fiksi"*, *"Terlaris"*.
- Sticky header: Logo, search bar (*"Cari judul, penulis, atau ISBN"*), links Kategori / Terbaru / Terlaris, icons Akun & Keranjang (badge counter).

#### Interaction States (Powered by GSAP & Motion):
1. **IDLE**: Shelf standing in warm lighting.
2. **HOVER**: Chosen book slides out ~20px and tilts slightly with tooltip (title, author, rating). Neighboring books stay still.
3. **SELECTED**: Book is pulled out and rotates via 3D transform to show FRONT COVER, floating center-left with soft shadow. Other books dim to 40% opacity and blur (backdrop-filter).
4. **SYNOPSIS OPEN**: Paper-textured panel slides in from the right:
   - Title (serif), author, rating, category chip
   - Sinopsis paragraph (~5 lines, Indonesian)
   - Info row: Halaman, Penerbit, Tahun
   - Price `Rp 125.000`
   - Buttons: *"Lihat Detail"* (cherry) & *"Tambah ke Keranjang"* (navy outline)
   - Close "×" button

#### Home Page Sections (below hero):
- **Kategori Pilihan**: Asymmetric horizontal strip of category tiles (Fiksi, Non-Fiksi, Anak, Sastra, Bisnis, Pengembangan Diri).
- **Buku Terlaris**: Smooth horizontal scroll row of book cards (cover 2:3, title, author, rating stars, price, quick add).
- **Baru Terbit**: Editorial layout: 1 big featured hero book + grid of 4 smaller books.
- **Trust Banner**: Full-bleed navy band: *Pembayaran aman (QRIS, VA, e-wallet)*, *Pengiriman ke seluruh Indonesia*, *Stok selalu diperbarui*.
- **Footer**: Deep navy, category links, newsletter, payment method logos (BCA, Mandiri, BNI, BRI, OVO, DANA, ShopeePay, QRIS, Alfamart, Indomaret).
- **Mobile (390px)**: Shelf scrolls horizontally with touch gestures; tapping opens a bottom sheet with synopsis.

---

### Prompt 2: Katalog Buku dengan Toggle Grid / Rak 3D
Design the **BOOK CATALOG** page (`/books`) with view toggle: `[Grid] [Rak 3D]`.

- **Common Elements**:
  - Breadcrumb, page title with result counter (*"45 buku ditemukan"*).
  - Left filter sidebar: Kategori (nested tree), Rentang Harga (slider + inputs), Penulis, checkbox *"Stok tersedia"*, button *"Terapkan"*, link *"Reset filter"*.
  - Top bar: Active filter chips, sort dropdown (*Terbaru, Terpopuler, Harga Terendah, Harga Tertinggi*).

#### Views:
- **Frame A (Grid mode)**:
  - 12 book cards (4 columns desktop, 2 columns mobile): cover, title, author, rating, price, stock badge (*"Stok menipis"*, *"Habis"*), hover quick-add.
  - Pagination (page 1 of 4).
- **Frame B (Rak 3D mode)**:
  - Books displayed on wooden 3D shelves grouped by category plate (*Fiksi, Sastra, Bisnis*). Spine thickness reflects page count.
  - Filtered-out books hide smoothly; empty rows collapse with GSAP Flip.
  - Replaces pagination with button *"Muat rak berikutnya"*.
- **Frame C (Rak 3D Hover)**: Book slides out with floating tooltip.
- **Frame D (Rak 3D Selected)**: Book pulls out and rotates to cover; right drawer slides in with synopsis, price, stock, actions.
- **Frame E (Empty State)**: *"Tidak ada buku di rak ini"* with reset filter button.
- **Mobile**: Filter bottom sheet, 2-column grid default.

---

### Prompt 3: Detail Buku dengan Transisi dari Rak
Design the **BOOK DETAIL** page (`/book/[slug]`), built for **Motion shared-element layout transition** from the shelf.

- **Frame 1 (Transition Mid-Frame)**:
  - Book flies from shelf position to detail position, rotating in 3D (~25° Y-axis) with motion blur hint.
  - Shelf dims and blurs in background while detail content fades in.
- **Frame 2 (Final Frame)**:
  - Link *"← Kembali ke Rak"* (returns book to shelf via reverse transition).
  - Left column: Large book cover with subtle idle tilt, ambient drop-shadow, thumbnail gallery (3 extra images).
  - Right column: Large serif title, author link, rating & review count, category chip, price `Rp 125.000`, stock indicator, quantity stepper.
  - Actions: Primary *"Tambah ke Keranjang"*, Secondary *"Beli Sekarang"*.
  - Info Table: ISBN, Penerbit, Tahun Terbit, Jumlah Halaman, Berat (gram), Dimensi, Bahasa.
  - Tabbed Content: **Deskripsi** / **Detail Buku** / **Ulasan** (rating distribution bars + verified purchase review cards).
  - Section *"Buku Serupa"*: Mini single-shelf row of book spines.
  - Mobile: Sticky bottom add-to-cart bar.

---

### Prompt 4: Keranjang (Cart)
Design the **CART** page (`/cart`) — Fast, clean, focused (no 3D).

- **Left Column**: List of cart items:
  - Cover thumbnail, title, author, unit price, quantity stepper, subtotal, remove trash icon.
  - Stock warning badge on low stock items (*"Stok tersisa 3"*).
- **Right Column (Sticky Summary)**:
  - Subtotal, Estimasi Ongkir (*"Dihitung saat checkout"*), Diskon/Kupon, Total.
  - Primary button: *"Lanjut ke Checkout"*.
- **Guest Banner**: *"Masuk untuk menyimpan keranjangmu"* with Masuk / Daftar buttons.
- **Empty State**: Warm paper illustration of an empty shelf + CTA *"Mulai Belanja"*.

---

### Prompt 5: Checkout
Design the **CHECKOUT** page (`/checkout`) as a clean single-page flow with sticky summary.

1. **Alamat Pengiriman**:
   - Selectable address cards (*Rumah/Kantor*, recipient, phone, address, city, province, postal code, badge *"Utama"*).
   - Button *"Tambah Alamat Baru"* → modal with dropdowns: Provinsi, Kota/Kabupaten, Kecamatan, Kode Pos.
   - Pilihan Kurir & Layanan: JNE (REG/YES), SiCepat (GOKIL/SIUNTUNG), J&T (EZ) with live rates & estimated delivery days.
2. **Metode Pembayaran (Xendit Grouped Radio Cards)**:
   - E-Wallet (OVO, DANA, ShopeePay, LinkAja)
   - Virtual Account (BCA, Mandiri, BNI, BRI, Permata)
   - QRIS (GoPay, all banking apps)
   - Gerai Retail (Alfamart, Indomaret)
   - Kartu Kredit / Debit
3. **Catatan & Kupon**:
   - Textarea catatan penjual (*"Contoh: tolong bungkus sebagai kado"*).
   - Input kode kupon / voucher diskon + tombol *"Terapkan"*.
- **Right Sticky Summary**: Items list with covers, Subtotal, Ongkir, Diskon Kupon, Total Pembayaran, button *"Buat Pesanan"*.

---

### Prompt 6: Detail Pesanan & Status Pembayaran
Design the **ORDER DETAIL** page (`/orders/:id`) for PENDING & SHIPPED states.

- **Pending Variant**:
  - Header: Order number `ORD-20240115-ABC123`, badge *"Menunggu Pembayaran"* (warning yellow), countdown timer (e.g. `23:45:12`), button *"Bayar Sekarang"* (links to Xendit Invoice).
  - Horizontal timeline: `Dipesan` → `Dibayar` → `Diproses` → `Dikirim` → `Selesai`.
  - Ordered items list with cover, title, qty, price.
  - Cost breakdown card (Subtotal, Ongkir, Diskon, Total).
  - Shipping address card & selected payment method.
  - Button *"Batalkan Pesanan"* with reason modal.
- **Shipped Variant**:
  - Badge *"Dikirim"* (info blue), courier info (e.g. *JNE REG*), tracking number with copy button and shipping history logs.

---

### Prompt 7: Dashboard Akun & Daftar Pesanan
Design the **USER DASHBOARD** (`/account`, `/orders`, `/addresses`).

- **Left Navigation**: Profil, Pesanan Saya, Buku Favorit, Alamat Pengiriman, Keluar.
- **"Pesanan Saya" View**:
  - Status filter tabs: *Semua*, *Menunggu Pembayaran*, *Dibayar*, *Diproses*, *Dikirim*, *Selesai*, *Dibatalkan*.
  - Order cards: Order number, date, mini cover thumbnails, total price, status badge, button *"Lihat Detail"*.
  - Pagination & Empty state illustration if no orders exist.

---

### Prompt 8: Login / Daftar / Lupa Password
Design the **AUTH** pages with an editorial split layout.

- **Left Half**: Warm editorial illustration of a sunlit bookshelf with a pull quote: *"Buku adalah jendela dunia yang membawa Anda berkelana tanpa batas."*
- **Right Half**: Minimal form card on cream background:
  - **Login**: Email, password (show/hide toggle), link *"Lupa password?"*, button *"Masuk"*, link *"Belum punya akun? Daftar"*.
  - **Register**: Nama lengkap, email, password with strength indicator meter, confirm password, button *"Daftar"*.
  - **Forgot Password**: Email field, button *"Kirim Tautan Reset"*, and success card *"Tautan reset telah dikirim ke emailmu"*.
  - Inline validation error states styled in cherry red.

---

### Prompt 9: Dashboard Admin
Design the **ADMIN DASHBOARD** (`/admin/dashboard`). Professional, data-dense, calm, navy sidebar + cherry active indicators, cream canvas.

- **4 KPI Cards**: Total Pendapatan (`Rp 48.500.000`), Total Pesanan (`342`), Total Pengguna (`1.280`), Konversi (`3.8%`) with green/red trend percentage pills.
- **Sales Line Chart**: Interactive chart with toggles *Harian / Mingguan / Bulanan*.
- **Top Books & Categories**:
  - *"Buku Terlaris"* ranked list with covers and units sold.
  - *"Kategori Terlaris"* donut chart (Fiksi 42%, Non-Fiksi 28%, Bisnis 18%, etc.).
- **Pesanan Terbaru**: Compact table (Order ID, Customer, Total, Status badge, Timestamp, Action).
- **Stok Menipis Alert**: Warning panel for books with stock `< 5` + quick action *"Tambah Stok"*.

---

### Prompt 10: Admin Kelola Buku
Design the **ADMIN BOOKS** management page (`/admin/books`).

- **Toolbar**: Search, category filter dropdown, status filter (*Semua / Aktif / Nonaktif*), buttons *"Import CSV"*, *"Ekspor CSV"*, *"Tambah Buku"*.
- **Data Table**: Checkbox selection, cover thumbnail, judul, penulis, kategori chip, harga, stok (color-coded badge), status toggle switch, action menu.
- **Bulk Action Bar**: Appears on multi-selection (*Aktifkan*, *Nonaktifkan*, *Ubah Kategori*, *Hapus*).
- **Tambah / Edit Drawer & Form**:
  - Judul, slug (auto-generated), penulis, ISBN, deskripsi / sinopsis lengkap.
  - Harga, stok, berat (gram), dimensi, penerbit, tahun terbit, jumlah halaman.
  - Multi-image drag & drop uploader with main cover selector.
  - **Interactive Live Spine Preview Card**: Live-renders how the book's spine will appear on the 3D bookshelf (thickness based on pages, color picker, vertical text preview).

---

### Prompt 11: Admin Kelola Pesanan
Design the **ADMIN ORDERS** page & fulfillment drawer (`/admin/orders`).

- **Orders Table**: Filter by status, date range picker, customer search. Columns: Order ID, Customer, Items preview, Total, Payment status, Order status, Date, Action button.
- **Order Detail Drawer / View**:
  - Customer info, delivery address, ordered items list, payment verification details.
  - Status stepper action panel: Update status (*Diproses → Dikirim → Selesai*).
  - **Modal "Kirim Pesanan"**: Courier selector (*JNE, J&T, SiCepat, Anteraja*), input nomor resi pengiriman, button *"Konfirmasi Pengiriman"* (triggers email notification to customer).

---

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  EXPIRED
  REFUNDED
}

enum DiscountType {
  PERCENTAGE
  FIXED
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String
  role          Role      @default(USER)
  emailVerified Boolean   @default(false)
  avatar        String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  addresses     Address[]
  cart          Cart?
  orders        Order[]
  reviews       Review[]
  couponUsages  CouponUsage[]
  refreshTokens RefreshToken[]

  @@index([email])
}

model Address {
  id          String   @id @default(cuid())
  userId      String
  label       String   // "Home", "Office"
  recipient   String
  phone       String
  address     String
  province    String
  provinceId  String?  // RajaOngkir / Biteship province_id
  city        String
  cityId      String?  // RajaOngkir / Biteship city_id
  subdistrict String?  // Kecamatan
  subdistrictId String?// Kecamatan ID
  postalCode  String
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders      Order[]

  @@index([userId])
  @@index([cityId])
}

model Category {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  image       String?
  parentId    String?
  parent      Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  books       Book[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
  @@index([parentId])
}

model Book {
  id            String   @id @default(cuid())
  title         String
  slug          String   @unique
  author        String
  isbn          String?  @unique
  description   String?  @db.Text
  price         Int      // in IDR (Rupiah)
  stock         Int      @default(0)
  coverImage    String?
  images        String[] // additional gallery images
  publisher     String?
  publishedYear Int?
  pages         Int?
  weight        Int      @default(300) // in grams (crucial for shipping calculation)
  dimensions    String?  // "20x14x2 cm"
  language      String   @default("Indonesian")
  isActive      Boolean  @default(true)
  averageRating Float    @default(0)
  reviewCount   Int      @default(0)
  categoryId    String
  category      Category @relation(fields: [categoryId], references: [id])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  cartItems     CartItem[]
  orderItems    OrderItem[]
  reviews       Review[]

  @@index([slug])
  @@index([categoryId])
  @@index([isActive])
  @@index([averageRating])
  @@fulltext([title, author, description])
}

model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]
}

model CartItem {
  id        String @id @default(cuid())
  cartId    String
  bookId    String
  qty       Int    @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  cart      Cart   @relation(fields: [cartId], references: [id], onDelete: Cascade)
  book      Book   @relation(fields: [bookId], references: [id], onDelete: Cascade)

  @@unique([cartId, bookId])
  @@index([cartId])
}

model Order {
  id              String       @id @default(cuid())
  orderNumber     String       @unique // ORD-20240115-XXXX
  userId          String
  status          OrderStatus  @default(PENDING)
  subtotal        Int          // sum of items
  shippingCost    Int          @default(0)
  discount        Int          @default(0)
  total           Int          // subtotal + shipping - discount
  shippingAddress Json         // snapshot of address
  billingAddress  Json?
  notes           String?
  paidAt          DateTime?
  shippedAt       DateTime?
  deliveredAt     DateTime?
  cancelledAt     DateTime?
  cancelReason    String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  items           OrderItem[]
  payment         Payment?

  @@index([userId])
  @@index([status])
  @@index([orderNumber])
  @@index([createdAt])
}

model OrderItem {
  id        String @id @default(cuid())
  orderId   String
  bookId    String
  qty       Int
  price     Int    // price at time of order (in cents)
  bookTitle String // snapshot
  bookCover String // snapshot

  order     Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)
  book      Book   @relation(fields: [bookId], references: [id])

  @@index([orderId])
  @@index([bookId])
}

model Payment {
  id            String        @id @default(cuid())
  orderId       String        @unique
  provider      String        @default("xendit")
  providerRef   String        @unique // invoice_id from Xendit
  status        PaymentStatus @default(PENDING)
  amount        Int           // in cents (IDR)
  currency      String        @default("IDR")
  paymentMethod String?       // "EWALLET", "VA", "QRIS", "RETAIL_OUTLET", "CARD"
  paymentChannel String?      // "OVO", "DANA", "BCA", "MANDIRI", etc.
  paidAt        DateTime?
  expiredAt     DateTime?
  invoiceUrl    String?
  rawResponse   Json?         // full provider response
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  order         Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([providerRef])
  @@index([status])
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  revokedAt DateTime?

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
}
```

---

## API Specification (OpenAPI 3.0 Style)

### Auth Endpoints

#### POST `/api/v1/auth/register`
```json
// Request
{
  "email": "user@example.com",
  "password": "securePass123",
  "name": "John Doe"
}

// Response 201
{
  "success": true,
  "data": {
    "user": { "id": "cuid", "email": "user@example.com", "name": "John Doe", "role": "USER" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

#### POST `/api/v1/auth/login`
```json
// Request
{
  "email": "user@example.com",
  "password": "securePass123"
}

// Response 200
{
  "success": true,
  "data": {
    "user": { "id": "cuid", "email": "user@example.com", "name": "John Doe", "role": "USER" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

#### POST `/api/v1/auth/refresh`
```json
// Request (cookie or body)
{ "refreshToken": "eyJ..." }

// Response 200
{
  "success": true,
  "data": { "accessToken": "eyJ...", "refreshToken": "eyJ..." }
}
```

#### POST `/api/v1/auth/logout`
```json
// Request (requires auth)
{ "refreshToken": "eyJ..." }

// Response 200
{ "success": true, "message": "Logged out" }
```

#### GET `/api/v1/auth/me`
```json
// Response 200 (requires auth)
{
  "success": true,
  "data": {
    "id": "cuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "addresses": [...]
  }
}
```

### Book Endpoints

#### GET `/api/v1/books`
```
Query params:
- page=1
- limit=12
- search="harry potter"
- category="fiction"
- minPrice=50000
- maxPrice=200000
- author="J.K. Rowling"
- sortBy="price_asc|price_desc|newest|popular"
- inStock=true
```

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "cuid",
      "title": "Harry Potter 1",
      "slug": "harry-potter-1",
      "author": "J.K. Rowling",
      "price": 125000,
      "stock": 15,
      "coverImage": "/uploads/books/hp1.jpg",
      "category": { "id": "cuid", "name": "Fantasy", "slug": "fantasy" }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4
  }
}
```

#### GET `/api/v1/books/:slug`
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "cuid",
    "title": "Harry Potter 1",
    "slug": "harry-potter-1",
    "author": "J.K. Rowling",
    "isbn": "9780747532699",
    "description": "Full description...",
    "price": 125000,
    "stock": 15,
    "coverImage": "/uploads/books/hp1.jpg",
    "images": ["/uploads/books/hp1-1.jpg", "/uploads/books/hp1-2.jpg"],
    "publisher": "Bloomsbury",
    "publishedYear": 1997,
    "pages": 223,
    "weight": 300,
    "dimensions": "20x14x2 cm",
    "language": "Indonesian",
    "category": { "id": "cuid", "name": "Fantasy", "slug": "fantasy" }
  }
}
```

#### GET `/api/v1/categories`
```json
// Response 200
{
  "success": true,
  "data": [
    { "id": "cuid", "name": "Fiksi", "slug": "fiksi", "children": [...] },
    { "id": "cuid", "name": "Non-Fiksi", "slug": "non-fiksi", "children": [...] }
  ]
}
```

### Cart Endpoints (Require Auth)

#### GET `/api/v1/cart`
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "cuid",
    "items": [
      {
        "id": "cuid",
        "qty": 2,
        "book": {
          "id": "cuid",
          "title": "Harry Potter 1",
          "price": 125000,
          "coverImage": "/uploads/books/hp1.jpg",
          "stock": 15
        }
      }
    ],
    "summary": { "subtotal": 250000, "itemCount": 2 }
  }
}
```

#### POST `/api/v1/cart/items`
```json
// Request
{ "bookId": "cuid", "qty": 1 }

// Response 201
{ "success": true, "data": { "id": "cuid", "qty": 1, "book": {...} } }
```

#### PATCH `/api/v1/cart/items/:itemId`
```json
// Request
{ "qty": 3 }

// Response 200
{ "success": true, "data": { "id": "cuid", "qty": 3, "book": {...} } }
```

#### DELETE `/api/v1/cart/items/:itemId`
```json
// Response 200
{ "success": true, "message": "Item removed" }
```

#### POST `/api/v1/cart/merge` (Guest → User)
```json
// Request (after login)
{ "guestCartId": "cuid" }

// Response 200
{ "success": true, "data": { "items": [...], "summary": {...} } }
```

### Order Endpoints (Require Auth)

#### POST `/api/v1/orders` (Checkout)
```json
// Request
{
  "shippingAddressId": "cuid",
  "paymentMethod": "EWALLET", // or "VA", "QRIS", "RETAIL_OUTLET", "CARD"
  "paymentChannel": "OVO",   // required for EWALLET: OVO, DANA, SHOPEEPAY, LINKAJA
  "notes": "Please wrap as gift"
}

// Response 201
{
  "success": true,
  "data": {
    "order": {
      "id": "cuid",
      "orderNumber": "ORD-20240115-ABC123",
      "status": "PENDING",
      "total": 275000,
      "shippingCost": 25000,
      "items": [...]
    },
    "payment": {
      "invoiceUrl": "https://invoice.xendit.co/web/invc_xxxx",
      "invoiceId": "invc_xxxx",
      "expiresAt": "2024-01-16T10:25:00.000Z"
    }
  }
}
```

#### GET `/api/v1/orders`
```json
// Query: page, limit, status
// Response 200
{
  "success": true,
  "data": [...],
  "meta": { "page": 1, "limit": 10, "total": 5 }
}
```

#### GET `/api/v1/orders/:id`
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "cuid",
    "orderNumber": "ORD-20240115-ABC123",
    "status": "PAID",
    "subtotal": 250000,
    "shippingCost": 25000,
    "discount": 0,
    "total": 275000,
    "shippingAddress": { "recipient": "John", "phone": "0812...", "address": "...", "city": "Jakarta", "province": "DKI Jakarta", "postalCode": "12345" },
    "items": [
      { "id": "cuid", "qty": 2, "price": 125000, "bookTitle": "Harry Potter 1", "bookCover": "/uploads/books/hp1.jpg" }
    ],
    "payment": { "provider": "midtrans", "method": "gopay", "paidAt": "2024-01-15T10:30:00Z" },
    "createdAt": "2024-01-15T10:25:00Z"
  }
}
```

#### POST `/api/v1/orders/:id/cancel`
```json
// Request (only if PENDING)
{ "reason": "Changed mind" }

// Response 200
{ "success": true, "data": { "id": "cuid", "status": "CANCELLED", "cancelReason": "Changed mind" } }
```

### Admin Endpoints (Require ADMIN role)

#### Books Management
- `POST /api/v1/admin/books` - Create
- `GET /api/v1/admin/books` - List (with pagination, no public filters)
- `GET /api/v1/admin/books/:id` - Detail
- `PATCH /api/v1/admin/books/:id` - Update
- `DELETE /api/v1/admin/books/:id` - Soft delete (isActive=false)
- `POST /api/v1/admin/books/:id/images` - Upload images
- `DELETE /api/v1/admin/books/:id/images/:imageId` - Delete image

#### Categories Management
- `POST /api/v1/admin/categories`
- `GET /api/v1/admin/categories`
- `PATCH /api/v1/admin/categories/:id`
- `DELETE /api/v1/admin/categories/:id`

#### Orders Management
- `GET /api/v1/admin/orders` - All orders with filters (status, date range, user)
- `GET /api/v1/admin/orders/:id`
- `PATCH /api/v1/admin/orders/:id/status` - Update status (PROCESSING, SHIPPED, DELIVERED)
- `POST /api/v1/admin/orders/:id/ship` - Add tracking number

#### Users Management
- `GET /api/v1/admin/users` - List users
- `PATCH /api/v1/admin/users/:id/role` - Change role
- `PATCH /api/v1/admin/users/:id/status` - Activate/deactivate

#### Dashboard Stats
- `GET /api/v1/admin/stats/overview` - Revenue, orders, users, conversion
- `GET /api/v1/admin/stats/sales` - Daily/weekly/monthly sales
- `GET /api/v1/admin/stats/top-books` - Best sellers
- `GET /api/v1/admin/stats/top-categories`

### Webhook Endpoint

#### POST `/api/v1/webhook/xendit`
```json
// Xendit invoice notification payload (verified via callback token)
{
  "id": "invc_xxxx",
  "external_id": "ORD-20240115-ABC123",
  "status": "PAID",
  "amount": 275000,
  "payment_method": "EWALLET",
  "payment_channel": "OVO",
  "paid_at": "2024-01-15T10:30:00.000Z",
  ...
}

// Response 200
{ "success": true }
```

---

## API Documentation (OpenAPI 3.0 + Swagger UI)

### Implementation
- **Library**: `@asteasolutions/zod-to-openapi` + `swagger-ui-express`
- **Auto-generate** from Zod validators → single source of truth
- **Serve** at `/api/v1/docs` (Swagger UI) + `/api/v1/openapi.json` (spec)

### Setup
```typescript
// src/config/swagger.ts
import { OpenAPIHono } from '@hono/zod-openapi'; // or express-oas-generator
import { Scalar } from '@scalar/express-api-reference';

export function setupSwagger(app: Express) {
  // Generate spec from routes (using zod-to-openapi)
  // Serve Swagger UI at /api/v1/docs
  app.use('/api/v1/docs', Scalar.apiReference({
    url: '/api/v1/openapi.json',
    theme: 'kepler',
  }));
}
```

### Benefits
- ✅ **Type-safe**: Zod schemas → OpenAPI → TypeScript types (frontend)
- ✅ **Always in sync**: Code = Documentation
- ✅ **Interactive testing**: Swagger UI for manual API testing
- ✅ **Client generation**: `openapi-typescript-codegen` for frontend

### CI Integration
```yaml
# .github/workflows/docs.yml
- name: Generate OpenAPI Spec
  run: npm run openapi:generate  # outputs openapi.json

- name: Validate Spec
  run: npx @redocly/openapi-cli lint openapi.json

- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./swagger-static
```

---

## Middleware Stack (Order Matters)

```typescript
// src/middleware/index.ts
app.use(helmet());                    // Security headers
app.use(cors(corsOptions));           // CORS
app.use(compression());               // Gzip
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());              // For refresh token cookies
app.use(rateLimiter);                 // Global rate limit
app.use(requestLogger);               // Morgan + custom
app.use('/api', apiLimiter);          // Stricter API rate limit

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/cart', authMiddleware, cartRoutes);
app.use('/api/v1/orders', authMiddleware, orderRoutes);
app.use('/api/v1/admin', authMiddleware, requireRole('ADMIN'), adminRoutes);
app.post('/api/v1/webhook/xendit', rawBodyParser, xenditWebhook);

// Error handling (last)
app.use(notFoundHandler);
app.use(errorHandler);
```

### Custom Middleware Specs

| Middleware | File | Responsibility |
|------------|------|----------------|
| `authMiddleware` | `middleware/auth.ts` | Verify JWT, attach `req.user`, handle token expiry |
| `requireRole(...roles)` | `middleware/rbac.ts` | Check `req.user.role` against allowed roles |
| `validate(schema)` | `middleware/validate.ts` | Zod validation for body/query/params |
| `rateLimiter` | `middleware/rateLimit.ts` | Redis-based sliding window (100 req/15min global) |
| `apiLimiter` | `middleware/rateLimit.ts` | Stricter: 30 req/min for auth, 60 req/min for others |
| `rawBodyParser` | `middleware/rawBody.ts` | Preserve raw body for webhook signature verification |
| `errorHandler` | `middleware/errorHandler.ts` | Centralized error formatting, logging, Sentry integration |

---

## Error Handling Strategy

### Error Classes
```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,        // "VALIDATION_ERROR", "NOT_FOUND", "UNAUTHORIZED"
    message: string,
    public details?: any
  ) { super(message); }
}

export class ValidationError extends AppError { ... }
export class NotFoundError extends AppError { ... }
export class UnauthorizedError extends AppError { ... }
export class ForbiddenError extends AppError { ... }
export class ConflictError extends AppError { ... }
export class PaymentError extends AppError { ... }
```

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "password", "message": "Min 8 characters" }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/auth/register"
}
```

---

## Environment Variables

```bash
# .env.example
# App
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/bookstore?schema=public

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Xendit
XENDIT_SECRET_KEY=xnd_development_xxxx
XENDIT_PUBLIC_KEY=xnd_public_development_xxxx
XENDIT_WEBHOOK_TOKEN=your-webhook-token
XENDIT_IS_PRODUCTION=false

# Email (SendGrid example)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxx
EMAIL_FROM="Bookstore <noreply@bookstore.com>"

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp

# S3-Compatible Storage (Production - Cloudflare R2)
# S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
# S3_ACCESS_KEY_ID=your-access-key
# S3_SECRET_ACCESS_KEY=your-secret-key
# S3_BUCKET=bookstore-uploads
# S3_PUBLIC_URL=https://pub-xxxx.r2.dev

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
SENTRY_DSN=
```

---

## Testing Strategy

### Unit Tests (Vitest)
- Services: `authService`, `bookService`, `cartService`, `orderService`, `paymentService`
- Utils: `slugify`, `formatPrice`, `generateOrderNumber`, `validateXenditSignature`
- Target: **80%+ coverage** on services/utils

### Integration Tests (Supertest)
- Auth flow: register → login → refresh → logout
- Cart: add → update → delete → merge guest cart
- Checkout: create order → payment webhook → order status update
- Admin: CRUD books, update order status
- Target: **All happy paths + 1-2 edge cases per endpoint**

### E2E Tests (Playwright - optional, separate repo)
- Critical user journeys: browse → cart → checkout → payment success
- Admin dashboard: login → create book → verify on frontend

### Test Database
- Separate test DB (`bookstore_test`)
- Run migrations before test suite
- Cleanup with `TRUNCATE ... CASCADE` between test files

---

## Security Testing Strategy

### 1. SAST (Static Application Security Testing)

#### Tools & Integration
| Tool | Purpose | Integration |
|------|---------|-------------|
| **ESLint Security Plugins** | Detect insecure patterns in code | `npm run lint` + CI |
| **SonarCloud / SonarQube** | Code quality + security hotspots | PR decoration + Quality Gate |
| **Semgrep** | Custom security rules, OWASP Top 10 | CI pipeline, pre-commit |
| **TypeScript Strict Mode** | Catch type-related vulnerabilities | `tsconfig.json` |

#### ESLint Security Config
```json
// .eslintrc.json
{
  "plugins": ["security", "no-secrets"],
  "rules": {
    "security/detect-non-literal-regexp": "error",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-child-process": "error",
    "security/detect-disable-mustache-escape": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-non-literal-fs-filename": "error",
    "security/detect-non-literal-require": "error",
    "security/detect-possible-timing-attacks": "warn",
    "security/detect-pseudoRandomBytes": "error",
    "no-secrets/no-secrets": "error"
  }
}
```

#### Custom Semgrep Rules (`.semgrep.yml`)
```yaml
rules:
  - id: no-sql-injection-prisma
    pattern-either:
      - pattern: $X.$Y({ where: { ... } })  // Prisma safe
    pattern-not: $X.$Y({ where: { $FIELD: { equals: $USER_INPUT } } })
    message: "Potential SQL injection - use Prisma parameterized queries"
    languages: [typescript]
    severity: ERROR

  - id: no-hardcoded-secrets
    pattern-either:
      - pattern: $X = "sk_live_..."
      - pattern: $X = "xnd_live_..."
      - pattern: $X = "Bearer ..."
    message: "Hardcoded secret detected"
    languages: [typescript, javascript, yaml, json]
    severity: ERROR

  - id: insecure-random
    pattern: Math.random()
    message: "Use crypto.randomBytes() for security-sensitive randomness"
    languages: [typescript]
    severity: WARNING

  - id: jwt-none-alg
    pattern: jwt.verify($TOKEN, $SECRET, { algorithms: ["none"] })
    message: "JWT 'none' algorithm allowed - critical vulnerability"
    languages: [typescript]
    severity: ERROR

  - id: cors-wildcard
    pattern: cors({ origin: "*" })
    message: "CORS wildcard origin - restrict to specific domains"
    languages: [typescript]
    severity: ERROR
```

#### CI Integration (GitHub Actions)
```yaml
# .github/workflows/security-sast.yml
name: SAST Security Scan

on: [push, pull_request]

jobs:
  semgrep:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/secrets
            p/nodejs
            .semgrep.yml
          generateSarif: true
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: semgrep.sarif

  sonarqube:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@v2
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

---

### 2. DAST (Dynamic Application Security Testing)

#### Tools
| Tool | Purpose | When |
|------|---------|------|
| **OWASP ZAP** | Active/passive scanning, auth testing | Staging deploy, nightly |
| **Nuclei** | Template-based vulnerability scanning | CI + scheduled |
| **k6** | Load testing + security assertions | Performance + stress |

#### OWASP ZAP Baseline Scan
```yaml
# .github/workflows/security-dast.yml
name: DAST Security Scan

on:
  workflow_dispatch:
  schedule:
    - cron: '0 2 * * *'  # Nightly

jobs:
  zap-baseline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Start Application
        run: |
          docker compose -f docker-compose.staging.yml up -d
          sleep 30  # Wait for app readiness
      
      - name: ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.12.0
        with:
          target: 'https://staging.bookstore-api.com/api/v1'
          rules: |
            - 10096: WARN  # Server Leaks Version via 'Server' Header
            - 10017: FAIL  # X-Content-Type-Options Header Missing
            - 10019: FAIL  # X-Frame-Options Header Missing
            - 10038: FAIL  # Content Security Policy Missing
            - 40018: FAIL  # Cookie Without Secure Flag
            - 40019: FAIL  # Cookie Without HttpOnly Flag
            - 40020: FAIL  # Cookie Without SameSite Attribute
      
      - name: ZAP Full Scan (Authenticated)
        if: ${{ secrets.ZAP_AUTH_TOKEN != '' }}
        uses: zaproxy/action-full-scan@v0.12.0
        with:
          target: 'https://staging.bookstore-api.com/api/v1'
          token: ${{ secrets.ZAP_AUTH_TOKEN }}
      
      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: zap-report
          path: report.html
```

#### Nuclei Templates for API Security
```yaml
# nuclei-templates/api-security.yaml
id: api-broken-auth
info:
  name: Broken Authentication - JWT Algorithm Confusion
  author: security-team
  severity: critical
  tags: api, jwt, auth
requests:
  - method: POST
    path:
      - "{{BaseURL}}/api/v1/auth/refresh"
    headers:
      Content-Type: application/json
    body: '{"refreshToken": "eyJhbGciOiJub25lIn0.eyJzdWIiOiIxMjMifQ."}'
    matchers:
      - type: word
        words: ["success"]
        part: body
```

---

### 3. Dependency Scanning (SCA - Software Composition Analysis)

#### Tools
| Tool | Purpose | Integration |
|------|---------|-------------|
| **npm audit** | Built-in vulnerability scanning | `npm audit` + CI |
| **GitHub Dependabot** | Automated PRs for updates | `.github/dependabot.yml` |
| **Snyk** | Deep vulnerability database, license scanning | CI + PR checks |
| **OSV Scanner** | Open source vulnerability database | CI pipeline |

#### Dependabot Config
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 10
    labels: ["dependencies", "security"]
    groups:
      development-dependencies:
        patterns: ["*"]
        dependency-type: "development"
      production-dependencies:
        patterns: ["*"]
        dependency-type: "production"
    ignore:
      - dependency-name: "@types/*"
        versions: ["< 5.0.0"]  # Ignore major version bumps for types
```

#### CI Dependency Scan
```yaml
# .github/workflows/security-sca.yml
name: Dependency Security Scan

on: [push, pull_request]

jobs:
  npm-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm audit --audit-level=high --json > audit-report.json || true
      - name: Upload Audit Report
        uses: actions/upload-artifact@v4
        with:
          name: npm-audit
          path: audit-report.json
      - name: Fail on High/Critical
        run: |
          VULNS=$(cat audit-report.json | jq '.metadata.vulnerabilities.high + .metadata.vulnerabilities.critical')
          if [ "$VULNS" -gt 0 ]; then
            echo "Found $VULNS high/critical vulnerabilities"
            exit 1
          fi

  snyk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Snyk Test
        uses: snyk/actions/node@master
        with:
          command: test
          args: --severity-threshold=high --json > snyk-report.json
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      - name: Upload Snyk Report
        uses: actions/upload-artifact@v4
        with:
          name: snyk-report
          path: snyk-report.json
```

---

### 4. Container Security Scanning

#### Tools
| Tool | Purpose |
|------|---------|
| **Trivy** | Filesystem + container image scanning |
| **Hadolint** | Dockerfile best practices |
| **Docker Scout** | Base image vulnerabilities + SBOM |

#### Trivy Scan in CI
```yaml
# .github/workflows/security-container.yml
name: Container Security Scan

on:
  push:
    branches: [main]
    tags: ['v*']
  pull_request:

jobs:
  trivy-fs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy (Filesystem)
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-fs.sarif'
          severity: 'HIGH,CRITICAL'
      - name: Upload Trivy FS Results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: trivy-fs.sarif

  trivy-image:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && startsWith(github.ref, 'refs/tags/v')
    steps:
      - uses: actions/checkout@v4
      - name: Build Image
        run: docker build -t bookstore-api:${{ github.ref_name }} -f Dockerfile.prod .
      - name: Run Trivy (Image)
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'bookstore-api:${{ github.ref_name }}'
          format: 'sarif'
          output: 'trivy-image.sarif'
          severity: 'HIGH,CRITICAL'
      - name: Upload Trivy Image Results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: trivy-image.sarif

  hadolint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Hadolint Dockerfile
        uses: hadolint/hadolint-action@v3.1.0
        with:
          dockerfile: Dockerfile.prod
          failure-threshold: error
```

---

### 5. Secrets Detection

#### Tools
| Tool | Purpose |
|------|---------|
| **TruffleHog** | Git history + filesystem secrets scanning |
| **GitLeaks** | Pre-commit + CI secrets detection |
| **Gitleaks Pre-commit** | Prevent commits with secrets |

#### GitLeaks Config (`.gitleaks.toml`)
```toml
[allowlist]
description = "Allowlisted secrets"
paths = [
  "*.md",
  "*.txt",
  "*.example",
  ".env.example",
  "docker-compose*.yml"
]
regexes = [
  '''(?i)(password|passwd|pwd)\s*[:=]\s*["']?(?:example|changeme|your-password|xxx)["']?''',
]

[[rules]]
id = "xendit-secret-key"
description = "Xendit Secret Key"
regex = '''(?i)xnd_(development|production)_[a-zA-Z0-9]{32,}'''
tags = ["key", "xendit"]

[[rules]]
id = "jwt-secret"
description = "JWT Secret Key"
regex = '''(?i)jwt[_-]?(secret|key)\s*[:=]\s*["'][a-zA-Z0-9-_=]{32,}["']'''
tags = ["key", "jwt"]

[[rules]]
id = "database-url"
description = "Database Connection String"
regex = '''(?i)(postgres|mysql)://[^:]+:[^@]+@[^/]+/\w+'''
tags = ["credential", "database"]
```

#### CI Secrets Scan
```yaml
# .github/workflows/security-secrets.yml
name: Secrets Detection

on: [push, pull_request]

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for TruffleHog
      - name: Gitleaks
        uses: gitleaks/gitleaks-action@v2
        with:
          config: .gitleaks.toml
          args: --verbose --report-format json --report-path gitleaks-report.json
      - name: Upload Report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: gitleaks-report
          path: gitleaks-report.json

  trufflehog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: TruffleHog
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD
          extra_args: --json --fail
```

---

### 6. Security-Focused Unit/Integration Tests

#### Auth Security Tests
```typescript
// tests/security/auth.security.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/config/database';
import { hashPassword, generateTokens } from '../../src/utils/jwt';

describe('Auth Security Tests', () => {
  // Brute force protection
  it('should rate limit login attempts', async () => {
    const agent = request.agent(app);
    
    for (let i = 0; i < 6; i++) {
      await agent
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' });
    }
    
    const res = await agent
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    
    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  // JWT algorithm confusion
  it('should reject JWT with "none" algorithm', async () => {
    const maliciousToken = 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiJ9.';
    
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${maliciousToken}`);
    
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  // Token replay attack (refresh token rotation)
  it('should revoke refresh token after use (rotation)', async () => {
    const user = await createTestUser();
    const { refreshToken } = generateTokens(user);
    
    // First use - should succeed
    const res1 = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });
    expect(res1.status).toBe(200);
    
    // Second use - should fail (reused token)
    const res2 = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });
    expect(res2.status).toBe(401);
    expect(res2.body.error.code).toBe('TOKEN_REVOKED');
  });

  // Password hash timing attack resistance
  it('should use constant-time comparison for passwords', async () => {
    const user = await createTestUser({ password: 'correctPassword123' });
    
    // Time multiple wrong attempts
    const times: number[] = [];
    for (let i = 0; i < 10; i++) {
      const start = process.hrtime.bigint();
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: user.email, password: 'wrongPassword123' });
      times.push(Number(process.hrtime.bigint() - start));
    }
    
    // Variance should be minimal (within 50ms)
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / times.length;
    expect(Math.sqrt(variance)).toBeLessThan(50_000_000); // 50ms in nanoseconds
  });
});
```

#### Authorization Tests (RBAC)
```typescript
// tests/security/rbac.security.test.ts
describe('Authorization Security Tests', () => {
  it('should prevent horizontal privilege escalation', async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const order = await createOrder(user2.id);
    
    const token = await getAuthToken(user1);
    
    // User1 tries to access User2's order
    const res = await request(app)
      .get(`/api/v1/orders/${order.id}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should prevent vertical privilege escalation (USER → ADMIN)', async () => {
    const user = await createTestUser({ role: 'USER' });
    const token = await getAuthToken(user);
    
    const res = await request(app)
      .post('/api/v1/admin/books')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Hack Book', price: 10000, categoryId: 'xxx' });
    
    expect(res.status).toBe(403);
  });

  it('should prevent IDOR on cart items', async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const cartItem = await addToCart(user2, bookId);
    
    const token = await getAuthToken(user1);
    
    const res = await request(app)
      .patch(`/api/v1/cart/items/${cartItem.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ qty: 999 });
    
    expect(res.status).toBe(404); // Not found (not 403 - don't leak existence)
  });
});
```

#### Input Validation Security Tests
```typescript
// tests/security/validation.security.test.ts
describe('Input Validation Security Tests', () => {
  const xssPayloads = [
    '<script>alert(1)</script>',
    '"><script>alert(1)</script>',
    'javascript:alert(1)',
    '<img src=x onerror=alert(1)>',
    '<svg onload=alert(1)>',
  ];

  const sqlInjectionPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT * FROM users --",
  ];

  const nosqlInjectionPayloads = [
    { $ne: null },
    { $gt: "" },
    { $where: "this.password == this.password" },
  ];

  it.each(xssPayloads)('should sanitize XSS in book title: %s', async (payload) => {
    const token = await getAdminToken();
    
    const res = await request(app)
      .post('/api/v1/admin/books')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: payload, price: 10000, categoryId: validCategoryId });
    
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it.each(sqlInjectionPayloads)('should prevent SQL injection in search: %s', async (payload) => {
    const res = await request(app)
      .get(`/api/v1/books?search=${encodeURIComponent(payload)}`);
    
    // Should not crash, should return empty or sanitized results
    expect([200, 400]).toContain(res.status);
  });

  it('should validate file upload MIME type', async () => {
    const token = await getAdminToken();
    const fakeImage = Buffer.from('<?php system($_GET["cmd"]); ?>');
    
    const res = await request(app)
      .post('/api/v1/admin/books/book-id/images')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', fakeImage, 'shell.php');
    
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should enforce file size limit', async () => {
    const token = await getAdminToken();
    const largeFile = Buffer.alloc(10 * 1024 * 1024); // 10MB > 5MB limit
    
    const res = await request(app)
      .post('/api/v1/admin/books/book-id/images')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', largeFile, 'large.jpg');
    
    expect(res.status).toBe(413); // Payload Too Large
  });
});
```

#### Rate Limiting Tests
```typescript
// tests/security/ratelimit.security.test.ts
describe('Rate Limiting Security Tests', () => {
  it('should enforce global rate limit', async () => {
    const requests = Array(150).fill(null).map(() => 
      request(app).get('/api/v1/books')
    );
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);
    
    expect(rateLimited.length).toBeGreaterThan(0);
  });

  it('should enforce stricter auth rate limit', async () => {
    const requests = Array(10).fill(null).map(() => 
      request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' })
    );
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);
    
    expect(rateLimited.length).toBeGreaterThan(0);
  });

  it('should apply rate limit per IP', async () => {
    // Simulate different IPs using x-forwarded-for
    const ips = ['192.168.1.1', '192.168.1.2', '192.168.1.3'];
    
    for (const ip of ips) {
      const requests = Array(5).fill(null).map(() => 
        request(app)
          .get('/api/v1/books')
          .set('X-Forwarded-For', ip)
      );
      const responses = await Promise.all(requests);
      expect(responses.every(r => r.status === 200)).toBe(true);
    }
  });
});
```

#### Webhook Security Tests
```typescript
// tests/security/webhook.security.test.ts
describe('Xendit Webhook Security Tests', () => {
  it('should reject webhook without valid signature', async () => {
    const payload = { id: 'invc_test', external_id: 'ORD-123', status: 'PAID' };
    
    const res = await request(app)
      .post('/api/v1/webhook/xendit')
      .send(payload)
      .set('X-Callback-Token', 'invalid-token');
    
    expect(res.status).toBe(401);
  });

  it('should reject replayed webhook (idempotency)', async () => {
    const payload = { 
      id: 'invc_test', 
      external_id: 'ORD-123', 
      status: 'PAID',
      amount: 100000 
    };
    const token = generateXenditSignature(payload);
    
    // First request
    await request(app)
      .post('/api/v1/webhook/xendit')
      .send(payload)
      .set('X-Callback-Token', token);
    
    // Replay
    const res = await request(app)
      .post('/api/v1/webhook/xendit')
      .send(payload)
      .set('X-Callback-Token', token);
    
    expect(res.status).toBe(200); // Accepted but not processed twice
    // Verify order status only updated once
  });

  it('should validate webhook payload schema', async () => {
    const maliciousPayload = { 
      id: 'invc_test', 
      external_id: 'ORD-123', 
      status: 'PAID',
      amount: -100000,  // Negative amount
      payment_method: '<script>alert(1)</script>'
    };
    const token = generateXenditSignature(maliciousPayload);
    
    const res = await request(app)
      .post('/api/v1/webhook/xendit')
      .send(maliciousPayload)
      .set('X-Callback-Token', token);
    
    expect(res.status).toBe(400);
  });
});
```

---

### 7. Security Test Automation in CI

#### Combined Security Workflow
```yaml
# .github/workflows/security-all.yml
name: Comprehensive Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 3 * * 0'  # Weekly Sunday 3AM

jobs:
  sast:
    uses: ./.github/workflows/security-sast.yml
  
  sca:
    uses: ./.github/workflows/security-sca.yml
  
  secrets:
    uses: ./.github/workflows/security-secrets.yml
  
  container:
    uses: ./.github/workflows/security-container.yml
  
  unit-security-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: bookstore_test
        ports: ["5432:5432"]
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx prisma generate
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/bookstore_test
      - run: npm run test:security
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/bookstore_test
          REDIS_URL: redis://localhost:6379
          JWT_ACCESS_SECRET: test-secret
          JWT_REFRESH_SECRET: test-secret-refresh
          XENDIT_SECRET_KEY: xnd_development_test
          XENDIT_WEBHOOK_TOKEN: test-webhook-token

  dast:
    needs: [unit-security-tests]
    if: github.event_name == 'push' && github.ref == 'refs/heads/develop'
    uses: ./.github/workflows/security-dast.yml
    secrets: inherit

  security-gate:
    needs: [sast, sca, secrets, container, unit-security-tests]
    runs-on: ubuntu-latest
    steps:
      - name: Security Gate
        run: |
          echo "✅ All security checks passed"
          echo "📊 Reports available in workflow artifacts"
```

---

### 8. Security Test Coverage Requirements

| Category | Minimum Coverage | Tools |
|----------|------------------|-------|
| **Authentication** | 100% of auth endpoints | Unit + Integration |
| **Authorization (RBAC)** | All role combinations | Integration |
| **Input Validation** | All public endpoints + edge cases | Unit + Fuzzing |
| **Rate Limiting** | All tiers (global, auth, API) | Integration |
| **Webhook Security** | Signature, replay, schema | Unit + Integration |
| **File Upload** | MIME, size, path traversal | Unit |
| **Secrets Management** | No hardcoded secrets | SAST + Pre-commit |
| **Dependencies** | Zero high/critical vulns | SCA (weekly) |
| **Container** | Zero high/critical vulns | Trivy (per release) |
| **Headers** | CSP, HSTS, X-Frame, etc. | DAST (ZAP) |

---

### 9. Incident Response Runbook (Security)

```markdown
# docs/SECURITY_INCIDENT_RESPONSE.md

## Severity Levels
- **P0 (Critical)**: Active breach, data exfiltration, RCE
- **P1 (High)**: Auth bypass, SQLi, stored XSS
- **P2 (Medium)**: Reflected XSS, IDOR, info disclosure
- **P3 (Low)**: Missing headers, rate limit bypass

## Response Process
1. **Detect** → Alert (Sentry, ZAP, Dependabot, logs)
2. **Triage** → Assign severity, owner, timeline
3. **Contain** → WAF rules, disable endpoint, rotate secrets
4. **Eradicate** → Fix root cause, deploy patch
5. **Recover** → Verify fix, monitor, restore service
6. **Postmortem** → RCA, timeline, action items (blameless)

## Key Contacts
- Security Lead: @security-lead
- On-call: @on-call-engineer
- Infra: @devops-lead

## Emergency Commands
```bash
# Rotate JWT secrets immediately
kubectl create secret generic jwt-secrets \
  --from-literal=access=$(openssl rand -base64 32) \
  --from-literal=refresh=$(openssl rand -base64 32) \
  --dry-run=client -o yaml | kubectl apply -f -

# Revoke all refresh tokens
docker exec -it bookstore-db psql -U postgres -c \
  "UPDATE refresh_tokens SET revoked_at = NOW();"
```

---

### 10. Compliance Considerations (Indonesia)

| Regulation | Requirement | Implementation |
|------------|-------------|----------------|
| **PDP Law (UU PDP)** | Data minimization, consent, breach notification | Privacy policy, consent logs, 72hr breach notify |
| **Bank Indonesia** | Payment data localization | Xendit (local processor), no card storage |
| **Kominfo** | Electronic transaction certification | SSL/TLS, audit logs, data retention |
| **PCI DSS** (if storing cards) | Not applicable - Xendit handles card data | Tokenization, no PAN storage |

---

## Docker Configuration

### `docker-compose.yml` (Development)
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/bookstore
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run dev

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: bookstore
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  prisma-studio:
    image: node:20-alpine
    working_dir: /app
    command: npx prisma studio --port 5555 --hostname 0.0.0.0
    ports:
      - "5555:5555"
    volumes:
      - .:/app
    depends_on:
      - db

volumes:
  postgres_data:
  redis_data:
```

### `Dockerfile.dev`
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install deps for native modules
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

EXPOSE 3000
```

### `Dockerfile.prod`
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["node", "dist/app.js"]
```

---

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: bookstore_test
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
        options: --health-cmd "redis-cli ping" --health-interval 10s --health-timeout 5s --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/bookstore_test

      - name: Run Migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/bookstore_test

      - name: Run Linter
        run: npm run lint

      - name: Run Type Check
        run: npm run typecheck

      - name: Run Tests
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/bookstore_test
          REDIS_URL: redis://localhost:6379
          JWT_ACCESS_SECRET: test-secret
          JWT_REFRESH_SECRET: test-secret-refresh
          MIDTRANS_SERVER_KEY: test
          MIDTRANS_CLIENT_KEY: test

  build-and-push:
    needs: lint-and-test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: Dockerfile.prod
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/bookstore-api:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/bookstore
            docker compose -f docker-compose.prod.yml pull
            docker compose -f docker-compose.prod.yml up -d --remove-orphans
            docker image prune -f
```

---

## Development Workflow (Backend + Frontend Teams)

### Branching Strategy
```
main (protected) ← develop ← feature/* ← hotfix/*
```
- **main**: Production-ready, tagged releases
- **develop**: Integration branch, auto-deploy to staging
- **feature/**: Per feature/PR, merged to develop via PR

### API Contract First
1. **Backend** defines Zod schemas + OpenAPI spec
2. **Frontend** generates types/hooks from `openapi.json`
3. **Both** agree on contract before implementation
4. **Breaking changes** → version bump (`/api/v2/`) or coordinated deploy

### Local Development
```bash
# Backend (this repo)
docker compose up -d        # PostgreSQL + Redis
npm run dev                 # http://localhost:3000

# Frontend (separate repo)
npm run dev                 # http://localhost:3001
# .env.local: NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### Shared Tooling
| Tool | Purpose |
|------|---------|
| **pnpm workspaces** (optional) | Monorepo for shared types/utils |
| **Changesets** | Versioning + changelog for shared packages |
| **Storybook** (frontend) | Component documentation |
| **Postman/Insomnia** | API testing collection (auto-generated from OpenAPI) |

### Code Review Checklist
- [ ] OpenAPI spec updated for new/changed endpoints
- [ ] Zod validators match backend implementation
- [ ] Error responses follow standard format
- [ ] Pagination/filtering consistent across list endpoints
- [ ] Auth required? RBAC correct?
- [ ] Rate limiting appropriate?
- [ ] Tests added (unit + integration)

---

## Security Checklist

- [ ] Helmet.js configured (CSP, HSTS, X-Frame-Options, etc.)
- [ ] CORS restricted to `FRONTEND_URL` only
- [ ] Rate limiting on all endpoints (stricter on auth)
- [ ] JWT: short-lived access (15min), httpOnly secure cookies for refresh
- [ ] Passwords: bcrypt with 12+ rounds
- [ ] SQL injection: Prisma parameterized queries only
- [ ] XSS: Output encoding, validate/sanitize user input
- [ ] CSRF: SameSite=Strict cookies, double-submit cookie pattern for forms
- [ ] File upload: validate MIME, size, store outside webroot, serve via signed URLs
- [ ] Webhook: verify Xendit callback token before processing
- [ ] Secrets: never in code, use `.env` + Docker secrets / GitHub Secrets
- [ ] Dependency scanning: `npm audit`, Snyk/Dependabot alerts
- [ ] Logging: no PII/secrets in logs, structured JSON logs

---

## Performance Considerations

| Area | Strategy |
|------|----------|
| Database | Indexes on `slug`, `categoryId`, `userId`, `status`, `createdAt`; full-text search on books |
| Caching | Redis: user sessions, cart (TTL 7d), category tree, homepage featured books |
| Pagination | Cursor-based for infinite scroll, offset for admin tables |
| Images | WebP conversion, multiple sizes (thumb/medium/full), CDN (Cloudflare R2 + Cloudflare Images) |
| API | Response compression, ETag/If-None-Match for GET endpoints |
| Database | Connection pooling (Prisma: `connection_limit=10`), read replicas for analytics |
| Monitoring | Prometheus + Grafana (custom metrics: order conversion, cart abandonment) |

---

## Phase Breakdown (Detailed)

### Week 1: Foundation
- [ ] Initialize repo: TypeScript, ESLint (Airbnb), Prettier, Husky, lint-staged
- [ ] Docker setup (dev + prod), docker-compose
- [ ] Prisma schema + initial migration
- [ ] Express app structure, middleware stack
- [ ] Config module (Zod-validated env)
- [ ] Auth module:
  - [ ] Register (email unique, password hash, send verification email)
  - [ ] Login (JWT access + refresh, httpOnly cookies)
  - [ ] Refresh token rotation + reuse detection
  - [ ] Logout (revoke refresh token)
  - [ ] Get current user
  - [ ] Forgot/Reset password (token + email)
- [ ] Unit tests for auth service

### Week 2: Catalog
- [ ] Category CRUD (admin + public)
- [ ] Book CRUD (admin)
- [ ] Public book list: pagination, search, filter, sort
- [ ] Public book detail
- [ ] Full-text search (PostgreSQL `tsvector`)
- [ ] Image upload (local dev, S3-compatible prod)
- [ ] Slug generation + uniqueness
- [ ] Admin: bulk import/export (CSV)
- [ ] Integration tests for catalog endpoints

### Week 3: Cart
- [ ] Cart model + user relation
- [ ] Guest cart (cookie-based `guestCartId`)
- [ ] Add/update/remove items
- [ ] Stock validation (real-time check)
- [ ] Cart merge on login (guest → user)
- [ ] Cart persistence (Redis + DB sync)
- [ ] Cart summary (subtotal, count)
- [ ] Tests: concurrent updates, stock edge cases

### Week 4: Checkout & Payment
- [ ] Address management (CRUD, default)
- [ ] Shipping calculation (flat rate / by weight / by region)
- [ ] Checkout: create order (PENDING), lock stock, clear cart
- [ ] Xendit Invoice integration:
  - [ ] Create invoice request (amount, expiry, payment methods)
  - [ ] Return invoice URL + invoice ID + expiry
  - [ ] Handle payment methods: EWALLET (OVO/DANA/ShopeePay/LinkAja), VA (BCA/Mandiri/BNI/BRI), QRIS, RETAIL_OUTLET (Alfamart/Indomaret), CARD
- [ ] Webhook handler:
  - [ ] Verify callback token
  - [ ] Handle: PAID, PENDING, EXPIRED, FAILED, REFUNDED
  - [ ] Idempotency (process once per `external_id`)
  - [ ] Update order status, release/confirm stock
- [ ] Payment record + raw response storage
- [ ] Tests: webhook simulation, race conditions

### Week 5: Orders & Notifications
- [ ] Order list (user + admin)
- [ ] Order detail + timeline
- [ ] User: cancel order (if PENDING)
- [ ] Admin: update status (PROCESSING → SHIPPED → DELIVERED)
- [ ] Admin: add tracking number + courier
- [ ] Email notifications (Nodemailer + templates):
  - [ ] Order confirmation
  - [ ] Payment success/failed
  - [ ] Shipped (with tracking)
  - [ ] Delivered
  - [ ] Cancelled/Refunded
- [ ] Order number generator (ORD-YYYYMMDD-XXXX)
- [ ] Invoice PDF generation (optional, `pdfkit`)

### Week 6: Admin Dashboard API
- [ ] Stats overview: revenue, orders, users, conversion rate
- [ ] Sales chart data (daily/weekly/monthly)
- [ ] Top selling books / categories
- [ ] Recent orders table
- [ ] Low stock alerts
- [ ] User management (list, role toggle, ban)
- [ ] Book management (bulk actions: activate/deactivate, category assign)
- [ ] Export orders (CSV/Excel)

### Week 7: Testing & CI/CD
- [ ] Unit tests coverage ≥ 80%
- [ ] Integration tests all endpoints
- [ ] Load test (k6/artillery): 100 concurrent users
- [ ] GitHub Actions: lint, typecheck, test, build, deploy
- [ ] Docker multi-stage build optimization
- [ ] Dependency audit + update
- [ ] Documentation: API (OpenAPI/Swagger), README, deployment guide

### Week 8: Production Deploy
- [ ] Provision VPS (Ubuntu 22.04) / Railway / Render
- [ ] Domain + SSL (Let's Encrypt via Certbot/Nginx)
- [ ] Production `docker-compose.prod.yml` (app, db, redis, nginx)
- [ ] Nginx config: SSL, rate limit, static files, proxy
- [ ] PM2 for process management (if not PaaS)
- [ ] Backup strategy: daily DB dump to S3/R2
- [ ] Monitoring: UptimeRobot + Sentry + Logtail
- [ ] Load test production
- [ ] Go-live checklist
- [ ] Handover: credentials, docs, runbooks

---

## File Structure (Final)

```
bookstore-api/
├── .github/
│   └── workflows/
│       └── ci.yml
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── config/
│   │   ├── index.ts          # Zod-validated env
│   │   ├── database.ts       # Prisma client
│   │   ├── redis.ts          # Redis client
│   │   └── constants.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── bookController.ts
│   │   ├── categoryController.ts
│   │   ├── cartController.ts
│   │   ├── orderController.ts
│   │   ├── paymentController.ts
│   │   ├── adminController.ts
│   │   └── xenditWebhookController.ts
│   ├── middleware/
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── rbac.ts
│   │   ├── validate.ts
│   │   ├── rateLimit.ts
│   │   ├── rawBody.ts
│   │   └── errorHandler.ts
│   ├── models/               # (Prisma types imported directly)
│   ├── routes/
│   │   ├── index.ts
│   │   ├── authRoutes.ts
│   │   ├── bookRoutes.ts
│   │   ├── categoryRoutes.ts
│   │   ├── cartRoutes.ts
│   │   ├── orderRoutes.ts
│   │   ├── adminRoutes.ts
│   │   └── xenditWebhookRoutes.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── bookService.ts
│   │   ├── cartService.ts
│   │   ├── orderService.ts
│   │   ├── paymentService.ts
│   │   ├── emailService.ts
│   │   ├── uploadService.ts
│   │   └── statsService.ts
│   ├── utils/
│   │   ├── errors.ts
│   │   ├── jwt.ts
│   │   ├── slugify.ts
│   │   ├── formatPrice.ts
│   │   ├── generateOrderNumber.ts
│   │   ├── validateXenditSignature.ts
│   │   └── helpers.ts
│   ├── validators/
│   │   ├── authValidator.ts
│   │   ├── bookValidator.ts
│   │   ├── cartValidator.ts
│   │   ├── orderValidator.ts
│   │   └── adminValidator.ts
│   ├── types/
│   │   ├── express.d.ts      # Extend Request with user
│   │   └── xendit.d.ts
│   ├── app.ts                # Express setup
│   └── server.ts             # Entry point
├── tests/
│   ├── unit/
│   │   ├── authService.test.ts
│   │   ├── cartService.test.ts
│   │   └── ...
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── books.test.ts
│   │   ├── cart.test.ts
│   │   ├── orders.test.ts
│   │   └── admin.test.ts
│   ├── setup.ts              # Vitest global setup
│   └── helpers.ts
├── uploads/                  # Local dev uploads (gitignored)
├── Dockerfile.dev
├── Dockerfile.prod
├── docker-compose.yml
├── docker-compose.prod.yml
├── nginx.conf                # Production nginx config
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── tsconfig.json
├── package.json
├── vitest.config.ts
└── README.md
```

---

## Next Steps

1. **Confirm decisions** (6 items from previous message)
2. **Initialize project**:
   ```bash
   mkdir bookstore-api && cd bookstore-api
   npm init -y
   npm i -D typescript @types/node tsx vitest @vitest/coverage-v8 eslint prettier husky lint-staged
   npm i express zod jsonwebtoken bcryptjs cookie-parser helmet cors compression morgan ioredis @prisma/client xendit-node nodemailer pdfkit @asteasolutions/zod-to-openapi swagger-ui-express @scalar/express-api-reference
   npm i -D @types/express @types/jsonwebtoken @types/bcryptjs @types/cookie-parser @types/cors @types/compression @types/morgan @types/pdfkit @types/swagger-ui-express
   npx tsc --init
   npx prisma init
   ```
3. **Setup Docker + PostgreSQL + Redis**
4. **Implement Phase 1 (Week 1)**

---

Mau lanjut ke implementasi Phase 1? Atau ada yang mau diubah dari plan ini?